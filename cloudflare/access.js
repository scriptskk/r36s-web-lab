/**
 * Cloudflare Access identity guard.
 *
 * Workers with Static Assets run behind an internal router: ctx.access may
 * not be forwarded to the user Worker. Validate the assertion header or
 * Cloudflare's CF_Authorization browser cookie against trusted JWKS.
 * Never trust an unsigned identity header, raw email or cookie content.
 */
import {createRemoteJWKSet, jwtVerify} from "jose";
import {normalizeTeamDomain} from "./config.js";

const jwksCache=new Map();
function keys(issuer) {
  if(!jwksCache.has(issuer)) {
    jwksCache.set(issuer,createRemoteJWKSet(new URL(issuer+"/cdn-cgi/access/certs")));
  }
  return jwksCache.get(issuer);
}

export function tokenFromRequest(request) {
  const header=request.headers.get("cf-access-jwt-assertion");
  if(header) return {token:header.trim(),source:"header"};
  const cookies=request.headers.get("cookie")||"";
  for(const item of cookies.split(";")){
    const split=item.indexOf("=");
    if(split<0)continue;
    if(item.slice(0,split).trim()!=="CF_Authorization")continue;
    const raw=item.slice(split+1).trim();
    // A valid JWT is three base64url sections separated by periods.
    // Decode optional cookie percent escapes, but never expose the value.
    let token;
    try {token=decodeURIComponent(raw.replace(/^"|"$/g,""));}catch{return {token:null,source:"invalid_cookie"};}
    return {token,source:"cookie"};
  }
  return {token:null,source:"missing"};
}

export async function verifyAccess(request,env,ctx) {
  const {token,source}=tokenFromRequest(request);
  const issuer=normalizeTeamDomain(env.TEAM_DOMAIN);
  if(!issuer || !env.POLICY_AUD || !env.ADMIN_EMAIL) return {identity:null,reason:"invalid_config"};

  // Cloudflare's trusted context may be available for Workers without the
  // Static Assets router. It is not derived from user-provided HTTP headers.
  if(!token && ctx?.access && typeof ctx.access.getIdentity==="function"){
    try {
      if(ctx.access.aud!==env.POLICY_AUD.trim())return {identity:null,reason:"invalid_audience"};
      const person=await ctx.access.getIdentity();
      const email=String(person?.email||"").toLowerCase().trim();
      if(email!==env.ADMIN_EMAIL.toLowerCase().trim())return {identity:null,reason:"unauthorized_email"};
      return {identity:{email,sub:String(person?.id||email)},source:"context"};
    }catch{return {identity:null,reason:"invalid_context"};}
  }

  if(!token) return {identity:null,reason:"missing_token"};
  // No fallback from a bad header to a good cookie: reject ambiguous claims.
  if(token.length>8192 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token))
    return {identity:null,reason:"invalid_token"};
  try {
    const {payload}=await jwtVerify(token,keys(issuer),{
      issuer,audience:env.POLICY_AUD.trim(),algorithms:["RS256"]
    });
    const email=typeof payload.email==="string" ? payload.email.trim().toLowerCase() : "";
    if(!email || email!==env.ADMIN_EMAIL.trim().toLowerCase())
      return {identity:null,reason:"unauthorized_email"};
    return {identity:{email,sub:String(payload.sub||email)},source};
  }catch{
    return {identity:null,reason:"invalid_token_or_aud"};
  }
}
