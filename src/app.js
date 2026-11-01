import {SYSTEMS, DEMO_GAMES, DEFAULT_THEME, safeTheme, escapeHTML, textToGames} from './model.js';
import {exportTheme, exportSnapshot} from './export.js';

const $ = id => document.getElementById(id);
const STORAGE = 'r36s-web-lab:theme:v1';
const screen = $('screenContent');
const inspector = $('inspectorContent');
const tabs = {
  simulator: ['SIMULATOR / LIVE PREVIEW', 'Seu R36S, no navegador.', 'Explore a interface e teste mudanças sem alterar o aparelho.'],
  theme: ['STUDIO / THEME EDITOR', 'Personalize cada detalhe.', 'Altere cores, tipografia e aparência com prévia imediata.'],
  library: ['LIBRARY / GAME DATA', 'Organize sua biblioteca.', 'Importe listas de jogos para testar os menus com dados reais.'],
  hardware: ['DEVICE / REFERENCE', 'Conheça a arquitetura.', 'Especificações de referência do R36S baseado no RK3326.']
};

let theme;
try { theme = safeTheme(JSON.parse(localStorage.getItem(STORAGE))); } catch {theme = {...DEFAULT_THEME};}
const state = {tab: 'simulator', view: 'systems', systemIndex: 0, itemIndex: 0, menuIndex: 0, library: structuredClone(DEMO_GAMES), theme};
let toastTimer;
let lastGamepadButtons = new Set();
let lastGamepadAxes = [0,0];
let gamepadReady = false;

