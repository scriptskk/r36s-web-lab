import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(p)=>readFileSync(p,"utf8");

test("R36S shoulders exposed as real clickable controls",()=>{
  const html=read("index.html");
  for(const id of ["l1","l2","r1","r2"])assert.match(html,new RegExp('data-control="'+id+'"'));
  assert.match(read("monochrome.css"),/\.shoulder-strip\{/);
});
test("keyboard and standard gamepad index mapping covers shoulders",()=>{
  const app=read("src/app.js");
  assert.match(app,/\[4,'l1'\]/);
  assert.match(app,/\[5,'r1'\]/);
  assert.match(app,/\[6,'l2'\]/);
  assert.match(app,/\[7,'r2'\]/);
  assert.match(app,/'q':'l1'/);
  assert.match(app,/'e':'r1'/);
  assert.match(app,/'z':'l2'/);
  assert.match(app,/'c':'r2'/);
});
test("opt-in JavaScript runner has opaque sandbox and separate strict CSP",()=>{
  const ui=read("src/project-lab-ui.js");
  const worker=read("cloudflare/worker.js");
  const runner=read("project-runtime.html");
  assert.match(ui,/frame\.setAttribute\("sandbox","allow-scripts"\)/);
  assert.doesNotMatch(ui,/allow-same-origin/);
  assert.match(ui,/stopProjectRuntime\(\)/);
  assert.match(ui,/unzipSourceFiles\(zip\)/);
  assert.match(worker,/pathname==="\/project-runtime\.html"/);
  assert.match(worker,/connect-src 'none'/);
  assert.match(worker,/frame-src 'none'/);
  assert.match(runner,/event\.source===window\.parent/);
  assert.match(runner,/r36s-web-lab-control-v1/);
});
test("user project sources are opened from local ZIP/folder and never sent to cloudflare",()=>{
  const ui=read("src/project-lab-ui.js");
  assert.match(ui,/id="projectZip"/);
  assert.match(ui,/id="projectEntrySelect"/);
  assert.match(ui,/id="projectFileList"/);
  assert.doesNotMatch(ui,/fetch\((?:zip|selected)/);
});
