import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync("index.html","utf8");
const css=fs.readFileSync("premium.css","utf8");
const app=fs.readFileSync("src/app.js","utf8");

test("premium page supports light/dark appearance without changing console theme",()=>{
 assert.match(html,/id="appearanceToggle"/);
 assert.match(html,/src="\.\/src\/site-theme\.js"/);
 assert.match(html,/href="\.\/premium\.css"/);
 assert.match(css,/html\[data-appearance="light"\]/);
 assert.match(css,/--page:#f5f7fb/);
 assert.match(app,/renderScreen\(\)/);
});
test("community projects live inside a real expandable navigation folder",()=>{
 assert.match(html,/id="projectFolderToggle"[^>]*aria-expanded="false"/);
 assert.match(html,/id="projectFolderContents"[^>]*hidden/);
 assert.match(html,/data-tab="projects"/);
 assert.match(html,/data-tab="slot"/);
 assert.match(html,/data-tab="pkforge"/);
 assert.match(app,/function setProjectFolder\(open\)/);
 assert.match(app,/data-open-project/);
});
test("console front preserves real 4:3 screen and navigable controls",()=>{
 assert.match(html,/class="console-screen"/);
 assert.match(css,/\.console-screen\{width:100%;aspect-ratio:4\/3/);
 assert.match(html,/data-control="up"/);
 assert.match(html,/data-control="down"/);
 assert.match(html,/data-control="left"/);
 assert.match(html,/data-control="right"/);
 assert.match(html,/data-control="confirm"/);
 assert.match(html,/class="function-key"[^>]*data-control="menu"/);
 assert.match(html,/class="front-speaker"/);
 assert.match(html,/class="thumb-row"/);
 assert.match(app,/requestAnimationFrame\(pollGamepad\)/);
});
