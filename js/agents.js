/* 멀티 에이전트 오케스트레이션 (백엔드 구조)
 *
 *   질문 ─▶ Master ─▶ Sub(규정군) ─┬─▶ 병합 ─▶ Verify(인용 대조) ─▶ 답변
 *                     Sub(규정군) ─┘
 *
 * - Master : 질문이 어느 규정군 소관인지 판단하고 최대 2개까지 고른다.
 * - Sub    : 규정군 하나만 담당한다. 그 규정군의 조문과 주관부서 해석 지침만 본다.
 * - Verify : 답변이 인용한 문장이 현행 조문에 그대로 있는지 대조한다.
 *
 * 시연에서는 Sub가 실제 LLM을 부르지 않고 검증된 준비 답변을 반환한다.
 * 실시간 전환은 PROVIDERS(live/gemini)를 갈아끼우는 것으로 끝나며, 이 파일은 그대로 쓴다.
 */

const AGENT_CFG={
 fanout:2,            /* Master가 동시에 부를 Sub 최대 개수 */
 minScore:3,          /* 2순위 Sub를 부를 최소 검색 점수 */
 minRatio:0.4,        /* 2순위는 1순위 점수의 이 비율 이상일 때만 부른다 (관련 없는 규정군 호출 방지) */
 promoteSecondary:false, /* 1순위가 답하지 못했을 때 2순위 답변으로 대체할지 (시연 고정을 위해 기본 off) */
 verifyMode:"warn"    /* 인용 대조 실패 시: warn(경고 표시) | block(답변 보류) */
};

const agentNow=()=>(typeof performance!=="undefined"?performance.now():Date.now());
const agentLabel=g=>{const h=typeof groupHead==="function"?groupHead(g):null;
 return h?`${h.no} ${typeof short==="function"?short(h.name):h.name}`:g;};

/* ---------- Master: 소관 규정군 판단 ---------- */
/* 준비된 질문은 지정된 규정을 1순위로 쓰고, 그 밖에는 조문 검색 점수로 정한다.
 * 실시간 전환 시에는 이 함수 안에서 provider().route()를 부르면 된다. */
