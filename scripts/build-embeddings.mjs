/* 빌드 타임 임베딩 생성  —  실행: npm i @huggingface/transformers && node scripts/build-embeddings.mjs
 *
 * 규정 조문이 바뀌면 다시 돌려 js/embeddings.js 를 갱신한다.
 * 모델(약 120MB)은 이 스크립트를 돌리는 PC에만 받고, 배포본에는 벡터만 들어간다.
 * - 조문 110개 벡터
 * - 코퍼스 어휘 벡터 (런타임에 질문 벡터를 조립하는 데 쓴다 → 브라우저는 모델을 받지 않는다)
 * 결과: js/embeddings.js (int8 양자화 + base64)
 */
import { pipeline } from "@huggingface/transformers";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");

/* ---- 규정 데이터 로드 ---- */
const ctx = { console, document: { addEventListener() {} },
  localStorage: { getItem: () => null, setItem() {} },
  MutationObserver: function () { this.observe = () => {}; },
  NodeFilter: { SHOW_TEXT: 4 }, window: {} };
ctx.globalThis = ctx;
vm.createContext(ctx);
const SRC = ["js/i18n-data.js", "js/i18n-admin.js", "js/i18n-body.js", "js/i18n-body2.js",
  "js/i18n-body3.js", "js/i18n-body4.js", "js/i18n.js", "js/i18n-answers.js",
  "js/regulations.js", "js/demo-answers.js"];
vm.runInContext(SRC.map(read).join("\n;\n") + ";__D=D;__QA=DEMO_QA;__EN={DATA_EN,BODY_EN,EN_Q,EN_A};", ctx);
const D = ctx.__D, QA = ctx.__QA, EN = ctx.__EN;
const toEN = s => EN.DATA_EN[s] || EN.BODY_EN[s] || "";

/* ---- 조문 텍스트 구성 ---- */
const arts = [];
for (const k of Object.keys(D)) {
  if (!D[k].loaded) continue;
  for (const ch of D[k].chapters || []) {
    for (const a of ch.arts) {
      const tbl = a.table ? [a.table.head, ...a.table.rows].map(r => r.join(" ")).join(" ") : "";
      const ko = [D[k].no + " " + D[k].name, ch.t, a.n + "(" + a.h + ")",
        (a.tags || []).join(" "), a.body.filter(b => b !== "TABLE").join(" "), tbl, a.xref || ""]
        .filter(Boolean).join(" ");
      /* 영문 번역을 같은 벡터에 넣는다 — 영어로 물어도 이 조문에 걸리도록 */
      const en = [toEN(D[k].name), toEN(ch.t), toEN(a.h),
        a.body.filter(b => b !== "TABLE").map(toEN).join(" "), toEN(a.xref || "")]
        .filter(Boolean).join(" ");
      const text = en ? ko + " " + en : ko;
      arts.push({ id: a.id, group: D[k].group, text });
    }
  }
}
console.log("조문", arts.length + "개");

/* ---- 어휘 추출: app.js 의 tokens() 와 같은 규칙 ---- */
const PARTICLE = /(은|는|이|가|을|를|에|의|로|으로|와|과|도|만|까지|부터|나요|인가요|할까요|하나요|어떻게|어디)$/;
function tokens(q) {
  return String(q).toLowerCase().replace(/[^가-힣a-z0-9\s]/g, " ").split(/\s+/)
    .filter(t => t.length > 1).map(t => t.replace(PARTICLE, "")).filter(t => t.length > 1);
}
const vocab = new Map();
for (const a of arts) for (const t of tokens(a.text)) vocab.set(t, (vocab.get(t) || 0) + 1);
/* 질문에 쓰일 말도 어휘에 넣는다 — 준비 질문·추천 질문·사전의 영문 */
const extra = [];
QA.forEach(a => a.qs.forEach(q => { extra.push(q); const e = EN.EN_Q[q] || EN.DATA_EN[q]; if (e) extra.push(e); }));
Object.keys(D).forEach(k => (D[k].starters || []).forEach(x => { extra.push(x); const e = toEN(x); if (e) extra.push(e); }));
Object.values(EN.DATA_EN).forEach(v => typeof v === "string" && extra.push(v));
for (const t of tokens(extra.join(" "))) vocab.set(t, (vocab.get(t) || 0) + 1);
/* 1회만 등장하는 극단적 희귀어는 제외해 용량을 줄인다 */
const terms = [...vocab.entries()].filter(([t, n]) => n >= 2 || t.length >= 3).map(([t]) => t).sort();
/* 흔한 말일수록 질문에서 덜 중요하다.
 * 문서에는 조문뿐 아니라 질문 문장도 넣는다 — 그래야 "가능한가요" 같은 말투가
 * 조문에 안 나온다는 이유로 가장 중요한 말로 잘못 집계되지 않는다. */
const docs = [...arts.map(a => a.text), ...extra];
const df = new Map(terms.map(t => [t, 0]));
for (const d of docs) for (const t of new Set(tokens(d))) if (df.has(t)) df.set(t, df.get(t) + 1);
const IDF = terms.map(t => +(Math.log(1 + docs.length / Math.max(1, df.get(t)))).toFixed(3));
console.log("어휘", terms.length + "개 (전체 " + vocab.size + ")");

