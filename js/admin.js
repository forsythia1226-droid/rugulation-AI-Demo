/* 관리자 페이지: 규정 등록·수정 / 해석 지침 / 확인 요청 처리 / 질의 현황 / 변경 이력 / 권한 / 체계 점검 */
const ADMIN_TABS=[["regs","규정 관리"],["guide","해석 지침"],["req","확인 요청"],["stats","질의 현황"],["hist","변경 이력"],["users","사용자·권한"],["audit","체계 점검"]];
let adminTab="regs",adminEdit=null,adminQ="",adminGuide=null;

function refreshOrder(){ORDER=Object.keys(D);}
function renderAdmin(){
 const v=$("#view");v.className="";
 const open=escStore.list().filter(e=>e.status==="open").length;
 v.innerHTML=`<div class="wrap page">
  ${pageHead("시스템 관리","규정 등록·수정, 해석 지침, 확인 요청 답변과 질의 현황을 관리합니다.",`규정 관리자 · ${esc(me().name)}`)}
  <div class="atabs">${ADMIN_TABS.map(([k,l])=>`<button data-atab="${k}" aria-pressed="${adminTab===k}">${l}${k==="req"&&open?`<span class="n">${open}</span>`:""}</button>`).join("")}</div>
  <div id="apane"></div>
 </div>`;
 v.querySelectorAll("[data-atab]").forEach(b=>b.onclick=()=>{adminTab=b.dataset.atab;adminEdit=null;renderAdmin();});
 ({regs:adminRegs,guide:adminGuidePane,req:adminReq,stats:adminStats,hist:adminHist,users:adminUsers,audit:adminAudit}[adminTab])($("#apane"));
}

