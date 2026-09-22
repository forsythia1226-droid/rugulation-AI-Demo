/* 시연용 저장 계층 (브라우저 localStorage)
 * - 운영 전환 시 이 파일의 함수들이 백엔드 API 호출로 대체된다.
 * - 관리자 화면에서 등록·수정한 규정을 regulations.js 원본 위에 덮어쓴다.
 * - 로그인은 화면 흐름 시연용이다. 정적 페이지라 실제 보안 수단이 아니며 운영 시 사내 SSO로 대체한다.
 */
const ST={
 get(k,d){try{const v=localStorage.getItem("rg:"+k);return v?JSON.parse(v):d;}catch{return d;}},
 set(k,v){try{localStorage.setItem("rg:"+k,JSON.stringify(v));}catch{}},
 del(k){try{localStorage.removeItem("rg:"+k);}catch{}}
};

/* ---- 계정 (시연용) ---- */
const ACCOUNTS=[
 {id:"user",pw:"demo1234",name:"이순신",dept:"경영기획팀",role:"user"},
 {id:"admin",pw:"admin1234",name:"김민지",dept:"경영기획팀 규정관리",role:"admin"}];
const session={
 get(){return ST.get("session",null);},
 login(id,pw){const a=ACCOUNTS.find(x=>x.id===id&&x.pw===pw);if(!a)return null;
  const s={id:a.id,name:a.name,dept:a.dept,role:a.role,at:new Date().toISOString()};ST.set("session",s);return s;},
 logout(){ST.del("session");}
};

/* ---- 설정 ---- */
const SETTINGS_DEFAULT={theme:"light",font:"md",aiMode:"demo",notify:true};
const settings={
 get(){return Object.assign({},SETTINGS_DEFAULT,ST.get("settings",{}));},
 set(p){const s=Object.assign(settings.get(),p);ST.set("settings",s);applySettings();return s;}
};
function applySettings(){
 const s=settings.get(),r=document.documentElement;
 if(s.theme==="system")r.removeAttribute("data-theme");else r.setAttribute("data-theme",s.theme);
 r.dataset.font=s.font;
}

/* ---- 규정 편집 오버레이 ---- */
const BASE_KEYS=new Set(Object.keys(D));
const regStore={
 edits(){return ST.get("regEdits",{});},
 deleted(){return ST.get("regDeleted",[]);},
 history(){return ST.get("regHistory",[]);},
 save(obj,note,by){
  const e=regStore.edits();e[obj.key]=obj;ST.set("regEdits",e);
  ST.set("regDeleted",regStore.deleted().filter(k=>k!==obj.key));
  const h=regStore.history();h.unshift({key:obj.key,no:obj.no,name:obj.name,note:note||"수정",by:by||"",at:new Date().toISOString()});
  ST.set("regHistory",h.slice(0,100));
 },
 remove(key,by){
  const e=regStore.edits();const d=D[key];delete e[key];ST.set("regEdits",e);
  if(BASE_KEYS.has(key)){const del=regStore.deleted();if(!del.includes(key))del.push(key);ST.set("regDeleted",del);}
  const h=regStore.history();h.unshift({key,no:d?d.no:key,name:d?d.name:"",note:"삭제",by:by||"",at:new Date().toISOString()});ST.set("regHistory",h.slice(0,100));
 },
 isEdited(key){return !!regStore.edits()[key];},
 reset(){["regEdits","regDeleted","regHistory"].forEach(ST.del);}
};
(function applyRegOverlay(){
 Object.values(regStore.edits()).forEach(o=>{D[o.key]=Object.assign({group:o.parent||o.key},o);});
 regStore.deleted().forEach(k=>{delete D[k];});
})();

/* ---- 개정 공지(관리자 등록분) ---- */
const noticeStore={
 list(){return ST.get("notices",[]);},
 add(n){const l=noticeStore.list();l.unshift(n);ST.set("notices",l.slice(0,20));}
};

/* ---- 확인 요청 / 질의 로그 ---- */
const escStore={
 list(){return ST.get("escalations",[]);},
 add(e){const l=escStore.list();l.unshift(Object.assign({id:Date.now().toString(36),status:"open",at:new Date().toISOString()},e));ST.set("escalations",l.slice(0,100));},
 answer(id,text,by){const l=escStore.list();const e=l.find(x=>x.id===id);if(!e)return null;
  e.status="answered";e.answer=text;e.answeredBy=by;e.answeredAt=new Date().toISOString();ST.set("escalations",l);return e;}
};
const askLog={
 list(){return ST.get("askLog",[]);},
 add(e){const l=askLog.list();l.unshift(Object.assign({at:new Date().toISOString()},e));ST.set("askLog",l.slice(0,300));}
};
/* 주관부서가 답한 질문 → 다음 질의 때 바로 답변 (확인 요청 루프 닫기) */
const ownerAnswers={
 all(){return ST.get("ownerAnswers",{});},
 put(q,v){const a=ownerAnswers.all();a[demoNorm(q)]=v;ST.set("ownerAnswers",a);},
 get(q){return ownerAnswers.all()[demoNorm(q)]||null;}
};
/* 입사자 체크리스트 진행 상태 */
const checkStore={get(){return ST.get("checklist",{});},set(v){ST.set("checklist",v);}};

function resetDemoData(){
 regStore.reset();try{indexedDB.deleteDatabase("reg-files");}catch{}
 ["regOwners","noticeRead","regVersions","regVersionsDel","notices","escalations","askLog","ownerAnswers","checklist","qlog"].forEach(ST.del);
 try{localStorage.removeItem("qlog");Object.keys(localStorage).filter(k=>k.startsWith("rp:")).forEach(k=>localStorage.removeItem(k));}catch{}
}
applySettings();
