/* 다국어 (한국어 / English)
 * - 화면 문구는 한국어 원문을 키로 쓴다: t("홈") → 언어에 따라 "홈" 또는 "Home"
 * - 규정 조문·개정 이력 등 규정 데이터 본문은 사내 원본이라 번역하지 않는다(영어 모드에서 안내 표시).
 * - 질문/답변: 영어 질문을 누르면 검증된 한국어 답변과 같은 내용을 영어로 보여준다(EN_ANSWERS).
 */
const FLAG_KR=`<svg viewBox="0 0 30 20" class="flagimg" aria-hidden="true"><rect width="30" height="20" rx="2.5" fill="#fff" stroke="rgba(15,23,42,.14)" stroke-width=".8"/><path d="M15 6a4 4 0 0 1 0 8 4 4 0 0 0 0-8z" fill="#cd2e3a"/><path d="M15 6a4 4 0 0 0 0 8 4 4 0 0 1 0-8z" fill="#0047a0"/><g fill="#111" opacity=".85"><rect x="4" y="4.6" width="5" height=".9" transform="rotate(35 6.5 5)"/><rect x="4" y="6.2" width="5" height=".9" transform="rotate(35 6.5 6.6)"/><rect x="21" y="13.4" width="5" height=".9" transform="rotate(35 23.5 13.8)"/><rect x="21" y="15" width="5" height=".9" transform="rotate(35 23.5 15.4)"/></g></svg>`;
const FLAG_US=`<svg viewBox="0 0 30 20" class="flagimg" aria-hidden="true"><rect width="30" height="20" rx="2.5" fill="#fff" stroke="rgba(15,23,42,.14)" stroke-width=".8"/><g fill="#b22234"><rect y="0" width="30" height="1.6"/><rect y="3.1" width="30" height="1.6"/><rect y="6.2" width="30" height="1.6"/><rect y="9.3" width="30" height="1.6"/><rect y="12.4" width="30" height="1.6"/><rect y="15.5" width="30" height="1.6"/><rect y="18.4" width="30" height="1.6"/></g><rect width="13" height="10.8" fill="#3c3b6e"/><g fill="#fff"><circle cx="2.6" cy="2.2" r=".7"/><circle cx="6.5" cy="2.2" r=".7"/><circle cx="10.4" cy="2.2" r=".7"/><circle cx="4.5" cy="4.6" r=".7"/><circle cx="8.4" cy="4.6" r=".7"/><circle cx="2.6" cy="7" r=".7"/><circle cx="6.5" cy="7" r=".7"/><circle cx="10.4" cy="7" r=".7"/><circle cx="4.5" cy="9.2" r=".7"/><circle cx="8.4" cy="9.2" r=".7"/></g></svg>`;
const LANGS=[["ko",FLAG_KR,"한국어"],["en",FLAG_US,"English"]];
const lang=()=>{try{return localStorage.getItem("rg:lang")==="en"?"en":"ko";}catch{return "ko";}};
const setLang=v=>{try{localStorage.setItem("rg:lang",v);}catch{}};
const isEN=()=>lang()==="en";

