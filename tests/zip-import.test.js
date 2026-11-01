import test from "node:test";
import assert from "node:assert/strict";
import {getZipEntries,unzipSourceFiles} from "../src/zip-import.js";

function archive(name,content="hello",options={}){
  const filename=Buffer.from(name);
  const payload=Buffer.from(content);
  const local=Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50,0);local.writeUInt16LE(20,4);
  local.writeUInt16LE(0,8);local.writeUInt32LE(payload.length,18);
  local.writeUInt32LE(payload.length,22);local.writeUInt16LE(filename.length,26);
  const central=Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50,0);central.writeUInt16LE(20,4);
  central.writeUInt16LE(20,6);central.writeUInt16LE(0,10);
  central.writeUInt32LE(payload.length,20);
  central.writeUInt32LE(options.uncompressed??payload.length,24);
  central.writeUInt16LE(filename.length,28);
  const centerOffset=local.length+filename.length+payload.length;
  const end=Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(1,8);
  end.writeUInt16LE(1,10);end.writeUInt32LE(central.length+filename.length,12);
  end.writeUInt32LE(centerOffset,16);
  return new Uint8Array(Buffer.concat([local,filename,payload,central,filename,end]));
}
test("imports local HTML from a ZIP without submitting data to a server",async()=>{
  const zip=archive("project/index.html","<main>TEST</main>");
  const fake={size:zip.length,arrayBuffer:async()=>zip.buffer.slice(zip.byteOffset,zip.byteOffset+zip.byteLength)};
  const result=await unzipSourceFiles(fake);
  assert.equal(result.length,1);
  assert.equal(result[0].name,"project/index.html");
  assert.equal(await result[0].text(),"<main>TEST</main>");
});
test("refuses traversal, oversized entries, corrupt and unsupported ZIP formats",()=>{
  assert.throws(()=>getZipEntries(archive("../private/file.css","x")),/inseguro/);
  assert.throws(()=>getZipEntries(archive("app/index.html","a",{uncompressed:2_000_000})),/muito grande/);
  assert.throws(()=>getZipEntries(new Uint8Array(8)),/ZIP inválido/);
  assert.deepEqual(getZipEntries(archive("firmware/system.img","demo")),[]);
});
test("accepts JS sources for inventory, but they are not executed",()=>{
  const entries=getZipEntries(archive("app/dist/bundle.js","alert('only metadata');"));
  assert.equal(entries.length,1);
  assert.equal(entries[0].path,"app/dist/bundle.js");
});
