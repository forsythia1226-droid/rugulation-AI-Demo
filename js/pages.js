/* 로그인 · 설정 · 입사자 체크리스트 · 내 확인 요청 · 규정 인쇄/다운로드 */

/* ---------- Login ---------- */
function renderLogin(){
 document.body.classList.add("auth");
 $("#view").className="";
 $("#view").innerHTML=`<div class="login">
  <form class="card login-card" id="lf" autocomplete="off">
   <div class="login-brand"><span class="wm"><img class="lt" src="${LOGO_L}" alt="taihan"><img class="dk" src="${LOGO_D}" alt="" aria-hidden="true"></span></div>
   <h2>사내규정 AI 에이전트</h2>
   <p class="login-d">사내 규정은 임직원 전용 정보입니다. 사번 계정으로 로그인해 주세요.</p>
   <label>아이디<input id="lid" required autocomplete="username"></label>
   <label>비밀번호<input id="lpw" type="password" required autocomplete="current-password"></label>
   <p class="login-err" id="lerr" hidden>아이디 또는 비밀번호가 올바르지 않습니다.</p>
   <button class="btn" type="submit">로그인</button>
   <div class="login-demo">
    <b>시연 계정</b>
    <button type="button" data-demo="user">일반 임직원 <span>user / demo1234</span></button>
    <button type="button" data-demo="admin">규정 관리자 <span>admin / admin1234</span></button>
   </div>
   <p class="login-note">시연용 로그인입니다. 운영 시 사내 SSO(통합인증)로 대체합니다.</p>
  </form></div>`;
 const tryLogin=(id,pw)=>{if(session.login(id,pw))go("home");else $("#lerr").hidden=false;};
 $("#lf").onsubmit=e=>{e.preventDefault();tryLogin($("#lid").value.trim(),$("#lpw").value);};
 document.querySelectorAll("[data-demo]").forEach(b=>b.onclick=()=>{const a=ACCOUNTS.find(x=>x.id===b.dataset.demo);$("#lid").value=a.id;$("#lpw").value=a.pw;tryLogin(a.id,a.pw);});
 setTimeout(()=>$("#lid")?.focus(),30);
}

/* ---------- Settings ---------- */
function renderSettings(){
 const v=$("#view");v.className="";
 const s=settings.get(),u=me();
 const seg=(name,opts,cur)=>`<div class="seg">${opts.map(([val,l])=>`<button data-set="${name}" data-val="${val}" aria-pressed="${cur===val}">${l}</button>`).join("")}</div>`;
 v.innerHTML=`<div class="wrap narrow">
  <div class="ph"><h2>설정</h2><p>화면 표시와 AI 응답 방식을 설정합니다. 설정은 이 브라우저에 저장됩니다.</p></div>
  <section class="card pad">
   <div class="bh"><span class="bi">${IC.user}</span><h3>계정</h3></div>
   <dl class="kv"><dt>이름</dt><dd>${esc(u.name)}</dd><dt>소속</dt><dd>${esc(u.dept)}</dd><dt>권한</dt><dd>${u.role==="admin"?"규정 관리자":"일반 임직원"}</dd><dt>로그인</dt><dd>${new Date(u.at).toLocaleString("ko-KR")}</dd></dl>
  </section>
  <section class="card pad">
   <div class="bh"><span class="bi">${IC.gear}</span><h3>화면</h3></div>
   <div class="setrow"><div><b>테마</b><small>시스템을 고르면 PC 설정을 따릅니다</small></div>${seg("theme",[["light","라이트"],["dark","다크"],["system","시스템"]],s.theme)}</div>
   <div class="setrow"><div><b>글자 크기</b><small>규정 원문과 답변 글자 크기</small></div>${seg("font",[["sm","작게"],["md","보통"],["lg","크게"]],s.font)}</div>
  </section>
  <section class="card pad">
   <div class="bh"><span class="bi">${IC.spark}</span><h3>AI 응답</h3></div>
   <div class="setrow"><div><b>응답 방식</b><small>시연 고정: 준비된 질문에 검증된 답변만 표시합니다. 실시간 LLM: 백엔드가 연결된 환경에서만 동작합니다.</small></div>${seg("aiMode",[["demo","시연 고정"],["live","실시간 LLM"]],s.aiMode)}</div>
  </section>
  <section class="card pad">
   <div class="bh"><span class="bi">${IC.bell}</span><h3>알림</h3></div>
   <div class="setrow"><div><b>개정 공지 알림</b><small>헤더 종 아이콘에 새 공지 표시</small></div>${seg("notify",[["on","켜기"],["off","끄기"]],s.notify?"on":"off")}</div>
  </section>
  ${isAdmin()?`<section class="card pad">
   <div class="bh"><span class="bi">${IC.file}</span><h3>시연 데이터</h3></div>
   <div class="setrow"><div><b>초기화</b><small>관리자 화면에서 등록·수정한 규정, 공지, 확인 요청, 해석 지침을 모두 지우고 원래 상태로 되돌립니다.</small></div><button class="danger" id="reset">시연 데이터 초기화</button></div>
  </section>`:""}
 </div>`;
 v.querySelectorAll("[data-set]").forEach(b=>b.onclick=()=>{
  const k=b.dataset.set,val=b.dataset.val;
  settings.set({[k]:k==="notify"?val==="on":val});renderHeader();renderSettings();});
 $("#reset")&&($("#reset").onclick=()=>{if(confirm("시연 데이터를 모두 초기화할까요?")){resetDemoData();location.reload();}});
}

