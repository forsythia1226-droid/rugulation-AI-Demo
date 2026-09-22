/* 사내규정 개정 이력 (조문 단위 버전 관리)
 * - 버전 = {id, key, date(개정일), eff(시행일), type(제정|개정|폐지), reason, changes[], fileId?, fileName?, by}
 * - change = {art(조문ID), before, after}  문단 한 줄 단위. before 없음=신설, after 없음=삭제
 *            {art, newArt:true, after:"첫 문장"}                조문 전체 신설
 *            {art, table:true, before:[셀..], after:[셀..]}     표의 한 행 (첫 칸으로 행 식별)
 * - after 문장은 현행 조문과 정확히 일치해야 한다 (node scripts/verify-quotes.js 가 검사)
 * - 운영 전환 시 article_version 테이블로 옮긴다. 시연에서는 HISTORY(기본) + 관리자 등록분(localStorage)
 * - 기본 이력의 과거 조문은 시연용 가상 문장이다.
 */
const HISTORY=[
 {id:"h111-1",key:"TES-111",date:"2016.03.30",eff:"2016.03.30",type:"제정",reason:"직제규정 제정",changes:[]},
 {id:"h111-2",key:"TES-111",date:"2023.01.01",eff:"2023.01.01",type:"개정",reason:"직무대행 순위 명확화 및 사전 지정 허용",changes:[
  {art:"111-15",before:"② 팀장의 직무대행은 해당 팀 내 최상위 직위자로 한다.",after:"② 팀장의 직무대행은 해당 팀 내 최상위 직위자로 하며, 동일 직위자가 복수인 경우 해당 직위 재직기간이 긴 자로 한다."},
  {art:"111-15",before:null,after:"④ 직책자가 사전에 대행자를 지정한 경우 제2항 및 제3항에도 불구하고 그에 따른다."}]},
 {id:"h111-3",key:"TES-111",date:"2026.07.15",eff:"2026.08.01",type:"개정",reason:"중대재해처벌법 대응: 안전총괄대표 신설 및 업무 범위 규정",changes:[
  {art:"111-6",before:null,after:"② 중대재해 처벌 등에 관한 법률에 따른 안전보건 확보의무의 이행을 총괄하기 위하여 대표이사 직속으로 안전총괄대표를 둔다."},
  {art:"111-6",before:null,after:"③ 안전총괄대표는 안전보건 분야의 전문성을 갖춘 임원 중에서 이사회의 결의로 선임한다."},
  {art:"111-6",before:null,after:"④ 안전총괄대표의 업무 수행을 지원하기 위하여 안전보건 전담조직을 둔다."},
  {art:"111-12",newArt:true,after:"① 안전총괄대표는 다음 각 호의 업무를 수행한다."},
  {art:"111-B1",table:true,before:null,after:["안전총괄대표","안전보건 경영방침 수립, 위험성평가 이행 점검, 중대재해 대응 총괄"]},
  {art:"111-B1",table:true,before:["경영기획팀","경영계획 수립, 조직·직제 관리, 위임전결 운영"],after:["경영기획팀","경영계획 수립, 조직·직제 관리, 위임전결 운영, 중대재해처벌법 리스크 점검 지원"]}]},
 {id:"h105-1",key:"TES-105",date:"2014.07.01",eff:"2014.07.01",type:"제정",reason:"위임전결규정 제정",changes:[]},
 {id:"h105-2",key:"TES-105",date:"2016.12.30",eff:"2016.12.30",type:"개정",reason:"출장비 전결 한도 현실화 및 분할 기안 방지 강화",changes:[
  {art:"105-7",table:true,before:["국내출장비","100만원 이하","100만원 초과 500만원 이하","500만원 초과"],after:["국내출장비","200만원 이하","200만원 초과 1,000만원 이하","1,000만원 초과"]},
  {art:"105-12",before:null,after:"② 동일한 목적으로 3개월 이내에 반복 집행되는 건은 그 합계액을 기준으로 전결권자를 정한다."}]},
 {id:"h203-1",key:"TES-203",date:"2015.01.01",eff:"2015.01.01",type:"제정",reason:"복무규정 제정",changes:[]},
 {id:"h203-2",key:"TES-203",date:"2017.08.23",eff:"2017.08.23",type:"개정",reason:"재택근무 확대 및 야근 식대 한도 인상",changes:[
  {art:"203-13",before:"④ 재택근무는 주 1일을 한도로 하며 팀장의 사전 승인을 받아야 한다.",after:"④ 재택근무는 주 2일을 한도로 하며 팀장의 사전 승인을 받아야 한다."},
  {art:"203-14",before:"⑤ 시간외근무가 20시 이후까지 계속되는 경우 1인 1회 10,000원 한도로 식대를 실비 정산한다.",after:"⑤ 시간외근무가 20시 이후까지 계속되는 경우 1인 1회 15,000원 한도로 식대를 실비 정산하며, 정산은 익월 5영업일까지 경비정산 시스템으로 신청한다."}]}
];

