/* 분교 교실 (12 x 9) */
GameData.defineMap('classroom', {
  name: '분교 교실',
  bgm: [{ cond: { flag: 'c3_frag' }, v: 'house' }, { v: 'night' }],
  ambience: 'indoor',
  tiles: [
    'XXXXXXXXXXXX',
    'XMMMMMMMMMMX',
    'XFFFFFFFFFFX',
    'XFLFLFLFLFFX',
    'XFFFFFFFFFFX',
    'XFLFLFLFLFFX',
    'XFFFFFFFFFFX',
    'XFFFFFFFFFFX',
    'XXXXXDDXXXXX'
  ],
  events: [
    { id: 'exit', x: 5, y: 8, area: [2, 1], warp: ['school', 7, 4, 'down'] },
  ],
});
