/* 관리자 페이지 · 시스템 관리 · 체크리스트 영문 사전. i18n-data.js 뒤에 로드한다. */
Object.assign(DATA_EN,{
/* 담당자 이름 (시연용 가상 인물) */
"박서연":"Park Seo-yeon","강태윤":"Kang Tae-yun","문가영":"Moon Ga-young","홍예린":"Hong Ye-rin",
"서지우":"Seo Ji-woo","전민석":"Jeon Min-seok","노지환":"Noh Ji-hwan","유승호":"Yoo Seung-ho",
"백서준":"Baek Seo-jun","안재현":"An Jae-hyun","손우진":"Son Woo-jin","표성민":"Pyo Seong-min",
"정다은":"Jeong Da-eun","한지훈":"Han Ji-hun",
"사원":"Staff","대리":"Assistant Manager","과장":"Manager","차장":"Deputy General Manager",
"부장":"General Manager","팀장":"Team Leader","실장":"Office Head","부문장":"Division Head",

/* 관리자 페이지 */
"규정 관리자만 담당자를 지정할 수 있습니다. 지정된 담당자는 이 규정의 개정 이력과 파일을 등록·삭제할 수 있습니다.":"Only a regulation admin can assign an owner. The assigned owner can add and delete this regulation's revision history and files.",
"참고":"Note","개정 원본 파일 (선택)":"Source file of the revision (optional)",
"PDF · HWP · Word 등 파일당 10MB 이하 · 끌어다 놓거나 클릭":"PDF, HWP, Word and the like · up to 10MB per file · drag and drop or click",
"개정일":"Revision date","시행일":"Effective date",

/* 시스템 관리 */
"규정 등록·수정, 해석 지침, 확인 요청 답변과 질의 현황을 관리합니다.":"Register and edit regulations, maintain owner guidance, answer escalations and review query statistics.",
"분류":"Category",
"50건 · 조문을 등록하면 규정 창구와 AI 검색 대상에 바로 포함됩니다.":"50 regulations · once articles are registered they are immediately included in the regulation desk and AI search.",
"직원이 직접 남긴 문의와 AI가 규정만으로 답하지 못한 질문입니다. 답변을 등록하면 요청자에게 전달되고, 해석 지침에 추가되어 같은 질문에는 창구에서 바로 안내됩니다.":"Inquiries left directly by employees, and questions the AI could not answer from the regulations alone. A submitted answer is sent to the requester and added to the owner guidance, so the same question is answered at the desk from then on.",
"아직 없습니다. 규정 창구에서 \"확인 요청\"을 누르면 이곳에 쌓입니다.":"Nothing yet. Escalations raised from the regulation desk appear here.",
"시연: 일반 계정으로 \"업무에 ChatGPT 같은 생성형 AI를 써도 되나요?\"를 질문해 보세요.":"Demo: sign in as an employee and ask \"Can I use generative AI such as ChatGPT for work?\"",
"운영 시 이 집계로 홈 화면의 '자주 찾는 질문'을 자동 갱신합니다.":"In production these figures refresh the Top questions on the home screen automatically.",
"규정 체계 점검":"Regulation system check",
"규정을 한 곳에 모으면서 확인된 사항입니다. 번호 중복과 주관부서 누락은 등록 데이터로 자동 점검합니다.":"Points found while bringing the regulations together. Duplicate numbers and missing owners are checked automatically against the registered data.",
"분류 누락":"Missing category",
"예산 관리 규정이 8xx 번호를 쓰고 있으나 제11조 업무분류에는 8번 분류가 없습니다. 예산통제는 분류 1의 설명에 포함되어 있습니다.":"The budget regulations use 8xx numbers, but Article 11 has no category 8. Budget control is covered by the description of category 1.",
"등록일 편중":"Registration dates clustered",
"보안 규정군을 제외한 대부분이 2016~2017년 등록입니다. 게시판 등록일만으로는 최신 개정 여부를 알 수 없습니다.":"Apart from the security regulations, most were registered in 2016-2017. The posting date alone does not show whether a regulation is up to date.",
"시연용 계정입니다. 운영 시 사내 SSO와 인사 조직정보를 연동하고, 규정별 주관부서 담당자에게 편집 권한을 부여합니다.":"These are demo accounts. In production, accounts come from corporate SSO and HR organization data, and edit rights are granted to each regulation's owning team.",
"가능한 작업":"Permissions",
"규정 열람·검색, AI 질의, 확인 요청":"View and search regulations, ask the AI, raise escalations",
"규정 등록·수정·삭제, 해석 지침, 확인 요청 답변, 현황 조회":"Create, edit and delete regulations, owner guidance, answer escalations, view statistics",

/* 입사자 체크리스트 */
"입사자 체크리스트":"New joiner checklist",
"입사일을 기준으로 규정상 해야 할 일과 기한을 먼저 알려드립니다.":"Based on your start date, this lists what the regulations require of you and by when.",
"입사일":"Start date",
"경력증명서·최종학력증명서·건강진단서 제출":"Submit certificate of employment, final academic transcript and health check report",
"전자결재 원칙 숙지: 서면·대면 보고 후에도 전자결재 상신 필수":"Learn the approval rules: an electronic approval is required even after a written or in-person report",
"보안서약 및 비밀번호 설정 (90일마다 변경)":"Sign the security pledge and set your password (changed every 90 days)",
"경력사원 온보딩 과정 이수 (회사 소개·사내 규정·정보보안)":"Complete experienced-hire onboarding (company introduction, regulations, information security)",
"다음 달 시차출퇴근 신청 (매월 25일까지)":"Apply for next month's flexible hours (by the 25th of each month)",
"멘토 면담 (월 1회 이상, 3개월간)":"Mentor meeting (at least monthly, for 3 months)",
"선택적 복지포인트 확인 (입사 연도는 잔여 월수 비례 배정)":"Check your welfare points (pro-rated for the remaining months in your first year)",
"수습기간 종료 평가 (경력직 2개월)":"End-of-probation review (2 months for experienced hires)",
"경력 인정 결과 확인 · 이의 제기 기한":"Check your recognized career and the deadline to object",
"법정의무교육 이수 (성희롱·괴롭힘 예방 등)":"Complete statutory training (harassment prevention and others)"
});

