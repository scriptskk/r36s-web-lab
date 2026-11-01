import test from "node:test";
import assert from "node:assert/strict";
import {deflateRawSync} from "node:zlib";
import {getZipEntries,unzipSourceFiles} from "../src/zip-import.js";
import {classifyProjectManifest,projectManifest} from "../src/project-lab.js";

function createZip(specs){
  let offset=0;
  const local=[],central=[];
  for(const item of specs){
    const name=Buffer.from(item.name,"utf8");
    const source=Buffer.from(item.body||"","utf8");
    const zip=item.compressed!==false?deflateRawSync(source):source;
    const method=item.compressed!==false?8:0;
    const localHeader=Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50,0);
    localHeader.writeUInt16LE(20,4);
    localHeader.writeUInt16LE(0x800,6);
    localHeader.writeUInt16LE(method,8);
    localHeader.writeUInt32LE(zip.length,18);
    localHeader.writeUInt32LE(source.length,22);
    localHeader.writeUInt16LE(name.length,26);
    const centralHeader=Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50,0);
    centralHeader.writeUInt16LE(20,4);
    centralHeader.writeUInt16LE(20,6);
    centralHeader.writeUInt16LE(0x800,8);
    centralHeader.writeUInt16LE(method,10);
    centralHeader.writeUInt32LE(zip.length,20);
    centralHeader.writeUInt32LE(source.length,24);
    centralHeader.writeUInt16LE(name.length,28);
    centralHeader.writeUInt32LE(offset,42);
    const block=Buffer.concat([localHeader,name,zip]);
    offset+=block.length;
    local.push(block);
    central.push(Buffer.concat([centralHeader,name]));
  }
  const center=Buffer.concat(central);
  const end=Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50,0);
  end.writeUInt16LE(specs.length,8);
  end.writeUInt16LE(specs.length,10);
  end.writeUInt32LE(center.length,12);
  end.writeUInt32LE(offset,16);
  return new Uint8Array(Buffer.concat([...local,center,end]));
}
function fakeFile(bytes){
  return {size:bytes.byteLength,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)};
}

test("imports deflate-compressed nested web project ZIP",async()=>{
  const payload=createZip([
    {name:"MyApp/dist/index.html",body:"<!doctype html><main>R36S app</main>"},
    {name:"MyApp/dist/style.css",body:"body{background:black}"},
    {name:"MyApp/dist/app.js",body:"document.title='R36S'"},
    {name:"MyApp/package.json",body:'{"scripts":{"build":"vite build"}}'},
  ]);
  const files=await unzipSourceFiles(fakeFile(payload));
  assert.equal(files.length,4);
  assert.equal((await files[0].text()).includes("R36S app"),true);
  const manifest=projectManifest(files);
  assert.equal(manifest.html,1);
  assert.equal(manifest.css,1);
  assert.equal(manifest.javascript,1);
  assert.equal(manifest.source,1);
  assert.equal(classifyProjectManifest(manifest).preview,true);
});

test("node_modules and caches are skipped while importing relevant sources",()=>{
  const items=[
    {name:"myapp/src/App.tsx",body:"export default ()=>null"},
    {name:"myapp/package.json",body:"{}"},
  ];
  for(let i=0;i<600;i++)items.push({name:"myapp/node_modules/dep"+i+"/index.js",body:"export{}"});
  const zip=createZip(items);
  const entries=getZipEntries(zip);
  assert.deepEqual(entries.map(x=>x.path),["myapp/src/App.tsx","myapp/package.json"]);
  const manifest={files:entries.map(x=>({path:x.path,category:"source"})),html:0,xml:0};
  assert.equal(classifyProjectManifest(manifest).kind,"web-source");
  assert.match(classifyProjectManifest(manifest).explanation,/build estática/);
});

test("ArkOS XML and Python projects are not falsely labeled as emulated",()=>{
  const xml={files:[{path:"theme.xml",category:"xml"}],html:0,xml:1};
  assert.equal(classifyProjectManifest(xml).kind,"emulationstation-xml");
  const py={files:[{path:"pkforge/main.py",category:"source"}],html:0,xml:0};
  assert.equal(classifyProjectManifest(py).kind,"native-scripts");
});
