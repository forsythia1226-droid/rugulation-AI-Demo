/* 위임전결규정 별표 제1호 「위임전결기준표」
 * - 구조(업무구분/업무내용, 결재권자, 유관조직 합의·참조, ●결정 ◎보고)는 실제 기준표 양식을 따른다.
 * - 내용은 가상 데이터다. 데모 조문(위임전결규정 제7·8조, 직제규정 제12조 등)과 맞물리게 작성했다.
 *   실제 기준표는 공개 저장소에 넣지 않는다. 운영 시 원본(엑셀)을 서버에서 불러와 같은 화면으로 보여준다.
 * - 행: [깊이, 업무내용, 팀장, 부문장, 대표이사, (미사용), (미사용), 합의, 참조, 근거조문ID, 비고]
 *   5·6번째 칸은 예전 안전보건경영 열 자리로 비워 둔다(행 배열 위치 유지).
 */
const ANNEX_105={
 title:"위임전결기준표",sub:"국내/본사 기준 · 〈별표 제1호〉",
 cols:[["t","팀장"],["d","부문장"],["c","대표이사"]],safety:[],
 rows:[
 [0,"1. 경영관리"],
 [1,"1) 경영전략"],
 [2,"(1) 중장기 비전 및 전략","","","●","","","","경영기획팀"],
 [2,"(2) 신규사업·M&A 검토","","","●","","","자금팀, 법무팀","경영기획팀"],
 [1,"2) 사업계획"],
 [2,"(1) 전사 사업계획","","","●","","","자금팀","경영기획팀"],
 [2,"(2) 부문 사업계획","","●","◎","","","","경영기획팀"],
 [2,"(3) 팀 실행계획","●","◎"],
 [1,"3) 실적 보고(월/분기)"],
 [2,"(1) 부문","","●","◎"],
 [2,"(2) 팀","●","◎"],
 [1,"4) 규정 제정·개정·폐지","","","●","","","경영기획팀","법무팀"],
 [1,"5) 조직 신설·폐지·통합","","","●","","","인사팀","경영기획팀","111-19"],
 [1,"6) 팀 내 업무분장 변경","●","◎","","","","","","105-8"],
 [0,"2. 인사·복무"],
 [1,"1) 채용"],
 [2,"(1) 정규직 채용 확정","","","●","","","인사팀","","105-8"],
 [2,"(2) 충원 요청","","●","","","","인사팀"],
 [1,"2) 휴가·근무"],
 [2,"(1) 연차·경조휴가 승인","●","","","","","","","105-8"],
 [2,"(2) 5일 초과 연속휴가 승인","","●","","","","","","105-8"],
 [2,"(3) 재택근무 승인","●","","","","","","","105-8"],
 [2,"(4) 시간외근무 사전 승인","●","","","","","","","203-14"],
 [1,"3) 출장명령"],
 [2,"(1) 국내출장","●","","","","","","","105-8"],
 [2,"(2) 해외출장","","●","","","","","IT혁신팀","105-8","출국 전 보안교육 이수"],
 [0,"3. 비용·구매 (건당 지출금액, 부가세 포함)"],
 [1,"1) 일반 경비·소모품"],
 [2,"① 300만원 이하","●","","","","","","","105-7"],
 [2,"② 300만원 초과 2,000만원 이하","","●","","","","","","105-7"],
 [2,"③ 2,000만원 초과","","","●","","","자금팀","","105-7"],
 [1,"2) 국내출장비"],
 [2,"① 200만원 이하","●","","","","","","","105-7"],
 [2,"② 200만원 초과 1,000만원 이하","","●","","","","","","105-7"],
 [2,"③ 1,000만원 초과","","","●","","","자금팀","","105-7"],
 [1,"3) 해외출장비"],
 [2,"① 500만원 이하","","●","","","","","","105-7","팀장 전결 불가"],
 [2,"② 500만원 초과","","","●","","","자금팀","","105-7"],
 [1,"4) 접대비"],
 [2,"① 100만원 이하","●","","","","","","","105-7"],
 [2,"② 100만원 초과 500만원 이하","","●","","","","","","105-7"],
 [2,"③ 500만원 초과","","","●","","","자금팀","","105-7"],
 [1,"5) 설비·자산 구매"],
 [2,"① 500만원 이하","●","","","","","","구매팀","105-7"],
 [2,"② 500만원 초과 5,000만원 이하","","●","","","","자금팀","구매팀","105-7"],
 [2,"③ 5,000만원 초과","","","●","","","자금팀","구매팀","105-7"],
 [1,"6) 원부자재 구매"],
 [2,"① 1,000만원 이하","●","","","","","","구매팀","105-7"],
 [2,"② 1,000만원 초과 2억원 이하","","●","","","","","구매팀","105-7"],
 [2,"③ 2억원 초과","","","●","","","자금팀","구매팀","105-7"],
 [1,"7) 외주용역 계약"],
 [2,"① 1,000만원 이하","●","","","","","","","105-7"],
 [2,"② 1,000만원 초과 1억원 이하","","●","","","","법무팀","","105-7"],
 [2,"③ 1억원 초과","","","●","","","법무팀, 자금팀","","105-7"],
 [1,"8) 교육·행사비"],
 [2,"① 200만원 이하","●","","","","","","인사팀","105-7"],
 [2,"② 200만원 초과 1,000만원 이하","","●","","","","","인사팀","105-7"],
 [2,"③ 1,000만원 초과","","","●","","","","인사팀","105-7"],
 [0,"4. 안전보건"],
 [1,"1) 안전보건 경영방침 및 목표","","","●","","","","경영기획팀","111-12"],
 [1,"2) 사업장 위험성평가 결과","","●","◎","","","","","111-12"],
 [1,"3) 안전보건 예산 편성","","","●","","","자금팀","","111-12"],
 [1,"4) 중대재해 대응 및 재발방지 대책","","","●","","","","경영기획팀","111-12"],
 [0,"5. 대외·정보보안"],
 [1,"1) 외부 공표 자료","","","●","","","법무팀","","105-8"],
 [1,"2) 협력사 신규 등록","","●","","","","","구매팀","105-8"],
 [1,"3) 정보자산 외부 반출"],
 [2,"(1) 사내한","●","","","","","","","212-5"],
 [2,"(2) 대외비","","●","","","","IT혁신팀","","212-8"]
 ]};
