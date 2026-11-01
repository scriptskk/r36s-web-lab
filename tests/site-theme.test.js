import test from "node:test";
import assert from "node:assert/strict";
import {validAppearance,resolveAppearance,applyAppearance} from "../src/site-theme.js";
test("only accepts dark or light appearance, independently from theme studio",()=>{
  assert.equal(validAppearance("light"),"light");
  assert.equal(validAppearance("dark"),"dark");
  assert.equal(validAppearance(""),null);
  assert.equal(validAppearance("javascript:evil"),null);
});
test("uses persisted choice, otherwise OS preference",()=>{
  assert.equal(resolveAppearance("light",true),"light");
  assert.equal(resolveAppearance("dark",false),"dark");
  assert.equal(resolveAppearance(null,false),"light");
  assert.equal(resolveAppearance(null,true),"dark");
});
test("updates html theme and color-scheme in a DOM-like root",()=>{
  const root={dataset:{},style:{}};
  assert.equal(applyAppearance("light",root),"light");
  assert.equal(root.dataset.appearance,"light");
  assert.equal(root.style.colorScheme,"light");
});
