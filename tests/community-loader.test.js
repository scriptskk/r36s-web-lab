import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {COMMUNITY_SOURCES,sourcePaths,getCommunitySource} from "../src/community-loader.js";

test("only explicitly cataloged community bundles are fetchable",()=>{
 assert.equal(sourcePaths("not-allowed"),null);
 assert.equal(sourcePaths("../private_server"),null);
 assert.equal(Object.keys(COMMUNITY_SOURCES).length,2);
 for(const id of ["slot","pkforge"]){
   const paths=sourcePaths(id);
   assert.ok(fs.existsSync(paths.html.slice(2)));
   assert.ok(fs.existsSync(paths.css.slice(2)));
 }
});
test("community preview fetch uses same-origin credentials",async()=>{
 const seen=[];
 const fetchImpl=async (url,options)=>{
   seen.push({url,options});
   return {ok:true,headers:new Headers(),text:async()=>url.endsWith(".css")?"body{}":"<p>preview</p>"};
 };
 const data=await getCommunitySource("slot",fetchImpl);
 assert.equal(data.html,"<p>preview</p>");
 assert.equal(data.css,"body{}");
 assert.ok(seen.every(r=>r.options.credentials==="same-origin"&&r.options.cache==="no-store"));
});
test("bundled metadata distinguishes recreated reference and missing originals",()=>{
 assert.equal(COMMUNITY_SOURCES.slot.origin,"historical-reconstruction");
 assert.equal(COMMUNITY_SOURCES.pkforge.origin,"placeholder");
});
