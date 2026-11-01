import test from "node:test";
import assert from "node:assert/strict";
import {formatSize, imageType, inspectFirmwareHeader} from "../src/firmware.js";

test("recognizes raw and compressed firmware images",()=>{
  assert.equal(imageType("ArkOS_R36S.IMG.XZ"),".img.xz");
  assert.equal(imageType("backup.img"),".img");
  assert.equal(imageType("malware.exe"),null);
  assert.equal(formatSize(1073741824),"1 GB");
});
test("reads MBR partitions without executing disk content",()=>{
  const b=new Uint8Array(34816);
  b[510]=0x55;b[511]=0xaa;
  b[450]=0x83;b[454]=0x00;b[455]=0x08; // LBA 2048
  b[458]=0x00;b[459]=0x10; // 4096 sectors
  const parsed=inspectFirmwareHeader(b,"ArkOS.img",16*1024*1024);
  assert.equal(parsed.partitions.length,1);
  assert.equal(parsed.partitions[0].start,2048);
  assert.equal(parsed.partitions[0].bytes,4096*512);
  assert.equal(parsed.classification,"Imagem de disco com assinatura MBR");
});
test("recognizes ISO 9660 and does not mistake it for an ArkOS SD image",()=>{
  const b=new Uint8Array(34816);
  b.set([67,68,48,48,49],32769);
  const parsed=inspectFirmwareHeader(b,"game.iso",50000000);
  assert.equal(parsed.classification,"Imagem óptica ISO 9660");
});
test("compressed image is marked as non-executable",()=>{
  const parsed=inspectFirmwareHeader(new Uint8Array(8),"image.img.xz",100);
  assert.equal(parsed.classification,"Imagem compactada");
  assert.equal(parsed.partitions.length,0);
});