const KO_EN={
 /* 공통 · 사이드바 · 헤더 */
 "사내규정 AI 에이전트":"Regulation AI Agent","대시보드":"Dashboard","규정 탐색":"Browse","나의 업무":"My Work",
 "홈":"Home","카테고리별 규정":"Regulations by Category","자주 찾는 질문":"FAQ","최근 개정 공지":"Revision Notices",
 "규정 문의":"Ask the Owner","관리자 페이지":"Owner Console","시스템 관리":"System Admin","설정":"Settings","로그아웃":"Sign out",
 "내 문의":"My Inquiries","관리자":"Admin","더보기":"More","전체 보기":"View all",
 "Demo / 시연 모드":"Demo mode","Gemini / 실시간 응답":"Gemini / live","연결 확인 중":"Connecting",
 /* 로그인 */
 "사내 규정은 임직원 전용 정보입니다. 사번 계정으로 로그인해 주세요.":"Company regulations are for employees only. Please sign in with your employee account.",
 "아이디":"ID","비밀번호":"Password","로그인":"Sign in","시연 계정":"Demo accounts",
 "일반 임직원":"Employee","규정 관리자":"Regulation admin",
 "아이디 또는 비밀번호가 올바르지 않습니다.":"Incorrect ID or password.",
 "시연용 로그인입니다. 운영 시 사내 SSO(통합인증)로 대체합니다.":"Demo sign-in. Company SSO will replace this in production.",
 /* 홈 */
 "AI 규정 검색":"Ask AI","궁금하신 내용을 적어주세요. 어느 규정인지 몰라도 됩니다.":"Describe your situation. You don't need to know which regulation applies.",
 "찾기":"Search","자주 찾는 질문 TOP 5":"Top 5 questions","최근 규정 개정 공지":"Recent revisions",
 "어느 규정 소관인지 판단하는 중…":"Finding the right regulation…",
 "판단하지 못했습니다. 카테고리에서 규정을 직접 선택해 주세요.":"Couldn't determine the regulation. Please pick one from the categories.",
 "지금은 연결이 어렵습니다. 잠시 후 다시 시도해 주세요.":"Connection failed. Please try again shortly.",
 /* 카테고리 · 규정 창구 */
 "업무분류를 선택하면 해당 분류의 규정과 하위지침을 볼 수 있습니다.":"Select a category to see its regulations and guidelines.",
 "등록 규정":"Regulations","건":"","AI 규정 상담":"AI Consultation","주관":"Owner","시행":"Effective",
 "조문 목차":"Contents","인쇄":"Print","다운로드":"Download","개정 이력":"Revision history","위임전결기준표":"Delegation Matrix",
 "상황을 구체적으로 적을수록 정확합니다":"The more specific, the better","질문":"Ask",
 "답변의 근거 조문을 누르면 오른쪽 원문에서 해당 문장을 표시합니다.":"Click a cited article to highlight the sentence in the original text.",
 "시연 모드 · 준비된 질문에 AI가 답합니다. 근거 조문을 누르면 오른쪽 원문에서 해당 문장을 표시합니다.":"Demo mode · AI answers prepared questions. Click a cited article to highlight it.",
 "근거 조문을 찾는 중":"Finding the cited articles",
 /* 자주 찾는 질문 */
 "질문을 누르면 답변과 근거 조문을 바로 확인할 수 있습니다.":"Tap a question to see the answer and its cited articles.",
 "질문":"Questions","근거":"Basis","규정 원문과 함께 보기 →":"Open with the original text →",
 /* 개정 공지 */
 "개정된 조문으로 바로 이동해 바뀐 문장을 확인할 수 있습니다.":"Jump straight to the revised article and see what changed.",
 "공지":"Notices","적용일자":"Effective","변경":"Changes","조문 보기 →":"View article →","규정 보기 →":"View regulation →",
 "신설":"Added","개정":"Revised","제정":"Enacted","폐지":"Repealed",
 /* 규정 문의 */
 "규정을 선택해 질문을 남기면 해당 규정 담당자에게 Teams 메시지로 전달됩니다.":"Pick a regulation and leave a question; it is sent to the owner on Teams.",
 "문의하기":"New inquiry","규정":"Regulation","규정을 선택하세요":"Select a regulation",
 "담당팀 · 담당자":"Owner team · Owner","규정을 선택하면 자동으로 지정됩니다":"Filled in automatically",
 "전송 시 담당자 Teams로 알림이 갑니다":"The owner is notified on Teams","문의 보내기":"Send inquiry",
 "내 문의 내역":"My inquiries","확인 중":"In review","답변 완료":"Answered","직접 문의":"Direct","AI 확인 요청":"AI escalation",
 "규정 창구에서 다시 묻기 →":"Ask again in the regulation desk →","Teams 대화 열기 →":"Open Teams chat →","삭제":"Delete",
 "아직 문의 내역이 없습니다. 위에서 문의를 보내거나, 규정 창구에서 AI가 \"확인 요청\" 버튼을 보여주면 이곳에 쌓입니다.":"No inquiries yet. Send one above, or use the \"Ask the owner\" button in a regulation desk.",
 /* 설정 */
 "화면 표시와 AI 응답 방식을 설정합니다. 설정은 이 브라우저에 저장됩니다.":"Display and AI response settings. Saved in this browser.",
 "계정":"Account","이름":"Name","소속":"Team","권한":"Role","화면":"Display","테마":"Theme",
 "라이트":"Light","다크":"Dark","시스템":"System","글자 크기":"Text size","작게":"Small","보통":"Default","크게":"Large",
 "AI 응답":"AI response","응답 방식":"Mode","시연 고정":"Demo (fixed)","실시간 AI(Gemini)":"Live AI (Gemini)",
 "알림":"Notifications","켜기":"On","끄기":"Off","언어":"Language",
 /* 안내 */
 "규정 원문과 조문은 한국어 원본으로 제공됩니다.":"Regulation texts are provided in Korean, as issued."
};
Object.assign(KO_EN,{
 /* 규정 목록·창구 */
 "카테고리":"Category","규정번호":"No.","규정명":"Regulation","주관부서":"Owner team","시행일":"Effective date",
 "조문":"Articles","미적재":"Not loaded","수정":"Edit","등록":"Register","저장":"Save","취소":"Cancel","닫기":"Close",
 "본규정과 하위지침을 함께 검색합니다.":" Searches the regulation and its guidelines together.",
 "이 규정은 아직 창구에 조문이 적재되지 않았습니다.":"This regulation's articles are not loaded in the desk yet.",
 "카테고리로 돌아가기":"Back to categories",
 /* 개정 이력 */
 "신구대비":"Compare","개정 전":"Before","개정 후":"After","현행":"Current","조문 신설":"New article","표":"Table",
 "이 시점 원문 보기":"View text as of this date","현행본 보기":"View current text","개정 이력으로":"Back to history",
 "원본 파일 미등록":"No source file","효력 없음":"Not in force","등록된 개정 이력이 없습니다.":"No revision history yet.",
 "총":"Total","회":"revisions","변경 조문":"Changed articles","등록":"By","시행":"Effective",
 /* 위임전결기준표 */
 "위임전결기준표":"Delegation Matrix","업무내용":"Task","결재권자":"Approver","유관조직":"Related teams",
 "합의":"Consent","참조":"Copy","팀장":"Team leader","부문장":"Division head","대표이사":"CEO",
 "결재라인":"Approval line","기안자":"Drafter","보고":"Report","근거":"Basis",
 "업무 검색 (예: 출장, 접대비, 채용)":"Search tasks (e.g. travel, entertainment, hiring)",
 "↔ 표를 좌우로 스크롤하면 합의·참조 부서까지 볼 수 있습니다 (Shift + 휠)":"↔ Scroll the table sideways to see consent and copy teams (Shift + wheel)",
 /* 규정 문의 */
 "질문":"Question","보내기":"Send","답변하기":"Reply","규정 원문 보기":"View regulation","보기":"View",
 "시연":"Demo","새 메시지 입력":"Type a message",
 /* 설정 */
 "시연 데이터":"Demo data","초기화":"Reset","시연 데이터 초기화":"Reset demo data","저장했습니다":"Saved",
 "프록시 주소":"Proxy URL","모델":"Model","API 키":"API key","연결 저장":"Save connection","연결 테스트":"Test connection",
 /* 관리자 */
 "관리자 페이지":"Owner Console","규정별 담당자를 지정하고 개정 이력과 원본 파일을 관리합니다.":"Assign owners and manage revision history and source files.",
 "담당 규정":"My regulations","담당자":"Owners","정 담당자":"Primary owner","부 담당자":"Deputy owner","담당자 저장":"Save owners",
 "담당자 미지정":"Unassigned","미지정":"Unassigned","내가 담당하는 규정만":"Only regulations I own",
 "규정·담당팀 검색":"Search regulation or team","개정 이력 등록":"Add revision","첨부 파일":"Attachments",
 "구분":"Type","개정일":"Revision date","개정 사유":"Reason","현행 조문에 반영":"Apply to current text","개정 공지로 게시":"Post as notice",
 "+ 바뀐 조문 추가":"+ Add changed article","(새 문단 신설)":"(New paragraph)","비워 두면 이 문단 삭제":"Leave empty to delete",
 "아직 올라온 파일이 없습니다.":"No files uploaded yet.",
 /* 시스템 관리 */
 "시스템 관리":"System Admin","규정 관리":"Regulations","해석 지침":"Owner guidance","확인 요청":"Escalations",
 "질의 현황":"Query stats","변경 이력":"Change log","사용자·권한":"Users & roles","체계 점검":"System check",
 "누적 질의":"Total queries","AI 즉시 답변":"Answered by AI","확인 요청 전환":"Escalation rate","미처리 확인 요청":"Open escalations",
 "규정별 질의":"Queries by regulation","많이 묻는 질문":"Most asked","아직 질의가 없습니다.":"No queries yet.",
 "+ 새 규정 등록":"+ New regulation","지침 저장":"Save guidance","답변 등록":"Submit answer","해석 지침에 추가":"Add to owner guidance",
 /* 상태 */
 "확인 필요":"Needs review","요청":"From","답변":"Answer",
 "신구대비 ▾":"Compare ▾","신구대비 ▴":"Compare ▴","원본 파일 ↓":"Source file ↓",
 "규정 창구에서 보기":"Open in regulation desk","규정 보기":"View regulation","조문 목차":"Contents",
 "모두 확인 처리":"Mark all as read","전체":"All","검색":"Search","건":"","개":"","회":"","명":""
});
const t=s=>isEN()?(KO_EN[s]!==undefined?KO_EN[s]:s):s;

