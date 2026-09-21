#!/usr/bin/env node
/* 인용 검증: js/demo-answers.js의 모든 quote가 해당 조문 본문의 정확한 부분 문자열인지 검사한다.
 * 운영 설계의 "인용 검증 계층"을 빌드 단계에서 재현한다. 하나라도 어긋나면 exit 1.
 * 실행: node scripts/verify-quotes.js
 */
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.join(__dirname,"..");
const src=f=>fs.readFileSync(path.join(root,f),"utf8");

const ctx={};
vm.runInNewContext(src("js/regulations.js")+"\n"+src("js/demo-answers.js")+"\n;this.out={D,DEMO_QA,demoNorm};",ctx);
const {D,DEMO_QA,demoNorm}=ctx.out;

const art={};
Object.keys(D).forEach(k=>(D[k].chapters||[]).forEach(c=>c.arts.forEach(a=>{art[a.id]={...a,docKey:k};})));

const errs=[];let n=0;
DEMO_QA.forEach(e=>{
 const tag=`[${e.key}] ${e.qs[0]}`;
 if(!D[e.key]||!D[e.key].loaded){errs.push(`${tag}: 적재되지 않은 규정 키 ${e.key}`);return;}
 const g=D[e.key].group;
 if(!e.cites.length)errs.push(`${tag}: 인용이 없습니다`);
 e.cites.forEach(([id,quote])=>{
  n++;
  const a=art[id];
  if(!a){errs.push(`${tag}: 존재하지 않는 조문 ${id}`);return;}
  if(D[a.docKey].group!==g)errs.push(`${tag}: 조문 ${id}은 이 창구(${g})의 규정이 아닙니다`);
  const body=a.body.filter(b=>b!=="TABLE");
  if(!body.some(b=>b.includes(quote)))errs.push(`${tag}: ${id} 본문과 불일치 → "${quote}"`);
 });
 (e.related||[]).forEach(k=>{if(!D[k]||!D[k].loaded||D[k].group===g)errs.push(`${tag}: related 키 ${k}가 유효하지 않습니다`);});
});

/* 중복 질문 검사 */
const seen={};
DEMO_QA.forEach(e=>e.qs.forEach(q=>{const k=demoNorm(q);if(seen[k])errs.push(`중복 질문: ${q}`);seen[k]=1;}));

/* 화면에 노출되는 질문(CHIPS·FAQ·starters)이 모두 준비되어 있는지 */
const app=src("js/app.js");
const grab=name=>{const m=app.match(new RegExp(`const ${name}=(\\[[\\s\\S]*?\\]\\]);`));return m?vm.runInNewContext(m[1]):[];};
const shown=[...grab("CHIPS").map(x=>x[1]),...grab("FAQ").map(x=>x[0]),...Object.values(D).flatMap(d=>d.starters||[])];
shown.forEach(q=>{if(!seen[demoNorm(q)])errs.push(`준비되지 않은 노출 질문: ${q}`);});

if(errs.length){console.error(`✗ 인용 검증 실패 (${errs.length}건)\n  `+errs.join("\n  "));process.exit(1);}
console.log(`✓ 인용 검증 통과: 답변 ${DEMO_QA.length}건 · 질문 ${Object.keys(seen).length}개 · 인용 ${n}건 · 노출 질문 ${shown.length}개 전부 대응`);
