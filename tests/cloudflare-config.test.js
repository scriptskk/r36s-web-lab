import test from "node:test";
import assert from "node:assert/strict";
import {configurationIssues,normalizeTeamDomain} from "../cloudflare/config.js";

const valid={
  TEAM_DOMAIN:"https://my-team.cloudflareaccess.com",
  POLICY_AUD:"some-long-audience-value",
  ADMIN_EMAIL:"owner@example.com",
  CSRF_SECRET:"this-is-only-a-placeholder-test-key-with-40-characters",
  DB:{prepare:()=>{}},
  ASSETS:{fetch:()=>{}}
};

test("rejects absent Worker config with key names only",()=>{
  assert.deepEqual(configurationIssues({}),[
    "TEAM_DOMAIN","POLICY_AUD","ADMIN_EMAIL","CSRF_SECRET","DB","ASSETS"
  ]);
});
test("recognizes valid bindings and identity settings",()=>{
  assert.deepEqual(configurationIssues(valid),[]);
  assert.equal(normalizeTeamDomain("https://my-team.cloudflareaccess.com"),"https://my-team.cloudflareaccess.com");
});
test("rejects malformed team domain, short secret and bad binding",()=>{
  assert.deepEqual(configurationIssues({...valid,
    TEAM_DOMAIN:"https://evil.example/path",
    CSRF_SECRET:"123",
    DB:{}
  }),["TEAM_DOMAIN","CSRF_SECRET","DB"]);
});
test("diagnostics do not include secret or email values",()=>{
  const out=configurationIssues({...valid,CSRF_SECRET:"short",ADMIN_EMAIL:"not-email"});
  const text=JSON.stringify(out);
  assert.ok(out.includes("CSRF_SECRET"));
  assert.ok(out.includes("ADMIN_EMAIL"));
  assert.ok(!text.includes("not-email"));
  assert.ok(!text.includes("short"));
});