/* ---------- 입사자 체크리스트 (push) ---------- */
const CHECKLIST=[
 {id:"docs",d:0,t:"경력증명서·최종학력증명서·건강진단서 제출",doc:"TES-201",art:"201-7",quote:"최종 합격자는 임용 전까지 경력증명서, 최종학력증명서, 건강진단서를 제출하여야 한다."},
 {id:"security",d:3,t:"보안서약 및 비밀번호 설정 (90일마다 변경)",doc:"TES-212-2",art:"2122-4",quote:"비밀번호는 90일마다 변경하여야 하며 최근 3회 사용한 비밀번호는 재사용할 수 없다."},
 {id:"onboard",d:14,t:"경력사원 온보딩 과정 이수 (회사 소개·사내 규정·정보보안)",doc:"TES-208",art:"208-7",quote:"경력사원은 임용일로부터 2주 이내에 다음 각 호의 온보딩 과정을 이수하여야 한다."},
 {id:"flex",d:25,t:"다음 달 시차출퇴근 신청 (매월 25일까지)",doc:"TES-203",art:"203-13",quote:"시차출퇴근 신청은 매월 25일까지 익월분을 신청하며 팀장 승인으로 확정된다."},
 {id:"mentor",d:30,t:"멘토 면담 (월 1회 이상, 3개월간)",doc:"TES-208",art:"208-8",quote:"멘토는 월 1회 이상 면담을 실시하고 결과를 인사팀에 제출한다."},
 {id:"probation",d:60,t:"수습기간 종료 평가 (경력직 2개월)",doc:"TES-201",art:"201-8",quote:"경력채용자의 수습기간은 2개월로 하되, 동종업계 경력 5년 이상인 자는 대표이사 승인으로 수습기간을 면제할 수 있다."},
 {id:"career",d:90,t:"경력 인정 결과 확인 · 이의 제기 기한",doc:"TES-201",art:"201-10",quote:"경력 인정에 대한 이의는 임용일부터 3개월 이내에 인사팀에 제기할 수 있다."},
 {id:"legal",d:90,t:"법정의무교육 이수 (성희롱·괴롭힘 예방 등)",doc:"TES-208",art:"208-11",quote:"임직원은 지정된 기한 내에 교육을 이수하여야 한다."},
 {id:"approval",d:0,t:"전자결재 원칙 숙지: 서면·대면 보고 후에도 전자결재 상신 필수",doc:"TES-105",art:"105-15",quote:"사전에 서면 또는 대면으로 보고한 사항이라 하더라도 전자결재 상신을 생략할 수 없다."},
 {id:"points",d:30,t:"선택적 복지포인트 확인 (입사 연도는 잔여 월수 비례 배정)",doc:"TES-201-1B",art:"2011B-19",quote:"연도 중 입사자는 잔여 월수에 비례하여 배정한다."}];
function renderChecklist(){
 const v=$("#view");v.className="";
 const st=checkStore.get(),start=st.start||new Date().toISOString().slice(0,10),done=st.done||{};
 const due=d=>{const x=new Date(start);x.setDate(x.getDate()+d);return x;};
 const today=new Date();today.setHours(0,0,0,0);
 const items=CHECKLIST.map(c=>({...c,due:due(c.d)})).sort((a,b)=>a.due-b.due);
 const n=items.filter(c=>done[c.id]).length;
 v.innerHTML=`<div class="wrap narrow">
  <div class="ph"><h2>입사자 체크리스트</h2><p>경력직은 무엇을 모르는지 모릅니다. 입사일을 기준으로 규정상 해야 할 일과 기한을 먼저 알려드립니다.</p></div>
  <section class="card pad">
   <div class="ckhead"><label>입사일 <input type="date" id="start" value="${start}"></label>
    <div class="ckprog"><span style="width:${Math.round(n/items.length*100)}%"></span></div><b>${n} / ${items.length} 완료</b></div>
   <ul class="cklist">${items.map(c=>{const late=!done[c.id]&&c.due<today;
    return `<li class="${done[c.id]?"done":""}${late?" late":""}">
     <label><input type="checkbox" data-ck="${c.id}" ${done[c.id]?"checked":""}><span>${esc(c.t)}</span></label>
     <span class="ckdue">${late?"기한 경과 · ":""}${c.due.toLocaleDateString("ko-KR",{month:"long",day:"numeric"})}</span>
     <button class="cklink" data-ckart="${c.id}">${esc(D[c.doc]?D[c.doc].no:c.doc)} 근거 보기</button></li>`;}).join("")}</ul>
  </section>
 </div>`;
 $("#start").onchange=e=>{checkStore.set({...st,start:e.target.value});renderChecklist();};
 v.querySelectorAll("[data-ck]").forEach(b=>b.onchange=()=>{const d={...done,[b.dataset.ck]:b.checked};checkStore.set({...st,start,done:d});renderChecklist();});
 v.querySelectorAll("[data-ckart]").forEach(b=>b.onclick=()=>{const c=CHECKLIST.find(x=>x.id===b.dataset.ckart);openNotice({doc:c.doc,art:c.art,quote:c.quote});});
}