function showToast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 3300);
}
function saveTheme() {
  try {localStorage.setItem(STORAGE, JSON.stringify(state.theme));}
  catch {showToast('Não foi possível salvar neste navegador.');}
}
function selectedSystem() {return SYSTEMS[state.systemIndex];}
function activeGames() {return state.library[selectedSystem().id] || [];}
function applyTheme() {
  document.documentElement.style.setProperty('--accent', state.theme.accent);
  document.documentElement.style.setProperty('--ui-scale', String(state.theme.fontScale / 100));
  document.documentElement.style.setProperty('--screen-base', state.theme.background === 'slate' ? '#243344' : state.theme.background === 'graphite' ? '#202329' : '#101824');
  $('consoleScreen').classList.toggle('scanlines', state.theme.scanlines);
  screen.classList.toggle('screen-slate', state.theme.background === 'slate');
  screen.classList.toggle('screen-graphite', state.theme.background === 'graphite');
}
function screenEntries() {
  if (state.view === 'systems') return SYSTEMS.map((item, i) => `<button type="button" class="screen-entry ${i===state.systemIndex?'selected':''}" data-entry="${i}" aria-label="Abrir ${escapeHTML(item.name)}" ${i===state.systemIndex?'aria-current="true"':''}><span class="system-icon" style="--system-color:${item.color}">${item.icon}</span><span class="entry-name">${escapeHTML(item.short)}</span><span class="entry-chevron">›</span></button>`).join('');
  if (state.view === 'games') return activeGames().map((name, i) => `<button type="button" class="screen-entry ${i===state.itemIndex?'selected':''}" data-entry="${i}"><span class="system-icon" style="--system-color:${selectedSystem().color}">▤</span><span class="entry-name">${escapeHTML(name)}</span><span class="entry-chevron">›</span></button>`).join('') || '<div class="screen-empty">Nenhum jogo cadastrado. Importe um gamelist.xml na aba Biblioteca.</div>';
  return ['CONTINUAR', 'CONFIGURAÇÕES DE TEMA', 'BIBLIOTECA', 'INFORMAÇÕES'].map((name, i) => `<button type="button" class="screen-entry ${i===state.menuIndex?'selected':''}" data-entry="${i}"><span class="entry-name">${name}</span><span class="entry-chevron">›</span></button>`).join('');
}
function renderScreen() {
  applyTheme();
  const sys = selectedSystem();
  const headings = state.view === 'systems' ? ['R36S / EMULATIONSTATION', 'SYSTEMS', `${SYSTEMS.length} SISTEMAS DISPONÍVEIS`] : state.view === 'games' ? [sys.family + ' / LIBRARY', sys.short, `${activeGames().length} JOGOS NA LISTA`] : ['SYSTEM / CONFIGURATION', 'MAIN MENU', 'CONFIGURAÇÕES DO SIMULADOR'];
  screen.innerHTML = `<div class="screen-status"><span>◉ R36S WEB LAB</span><span class="screen-status-right">SIM <span class="battery-icon" aria-label="Indicador visual simulado"></span> 100%</span></div><div class="screen-header"><div class="screen-overline">${headings[0]}</div><div class="screen-title">${headings[1]}</div></div><div class="screen-description">${headings[2]}</div><div class="screen-list" id="screenList">${screenEntries()}</div><div class="screen-footer"><span><b>A</b> SELECT</span><span><b>B</b> BACK</span><span><b>START</b> MENU</span></div>`;
  screen.querySelectorAll('[data-entry]').forEach(button => button.addEventListener('click', () => {
    const index = Number(button.dataset.entry);
    if (state.view === 'systems') state.systemIndex = index;
    else if (state.view === 'games') state.itemIndex = index;
    else state.menuIndex = index;
    confirmSelection();
  }));
  screen.querySelector('.screen-entry.selected')?.scrollIntoView({block:'nearest'});
}
function renderInspector() {
  $('inspectorCode').textContent = `${String(Object.keys(tabs).indexOf(state.tab)+1).padStart(2,'0')} / 04`;
  const heading = (title, description) => `<h2>${title}</h2><p class="panel-description">${description}</p>`;
  if (state.tab === 'simulator') {
    inspector.innerHTML = heading('Controles do dispositivo','Os botões do console, o teclado e controles USB/Bluetooth conectados ao navegador controlam esta prévia.') + `<div class="inspector-card"><div class="card-heading">MAPEAMENTO <span class="card-kicker">KEYBOARD</span></div><div class="metric-line"><span>Navegar</span><strong><span class="keychip">↑</span> <span class="keychip">↓</span> <span class="keychip">←</span> <span class="keychip">→</span></strong></div><div class="metric-line"><span>Selecionar</span><strong><span class="keychip">ENTER</span></strong></div><div class="metric-line"><span>Voltar</span><strong><span class="keychip">ESC</span></strong></div><div class="metric-line"><span>Menu principal</span><strong><span class="keychip">M</span></strong></div></div><div class="inspector-card"><div class="card-heading">SESSÃO <span class="counter-pill">SIMULADA</span></div><div class="metric-line"><span>Front-end de referência</span><strong>EmulationStation</strong></div><div class="metric-line"><span>Resolução visual</span><strong>640 × 480 · 4:3</strong></div><div class="metric-line"><span>Sistema selecionado</span><strong id="currentSystemLabel">${escapeHTML(selectedSystem().short)}</strong></div><div class="metric-line"><span>Jogos cadastrados</span><strong id="currentGameCount">${activeGames().length}</strong></div></div><div class="notification-box">Esta prévia reproduz interações de interface. Ela não inicializa o ArkOS nem executa jogos.</div>`;
  } else if (state.tab === 'theme') {
    inspector.innerHTML = heading('Theme Studio','Ajuste a aparência do console e exporte um XML experimental baseado no formato de temas do EmulationStation.') + `<div class="inspector-card"><div class="card-heading">APARÊNCIA <span class="card-kicker">LIVE EDIT</span></div><div class="form-field"><label for="accentInput">Cor de destaque</label><div class="color-line"><input type="color" id="accentInput" value="${state.theme.accent}"/><code id="accentValue">${state.theme.accent.toUpperCase()}</code></div></div><div class="form-field"><label for="backgroundInput">Plano de fundo</label><select id="backgroundInput" class="field-select"><option value="midnight" ${state.theme.background==='midnight'?'selected':''}>Midnight Blue</option><option value="slate" ${state.theme.background==='slate'?'selected':''}>Slate</option><option value="graphite" ${state.theme.background==='graphite'?'selected':''}>Graphite</option></select></div><div class="form-field"><label for="fontScaleInput">Escala de texto</label><div class="range-line"><input type="range" id="fontScaleInput" min="80" max="125" step="5" value="${state.theme.fontScale}"/><output id="fontScaleValue">${state.theme.fontScale}%</output></div></div><label class="toggle-line" for="scanlinesInput">Efeito de linhas LCD <input type="checkbox" id="scanlinesInput" ${state.theme.scanlines?'checked':''}/></label></div><button type="button" class="action-button" id="exportThemeButton">Exportar theme.xml ↗</button><button type="button" class="action-button secondary" id="resetThemeButton">Restaurar padrão</button><p class="fine-print">O XML exportado é um ponto de partida. Alguns elementos variam entre forks do EmulationStation. Valide e teste no aparelho antes de instalar.</p>`;
    $('accentInput').addEventListener('input', e => updateTheme({accent:e.target.value}));
    $('backgroundInput').addEventListener('change', e => updateTheme({background:e.target.value}));
    $('fontScaleInput').addEventListener('input', e => updateTheme({fontScale:Number(e.target.value)}));
    $('scanlinesInput').addEventListener('change', e => updateTheme({scanlines:e.target.checked}));
    $('exportThemeButton').addEventListener('click', () => {exportTheme(state.theme);showToast('Arquivo theme.xml exportado.');});
    $('resetThemeButton').addEventListener('click', () => {state.theme={...DEFAULT_THEME};saveTheme();renderScreen();renderInspector();showToast('Aparência padrão restaurada.');});
  } else if (state.tab === 'library') {
    inspector.innerHTML = heading('Gerenciador de biblioteca','Carregue um arquivo gamelist.xml gerado pelo EmulationStation. Somente nomes são utilizados na prévia.') + `<div class="inspector-card"><div class="card-heading">IMPORTAR ARQUIVO <span class="card-kicker">LOCAL ONLY</span></div><div class="form-field"><label for="systemImport">Sistema de destino</label><select id="systemImport" class="field-select">${SYSTEMS.map((s,i) => `<option value="${s.id}" ${i===state.systemIndex?'selected':''}>${escapeHTML(s.name)}</option>`).join('')}</select></div><button type="button" class="action-button" id="importButton">Selecionar gamelist.xml</button><p class="fine-print">Limite: 2 MB e 2.000 jogos. Nenhum arquivo é enviado a servidores. Entradas importadas permanecem somente na sessão atual; use Exportar projeto para guardar uma cópia JSON.</p></div><div class="inspector-card"><div class="card-heading">SISTEMAS <span class="counter-pill">${Object.values(state.library).reduce((n,a)=>n+a.length,0)} JOGOS</span></div><div class="library-table">${SYSTEMS.map(s=>`<div class="library-row"><span>${escapeHTML(s.short)}</span><b>${(state.library[s.id]||[]).length}</b></div>`).join('')}</div></div><button type="button" class="action-button secondary" id="restoreLibraryButton">Restaurar biblioteca de exemplo</button>`;
    $('importButton').addEventListener('click', () => {$('gamelistFile').value='';$('gamelistFile').click();});
    $('restoreLibraryButton').addEventListener('click',()=>{state.library=structuredClone(DEMO_GAMES);state.itemIndex=0;renderScreen();renderInspector();showToast('Biblioteca de demonstração restaurada.');});
  } else {
    inspector.innerHTML = heading('Ficha técnica','Valores de referência para modelos R36S com Rockchip RK3326. Clones podem apresentar componentes diferentes.') + `<div class="inspector-card"><div class="card-heading">ESPECIFICAÇÕES <span class="card-kicker">REFERENCE</span></div>${[['Processador','Rockchip RK3326 · 4× Cortex-A35'],['GPU','Mali-G31 MP2'],['Memória','1 GB DDR3L (modelo de referência)'],['Display','3,5” IPS · 640 × 480'],['Proporção','4:3'],['Armazenamento','Até 2 slots microSD, conforme revisão'],['Sistema','Linux · ArkOS / variantes']].map(([label,value])=>`<div class="hardware-line"><span>${label}</span><strong>${value}</strong></div>`).join('')}</div><div class="notification-box">Verifique o modelo da placa, a versão do firmware e os arquivos DTB antes de aplicar modificações ao R36S físico.</div><a class="action-button secondary" style="display:block;text-align:center;margin-top:20px" target="_blank" rel="noopener noreferrer" href="https://handhelds.wiki/R36S_Clones">Ver variantes conhecidas ↗</a>`;
  }
}
function updateTheme(patch) {
  state.theme=safeTheme({...state.theme,...patch});saveTheme();renderScreen();
  if ($('accentValue')) $('accentValue').textContent=state.theme.accent.toUpperCase();
  if ($('fontScaleValue')) $('fontScaleValue').textContent=state.theme.fontScale+'%';
}
function navigate(direction) {
  if (direction === 'left') {back();return;}
  if (direction === 'right') {confirmSelection();return;}
  const step = direction === 'down' ? 1 : -1;
  if (state.view === 'systems') state.systemIndex=(state.systemIndex+step+SYSTEMS.length)%SYSTEMS.length;
  else if(state.view === 'games') {const count=activeGames().length;if(count)state.itemIndex=(state.itemIndex+step+count)%count;}
  else state.menuIndex=(state.menuIndex+step+4)%4;
  renderScreen();
  if(state.tab==='simulator')renderInspector();
}
function confirmSelection() {
  if (state.view === 'systems'){state.view='games';state.itemIndex=0;}
  else if (state.view === 'games'){if(activeGames().length)showToast('Prévia de interface: execução de ROMs não disponível.');}
  else {
    if(state.menuIndex===0)state.view='systems';
    else if(state.menuIndex===1){state.view='systems';setTab('theme');}
    else if(state.menuIndex===2){state.view='systems';setTab('library');}
    else {state.view='systems';setTab('hardware');}
  }
  renderScreen();if(state.tab==='simulator')renderInspector();
}
function back() {state.view=state.view==='games'?'systems':state.view==='menu'?'systems':'systems';renderScreen();if(state.tab==='simulator')renderInspector();}
function act(control) {if(control==='up'||control==='down'||control==='left'||control==='right')navigate(control);else if(control==='confirm')confirmSelection();else if(control==='back')back();else if(control==='menu'){state.view=state.view==='menu'?'systems':'menu';state.menuIndex=0;renderScreen();}}
function setTab(tab) {
  if(!tabs[tab])return;
  state.tab=tab;
  document.querySelectorAll('[data-tab]').forEach(b=>{b.classList.toggle('selected',b.dataset.tab===tab);b.setAttribute('aria-current',b.dataset.tab===tab?'page':'false');});
  $('sectionEyebrow').textContent=tabs[tab][0];$('sectionTitle').textContent=tabs[tab][1];$('sectionDescription').textContent=tabs[tab][2];
  renderInspector();
}

