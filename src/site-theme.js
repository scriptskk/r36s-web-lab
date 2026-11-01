/** Page appearance only; console/EmulationStation theme is independent. */
export const APPEARANCE_KEY="r36s-web-lab:appearance:v1";
export function validAppearance(value){
  return value==="dark"||value==="light"?value:null;
}
export function resolveAppearance(stored,systemDark=true){
  return validAppearance(stored)||(systemDark?"dark":"light");
}
export function applyAppearance(mode,root=document.documentElement){
  const chosen=validAppearance(mode)||"dark";
  root.dataset.appearance=chosen;
  root.style.colorScheme=chosen;
  return chosen;
}
export function startAppearance(){
  const button=document.getElementById("appearanceToggle");
  if(!button)return;
  let saved=null;
  try{saved=localStorage.getItem(APPEARANCE_KEY);}catch{/* storage may be disabled */}
  const prefersDark=typeof matchMedia==="function"?matchMedia("(prefers-color-scheme: dark)").matches:true;
  let mode=resolveAppearance(saved,prefersDark);
  const label=document.getElementById("appearanceLabel");
  const icon=document.getElementById("appearanceIcon");
  function display(){
    applyAppearance(mode);
    const next=mode==="dark"?"claro":"escuro";
    button.setAttribute("aria-label","Ativar modo "+next);
    button.setAttribute("aria-pressed",String(mode==="light"));
    if(label)label.textContent="Modo "+next;
    if(icon)icon.textContent=mode==="dark"?"☼":"☾";
  }
  display();
  button.addEventListener("click",()=>{
    mode=mode==="dark"?"light":"dark";
    try{localStorage.setItem(APPEARANCE_KEY,mode);}catch{/* not blocking theme changes */}
    display();
  });
}
if(typeof document!=="undefined")startAppearance();