/* ---- 화면 자동 번역: 렌더된 DOM에서 사전에 있는 문구만 정확히 일치할 때 교체 ----
 * 규정 조문·개정 이력 본문 등 사전에 없는 문장은 그대로 둔다(원문 보존). */
const I18N_ATTRS=["placeholder","title","aria-label","data-tip"];
function translateTree(root){
 if(!isEN()||!root||root.nodeType===Node.DOCUMENT_FRAGMENT_NODE&&!root.querySelectorAll)return;
 if(root.nodeType===Node.TEXT_NODE){const k=root.nodeValue.trim();
  if(k&&KO_EN[k]!==undefined)root.nodeValue=root.nodeValue.replace(k,KO_EN[k]);return;}
 if(root.nodeType!==Node.ELEMENT_NODE)return;
 const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const ns=[];
 while(w.nextNode())ns.push(w.currentNode);
 ns.forEach(n=>{const k=n.nodeValue.trim();if(k&&KO_EN[k]!==undefined)n.nodeValue=n.nodeValue.replace(k,KO_EN[k]);});
 const els=[root,...root.querySelectorAll("*")];
 els.forEach(el=>I18N_ATTRS.forEach(a=>{const v=el.getAttribute&&el.getAttribute(a);
  if(v&&KO_EN[v.trim()]!==undefined)el.setAttribute(a,KO_EN[v.trim()]);}));
}
document.addEventListener("DOMContentLoaded",()=>{
 document.documentElement.lang=lang();
 const obs=new MutationObserver(ms=>{if(!isEN())return;ms.forEach(m=>m.addedNodes.forEach(translateTree));});
 ["#view","#sb","#hd"].forEach(sel=>{const el=document.querySelector(sel);if(el)obs.observe(el,{childList:true,subtree:true});});
 if(isEN())["#view","#sb","#hd"].forEach(sel=>translateTree(document.querySelector(sel)));
});

