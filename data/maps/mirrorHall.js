/* 거울 숲 · 마지막 거울 — 5장. 은빛 나무(^), 은빛 바닥(e), 거울 벽(!) */
GameData.defineMap('mirrorHall', {
  name: '거울 숲 · 마지막 거울',
  bgm: [{ cond: { flag: 'c5_free' }, v: 'memory' }, { v: 'fog' }],
  weather: 'fog',
  tiles: [
    '^^^^^^^^^^^^^^^^^',
    '^eeeeeeeeeeeeeee^',
    '^eeeeeeeeeeeeeee^',
    '^ee^eeeeeeeee^ee^',
    '^eeeeeeeeeeeeeee^',
    '^eeeeeeeeeeeeeee^',
    '^eeeeeeeeeeeeeee^',
    '^eeeeeeeeeeeeeee^',
    '^e^eeeeeeeeeee^e^',
    '^eeeeeeeeeeeeeee^',
    '^eeeeeeeeeeeeeee^',
    '^^^^^^^^e^^^^^^^^'
  ],
  events: [

  ],
});
