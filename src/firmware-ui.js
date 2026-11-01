import {inspectFirmwareFile, formatSize} from "./firmware.js";
import {escapeHTML} from "./model.js";

let lastReport = null;
function reportMarkup(data) {
  if (!data) return '<p class="fine-print">Selecione uma imagem de disco para inspecionar seus primeiros 34 KB, sem carregá-la inteira na memória.</p>';
  const partitions = data.partitions.map(p =>
    '<div class="hardware-line"><span>Partição '+p.number+' · '+escapeHTML(p.type)+'</span><strong>LBA '+p.start+' · '+formatSize(p.bytes)+'</strong></div>'
  ).join("");
  return '<div class="inspector-card firmware-results"><div class="card-heading">RESULTADO <span class="card-kicker">READ ONLY</span></div>'+
    '<div class="hardware-line"><span>Arquivo</span><strong>'+escapeHTML(data.name)+'</strong></div>'+
    '<div class="hardware-line"><span>Tamanho</span><strong>'+formatSize(data.size)+'</strong></div>'+
    '<div class="hardware-line"><span>Identificação</span><strong>'+escapeHTML(data.classification)+'</strong></div>'+
    partitions +
    data.notes.map(note => '<p class="fine-print">'+escapeHTML(note)+'</p>').join("")+
    '</div>';
}
export function renderFirmwarePanel(inspector, heading, showToast) {
  inspector.innerHTML = heading("Firmware Lab","Leia cabeçalhos de imagens ArkOS, cartões SD e device trees. Nenhum arquivo é enviado ao site e não há boot de firmware.") +
    '<div class="inspector-card"><div class="card-heading">ABRIR IMAGEM <span class="card-kicker">ANÁLISE LOCAL</span></div>'+
    '<input type="file" id="firmwareImage" class="firmware-file" accept=".img,.iso,.xz,.gz,.zip,.dtb,.dtbo,.img.xz,.img.gz,.img.zip" />'+
    '<p class="fine-print">Arquivos aceitos: .img, .img.xz, .img.gz, .iso, .dtb e .zip. Arquivos compactados são identificados, mas não extraídos.</p></div>'+
    '<div id="firmwareResult" role="status" aria-live="polite">'+reportMarkup(lastReport)+'</div>'+
    '<div class="notification-box">O ArkOS é normalmente gravado em um microSD como imagem .img. Este módulo não inicia Linux, não grava SD e não confirma compatibilidade de DTB com a tela física.</div>';
  inspector.querySelector("#firmwareImage").addEventListener("change", async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const output = inspector.querySelector("#firmwareResult");
    output.textContent = "Inspecionando cabeçalho local...";
    try {
      lastReport=await inspectFirmwareFile(file);
      if(output.isConnected) output.innerHTML=reportMarkup(lastReport);
      showToast("Cabeçalho analisado; nenhum arquivo foi modificado.");
    } catch(error) {
      lastReport=null;
      if(output.isConnected) output.textContent=error.message || "Não foi possível inspecionar o arquivo.";
    }
  });
}