/* 영어 모드에서 보여줄 질문·답변 (한국어 검증 답변과 같은 내용) */
const EN_Q={
 "직제규정에서 안전총괄대표는 어떤 역할과 권한을 가지나요?":"What is the role and authority of the Chief Safety Officer?",
 "국내출장비 38만원은 누가 전결권자인가요?":"Who approves a domestic travel expense of KRW 380,000?",
 "팀장이 부재중일 때 대결은 누가, 어떤 기준으로 하나요?":"Who signs when the team leader is away, and on what basis?",
 "야근 식대는 얼마까지 정산할 수 있나요?":"How much can I claim for overtime meals?",
 "배우자 부친상인데 며칠 쉬고 경조금은 얼마인가요?":"My spouse's father passed away. How many days off and what allowance?",
 "각 직급별 승진소요연수가 어떻게 되나요?":"What are the minimum years in grade for promotion?",
 "올해 경력직 10월 입사자인데, 인사평가 대상인가요?":"I joined in October as an experienced hire. Am I included in this year's appraisal?",
 "인사평가등급 기준 및 평가 방법은 어떻게 되나요?":"What are the appraisal grades and how is the evaluation done?",
 "재택근무는 주 며칠까지 가능한가요?":"How many days a week can I work from home?"
};
const EN_A={
 "직제규정에서 안전총괄대표는 어떤 역할과 권한을 가지나요?":"The Chief Safety Officer (CSO) reports directly to the CEO and oversees compliance with the Serious Accidents Punishment Act, added in the 2026-08-01 revision (Article 6). Under Article 12 the CSO sets safety and health policy, checks risk assessments at each site at least twice a year, confirms the safety budget, leads the response to serious accidents, and defines how contractors' safety capability is assessed. The CSO may require documents from division heads and may order work to stop when there is imminent danger, and reports progress to the board every half year.",
 "국내출장비 38만원은 누가 전결권자인가요?":"KRW 380,000 of domestic travel expense is approved by the team leader. In the Article 7 table, domestic travel expenses up to KRW 2 million per case (VAT included) are delegated to the team leader. State in your draft which Article 7 item applies and attach the cost breakdown. The trip itself also needs a travel order under the Travel Expense Regulation.",
 "팀장이 부재중일 때 대결은 누가, 어떤 기준으로 하나요?":"If the team leader is away and the matter is too urgent to wait, the acting officer may sign on their behalf (Article 9). The acting officer is the most senior member of the team under Article 15 of the Organization Regulation, or whoever the leader designated in advance. The document must state the reason and the acting signer, and the leader must confirm it within 3 business days of returning (Article 10). Matters delegated to the CEO cannot be signed this way unless they qualify as an emergency.",
 "야근 식대는 얼마까지 정산할 수 있나요?":"When overtime continues past 20:00, meals are reimbursed at actual cost up to KRW 15,000 per person per occasion (Article 14). Claims must be filed in the expense system by the 5th business day of the following month. Overtime itself requires the team leader's prior approval, so check that the approval exists first.",
 "배우자 부친상인데 며칠 쉬고 경조금은 얼마인가요?":"A spouse's parent is treated the same as your own parent: 5 days of leave and KRW 1,000,000. The days and amount follow the table in Article 4 of the Employee Benefits Guideline, as referenced by Article 17. Holidays count toward the leave, but for a death you may start counting from the day of the event or the next day, and one extra day is allowed for travel over 200 km one way. The leave must be used within 30 days of the event.",
 "각 직급별 승진소요연수가 어떻게 되나요?":"The minimum years in grade are 4 years staff→assistant manager, 4 years assistant manager→manager, 5 years manager→deputy general manager, and 5 years deputy→general manager (Article 22). Career service recognized on hiring counts toward these years, and the HR Committee may shorten them by one year for outstanding performance. Two consecutive years at the lowest appraisal grade disqualify you, and leave periods not counted as service are excluded.",
 "올해 경력직 10월 입사자인데, 인사평가 대상인가요?":"The appraisal period runs from 1 January to 31 December, and anyone with less than 3 months of service in that year is excluded (Article 25). If you joined on 1 October you reach 3 months by 31 December and are included; if you joined on 2 October or later you fall short and are excluded this year. Confirm your exact service period with HR based on your appointment date; if excluded, you are appraised from next year.",
 "인사평가등급 기준 및 평가 방법은 어떻게 되나요?":"Grades are S, A, B, C and D, awarded on a relative basis (Article 25). The appraisal combines performance and competency at a 7:3 ratio and is carried out once a year for the period 1 January to 31 December. You may object to the result within 7 days of notification through HR. Note that two consecutive years at the lowest grade disqualify you from promotion.",
 "재택근무는 주 며칠까지 가능한가요?":"Working from home is allowed up to 2 days a week with the team leader's prior approval (Article 13). Production and shift workers follow separate arrangements. While at home you must connect through the company VPN under Article 12 of the Information System Security Guideline, and public Wi-Fi is not allowed."
};
