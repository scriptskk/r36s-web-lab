const CATEGORY_SEGMENTS = Object.freeze({
  roms:["roms","games","rom","game"],
  themes:["themes","theme"],
  bios:["bios","system"],
  emulators:["emulators","emulator","retroarch","cores"],
  settings:["config","configs","settings"]
});
export function classifyBackupPath(rawPath) {
  const path=String(rawPath||"").replace(/\\/g,"/");
  if(!path || path.length>1024 || path.startsWith("/") || path.includes("\0") || path.split("/").some(s=>s===".." || s===".")) return "invalid";
  const segments=path.toLowerCase().split("/");
  for(const [category,aliases] of Object.entries(CATEGORY_SEGMENTS)){
    if(segments.some(s=>aliases.includes(s)))return category;
  }
  return "other";
}
export function summarizeBackupFiles(fileList) {
  const input=Array.from(fileList||[]);
  if(input.length>20000)throw new Error("Limite de 20.000 arquivos por seleção.");
  const summary={total:0,totalBytes:0,roms:0,themes:0,bios:0,emulators:0,settings:0,other:0,rejected:0};
  for(const file of input){
    const category=classifyBackupPath(file.webkitRelativePath || file.name);
    if(category==="invalid"){summary.rejected++;continue;}
    summary.total++;
    summary.totalBytes+=Number(file.size)||0;
    summary[category]++;
  }
  return summary;
}
