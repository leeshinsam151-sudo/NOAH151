/* 달무리상회 창고 (11 x 10) — 상자 밀기 퍼즐 */
GameData.defineMap('storage', {
  name: '달무리상회 창고',
  bgm: 'shop',
  ambience: 'indoor',
  tiles: [
    'XXXXXXXXXXX',
    'XMMMMQMMMMX',
    'XnnnnnnnnnX',
    'XngnnnnngnX',
    'XnnnnnnnnnX',
    'XBnnnnnnnBX',
    'XnnnnnnnnnX',
    'XnnnngnnnnX',
    'XnnnnnnnnnX',
    'XXXXXDXXXXX',
  ],
  events: [
    { id: 'exit', x: 5, y: 9, warp: ['shop', 10, 2, 'down'] },
  ],
});