/* 개정 이력 · 별표 부가 문구 */
Object.assign(DATA_EN,{
"효력 없음":"Superseded","이 문서는 ":"This is the version effective "," 시행본입니다":"",
"업무에는 현행본을 적용하십시오.":"Use the current version for your work.",
"현행본 보기":"View current version","개정 이력으로":"Back to history",
"위임전결기준표":"Delegation of Authority Matrix","국내/본사 기준 · 〈별표 제1호〉":"Domestic / head office · Appendix 1",
"결정(전결)":"Decision (delegated)","보고 · 항목을 누르면 결재라인을 보여줍니다":"Report · tap an item to see its approval line",
"등록된 개정 이력이 없습니다. 현행본 시행일은 ":"No revision history registered. The current version took effect on ",
"담당자가 관리자 페이지에서 개정 이력을 등록하면 이곳에 쌓입니다.":"Revisions registered by the owner in the admin page appear here.",
"개정":"revised","제정":"enacted","신설":"added"
});

/* 오류·안내 메시지 */
Object.assign(DATA_EN,{
"지금은 연결이 어렵습니다. 잠시 후 다시 시도해 주세요.":"The service is unreachable right now. Please try again shortly.",
"AI 사용이 허용되지 않았습니다. 규정을 직접 선택해 주세요.":"AI answering is not permitted. Please pick a regulation yourself.",
"AI 사용이 허용되지 않았습니다. 오른쪽 규정 원문은 계속 열람하실 수 있습니다.":"AI answering is not permitted. You can still read the regulation on the right.",
"요청이 몰렸습니다. 잠시 후 다시 시도해 주세요.":"Too many requests right now. Please try again shortly.",
"답변 형식이 맞지 않았습니다. 질문을 조금 더 구체적으로 적어 다시 시도해 주세요.":"The answer was not in the expected format. Please rephrase your question more specifically.",
"어느 규정 소관인지 판단하는 중…":"Finding which regulation applies…",
"판단하지 못했습니다. 카테고리에서 규정을 직접 선택해 주세요.":"Could not determine it. Please pick a regulation from the categories.",
"시연 모드에서는 준비된 질문에만 AI가 답합니다. 관련 조문을 찾았습니다.":"In demo mode the AI answers only prepared questions. Here are the related articles.",
"시연 모드에서는 준비된 질문에만 AI가 답합니다. 이 창구에서 관련 조문을 찾지 못했습니다. 오른쪽 조문 목차에서 직접 확인해 주세요.":"In demo mode the AI answers only prepared questions, and no related article was found at this desk. Please check the contents list on the right."
});
