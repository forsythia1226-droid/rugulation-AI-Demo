/* 관리자 페이지 (나의 업무): 규정별 담당자 지정 + 개정 이력 등록(현행 조문 반영·원본 파일) + 첨부 파일
 * - 담당자 지정: 규정 관리자(admin)만 가능
 * - 파일 업로드·삭제: 해당 규정의 정/부 담당자 또는 규정 관리자
 * - 파일은 브라우저 IndexedDB에 저장(시연용). 운영 시 사내 파일 서버/문서관리 API로 대체
 */

/* ---- 팀별 구성원 (시연용 가상 인원) ---- */
const STAFF={
 "경영기획팀":["이순신 과장","정다은 대리","한지훈 차장"],"인사팀":["박서연 과장","최민호 대리","윤하늘 차장"],
 "IT혁신팀":["강태윤 과장","오세린 대리","임도현 차장"],"경영지원팀":["서지우 과장","배준영 대리"],
 "경영개선팀":["문가영 차장","송재원 대리"],"법무팀":["홍예린 과장","남궁현 대리"],
 "자금팀":["유승호 과장","신아름 대리"],"재무기획팀":["전민석 과장","황보라 대리"],"내부회계관리팀":["노지환 과장","구하은 대리"],
 "CP팀":["백서준 과장","양소희 대리"],"연구기획팀":["안재현 책임","류시아 선임"],"품질보증팀":["손우진 과장","차유나 대리"],
 "구매팀":["표성민 과장","엄지수 대리"]};
const staffOf=team=>STAFF[team]||[];
const nameOnly=s=>s.split(" ")[0];

/* ---- 담당자 지정 저장 ---- */
const ownerStore={
 all(){return ST.get("regOwners",{});},
 get(k){const a=ownerStore.all()[k];if(a)return a;
  const s=staffOf(D[k]?.owner);return {main:s[0]||"",sub:s[1]||""};},   // 미지정 시 팀 첫 번째 인원을 기본값으로
 set(k,v){const a=ownerStore.all();a[k]=v;ST.set("regOwners",a);}
};
const canEditFiles=k=>{if(isAdmin())return true;const o=ownerStore.get(k),n=me()?.name;return [o.main,o.sub].some(x=>x&&nameOnly(x)===n);};

/* ---- 파일 저장 (IndexedDB) ---- */
const fileDB={
 db:null,
 open(){if(this.db)return Promise.resolve(this.db);
  return new Promise((res,rej)=>{const r=indexedDB.open("reg-files",1);
   r.onupgradeneeded=()=>{const s=r.result.createObjectStore("files",{keyPath:"id"});s.createIndex("key","key");};
   r.onsuccess=()=>{this.db=r.result;res(this.db);};r.onerror=()=>rej(r.error);});},
 async tx(mode,fn){const db=await this.open();return new Promise((res,rej)=>{const t=db.transaction("files",mode);const out=fn(t.objectStore("files"));
  t.oncomplete=()=>res(out&&out.result!==undefined?out.result:out);t.onerror=()=>rej(t.error);});},
 list(key){return this.tx("readonly",s=>s.index("key").getAll(key));},
 all(){return this.tx("readonly",s=>s.getAll());},
 put(f){return this.tx("readwrite",s=>s.put(f));},
 get(id){return this.tx("readonly",s=>s.get(id));},
 del(id){return this.tx("readwrite",s=>s.delete(id));}
};
const logHist=(k,note)=>{const h=regStore.history();h.unshift({key:k,no:D[k].no,name:D[k].name,note,by:me().name,at:new Date().toISOString()});ST.set("regHistory",h);};
const FILE_MAX=10*1024*1024;
const fmtSize=b=>b<1024?b+"B":b<1048576?(b/1024).toFixed(0)+"KB":(b/1048576).toFixed(1)+"MB";

