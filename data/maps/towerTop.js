/* 시계탑 꼭대기 (12 x 10) — 커다란 시계 */
GameData.defineMap('towerTop', {
  name: '시계탑 꼭대기',
  bgm: [{ cond: { flag: 'c3_clock' }, v: 'memory' }, { v: 'night' }],
  tiles: [
    'XXXXXXXXXXXX',
    'XMMMMMMMMMMX',
    'XFFFFFFFFFFX',
    'XFFFFFFFFFFX',
    'XFFFFFFFFFFX',
    'XFFFFFFFFFFX',
    'XFFFFFFFFFFX',
    'XFFFFFFFFFFX',
    'XFFFFFFFFFFX',
    'XXXXXDXXXXXX'
  ],
  events: [
    { id: 'exit', x: 5, y: 9, warp: ['tower2', 16, 2, 'down'] },
  ],
});