/* ---------- 내 확인 요청 ---------- */
function renderMyReq(){
 const v=$("#view");v.className="";
 const mine=escStore.list().filter(e=>e.user===me().name);
 v.innerHTML=`<div class="wrap narrow">
  <div class="ph"><h2>내 확인 요청</h2><p>AI가 규정만으로 답하지 못해 주관부서에 확인을 요청한 질문입니다. 답변이 등록되면 여기에 표시됩니다.</p></div>
  <section class="card pad">${mine.length?`<ul class="reqlist">${mine.map(e=>`<li>
   <div class="reqtop"><span class="pill ${e.status}">${e.status==="answered"?"답변 완료":"확인 중"}</span><small>${esc(e.regName)} · ${esc(e.owner)} · ${new Date(e.at).toLocaleString("ko-KR")}</small></div>
   <p class="q">${esc(e.q)}</p>
   ${e.need?`<p class="need">${esc(e.need)}</p>`:""}
   ${e.answer?`<div class="ans"><b>${esc(e.answeredBy||e.owner)} 답변</b>${esc(e.answer)}</div>`:""}
   <button class="cklink" data-reask="${e.id}">규정 창구에서 다시 묻기 →</button></li>`).join("")}</ul>`
   :`<p class="empty">아직 확인 요청한 질문이 없습니다. 규정 창구에서 AI가 "확인 요청" 버튼을 보여주면 이곳에 쌓입니다.</p>`}</section>
 </div>`;
 v.querySelectorAll("[data-reask]").forEach(b=>b.onclick=()=>{const e=mine.find(x=>x.id===b.dataset.reask);if(D[e.key])openGroup(D[e.key].group,e.q,D[e.docKey]?e.docKey:undefined);});
}

/* ---------- 규정 인쇄 / 다운로드 ---------- */
function exportHTML(k){
 const d=D[k],css=`body{font-family:"Noto Sans KR","Malgun Gothic",sans-serif;color:#0f172a;max-width:780px;margin:40px auto;padding:0 24px;line-height:1.75;font-size:14px}
h1{font-size:22px;margin:0 0 4px}.sub{color:#64748b;font-size:12.5px;margin:0 0 6px}.warn{font-size:11.5px;color:#92400e;background:#fffbeb;border:1px solid #fde68a;padding:6px 10px;border-radius:6px;margin:0 0 24px}
h2{font-size:15px;margin:28px 0 8px;padding-bottom:4px;border-bottom:2px solid #0f172a}h3{font-size:14px;margin:18px 0 4px}p{margin:2px 0}
table{border-collapse:collapse;width:100%;margin:8px 0;font-size:12.5px}th,td{border:1px solid #cbd5e1;padding:5px 8px;text-align:left}th{background:#f1f5f9}
.xref{font-size:12px;color:#475569}.foot{margin-top:40px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:8px}
@media print{body{margin:0}h2,h3{break-after:avoid}table,.art{break-inside:avoid}}`;
 const body=(d.chapters||[]).map(ch=>`<h2>${esc(ch.t)}</h2>`+ch.arts.map(a=>`<div class="art"><h3>${esc(a.n)}(${esc(a.h)})</h3>
  ${a.body.map(b=>b==="TABLE"?tableHTML(a.table):`<p>${esc(b)}</p>`).join("")}${a.xref?`<p class="xref">연계: ${esc(a.xref)}</p>`:""}</div>`).join("")).join("");
 return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>${esc(d.no)} ${esc(d.name)}</title><style>${css}</style></head><body>
<h1>${esc(short(d.name))}</h1><p class="sub">${esc(d.no)} · 시행 ${esc(d.effective)} · 주관 ${esc(d.owner)}</p>
<p class="warn">사내 한정 · 시연용 가상 조문입니다. 출력·저장본은 최신 개정이 반영되지 않을 수 있으니 시스템에서 최신본을 확인하십시오.</p>
${body||"<p>등록된 조문이 없습니다.</p>"}
<p class="foot">${esc(me()?.dept||"")} ${esc(me()?.name||"")} · ${new Date().toLocaleString("ko-KR")} 출력</p></body></html>`;
}
function printDoc(k){
 const f=document.createElement("iframe");f.style.cssText="position:fixed;right:0;bottom:0;width:0;height:0;border:0";
 document.body.appendChild(f);
 f.srcdoc=exportHTML(k);
 f.onload=()=>{f.contentWindow.focus();f.contentWindow.print();setTimeout(()=>f.remove(),1500);};
}
function downloadDoc(k){
 const d=D[k],blob=new Blob([exportHTML(k)],{type:"text/html;charset=utf-8"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);
 a.download=`${d.no}_${short(d.name)}.html`.replace(/[\\/:*?"<>|\s]+/g,"_");
 document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);
}

go("home");
