import {safeTheme, createThemeXML} from './model.js';

export function downloadText(filename, content, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportTheme(theme) {
  downloadText('theme.xml', createThemeXML(theme), 'application/xml;charset=utf-8');
}

export function exportSnapshot(theme, collection, systemId) {
  const snapshot = {
    schemaVersion: 1,
    project: 'R36S Web Lab',
    type: 'browser-preview',
    theme: safeTheme(theme),
    selectedSystem: systemId,
    libraries: Object.fromEntries(Object.entries(collection).map(([id, names]) => [id, names.slice(0, 2000)]))
  };
  downloadText('r36s-web-lab-project.json', JSON.stringify(snapshot, null, 2), 'application/json;charset=utf-8');
}