/* ---- 저장 계층: 기본 이력 + 관리자 등록분 ---- */
const histStore={
 added(){return typeof ST!=="undefined"?ST.get("regVersions",[]):[];},
 removed(){return typeof ST!=="undefined"?ST.get("regVersionsDel",[]):[];},
 list(k){const del=new Set(histStore.removed());
  return [...HISTORY,...histStore.added()].filter(v=>v.key===k&&!del.has(v.id))
   .sort((a,b)=>b.date.localeCompare(a.date)||(b.at||"").localeCompare(a.at||""));},
 get(id){return [...HISTORY,...histStore.added()].find(v=>v.id===id);},
 add(v){const l=histStore.added();l.push(Object.assign({id:"v"+Date.now().toString(36),at:new Date().toISOString()},v));ST.set("regVersions",l);},
 remove(id){if(HISTORY.some(v=>v.id===id)){const d=histStore.removed();d.push(id);ST.set("regVersionsDel",d);}
  else ST.set("regVersions",histStore.added().filter(v=>v.id!==id));}
};
/* 조문별 가장 최근 변경 (③ 조문 옆 개정 표시용) */
function lastChangeOf(k,artId){
 for(const v of histStore.list(k)){if(v.type!=="제정"&&(v.changes||[]).some(c=>c.art===artId))return v;}
 return null;
}

/* ---- 문장 비교: 공통 앞뒤를 빼고 바뀐 가운데만 강조 ---- */
function diffPair(a,b){
 a=a||"";b=b||"";let i=0;while(i<a.length&&i<b.length&&a[i]===b[i])i++;
 let j=0;while(j<a.length-i&&j<b.length-i&&a[a.length-1-j]===b[b.length-1-j])j++;
 const mk=(s,cls)=>esc(s.slice(0,i))+(s.slice(i,s.length-j)?`<${cls}>${esc(s.slice(i,s.length-j))}</${cls}>`:"")+esc(s.slice(s.length-j));
 return [mk(a,"del"),mk(b,"ins")];
}
const cellsTxt=c=>c?c.join(" | "):"";

/* ---- 과거 시점 원문 복원: 현행에서 이후 개정을 역으로 되돌린다 ---- */
function pastDoc(k,vid){
 const d=D[k],vs=histStore.list(k),idx=vs.findIndex(v=>v.id===vid);
 const doc=JSON.parse(JSON.stringify(d));
 vs.slice(0,idx).forEach(v=>(v.changes||[]).forEach(c=>{
  for(const ch of doc.chapters||[]){
   const ai=ch.arts.findIndex(a=>a.id===c.art);if(ai<0)continue;
   const a=ch.arts[ai];
   if(c.newArt){ch.arts.splice(ai,1);return;}
   if(c.table){if(!a.table)return;
    const ri=a.table.rows.findIndex(r=>r[0]===(c.after||c.before)[0]);
    if(c.after&&ri>=0){if(c.before)a.table.rows[ri]=c.before.slice();else a.table.rows.splice(ri,1);}
    else if(!c.after&&c.before)a.table.rows.push(c.before.slice());
    return;}
   const li=c.after?a.body.indexOf(c.after):-1;
   if(li>=0){if(c.before)a.body[li]=c.before;else a.body.splice(li,1);}
   else if(!c.after&&c.before)a.body.push(c.before);
   return;}
 }));
 const v=vs[idx];
 return Object.assign(doc,{effective:v.eff});
}

