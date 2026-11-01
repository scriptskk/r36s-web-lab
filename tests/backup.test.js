import test from "node:test";
import assert from "node:assert/strict";
import {classifyBackupPath,summarizeBackupFiles} from "../src/backup.js";
test("categorizes R36S directory export without reading file bytes",()=>{
 assert.equal(classifyBackupPath("EASYROMS/roms/psx/game.chd"),"roms");
 assert.equal(classifyBackupPath("gamedata/themes/theme.xml"),"themes");
 assert.equal(classifyBackupPath("bios/scph5501.bin"),"bios");
 assert.equal(classifyBackupPath("../../private/password"),"invalid");
 const data=summarizeBackupFiles([{webkitRelativePath:"sd/roms/nes/test.nes",size:123},{webkitRelativePath:"sd/themes/a.xml",size:200}]);
 assert.equal(data.total,2);assert.equal(data.totalBytes,323);assert.equal(data.roms,1);assert.equal(data.themes,1);
});
