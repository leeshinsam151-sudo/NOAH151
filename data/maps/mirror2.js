/* 거울 숲 · 두 번째 거울 방 — 5장. 은빛 나무(^), 은빛 바닥(e), 거울 벽(!) */
GameData.defineMap('mirror2', {
  name: '거울 숲 · 두 번째 거울 방',
  bgm: [{ cond: { flag: 'c5_free' }, v: 'memory' }, { v: 'mirror' }],
  weather: 'fog',
  ambience: 'mirror',
  tiles: [
    '^^^^e^^^^^^^^^^^^',
    '^eeeeeee!eeeeeee^',
    '^eeeeeee!eeeeeee^',
    '^eeeeeee!eeeeeee^',
    '^eeeeeee!ee^eeee^',
    '^eeeeeee!eeeeeee^',
    '^eeeeeee!eeeeeee^',
    '^eeeeeee!eeeeeee^',
    '^eeeeeee!eeeeeee^',
    '^eeeeeee!e^eeeee^',
    '^^^^e^^^^^^^^^^^^'
  ],
  events: [
    { id: 'exit', x: 4, y: 0, warp: ['mirror3', 4, 9, 'up', { se: 'whoosh' }] },
  ],
});
