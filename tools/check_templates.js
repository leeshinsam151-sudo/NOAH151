// 템플릿 행 길이 검사
global.window = global; global.document = { createElement: () => ({ getContext: () => ({}) }) };
require('../js/core.js'); require('../js/sprites.js');
const T = G.sprites.templates; let bad = 0;
for (const [name, tpl] of Object.entries(T)) for (const [dir, rows] of Object.entries(tpl)) rows.forEach((r, i) => { if (r.length !== 16) { bad++; console.log(name, dir, i, r.length, JSON.stringify(r)); } });
console.log(bad ? 'BAD ' + bad : 'templates ok');
