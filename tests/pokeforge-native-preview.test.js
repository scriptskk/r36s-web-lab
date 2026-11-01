import test from "node:test";
import assert from "node:assert/strict";
import {isPokeForgeNativeArchive,newPokeForgePreview,pokeForgeControl,pokeForgeEntries,renderPokeForgePreview} from "../src/pokeforge-native-preview.js";
import {fileCategory,projectManifest} from "../src/project-lab.js";
import {readFileSync} from "node:fs";

test("recognizes native Go/ARM PokeForge archive from original filename patterns",()=>{
 const files=[
 {path:"codigo-fonte/main.go"},
 {path:"EASYROMS/ports/PokeForge R36S.sh"},
 {path:"EASYROMS/ports/pokeforge-r36s/data/pokedex.json"}
 ];
 assert.equal(isPokeForgeNativeArchive(files),true);
 assert.equal(isPokeForgeNativeArchive([{path:"src/main.tsx"},{path:"package.json"}]),false);
 assert.equal(fileCategory("codigo-fonte/main.go"),"source");
 assert.equal(fileCategory("EASYROMS/ports/PokeForge R36S.sh"),"source");
});
test("renders eight native PokeForge pages at 640x480 without launching binaries",()=>{
 const state=newPokeForgePreview([{id:1,name:"Bulbasaur"},{id:25,name:"Pikachu"}]);
 const initial=renderPokeForgePreview(state);
 assert.match(initial.html,/WELCOME \/ PKFORGE R36S/);
 assert.match(initial.html,/HOME/);
 assert.match(initial.css,/width:640px;height:480px/);
 assert.match(initial.html,/NOT NATIVE EXECUTION/);
 for(let i=0;i<7;i++)pokeForgeControl(state,"r2");
 assert.equal(state.page,7);
 assert.match(renderPokeForgePreview(state).html,/POKEDEX \/ GENERATIONS/);
 assert.match(renderPokeForgePreview(state).html,/BULBASAUR/);
 pokeForgeControl(state,"confirm");
 assert.match(renderPokeForgePreview(state).html,/POKEMON DETAILS/);
 pokeForgeControl(state,"back");
 assert.equal(state.detail,false);
});
test("PokeForge shoulders switch tabs and generations as in the provided Go sources",()=>{
 const state=newPokeForgePreview([{id:1,name:"Bulbasaur"},{id:152,name:"Chikorita"}]);
 pokeForgeControl(state,"l2");assert.equal(state.page,7);
 pokeForgeControl(state,"r1");assert.equal(state.gen,1);
 assert.equal(pokeForgeEntries(state)[0].name,"Chikorita");
 pokeForgeControl(state,"r2");assert.equal(state.page,0);
 pokeForgeControl(state,"confirm");assert.equal(state.page,1);
 pokeForgeControl(state,"r1");assert.equal(state.box,1);
 assert.match(renderPokeForgePreview(state).html,/PC BOX 02 \/ 14/);
});
test("only UI adapter/metadata is checked in: not the user's ARM executable",()=>{
 const ui=readFileSync("src/project-lab-ui.js","utf8");
 assert.match(ui,/isPokeForgeNativeArchive\(manifest.files\)/);
 assert.match(ui,/newPokeForgePreview\(entries\)/);
 assert.match(ui,/pokedex\\.json/);
 assert.match(ui,/pokeForgeControl\(p.nativePreview,control\)/);
});
