const LOGO_L="assets/taihan-ci.png";
const LOGO_D="assets/taihan-ci-dark.png";
let ORDER=Object.keys(D);
const docsOf=g=>ORDER.filter(k=>D[k].group===g);
const groupHead=g=>D[g]||D[docsOf(g)[0]];

/* ---------- icons (inline, lucide-style) ---------- */
const I=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IC={
 pclose:I('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/>'),
 popen:I('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/>'),
 home:I('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>'),
 search:I('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
 folder:I('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
 help:I('<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7"/><path d="M12 17h.01"/>'),
 bell:I('<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>'),
 user:I('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
 gear:I('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>'),
 usercog:I('<circle cx="9" cy="7" r="4"/><path d="M10 15H6a4 4 0 0 0-4 4v2"/><circle cx="18" cy="15" r="3"/><path d="m21.7 16.4-.9-.3M15.2 13.9l-.9-.3M16.6 18.7l.3-.9M19.1 12.2l.3-.9M19.6 18.7l-.4-1M16.8 12.3l-.4-1M14.3 16.6l1-.4M20.7 13.8l1-.4"/>'),
 book:I('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5V21h16"/>'),
 file:I('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>'),
 chat:I('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
 spark:I('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'),
 edit:I('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
 inbox:I('<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"/>'),
 logout:I('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>'),
 shield:I('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>'),
 down:I('<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>'),
 print:I('<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>'),
 list:I('<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>'),
 check:I('<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>')
};

const CAT_IC={
 "1":I('<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>'),
 "2":I('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>'),
 "3":I('<circle cx="12" cy="12" r="9"/><path d="M8 8l2 8 2-6 2 6 2-8M7 12h10"/>'),
 "4":I('<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>'),
 "5":I('<path d="M3 21V10l6 4V10l6 4V6l6 4v11z"/>'),
 "6":I('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'),
 "7":I('<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 12h11.5l2-8H6"/>'),
 "9":I('<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>')};

/* 하위 화면 공통 제목 영역: 제목 + 한 줄 설명 + 오른쪽 보조 정보 (모든 화면 같은 규격) */
const pageHead=(title,desc,right="")=>`<div class="ph page-h"><div><h2>${title}</h2><p>${desc}</p></div>${right?`<span class="cnt">${right}</span>`:""}</div>`;

/* ---------- static content ---------- */
const CHIPS=[
 ["#직제규정 안전총괄대표","직제규정에서 안전총괄대표는 어떤 역할과 권한을 가지나요?"],
 ["#국내출장비 38만원 전결권자","국내출장비 38만원은 누가 전결권자인가요?"],
 ["#팀장 부재 시 대결 기준","팀장이 부재중일 때 대결은 누가, 어떤 기준으로 하나요?"],
 ["#야근 식대 정산 한도","야근 식대는 얼마까지 정산할 수 있나요?"]];
const FAQ=[
 ["배우자 부친상인데 며칠 쉬고 경조금은 얼마인가요?","TES-203"],
 ["팀장 부재 시 급한 품의는 누가 결재하나요?","TES-105"],
 ["업무에 ChatGPT 같은 생성형 AI를 써도 되나요?","TES-212"],
 ["경력직인데 수습기간이 적용되나요?","TES-201"],
 ["재택근무는 주 며칠까지 가능한가요?","TES-203"],
 ["육아휴직 중인데 자녀 학자금 신청할 수 있나요?","TES-201-1B"],
 ["해외출장 전에 반드시 해야 하는 게 있나요?","TES-216"],
 ["경력직으로 입사했는데 받아야 할 교육이 뭔가요?","TES-208"],
 ["설계도면을 협력사에 메일로 보내려면 어떻게 하나요?","TES-212"],
 ["직위와 직책은 어떻게 다른가요?","TES-111"]];
const NOTICES=[
 {title:"직제 규정 개정 안내",owner:"경영기획팀",date:"'26.08.01 부",items:[
  {ref:"제2장 제6조 2항",text:"안전총괄대표 추가 (중대재해처벌법 대응)",doc:"TES-111",art:"111-6",quote:"중대재해 처벌 등에 관한 법률에 따른 안전보건 확보의무의 이행을 총괄하기 위하여 대표이사 직속으로 안전총괄대표를 둔다."},
  {ref:"제4장 제12조 1항",text:"안전총괄대표 업무수행 범위 구체화",doc:"TES-111",art:"111-12",quote:"안전총괄대표는 다음 각 호의 업무를 수행한다."},
  {ref:"별표1 업무분장",text:"중대재해처벌법 리스크 점검 및 보안관리 규정 개정",doc:"TES-111",art:"111-B1",quote:""}]},
 {title:"보안 규정 체계 개편 안내",owner:"IT혁신팀",date:"'26.08.03 부",items:[
  {ref:"TES-220 ~ 224",text:"보안관리규정 등 보안 규정 5건 제정",doc:"TES-220"},
  {ref:"TES-212-1 · 212-2",text:"네트워크 · 정보시스템 보안지침 제정",doc:"TES-212-2"},
  {ref:"TES-212-2 제8조",text:"생성형 AI 서비스 이용 기준 신설",doc:"TES-212-2",art:"2122-8",quote:"임직원은 회사가 승인한 생성형 AI 도구에 한하여 업무에 이용할 수 있다."}]}];
const NAV=[
 {g:"대시보드",items:[["home","홈",IC.home]]},
 {g:"규정 탐색",items:[["cats","카테고리별 규정",IC.folder],["faq","자주 찾는 질문",IC.help],["notice","최근 개정 공지",IC.bell]]},
 {g:"나의 업무",items:[["myreq","규정 문의",IC.chat],["manage","관리자 페이지",IC.usercog]]}];
const allNotices=()=>[...noticeStore.list(),...NOTICES];

/* ---------- state & utils ---------- */
const state={docMode:"text",view:"home",cat:"1",group:null,doc:null,turns:[],busy:false,collapsed:window.innerWidth<900};
let SAMPLE=null,TRIED=false;
const ready=window.claude?.use?.("sample");
const readyP=ready&&ready.then?ready.then(s=>{SAMPLE=s;}).catch(()=>{}).finally(()=>{TRIED=true;renderHeader();syncAvail();}):Promise.resolve();
if(!(ready&&ready.then))TRIED=true;
const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch{return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}};
const ownerPrompt=k=>LS.get("rp:"+k,D[k].ownerPrompt||"");
const qlog=()=>LS.get("qlog",[]);
const pushLog=e=>{const l=qlog();l.unshift(e);LS.set("qlog",l.slice(0,40));};
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const $=s=>document.querySelector(s);
const short=n=>n.split("_").pop();

/* ---------- retrieval ---------- */
function arts(k){const o=[];(D[k].chapters||[]).forEach(c=>c.arts.forEach(a=>o.push({...a,chapter:c.t,docKey:k})));return o;}
function groupArts(g){return docsOf(g).filter(k=>D[k].loaded).flatMap(arts);}
function tokens(q){return q.toLowerCase().replace(/[^가-힣a-z0-9\s]/g," ").split(/\s+/).filter(t=>t.length>1)
 .map(t=>t.replace(/(은|는|이|가|을|를|에|의|로|으로|와|과|도|만|까지|부터|나요|인가요|할까요|하나요|어떻게|어디)$/,"")).filter(t=>t.length>1);}
function scored(g,q){
 const ts=tokens(q);
 return groupArts(g).map(a=>{
  const hay=(a.h+" "+a.tags.join(" ")+" "+a.body.join(" ")+" "+(a.table?JSON.stringify(a.table):"")).toLowerCase();
  let s=0;ts.forEach(t=>{
   if(a.tags.some(x=>x.toLowerCase().includes(t)))s+=6;
   if(a.h.toLowerCase().includes(t))s+=4;
   let i=-1,c=0;while((i=hay.indexOf(t,i+1))>-1)c++;s+=Math.min(c,4)*1.5;});
  return{a,s};}).filter(x=>x.s>0).sort((x,y)=>y.s-x.s);
}
function retrieve(g,q,n=7){
 const all=groupArts(g),top=scored(g,q).slice(0,n).map(x=>x.a);
 if(top.length<2)all.slice(0,3).forEach(a=>{if(!top.includes(a))top.push(a);});
 return top;
}
function artText(a){
 let t=`[${a.id}] ${D[a.docKey].no} ${D[a.docKey].name} ${a.n}(${a.h})\n`+a.body.filter(b=>b!=="TABLE").join("\n");
 if(a.table)t+="\n"+a.table.head.join(" | ")+"\n"+a.table.rows.map(r=>r.join(" | ")).join("\n");
 if(a.xref)t+="\n(연계: "+a.xref+")";
 return t;
}

/* ---------- AI provider ----------
 * live: 아티팩트 런타임(window.claude)의 LLM
 * demo: window.claude가 없을 때 사전 작성 답변(js/demo-answers.js) */
const useGemini=()=>settings.get().aiMode==="gemini"&&geminiReady();
const useLive=()=>!!SAMPLE&&settings.get().aiMode==="live";
const aiMode=()=>useGemini()?"gemini":useLive()?"live":(TRIED||settings.get().aiMode!=="live")?"demo":"checking";
const demoDelay=()=>new Promise(r=>setTimeout(r,600+Math.random()*300));
function bestLine(a,q){
 const ts=tokens(q),ls=a.body.filter(b=>b!=="TABLE");
 const hit=l=>ts.filter(t=>l.toLowerCase().includes(t)).length;
 const l=ls.reduce((m,x)=>hit(x)>hit(m)?x:m,ls[0]||"");
 return l.replace(/^[①-⑳]\s*/,"");
}
function bestGroup(q){
 const gs=[...new Set(ORDER.filter(k=>D[k].loaded).map(k=>D[k].group))];
 let best=null,top=0;
 gs.forEach(g=>{const s=scored(g,q)[0]?.s||0;if(s>top){top=s;best=g;}});
 return best&&(D[best]?.loaded?best:docsOf(best).find(k=>D[k].loaded));
}
const PROVIDERS={
 live:{
  async route(q,list){
   const r=await SAMPLE.json(`사내 규정 중 아래 질문이 어느 규정 소관인지 고르세요.\n\n${list}\n\n질문: ${q}\n\nJSON만 출력: {"key":"위 목록의 키","reason":"한 문장"}`,{modelTier:"quick"});
   return r.key;},
  answer:(g,q,turns)=>SAMPLE.json(turns,{cache:false})},
 /* Gemini 실시간 응답. 실패하면 준비된 답변(demo)으로 자동 전환한다 */
 gemini:{
  async route(q){return DEMO_ROUTES[demoNorm(q)]||bestGroup(q);},
  async answer(g,q,turns){
   const head=groupHead(g);
   try{
    const corpus=retrieve(g,q).map(artText).join("\n\n---\n\n");
    const guide=docsOf(g).filter(k=>D[k].loaded).map(ownerPrompt).filter(Boolean).join("\n\n");
    const text=await geminiGenerate(geminiSystemPrompt(head,corpus,guide),q,state.turns.slice(-4));
    const refused=text.replace(/\s/g,"").includes(GEMINI_REFUSAL.replace(/\s/g,""));
    return{answer:text,markdown:true,source:"gemini",
     citations:refused?[]:citationsFromText(g,text),related:[],needsOwner:false,ownerQuestion:""};
   }catch(e){
    console.warn("Gemini 호출 실패 → 준비된 답변으로 전환:",e);
    const fb=await PROVIDERS.demo.answer(g,q,turns);
    return{...fb,fallback:String(e&&e.message||e)};
   }}},
 demo:{
  async route(q){await demoDelay();return DEMO_ROUTES[demoNorm(q)]||bestGroup(q);},
  async answer(g,q){
   await demoDelay();
   const oa=ownerAnswers.get(q);
   if(oa&&D[oa.key]&&D[oa.key].group===g)return{answer:oa.answer,citations:oa.citations||[],related:[],needsOwner:false,ownerQuestion:"",fromOwner:oa.by};
   const hit=DEMO_ANSWERS[demoNorm(q)];
   if(hit&&D[hit.key].group===g){
    /* 실행 시 인용 검증: 준비된 답변의 근거 문장이 현행 조문에 그대로 있는지 확인 (개정되면 경고) */
    const all=groupArts(g),stale=hit.citations.some(c=>{const x=all.find(y=>y.id===c.id);return !x||!x.body.some(b=>b.includes(c.quote));});
    return stale?{...hit,stale:true}:hit;}
   const top=scored(g,q).slice(0,3).map(x=>x.a);
   return{answer:top.length?"시연 모드에서는 준비된 질문에만 AI가 답합니다. 관련 조문을 찾았습니다."
     :"시연 모드에서는 준비된 질문에만 AI가 답합니다. 이 창구에서 관련 조문을 찾지 못했습니다. 오른쪽 조문 목차에서 직접 확인해 주세요.",
    citations:top.map(a=>({id:a.id,quote:bestLine(a,q)})),related:[],needsOwner:false,ownerQuestion:""};}}
};
async function provider(){
 if(useGemini())return PROVIDERS.gemini;
 if(settings.get().aiMode==="live"&&!TRIED)await readyP;
 return PROVIDERS[useLive()?"live":"demo"];}

/* ---------- Sidebar ---------- */
function curNav(){return {reg:"cats",soon:"cats"}[state.view]||state.view;}
function renderSidebar(){
 const sb=$("#sb"),cur=curNav();
 sb.className="sb"+(state.collapsed?" col":"");
 sb.innerHTML=`<div class="sb-top">
   <img class="sb-logo" src="assets/logo_w.svg" alt="taihan 사내규정 AI 에이전트">
   <button class="tog" id="tog" aria-label="${state.collapsed?"사이드바 펼치기":"사이드바 접기"}" aria-expanded="${!state.collapsed}">${state.collapsed?IC.popen:IC.pclose}</button>
  </div>
  <nav class="sb-nav">${NAV.map(g=>`<div class="grp">${g.g}</div>`+g.items.map(([v,l,ic])=>
   `<button class="nav" data-go="${v}" data-tip="${l}" ${cur===v?'aria-current="page"':""}>${ic}<span class="lbl">${l}</span></button>`).join("")).join("")}</nav>
  <div class="sb-bottom">
   ${isAdmin()?`<button class="nav" data-go="admin" data-tip="시스템 관리" ${cur==="admin"?'aria-current="page"':""}>${IC.shield}<span class="lbl">시스템 관리</span></button>`:""}
  </div>
  <div class="sb-acct" data-tip="${esc(me()?.name||"")} · 로그아웃">
   <span class="av">${esc((me()?.name||"?")[0])}</span>
   <span class="acct-t"><b>${esc(me()?.name||"")}${isAdmin()?'<em>관리자</em>':""}</b><small>${esc(me()?.dept||"")}</small></span>
   <button class="acct-out" id="logout" aria-label="로그아웃" title="로그아웃">${IC.logout}</button>
  </div>`;
 $("#logout").onclick=()=>{session.logout();go("home");};
 $("#tog").onclick=()=>{state.collapsed=!state.collapsed;renderSidebar();};
}

/* ---------- Header ---------- */
function renderHeader(){
 const m=aiMode(),on=m!=="checking";
 const label={gemini:"● Gemini / 실시간 응답",live:"● Online / RAG Engine Active",demo:"● Demo / 시연 모드",checking:"연결 확인 중"}[m];
 const tip={gemini:"Gemini로 실시간 답변합니다. 호출에 실패하면 준비된 답변으로 전환됩니다",live:"AI 응답을 사용할 수 있습니다",demo:"사전 작성된 답변으로 AI 흐름을 시연합니다. 근거 조문 하이라이트는 실제 원문과 대조됩니다",checking:"AI 연결을 확인하고 있습니다"}[m];
 $("#hd").innerHTML=`<h1>사내규정 AI 에이전트</h1>
  <span class="status ${on?"on":""} ${m}" title="${tip}"><span class="dot"></span>${label}</span>
  <div class="hd-r">
   <button class="hbtn${settings.get().notify?" new":""}" data-go="notice">${IC.bell}<span>알림</span></button>
   <button class="hbtn" data-go="settings" ${state.view==="settings"?'aria-current="page"':""}>${IC.gear}<span>설정</span></button>
  </div>`;
}

/* ---------- Home ---------- */
function renderHome(){
 const v=$("#view");v.className="";
 const loadedFaq=FAQ.slice(0,5);
 v.innerHTML=`<div class="wrap home">
  <section class="card hero">
   <div class="bh"><span class="bi">${IC.spark}</span><h3>AI 규정 검색</h3></div>
   <div class="sbar">${IC.search}<input id="q0" placeholder="궁금하신 내용을 적어주세요. 어느 규정인지 몰라도 됩니다." autocomplete="off"><button class="btn" id="go0">찾기</button></div>
   <div class="qchips">${CHIPS.map(([l,q],i)=>`<button class="qchip" data-chip="${i}">${esc(l)}</button>`).join("")}</div>
   <p class="note" id="route"></p>
  </section>
  <section class="card box catcard">
   <div class="bh"><span class="bi">${IC.folder}</span><h3>카테고리별 규정</h3><button class="more" data-go="cats">전체 보기</button></div>
   <div class="catrow">${Object.entries(CATS).map(([c,x])=>
    `<button class="ctile" data-cat="${c}" title="${esc(x.d)}"><span class="cti">${CAT_IC[c]||IC.folder}</span><span class="ctn">${x.n}</span><span class="ctc">${ORDER.filter(k=>D[k].cat===c).length}<small>건</small></span></button>`).join("")}</div>
  </section>
  <div class="grid2">
   <section class="card box">
    <div class="bh"><span class="bi">${IC.help}</span><h3>자주 찾는 질문 TOP 5</h3><button class="more" data-go="faq">더 보기</button></div>
    <div>${loadedFaq.map(([q,k],i)=>faqBtn(q,k,i)).join("")}</div>
   </section>
   <section class="card box">
    <div class="bh"><span class="bi">${IC.bell}</span><h3>최근 규정 개정 공지</h3><button class="more" data-go="notice">전체 보기</button></div>
    <div class="nlist">${allNotices().slice(0,5).map(n=>`<button class="nrow" data-go="notice">
     <span class="tnew">NEW</span><span class="nt">${esc(n.title)}</span>
     <span class="nmeta">${esc(n.owner)} · ${esc(n.date)}</span></button>`).join("")}</div>
   </section>
  </div>
 </div>`;
 $("#go0").onclick=()=>routeAsk($("#q0").value.trim());
 $("#q0").onkeydown=e=>{if(e.key==="Enter")routeAsk($("#q0").value.trim());};
 v.querySelectorAll("[data-chip]").forEach(b=>b.onclick=()=>{const q=CHIPS[+b.dataset.chip][1];$("#q0").value=q;routeAsk(q);});
 bindCommon(v);
 syncAvail();
}
function faqBtn(q,k,i){
 return `<button class="faq${i<3?" top":""}" data-faq="${esc(q)}" data-key="${k}"><span class="rk">${i+1}</span><span><span class="ft">${esc(q)}</span><small>${D[k].no} ${esc(short(D[k].name))}</small></span></button>`;
}
function noticeCard(n,ni){
 return `<div class="ntc"><h4><span class="tnew">NEW</span>[공지] ${esc(n.title)}</h4>
  <p class="nm">주관 ${esc(n.owner)} · 적용일자 ${esc(n.date)}</p>
  <ul>${n.items.map((it,ii)=>`<li><button data-ntc="${ni}-${ii}"><b>${esc(it.ref)}</b>${esc(it.text)}</button></li>`).join("")}</ul></div>`;
}
function bindCommon(root){
 root.querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>{state.cat=b.dataset.cat;go("cats");});
 root.querySelectorAll("[data-faq]").forEach(b=>b.onclick=()=>openGroup(D[b.dataset.key].group,b.dataset.faq,b.dataset.key));
 root.querySelectorAll("[data-ntc]").forEach(b=>b.onclick=()=>{const[ni,ii]=b.dataset.ntc.split("-").map(Number);openNotice(allNotices()[ni].items[ii]);});
}
function openNotice(it){
 if(!D[it.doc])return;
 if(!D[it.doc].loaded){openDoc(it.doc);return;}
 openGroup(D[it.doc].group,null,it.doc);
 if(it.art)setTimeout(()=>highlight([{id:it.art,docKey:it.doc,quote:it.quote}],it.art),60);
}
async function routeAsk(q){
 if(!q)return;
 const note=$("#route"),btn=$("#go0");
 btn.disabled=true;note.textContent="어느 규정 소관인지 판단하는 중…";
 const list=ORDER.filter(k=>D[k].loaded&&D[k].group===k).map(k=>`${k}: ${D[k].no} ${D[k].name} — ${D[k].blurb}`).join("\n");
 try{
  const key=await (await provider()).route(q,list);
  if(D[key]&&D[key].loaded){openGroup(D[key].group,q,key);}
  else note.textContent="판단하지 못했습니다. 카테고리에서 규정을 직접 선택해 주세요.";
 }catch(e){note.textContent=e.code==="not_granted"?"AI 사용이 허용되지 않았습니다. 규정을 직접 선택해 주세요.":"지금은 연결이 어렵습니다. 잠시 후 다시 시도해 주세요.";}
 finally{if($("#go0"))$("#go0").disabled=false;}
}

/* ---------- Category list ---------- */
function renderCats(){
 const v=$("#view");v.className="";
 const inCat=ORDER.filter(k=>D[k].cat===state.cat);
 const byNo=(a,b)=>D[a].no.localeCompare(D[b].no,undefined,{numeric:true});
 const rows=[];
 inCat.filter(k=>!D[k].parent).sort(byNo).forEach(k=>{rows.push(k);inCat.filter(x=>D[x].parent===k).sort(byNo).forEach(x=>rows.push(x));});
 inCat.forEach(k=>{if(!rows.includes(k))rows.push(k);});
 v.innerHTML=`<div class="wrap page">
  ${pageHead("카테고리별 규정","업무분류를 선택하면 해당 분류의 규정과 하위지침을 볼 수 있습니다.",`등록 규정 <b>${ORDER.length}</b>건`)}
  <section class="card pad">
   <div class="cats">${Object.entries(CATS).map(([c,x])=>
    `<button data-catsel="${c}" aria-pressed="${c===state.cat}">${x.n}<span class="n">${ORDER.filter(k=>D[k].cat===c).length}</span></button>`).join("")}</div>
   <p class="catdesc">${esc(CATS[state.cat].d)}</p>
   <div class="doclist">${rows.map(k=>{const d=D[k];
    return `<button class="doc-row${d.parent?" child":""}${d.loaded?"":" off"}" data-open="${k}">
     <span class="dno">${d.no}</span><span class="dname">${esc(d.name)}</span>
     <span class="dmeta">${d.owner}<em>시행 ${d.effective}</em></span></button>`}).join("")}</div>
  </section>
 </div>`;
 v.querySelectorAll("[data-catsel]").forEach(b=>b.onclick=()=>{state.cat=b.dataset.catsel;renderCats();});
}

/* ---------- FAQ ---------- */
/* 자주 찾는 질문: 펼쳐 보는 답변(검증된 시연 답변) */
const faqUI={open:new Set([0])};
function faqAnswer(q,k){
 const a=DEMO_ANSWERS[demoNorm(q)];if(!a)return null;
 const all=groupArts(D[k].group);
 const refs=[...new Set(a.citations.map(c=>{const x=all.find(y=>y.id===c.id);return x?`${x.n} ${x.h}`:null;}).filter(Boolean))];
 return{text:a.answer,refs};
}
function renderFaq(){
 const v=$("#view");v.className="";
 const items=FAQ.map(([q,k],i)=>({q,k,i}));
 v.innerHTML=`<div class="wrap page faqpage">
  ${pageHead("자주 찾는 질문","질문을 누르면 답변과 근거 조문을 바로 확인할 수 있습니다.",`질문 <b>${FAQ.length}</b>개`)}
  <section class="card faqbox">
   <div class="faqacc">${items.map(({q,k,i})=>{const o=faqUI.open.has(i),a=o?faqAnswer(q,k):null;return `<div class="fq${o?" open":""}">
    <button class="fqh" data-fq="${i}" aria-expanded="${o}"><span class="rk${i<3?" hot":""}">${i+1}</span>
     <span class="fqt"><span class="ft">${esc(q)}</span><span class="fqtag">${esc(D[k].no)} ${esc(short(D[k].name))}</span></span>
     <span class="fqi" aria-hidden="true">${I('<path d="m6 9 6 6 6-6"/>')}</span></button>
    ${o?`<div class="fqa">${a?`<p>${esc(a.text).replace(/제(\d+)조/g,'<strong>제$1조</strong>')}</p>
     ${a.refs.length?`<p class="fqref"><b>근거</b>${a.refs.map(r=>`<span>${esc(r)}</span>`).join("")}</p>`:""}`:`<p class="mu">준비된 답변이 없습니다. 규정 창구에서 확인해 주세요.</p>`}
     <button class="fqgo" data-fqgo="${i}">규정 원문과 함께 보기 →</button></div>`:""}
   </div>`;}).join("")||'<p class="empty">조건에 맞는 질문이 없습니다.</p>'}</div>
  </section>
 </div>`;
 v.querySelectorAll("[data-fq]").forEach(b=>b.onclick=()=>{const i=+b.dataset.fq;faqUI.open.has(i)?faqUI.open.delete(i):faqUI.open.add(i);renderFaq();});
 v.querySelectorAll("[data-fqgo]").forEach(b=>b.onclick=()=>{const[q,k]=FAQ[+b.dataset.fqgo];openGroup(D[k].group,q,k);});
}

/* ---------- Notice ---------- */
/* 개정 공지: 날짜별 타임라인 + 변경 유형 + 조문 바로가기 */
const changeType=t=>/폐지/.test(t)?["del","폐지"]:/제정/.test(t)?["new","제정"]:/신설|추가/.test(t)?["add","신설"]:["mod","개정"];
function noticeDate(n){const m=String(n.date).match(/(\d{2,4})\.(\d{1,2})\.(\d{1,2})/);if(!m)return{y:"",md:n.date};return{y:(m[1].length===2?"20"+m[1]:m[1]),md:`${m[2].padStart(2,"0")}.${m[3].padStart(2,"0")}`};}
function renderNotice(){
 const v=$("#view");v.className="";
 const ns=allNotices();
 v.innerHTML=`<div class="wrap page ntcpage">
  ${pageHead("최근 규정 개정 공지","개정된 조문으로 바로 이동해 바뀐 문장을 확인할 수 있습니다.",`공지 <b>${ns.length}</b>건`)}
  <div class="tl">${ns.map((n,ni)=>{const d=noticeDate(n);return `<article class="tl-i">
   <div class="tl-d"><b>${esc(d.md)}</b><small>${esc(d.y)}</small></div>
   <div class="tl-dot"></div>
   <section class="card tl-c">
    <header class="tl-h"><span class="tnew">NEW</span><h3>${esc(n.title)}</h3>
     <span class="tl-own">${esc(n.owner)}</span></header>
    <p class="tl-m">적용일자 ${esc(n.date)} · 변경 ${n.items.length}건</p>
    <ul class="tl-items">${n.items.map((it,ii)=>{const[c,l]=changeType(it.text);const has=D[it.doc];return `<li>
     <span class="ctype ${c}">${l}</span>
     <div class="tl-t"><b>${esc(it.ref)}</b><span>${esc(it.text)}</span></div>
     ${has?`<button class="tl-go" data-ntc="${ni}-${ii}">${it.art?"조문 보기":"규정 보기"} →</button>`:""}</li>`;}).join("")}</ul>
   </section></article>`;}).join("")}</div>
 </div>`;
 bindCommon(v);
}

/* ---------- Soon ---------- */
function openDoc(k,q){
 if(!D[k].loaded){state.view="soon";state.doc=k;renderSidebar();renderSoon(k);return;}
 openGroup(D[k].group,q,k);
}
function renderSoon(k){
 const d=D[k],v=$("#view");v.className="";
 v.innerHTML=`<div class="wrap"><section class="card"><div class="soonbox">
  <span class="bi">${IC.file}</span><h2>${esc(d.no)} ${esc(d.name)}</h2>
  <p>이 규정은 아직 창구에 조문이 적재되지 않았습니다.<br>주관 ${esc(d.owner)} · 시행 ${esc(d.effective)}</p>
  <p>파일럿에서는 8건을 우선 적재했으며, 나머지는 원문 확보 순서에 따라 단계적으로 추가합니다.</p>
  <button data-go="cats">카테고리로 돌아가기</button></div></section></div>`;
}

/* ---------- Workspace ---------- */
function openGroup(g,q,focus){
 state.view="reg";state.group=g;
 state.doc=focus&&D[focus]&&D[focus].loaded?focus:docsOf(g).find(k=>D[k].loaded);
 state.cat=groupHead(g).cat;state.turns=[];
 renderSidebar();renderWorkspace();if(q)ask(q);
}
function renderWorkspace(){
 const g=state.group,head=groupHead(g),ds=docsOf(g).filter(k=>D[k].loaded);
 const v=$("#view");v.className="wsv";
 v.innerHTML=`<div class="crumb"><button data-go="cats">카테고리별 규정</button><span>›</span><span>${CATS[head.cat].n}</span><span>›</span><b id="crumbDoc">${esc(D[state.doc].no)} ${esc(D[state.doc].name)}</b><span class="eff" id="crumbEff">시행 ${esc(D[state.doc].effective)}</span></div>
 <div class="ws">
  <section class="card pane">
   <div class="pbar"><span class="bi">${IC.chat}</span><h3>AI 규정 상담</h3><span class="ow">주관 ${esc(head.owner)}</span></div>
   <div class="thread" id="thread"><div class="starter" id="starter">
    <p>${esc(head.blurb||"")}${ds.length>1?` 하위지침 ${ds.length-1}건을 함께 검색합니다.`:""}</p>
    ${(head.starters||[]).map(s=>`<button class="chip" data-ask="${esc(s)}">${esc(s)}</button>`).join("")}
   </div></div>
   <div class="composer">
    <div class="cin"><textarea id="qin" rows="1" placeholder="상황을 구체적으로 적을수록 정확합니다"></textarea><button class="send" id="send">질문</button></div>
    <p class="hint" id="hint">답변의 근거 조문을 누르면 오른쪽 원문에서 해당 문장을 표시합니다.</p>
   </div>
  </section>
  <section class="card pane pane-doc">
   <div class="doc-head"><button class="dtab" id="docTab" data-tab="${state.doc}" aria-current="true">${docTabLabel(state.doc)}</button><button class="dtab htab" id="histTab" aria-current="false">개정 이력<small>${histStore.list(state.doc).length}건</small></button>
    <div class="doctools">${annexOf(g)?`<button class="tocbtn annexbtn" id="annexBtn" aria-pressed="false">${IC.list}<span>${esc(annexOf(g).title)}</span></button>`:""}<button class="tocbtn" id="tocBtn">조문 목차</button>
     <button class="tocbtn icon" id="prtBtn" title="현재 규정 인쇄">${IC.print}<span>인쇄</span></button>
     <button class="tocbtn icon" id="dlBtn" title="현재 규정 원문 다운로드">${IC.down}<span>다운로드</span></button></div></div>
   <div class="doc-scroll" id="docScroll">${docHTML(state.doc)}</div>
  </section>
 </div>`;
 $("#send").onclick=()=>{const t=$("#qin").value.trim();if(t){$("#qin").value="";$("#qin").style.height="auto";ask(t);}};
 $("#qin").onkeydown=e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.isComposing){e.preventDefault();$("#send").click();}};
 $("#qin").oninput=e=>{e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,120)+"px";};
 state.docMode="text";
 $("#tocBtn").onclick=toggleToc;
 $("#histTab").onclick=()=>showHist(state.doc);
 $("#annexBtn")&&($("#annexBtn").onclick=()=>state.docMode==="annex"?switchDoc(state.doc):showAnnex(g));
 $("#docScroll").addEventListener("click",e=>{const b=e.target.closest("[data-amark]");if(b){e.stopPropagation();showHist(state.doc,b.dataset.amark);}});
 $("#prtBtn").onclick=()=>printDoc(state.doc);
 $("#dlBtn").onclick=()=>downloadDoc(state.doc);
 $("#docTab").onclick=()=>switchDoc(state.doc);
 syncAvail();
}
/* 규정 창구 원문 탭: 누른 규정 하나만 보여준다 (AI 검색은 본규정·하위지침을 함께) */
const docTabLabel=k=>`${esc(D[k].parent?short(D[k].name):D[k].name)}<small>${esc(D[k].no)}</small>`;
function switchDoc(k,then){
 state.doc=k;state.docMode="text";$("#docScroll").innerHTML=docHTML(k);
 const t=$("#docTab");if(t){t.dataset.tab=k;t.innerHTML=docTabLabel(k);}
 if($("#crumbDoc")){$("#crumbDoc").textContent=`${D[k].no} ${D[k].name}`;$("#crumbEff").textContent=`시행 ${D[k].effective}`;}
 syncDocTabs();
 if(then)then();
}
function toggleToc(){
 const ex=$(".tocpanel");if(ex){ex.remove();return;}
 const d=D[state.doc],p=document.createElement("div");p.className="tocpanel";
 p.innerHTML=`<h4>${esc(d.no)} 조문 목차</h4>`+(d.chapters||[]).map(c=>`<div class="g">${esc(c.t)}</div>`+c.arts.map(a=>`<button data-jump="${a.id}">${a.n} ${a.h}</button>`).join("")).join("");
 $("#docScroll").appendChild(p);
 p.querySelectorAll("[data-jump]").forEach(b=>b.onclick=()=>{document.getElementById("art-"+b.dataset.jump)?.scrollIntoView({behavior:"smooth",block:"start"});p.remove();});
}
function docHTML(k){
 const d=D[k];
 return `<div class="doc-sheet"><h1 class="doc-title">${esc(short(d.name))}</h1>
  <p class="doc-sub">${d.no} · 시행 ${d.effective} · 주관 ${d.owner}</p>
  ${(d.chapters||[]).map(ch=>`<h2 class="chapter">${esc(ch.t)}</h2>`+ch.arts.map(a=>`
   <article class="art" id="art-${a.id}"><h3>${a.n}(${a.h})${k!=="__past"&&k!=="__prev"?(v=>v?`<button class="amark" data-amark="${v.id}" title="${esc(v.reason||"")}">${esc(v.eff)} ${esc(v.type)}</button>`:"")(lastChangeOf(k,a.id)):""}</h3>
   ${a.body.map(b=>b==="TABLE"?tableHTML(a.table):`<p>${esc(b)}</p>`).join("")}
   ${a.xref?`<p class="xref"><b>연계</b> ${esc(a.xref)}</p>`:""}</article>`).join("")).join("")}</div>`;
}
function tableHTML(t){return !t?"":`<table><thead><tr>${t.head.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${t.rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;}

/* ---------- highlight ---------- */
function clearMarks(){
 document.querySelectorAll(".art.hit").forEach(e=>e.classList.remove("hit"));
 document.querySelectorAll("#docScroll mark").forEach(m=>m.replaceWith(document.createTextNode(m.textContent)));
}
function paint(cits,to){
 clearMarks();
 cits.filter(c=>c.docKey===state.doc).forEach(c=>{const el=document.getElementById("art-"+c.id);if(!el)return;
  el.classList.add("hit");if(c.quote&&c.quote.length>4)markInside(el,c.quote);});
 const t=to&&document.getElementById("art-"+to);
 if(t){t.scrollIntoView({behavior:"smooth",block:"start"});const m=t.querySelector("mark");
  if(m){m.classList.add("hot");setTimeout(()=>m.classList.remove("hot"),1600);}}
}
function highlight(cits,to){
 const target=cits.find(c=>c.id===to)||cits[0];if(!target)return;
 if(target.docKey!==state.doc||state.docMode!=="text")switchDoc(target.docKey,()=>paint(cits,target.id));else paint(cits,target.id);
}
function markInside(root,quote){
 const q=quote.trim().replace(/\s+/g," ");
 const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const ns=[];while(w.nextNode())ns.push(w.currentNode);
 for(const n of ns){
  if(n.nodeValue.replace(/\s+/g," ").indexOf(q)<0)continue;
  const raw=n.nodeValue,start=raw.indexOf(q.slice(0,10));if(start<0)continue;
  const end=Math.min(raw.length,start+q.length);
  const mk=document.createElement("mark");mk.textContent=raw.slice(start,end);
  const after=n.splitText(start);after.nodeValue=after.nodeValue.slice(end-start);
  n.parentNode.insertBefore(mk,after);return true;}
 return false;
}

/* ---------- ask ---------- */
function bubble(role,html){
 const d=document.createElement("div");d.className="msg "+role;d.innerHTML=`<div class="bub">${html}</div>`;
 $("#thread").appendChild(d);$("#thread").scrollTop=$("#thread").scrollHeight;return d;
}
async function ask(q){
 if(state.busy)return;
 $("#starter")?.remove();bubble("me",esc(q));
 state.busy=true;$("#send").disabled=true;
 const holder=bubble("ai",`<span class="thinking dots">근거 조문을 찾는 중</span>`),box=holder.querySelector(".bub");
 const g=state.group,head=groupHead(g);
 const corpus=retrieve(g,q).map(artText).join("\n\n---\n\n");
 const others=ORDER.filter(k=>D[k].loaded&&D[k].group!==g&&!D[k].parent).map(k=>`${k}: ${D[k].no} ${D[k].name}`).join("\n");
 const gp=docsOf(g).filter(k=>D[k].loaded).map(ownerPrompt).filter(Boolean).join("\n\n");
 const instruction=`당신은 ${head.no} ${head.name}(주관: ${head.owner}, 시행 ${head.effective})을 안내하는 사내 규정 상담 담당자입니다.

[규정 주관부서가 작성한 해석 지침 — 반드시 우선 반영]
${gp}

[검색된 규정 조문]
${corpus}

[이 창구 외에 조회 가능한 다른 규정]
${others}

[답변 규칙]
- 반드시 위 조문에 근거해 답합니다. 조문에 없는 내용은 지어내지 말고 needsOwner를 true로 합니다.
- 실무자가 바로 행동할 수 있게 답합니다. 결론 먼저, 그다음 근거와 절차.
- 답변은 3~6문장. 조문 번호는 본문에 자연스럽게 녹여 씁니다.
- citations의 quote는 반드시 위 조문 원문에서 그대로 복사한 한 문장이어야 합니다. 변형 금지.
- 조문에 (연계: ...) 표시가 있고 질문과 관련되면, 그 규정이 위 '다른 규정' 목록에 있을 때 related에 그 키를 넣습니다.
- 조문이 모호하거나 사안이 범위를 벗어나면 needsOwner를 true로 하고 무엇을 확인해야 하는지 ownerQuestion에 적습니다.

JSON만 출력하세요:
{"answer":"답변 본문","citations":[{"id":"조문ID","quote":"원문 그대로의 한 문장"}],"related":["다른 규정 키"],"needsOwner":false,"ownerQuestion":""}`;
 const turns=[{role:"user",content:instruction}];
 state.turns.slice(-4).forEach(t=>turns.push(t));turns.push({role:"user",content:q});
 try{
  const r=await (await provider()).answer(g,q,turns);
  const all=groupArts(g),multi=docsOf(g).filter(k=>D[k].loaded).length>1;
  const cits=(r.citations||[]).map(c=>{const a=all.find(x=>x.id===c.id);return a?{...c,docKey:a.docKey,label:`${a.n} ${a.h}`,docNo:D[a.docKey].no}:null;}).filter(Boolean);
  box.innerHTML=(r.fromOwner?`<span class="ownerbadge">${esc(head.owner)} 답변 반영</span>`:"")
   +(r.fallback?`<div class="fbnote">${IC.help}<span>실시간 AI 응답을 받지 못해 준비된 답변으로 안내합니다. (${esc(String(r.fallback).slice(0,60))})</span></div>`:"")
   +(r.markdown?`<div class="md">${mdToHtml(r.answer||"")}</div>`:esc(r.answer||"").replace(/제(\d+)조/g,'<strong>제$1조</strong>'));
  if(r.stale)box.insertAdjacentHTML("afterbegin",`<div class="stale">${IC.help}<span><b>근거 조문이 개정되었습니다.</b> 이 답변은 개정 전 조문 기준일 수 있습니다. 오른쪽 현행 원문과 <button data-stalehist>개정 이력</button>을 확인하고, 필요하면 주관부서에 확인하세요.</span></div>`);
  box.querySelector("[data-stalehist]")?.addEventListener("click",()=>showHist(state.doc));
  askLog.add({q,key:g,needsOwner:!!r.needsOwner,user:me()?.name||""});
  if(cits.length){
   const w=document.createElement("div");w.className="cites";
   /* 같은 조문을 여러 문장 인용해도 버튼은 조문당 하나만 (하이라이트는 인용 문장 전부) */
   const seenCite=new Set();
   cits.filter(c=>!seenCite.has(c.id)&&seenCite.add(c.id)).forEach(c=>{
    const b=document.createElement("button");b.className="cite";b.textContent=(multi?c.docNo+" ":"")+c.label;b.onclick=()=>highlight(cits,c.id);w.appendChild(b);});
   box.appendChild(w);highlight(cits);
  }
  /* 같은 규정이 여러 번 와도 버튼은 하나만 (규정 키·표시 이름 둘 다 기준) */
  const relSeen=new Set();
  const rel=(r.related||[]).filter(k=>{
   if(!D[k]||!D[k].loaded||D[k].group===g)return false;
   const label=short(D[k].name);
   if(relSeen.has(k)||relSeen.has(label))return false;
   relSeen.add(k);relSeen.add(label);return true;});
  if(rel.length){
   const w=document.createElement("div");w.className="rel";
   rel.forEach(k=>{const b=document.createElement("button");b.textContent=`${short(D[k].name)}에서 이어 확인 →`;b.onclick=()=>openGroup(D[k].group,q,k);w.appendChild(b);});
   box.appendChild(w);
  }
  if(r.needsOwner){
   const vd=document.createElement("div");vd.className="verdict";
   vd.innerHTML=`<div>규정만으로는 확정할 수 없는 사안입니다. ${esc(r.ownerQuestion||"주관부서 확인이 필요합니다.")}</div>`;
   const b=document.createElement("button");b.textContent=`${head.owner}에 확인 요청`;
   b.onclick=()=>{pushLog({q,key:g,regName:head.name,need:r.ownerQuestion||"",at:new Date().toISOString()});
    escStore.add({q,key:g,docKey:state.doc,regName:head.name,owner:head.owner,need:r.ownerQuestion||"",user:me()?.name||"",dept:me()?.dept||""});
    vd.className="verdict done";vd.innerHTML=`<div>${esc(head.owner)}에 확인 요청이 접수되었습니다. 담당자 답변은 해석 지침에 반영되어 다음부터는 이 창구에서 바로 안내됩니다.</div>`;};
   vd.appendChild(b);box.appendChild(vd);
  }
  state.turns.push({role:"user",content:q});state.turns.push({role:"assistant",content:r.answer||""});
 }catch(e){
  const msg={not_granted:"AI 사용이 허용되지 않았습니다. 오른쪽 규정 원문은 계속 열람하실 수 있습니다.",
   rate_limited:"요청이 몰렸습니다. 잠시 후 다시 시도해 주세요.",
   invalid_json:"답변 형식이 맞지 않았습니다. 질문을 조금 더 구체적으로 적어 다시 시도해 주세요."}[e.code]||"지금은 연결이 어렵습니다. 잠시 후 다시 시도해 주세요.";
  box.innerHTML=`<span class="thinking">${esc(msg)}</span>`;
 }finally{state.busy=false;if($("#send"))$("#send").disabled=false;$("#qin")?.focus();}
}

/* ---------- routing ---------- */
function syncAvail(){const h=$("#hint");if(h&&aiMode()==="demo")h.textContent="시연 모드 · 준비된 질문에 AI가 답합니다. 근거 조문을 누르면 오른쪽 원문에서 해당 문장을 표시합니다.";}
const me=()=>session.get();
const isAdmin=()=>me()?.role==="admin";
function go(v){
 if(!me()){renderLogin();return;}
 if(v==="admin"&&!isAdmin())v="home";
 document.body.classList.remove("auth");
 state.view=v;renderSidebar();renderHeader();
 const view=$("#view");view.scrollTop=0;
 ({home:renderHome,cats:renderCats,faq:renderFaq,notice:renderNotice,admin:renderAdmin,settings:renderSettings,checklist:renderChecklist,manage:renderManage,myreq:renderMyReq}[v]||renderHome)();
}
document.addEventListener("click",e=>{
 const g=e.target.closest("[data-go]");if(g){go(g.dataset.go);return;}
 const o=e.target.closest("[data-open]");if(o){openDoc(o.dataset.open);return;}
 const a=e.target.closest("[data-ask]");if(a)ask(a.dataset.ask);
});

