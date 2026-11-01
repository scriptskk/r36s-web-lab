import test from "node:test";
import assert from "node:assert/strict";
import {tokenFromRequest,verifyAccess} from "../cloudflare/access.js";

function request(headers={}) {
  return new Request("https://r36s.example.workers.dev/",{headers});
}
const env={
  TEAM_DOMAIN:"https://test-team.cloudflareaccess.com",
  POLICY_AUD:"test-audience",
  ADMIN_EMAIL:"owner@example.com"
};

test("missing assertion and cookie fail closed", async()=>{
  assert.deepEqual(tokenFromRequest(request()),{token:null,source:"missing"});
  const result=await verifyAccess(request(),env);
  assert.equal(result.identity,null);
  assert.equal(result.reason,"missing_token");
});

test("JWT assertion header has priority over browser cookie",()=>{
  const r=request({
    "cf-access-jwt-assertion":"first.second.third",
    "cookie":"CF_Authorization=four.five.six; other=example"
  });
  assert.deepEqual(tokenFromRequest(r),{token:"first.second.third",source:"header"});
});

test("browser token cookie is read without trusting its claims",async()=>{
  const r=request({"cookie":"test=one; CF_Authorization=first.second.third; other=example"});
  assert.deepEqual(tokenFromRequest(r),{token:"first.second.third",source:"cookie"});
  const result=await verifyAccess(r,env);
  assert.equal(result.identity,null);
  assert.equal(result.reason,"invalid_token_or_aud");
});

test("invalid cookie and malformed JWT cannot authenticate",async()=>{
  const bad=request({"cookie":"CF_Authorization=%GG"});
  assert.deepEqual(tokenFromRequest(bad),{token:null,source:"invalid_cookie"});
  assert.equal((await verifyAccess(bad,env)).identity,null);
  const invalid=await verifyAccess(request({"cf-access-jwt-assertion":"fake-email"}),env);
  assert.equal(invalid.reason,"invalid_token");
  assert.equal(invalid.identity,null);
});

test("trusted context requires matching app audience and administrator email",async()=>{
  const ctx={access:{
    aud:"test-audience",
    getIdentity:async()=>({email:"OWNER@example.com",id:"user-1"})
  }};
  const verified=await verifyAccess(request(),env,ctx);
  assert.equal(verified.identity?.email,"owner@example.com");
  assert.equal(verified.source,"context");
  const wrongAud=await verifyAccess(request(),env,{access:{...ctx.access,aud:"other-audience"}});
  assert.equal(wrongAud.identity,null);
  assert.equal(wrongAud.reason,"invalid_audience");
  const wrongUser=await verifyAccess(request(),env,{access:{...ctx.access,getIdentity:async()=>({email:"stranger@example.com"})}});
  assert.equal(wrongUser.identity,null);
  assert.equal(wrongUser.reason,"unauthorized_email");
});
