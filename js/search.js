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
const EMB_MIN_HIT = 1;   /* 질문에서 어휘 벡터를 찾은 단어가 이 개수 미만이면 임베딩을 쓰지 않는다 */

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
function embQueryVec(q) {
  const e = embReady();
  if (!e) return null;
  const ts = tokens(q), v = new Float32Array(e.dim);
  let hit = 0;
  for (const t of ts) {
    const i = e.idx.get(t);
    if (i === undefined) continue;
    hit++;
    const off = i * e.dim;
    for (let j = 0; j < e.dim; j++) v[j] += (e.term[off + j] - 128) / 127;
  }
  if (hit < EMB_MIN_HIT) return null;
  let n = 0;
  for (let j = 0; j < e.dim; j++) n += v[j] * v[j];
  n = Math.sqrt(n) || 1;
  for (let j = 0; j < e.dim; j++) v[j] /= n;
  return v;
}

/* 질문 하나에 대한 전체 조문의 임베딩 점수(0~1 정규화). 같은 질문은 한 번만 계산한다.
 * 규정군을 가로질러 비교해야 하므로 정규화는 전체 조문 기준으로 한다. */
let embCacheQ = null, embCacheV = null;
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
