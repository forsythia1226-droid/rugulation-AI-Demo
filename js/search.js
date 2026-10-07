/* 임베딩 검색
 *
 * 조문 벡터와 어휘 벡터는 빌드 때 미리 계산해 js/embeddings.js 에 싣는다(약 0.8MB).
 * 브라우저는 임베딩 모델을 내려받지 않는다. 질문이 들어오면 질문에 들어 있는
 * 단어들의 벡터를 평균해 질문 벡터를 만들고, 조문 벡터와 코사인 유사도를 잰다.
 *
 * 어휘 검색(scored)과 합쳐 쓴다 — 글자가 겹치는 조문은 어휘 검색이, 표현이 다른
 * 조문은 임베딩이 잡는다. 둘 중 하나만 쓰는 것보다 정확하다.
 */

const EMB_W = 30;        /* 조문 점수에 더할 임베딩 가중치 */
const EMB_GW = 40;       /* 규정군 라우팅에 더할 임베딩 가중치 */
const EMB_GTOP = 5;      /* 규정군 점수 = 소속 조문 임베딩 점수 상위 N개 평균 */
const EMB_DW = 30;       /* 규정군 설명 벡터 가중치 (조문에 안 드러나는 규정의 성격을 보탠다) */
const EMB_MIN_HIT = 1;
const PREP_SIM = 0.93;   /* 준비 질문과 같은 뜻으로 볼 최소 유사도 — 골든셋으로 맞춘 값 */
const SCOPE_COVER = 0.62; /* 질문의 말 중 규정에서 쓰는 말의 비중이 이보다 낮으면 범위 밖 */
const SCOPE_LEX = 8;      /* 어휘 검색 점수가 이보다 낮으면 범위 밖 */   /* 질문에서 어휘 벡터를 찾은 단어가 이 개수 미만이면 임베딩을 쓰지 않는다 */

let EMB = null;
function embReady() {
  if (EMB !== null) return EMB;
  if (typeof EMB_ART_B64 === "undefined") return (EMB = false);
  const b2a = s => {
    if (typeof atob === "function") {
      const bin = atob(s), u = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      return u;
    }
    return new Uint8Array(Buffer.from(s, "base64"));
  };
  const art = b2a(EMB_ART_B64), term = b2a(EMB_TERM_B64);
  const idx = new Map();
  EMB_TERMS.forEach((t, i) => idx.set(t, i));
  const row = new Map();
  EMB_ARTS.forEach((id, i) => row.set(id, i));
  EMB = { dim: EMB_DIM, art, term, idx, row };
  return EMB;
}

/* 질문 → 벡터 (어휘 벡터 평균). 찾은 단어 수가 적으면 null 을 반환해 어휘 검색만 쓰게 한다. */
let embCover = 0;   /* 질문의 '내용어' 중 규정 코퍼스에 있는 말의 비중 (idf 가중) */
function embQueryVec(q) {
  const e = embReady();
  if (!e) return null;
  const ts = tokens(q), v = new Float32Array(e.dim);
  let hit = 0, wIn = 0, wAll = 0;
  const idf = typeof EMB_IDF !== "undefined" ? EMB_IDF : null;
  for (const t of ts) {
    const i = e.idx.get(t);
    /* 모르는 말은 질문의 핵심일 가능성이 크다 — 길수록 무겁게 센다 */
    if (i === undefined) { wAll += Math.min(3, 1 + (t.length - 1) * 0.5); continue; }
    hit++;
    const w = idf ? idf[i] : 1;
    wIn += w; wAll += w;
    const off = i * e.dim;
    for (let j = 0; j < e.dim; j++) v[j] += ((e.term[off + j] - 128) / 127) * w;
  }
  embCover = wAll ? wIn / wAll : 0;
  if (hit < EMB_MIN_HIT) return null;
  let n = 0;
  for (let j = 0; j < e.dim; j++) n += v[j] * v[j];
  n = Math.sqrt(n) || 1;
  for (let j = 0; j < e.dim; j++) v[j] /= n;
  return v;
}

/* 질문 하나에 대한 전체 조문의 임베딩 점수(0~1 정규화). 같은 질문은 한 번만 계산한다.
 * 규정군을 가로질러 비교해야 하므로 정규화는 전체 조문 기준으로 한다. */