// UI interaction
for(const b of document.querySelectorAll('[data-tab]')) b.addEventListener('click',()=>setTab(b.dataset.tab));
for(const b of document.querySelectorAll('[data-control]'))b.addEventListener('click',()=>act(b.dataset.control));
$('backupButton').addEventListener('click',()=>{exportSnapshot(state.theme,state.library,selectedSystem().id);showToast('Projeto exportado em JSON.');});
$('gamelistFile').addEventListener('change',async event=>{
  const file=event.target.files?.[0];if(!file)return;
  if(file.size>2_000_000){showToast('Arquivo acima do limite de 2 MB.');return;}
  try {const names=textToGames(await file.text());const sys=$('systemImport').value;state.library[sys]=names;state.systemIndex=SYSTEMS.findIndex(s=>s.id===sys);state.itemIndex=0;state.view='games';renderScreen();renderInspector();showToast(`${names.length} jogos carregados na prévia.`);}catch(error){showToast(error.message || 'Falha ao abrir o arquivo.');}
});
document.addEventListener('keydown',event=>{
  const target=event.target;
  if(target instanceof HTMLElement && (['INPUT','SELECT','TEXTAREA'].includes(target.tagName)||target.isContentEditable))return;
  const keys={'ArrowUp':'up','ArrowDown':'down','ArrowLeft':'left','ArrowRight':'right','Enter':'confirm','Escape':'back','Backspace':'back','m':'menu','M':'menu'};
  if(keys[event.key]){event.preventDefault();act(keys[event.key]);}
});