/* ---- 규정 관리 ---- */
function adminRegs(p){
 if(adminEdit!==null){adminEditor(p);return;}
 const q=adminQ.toLowerCase();
 const rows=ORDER.filter(k=>!q||(D[k].no+" "+D[k].name+" "+D[k].owner).toLowerCase().includes(q));
 p.innerHTML=`<section class="card pad">
  <div class="atool"><div class="sbar sm">${IC.search}<input id="aq" placeholder="규정번호·규정명·주관부서 검색" value="${esc(adminQ)}"></div>
   <button class="btn" id="anew">+ 새 규정 등록</button></div>
  <div class="tblwrap"><table class="atbl"><thead><tr><th>규정번호</th><th>규정명</th><th>분류</th><th>주관부서</th><th>시행일</th><th>조문</th><th></th></tr></thead>
  <tbody>${rows.map(k=>{const d=D[k],n=arts(k).length;return `<tr>
   <td><span class="dno">${esc(d.no)}</span></td><td>${d.parent?"└ ":""}${esc(d.name)}${regStore.isEdited(k)?' <span class="pill edited">수정됨</span>':""}</td>
   <td>${esc(CATS[d.cat]?.n||"-")}</td><td>${esc(d.owner)}</td><td>${esc(d.effective)}</td>
   <td>${n?n+"개":'<span class="mu">미적재</span>'}</td>
   <td class="act"><button data-aedit="${k}">수정</button><button data-adel="${k}" class="del">삭제</button></td></tr>`;}).join("")}</tbody></table></div>
  <p class="sub">${rows.length}건 · 조문을 등록하면 규정 창구와 AI 검색 대상에 바로 포함됩니다.</p>
 </section>`;
 $("#aq").oninput=e=>{adminQ=e.target.value;const pos=e.target.selectionStart;adminRegs(p);const i=$("#aq");i.focus();i.setSelectionRange(pos,pos);};
 $("#anew").onclick=()=>{adminEdit="";adminRegs(p);};
 p.querySelectorAll("[data-aedit]").forEach(b=>b.onclick=()=>{adminEdit=b.dataset.aedit;adminRegs(p);});
 p.querySelectorAll("[data-adel]").forEach(b=>b.onclick=()=>{const k=b.dataset.adel;
  if(!confirm(`${D[k].no} ${t(D[k].name)} — ${t("삭제할까요?")}`))return;
  regStore.remove(k,me().name);delete D[k];refreshOrder();renderSidebar();adminRegs(p);});
}
/* 조문 ↔ 편집용 텍스트 */
function artsToText(d){
 return (d.chapters||[]).map(ch=>`# ${ch.t}\n`+ch.arts.map(a=>`${a.n}(${a.h})\n`+a.body.map(b=>b==="TABLE"&&a.table?
  [a.table.head,...a.table.rows].map(r=>"| "+r.join(" | ")+" |").join("\n"):b).join("\n")+(a.xref?`\n연계: ${a.xref}`:"")).join("\n")).join("\n\n");
}
function textToArts(txt,prefix,old){
 const oldArts=(old&&old.chapters||[]).flatMap(c=>c.arts);
 const chapters=[];let ch=null,art=null;
 const head=/^((?:제\d+조(?:의\d+)?)|(?:별표\d+))\s*\((.+)\)\s*$/;
 txt.split(/\r?\n/).forEach(raw=>{const l=raw.trim();if(!l)return;
  if(l.startsWith("#")){ch={t:l.replace(/^#+\s*/,""),arts:[]};chapters.push(ch);art=null;return;}
  const m=l.match(head);
  if(m){if(!ch){ch={t:"본문",arts:[]};chapters.push(ch);}
   const prev=oldArts.find(a=>a.n===m[1]);
   const num=m[1].startsWith("별표")?"B"+m[1].replace(/\D/g,""):m[1].replace(/^제(\d+)조(?:의(\d+))?$/,(x,a,b)=>b?a+"-"+b:a);
   art={id:prev?prev.id:`${prefix}-${num}`,n:m[1],h:m[2],tags:prev?prev.tags:[m[2]],body:[]};ch.arts.push(art);return;}
  if(!art)return;
  if(l.startsWith("|")){const cells=l.replace(/^\||\|$/g,"").split("|").map(c=>c.trim());
   if(!art.table){art.table={head:cells,rows:[]};art.body.push("TABLE");}else art.table.rows.push(cells);return;}
  if(l.startsWith("연계:")){art.xref=l.slice(3).trim();return;}
  art.body.push(l);});
 return chapters;
}
function adminEditor(p){
 const isNew=adminEdit==="",d=isNew?{no:"TES-",name:"",cat:"2",owner:"",effective:new Date().toISOString().slice(0,10).replace(/-/g,"."),blurb:"",starters:[],chapters:[]}:D[adminEdit];
 const parents=ORDER.filter(k=>!D[k].parent&&k!==adminEdit);
 p.innerHTML=`<section class="card pad">
  <div class="bh"><span class="bi">${IC.edit}</span><h3>${isNew?"새 규정 등록":`${esc(d.no)} ${esc(d.name)} 수정`}</h3><button class="more" id="acancel">목록으로</button></div>
  <div class="form">
   <label>규정번호<input id="f-no" value="${esc(d.no)}" required></label>
   <label class="w2">규정명<input id="f-name" value="${esc(d.name)}" placeholder="예: 인사규정_인사위원회 운영지침" required></label>
   <label>업무분류<select id="f-cat">${Object.entries(CATS).map(([c,x])=>`<option value="${c}" ${c===d.cat?"selected":""}>${c}. ${x.n}</option>`).join("")}</select></label>
   <label>상위 규정 (하위지침인 경우)<select id="f-parent"><option value="">없음 (본규정)</option>${parents.map(k=>`<option value="${k}" ${k===d.parent?"selected":""}>${esc(D[k].no)} ${esc(short(D[k].name))}</option>`).join("")}</select></label>
   <label>주관부서<input id="f-owner" value="${esc(d.owner)}" placeholder="예: 인사팀"></label>
   <label>시행일<input id="f-eff" value="${esc(d.effective)}" placeholder="2026.09.01"></label>
   <label class="w3">한 줄 설명 (규정 창구 첫 화면)<input id="f-blurb" value="${esc(d.blurb||"")}"></label>
   <label class="w3">예시 질문 (한 줄에 하나, 최대 3개)<textarea id="f-starters" rows="3">${esc((d.starters||[]).join("\n"))}</textarea></label>
   <label class="w3">조문 본문
    <small>규칙: <code># 제1장 총칙</code> 장 제목 · <code>제1조(목적)</code> 조문 제목 · 다음 줄부터 항 · <code>| 구분 | 금액 |</code> 표(첫 줄 머리글) · <code>연계: …</code> 다른 규정 안내</small>
    <textarea id="f-body" class="admin-ta mono" rows="18">${esc(artsToText(d))}</textarea></label>
   <label class="w2">개정 사유<input id="f-note" placeholder="예: 제14조 야근 식대 한도 조정" value=""></label>
   <label class="chk"><input type="checkbox" id="f-notice" ${isNew?"":"checked"}> 개정 공지로 게시</label>
  </div>
  <div class="formbar"><button class="save" id="asave">${isNew?"등록":"저장"}</button><button class="ghost" id="aprev">미리보기</button><span class="saved hidden" id="aok"></span></div>
  <div id="aprevbox"></div>
 </section>`;
 const read=()=>{
  const no=$("#f-no").value.trim(),name=$("#f-name").value.trim();
  const prefix=!isNew&&arts(adminEdit)[0]?arts(adminEdit)[0].id.replace(/-[^-]+(-\d+)?$/,""):no.replace(/^TES-/,"").replace(/-/g,"");
  const chapters=textToArts($("#f-body").value,prefix,isNew?null:d);
  const parent=$("#f-parent").value||undefined;
  let key=isNew?no:adminEdit;if(isNew)while(D[key])key+="*";
  const o=Object.assign({},isNew?{}:d,{key,no,name,cat:$("#f-cat").value,owner:$("#f-owner").value.trim(),effective:$("#f-eff").value.trim(),
   blurb:$("#f-blurb").value.trim(),starters:$("#f-starters").value.split("\n").map(x=>x.trim()).filter(Boolean).slice(0,3),
   chapters,loaded:chapters.some(c=>c.arts.length)});
  if(parent){o.parent=parent;o.group=(!isNew&&d.parent===parent&&d.group)?d.group:D[parent].group;}else{delete o.parent;o.group=key;}
  return o;};
 $("#acancel").onclick=()=>{adminEdit=null;adminRegs(p);};
 $("#aprev").onclick=()=>{const o=read();const tmp=D.__prev;D.__prev=o;$("#aprevbox").innerHTML=`<div class="prevsheet">${docHTML("__prev")}</div>`;if(tmp)D.__prev=tmp;else delete D.__prev;};
 $("#asave").onclick=()=>{
  const o=read();
  if(!o.no||!o.name){alert(t("규정번호와 규정명은 필수입니다."));return;}
  const note=$("#f-note").value.trim()||(isNew?"신규 등록":"수정");
  regStore.save(o,note,me().name);D[o.key]=o;refreshOrder();
  if($("#f-notice").checked){const t=new Date();
   noticeStore.add({title:`${short(o.name)} ${isNew?"제정":"개정"} 안내`,owner:o.owner||"-",date:`'${String(t.getFullYear()).slice(2)}.${String(t.getMonth()+1).padStart(2,"0")}.${String(t.getDate()).padStart(2,"0")} 부`,
    items:[{ref:o.no,text:note,doc:o.key}]});}
  renderSidebar();adminEdit=o.key;adminEditor(p);
  const ok=$("#aok");ok.textContent=`저장했습니다 · 조문 ${arts(o.key).length}개`;ok.classList.remove("hidden");};
}

/* ---- 해석 지침 ---- */
function adminGuidePane(p){
 const list=ORDER.filter(k=>D[k].loaded);
 if(!list.includes(adminGuide))adminGuide=list[0];
 const sel=adminGuide;
 p.innerHTML=`<section class="card pad">
  <div class="bh"><span class="bi">${IC.edit}</span><h3>해석 지침</h3></div>
  <p class="sub">규정을 주관하는 팀이 작성해 두면 AI가 규정 원문보다 먼저 읽고 답합니다. 전화로 반복 설명하던 내용이 창구에 축적됩니다.</p>
  <div class="selectrow">${list.map(k=>`<button data-sel="${k}" aria-pressed="${k===sel}">${esc(D[k].no)} ${esc(short(D[k].name))}</button>`).join("")}</div>
  <p class="sub" style="margin:0 0 9px">${esc(D[sel].name)} · 주관 ${esc(D[sel].owner)}</p>
  <textarea class="admin-ta" id="rp">${esc(ownerPrompt(sel))}</textarea>
  <button class="save" id="rpSave">지침 저장</button><span class="saved hidden" id="rpOk">저장했습니다</span>
 </section>`;
 p.querySelectorAll("[data-sel]").forEach(b=>b.onclick=()=>{adminGuide=b.dataset.sel;adminGuidePane(p);});
 $("#rpSave").onclick=()=>{LS.set("rp:"+sel,$("#rp").value);const ok=$("#rpOk");ok.classList.remove("hidden");setTimeout(()=>ok.classList.add("hidden"),1800);};
}

/* ---- 확인 요청 처리 (루프 닫기) ---- */
function adminReq(p){
 const l=escStore.list();
 p.innerHTML=`<section class="card pad">
  <div class="bh"><span class="bi">${IC.inbox}</span><h3>확인 요청</h3></div>
  <p class="sub">직원이 직접 남긴 문의와 AI가 규정만으로 답하지 못한 질문입니다. 답변을 등록하면 요청자에게 전달되고, 해석 지침에 추가되어 같은 질문에는 창구에서 바로 안내됩니다.</p>
  ${l.length?`<ul class="reqlist">${l.map(e=>`<li>
   <div class="reqtop"><span class="pill ${e.status}">${e.status==="answered"?"답변 완료":"확인 필요"}</span><span class="pill src">${e.via==="direct"?"직접 문의":"AI 확인 요청"}</span><small>${esc(t(e.regName))}${e.assignee?" · "+t("담당")+" "+esc(t(e.assignee)):""} · ${t("요청")} ${esc(t(e.dept||""))} ${esc(t(e.user||""))} · ${new Date(e.at).toLocaleString(lang()==="en"?"en-US":"ko-KR")}</small></div>
   <p class="q">${esc(e.q)}</p>${e.need?`<p class="need">${esc(e.need)}</p>`:""}
   ${e.status==="answered"?`<div class="ans"><b>${esc(e.answeredBy)} 답변</b>${esc(e.answer)}</div>`:
   `<textarea class="admin-ta sm" data-ans="${e.id}" placeholder="주관부서 답변을 입력하세요"></textarea>
    <div class="formbar"><label class="chk"><input type="checkbox" data-toguide="${e.id}" checked> 해석 지침에 추가</label>
    <button class="save" data-answer="${e.id}">답변 등록</button></div>`}</li>`).join("")}</ul>`
  :`<p class="empty">아직 없습니다. 규정 창구에서 "확인 요청"을 누르면 이곳에 쌓입니다.<br>시연: 일반 계정으로 "업무에 ChatGPT 같은 생성형 AI를 써도 되나요?"를 질문해 보세요.</p>`}
 </section>`;
 p.querySelectorAll("[data-answer]").forEach(b=>b.onclick=()=>{
  const id=b.dataset.answer,txt=p.querySelector(`[data-ans="${id}"]`).value.trim();if(!txt)return;
  const e=escStore.answer(id,txt,`${D[e0(id).key]?.owner||""} ${me().name}`.trim());
  if(p.querySelector(`[data-toguide="${id}"]`).checked){const k=e.docKey&&D[e.docKey]?e.docKey:e.key;
   LS.set("rp:"+k,ownerPrompt(k)+`\n\n[확인 요청 답변 · ${new Date().toLocaleDateString("ko-KR")}]\nQ. ${e.q}\nA. ${txt}`);}
  ownerAnswers.put(e.q,{key:e.key,answer:txt,by:e.answeredBy,citations:(DEMO_ANSWERS[demoNorm(e.q)]||{}).citations||[]});
  renderAdmin();});
}
const e0=id=>escStore.list().find(x=>x.id===id);

/* ---- 질의 현황 ---- */
function adminStats(p){
 const l=askLog.list(),n=l.length,need=l.filter(x=>x.needsOwner).length;
 const by={};l.forEach(x=>{by[x.key]=(by[x.key]||0)+1;});
 const top=Object.entries(by).sort((a,b)=>b[1]-a[1]);const max=top[0]?.[1]||1;
 const qc={};l.forEach(x=>{qc[x.q]=(qc[x.q]||0)+1;});
 p.innerHTML=`<div class="stats">
  <div class="card stat"><small>누적 질의</small><b>${n}</b></div>
  <div class="card stat"><small>AI 즉시 답변</small><b>${n-need}</b></div>
  <div class="card stat"><small>확인 요청 전환</small><b>${n?Math.round(need/n*100):0}%</b></div>
  <div class="card stat"><small>미처리 확인 요청</small><b>${escStore.list().filter(e=>e.status==="open").length}</b></div></div>
  <div class="grid2">
  <section class="card pad"><div class="bh"><span class="bi">${IC.folder}</span><h3>규정별 질의</h3></div>
   ${top.length?top.map(([k,c])=>`<div class="bar"><span>${esc(D[k]?short(D[k].name):k)}</span><i style="width:${c/max*100}%"></i><b>${c}</b></div>`).join(""):'<p class="empty">아직 질의가 없습니다.</p>'}</section>
  <section class="card pad"><div class="bh"><span class="bi">${IC.help}</span><h3>많이 묻는 질문</h3></div>
   ${Object.keys(qc).length?`<ol class="topq">${Object.entries(qc).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([q,c])=>`<li>${esc(q)} <small>${c}회</small></li>`).join("")}</ol>`:'<p class="empty">아직 질의가 없습니다.</p>'}
   <p class="sub">운영 시 이 집계로 홈 화면의 '자주 찾는 질문'을 자동 갱신합니다.</p></section></div>`;
}

/* ---- 변경 이력 ---- */
function adminHist(p){
 const h=regStore.history();
 p.innerHTML=`<section class="card pad"><div class="bh"><span class="bi">${IC.file}</span><h3>규정 변경 이력</h3></div>
  <p class="sub">운영 시 조문 단위 버전(article_version)으로 저장되어, 과거 답변의 근거가 개정되었는지 추적할 수 있습니다.</p>
  ${h.length?`<div class="tblwrap"><table class="atbl"><thead><tr><th>일시</th><th>규정</th><th>내용</th><th>처리자</th></tr></thead><tbody>
  ${h.map(x=>`<tr><td>${new Date(x.at).toLocaleString(lang()==="en"?"en-US":"ko-KR")}</td><td>${esc(x.no)} ${esc(t(short(x.name||"")))}</td><td>${esc(t(x.note))}</td><td>${esc(t(x.by))}</td></tr>`).join("")}</tbody></table></div>`
  :'<p class="empty">아직 변경 이력이 없습니다.</p>'}</section>`;
}

/* ---- 사용자·권한 ---- */
function adminUsers(p){
 p.innerHTML=`<section class="card pad"><div class="bh"><span class="bi">${IC.user}</span><h3>사용자·권한</h3></div>
  <p class="sub">시연용 계정입니다. 운영 시 사내 SSO와 인사 조직정보를 연동하고, 규정별 주관부서 담당자에게 편집 권한을 부여합니다.</p>
  <div class="tblwrap"><table class="atbl"><thead><tr><th>아이디</th><th>이름</th><th>소속</th><th>권한</th><th>가능한 작업</th></tr></thead><tbody>
  ${ACCOUNTS.map(a=>`<tr><td>${esc(a.id)}</td><td>${esc(a.name)}</td><td>${esc(a.dept)}</td><td><span class="pill ${a.role==="admin"?"answered":"open"}">${a.role==="admin"?"규정 관리자":"일반 임직원"}</span></td>
   <td>${a.role==="admin"?"규정 등록·수정·삭제, 해석 지침, 확인 요청 답변, 현황 조회":"규정 열람·검색, AI 질의, 확인 요청"}</td></tr>`).join("")}</tbody></table></div></section>`;
}

/* ---- 규정 체계 점검 ---- */
function adminAudit(p){
 const dupNo={};ORDER.forEach(k=>{(dupNo[D[k].no]=dupNo[D[k].no]||[]).push(k);});
 const dups=Object.entries(dupNo).filter(([,v])=>v.length>1);
 const noOwner=ORDER.filter(k=>!D[k].owner);
 p.innerHTML=`<section class="card pad"><div class="bh"><span class="bi">${IC.check}</span><h3>규정 체계 점검</h3></div>
  <p class="sub">규정을 한 곳에 모으면서 확인된 사항입니다. 번호 중복과 주관부서 누락은 등록 데이터로 자동 점검합니다.</p>
  ${dups.map(([no,ks])=>`<p class="issue"><b>번호 중복 (자동)</b> ${esc(no)}이(가) ${ks.map(k=>esc(short(D[k].name))).join(", ")}에 함께 쓰이고 있습니다.</p>`).join("")}
  ${noOwner.map(k=>`<p class="issue"><b>주관부서 누락 (자동)</b> ${esc(D[k].no)} ${esc(D[k].name)}</p>`).join("")}
  <p class="issue"><b>분류 누락</b> 예산 관리 규정이 8xx 번호를 쓰고 있으나 제11조 업무분류에는 8번 분류가 없습니다. 예산통제는 분류 1의 설명에 포함되어 있습니다.</p>
  <p class="issue"><b>등록일 편중</b> 보안 규정군을 제외한 대부분이 2016~2017년 등록입니다. 게시판 등록일만으로는 최신 개정 여부를 알 수 없습니다.</p>
 </section>`;
}