let embCacheQ = null, embCacheV = null, embRawMax = 0;
function embScores(q) {
  if (embCacheQ === q) return embCacheV;
  const e = embReady(), v = embQueryVec(q);
  if (!e || !v) { embCacheQ = q; return (embCacheV = null); }
  const out = new Map();
  let lo = Infinity, hi = -Infinity;
  EMB_ARTS.forEach((id, i) => {
    const off = i * e.dim;
    let s = 0;
    for (let j = 0; j < e.dim; j++) s += v[j] * ((e.art[off + j] - 128) / 127);
    out.set(id, s);
    if (s < lo) lo = s;
    if (s > hi) hi = s;
  });
  const span = hi - lo || 1;
  out.forEach((s, id) => out.set(id, (s - lo) / span));
  embRawMax = hi;
  embCacheQ = q;
  return (embCacheV = out);
}

/* 어휘 점수에 더할 임베딩 가산점 */
function embBonus(q, id) {
  const m = embScores(q);
  return m ? EMB_W * (m.get(id) || 0) : 0;
}

/* 규정군 단위 임베딩 점수 (라우팅용).
 * 조문 하나의 점수로 규정을 고르면 특정 조문에 우연히 걸린 단어에 끌려간다.
 * 소속 조문 상위 몇 개의 평균을 써서 규정 전체가 질문과 맞는지 본다. */
let embGQ = null, embGV = null;
function embGroupScores(q) {
  if (embGQ === q) return embGV;
  const m = embScores(q);
  if (!m) { embGQ = q; return (embGV = null); }
  const byG = new Map();
  ORDER.forEach(k => {
    if (!D[k].loaded) return;
    const g = D[k].group;
    (D[k].chapters || []).forEach(ch => ch.arts.forEach(a => {
      const s = m.get(a.id);
      if (s === undefined) return;
      if (!byG.has(g)) byG.set(g, []);
      byG.get(g).push(s);
    }));
  });
  const out = new Map();
  byG.forEach((list, g) => {
    list.sort((x, y) => y - x);
    const take = list.slice(0, EMB_GTOP);
    out.set(g, take.reduce((s, x) => s + x, 0) / (take.length || 1));
  });
  embGQ = q;
  return (embGV = out);
}
/* 1순위(소관 규정)는 조문 근거로만 고른다 */
function embGroupBonus(q, g) {
  const m = embGroupScores(q);
  return m ? EMB_GW * (m.get(g) || 0) : 0;
}
/* 2순위(이어서 확인할 규정)는 규정의 성격까지 함께 본다.
 * 1순위에 섞으면 조문 근거가 약해져 오히려 1순위가 틀리므로 분리해 쓴다. */
function embDescBonus(q, g) {
  const d = embDescScores(q);
  return d ? EMB_DW * (d.get(g) || 0) : 0;
}

/* 규정군 설명 벡터 점수.
 * 조문만 보면 "출장비"라는 단어 때문에 출장규정으로 끌려가지만,
 * 위임전결규정의 설명("결재권한의 위임 범위와 금액별 전결권자를 정한다")은
 * "어디까지 결재받아야" 같은 질문의 의도와 직접 맞는다. */
let embDQ = null, embDV = null;
function embDescScores(q) {
  if (embDQ === q) return embDV;
  const e = embReady(), v = embQueryVec(q);
  if (!e || !v || typeof EMB_GROUP_B64 === "undefined") { embDQ = q; return (embDV = null); }
  if (!e.grp) {
    const bin = typeof atob === "function"
      ? (() => { const b = atob(EMB_GROUP_B64), u = new Uint8Array(b.length);
          for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; })()
      : new Uint8Array(Buffer.from(EMB_GROUP_B64, "base64"));
    e.grp = bin;
  }
  const out = new Map();
  let lo = Infinity, hi = -Infinity;
  EMB_GROUPS.forEach((g, i) => {
    const off = i * e.dim;
    let s = 0;
    for (let j = 0; j < e.dim; j++) s += v[j] * ((e.grp[off + j] - 128) / 127);
    out.set(g, s);
    if (s < lo) lo = s;
    if (s > hi) hi = s;
  });
  const span = hi - lo || 1;
  out.forEach((s, g) => out.set(g, (s - lo) / span));
  embDQ = q;
  return (embDV = out);
}

/* ---------- 준비 질문 의미 매칭 ----------
 * 글자가 달라도 뜻이 같으면 검증된 답변에 연결한다.
 * 준비 질문 벡터는 런타임과 같은 방식(어휘 평균)으로 만들어 두었다. */