/* ---- ① 규정 창구 '개정 이력' 탭 ---- */
const histUI={open:new Set()};
function histHTML(k){
 const d=D[k],vs=histStore.list(k);
 const artName=id=>{const a=arts(k).find(x=>x.id===id);return a?`${a.n}(${a.h})`:id;};
 if(!vs.length)return `<div class="doc-sheet hsheet"><h1 class="doc-title">개정 이력</h1><p class="doc-sub">${esc(d.no)} ${esc(short(d.name))}</p>
  <p class="empty">등록된 개정 이력이 없습니다. 현행본 시행일은 ${esc(d.effective)}입니다.<br>담당자가 관리자 페이지에서 개정 이력을 등록하면 이곳에 쌓입니다.</p></div>`;
 return `<div class="doc-sheet hsheet"><h1 class="doc-title">개정 이력</h1>
  <p class="doc-sub">${esc(d.no)} ${esc(short(d.name))} · 총 ${vs.length}회 · 현행 시행 ${esc(vs[0].eff||d.effective)}</p>
  <ol class="hv-list">${vs.map((v,i)=>{const o=histUI.open.has(v.id),n=(v.changes||[]).length;return `<li class="hv${i===0?" cur":""}" id="hv-${v.id}">
   <div class="hv-h"><span class="hv-date">${esc(v.date)}</span><span class="ctype ${v.type==="제정"?"new":v.type==="폐지"?"del":"mod"}">${esc(v.type)}</span>${i===0?'<span class="hv-cur">현행</span>':""}
    <span class="hv-r">${esc(v.reason||"")}</span></div>
   <p class="hv-m">시행 ${esc(v.eff||"-")}${n?` · 변경 조문 ${n}건`:""}${v.by?` · 등록 ${esc(v.by)}`:""}</p>
   <div class="hv-btns">${n?`<button data-hvd="${v.id}" aria-expanded="${o}">신구대비 ${o?"▴":"▾"}</button>`:""}
    ${i>0?`<button data-hvp="${v.id}">이 시점 원문 보기</button>`:""}
    ${v.fileId?`<button data-hvf="${v.fileId}">원본 파일 ↓ <small>${esc(v.fileName||"")}</small></button>`:`<span class="hv-nofile">원본 파일 미등록</span>`}</div>
   ${o&&n?`<table class="hv-t"><thead><tr><th>조문</th><th>개정 전</th><th>개정 후</th></tr></thead><tbody>${v.changes.map(c=>{
     const b=c.table?cellsTxt(c.before):c.before,a=c.table?cellsTxt(c.after):c.after;
     const[db,da]=b&&a?diffPair(b,a):[b?`<del>${esc(b)}</del>`:"",a?`<ins>${esc(a)}</ins>`:""];
     return `<tr><td>${esc(artName(c.art))}${c.table?"<small>표</small>":""}${c.newArt?"<small>조문 신설</small>":""}</td>
      <td>${b?db:'<span class="hv-none">(신설)</span>'}</td><td>${a?da:'<span class="hv-none">(삭제)</span>'}</td></tr>`;}).join("")}</tbody></table>`:""}
  </li>`;}).join("")}</ol></div>`;
}
function showHist(k,openId){
 state.docMode="hist";
 if(openId)histUI.open.add(openId);
 $("#docScroll").innerHTML=histHTML(k);$("#docScroll").scrollTop=0;
 syncDocTabs();bindHist(k);
 if(openId)setTimeout(()=>document.getElementById("hv-"+openId)?.scrollIntoView({behavior:"smooth",block:"start"}),30);
}
function showPast(k,vid){
 const v=histStore.get(vid);state.docMode="past";
 D.__past=pastDoc(k,vid);
 $("#docScroll").innerHTML=`<div class="pastbar">${IC.help}<span><b>효력 없음</b> · ${esc(v.eff)} 시행본 (${esc(v.type)})입니다. 업무에는 현행본을 적용하십시오.</span>
  <button data-back="${k}">현행본 보기</button><button data-hback="${k}">개정 이력으로</button></div>`+docHTML("__past");
 delete D.__past;
 $("#docScroll").scrollTop=0;syncDocTabs();
 $("#docScroll").querySelector("[data-back]").onclick=()=>switchDoc(k);
 $("#docScroll").querySelector("[data-hback]").onclick=()=>showHist(k);
}
function bindHist(k){
 const r=$("#docScroll");
 r.querySelectorAll("[data-hvd]").forEach(b=>b.onclick=()=>{const id=b.dataset.hvd;histUI.open.has(id)?histUI.open.delete(id):histUI.open.add(id);
  const y=r.scrollTop;r.innerHTML=histHTML(k);bindHist(k);r.scrollTop=y;});
 r.querySelectorAll("[data-hvp]").forEach(b=>b.onclick=()=>showPast(k,b.dataset.hvp));
 r.querySelectorAll("[data-hvf]").forEach(b=>b.onclick=async()=>{const f=await fileDB.get(b.dataset.hvf);if(!f){alert("파일을 찾을 수 없습니다.");return;}
  const a=document.createElement("a");a.href=URL.createObjectURL(f.blob);a.download=f.name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);});
}
function syncDocTabs(){
 $("#view").querySelectorAll("[data-tab]").forEach(b=>b.setAttribute("aria-current",state.docMode==="text"&&b.dataset.tab===state.doc));
 $("#histTab")?.setAttribute("aria-current",state.docMode!=="text");
 const h=$("#histTab small");if(h)h.textContent=`${histStore.list(state.doc).length}건`;
}

/* ---- ② 관리자 페이지: 개정 이력 등록 (현행 조문도 함께 갱신) ---- */
function applyRevision(k,changes,eff){
 const d=D[k];let touched=0;
 changes.forEach(c=>{const a=(d.chapters||[]).flatMap(ch=>ch.arts).find(x=>x.id===c.art);if(!a)return;
  const li=c.before?a.body.indexOf(c.before):-1;
  if(li>=0){if(c.after)a.body[li]=c.after;else a.body.splice(li,1);touched++;}
  else if(!c.before&&c.after){a.body.push(c.after);touched++;}});
 if(eff)d.effective=eff;
 return touched;
}
