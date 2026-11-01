import {PROJECTS,projectManifest,preferredFile,previewPage,fileCategory,classifyProjectManifest} from "./project-lab.js";
import {auditAction} from "./audit.js";
import {getCommunitySource,COMMUNITY_SOURCES} from "./community-loader.js";
import {unzipSourceFiles} from "./zip-import.js";
import {isPokeForgeNativeArchive,newPokeForgePreview,pokeForgeControl,renderPokeForgePreview} from "./pokeforge-native-preview.js";

const STORAGE="r36s-web-lab:project-drafts:v1";
const projects=Object.fromEntries(PROJECTS.map(p=>[p.id,{html:"",css:"",assetMap:new Map(),fileCount:0,xmlCount:0,localFiles:[],htmlEntries:[],scriptMap:new Map(),runJS:false,nativePreview:null,repoLoaded:false,selectedIndex:0,detail:false,edited:false}]));
function readDrafts(){
  try{
    const drafts=JSON.parse(localStorage.getItem(STORAGE)||"{}");
    for(const id of Object.keys(projects)){
      if(typeof drafts[id]?.html==="string" && drafts[id].html.length<50000)projects[id].html=drafts[id].html;
      if(typeof drafts[id]?.css==="string" && drafts[id].css.length<50000)projects[id].css=drafts[id].css;
    }
  }catch{/* Invalid drafts do not block the application. */}
}
readDrafts();
function saveDrafts(){
  try{
    const drafts=Object.fromEntries(Object.entries(projects).map(([id,p])=>[id,{html:p.html,css:p.css}]));
    const value=JSON.stringify(drafts);
    if(value.length<=100_000)localStorage.setItem(STORAGE,value);
  }catch{/* Private browsing may block localStorage. */}
}
function escapeText(value){
  return String(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function resolveRelative(base,target){
  if(typeof target!=="string"||!target.trim()||/^[a-z][\w+.-]*:/i.test(target)||target.startsWith("//")||target.startsWith("#")||target.startsWith("/"))return null;
  const stack=base.split("/").filter(Boolean);
  stack.pop();
  for(const seg of target.split(/[?#]/)[0].split("/")){
    if(!seg||seg===".")continue;
    if(seg===".."){if(!stack.length)return null;stack.pop();}
    else stack.push(seg);
  }
  return stack.join("/");
}
function assetFor(map,base,relative){
  const direct=resolveRelative(base,relative);
  if(direct && map.has(direct))return map.get(direct);
  const clean=relative.replace(/^\.\//,"").replace(/[?#].*$/,"");
  if(map.has(clean))return map.get(clean);
  return null;
}
function sandboxHTML(source,assets,entry){
  // HTML DOMParser is inert; the result is rendered in an opaque-origin
  // sandbox with CSP script-src 'none', connect-src 'none' and frame-src 'none'.
  const doc=new DOMParser().parseFromString(String(source||""),"text/html");
  for(const element of [...doc.querySelectorAll("script,iframe,object,embed,form,meta,link,base,template,svg,math,video,audio,source")])element.remove();
  for(const element of [...doc.querySelectorAll("*")]){
    for(const attr of [...element.attributes]){
      const name=attr.name.toLowerCase();
      if(name.startsWith("on") || ["srcset","nonce","integrity","formaction","xlink:href"].includes(name)){
        element.removeAttribute(attr.name);
      } else if(name==="src" || name==="poster"){
        const img=element.tagName.toLowerCase()==="img";
        const asset=img?assetFor(assets,entry,attr.value):null;
        if(asset)element.setAttribute(attr.name,asset);
        else element.removeAttribute(attr.name);
      } else if(name==="href"){
        element.removeAttribute(attr.name);
      }
    }
  }
  return doc.body.innerHTML;
}
function sandboxCSS(css,assets,cssPath){
  return String(css||"").replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi,(_full,_q,location)=>{
    const found=assetFor(assets,cssPath,location.trim());
    return found?'url("'+found+'")':'url("")';
  });
}
function placeholder(id){
  const label=PROJECTS.find(p=>p.id===id)?.label||"R36S";
  return '<main style="height:480px;display:grid;place-content:center;text-align:center;padding:50px;background:#121b28;color:#a7bed8;font-family:system-ui,sans-serif">'+
    '<p style="font-size:12px;letter-spacing:4px;color:#79b5f7">PROJECT LAB · 640 × 480</p>'+
    '<h1 style="margin:8px 0 3px;color:#f2f7ff">'+escapeText(label)+'</h1>'+
    '<p style="font-size:15px">Nenhum frontend importado.</p><p style="font-size:13px">Selecione uma pasta HTML/CSS real para visualizar o projeto.</p></main>';
}
function navigablePreview(html,p){
  const doc=new DOMParser().parseFromString(html,"text/html");
  const entries=Array.from(doc.querySelectorAll("[data-lab-item]"));
  if(!entries.length){p.detail=false;p.selectedIndex=0;return doc.body.innerHTML;}
  p.selectedIndex=Math.min(p.selectedIndex,entries.length-1);
  if(p.detail){
    const item=entries[p.selectedIndex];
    const title=escapeText(item.getAttribute("data-preview-title")||item.textContent||"Detalhes");
    const detail=escapeText(item.getAttribute("data-preview-description")||"Item de prévia: descrição não disponível.");
    return '<main style="height:480px;background:#090909;color:#f0f0f0;display:flex;flex-direction:column;padding:27px;font:18px/1.6 ui-monospace,monospace">'+
      '<div style="font-size:12px;letter-spacing:2px;color:#aaa;border-bottom:1px solid #555;padding-bottom:12px">PROJECT LAB / DETAIL</div>'+
      '<h1 style="font-size:26px;margin:38px 0 15px">'+title+'</h1><p style="font-size:16px;color:#bbb;max-width:570px">'+detail+'</p>'+
      '<div style="margin-top:auto;font-size:12px;letter-spacing:2px;border-top:1px solid #555;padding-top:13px">B / ESC = VOLTAR</div></main>';
  }
  entries.forEach((entry,i)=>entry.setAttribute("data-active",i===p.selectedIndex?"true":"false"));
  return doc.body.innerHTML;
}
export function navigateProject(id,control){
  const p=projects[id];if(!p)return false;
  if(p.nativePreview){
    const handled=pokeForgeControl(p.nativePreview,control);
    if(handled)projectPreview(id);
    return handled;
  }
  if(!p.html)return false;
  if(p.runJS){
    const frame=document.getElementById("projectPreviewFrame");
    frame?.contentWindow?.postMessage({type:"r36s-web-lab-control-v1",control},"*");
    return true;
  }
  const doc=new DOMParser().parseFromString(p.html,"text/html");
  const count=doc.querySelectorAll("[data-lab-item]").length;
  if(!count)return false;
  if(control==="up"||control==="left"){p.detail=false;p.selectedIndex=(p.selectedIndex+count-1)%count;}
  else if(control==="down"||control==="right"){p.detail=false;p.selectedIndex=(p.selectedIndex+1)%count;}
  else if(control==="confirm"){p.detail=true;}
  else if(control==="back"){p.detail=false;}
  else if(control==="menu"){p.detail=false;p.selectedIndex=0;}
  else return false;
  projectPreview(id);
  return true;
}
function localScripts(p){
  if(!p.html||!p.runJS)return [];
  const documentSource=new DOMParser().parseFromString(p.html,"text/html");
  const found=[];
  for(const element of [...documentSource.querySelectorAll("script")]){
    if(found.length>=40)break;
    const type=(element.getAttribute("type")||"").toLowerCase();
    if(type && !["module","text/javascript","application/javascript"].includes(type))continue;
    const path=element.getAttribute("src");
    let code=path?assetFor(p.scriptMap,p.entry||"index.html",path):element.textContent;
    if(typeof code!=="string" || code.length>1_000_000)continue;
    found.push({code,kind:type==="module"?"module":"classic"});
  }
  return found;
}
export function isProjectRuntimeEnabled(id){return !!projects[id]?.runJS;}
export function stopProjectRuntime(){
  for(const project of Object.values(projects))project.runJS=false;
  const frame=document.getElementById("projectPreviewFrame");
  if(frame){
    frame.onload=null;
    frame.removeAttribute("srcdoc");
    frame.setAttribute("sandbox","");
    frame.src="about:blank";
  }
}
export function projectPreview(id){
  const p=projects[id];if(!p)return;
  const frame=document.getElementById("projectPreviewFrame");
  if(!frame)return;
  if(p.nativePreview){
    // Interpret the UI layout from the Go package, not its ARM executable.
    const screen=renderPokeForgePreview(p.nativePreview);
    frame.onload=null;frame.setAttribute("sandbox","");frame.removeAttribute("src");
    frame.srcdoc=previewPage(screen.html,screen.css);
    return;
  }
  const entry=p.entry||"index.html";
  const html=p.html.trim()?sandboxHTML(p.html,p.assetMap,entry):placeholder(id);
  const css=sandboxCSS(p.css,p.assetMap,p.cssEntry||entry);
  if(p.runJS){
    // Opt-in, opaque-origin iframe. Scripts cannot reach the authenticated
    // application, Cloudflare bindings, parent storage, network or forms.
    frame.setAttribute("sandbox","allow-scripts");
    frame.removeAttribute("srcdoc");
    const payload={type:"r36s-web-lab-runtime-v1",html,css,scripts:localScripts(p)};
    frame.onload=()=>frame.contentWindow?.postMessage(payload,"*");
    frame.src="./project-runtime.html";
  }else{
    frame.onload=null;
    frame.setAttribute("sandbox","");
    frame.removeAttribute("src");
    const screen=navigablePreview(html,p);
    frame.srcdoc=previewPage(screen,css);
  }
}
export function fitProjectFrame(){
  const frame=document.getElementById("projectPreviewFrame");
  const shell=document.getElementById("consoleScreen");
  if(!frame||!shell)return;
  const width=shell.clientWidth;
  const scale=Math.max(0.1,width/640);
  frame.style.transform="scale("+scale+")";
}

function download(text,filename,type){
  const url=URL.createObjectURL(new Blob([text],{type}));
  const link=document.createElement("a");
  link.href=url;link.download=filename;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
}
async function assetData(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error("Falha ao carregar imagem."));
    reader.onload=()=>resolve(reader.result);
    reader.readAsDataURL(file);
  });
}
async function loadFiles(id,files){
  const selected=Array.from(files||[]);
  const manifest=projectManifest(selected);
  const chosen=preferredFile(manifest.files,"html");
  const cssFiles=manifest.files.filter(f=>f.category==="css").sort((a,b)=>a.path.localeCompare(b.path));
  const data=new Map();
  const scriptMap=new Map();
  // Read validated and explicitly selected browser files, never send their bytes to the server.
  for(let i=0;i<manifest.files.length;i++){
    const meta=manifest.files[i],file=selected[i];
    if(meta.category==="image")data.set(meta.path,await assetData(file));
    if(meta.category==="javascript")scriptMap.set(meta.path,await file.text());
  }
  const html=chosen?await selected[manifest.files.indexOf(chosen)].text():"";
  const cssParts=[];
  for(const meta of cssFiles){
    const file=selected[manifest.files.indexOf(meta)];
    cssParts.push("/* "+meta.path.replace(/\*\//g,"")+" */\n"+await file.text());
  }
  const project=projects[id];
  project.assetMap=data;project.scriptMap=scriptMap;project.runJS=false;project.fileCount=manifest.count;project.xmlCount=manifest.files.filter(f=>f.category==="xml").length;
  project.repoLoaded=false;project.detail=false;project.selectedIndex=0;project.edited=true;
  project.html=html;project.css=cssParts.join("\n");
  project.nativePreview=null;
  if(id==="pkforge" && isPokeForgeNativeArchive(manifest.files)){
    const pokedex=manifest.files.find(meta=>/(?:^|\/)pokeforge-r36s\/data\/pokedex\.json$/i.test(meta.path));
    let entries=[];
    if(pokedex){
      try{
        const raw=await selected[manifest.files.indexOf(pokedex)].text();
        const parsed=JSON.parse(raw);
        if(Array.isArray(parsed))entries=parsed;
      }catch{/* Preserve the offline UI even if the catalog is unavailable. */}
    }
    project.nativePreview=newPokeForgePreview(entries);
  }
  project.localFiles=manifest.files.map((item,i)=>({...item,blob:selected[i]}));
  project.htmlEntries=project.localFiles.filter(item=>item.category==="html");
  project.entry=chosen?.path||"index.html";
  project.cssEntry=cssFiles[0]?.path||project.entry;
  saveDrafts();
  projectPreview(id);
  auditAction("project_imported",{section:id,count:manifest.count,size_bytes:manifest.total});
  return {manifest,htmlFound:!!chosen,nativePreview:!!project.nativePreview,nativeCatalogCount:project.nativePreview?.catalog.length||0};
}
export function renderProjectPanel(inspector,heading,showToast,id){
  if(!projects[id])return;
  const project=projects[id];
  const label=PROJECTS.find(p=>p.id===id).label;
  const source=COMMUNITY_SOURCES[id];
  const projectInfo=PROJECTS.find(item=>item.id===id);
  inspector.innerHTML=heading(label+" — Live Studio","Prévia navegável com fontes versionadas no GitHub, edição local e tela 640 × 480. Não inicializa ArkOS.")+
    '<div class="inspector-card"><div class="card-heading">REPOSITÓRIO / VERSÃO <span class="card-kicker">GITHUB · MAIN</span></div>'+
    '<div class="metric-line"><span>Situação</span><strong>'+escapeText(projectInfo.status)+'</strong></div>'+
    '<p class="fine-print">A pasta GitHub contém arquivos de referência, não uma cópia comprovada do projeto executável original. Mudanças feitas no GitHub entram no site após a publicação automática.</p>'+
    '<button type="button" class="action-button" id="projectLoadRepo">Carregar / atualizar prévia do GitHub</button>'+
    '<a class="action-button secondary" style="display:block;text-align:center" href="'+source.github+'" target="_blank" rel="noopener noreferrer">Abrir pasta do projeto no GitHub ↗</a>'+
    '<p class="fine-print" id="projectRepoStatus" role="status">Selecione atualizar ou edite o rascunho neste navegador.</p></div>'+
    '<div class="inspector-card"><div class="card-heading">ARQUIVOS DO PROJETO <span class="card-kicker">LOCAL · READ ONLY</span></div>'+
    '<label for="projectZip" class="form-label">Importar projeto compactado (.zip)</label><input class="firmware-file" id="projectZip" type="file" accept=".zip,application/zip,application/x-zip-compressed">'+
    '<label for="projectFolder" class="form-label project-extra-label">Ou importar pasta de frontend (HTML, CSS, imagens)</label><input class="firmware-file" id="projectFolder" type="file" webkitdirectory multiple>'+
    '<label for="projectFiles" class="form-label project-extra-label">Ou selecionar arquivos individualmente</label><input class="firmware-file" id="projectFiles" type="file" multiple accept=".html,.htm,.css,.js,.mjs,.xml,.png,.jpg,.jpeg,.gif,.webp">'+
    '<div class="fine-print" id="projectImportStatus" role="status">'+(project.fileCount?project.fileCount+' arquivos nesta sessão.':'Nenhum arquivo importado. Projetos existentes não foram sincronizados automaticamente.')+'</div>'+
    '<p class="fine-print project-import-diagnostic" id="projectImportDiagnostic" role="alert"></p>'+
    '<label for="projectEntrySelect" class="form-label project-extra-label">Tela HTML inicial</label><select id="projectEntrySelect" class="field-select" aria-label="Escolher arquivo HTML para visualizar"><option value="">Nenhum arquivo local selecionado</option></select>'+
    '<details class="project-files-detail"><summary>Explorar arquivos importados</summary><div class="project-file-list" id="projectFileList" role="list"></div></details>'+
    '<p class="fine-print">Os arquivos ficam no seu navegador. ZIP até 32 MB, conteúdo até 16 MB. HTML/CSS e imagens criam uma prévia; JavaScript e programas ARM são identificados, mas não executados nesta modalidade segura. Imagens ArkOS .img não são inicializadas.</p></div>'+
    '<div class="inspector-card"><div class="card-heading">EDIÇÃO AO VIVO <span class="card-kicker">640 × 480</span></div>'+
    '<label for="projectHtmlEditor" class="form-label">HTML</label><textarea id="projectHtmlEditor" class="project-editor" rows="6" spellcheck="false" placeholder="Importe o HTML real do projeto ou edite aqui..."></textarea>'+
    '<label for="projectCssEditor" class="form-label project-extra-label">CSS</label><textarea id="projectCssEditor" class="project-editor" rows="6" spellcheck="false" placeholder="Alterações CSS aparecem na tela imediatamente..."></textarea>'+
    '<p class="fine-print" id="projectLiveStatus">Prévia segura: scripts desativados por padrão. Para executar HTML/JS próprio, ative o modo experimental isolado abaixo.</p>'+
    '<button type="button" class="action-button secondary" id="projectRuntimeToggle" aria-pressed="false">Executar JavaScript web isolado (experimental)</button>'+
    '<p class="fine-print">Execute somente projetos de sua confiança. O modo experimental não tem acesso ao site principal nem à rede. Não executa binários ARM, firmware ou ArkOS. Dependências de API, npm, módulos externos e chamadas fetch podem não funcionar.</p>'+
    '<button type="button" class="action-button" id="projectExport">Exportar prévia HTML (não é firmware)</button></div>'+
    '<div class="notification-box">Este workspace é uma prévia web dos arquivos fornecidos. Não é a interface real do projeto até você importar o código dele. Edits ficam apenas no navegador atual; exporte o resultado para preservar uma cópia.</div>';
  const htmlEditor=inspector.querySelector("#projectHtmlEditor");
  const cssEditor=inspector.querySelector("#projectCssEditor");
  const status=inspector.querySelector("#projectLiveStatus");
  const diagnostic=inspector.querySelector("#projectImportDiagnostic");
  const runtimeButton=inspector.querySelector("#projectRuntimeToggle");
  htmlEditor.value=project.html;cssEditor.value=project.css;
  const entrySelect=inspector.querySelector("#projectEntrySelect");
  const fileList=inspector.querySelector("#projectFileList");
  function showFileBrowser(){
    entrySelect.replaceChildren();
    if(!project.htmlEntries.length){
      const option=document.createElement("option");option.value="";option.textContent="Sem HTML local";entrySelect.append(option);
    }
    for(const file of project.htmlEntries){
      const option=document.createElement("option");option.value=file.path;option.textContent=file.path;entrySelect.append(option);
    }
    entrySelect.value=project.entry||"";
    fileList.replaceChildren();
    for(const file of project.localFiles){
      const el=document.createElement("div");
      el.setAttribute("role","listitem");el.className="project-file-row";
      const name=document.createElement("span");name.textContent=file.path;
      const meta=document.createElement("small");meta.textContent=file.category.toUpperCase()+" · "+Math.ceil(file.size/1024)+" KB";
      el.append(name,meta);fileList.append(el);
    }
  }
  showFileBrowser();
  entrySelect.addEventListener("change",async()=>{
    const entry=project.htmlEntries.find(file=>file.path===entrySelect.value);
    if(!entry)return;
    project.entry=entry.path;
    project.nativePreview=null;
    project.html=await entry.blob.text();
    project.selectedIndex=0;project.detail=false;project.edited=true;
    htmlEditor.value=project.html;saveDrafts();projectPreview(id);
    auditAction("project_preview_updated",{section:id});
  });
  runtimeButton.addEventListener("click",()=>{
    if(project.nativePreview){status.textContent="O PokeForge deste ZIP é um aplicativo Go/ARM: navegue a adaptação de interface com os botões. JavaScript web não executa /dev/fb0.";return;}
    if(!project.html.trim()){status.textContent="Importe primeiro uma interface HTML.";return;}
    project.runJS=!project.runJS;
    runtimeButton.setAttribute("aria-pressed",String(project.runJS));
    runtimeButton.textContent=project.runJS?"Desativar JavaScript isolado":"Executar JavaScript web isolado (experimental)";
    status.textContent=project.runJS?"JavaScript permitido somente no iframe isolado. Sem rede; compatibilidade experimental.":"JavaScript desativado. Prévia estática segura.";
    projectPreview(id);
    if(project.runJS)auditAction("project_runtime_launched",{section:id});
  });
  const repoStatus=inspector.querySelector("#projectRepoStatus");
  let fetching=false;
  async function reloadFromRepo(force=false){
    if(fetching || (!force && (project.html||project.css||project.repoLoaded)))return;
    fetching=true;repoStatus.textContent="Buscando prévia versionada no GitHub...";
    try{
      const data=await getCommunitySource(id);
      if(!inspector.isConnected)return;
      if(!force && (project.edited||project.html||project.css))return;
      project.html=data.html;project.css=data.css;project.assetMap=new Map();
      project.entry=data.htmlPath.slice(2);project.cssEntry=data.cssPath.slice(2);
      if(id==="slot"){
        // Only the same-origin, checked-in historical reference image is loaded;
        // the sandbox receives data bytes, never external executable code.
        try{
          const img=await fetch("./community/slot36s/assets/cartucho-historico.webp",{credentials:"same-origin",cache:"no-store"});
          if(img.ok){
            const blob=await img.blob();
            if(blob.size>0 && blob.size<1_000_000 && blob.type==="image/webp"){
              project.assetMap.set("community/slot36s/assets/cartucho-historico.webp",await assetData(blob));
            }
          }
        }catch{/* The CSS preview still works if the image cannot be read. */}
      }
      project.repoLoaded=true;project.detail=false;project.selectedIndex=0;project.edited=false;project.nativePreview=null;
      project.runJS=false;project.scriptMap=new Map();
      project.localFiles=[];project.htmlEntries=[];showFileBrowser();
      htmlEditor.value=data.html;cssEditor.value=data.css;
      repoStatus.textContent="Prévia versionada carregada. Use ↑↓ e A/B no console para navegar; edições locais não atualizam o GitHub automaticamente.";
      projectPreview(id);
      if(force)saveDrafts(); // A deliberate reload replaces the old browser draft.
      auditAction("project_source_loaded",{section:id,count:2});
    }catch(error){repoStatus.textContent="Falha ao carregar referência: "+error.message;}
    finally{fetching=false;}
  }
  inspector.querySelector("#projectLoadRepo").addEventListener("click",()=>reloadFromRepo(true));
  // Local drafts are never silently overwritten by the checked-in template.
  reloadFromRepo(false);
  let updateTimer;
  function changed(){
    project.html=htmlEditor.value;project.css=cssEditor.value;project.edited=true;project.detail=false;
    project.nativePreview=null;
    clearTimeout(updateTimer);
    updateTimer=setTimeout(()=>{
      projectPreview(id);saveDrafts();status.textContent="Prévia atualizada na tela · alterações não modificam o seu backup.";
      auditAction("project_preview_updated",{section:id});
    },300);
  }
  htmlEditor.addEventListener("input",changed);
  cssEditor.addEventListener("input",changed);
  async function imported(event){
    if(!event.target.files?.length)return;
    const indicator=inspector.querySelector("#projectImportStatus");
    indicator.textContent="Lendo arquivos locais...";
    try{
      const result=await loadFiles(id,event.target.files);
      htmlEditor.value=project.html;cssEditor.value=project.css;showFileBrowser();
      const compatibility=result.nativePreview
        ?{kind:"go-arm-pokeforge-adapter",preview:true,explanation:"PokeForge R36S nativo (Go/ARM, /dev/fb0) detectado. A tela agora mostra uma adaptação navegável baseada na estrutura real do projeto, com "+result.nativeCatalogCount+" espécies do catálogo do ZIP. Use L2/R2 para trocar de aba, L1/R1 para boxes/gerações e A/B para abrir/voltar. Os executáveis ARM não foram iniciados, nem os saves modificados."}
        :classifyProjectManifest(result.manifest);
      indicator.textContent=result.manifest.count+" arquivos: "+result.manifest.html+" HTML, "+
        result.manifest.css+" CSS, "+result.manifest.javascript+" JS, "+
        result.manifest.source+" fontes/configuração, "+result.manifest.images+" imagens.";
      diagnostic.textContent=compatibility.explanation;
      status.textContent=result.nativePreview?"Adaptador PokeForge Go/ARM ativo: telas navegáveis, sem execução nativa.":compatibility.preview?"Prévia carregada. JavaScript web requer ativação explícita.":"Projeto inventariado, mas ainda não executável como interface web.";
      showToast(compatibility.preview?"Frontend importado e pronto para visualização.":"Arquivos importados; veja o diagnóstico de compatibilidade.");
    }catch(error){
      indicator.textContent="Não foi possível importar a pasta.";
      diagnostic.textContent=error.message||"Falha ao ler os arquivos.";
    }
  }
  inspector.querySelector("#projectFolder").addEventListener("change",imported);
  inspector.querySelector("#projectZip").addEventListener("change",async event=>{
    const zip=event.target.files?.[0];if(!zip)return;
    const indicator=inspector.querySelector("#projectImportStatus");
    indicator.textContent="Lendo ZIP localmente e verificando limites...";
    try{
      const files=await unzipSourceFiles(zip);
      const result=await loadFiles(id,files);
      htmlEditor.value=project.html;cssEditor.value=project.css;showFileBrowser();
      const compatibility=classifyProjectManifest(result.manifest);
      indicator.textContent="ZIP aberto: "+result.manifest.count+" arquivos; "+
        result.manifest.html+" HTML, "+result.manifest.css+" CSS, "+
        result.manifest.javascript+" JS, "+result.manifest.source+" fontes/configuração, "+
        result.manifest.images+" imagens.";
      diagnostic.textContent=compatibility.explanation;
      status.textContent=result.nativePreview?"Simulador de interface PokeForge ativo. ArkOS nativo ainda não executado.":compatibility.preview?"Prévia pronta; o JavaScript está desligado por padrão.":"ZIP importado, mas sem frontend HTML executável nesta versão.";
      showToast(compatibility.preview?"ZIP importado e prévia exibida.":"ZIP analisado: confira o diagnóstico no painel.");
    }catch(error){
      indicator.textContent="Não foi possível abrir este ZIP.";
      diagnostic.textContent=error.message||"Falha na leitura do arquivo compactado.";
    }
    finally{event.target.value="";}
  });
  inspector.querySelector("#projectFiles").addEventListener("change",imported);
  inspector.querySelector("#projectExport").addEventListener("click",()=>{
    // Export only the user's sanitized static preview, never a disk image or executable.
    const safeHTML=project.html.trim()?sandboxHTML(project.html,project.assetMap,project.entry||"index.html"):placeholder(id);
    const final=previewPage(safeHTML,sandboxCSS(project.css,project.assetMap,project.cssEntry||project.entry||"index.html"));
    download(final,id+"-preview.html","text/html;charset=utf-8");
    auditAction("project_exported",{section:id});
    showToast("Prévia HTML exportada. Não substitui arquivos do ArkOS.");
  });
  projectPreview(id);
}
