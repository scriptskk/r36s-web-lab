/** R36S Project Lab: browser-local source preview utilities. No firmware execution. */
export const PROJECTS=Object.freeze([
  Object.freeze({id:"slot",label:"SLOT36S",status:"Referência histórica reconstruída",description:"Prévia do cartucho e estilo de mídia baseada nas referências recuperadas; ainda não é o código original."}),
  Object.freeze({id:"pkforge",label:"PKForge R36S",status:"Fontes originais pendentes",description:"Pasta e prévia de referência recuperadas para organização; nenhum código original do PKForge foi localizado."})
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
  if(e==="js"||e==="mjs"||e==="cjs")return "javascript";
  if(ACCEPTED_IMAGES.has(e))return "image";
  // Keep source files visible in the archive inventory, but do not execute them.
  if(new Set(["ts","tsx","jsx","vue","svelte","json","jsonc","go","mod","sum","py","sh","bash","lua",
    "md","txt","yaml","yml","toml","ini","cfg","conf","svg","scss","sass","less"]).has(e))return "source";
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
    if((category==="html"||category==="css"||category==="xml"||category==="javascript"||category==="source")&&size>MAX_TEXT_BYTES)
      throw Error("Arquivos de texto ou código devem ter até 1 MB cada.");
    if(category==="image"&&size>MAX_IMAGE_BYTES)
      throw Error("Imagem deve ter até 3 MB por arquivo.");
    manifest.push({path,size,category});
  }
  return {files:manifest,total,count:manifest.length,
    html:manifest.filter(f=>f.category==="html").length,
    css:manifest.filter(f=>f.category==="css").length,
    javascript:manifest.filter(f=>f.category==="javascript").length,
    source:manifest.filter(f=>f.category==="source").length,
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

/** Explain compatibility without claiming a ZIP can be executed as firmware. */
export function classifyProjectManifest(manifest){
  const files=manifest?.files||[];
  const names=files.map(f=>f.path.toLowerCase());
  if(manifest.html>0){
    const app=names.some(x=>/(?:^|\/)(package\.json|vite\.config\.[^/]+|next\.config\.[^/]+)$/.test(x));
    return {kind:app?"web-build-or-static":"static-web",preview:true,
      explanation:app?"HTML localizado. Se houver módulos npm/React, é necessário importar uma build de produção (dist/build); o código-fonte pode não rodar isolado.":"HTML localizado: você pode testar a prévia imediatamente. JavaScript só roda no modo web experimental."};
  }
  if(names.some(x=>/\.(tsx?|jsx|vue|svelte)$/.test(x)) || names.some(x=>/(?:^|\/)package\.json$/.test(x)))
    return {kind:"web-source",preview:false,explanation:"Este ZIP parece conter um projeto React/Vite/TypeScript ou outro frontend não compilado. Não há HTML pronto. Gere a build estática (normalmente dist/) e importe-a para visualizar o app."};
  if(manifest.xml>0)
    return {kind:"emulationstation-xml",preview:false,explanation:"O ZIP possui arquivos XML, possivelmente um tema do EmulationStation/ArkOS. Não é uma página HTML. Esta versão ainda não interpreta nem executa temas ArkOS nativos."};
  if(names.some(x=>/\.(py|sh|bash|lua)$/.test(x)))
    return {kind:"native-scripts",preview:false,explanation:"O ZIP contém scripts Linux/Python/Lua, sem frontend HTML. Esses scripts exigem um ambiente de execução apropriado e não podem ser iniciados no navegador."};
  return {kind:"unsupported",preview:false,explanation:"Não foi encontrado HTML executável no navegador. O laboratório apenas inventariou os arquivos; envie o ZIP para analisarmos a estrutura e criar o adaptador necessário."};
}