let embPQ = null, embPV = null;
function nearestPrepared(q) {
  if (embPQ === q) return embPV;
  const e = embReady(), v = embQueryVec(q);
  if (!e || !v || typeof EMB_Q_B64 === "undefined") { embPQ = q; return (embPV = null); }
  if (!e.q) {
    e.q = typeof atob === "function"
      ? (() => { const b = atob(EMB_Q_B64), u = new Uint8Array(b.length);
          for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; })()
      : new Uint8Array(Buffer.from(EMB_Q_B64, "base64"));
  }
  let best = null, second = -1;
  for (let i = 0; i < EMB_QTEXT.length; i++) {
    const off = i * e.dim;
    let sim = 0;
    for (let j = 0; j < e.dim; j++) sim += v[j] * ((e.q[off + j] - 128) / 127);
    if (!best || sim > best.sim) { if (best) second = best.sim;
      best = { text: EMB_QTEXT[i], src: (typeof EMB_QSRC !== "undefined" ? EMB_QSRC[i] : EMB_QTEXT[i]), key: EMB_QKEY[i], sim }; }
    else if (sim > second) second = sim;
  }
  if (best) {
    best.margin = best.sim - (second < 0 ? 0 : second);
    /* 뜻만 비슷한 게 아니라 핵심어도 겹치는지 — 흔한 말은 idf 로 가볍게 센다 */
    const idf = typeof EMB_IDF !== "undefined" ? EMB_IDF : null;
    const w = t => { const i = e.idx.get(t); return i === undefined ? 1.5 : (idf ? idf[i] : 1); };
    const qt = tokens(q), mt = new Set(tokens(best.text));
    let shared = 0, total = 0;
    qt.forEach(t => { const x = w(t); total += x; if (mt.has(t)) shared += x; });
    best.share = total ? shared / total : 0;
  }
  embPQ = q;
  return (embPV = best);
}
/* 검색이 뽑은 후보 규정군 (라우팅과 범위 판정이 같은 기준을 쓴다) */
function candidateGroups(q, n = 3) {
  const gs = [...new Set(ORDER.filter(k => D[k].loaded).map(k => D[k].group))];
  return gs.map(g => ({ g, s: (scored(g, q)[0]?.s || 0) + embGroupBonus(q, g) }))
    .sort((a, b) => b.s - a.s).slice(0, n).map(x => x.g);
}

/* 같은 뜻으로 볼 만큼 가까운 준비 질문.
 * 뜻이 가깝다는 것만으로는 부족하다 — 그 준비 질문의 규정이 검색 후보 안에 있어야 인정한다.
 * 이 정합성 검사가 "퇴직금 중간정산" 같은 범위 밖 질문이 엉뚱한 준비 답변에 붙는 것을 막는다. */
function preparedMatch(q, cands) {
  const b = nearestPrepared(q);
  if (!b || b.sim < PREP_SIM) return null;
  const g = D[b.key] && D[b.key].group;
  if (!g) return null;
  const c = cands || candidateGroups(q);
  return c.includes(g) ? { ...b, group: g } : null;
}

/* ---------- 범위 밖 판정 ----------
 * 규정과 무관한 질문에 엉뚱한 조문을 들이대지 않기 위한 장치다. */
const INJECT_RE = /(이전|앞의|위의|모든)\s*(지시|명령|규칙|프롬프트)[^가-힣]{0,6}(무시|잊)|시스템\s*프롬프트|프롬프트를?\s*(출력|공개|보여|알려)|너의?\s*(지시문|규칙)을?\s*(출력|공개|알려)|ignore\s+(all\s+|the\s+)?(previous|prior|above)|system\s+prompt|reveal\s+your\s+(prompt|instructions)|jailbreak|developer\s+mode/i;

/* 질문이 규정 범위 안인지 — {inScope, why, prep, art, lex} */
function scopeCheck(q) {
  if (INJECT_RE.test(String(q))) return { inScope: false, why: "inject", prep: 0, cover: 0, lex: 0, share: 0 };
  const cands = candidateGroups(q);
  const m = preparedMatch(q, cands);             /* embQueryVec 을 거치며 embCover 가 채워진다 */
  const cover = embCover;
  let lex = 0;
  cands.forEach(g => { const t = scored(g, q)[0]; if (t && t.s > lex) lex = t.s; });
  /* 준비 질문과 뜻이 같거나, 질문의 말이 규정에서 쓰는 말이고 검색도 걸릴 때만 범위 안 */
  const inScope = !!m || (cover >= SCOPE_COVER && lex >= SCOPE_LEX);
  return { inScope, why: inScope ? "" : "weak", prep: m ? m.sim : 0, cover, lex, match: m };
}
