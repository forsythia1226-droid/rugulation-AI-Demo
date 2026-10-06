/* Gemini 연동 (실시간 AI 응답)
 * - 호출 경로 2가지
 *   1) 프록시(권장): 사내망/로컬에서 server/proxy.mjs 를 띄우고 그 주소를 설정에 입력한다.
 *      API 키는 서버의 환경변수(GEMINI_API_KEY)에만 두므로 브라우저·소스코드에 키가 남지 않는다.
 *   2) 직접 호출: 설정 화면에 입력한 키로 브라우저에서 직접 호출한다(그 브라우저에만 저장).
 *      GitHub Pages 같은 정적 호스팅에서는 키를 숨길 수 없으므로 시연·테스트용으로만 쓴다.
 * - 실패(네트워크·쿼터·차단 등) 시 예외를 던지고, 호출 측에서 준비된 답변(시연 모드)으로 자동 전환한다.
 */
const AI_ORG="대한전선";
const GEMINI_DEFAULT_MODEL="gemini-3.5-flash";   /* 무료 등급 사용 가능 모델. AI Studio에서 최신 목록 확인 */
const GEMINI_REFUSAL=`죄송합니다. 저는 ${AI_ORG} 사내규정 안내 AI 에이전트입니다. 사내 규정과 관련된 문의를 입력해 주세요.`;

function aiCfg(){
 const env=(typeof window!=="undefined"&&window.__ENV)||{},s=settings.get();
 return{
  proxy:String(s.aiProxy||env.GEMINI_PROXY||"").trim().replace(/\/+$/,""),
  key:String(s.aiKey||env.GEMINI_API_KEY||"").trim(),
  model:String(s.aiModel||env.GEMINI_MODEL||GEMINI_DEFAULT_MODEL).trim()};
}
const geminiReady=()=>{const c=aiCfg();return !!(c.proxy||c.key);};

/* ---- System Prompt: 역할·출처 명시, 가드레일, 출력 포맷 ---- */
function geminiSystemPrompt(head,corpus,guide){
 return `너는 ${AI_ORG} 사내규정 안내 AI 에이전트이다.

[역할과 출처]
- 반드시 아래 [사내 규정 데이터]만을 근거로 답변한다. 데이터에 없는 내용은 추측하거나 지어내지 않는다.
- 답변에는 항상 근거가 된 출처 조항(규정명과 조 번호)을 명시한다.
- 데이터로 확정할 수 없으면 "규정만으로 확정할 수 없습니다"라고 밝히고 ${head.owner} 확인을 안내한다.
- 금액·일수·기한은 데이터에 적힌 숫자를 그대로 쓴다.

[가드레일]
- 사내 규정과 관련 없는 질문(일상 대화, 주식, 날씨, 타사 정보, 개인 신상 등)에는 다른 말을 덧붙이지 말고 아래 문장만 그대로 출력한다.
${GEMINI_REFUSAL}

[출력 형식] 아래 규칙을 반드시 지킨다. 어기면 안 된다.
- 머리말·소제목·번호목록·글머리표·이모지·마크다운 기호를 쓰지 않는다. 줄바꿈 없는 한 문단으로만 쓴다.
- 3~5문장, 한국어 존댓말. 전체 400자 이내.
- 첫 문장에 결론을 쓴다. 질문이 "얼마냐"면 금액을, "며칠이냐"면 일수를, "되느냐"면 가능 여부를 먼저 말한다.
- 근거는 문장 안에 "제7조", "별표1"처럼 자연스럽게 섞어 쓴다. 조문 번호를 괄호로 몰아 쓰지 않는다.
- 금액·일수·기한·비율은 데이터에 적힌 숫자를 그대로 쓴다. 반올림하거나 바꾸지 않는다.
- 마지막 문장에는 신청 절차, 기한, 주의사항, 함께 볼 규정 중 질문에 필요한 것을 적는다.
- 데이터로 확정할 수 없는 부분은 그 사실을 문장으로 밝히고 ${head.owner} 확인을 안내한다.

[좋은 답변 예시] 이 문체와 길이를 따른다.
국내출장비 380만원은 부문장 전결입니다. 제7조 표에서 국내출장비는 200만원 초과 1,000만원 이하 구간이 부문장 전결이므로 팀장을 거쳐 부문장까지 상신하면 됩니다. 한도를 피하려고 출장비를 나눠 기안하는 것은 제12조에 따라 금지되며, 같은 목적으로 3개월 안에 반복 집행하면 합계액으로 전결권자를 정합니다. 출장명령은 별도로 출장 및 여비규정 제5조 절차를 따릅니다.

[규정 주관부서가 작성한 해석 지침 — 규정 원문보다 먼저 반영]
${guide||"(없음)"}

[사내 규정 데이터] (${head.no} ${head.name}, 주관 ${head.owner}, 시행 ${head.effective})
${corpus}`;
}

/* ---- 호출 ---- */
/* 설정된 모델명이 더 이상 제공되지 않으면 조용히 실패한다.
 * 그때 계정에서 쓸 수 있는 모델 목록을 받아 생성 가능한 모델로 자동 교체한다. */
