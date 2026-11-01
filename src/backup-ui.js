import {summarizeBackupFiles} from "./backup.js";
import {formatSize} from "./firmware.js";
import {auditAction} from "./audit.js";
export function renderBackupPanel(inspector,heading,showToast) {
  inspector.innerHTML=heading("Catálogo de backup","Selecione uma pasta extraída de um cartão SD do R36S para contabilizar ROMs, BIOS, temas e arquivos de configuração.")+
    '<div class="inspector-card"><div class="card-heading">IMPORTAR PASTA <span class="card-kicker">SOMENTE ÍNDICE</span></div>'+
    '<input type="file" id="backupDirectory" class="firmware-file" webkitdirectory multiple />'+
    '<p class="fine-print">Use uma pasta já extraída do backup. Uma imagem .img não é uma pasta: para ler seu conteúdo será necessário um montador de partições separado. A seleção local não envia arquivos ao servidor.</p></div>'+
    '<div id="backupReport" role="status" aria-live="polite"><p class="fine-print">Nenhuma pasta selecionada.</p></div>'+
    '<div class="notification-box">Esta etapa apenas conta arquivos. Não instala emuladores, não copia jogos para o servidor e não executa firmware. Uma integração futura poderá importar conteúdo legitimamente adquirido para armazenamento privado.</div>';
  inspector.querySelector("#backupDirectory").addEventListener("change",event=>{
    const el=inspector.querySelector("#backupReport");
    try{
      const summary=summarizeBackupFiles(event.target.files);
      const entries=[["Arquivos",summary.total],["Volume selecionado",formatSize(summary.totalBytes)],["ROMs (pastas)",summary.roms],["Temas",summary.themes],["BIOS",summary.bios],["Emuladores",summary.emulators],["Configurações",summary.settings],["Outros",summary.other],["Rejeitados",summary.rejected]];
      el.replaceChildren();
      const panel=document.createElement("div"); panel.className="inspector-card";
      for(const [label,value] of entries){
        const row=document.createElement("div");row.className="metric-line";
        const key=document.createElement("span");key.textContent=label;
        const val=document.createElement("strong");val.textContent=String(value);
        row.append(key,val);panel.append(row);
      }
      el.append(panel);
      auditAction("backup_indexed",{count:summary.total,size_bytes:summary.totalBytes});
      showToast("Backup catalogado localmente; nenhum conteúdo foi enviado.");
    }catch(error){el.textContent=error.message || "Não foi possível catalogar a pasta.";}
  });
}
