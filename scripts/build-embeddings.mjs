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

const ROOT = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");

/* ---- 규정 데이터 로드 ---- */
const ctx = { console };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(read("js/regulations.js") + ";__D=D;", ctx);
const D = ctx.__D;

/* ---- 조문 텍스트 구성 ---- */
const arts = [];
for (const k of Object.keys(D)) {
  if (!D[k].loaded) continue;
  for (const ch of D[k].chapters || []) {
    for (const a of ch.arts) {
      const tbl = a.table ? [a.table.head, ...a.table.rows].map(r => r.join(" ")).join(" ") : "";
      const text = [D[k].no + " " + D[k].name, ch.t, a.n + "(" + a.h + ")",
        (a.tags || []).join(" "), a.body.filter(b => b !== "TABLE").join(" "), tbl, a.xref || ""]
        .filter(Boolean).join(" ");
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
/* 1회만 등장하는 극단적 희귀어는 제외해 용량을 줄인다 */
const terms = [...vocab.entries()].filter(([t, n]) => n >= 2 || t.length >= 3).map(([t]) => t).sort();
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
const artVec = await embedAll(arts.map(a => a.text.slice(0, 1200)), "passage: ", "조문");
const termVec = await embedAll(terms, "query: ", "어휘");

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
 * 조문 ${arts.length}개 벡터 + 어휘 ${terms.length}개 벡터.
 * 브라우저는 모델을 내려받지 않고, 어휘 벡터를 조합해 질문 벡터를 만든다. */
const EMB_DIM=${DIM};
const EMB_ARTS=${JSON.stringify(arts.map(a => a.id))};
const EMB_ART_B64="${pack(artVec)}";
const EMB_TERMS=${JSON.stringify(terms)};
const EMB_TERM_B64="${pack(termVec)}";
`;
fs.writeFileSync(path.join(ROOT, "js/embeddings.js"), js, "utf8");
console.log("js/embeddings.js  " + (js.length / 1024 / 1024).toFixed(2) + " MB");