let GEMINI_RESOLVED=null;
async function geminiPickModel(key){
 const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`);
 if(!r.ok)throw new Error(`모델 목록 조회 실패 ${r.status}`);
 const j=await r.json();
 const usable=(j.models||[]).filter(m=>(m.supportedGenerationMethods||[]).includes("generateContent"))
  .map(m=>String(m.name||"").replace(/^models\//,""))
  .filter(n=>n&&!/vision|embedding|aqa|image|tts|live/i.test(n));
 const pick=usable.find(n=>/flash/i.test(n)&&!/thinking|lite/i.test(n))||usable.find(n=>/flash/i.test(n))||usable[0];
 if(!pick)throw new Error("이 키로 쓸 수 있는 생성 모델이 없습니다");
 return pick;
}
/* 응답 본문의 오류 메시지까지 올려 보낸다 — 원인을 화면에서 바로 알 수 있도록 */
async function geminiErr(r){
 let detail="";
 try{const j=await r.json();detail=j?.error?.message||"";}catch{}
 return new Error(`Gemini 오류 ${r.status}${detail?" · "+detail.slice(0,140):""}`);
}
async function geminiGenerate(system,question,history){
 const c=aiCfg();
 const contents=[...(history||[]).map(t=>({role:t.role==="assistant"?"model":"user",parts:[{text:t.content}]})),
  {role:"user",parts:[{text:question}]}];
 const body={contents,systemInstruction:{parts:[{text:system}]},
  generationConfig:{temperature:0.2,maxOutputTokens:1024}};
 const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),20000);
 try{
  if(c.proxy){
   const r=await fetch(`${c.proxy}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:c.model,...body}),signal:ctl.signal});
   if(!r.ok)throw await geminiErr(r);
   return geminiText(await r.json());
  }
  const call=async model=>fetch(
   `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(c.key)}`,
   {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),signal:ctl.signal});
  let model=GEMINI_RESOLVED||c.model;
  let r=await call(model);
  /* 모델을 못 찾으면(404/400) 쓸 수 있는 모델로 한 번 바꿔 재시도한다 */
  if(!r.ok&&(r.status===404||r.status===400)){
   /* 모델 탐색이 실패하면(키 오류 등) 원래 오류를 그대로 보여준다 */
   try{
    const alt=await geminiPickModel(c.key);
    if(alt&&alt!==model){console.info("Gemini 모델 자동 전환:",model,"→",alt);
     GEMINI_RESOLVED=alt;model=alt;r=await call(model);}
   }catch(e){console.warn("모델 자동 전환 실패:",e);}
  }
  if(!r.ok)throw await geminiErr(r);
  GEMINI_RESOLVED=model;
  return geminiText(await r.json());
 }finally{clearTimeout(timer);}
}
/* 모델이 마크다운을 섞어 보내도 준비된 답변과 같은 평문 한 문단으로 정리한다 */
function geminiPlain(text){
 return String(text||"")
  .replace(/```[\s\S]*?```/g,"")                       /* 코드블록 제거 */
  .split(/\r?\n/)
  .filter(l=>!/^\s*#{1,6}\s/.test(l))                   /* 소제목 줄은 버린다 */
  .map(l=>l.replace(/^\s*[-*•]\s+/,"")                  /* 글머리표 */
           .replace(/^\s*\d+[.)]\s+/,"")               /* 번호목록 */
           .replace(/^\s*[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]\s*/gu,"") /* 줄머리 이모지 */
           .trim())
  .filter(Boolean)
  .join(" ")
  .replace(/\*\*(.+?)\*\*/g,"$1").replace(/[*_`]/g,"") /* 강조 기호 */
  .replace(/\s{2,}/g," ")
  .trim();
}
/* 답변 본문에 이름이 나오는 다른 규정을 '이어서 확인할 규정'으로 올린다 */
function relatedFromText(g,text){
 const out=[];
 ORDER.forEach(k=>{
  if(!D[k].loaded||D[k].group===g||out.includes(D[k].group))return;
  const n=short(D[k].name);
  if(n&&n.length>3&&text.includes(n))out.push(D[k].group);});
 return out.slice(0,2);
}
function geminiText(j){
 const cand=j?.candidates?.[0];
 const parts=cand?.content?.parts||[];
 const out=(typeof j.text==="string"&&j.text.trim())?j.text.trim():parts.map(p=>p.text||"").join("").trim();
 if(out)return out;
 const why=cand?.finishReason||j?.promptFeedback?.blockReason||"";
 throw new Error("응답이 비어 있습니다"+(why?` (${why})`:""));
}

/* ---- 답변에서 근거 조문 찾아 인용 버튼으로 연결 ---- */
function citationsFromText(g,text){
 const all=groupArts(g),out=[],seen=new Set();
 (text.match(/제\s?\d+조(?:의\s?\d+)?|별표\s?\d+/g)||[]).forEach(m=>{
  const norm=m.replace(/\s/g,"");
  all.forEach(a=>{if(a.n===norm&&!seen.has(a.id)){seen.add(a.id);
   const q=(a.body.find(b=>b!=="TABLE")||"").replace(/^[①-⑳]\s*/,"");
   out.push({id:a.id,quote:q});}});
 });
 return out.slice(0,6);
}

/* ---- 마크다운 → HTML (### 제목, 목록, **굵게**, `코드`) ---- */
function mdToHtml(md){
 const inline=t=>esc(t).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/`([^`]+)`/g,"<code>$1</code>")
  .replace(/\[([^\]]+)\]/g,'<span class="mdref">[$1]</span>');
 const lines=String(md||"").split(/\r?\n/),html=[];let list=false;
 const closeList=()=>{if(list){html.push("</ul>");list=false;}};
 lines.forEach(raw=>{
  const l=raw.trim();
  if(!l){closeList();return;}
  const h=l.match(/^(#{1,4})\s+(.*)$/);
  if(h){closeList();html.push(`<h4 class="md-h">${inline(h[2])}</h4>`);return;}
  const li=l.match(/^[-*•]\s+(.*)$/);
  if(li){if(!list){html.push('<ul class="md-ul">');list=true;}html.push(`<li>${inline(li[1])}</li>`);return;}
  closeList();html.push(`<p>${inline(l)}</p>`);
 });
 closeList();
 return html.join("");
}
