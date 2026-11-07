/* 구멍가게 달무리상회 (12 x 9) */
GameData.defineMap('shop', {
  name: '달무리상회',
  bgm: 'shop',
  ambience: 'indoor',
  tiles: [
    'XXXXXXXXXXXX',
    'XMMMMMMMMMDX',
    'XQQQQ..QQQ.X',
    'X..........X',
    'XLLL.......X',
    'X..........X',
    'XQQ.....QQ.X',
    'X..........X',
    'XXXXXDDXXXXX',
  ],
  events: [
    { id: 'exit', x: 5, y: 8, area: [2, 1], warp: ['village', 28, 21, 'down'] },
    { id: 'shelf1', x: 1, y: 2, area: [4, 1], script: ['과자, 라면, 건전지, 모기향, 호미… 정말 없는 것 빼고 다 있다.'] },
    { id: 'shelf2', x: 7, y: 2, area: [3, 1], script: ['유통기한이 아슬아슬한 사탕 통이 있다. "1개 100원"'] },
    { id: 'shelf3', x: 1, y: 6, area: [2, 1], script: ['낚싯바늘과 고무장화가 나란히 걸려 있다.'] },
    { id: 'shelf4', x: 8, y: 6, area: [2, 1], script: ['고양이 사료가 한 봉지 있다. 감투의 눈이 반짝인다.'] },
  ],
});
