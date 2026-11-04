/* 거울 숲 · 첫 번째 거울 방 — 5장. 은빛 나무(^), 은빛 바닥(e), 거울 벽(!) */
GameData.defineMap('mirror1', {
  name: '거울 숲 · 첫 번째 거울 방',
  bgm: [{ cond: { flag: 'c5_free' }, v: 'memory' }, { v: 'fog' }],
  weather: 'fog',
  tiles: [
    '^^^^e^^^^^^^^^^^^',
    '^eeeeeee!eeeeeee^',
    '^eeeeeee!eeeeeee^',
    '^eeeeeee!eeeeeee^',
    '^eeeeeee!eeeeeee^',
    '^eeeeeee!eeeeeee^',
    '^eeeeeee!eeeeeee^',
    '^eeeeeee!eeeeeee^',
    '^eeeeeee!eeeeeee^',
    '^eeeeeee!eeee^ee^',
    '^^^^e^^^^^^^^^^^^'
  ],
  events: [
    { id: 'exit', x: 4, y: 0, warp: ['mirror2', 4, 9, 'up', { se: 'whoosh' }] },
  ],
});
