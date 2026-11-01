import {configurationIssues} from "./config.js";
import {verifyAccess} from "./access.js";

const ALLOWED_ACTIONS = new Set([
  "theme_updated","theme_exported","theme_reset","gamelist_imported",
  "library_reset","snapshot_exported","firmware_inspected",
  "rom_launch_requested","model_opened","backup_indexed",
  "project_imported","project_preview_updated","project_exported","project_source_loaded","project_runtime_launched"
]);
const META_STRINGS = new Set(["system","format","section"]);
const META_NUMBERS = new Set(["count","size_bytes"]);
const enc=new TextEncoder();
const json=(value,status=200)=>new Response(JSON.stringify(value), {
  status,
  headers:{
    "content-type":"application/json; charset=utf-8",
    "cache-control":"no-store",
    "x-content-type-options":"nosniff",
    "x-frame-options":"SAMEORIGIN",
    "referrer-policy":"no-referrer",
    "x-robots-tag":"noindex, nofollow, noarchive"
  }
});

async function sign(env,message) {
  const key=await crypto.subtle.importKey("raw",enc.encode(env.CSRF_SECRET),"HMAC",false,["sign"]);
  const bytes=new Uint8Array(await crypto.subtle.sign("HMAC",key,enc.encode(message)));
  return Array.from(bytes,x=>x.toString(16).padStart(2,"0")).join("");
}
async function csrfToken(env,identity){
  const expires=Date.now()+15*60*1000;
  const challenge=expires+"."+identity.sub;
  return expires+"."+(await sign(env,challenge));
}
async function checkCsrf(request,env,identity){
  if(new URL(request.url).origin!==request.headers.get("origin"))return false;
  if(request.headers.get("sec-fetch-site") && !["same-origin","none"].includes(request.headers.get("sec-fetch-site")))return false;
  const received=request.headers.get("x-csrftoken")||"";
  const match=/^(\d{13})\.([0-9a-f]{64})$/.exec(received);
  if(!match)return false;
  const expires=Number(match[1]);
  if(!Number.isFinite(expires) || expires<Date.now() || expires>Date.now()+16*60*1000)return false;
  const expected=await sign(env,match[1]+"."+identity.sub);
  // Constant-time comparison avoids leaking how much of the signature matched.
  let difference=0;
  for(let i=0;i<64;i++)difference|=expected.charCodeAt(i)^match[2].charCodeAt(i);
  return difference===0;
}
function metadata(details){
  if(!details || typeof details!=="object" || Array.isArray(details) || Object.keys(details).length>8)return null;
  const result={};
  for(const [key,value] of Object.entries(details)){
    if(META_STRINGS.has(key) && typeof value==="string")result[key]=value.slice(0,40);
    if(META_NUMBERS.has(key) && Number.isSafeInteger(value) && value>=0 && value <= 2**50)result[key]=value;
  }
  return result;
}

export default {
  async fetch(request,env,ctx){
    const issues=configurationIssues(env);
    if(issues.length)return json({error:"Instância não configurada.",verificar:issues},503);
    const access=await verifyAccess(request,env,ctx);
    if(!access.identity)return json({
      error:"Acesso negado. Faça login pelo Cloudflare Access.",
      diagnostico:access.reason
    },403);
    const identity=access.identity;
    const {pathname}=new URL(request.url);
    try{
      if(pathname==="/api/session" && request.method==="GET"){
        return json({authenticated:true,mode:"cloudflare",csrf_token:await csrfToken(env,identity)});
      }
      if(pathname==="/api/audit" && request.method==="GET"){
        const raw=new URL(request.url).searchParams.get("limit")||"60";
        const count=Number(raw);
        if(!Number.isInteger(count)||count<1||count>100)return json({error:"Limite inválido"},400);
        const {results}=await env.DB.prepare(
          "SELECT id,occurred_at AS at,action,details_json,origin FROM audit ORDER BY id DESC LIMIT ?"
        ).bind(count).all();
        return json({events:results.map(row=>({
          id:row.id,at:row.at,action:row.action,
          details:JSON.parse(row.details_json),origin:row.origin
        }))});
      }
      if(pathname==="/api/audit" && request.method==="POST"){
        if(!await checkCsrf(request,env,identity))return json({error:"CSRF inválido"},403);
        if(!((request.headers.get("content-type")||"").includes("application/json")))return json({error:"Use application/json"},415);
        const raw=await request.text();
        if(raw.length>2048)return json({error:"Evento excede 2 KB"},413);
        let obj;try{obj=JSON.parse(raw)}catch{return json({error:"JSON inválido"},400)}
        if(!obj || !ALLOWED_ACTIONS.has(obj.action))return json({error:"Evento não permitido"},400);
        const details=metadata(obj.details??{});
        if(details===null)return json({error:"Metadados inválidos"},400);
        await env.DB.prepare(
          "INSERT INTO audit(action,details_json,origin) VALUES (?,?,?)"
        ).bind(obj.action,JSON.stringify(details),"access").run();
        return json({ok:true},201);
      }
      if(pathname==="/logout" && request.method==="POST"){
        if(!await checkCsrf(request,env,identity))return json({error:"CSRF inválido"},403);
        return Response.redirect(new URL("/cdn-cgi/access/logout",request.url),303);
      }
      if(pathname.startsWith("/api/"))return json({error:"Rota não encontrada"},404);
      if(request.method!=="GET"&&request.method!=="HEAD")return json({error:"Método não permitido"},405);
      // All source files in the asset bundle are public-code, but the worker gate is private.
      const result=await env.ASSETS.fetch(request);
      const response=new Response(result.body,result);
      response.headers.set("cache-control","private, no-store");
      response.headers.set("x-content-type-options","nosniff");
      response.headers.set("x-robots-tag","noindex, nofollow, noarchive");
      response.headers.set("referrer-policy","no-referrer");
      response.headers.set("x-frame-options","SAMEORIGIN");
      // JS execution is only permitted inside a dedicated opaque-origin iframe,
      // with CSP isolation. Do not weaken the main site CSP to run imported code.
      if(pathname==="/project-runtime.html"){
        response.headers.set("content-security-policy",
          "default-src 'none'; base-uri 'none'; object-src 'none'; form-action 'none'; "+
          "frame-ancestors 'self'; connect-src 'none'; frame-src 'none'; "+
          "script-src 'unsafe-inline'; style-src 'unsafe-inline'; "+
          "img-src data: blob:; font-src data:; media-src 'none'");
      }else{
        response.headers.set("content-security-policy",
          "default-src 'self'; base-uri 'none'; object-src 'none'; form-action 'self'; frame-ancestors 'self'; "+
          "script-src 'self' https://cdn.emulatorjs.org 'wasm-unsafe-eval'; "+
          "connect-src 'self' blob: https://cdn.emulatorjs.org; "+
          "frame-src 'self' https://sketchfab.com; "+
          "img-src 'self' data: blob: https:; media-src 'self' blob:; "+
          "style-src 'self' 'unsafe-inline' https://cdn.emulatorjs.org; "+
          "font-src 'self' data: https://cdn.emulatorjs.org; worker-src 'self' blob:");
      }
      return response;
    }catch(error){
      // Do not leak user info, SQL, or stack traces.
      return json({error:"Falha temporária na aplicação ou banco D1."},503);
    }
  }
};
