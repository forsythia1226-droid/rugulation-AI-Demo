/* 검색 정확도 측정  —  실행: node scripts/eval-retrieval.js
 *
 * 준비 답변 43문항을 골든셋으로 쓴다. 검색 방식을 바꿀 때마다 이 수치를 비교한다.
 *   규정 라우팅   질문 → 올바른 규정군을 골랐는가
 *   인용 조문 순위 답변이 인용한 조문이 검색 상위에 왔는가
 */
const fs = require("fs"), vm = require("vm"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");

const ctx = {
  window: {}, document: { addEventListener() {} },
  localStorage: { getItem: () => null, setItem() {} },
  MutationObserver: function () { this.observe = () => {}; },
  NodeFilter: { SHOW_TEXT: 4 }, performance: { now: () => Date.now() }, console, Buffer
};
ctx.globalThis = ctx; vm.createContext(ctx);

const files = ["js/i18n-data.js", "js/i18n-admin.js", "js/i18n-body.js", "js/i18n-body2.js",
  "js/i18n-body3.js", "js/i18n-body4.js", "js/i18n.js", "js/i18n-answers.js",
  "js/regulations.js", "js/demo-answers.js", "js/embeddings.js"];
let src = files.map(read).join("\n;\n");

/* app.js 에서 검색 관련 함수 구간만 떼어 온다 (PROVIDERS 앞까지) */
const app = read("js/app.js");
const from = app.indexOf("function arts(k)");
const to = app.indexOf("const PROVIDERS=");
src += "\nvar ORDER=Object.keys(D);\nvar docsOf=function(g){return ORDER.filter(function(k){return D[k].group===g;});};\n";
src += app.slice(from, to);
src += ";" + read("js/search.js");
src += "\n;__out={D:D,QA:DEMO_QA,scored:scored,bestGroup:bestGroup,embReady:embReady};";
vm.runInContext(src, ctx, { filename: "retr" });
const o = ctx.__out;
console.log("임베딩 로드:", o.embReady() ? "사용" : "없음(어휘 검색만)");

let routeOK = 0, nQ = 0, top1 = 0, top3 = 0, nCite = 0;
const miss = [];
o.QA.forEach(a => {
  const want = o.D[a.key].group;
  a.qs.forEach(q => {
    nQ++;
    const got = o.bestGroup(q);
    const gotG = got && o.D[got] ? o.D[got].group : got;
    if (gotG === want) routeOK++;
    else miss.push({ q: q.slice(0, 32), want: o.D[want].no, got: got ? o.D[got].no : "-" });

    const ranked = o.scored(want, q).map(x => x.a.id);
    a.cites.forEach(c => {
      const id = Array.isArray(c) ? c[0] : c.id;
      nCite++;
      const i = ranked.indexOf(id);
      if (i === 0) top1++;
      if (i >= 0 && i < 3) top3++;
    });
  });
});

const pct = (x, n) => (x / n * 100).toFixed(0) + "%";
console.log("질문 " + nQ + "개 · 인용 " + nCite + "건 기준");
console.log("  규정 라우팅 정확도      " + routeOK + "/" + nQ + "  " + pct(routeOK, nQ));
console.log("  인용 조문이 검색 1위     " + top1 + "/" + nCite + "  " + pct(top1, nCite));
console.log("  인용 조문이 검색 3위 내   " + top3 + "/" + nCite + "  " + pct(top3, nCite));
if (miss.length) {
  console.log("\n라우팅이 틀린 질문:");
  miss.slice(0, 15).forEach(m => console.log("  " + m.want + " → " + m.got + "   \"" + m.q + "\""));
}
