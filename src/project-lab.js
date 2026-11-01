/** R36S Project Lab: browser-local source preview utilities. No firmware execution. */
export const PROJECTS=Object.freeze([
  Object.freeze({id:"slot",label:"Slot.R36S",description:"Workspace para importar a interface real do Slot.R36S."}),
  Object.freeze({id:"pkforge",label:"PKForge R36S",description:"Workspace para importar a interface real do PKForge R36S."})
]);
export const MAX_FILES=160;
export const MAX_TOTAL_BYTES=16*1024*1024;
export const MAX_TEXT_BYTES=1*1024*1024;
export const MAX_IMAGE_BYTES=3*1024*1024;
export const ACCEPTED_IMAGES=new Set(["png","jpg","jpeg","gif","webp"]);

export function cleanPath(input){
  if(typeof input!=="string")return null;
  const name=input.replace(/\\/g,"/").replace(/^\.\//,"").trim();
  const parts=name.split("/");
  if(!name || name.length>300 || name.startsWith("/") || parts.some(p=>!p||p===".."||p==="."||p.includes("\0")))return null;
  return name;
}
export function extension(path){
  const match=/\.([a-z0-9]+)$/i.exec(String(path||""));
  return match?match[1].toLowerCase():"";
}
export function fileCategory(path){
  const e=extension(path);
  if(e==="html"||e==="htm")return "html";
  if(e==="css")return "css";
  if(e==="xml")return "xml";
  if(ACCEPTED_IMAGES.has(e))return "image";
  return "unsupported";
}
export function projectManifest(files){
  const input=Array.from(files||[]);
  if(input.length>MAX_FILES)throw Error("Selecione no máximo 160 arquivos por projeto.");
  let total=0;
  const manifest=[];
  for(const file of input){
    const path=cleanPath(file.webkitRelativePath||file.name);
    if(!path)throw Error("Caminho inseguro em arquivo selecionado.");
    const size=Number(file.size)||0;
    total+=size;
    if(total>MAX_TOTAL_BYTES)throw Error("Limite de 16 MB por projeto. Não selecione ROMs ou backups inteiros.");
    const category=fileCategory(path);
    if((category==="html"||category==="css"||category==="xml")&&size>MAX_TEXT_BYTES)
      throw Error("HTML/CSS/XML deve ter até 1 MB por arquivo.");
    if(category==="image"&&size>MAX_IMAGE_BYTES)
      throw Error("Imagem deve ter até 3 MB por arquivo.");
    manifest.push({path,size,category});
  }
  return {files:manifest,total,count:manifest.length,
    html:manifest.filter(f=>f.category==="html").length,
    css:manifest.filter(f=>f.category==="css").length,
    images:manifest.filter(f=>f.category==="image").length,
    unsupported:manifest.filter(f=>f.category==="unsupported").length
  };
}
export function preferredFile(items,category){
  const names=items.filter(f=>f.category===category);
  if(!names.length)return null;
  const wanted=category==="html"?"index.html":category==="css"?"style.css":"theme.xml";
  return names.find(f=>f.path.toLowerCase()===wanted) ||
    names.find(f=>f.path.toLowerCase().endsWith("/"+wanted)) ||
    names.sort((a,b)=>a.path.length-b.path.length)[0];
}
export function previewPage(html,css,basePath=""){
  // Source is rendered only inside a sandboxed, script-disabled iframe.
  const safeCss=String(css||"").replace(/<\/style/gi,"<\\/style");
  const safeHtml=String(html||"");
  const csp="default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'; font-src data:; script-src 'none'; connect-src 'none'; object-src 'none'; media-src 'none'; form-action 'none'; base-uri 'none'";
  return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=640, initial-scale=1">'+
    '<meta http-equiv="Content-Security-Policy" content="'+csp+'"><style>html,body{margin:0;width:640px;min-height:480px;overflow:hidden}*{box-sizing:border-box}body{background:#101820;color:white;font-family:system-ui,sans-serif}'+safeCss+
    '</style></head><body>'+safeHtml+'</body></html>';
}
