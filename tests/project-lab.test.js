import test from "node:test";
import assert from "node:assert/strict";
import {PROJECTS,cleanPath,projectManifest,preferredFile,previewPage,fileCategory} from "../src/project-lab.js";

test("Slot and PKForge are named as workspaces, not claimed to run ArkOS",()=>{
 assert.deepEqual(PROJECTS.map(p=>p.id),["slot","pkforge"]);
});
test("rejects traversal and excessive source files",()=>{
 assert.equal(cleanPath("../secret"),null);
 assert.equal(cleanPath("app/../secret"),null);
 assert.equal(cleanPath("safe/assets/logo.png"),"safe/assets/logo.png");
 assert.throws(()=>projectManifest([{name:"index.html",size:17_000_000}]),/16 MB/);
 assert.throws(()=>projectManifest([{name:"index.html",size:1_200_000}]),/1 MB/);
});
test("recognizes HTML CSS XML and image assets without reading ROMs",()=>{
 const items=[{name:"project/index.html",webkitRelativePath:"project/index.html",size:500},
 {name:"style.css",webkitRelativePath:"project/style.css",size:100},
 {name:"asset.png",webkitRelativePath:"project/assets/asset.png",size:400},
 {name:"game.chd",webkitRelativePath:"project/game.chd",size:100}];
 const m=projectManifest(items);
 assert.equal(m.total,1100);assert.equal(m.html,1);assert.equal(m.css,1);assert.equal(m.images,1);assert.equal(m.unsupported,1);
 assert.equal(preferredFile(m.files,"html").path,"project/index.html");
 assert.equal(fileCategory("foo.img"),"unsupported");
});
test("preview document forces CSP to disallow scripts and network",()=>{
 const result=previewPage("<h1>Slot</h1>","h1{color:red}");
 assert.match(result,/width=640/);
 assert.match(result,/script-src 'none'/);
 assert.match(result,/connect-src 'none'/);
 assert.match(result,/<h1>Slot<\/h1>/);
});
