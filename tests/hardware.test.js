import test from "node:test";
import assert from "node:assert/strict";
import {R36S_REFERENCE,aspectRatio,validateReference} from "../src/hardware.js";
test("hardware reference has correct 640x480 screen and 1 GiB RAM",()=>{
 assert.ok(validateReference());
 assert.equal(R36S_REFERENCE.display.aspect,"4:3");
 assert.equal(aspectRatio(640,480),"4:3");
 assert.equal(R36S_REFERENCE.ram.installedMiB,1024);
});
test("hardware reference never claims ArkOS boot or enforced RAM",()=>{
 assert.equal(R36S_REFERENCE.runtime.arkosBoot,false);
 assert.equal(R36S_REFERENCE.ram.enforced,false);
 assert.equal(R36S_REFERENCE.gpu.execution,"unavailable");
});
