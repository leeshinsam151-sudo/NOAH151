/* 옛 분교 (26 x 16) — 문 닫은 학교와 멈춘 시계탑 */
GameData.defineMap('school', {
  name: '달무리 분교',
  bgm: [{ cond: { flag: 'c3_frag' }, v: 'village' }, { v: 'forest' }],
  ambience: 'summer',
  tiles: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T.rrrrrrrrrr...RRRR......T',
    'T.rrrrrrrrrr...RRRR.,....T',
    'T.HWHWHDHWHW...RRRR...t..T',
    'T..............HDHH......T',
    'T...,....,..tS...........T',
    'T.t.................t....T',
    'T..:::::::::::::::::::...T',
    'T..:::::::::::::::::::::::',
    'T,.:::::::::::::::::::::::',
    'T..:::::::::::::::::::.,.T',
    'T..:::::::::::::::::::...T',
    'T..:::::::::::::::::::...T',
    'T..t......t...,.......t..T',
    'T........................T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  events: [
    { id: 'toVillage', x: 25, y: 8, area: [1, 2], warp: ['village', 1, 15, 'right', { se: 'whoosh' }] },
    { id: 'classDoor', x: 7, y: 3, warp: ['classroom', 5, 7, 'up'] },
    { id: 'sign', x: 13, y: 5, script: ['"달무리 분교" — 그 아래 작은 글씨로 "문 닫은 지 15년"이라고 적혀 있다.'] },
  ],
});
