export const SYSTEMS = [
  { id: 'nes', name: 'Nintendo Entertainment System', short: 'NES', family: '8-BIT', icon: 'N', color: '#eb6472' },
  { id: 'snes', name: 'Super Nintendo', short: 'SNES', family: '16-BIT', icon: 'S', color: '#a58df8' },
  { id: 'gb', name: 'Game Boy', short: 'GAME BOY', family: 'HANDHELD', icon: 'G', color: '#8fd0a3' },
  { id: 'gba', name: 'Game Boy Advance', short: 'GBA', family: 'HANDHELD', icon: 'A', color: '#8eb8ec' },
  { id: 'megadrive', name: 'Mega Drive', short: 'MEGA DRIVE', family: '16-BIT', icon: 'M', color: '#f3bb79' },
  { id: 'psx', name: 'PlayStation', short: 'PLAYSTATION', family: '32-BIT', icon: 'P', color: '#d8a2ef' },
  { id: 'ports', name: 'Ports', short: 'PORTS', family: 'NATIVE', icon: '↗', color: '#e7aa77' }
];

export const DEMO_GAMES = {
  nes: ['Sample Adventure', 'Pixel Quest', '8-Bit Playground'],
  snes: ['Mode 7 Showcase', 'Sample Platformer'],
  gb: ['Monochrome Demo', 'Pocket Puzzle'],
  gba: ['Portable Showcase', 'Color Test'],
  megadrive: ['Arcade Sample', 'Scroll Test'],
  psx: ['3D Test Scene', 'Memory Card Demo'],
  ports: ['Open Source Demo', 'Input Test']
};

export const DEFAULT_THEME = Object.freeze({accent: '#82bafa', background: 'midnight', fontScale: 100, scanlines: false});
const THEMES = new Set(['midnight', 'slate', 'graphite']);

export function safeTheme(candidate) {
  if (!candidate || typeof candidate !== 'object') return {...DEFAULT_THEME};
  return {
    accent: /^#[0-9a-fA-F]{6}$/.test(candidate.accent) ? candidate.accent : DEFAULT_THEME.accent,
    background: THEMES.has(candidate.background) ? candidate.background : DEFAULT_THEME.background,
    fontScale: Math.max(80, Math.min(125, Number(candidate.fontScale) || 100)),
    scanlines: candidate.scanlines === true
  };
}

export function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
}

export function textToGames(documentText) {
  if (typeof documentText !== 'string' || documentText.length > 2_000_000) throw new Error('Arquivo muito grande. Limite: 2 MB.');
  if (/<!\s*(?:DOCTYPE|ENTITY)\b/i.test(documentText)) throw new Error('O arquivo contém declarações XML não permitidas.');
  const dom = new DOMParser().parseFromString(documentText, 'application/xml');
  if (dom.querySelector('parsererror') || dom.documentElement?.tagName !== 'gameList') throw new Error('XML inválido: esperado <gameList>.');
  const games = Array.from(dom.documentElement.children).filter(el => el.tagName === 'game');
  if (games.length > 2000) throw new Error('Limite de 2.000 jogos por arquivo.');
  const names = games.map(game => (game.querySelector(':scope > name')?.textContent || '').trim().slice(0, 100)).filter(Boolean);
  if (names.length === 0) throw new Error('Nenhum jogo com o campo <name> foi encontrado.');
  return names;
}

export function createThemeXML(themeInput) {
  const theme = safeTheme(themeInput);
  const accent = theme.accent.slice(1).toUpperCase();
  const base = theme.background === 'slate' ? '243344' : theme.background === 'graphite' ? '202329' : '101824';
  const fontSize = (0.030 * theme.fontScale / 100).toFixed(4);
  return `<?xml version="1.0" encoding="UTF-8"?>
<theme>
  <formatVersion>7</formatVersion>
  <view name="system">
    <carousel name="systemcarousel">
      <color>${accent}</color>
    </carousel>
    <text name="systemInfo">
      <color>DAE3EE</color>
    </text>
  </view>
  <view name="basic,detailed">
    <textlist name="gamelist">
      <pos>0.045 0.17</pos>
      <size>0.91 0.72</size>
      <fontSize>${fontSize}</fontSize>
      <primaryColor>DAE3EE</primaryColor>
      <selectedColor>${accent}</selectedColor>
      <selectorColor>${base}</selectorColor>
    </textlist>
  </view>
</theme>
`;
}
