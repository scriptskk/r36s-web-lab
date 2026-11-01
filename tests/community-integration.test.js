import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,statSync} from "node:fs";
import {PROJECTS} from "../src/project-lab.js";
const read=path=>readFileSync(path,"utf8");
test("community catalog lists current workspaces and truthful execution modes",()=>{
  const db=JSON.parse(read("community/catalog.json"));
  assert.deepEqual(db.projects.map(x=>x.id),["slot","pkforge"]);
  assert.equal(db.projects[0].status,"web-preview");
  assert.equal(db.projects[1].status,"native-zip-adapter");
  assert.ok(db.projects.every(p=>p.originalCodeIncluded===false));
  assert.deepEqual(PROJECTS.map(x=>x.id),["slot","pkforge"]);
  assert.match(PROJECTS[1].description,/Go\/ARM/);
});
test("Slot displays a recovered cartridge image and physical navigation entries",()=>{
  const page=read("community/slot36s/preview.html");
  assert.match(page,/cartucho-historico\.webp/);
  assert.ok(statSync("community/slot36s/assets/cartucho-historico.webp").size>2000);
  assert.ok((page.match(/data-lab-item/g)||[]).length>=2);
  assert.match(page,/GAME BOY ADVANCE/);
});
test("PKForge placeholder does not claim to contain unrecovered code",()=>{
  const page=read("community/pkforge-r36s/preview.html");
  assert.match(page,/arquivos originais/i);
  assert.ok((page.match(/data-lab-item/g)||[]).length>=2);
});
test("authenticated project sources are loaded into the R36S handheld menus",()=>{
  const ui=read("src/project-lab-ui.js");
  const app=read("src/app.js");
  assert.match(ui,/getCommunitySource\(id\)/);
  assert.match(ui,/navigateProject\(id,control\)/);
  assert.match(ui,/projectLoadRepo/);
  assert.match(app,/navigateProject\(state\.tab,control\)/);
  assert.match(app,/if\(keys\[event\.key\]\)\{event\.preventDefault\(\);act\(keys\[event\.key\]\);\}/);
});
