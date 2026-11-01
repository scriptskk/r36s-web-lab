import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync,statSync} from "node:fs";

const html=readFileSync("index.html","utf8");
const mono=readFileSync("monochrome.css","utf8");
const base=readFileSync("src/model.js","utf8");

test("user-supplied transparent console image is committed and displayed",()=>{
  assert.ok(existsSync("assets/r36s-reference.webp"));
  assert.ok(statSync("assets/r36s-reference.webp").size>1000);
  assert.match(html,/class="console-reference-image"[^>]*src="\.\/assets\/r36s-reference\.webp"/);
  assert.match(mono,/\.console-shell\s*\{[\s\S]*?aspect-ratio:154\/240/);
  assert.match(mono,/\.console-upper\{[^}]*top:4\.3%/);
  assert.match(mono,/\.console-screen\{[^}]*aspect-ratio:4\/3/);
});

test("monochrome design has accessible dark and light states without blue page cards",()=>{
  assert.match(html,/href="\.\/monochrome\.css"/);
  assert.match(html,/id="appearanceToggle"/);
  assert.match(mono,/html\[data-appearance="light"\]/);
  assert.match(mono,/--page:#080808/);
  assert.match(mono,/--page:#fbfbfa/);
  assert.match(mono,/\.inspector-card\{background:transparent/);
  assert.match(base,/accent: '#ececec'/);
});
test("photo overlays keep screen buttons, gamepad and project folders",()=>{
  for(const action of ["up","down","left","right","confirm","back","menu"])
    assert.match(html,new RegExp('data-control="'+action+'"'));
  assert.match(mono,/\.console-shell \.controls :is\(button\)\{pointer-events:auto/);
  assert.match(html,/id="projectFolderContents"/);
  assert.match(html,/id="projectPreviewFrame"/);
});