// Standard Gamepad mapping: axes (D-pad/sticks) and buttons A/B/Start.
function pollGamepad() {
  const gamepad = [...(navigator.getGamepads?.()||[])].find(Boolean);
  if (gamepad) {
    if (!gamepadReady){$('gamepadStatus').textContent='GAMEPAD: CONECTADO';gamepadReady=true;}
    const pressed=new Set();
    for(const [index,action] of [[0,'confirm'],[1,'back'],[9,'menu'],[12,'up'],[13,'down'],[14,'left'],[15,'right']]) if(gamepad.buttons[index]?.pressed)pressed.add(action);
    const x=gamepad.axes[0]||0,y=gamepad.axes[1]||0;
    if(x<-.6)pressed.add('left');if(x>.6)pressed.add('right');if(y<-.6)pressed.add('up');if(y>.6)pressed.add('down');
    for(const name of pressed)if(!lastGamepadButtons.has(name))act(name);
    lastGamepadButtons=pressed;lastGamepadAxes=[x,y];
  }else if(gamepadReady){gamepadReady=false;lastGamepadButtons=new Set();$('gamepadStatus').textContent='GAMEPAD: AGUARDANDO';}
  requestAnimationFrame(pollGamepad);
}
renderScreen();setTab('simulator');pollGamepad();