async function masterRoute(q,{pin=null,limit=AGENT_CFG.fanout,list=null}={}){
 void list; /* 실시간 전환 시 provider().route(q,list) 를 부를 자리 */
 const groups=[...new Set(ORDER.filter(k=>D[k].loaded).map(k=>D[k].group))];
 const gb=g=>typeof embGroupBonus==="function"?embGroupBonus(q,g):0;
 const db=g=>typeof embDescBonus==="function"?embDescBonus(q,g):0;
 /* 1순위: 조문 근거 기준 / 2순위: 규정 성격까지 더해 넓게 본다 */
 const ranked=groups.map(g=>({g,score:(scored(g,q)[0]?.s||0)+gb(g)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
 const wide=groups.map(g=>({g,score:(scored(g,q)[0]?.s||0)+gb(g)+db(g)})).sort((a,b)=>b.score-a.score);
 const picks=[];
 const add=(g,score,via)=>{if(g&&D[g]&&!picks.some(p=>p.group===g)&&picks.length<limit)picks.push({group:g,score,via});};

 if(pin)add(pin,ranked.find(r=>r.g===pin)?.score||0,"desk");        /* 규정 창구에서 물은 경우 그 규정이 1순위 */
 const prepared=DEMO_ROUTES[demoNorm(q)];                            /* 준비된 질문의 지정 규정 */
 if(prepared&&D[prepared])add(D[prepared].group,Infinity,"prepared");
 /* 2순위 기준: 절대 점수와 1순위 대비 비율을 함께 본다 */
 const headScore=picks.length?(ranked.find(r=>r.g===picks[0].group)?.score||0):0;
 const gate=picks.length?Math.max(AGENT_CFG.minScore,headScore*AGENT_CFG.minRatio):0;
 ranked.forEach(r=>{if(r.score>=gate)add(r.g,r.score,"retrieval");});
 /* 자리가 남으면 규정 성격까지 본 순위에서 채운다 */
 wide.forEach(r=>{if(picks.length<limit)add(r.g,r.score,"desc");});

 return{picks,ranked:ranked.slice(0,5),
  reason:picks.map(p=>`${agentLabel(p.group)}(${p.via})`).join(" + ")||"판단 불가"};
}

/* ---------- Sub: 규정군 하나를 담당 ---------- */
async function subAnswer(group,q,turns,opts){
 const t0=agentNow();
 const r=await (await provider()).answer(group,q,turns,opts);
 return{...r,group,ms:Math.round(agentNow()-t0),
  /* 준비된 답변(또는 주관부서 답변)에 실제로 걸린 경우만 '답변함'으로 본다 */
  answered:!!(r.key||r.fromOwner||r.live)};
}

/* ---------- 병합 ---------- */
/* 1순위 답변 본문을 유지한다. 2순위는 본문을 덮지 않고
 * '이어서 확인할 규정'으로만 올린다 — 두 규정이 서로 다른 금액·기한을 말할 때
 * 한쪽을 임의로 고르지 않기 위한 규칙이다. */
function mergeResults(results){
 const list=results.filter(Boolean);
 if(!list.length)return{answer:"",citations:[],related:[],needsOwner:false,ownerQuestion:""};
 let main=list[0],rest=list.slice(1);
 if(AGENT_CFG.promoteSecondary&&!main.answered){
  const alt=rest.find(r=>r.answered);
  if(alt){rest=[main,...rest.filter(r=>r!==alt)];main=alt;}
 }
 const related=[...(main.related||[])];
 const crossRefs=[];
 rest.forEach(r=>{
  crossRefs.push({group:r.group,answered:r.answered,citations:r.citations||[]});
  if(r.answered&&r.group!==main.group&&!related.includes(r.group))related.push(r.group);
 });
 return{...main,related,crossRefs};
}

/* ---------- Verify: 인용 문장이 현행 조문에 그대로 있는지 대조 ---------- */
/* 문자열 대조만 한다. LLM을 쓰지 않으므로 비용이 없고 결과가 항상 같다. */
function verifyCitations(result,groups){
 const arts=[...new Set(groups)].flatMap(groupArts);
 const checks=(result.citations||[]).map(c=>{
  const a=arts.find(x=>x.id===c.id);
  if(!a)return{id:c.id,ok:false,reason:"missing_article"};
  const ok=a.body.some(b=>b.includes(c.quote));
  return{id:c.id,ok,reason:ok?"":"quote_mismatch"};
 });
 const failed=checks.filter(c=>!c.ok);
 return{checked:checks.length,passed:checks.length-failed.length,failed,ok:!failed.length};
}

/* ---------- 파이프라인 ---------- */
/* ask()가 부르는 단일 진입점. 반환 형태는 기존 provider.answer()와 같고
 * trace(각 에이전트의 판단·소요시간)와 agents(호출한 규정군)만 더 붙는다. */
async function runAgents(q,{group=null,turns=[]}={}){
 const trace=[],t0=agentNow();

 const route=await masterRoute(q,{pin:group});
 trace.push({agent:"master",picks:route.picks.map(p=>agentLabel(p.group)),reason:route.reason,
  ms:Math.round(agentNow()-t0)});
 if(!route.picks.length)return{answer:"",citations:[],related:[],needsOwner:false,ownerQuestion:"",trace,agents:[]};

 /* Sub 병렬 호출 */
 /* 실시간 생성은 1순위 규정에서만 한다 — 2순위까지 부르면 호출이 두 배가 된다 */
 const results=await Promise.all(route.picks.map((p,i)=>subAnswer(p.group,q,turns,{live:i===0})));
 results.forEach(r=>trace.push({agent:"sub",group:agentLabel(r.group),answered:r.answered,
  citations:(r.citations||[]).length,ms:r.ms}));

 const merged=mergeResults(results);
 trace.push({agent:"merge",main:agentLabel(merged.group),
  related:(merged.related||[]).map(agentLabel),rule:"1순위 본문 유지 · 2순위는 연계 규정으로"});

 const groups=route.picks.map(p=>p.group);
 const v=verifyCitations(merged,groups);
 trace.push({agent:"verify",checked:v.checked,passed:v.passed,
  failed:v.failed.map(f=>`${f.id}(${f.reason})`),mode:AGENT_CFG.verifyMode});

 const out={...merged,trace,agents:groups,verify:v,ms:Math.round(agentNow()-t0)};
 /* 인용이 현행 조문과 어긋나면 기존 '개정됨' 경고 경로로 흘려보낸다 */
 if(!v.ok)out.stale=true;
 if(!v.ok&&AGENT_CFG.verifyMode==="block"){
  out.needsOwner=true;
  out.ownerQuestion=out.ownerQuestion||"인용한 조문이 개정되어 답변을 보류했습니다. 주관부서 확인이 필요합니다.";
 }
 return out;
}

