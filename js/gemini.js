/* Gemini 연동 (실시간 AI 응답)
 * - 호출 경로 2가지
 *   1) 프록시(권장): 사내망/로컬에서 server/proxy.mjs 를 띄우고 그 주소를 설정에 입력한다.
 *      API 키는 서버의 환경변수(GEMINI_API_KEY)에만 두므로 브라우저·소스코드에 키가 남지 않는다.
 *   2) 직접 호출: 설정 화면에 입력한 키로 브라우저에서 직접 호출한다(그 브라우저에만 저장).
 *      GitHub Pages 같은 정적 호스팅에서는 키를 숨길 수 없으므로 시연·테스트용으로만 쓴다.
 * - 실패(네트워크·쿼터·차단 등) 시 예외를 던지고, 호출 측에서 준비된 답변(시연 모드)으로 자동 전환한다.
 */
const AI_ORG="대한전선";
const GEMINI_DEFAULT_MODEL="gemini-1.5-flash";
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

[출력 포맷] 아래 마크다운 형식을 그대로 지킨다. 각 항목은 한국어 존댓말로 간결하게 쓴다.
### 📌 관련 규정
- [${head.no} ${head.name} 제O조(조문 제목)]

### 📝 핵심 요약
- 1~2줄로 결론부터

### 💡 상세 내용 및 절차
- 구체적인 기준·절차·기한
- 함께 확인할 규정이 있으면 마지막 항목에 적는다

[규정 주관부서가 작성한 해석 지침 — 규정 원문보다 먼저 반영]
${guide||"(없음)"}

[사내 규정 데이터] (${head.no} ${head.name}, 주관 ${head.owner}, 시행 ${head.effective})
${corpus}`;
}

/* ---- 호출 ---- */
async function geminiGenerate(system,question,history){
 const c=aiCfg();
 const contents=[...(history||[]).map(t=>({role:t.role==="assistant"?"model":"user",parts:[{text:t.content}]})),
  {role:"user",parts:[{text:question}]}];
 const body={contents,systemInstruction:{parts:[{text:system}]},
  generationConfig:{temperature:0.2,maxOutputTokens:1024}};
 const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),20000);
 try{
  const url=c.proxy?`${c.proxy}/api/chat`
   :`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(c.model)}:generateContent?key=${encodeURIComponent(c.key)}`;
  const payload=c.proxy?{model:c.model,...body}:body;
  const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),signal:ctl.signal});
  if(!r.ok)throw new Error(`Gemini 응답 오류 ${r.status}`);
  const j=await r.json();
  const parts=j?.candidates?.[0]?.content?.parts||[];
  const out=(typeof j.text==="string"&&j.text.trim())?j.text.trim():parts.map(p=>p.text||"").join("").trim();
  if(!out)throw new Error("Gemini 응답이 비어 있습니다");
  return out;
 }finally{clearTimeout(timer);}
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