/* ---- 임베딩 ---- */
const ex = await pipeline("feature-extraction", "Xenova/multilingual-e5-small", { dtype: "q8" });
async function embedAll(list, prefix, label) {
  const out = [];
  const B = 32;
  for (let i = 0; i < list.length; i += B) {
    const batch = list.slice(i, i + B).map(x => prefix + x);
    const o = await ex(batch, { pooling: "mean", normalize: true });
    const dim = o.dims[1];
    for (let j = 0; j < batch.length; j++) out.push(Array.from(o.data.slice(j * dim, (j + 1) * dim)));
    process.stdout.write("\r  " + label + " " + Math.min(i + B, list.length) + "/" + list.length);
  }
  process.stdout.write("\n");
  return out;
}
/* ---- 규정군 설명 텍스트 ----
 * 규정명 + 한 줄 설명 + 추천 질문 + 주관부서 해석 지침.
 * 조문에 안 드러나는 "이 규정은 무엇에 답하는 규정인가"를 라우팅에 알려준다. */
const groups = [...new Set(Object.keys(D).filter(k => D[k].loaded).map(k => D[k].group))];
const descText = g => {
  const parts = [];
  Object.keys(D).filter(k => D[k].group === g && D[k].loaded).forEach(k => {
    parts.push(D[k].no + " " + D[k].name);
    if (D[k].blurb) parts.push(D[k].blurb);
    (D[k].starters || []).forEach(x => parts.push(x));
    if (D[k].ownerPrompt) parts.push(String(D[k].ownerPrompt).replace(/\[[^\]]*\]/g, " ").replace(/\s+/g, " "));
  });
  return parts.join(" ").slice(0, 1400);
};
console.log("규정군", groups.length + "개");

const artVec = await embedAll(arts.map(a => a.text.slice(0, 1200)), "passage: ", "조문");
const termVec = await embedAll(terms, "query: ", "어휘");
const grpVec = await embedAll(groups.map(descText), "passage: ", "규정군");

/* 준비 질문 벡터: 런타임이 질문을 만드는 방식(어휘 벡터 평균)과 똑같이 만든다.
 * 그래야 "표현만 바꾼 질문"과의 유사도가 공정하게 비교된다. */
const termIdx = new Map(terms.map((t, i) => [t, i]));
const DIM0 = termVec[0].length;
function bagVec(text) {
  const v = new Float64Array(DIM0);
  let hit = 0;
  for (const t of tokens(text)) {
    const i = termIdx.get(t);
    if (i === undefined) continue;
    hit++;
    const w = IDF[i];
    for (let j = 0; j < DIM0; j++) v[j] += termVec[i][j] * w;
  }
  if (!hit) return null;
  let n = 0; for (let j = 0; j < DIM0; j++) n += v[j] * v[j];
  n = Math.sqrt(n) || 1;
  return Array.from(v, x => x / n);
}
const qText = [], qKey = [], qSrc = [], qVec = [];
QA.forEach(a => a.qs.forEach(q => {
  /* 영문 질문도 같이 싣되, 답변을 찾을 때 쓸 원래 한국어 질문(qSrc)을 함께 둔다 */
  [q, EN.EN_Q[q] || EN.DATA_EN[q]].filter(Boolean).forEach(t => {
    const v = bagVec(t);
    if (v) { qText.push(t); qKey.push(a.key); qSrc.push(q); qVec.push(v); }
  });
}));
console.log("준비 질문 벡터 " + qVec.length + "개 (한/영)");

/* ---- int8 양자화 + base64 ---- */
const DIM = artVec[0].length;
function pack(vecs) {
  const buf = Buffer.alloc(vecs.length * DIM);
  vecs.forEach((v, i) => v.forEach((x, j) => {
    buf[i * DIM + j] = Math.max(0, Math.min(255, Math.round(x * 127 + 128)));
  }));
  return buf.toString("base64");
}

const js = `/* 빌드 타임 생성 파일 — 직접 수정하지 말 것 (scripts/build-embeddings.mjs 가 만든다)
 * multilingual-e5-small · ${DIM}차원 · int8 양자화
 * 조문 ${arts.length}개 · 어휘 ${terms.length}개 · 규정군 ${groups.length}개 · 준비질문 ${qVec.length}개 벡터.
 * 브라우저는 모델을 내려받지 않고, 어휘 벡터를 조합해 질문 벡터를 만든다. */
const EMB_DIM=${DIM};
const EMB_ARTS=${JSON.stringify(arts.map(a => a.id))};
const EMB_ART_B64="${pack(artVec)}";
const EMB_TERMS=${JSON.stringify(terms)};
const EMB_TERM_B64="${pack(termVec)}";
const EMB_GROUPS=${JSON.stringify(groups)};
const EMB_GROUP_B64="${pack(grpVec)}";
const EMB_IDF=${JSON.stringify(IDF)};
const EMB_QKEY=${JSON.stringify(qKey)};
const EMB_QTEXT=${JSON.stringify(qText)};
const EMB_QSRC=${JSON.stringify(qSrc)};
const EMB_Q_B64="${pack(qVec)}";
`;
fs.writeFileSync(path.join(ROOT, "js/embeddings.js"), js, "utf8");
console.log("js/embeddings.js  " + (js.length / 1024 / 1024).toFixed(2) + " MB");
