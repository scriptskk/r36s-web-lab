const $ = id => document.getElementById(id);
const extensions = {
  nes:[".nes"], snes:[".sfc",".smc"], gb:[".gb",".gbc"], gba:[".gba"],
  psx:[".chd",".pbp",".bin",".iso",".img"]
};
let activeUrls=[];
function error(message) { $("message").textContent=message; }
function chosenExtension(name) {return "."+String(name).split(".").pop().toLowerCase();}
$("launch").addEventListener("click",()=>{
  const rom=$("rom").files?.[0], bios=$("bios").files?.[0], core=$("system").value;
  if (!rom) return error("Escolha uma ROM ou imagem de jogo.");
  if (!extensions[core]?.includes(chosenExtension(rom.name))) return error("Extensão incompatível com a plataforma selecionada.");
  if (rom.size === 0 || rom.size > 1_610_612_736) return error("Arquivo vazio ou acima de 1,5 GiB. Use uma cópia menor ou CHD compatível.");
  if (bios && bios.size > 4_194_304) return error("BIOS maior que o limite de 4 MB.");
  if (core === "psx" && rom.name.toLowerCase().endsWith(".img") && rom.size > 900_000_000) return error("Esta imagem pode ser um firmware de cartão SD, não um disco de PS1. Use o Firmware Lab.");
  const romUrl=URL.createObjectURL(rom);
  activeUrls.push(romUrl);
  const biosUrl=bios ? URL.createObjectURL(bios) : "";
  if(biosUrl) activeUrls.push(biosUrl);
  window.EJS_player="#game";
  window.EJS_gameUrl=romUrl;
  window.EJS_biosUrl=biosUrl;
  window.EJS_gameName=rom.name.replace(/\.[^.]+$/,"").slice(0,80);
  window.EJS_core=core;
  window.EJS_pathtodata="https://cdn.emulatorjs.org/stable/data/";
  window.EJS_startOnLoaded=true;
  $("setup").hidden=true;
  $("playback").hidden=false;
  $("running").textContent="Carregando o núcleo do EmulatorJS. A execução depende do arquivo, do navegador e das bibliotecas externas.";
  const script=document.createElement("script");
  script.src="https://cdn.emulatorjs.org/stable/data/loader.js";
  script.onerror=()=>$("running").textContent="Não foi possível carregar o EmulatorJS. Verifique a conexão e o bloqueio de scripts externos.";
  script.onload=()=>$("running").textContent="Núcleo solicitado. Se o jogo não iniciar, verifique formato, BIOS e console do navegador.";
  document.head.appendChild(script);
});
$("reset").addEventListener("click",()=>location.reload());
window.addEventListener("pagehide",()=>{for(const url of activeUrls)URL.revokeObjectURL(url);activeUrls=[];});
