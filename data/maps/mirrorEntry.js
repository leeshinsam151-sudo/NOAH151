/* 거울 숲 — 5장. 은빛 나무(^), 은빛 바닥(e), 거울 벽(!) */
GameData.defineMap('mirrorEntry', {
  name: '거울 숲',
  bgm: [{ cond: { flag: 'c5_free' }, v: 'memory' }, { v: 'fog' }],
  weather: 'fog',
  tiles: [
    '^^^^^^^^^^e^^^^^^^^^',
    '^eeeeeeeeeeeeeeeeee^',
    '^eeeeeeeeeeeeeeeeee^',
    '^eee^eeeeeeeeee^eee^',
    '^eeeeeeeeeeeeeeeeee^',
    '^eeeeeeeeeeeeeeeeee^',
    '^e^eeeee^eee^eeeeee^',
    '^eeeeeeeeeeeeeeee^e^',
    '^eeeeeeeeeeeeeeeeee^',
    '^eeee^eeeeeeee^eeee^',
    '^eeeeeeeeeeeeeeeeee^',
    '^eeeeeeeeeeeeeeeeee^',
    '^eeeeeeeeeeeeeeeeee^',
    '^^^^^^^^^ee^^^^^^^^^'
  ],
  events: [
    { id: 'toRoom1', x: 10, y: 0, pages: [{ cond: { flag: 'c5_trapped' }, warp: ['mirror1', 4, 9, 'up', { se: 'whoosh' }] }] },
  ],
});
