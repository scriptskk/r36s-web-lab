const apiBase = "./api/";
let csrfToken = null;
let privateStatus = null;

export async function detectPrivateServer() {
  if (privateStatus !== null) return privateStatus;
  try {
    const res=await fetch(apiBase+"session",{credentials:"same-origin",cache:"no-store"});
    if (!res.ok || !(res.headers.get("content-type")||"").includes("application/json")) return privateStatus=false;
    const data=await res.json();
    if (!data.authenticated || !data.csrf_token) return privateStatus=false;
    csrfToken=data.csrf_token;
    privateStatus=true;
  } catch {privateStatus=false;}
  return privateStatus;
}
export async function auditAction(action,details={}) {
  if (!await detectPrivateServer()) return false;
  try {
    const response=await fetch(apiBase+"audit",{
      method:"POST",credentials:"same-origin",headers:{"content-type":"application/json","X-CSRFToken":csrfToken},
      body:JSON.stringify({action,details})
    });
    return response.ok;
  } catch {return false;}
}
export function renderAuditPanel(inspector,heading) {
  inspector.innerHTML=heading("Histórico privado","Registros do servidor SQLite, ordenados do mais recente para o mais antigo. Apenas ações registradas pela aplicação aparecem aqui.")+
    '<div id="auditStatus" class="notification-box" role="status">Conectando ao banco de dados...</div>'+
    '<div id="auditEvents" class="audit-events"></div>'+
    '<button id="auditRefresh" type="button" class="action-button secondary">Atualizar histórico</button>'+
    '<button id="auditLogout" type="button" class="action-button secondary" hidden>Sair da sessão privada</button>';
  const status=inspector.querySelector("#auditStatus");
  const list=inspector.querySelector("#auditEvents");
  async function refresh(){
    status.textContent="Consultando o histórico...";
    if(!await detectPrivateServer()){
      status.textContent="Banco privado indisponível nesta hospedagem. O GitHub Pages não oferece login nem proteção de arquivos. Inicie o servidor privado para utilizar esta função.";
      return;
    }
    inspector.querySelector("#auditLogout").hidden=false;
    try{
      const res=await fetch(apiBase+"audit?limit=60",{credentials:"same-origin",cache:"no-store"});
      if(!res.ok)throw Error("Falha HTTP "+res.status);
      const obj=await res.json();
      list.replaceChildren();
      for(const entry of obj.events){
        const item=document.createElement("div"); item.className="audit-event";
        const title=document.createElement("strong"); title.textContent=entry.action;
        const date=document.createElement("small");date.textContent=entry.at+" · "+entry.origin;
        const details=document.createElement("span");details.textContent=JSON.stringify(entry.details);
        item.append(title,date,details);list.append(item);
      }
      status.textContent=obj.events.length+" eventos carregados. Não há registro das alterações feitas fora deste servidor.";
    }catch(error){status.textContent="Não foi possível consultar o histórico: "+error.message;}
  }
  inspector.querySelector("#auditRefresh").addEventListener("click",refresh);
  inspector.querySelector("#auditLogout").addEventListener("click",async()=>{
    if (!csrfToken) return;
    const r=await fetch("./logout",{method:"POST",headers:{"X-CSRFToken":csrfToken},credentials:"same-origin"});
    if(r.ok || r.redirected) window.location.assign("./login");
  });
  refresh();
}