const ANNEX={"TES-105":ANNEX_105};
const annexOf=k=>ANNEX[k]||ANNEX[D[k]?.group];

/* 결재라인 계산: 기안자 → 결정권자(●)까지 순서대로, ◎는 사후 보고 */
function approvalLine(A,r){
 const all=[...A.cols,...A.safety],val=Object.fromEntries(all.map(([k],i)=>[k,r[2+i]||""]));
 const dec=all.find(([k])=>val[k]==="●");if(!dec)return null;
 const chain=A.safety.some(([k])=>k===dec[0])?A.safety:A.cols;
 const line=["기안자"];for(const[k,l]of chain){line.push(l);if(k===dec[0])break;}
 return{line,dec:dec[1],report:all.filter(([k])=>val[k]==="◎").map(([,l])=>l)};
}

let annexUI={q:"",open:-1};
function annexHTML(k){
 const A=annexOf(k),q=annexUI.q.trim(),all=[...A.cols,...A.safety];
 /* 검색: 일치하는 행과 그 상위 분류·하위 항목을 함께 보여준다 */
 let rows=A.rows.map((r,i)=>({r,i}));
 if(q){const keep=new Set();A.rows.forEach((r,i)=>{if(r[1].includes(q)||(r[7]||"").includes(q)||(r[8]||"").includes(q)||(r[10]||"").includes(q)){
   keep.add(i);let lv=r[0];for(let j=i-1;j>=0&&lv>0;j--)if(A.rows[j][0]<lv){keep.add(j);lv=A.rows[j][0];}
   for(let j=i+1;j<A.rows.length&&A.rows[j][0]>r[0];j++)keep.add(j);}});   /* 분류가 일치하면 하위 항목도 함께 */
  rows=rows.filter(x=>keep.has(x.i));}
 const mark=s=>q?esc(s).split(esc(q)).join(`<mark>${esc(q)}</mark>`):esc(s);
 return `<div class="annex">
  <div class="ax-head"><div><h2>${esc(A.title)}</h2><p>${esc(A.sub)} · <b>●</b> 결정(전결) <b>◎</b> 보고 · 항목을 누르면 결재라인을 보여줍니다</p></div>
   <div class="sbar sm ax-q">${IC.search}<input id="axq" placeholder="업무 검색 (예: 출장, 접대비, 채용)" value="${esc(annexUI.q)}"></div></div>
  <div class="ax-wrap"><table class="ax">
   <thead><tr><th rowspan="2" class="ax-item">업무내용</th><th colspan="${A.cols.length}">결재권자</th>${A.safety.length?`<th colspan="${A.safety.length}">안전보건경영</th>`:""}<th colspan="2">유관조직</th></tr>
    <tr>${all.map(([,l])=>`<th class="ax-c">${esc(l)}</th>`).join("")}<th>합의</th><th>참조</th></tr></thead>
   <tbody>${rows.map(({r,i})=>{
    if(r.length<=2)return `<tr class="ax-g lv${r[0]}"><td colspan="${all.length+3}">${mark(r[1])}</td></tr>`;
    const o=annexUI.open===i,ln=o?approvalLine(A,r):null;
    return `<tr class="ax-r lv${r[0]}${o?" on":""}" data-ax="${i}"><td class="ax-item">${mark(r[1])}${r[10]?`<small>${esc(r[10])}</small>`:""}</td>
     ${all.map((_,ci)=>`<td class="ax-c">${r[2+ci]?`<span class="${r[2+ci]==="●"?"dec":"rep"}">${r[2+ci]}</span>`:""}</td>`).join("")}
     <td class="ax-o">${mark(r[7]||"")}</td><td class="ax-o">${mark(r[8]||"")}</td></tr>
     ${o?`<tr class="ax-line"><td colspan="${all.length+3}"><div>
      <b>결재라인</b><span class="ax-chain">${ln.line.map((x,j)=>`<span class="${j===ln.line.length-1?"last":""}">${esc(x)}${j===ln.line.length-1?" (전결)":""}</span>`).join("<i>→</i>")}</span>
      ${ln.report.length?`<span class="ax-meta">보고 ${esc(ln.report.join(", "))}</span>`:""}
      ${r[7]?`<span class="ax-meta">합의 ${esc(r[7])}</span>`:""}${r[8]?`<span class="ax-meta">참조 ${esc(r[8])}</span>`:""}
      ${r[9]&&artById(r[9])?`<button class="ax-basis" data-axart="${r[9]}">근거 ${esc(artById(r[9]).n)} 보기 →</button>`:""}</div></td></tr>`:""}`;}).join("")||`<tr><td colspan="${all.length+3}" class="ax-none">'${esc(q)}'에 해당하는 업무가 없습니다.</td></tr>`}
   </tbody></table></div>
  <p class="ax-foot">전결권자 부재 시 대결은 제9조, 후결은 제10조를 따릅니다. 표에 없는 항목은 경영기획팀과 협의하여 결정합니다(제7조②).</p>
 </div>`;
}
function artById(id){for(const k of ORDER)for(const c of D[k].chapters||[])for(const a of c.arts)if(a.id===id)return{...a,docKey:k};return null;}
function showAnnex(k){
 state.docMode="annex";
 const r=$("#docScroll");r.innerHTML=annexHTML(k);r.scrollTop=0;syncDocTabs();bindAnnex(k);
}
function bindAnnex(k){
 const r=$("#docScroll");
 $("#axq").oninput=e=>{annexUI.q=e.target.value;annexUI.open=-1;const p=e.target.selectionStart;r.innerHTML=annexHTML(k);bindAnnex(k);const i=$("#axq");i.focus();i.setSelectionRange(p,p);};
 r.querySelectorAll("[data-ax]").forEach(t=>t.onclick=()=>{const i=+t.dataset.ax;annexUI.open=annexUI.open===i?-1:i;const y=r.scrollTop;r.innerHTML=annexHTML(k);bindAnnex(k);r.scrollTop=y;});
 r.querySelectorAll("[data-axart]").forEach(b=>b.onclick=e=>{e.stopPropagation();const a=artById(b.dataset.axart);
  if(D[a.docKey].group===state.group)highlight([{id:a.id,docKey:a.docKey,quote:""}],a.id);else openNotice({doc:a.docKey,art:a.id,quote:""});});
}
