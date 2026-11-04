/* 거울 숲 · 세 번째 거울 방 — 5장. 은빛 나무(^), 은빛 바닥(e), 거울 벽(!) */
GameData.defineMap('mirror3', {
  name: '거울 숲 · 세 번째 거울 방',
  bgm: [{ cond: { flag: 'c5_free' }, v: 'memory' }, { v: 'fog' }],
  weather: 'fog',
  tiles: [
    '^^^^e^^^^^^^^^^^^',
    '^eeeeeee!eeeeeee^',
    '^eeeeeee!eeeeeee^',
    '^eeeeeee!eeeeeee^',
    '^eeeeeee!^eeeeee^',
    '^eeeeeee!eeeeeee^',
    '^eeeeeee!eeeeeee^',
    '^eeeeeee!eeeeeee^',
    '^ee^eeee!eeeeeee^',
    '^eeeeeee!eeeeeee^',
    '^^^^e^^^^^^^^^^^^'
  ],
  events: [
    { id: 'exit', x: 4, y: 0, warp: ['mirrorHall', 8, 10, 'up', { se: 'whoosh' }] },
  ],
});
