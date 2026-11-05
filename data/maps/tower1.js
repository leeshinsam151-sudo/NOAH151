/* 시계탑 1층 (14 x 11) — 톱니바퀴 퍼즐과 도르래 바구니 */
GameData.defineMap('tower1', {
  name: '시계탑 1층',
  bgm: 'night',
  ambience: 'wind',
  echo: true,
  tiles: [
    'XXXXXXXXXXXXXX',
    'XMMMMMMMMMMMMX',
    'XFFFFFFFFFFFFX',
    'XFgFFFFFFFgFFX',
    'XFFFFFFFFFFFFX',
    'XFFFFFFFFFFFFX',
    'XFFFFFgFFFFFFX',
    'XFFFFFFFFFFFFX',
    'XFFFFFFFFFFFFX',
    'XFFFFFFFFFFFFX',
    'XXXXXXDDXXXXXX'
  ],
  events: [
    { id: 'exit', x: 6, y: 10, area: [2, 1], warp: ['school', 16, 5, 'down'] },
  ],
});
