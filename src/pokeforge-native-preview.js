/**
 * PokeForge R36S native UI adapter.
 *
 * User archive contains Go ARM programs talking to /dev/fb0 and Linux input.
 * This is a purpose-built browser preview of their navigational screen layout,
 * NOT the native executable, a save editor, or ArkOS emulation.
 * Only reads local archive filenames and the Pokédex JSON supplied by the user.
 */
const PAGES=["HOME","BOXES","BANK","PARTY","TRAINER","EDITOR","TOOLS","POKEDEX"];
const GENERATIONS=["I / KANTO","II / JOHTO","III / HOENN","IV / SINNOH","V / UNOVA","VI / KALOS","VII / ALOLA","VIII / GALAR","IX / PALDEA"];
const RANGES=[[1,151],[152,251],[252,386],[387,493],[494,649],[650,721],[722,809],[810,905],[906,2000]];
const TOOL_LABELS=["Save Library","Living Dex","Legality","Mystery Gift","Batch Edit","Trade Evolution"];
const COLORS=[["#142337","#203d5a","#62b2e3","#f4cf6b"],["#2d1c25","#60313e","#e57f73","#f8d289"],["#1a2b24","#325d40","#84c692","#f7daa0"],["#241f34","#493f72","#ae9be4","#eec8a1"]];
const e=t=>String(t??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function isPokeForgeNativeArchive(files){
  const names=Array.from(files||[]).map(f=>String(f.path||f.name||"").replace(/\\/g,"/").toLowerCase());
  const main=names.some(n=>/(?:^|\/)codigo-fonte\/main\.go$/.test(n));
  const launch=names.some(n=>/(?:^|\/)ports\/pokeforge r36s\.sh$/.test(n));
  const binary=names.some(n=>/(?:^|\/)pokeforge-r36s-arm(?:32|64)$/.test(n));
  // The Go sources + ArkOS launcher distinguish this package from arbitrary ZIPs.
  return main&&(launch||binary);
}
export function newPokeForgePreview(catalog=[]){
  const entries=Array.isArray(catalog)?catalog.filter(p=>Number.isInteger(p?.id)&&p.id>0&&p.id<=2000&&typeof p.name==="string").slice(0,2000):[];
  return {page:0,box:0,selection:0,theme:0,gen:0,detail:false,dialog:"",catalog:entries,previewMode:"native-ui-adapter",version:"v1.6",profile:"PLAYER"};
}
export function pokeForgeControl(state,control){
  if(!state)return false;
  if(state.detail){
    if(["back","confirm","l2","r2"].includes(control))state.detail=false;
    return true;
  }
  if(state.dialog){
    if(["back","confirm"].includes(control))state.dialog="";
    return true;
  }
  if(control==="l2"||control==="r2"){
    state.page=(state.page+(control==="r2"?1:-1)+PAGES.length)%PAGES.length;
    state.selection=0;return true;
  }
  if(control==="l1"||control==="r1"){
    const step=control==="r1"?1:-1;
    if(state.page===7){state.gen=(state.gen+step+9)%9;state.selection=0;}
    else if(state.page===1||state.page===2){state.box=(state.box+step+14)%14;state.selection=0;}
    else {state.page=(state.page+step+PAGES.length)%PAGES.length;state.selection=0;}
    return true;
  }
  if(control==="menu"){state.page=0;state.detail=false;state.selection=0;return true;}
  if(control==="back"){state.detail=false;state.dialog="";state.page=0;return true;}
  if(control==="up"||control==="down"||control==="left"||control==="right"){
    if(state.page===7){
      const listed=pokeForgeEntries(state);
      if(listed.length){
        const d=control==="up"||control==="left"?-1:1;
        state.selection=(state.selection+d+listed.length)%listed.length;
      }
    }else if(state.page===1||state.page===2){
      const d={up:-6,down:6,left:-1,right:1}[control];
      state.selection=(state.selection+d+30)%30;
    }else if(state.page===6){
      const d=control==="up"||control==="left"?-1:1;
      state.selection=(state.selection+d+TOOL_LABELS.length)%TOOL_LABELS.length;
    }else if(control==="right"){state.page=(state.page+1)%PAGES.length;state.selection=0;}
    else if(control==="left"){state.page=(state.page+PAGES.length-1)%PAGES.length;state.selection=0;}
    return true;
  }
  if(control==="confirm"){
    if(state.page===0){state.page=1;state.selection=0;}
    else if(state.page===7&&pokeForgeEntries(state).length)state.detail=true;
    else state.dialog="NATIVE FEATURE: requires ArkOS / R36S";
    return true;
  }
  return false;
}
export function pokeForgeEntries(state){
  const range=RANGES[state.gen]||RANGES[0];
  return state.catalog.filter(p=>p.id>=range[0]&&p.id<=range[1]);
}
const box=(title,content,cls="")=>'<section class="pf-panel '+cls+'"><div class="pf-panel-title">'+e(title)+'</div>'+content+'</section>';
const line=(text,style="")=>'<div class="pf-line"'+(style?' style="'+style+'"':'')+'>'+e(text)+'</div>';
function home(state){
  return '<div class="pf-home">'+box("WELCOME / PKFORGE R36S",
    line("WELCOME, "+state.profile,'margin:24px 14px 7px')+line("SELECT: PROFILES  |  A: BOXES",'margin:0 14px;color:#bfd5e7'))+
    '<div class="pf-two">'+box("SAVE LIBRARY",line("GBC  GBA  NDS")+line("GBA SAVES: 0")+line("A: OPEN BOXES"),"")+
    box("POKEMON BANK",line("Local collection")+line("POKEDEX: 0 REGISTERED")+line("0 STORED / OFFLINE"))+'</div></div>';
}
function boxes(state){
  const grid=Array.from({length:30},(_,i)=>'<div class="pf-box-slot'+(state.selection===i?' active':'')+'"><span class="pf-pokeball">◉</span></div>').join("");
  const words=state.page===1?"PC BOX "+String(state.box+1).padStart(2,"0")+" / 14":"BANK / 0 STORED";
  return '<div class="pf-boxes">'+box(words,'<div class="pf-box-grid">'+grid+'</div><div class="pf-quick">PARTY &nbsp; EDITOR &nbsp; TOOLS &nbsp; POKEDEX</div>')+
    box("INSPECTOR",line(state.page===1?"NO GBA SAVE FOUND":"LOCAL BANK")+
    line(state.page===1?"BOX "+String(state.box+1).padStart(2,"0"):"0 COPIES")+
    line("EMPTY SLOT")+line("READ ONLY"),"pf-inspector")+'</div>';
}
function party(state){
  return box("PARTY / SIX SLOTS",
    '<div class="pf-party">'+Array.from({length:6},(_,i)=>'<div class="pf-party-row"><span class="pf-pokeball">◉</span> -- EMPTY SLOT <span>'+(i+1)+'/6</span></div>').join("")+'</div>');
}
function trainer(){
  return box("TRAINER CARD / BAG (READ ONLY)",line("NO GBA SAVE FOUND","margin:24px 14px"));
}
function editor(){
  return box("POKEMON EDITOR",'<div class="pf-features">'+
    ["INFO / STATS / MOVES / ORIGIN / LEGALITY","Species      --","Trainer ID   --","PID          --","IV / EV      --","Moves        --","Legality     --"].map(v=>line(v)).join("")+
    '</div>');
}
function tools(state){
  return box("TOOLS / INTEGRATION ROADMAP",'<div class="pf-tool-list">'+TOOL_LABELS.map((v,i)=>
    '<div class="pf-tool '+(i===state.selection?'active':'')+'">'+e(v)+'<span>SOON</span></div>').join("")+'</div>');
}
function dex(state){
  const list=pokeForgeEntries(state);
  const display=list.length?list.slice(Math.max(0,Math.min(state.selection-3,list.length-7)),Math.max(7,state.selection+4)):[];
  const content='<div class="pf-dex-head">GEN '+e(GENERATIONS[state.gen])+' &nbsp; L1/R1 CHANGE</div>'+
    '<div class="pf-dex-count">'+list.length+' ENTRIES STORED LOCALLY</div>'+
    (display.length?'<div class="pf-dex-list">'+display.map(p=>
      '<div class="pf-dex-row '+(list[state.selection]?.id===p.id?'active':'')+'">#'+String(p.id).padStart(4,"0")+' &nbsp; '+e(p.name.toUpperCase())+'</div>'
      ).join("")+'</div>':
      '<div class="pf-no-catalog">CATALOG NOT INSTALLED FOR THIS GEN<div>RUN THE ONLINE UPDATE ON PC</div></div>')+
    '<div class="pf-dex-hint">DPAD: SELECT &nbsp; A: DETAILS &nbsp; L1/R1: GEN</div>';
  if(state.detail && list.length){
    const p=list[state.selection]||list[0];
    return box("POKEDEX / POKEMON DETAILS",
      '<div class="pf-detail-id">#'+String(p.id).padStart(4,"0")+'</div>'+
      '<div class="pf-detail-name">'+e(p.name.toUpperCase())+'</div>'+
      '<div class="pf-detail-desc">'+e(p.description||"OFFLINE POKEDEX ENTRY")+'</div>'+
      '<div class="pf-dex-hint">B / A: BACK &nbsp; ORIGINAL DATA READ ONLY</div>');
  }
  return box("POKEDEX / GENERATIONS",content);
}
export function renderPokeForgePreview(state){
  const contents=[()=>home(state),()=>boxes(state),()=>boxes(state),()=>party(state),trainer,editor,()=>tools(state),()=>dex(state)];
  let main=contents[state.page]?.()||home(state);
  if(state.dialog)main+='<div class="pf-dialog"><b>'+e(state.dialog)+'</b><p>Native ArkOS feature is not executed in the browser.</p><small>B / A: BACK</small></div>';
  const header='<header class="pf-header"><div><b>PKFORGE</b><small>R36S / LINUX PORT</small></div><span>PROFILE: '+e(state.profile)+'</span></header>';
  const side='<nav class="pf-sidebar">'+PAGES.map((v,i)=>'<div class="pf-nav-item '+(i===state.page?'active':'')+'">'+e(v)+'</div>').join("")+'</nav>';
  const footer='<footer class="pf-footer">L2/R2: MENUS &nbsp; | &nbsp; L1/R1: '+(state.page===7?"GEN":"BOX / PREV")+' &nbsp; | &nbsp; DPAD: ITEMS &nbsp; | &nbsp; A: OPEN &nbsp; B: BACK</footer>';
  const status='<span class="pf-preview-flag">UI ADAPTER · GO / ARM · NOT NATIVE EXECUTION</span>';
  return {html:'<div class="pf-root" style="--pf-base:'+COLORS[state.theme][0]+';--pf-mid:'+COLORS[state.theme][1]+';--pf-hot:'+COLORS[state.theme][2]+';--pf-gold:'+COLORS[state.theme][3]+'">'+header+side+'<main class="pf-main">'+main+'</main>'+footer+status+'</div>',css:POKEFORGE_CSS};
}
export const POKEFORGE_CSS=String.raw`
*{box-sizing:border-box}html,body{margin:0;width:640px;height:480px;overflow:hidden}
body{font:13px/1.25 "Courier New",ui-monospace,monospace;background:#142337;color:#fff}
.pf-root{position:relative;width:640px;height:480px;background:var(--pf-base);color:#fff;overflow:hidden}
.pf-header{position:absolute;top:0;left:0;right:0;height:58px;background:var(--pf-mid);border-bottom:2px solid var(--pf-hot);padding:10px 18px;display:flex;justify-content:space-between;align-items:flex-start}
.pf-header b{display:block;font-size:19px;font-weight:900;letter-spacing:.05em}
.pf-header small{display:block;font-size:10px;color:#bed6ee;margin-top:2px}
.pf-header>span{margin-top:11px;font-size:11px;font-weight:bold}
.pf-sidebar{position:absolute;top:58px;left:0;width:137px;height:382px;background:#141c27;border-right:2px solid var(--pf-hot);padding:9px 8px}
.pf-nav-item{height:46px;display:flex;align-items:center;padding:0 10px;color:#b0c4d9;font-size:12px;font-weight:bold}
.pf-nav-item.active{height:36px;margin-bottom:10px;background:var(--pf-mid);border-left:4px solid var(--pf-gold);padding-left:6px;color:white}
.pf-main{position:absolute;left:152px;top:72px;width:477px;height:352px}
.pf-panel{background:#182838;border:2px solid var(--pf-hot);height:100%;position:relative;overflow:hidden}
.pf-panel-title{height:28px;background:var(--pf-mid);padding:7px 10px;font-size:12px;font-weight:900;letter-spacing:.01em;white-space:nowrap}
.pf-line{font-size:12px;line-height:1.25;margin:15px 14px;color:#f3f5f8}
.pf-home{height:100%;display:flex;flex-direction:column;gap:14px}
.pf-home>.pf-panel{height:118px;flex:none}
.pf-two{height:220px;display:grid;grid-template-columns:228px 1fr;gap:12px}
.pf-two .pf-line{margin:25px 10px 0;font-size:12px}
.pf-boxes{display:grid;grid-template-columns:319px 147px;gap:11px;height:352px}
.pf-box-grid{display:grid;grid-template-columns:repeat(6,43px);grid-template-rows:repeat(5,50px);gap:7px 6px;padding:15px 10px 0}
.pf-box-slot{background:#254056;display:grid;place-items:center}
.pf-box-slot.active{background:var(--pf-hot)}
.pf-pokeball{color:#edecec;font-size:26px;text-shadow:0 -3px #d84e52,0 3px #242424}
.pf-quick{font-size:10px;letter-spacing:-.05em;white-space:nowrap;text-align:center;margin-top:5px}
.pf-inspector .pf-line{margin:17px 7px;font-size:10px}
.pf-party{padding:10px 16px}
.pf-party-row{height:43px;background:#243c50;margin:3px 0;padding:8px 9px;display:flex;align-items:center;gap:12px;font-size:13px}
.pf-party-row span:last-child{margin-left:auto;color:#abc}
.pf-features{padding:8px}
.pf-features .pf-line{font-size:13px;margin:20px 8px}
.pf-tool-list{padding:10px}
.pf-tool{height:42px;background:#263f52;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;padding:9px 13px}
.pf-tool span{color:#f1d48b;font-size:11px}
.pf-tool.active{background:var(--pf-hot)}
.pf-dex-head{margin:12px 11px;color:#fff}
.pf-dex-count{margin:14px 11px 8px;font-size:11px;color:#aed0e7}
.pf-dex-list{padding:0 10px}
.pf-dex-row{height:29px;padding:7px 13px;font-size:12px}
.pf-dex-row.active{background:var(--pf-hot)}
.pf-no-catalog{padding:52px 16px;text-align:center}
.pf-no-catalog>div{margin-top:30px;color:#b5d7ec}
.pf-dex-hint{position:absolute;bottom:12px;left:11px;right:5px;font-size:11px}
.pf-detail-id{font-size:70px;color:var(--pf-hot);text-align:center;margin-top:34px}
.pf-detail-name{font-size:22px;font-weight:900;text-align:center;margin-top:6px}
.pf-detail-desc{text-align:center;color:#aed0e7;padding:14px;font-size:12px}
.pf-dialog{position:absolute;z-index:5;top:90px;left:-30px;width:395px;padding:28px;background:#101b29;border:2px solid var(--pf-gold);box-shadow:0 10px 35px #0009}
.pf-dialog p{color:#dae7f0;margin:24px 0}
.pf-dialog small{color:var(--pf-gold)}
.pf-footer{position:absolute;bottom:0;left:0;right:0;height:40px;background:var(--pf-mid);border-top:2px solid var(--pf-hot);padding:12px 14px;font-size:11px;white-space:nowrap;letter-spacing:-.04em}
.pf-preview-flag{position:absolute;bottom:42px;right:2px;z-index:9;font-size:8px;background:#0b0b0bdf;padding:3px 6px;color:#e4d2a1;letter-spacing:.04em}
`;