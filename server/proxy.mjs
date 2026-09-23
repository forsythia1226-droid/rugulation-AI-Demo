/* 로컬/사내망 프록시 서버 (Node 18+, 의존성 없음)
 * - 브라우저 대신 이 서버가 Gemini를 호출한다. API 키는 환경변수 GEMINI_API_KEY 에만 둔다.
 *   (소스코드·저장소·브라우저 어디에도 키가 남지 않는다)
 * - 정적 파일(index.html, js, css, assets)도 함께 서빙하므로 이 서버만 띄우면 데모가 돈다.
 *
 * 실행:
 *   1) .env.example 을 .env 로 복사하고 GEMINI_API_KEY=... 를 채운다   (.env 는 git에 올라가지 않는다)
 *   2) node server/proxy.mjs
 *   3) http://localhost:8787 접속 → 설정 화면에서 "실시간 AI(Gemini)" 선택
 *      프록시 주소는 비워 두면 같은 서버(/api/chat)를 사용한다.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),"..");
const PORT=Number(process.env.PORT||8787);

/* .env 읽기 (KEY=VALUE 형식, 주석 # 지원) */
for(const f of [".env",".env.local"]){
 const p=path.join(ROOT,f);
 if(!fs.existsSync(p))continue;
 for(const line of fs.readFileSync(p,"utf8").split(/\r?\n/)){
  const m=line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
  if(m&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^["']|["']$/g,"");
 }
}
const API_KEY=process.env.GEMINI_API_KEY||"";
const MODEL=process.env.GEMINI_MODEL||"gemini-3.5-flash";
if(!API_KEY)console.warn("⚠ GEMINI_API_KEY 가 설정되지 않았습니다. /api/chat 호출은 실패하고 화면은 준비된 답변으로 전환됩니다.");

const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".json":"application/json; charset=utf-8",".ico":"image/x-icon"};

const send=(res,code,body,type="application/json; charset=utf-8")=>{
 res.writeHead(code,{"Content-Type":type,"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type"});
 res.end(body);
};

const server=http.createServer(async(req,res)=>{
 if(req.method==="OPTIONS")return send(res,204,"");
 const url=new URL(req.url,`http://${req.headers.host}`);

 if(url.pathname==="/api/health")return send(res,200,JSON.stringify({ok:true,keyConfigured:!!API_KEY,model:MODEL}));

 if(url.pathname==="/api/chat"&&req.method==="POST"){
  let raw="";
  req.on("data",c=>{raw+=c;if(raw.length>1e6)req.destroy();});
  req.on("end",async()=>{
   try{
    if(!API_KEY)throw new Error("GEMINI_API_KEY 미설정");
    const body=JSON.parse(raw||"{}");
    const model=String(body.model||MODEL).replace(/[^a-zA-Z0-9.\-_]/g,"");
    const payload={contents:body.contents,systemInstruction:body.systemInstruction,generationConfig:body.generationConfig};
    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
     {method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":API_KEY},body:JSON.stringify(payload)});
    const j=await r.json();
    if(!r.ok)return send(res,r.status,JSON.stringify({error:j?.error?.message||"Gemini 호출 실패"}));
    const text=(j?.candidates?.[0]?.content?.parts||[]).map(p=>p.text||"").join("");
    send(res,200,JSON.stringify({text}));
   }catch(e){send(res,502,JSON.stringify({error:String(e.message||e)}));}
  });
  return;
 }

 /* 정적 파일 */
 let rel=decodeURIComponent(url.pathname);
 if(rel==="/")rel="/index.html";
 const file=path.join(ROOT,rel);
 if(!file.startsWith(ROOT)||!fs.existsSync(file)||fs.statSync(file).isDirectory())return send(res,404,"Not Found","text/plain; charset=utf-8");
 res.writeHead(200,{"Content-Type":MIME[path.extname(file).toLowerCase()]||"application/octet-stream","Cache-Control":"no-store"});
 fs.createReadStream(file).pipe(res);
});

server.listen(PORT,()=>console.log(`사내규정 AI 데모 + Gemini 프록시: http://localhost:${PORT}  (모델 ${MODEL}, 키 ${API_KEY?"설정됨":"없음"})`));
