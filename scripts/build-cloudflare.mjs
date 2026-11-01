import {cp,copyFile,mkdir,rm,readdir,stat} from "node:fs/promises";
import path from "node:path";
const root=process.cwd();
const output=path.join(root,"dist");
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
for(const filename of ["index.html","styles.css","premium.css","monochrome.css","rom-player.html","rom-player.css"]){
  await copyFile(path.join(root,filename),path.join(output,filename));
}
await cp(path.join(root,"assets"),path.join(output,"assets"),{recursive:true});
await cp(path.join(root,"src"),path.join(output,"src"),{recursive:true});
await cp(path.join(root,"community"),path.join(output,"community"),{recursive:true});
const files=[];
for(const dir of ["","src","assets"]){
 for(const name of await readdir(path.join(output,dir))){
  const full=path.join(output,dir,name);
  if((await stat(full)).isFile())files.push(path.posix.join(dir,name));
 }
}
const expected=["index.html","styles.css","premium.css","monochrome.css","src/app.js","src/site-theme.js","src/audit.js","src/firmware.js","src/backup.js","src/community-loader.js","community/catalog.json","community/slot36s/preview.html","community/pkforge-r36s/preview.html"];
for(const filename of expected)if(!files.includes(filename))throw Error("Missing asset: "+filename);
if(files.some(f=>f.includes(".env")||f.endsWith(".db")||f.endsWith(".sqlite3")||f.startsWith("private_server/")))throw Error("Unexpected private asset");
console.log("Cloudflare asset bundle created:",files.length,"files.");
