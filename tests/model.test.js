import test from 'node:test';
import assert from 'node:assert/strict';
import {SYSTEMS, DEFAULT_THEME, safeTheme, escapeHTML, createThemeXML} from '../src/model.js';

test('system identifiers are unique', () => {
  assert.equal(new Set(SYSTEMS.map(s => s.id)).size, SYSTEMS.length);
});
test('theme options are validated', () => {
  const theme=safeTheme({accent:'<script>',background:'unknown',fontScale:300,scanlines:'true'});
  assert.equal(theme.accent, DEFAULT_THEME.accent);
  assert.equal(theme.background, DEFAULT_THEME.background);
  assert.equal(theme.fontScale,125);
  assert.equal(theme.scanlines,false);
});
test('HTML metadata is escaped', () => {
  assert.equal(escapeHTML('<script title="a">&'), '&lt;script title=&quot;a&quot;&gt;&amp;');
});
test('generated XML contains expected theme controls', () => {
  const xml=createThemeXML({accent:'#98aabb',background:'slate',fontScale:110});
  assert.match(xml,/<formatVersion>7<\/formatVersion>/);
  assert.match(xml,/<selectedColor>98AABB<\/selectedColor>/);
  assert.match(xml,/<selectorColor>243344<\/selectorColor>/);
  assert.match(xml,/<fontSize>0\.0330<\/fontSize>/);
  assert.doesNotMatch(xml,/<script>/);
});