let mgSel=null,mgMine=false,mgQ="",mgTok=0;
async function renderManage(){
 const tok=++mgTok;
 const files=await fileDB.all().catch(()=>[]);
 if(tok!==mgTok)return;
 const v=$("#view");v.className="";
 const cnt={};files.forEach(f=>{cnt[f.key]=(cnt[f.key]||0)+1;});
 const q=mgQ.toLowerCase();
 const rows=ORDER.filter(k=>(!mgMine||canEditFiles(k))&&(!q||(D[k].no+" "+D[k].name+" "+D[k].owner).toLowerCase().includes(q)));
 if(!rows.includes(mgSel))mgSel=rows[0]||null;
 v.innerHTML=`<div class="wrap page">
  ${pageHead("관리자 페이지","규정별 담당자를 지정하고 개정 이력과 원본 파일을 관리합니다.",`담당 규정 <b>${ORDER.filter(canEditFiles).length}</b>건`)}
  <div class="mg">
   <section class="card mg-list">
    <div class="atool"><div class="sbar sm">${IC.search}<input id="mgq" placeholder="규정·담당팀 검색" value="${esc(mgQ)}"></div></div>
    <label class="chk mg-mine"><input type="checkbox" id="mgmine" ${mgMine?"checked":""}> 내가 담당하는 규정만</label>
    <div class="mg-rows">${rows.map(k=>{const o=ownerStore.get(k);return `<button class="mg-row" data-mg="${k}" aria-current="${k===mgSel}">
     <span class="dno">${esc(D[k].no)}</span><span class="mg-nm">${esc(short(D[k].name))}<small>${esc(D[k].owner)} · ${esc(o.main?nameOnly(o.main):"담당자 미지정")}</small></span>
     ${cnt[k]?`<span class="badge">${cnt[k]}</span>`:""}</button>`;}).join("")||'<p class="empty">해당하는 규정이 없습니다.</p>'}</div>
   </section>
   <div id="mgd"></div>
  </div>
 </div>`;
 $("#mgq").oninput=e=>{mgQ=e.target.value;const p=e.target.selectionStart;renderManage().then(()=>{const i=$("#mgq");i.focus();i.setSelectionRange(p,p);});};
 $("#mgmine").onchange=e=>{mgMine=e.target.checked;renderManage();};
 v.querySelectorAll("[data-mg]").forEach(b=>b.onclick=()=>{mgSel=b.dataset.mg;renderManage();});
 if(mgSel)await renderManageDetail($("#mgd"),mgSel,tok);
}
async function renderManageDetail(p,k,tok){
 const d=D[k],o=ownerStore.get(k),staff=staffOf(d.owner),admin=isAdmin(),edit=canEditFiles(k);
 const files=(await fileDB.list(k).catch(()=>[])).sort((a,b)=>b.at.localeCompare(a.at));
 const vers=histStore.list(k),artList=arts(k);
 if(tok!==mgTok)return;
 const sel=(id,val)=>`<select id="${id}" ${admin?"":"disabled"}><option value="">미지정</option>${staff.map(s=>`<option ${s===val?"selected":""}>${esc(s)}</option>`).join("")}</select>`;
 p.innerHTML=`<section class="card pad">
  <div class="bh"><span class="bi">${IC.file}</span><h3>${esc(d.no)} ${esc(d.name)}</h3><button class="more" data-open="${k}">규정 보기</button></div>
  <p class="sub">주관 ${esc(d.owner)} · 시행 ${esc(d.effective)}</p>
  <h4 class="mg-h">담당자</h4>
  <div class="form mg-owner">
   <label>정 담당자${sel("mg-main",o.main)}</label>
   <label>부 담당자${sel("mg-sub",o.sub)}</label>
   ${admin?`<div class="mg-save"><button class="save" id="mgsave">담당자 저장</button><span class="saved hidden" id="mgok">저장했습니다</span></div>`:""}
  </div>
  <p class="sub">${admin?"규정 관리자만 담당자를 지정할 수 있습니다. 지정된 담당자는 이 규정의 개정 이력과 파일을 등록·삭제할 수 있습니다.":`담당자 지정은 규정 관리자가 합니다.${edit?" 회원님은 이 규정의 담당자입니다.":""}`}</p>

  <h4 class="mg-h">개정 이력 <small>${vers.length}회</small><button class="more" data-open="${k}">규정 창구에서 보기</button></h4>
  ${vers.length?`<ul class="rv-list">${vers.map((v,vi)=>`<li><span class="rv-date">${esc(v.date)}</span><span class="ctype ${v.type==="제정"?"new":v.type==="폐지"?"del":"mod"}">${esc(v.type)}</span>${vi===0?'<span class="hv-cur">현행</span>':""}
   <span class="rv-r">${esc(v.reason||"-")}<small>시행 ${esc(v.eff||"-")} · 변경 조문 ${(v.changes||[]).length}건${v.fileName?" · 파일 "+esc(v.fileName):""}${v.by?" · "+esc(v.by):""}</small></span>
   ${edit?`<button class="ghost sm del" data-vdel="${v.id}">삭제</button>`:""}</li>`).join("")}</ul>`:'<p class="empty">등록된 개정 이력이 없습니다.</p>'}

  ${edit?`<h4 class="mg-h">개정 이력 등록</h4>
  <form class="mg-up" id="mgup">
   <div class="form mg-meta">
    <label>구분<select id="mgkind">${["개정","제정","폐지","참고"].map(x=>`<option value="${x}">${t(x)}</option>`).join("")}</select></label>
    <label>개정일<input id="mgdate" value="${new Date().toISOString().slice(0,10).replace(/-/g,".")}"></label>
    <label>시행일<input id="mgeff" value="${new Date().toISOString().slice(0,10).replace(/-/g,".")}"></label>
    <label class="w3">개정 사유<input id="mgnote" placeholder="${t("예: 제14조 야근 식대 한도 조정")}"></label>
   </div>
   ${artList.length?`<div class="rv-rows" id="rvrows"></div>
   <button type="button" class="ghost sm" id="rvadd">+ 바뀐 조문 추가</button>`:'<p class="sub">이 규정은 조문이 적재되지 않아 원본 파일과 개정 사유만 기록합니다.</p>'}
   <label class="mg-drop" id="mgdrop"><input type="file" id="mgfile" accept=".pdf,.hwp,.hwpx,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip">
    <span>${IC.down}<b>개정 원본 파일 (선택)</b><small>PDF · HWP · Word 등 파일당 10MB 이하 · 끌어다 놓거나 클릭</small></span><em id="mgfname"></em></label>
   <div class="formbar">${artList.length?'<label class="chk"><input type="checkbox" id="mgapply" checked> 현행 조문에 반영</label>':""}<label class="chk"><input type="checkbox" id="mgntc" checked> 개정 공지로 게시</label><button class="save" type="submit">개정 이력 등록</button></div>
   <p class="login-err" id="mgerr" hidden></p>
  </form>`:`<p class="empty">이 규정의 담당자만 개정 이력을 등록할 수 있습니다.</p>`}

  <h4 class="mg-h">첨부 파일 <small>${files.length}건</small></h4>
  ${files.length?`<ul class="mg-files">${files.map(f=>`<li>
   <span class="pill ${f.kind==="폐지"?"":"answered"}">${esc(t(f.kind))}</span>
   <span class="mg-fn"><b>${esc(f.name)}</b><small>${fmtSize(f.size)} · ${esc(t(f.note||"-"))} · ${t("시행")} ${esc(f.eff||"-")} · ${esc(t(f.by))} · ${new Date(f.at).toLocaleString(lang()==="en"?"en-US":"ko-KR")}</small></span>
   <button class="ghost sm" data-fdl="${f.id}">${t("다운로드")}</button>${edit?`<button class="ghost sm del" data-fdel="${f.id}">${t("삭제")}</button>`:""}</li>`).join("")}</ul>`
   :'<p class="empty">아직 올라온 파일이 없습니다.</p>'}
 </section>`;
 if(admin)$("#mgsave").onclick=()=>{if($("#mg-main").value&&$("#mg-main").value===$("#mg-sub").value){alert(t("정 담당자와 부 담당자는 다른 사람이어야 합니다."));return;}
  ownerStore.set(k,{main:$("#mg-main").value,sub:$("#mg-sub").value});
  const h=regStore.history();h.unshift({key:k,no:d.no,name:d.name,note:`담당자 지정: 정 ${$("#mg-main").value||"-"} / 부 ${$("#mg-sub").value||"-"}`,by:me().name,at:new Date().toISOString()});ST.set("regHistory",h);
  renderManage();};
 p.querySelectorAll("[data-fdl]").forEach(b=>b.onclick=async()=>{const f=await fileDB.get(b.dataset.fdl);
  const a=document.createElement("a");a.href=URL.createObjectURL(f.blob);a.download=f.name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);});
 p.querySelectorAll("[data-fdel]").forEach(b=>b.onclick=async()=>{const f=await fileDB.get(b.dataset.fdel);
  if(!confirm(`'${f.name}' ${t("파일을 삭제할까요?")}`))return;await fileDB.del(f.id);
  const h=regStore.history();h.unshift({key:k,no:d.no,name:d.name,note:`파일 삭제: ${f.name}`,by:me().name,at:new Date().toISOString()});ST.set("regHistory",h);
  renderManage();});
 if(!edit)return;
 const input=$("#mgfile"),drop=$("#mgdrop");
 input.onchange=()=>{$("#mgfname").textContent=input.files[0]?`${input.files[0].name} (${fmtSize(input.files[0].size)})`:"";};
 drop.ondragover=e=>{e.preventDefault();drop.classList.add("over");};
 drop.ondragleave=()=>drop.classList.remove("over");
 drop.ondrop=e=>{e.preventDefault();drop.classList.remove("over");if(e.dataTransfer.files[0]){input.files=e.dataTransfer.files;input.onchange();}};
 p.querySelectorAll("[data-vdel]").forEach(b=>b.onclick=()=>{const v=histStore.get(b.dataset.vdel);
  if(!confirm(`${v.date} ${t(v.type)} ${t("이력을 삭제할까요? (현행 조문은 바뀌지 않습니다)")}`))return;
  histStore.remove(v.id);logHist(k,`개정 이력 삭제: ${v.date} ${v.type}`);renderManage();});
 const rows=$("#rvrows");
 const lineOpts=id=>{const a=artList.find(x=>x.id===id);return `<option value="__new">(새 문단 신설)</option>`+(a?a.body.filter(b=>b!=="TABLE").map((b,i)=>{const v=t(b);return `<option value="${i}">${esc(v.length>60?v.slice(0,60)+"…":v)}</option>`;}).join(""):"");};
 const addRow=()=>{const r=document.createElement("div");r.className="rv-row";
  r.innerHTML=`<div class="rv-sel"><select class="rv-art">${artList.map(a=>`<option value="${a.id}">${esc(t(a.n))}(${esc(t(a.h))})</option>`).join("")}</select>
   <select class="rv-line"></select><button type="button" class="ghost sm del rv-x">삭제</button></div>
   <div class="rv-pair"><label>개정 전<textarea class="rv-before" rows="2" readonly></textarea></label>
   <label>개정 후 <small>비워 두면 이 문단 삭제</small><textarea class="rv-after" rows="2"></textarea></label></div>`;
  const art=r.querySelector(".rv-art"),line=r.querySelector(".rv-line"),bf=r.querySelector(".rv-before"),af=r.querySelector(".rv-after");
  const fill=()=>{const a=artList.find(x=>x.id===art.value),b=a.body.filter(x=>x!=="TABLE");const v=line.value==="__new"?"":b[+line.value]||"";
   bf.dataset.src=v;af.dataset.src=v;bf.value=t(v);af.value=t(v);};
  art.onchange=()=>{line.innerHTML=lineOpts(art.value);line.value=line.options.length>1?"0":"__new";fill();};
  line.onchange=fill;r.querySelector(".rv-x").onclick=()=>r.remove();
  rows.appendChild(r);art.onchange();};
 if(rows){addRow();$("#rvadd").onclick=addRow;}
 $("#mgup").onsubmit=async e=>{e.preventDefault();const f=input.files[0],err=$("#mgerr");err.hidden=true;
  const kind=$("#mgkind").value,note=$("#mgnote").value.trim(),eff=$("#mgeff").value.trim(),date=$("#mgdate").value.trim();
  if(!note){err.textContent=t("개정 사유를 입력해 주세요.");err.hidden=false;return;}
  const changes=rows?[...rows.querySelectorAll(".rv-row")].map(r=>{
    const af=r.querySelector(".rv-after"),src=(r.querySelector(".rv-before").dataset.src||"").trim(),typed=af.value.trim();
    /* 화면에는 번역문을 보여주므로, 사용자가 고치지 않았으면 저장은 원문 그대로 한다 */
    return{art:r.querySelector(".rv-art").value,before:src||null,after:(typed===t(src).trim()?src:typed)||null};})
   .filter(c=>(c.before||c.after)&&c.before!==c.after):[];
  if(kind==="개정"&&!changes.length&&!f){err.textContent=t("바뀐 조문이나 원본 파일 중 하나는 있어야 합니다.");err.hidden=false;return;}
  if(f&&f.size>FILE_MAX){err.textContent=t("파일당 10MB까지 올릴 수 있습니다.");err.hidden=false;return;}
  let fileId=null;
  if(f){fileId=Date.now().toString(36)+Math.random().toString(36).slice(2,6);
   try{await fileDB.put({id:fileId,key:k,name:f.name,size:f.size,type:f.type,blob:f,kind,note,eff,by:me().name,at:new Date().toISOString()});}
   catch(x){err.textContent=t("저장 공간이 부족해 업로드하지 못했습니다.");err.hidden=false;return;}}
  let applied=0;
  if(changes.length&&$("#mgapply")?.checked){applied=applyRevision(k,changes,kind==="참고"?null:eff);regStore.save(D[k],`개정 반영: ${note}`,me().name);}
  histStore.add({key:k,date,eff,type:kind,reason:note,changes,fileId,fileName:f?f.name:"",by:me().name});
  logHist(k,`개정 이력 등록(${kind}): ${note}${applied?` · 현행 조문 ${applied}곳 반영`:""}${f?" · 파일 "+f.name:""}`);
  if($("#mgntc").checked&&kind!=="참고"){const t=new Date();
   noticeStore.add({title:`${short(d.name)} ${kind} 안내`,owner:d.owner,date:`'${String(t.getFullYear()).slice(2)}.${String(t.getMonth()+1).padStart(2,"0")}.${String(t.getDate()).padStart(2,"0")} 부`,
    items:(changes.length?changes.map(c=>{const a=artList.find(x=>x.id===c.art);return{ref:`${d.no} ${a?a.n:""}`,text:note,doc:k,art:c.art,quote:c.after||""};}):[{ref:d.no,text:note,doc:k}])});}
  renderManage();};
}
