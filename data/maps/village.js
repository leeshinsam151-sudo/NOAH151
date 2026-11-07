/*
 * 달무리 마을 (40 x 30)
 * 타일 범례는 docs/scripting.md 참고. 장마다 바뀌는 이벤트는 data/chapters/*.js 에서 GameData.addEvents 로 추가한다.
 */
GameData.defineMap('village', {
  name: '달무리 마을',
  bgm: [
    { cond: { flag: 'c1_frag' }, v: 'village' },
    { cond: { flag: 'p_fog' }, v: 'sad' },
    { v: 'village' },
  ],
  weather: [{ cond: { flag: 'p_fog', notFlag: 'c1_frag' }, v: 'fog' }],
  ambience: [{ cond: { flag: 'p_fog', notFlag: 'c1_frag' }, v: 'wind' }, { v: 'summer' }],
  tiles: [
    "TTTTTTTTTTTTTTTTTTT::TTTTTTTTTTTTTTTTTTT",
    "TTTTTTTTTTTTTTTTTT.::.TTTTTTTTTTTTTTTTTT",
    'TTt..,..""...,..t..::.t..,.....k..,.tTTT',
    "~~~~~~~~~~~~~~~~~~~bb~~~~~~~~~~o~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~bb~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~bb~~~~~~~~~~o~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~bb~~~~~~~~~~~~~~~~~~~",
    "T..,.....t..,.....t::t..,......,.......T",
    "###############....::.....#############T",
    "#jj.RRRRRRR..t#.,..::..,..#..rrrrrrr..#T",
    "#j..RRRRRRR.vv#....::.PpP.#..rrrrrrr..#T",
    "#...HhHDHWH.vv#.YY.::.ppp.#..HhHDHWH..#T",
    "#,..........vv#.YY.::.PpP.#,.........,#T",
    "#..,.....,....#....::.....#...........#T",
    "#######:#######....::.....######:######T",
    "::::::::::::::::::::::::::::::::::::::::",
    "::::::::::::::::::::::::::::::::::::::::",
    "T..,...............::..,...............T",
    "T.ffffffff.........::...rrrrrrrr.......T",
    "T.fvfvfvff.....w...::...rrrrrrrr..t.t..T",
    "T.ffffffff.........::...HWHHDHWH.......T",
    "T.fvfvfvff.........::.......:..........T",
    "T.ffffffff...,.....::.......:....,.....T",
    "T..................::::::::::..........T",
    "T..t..,....t.......::..........,.......T",
    "TTT.............t..::..t...............T",
    "TTTTT..............::...............TTTT",
    "TTTTTTTT.........t.::.t..........TTTTTTT",
    "TTTTTTTTTTTTTTTTT..::..TTTTTTTTTTTTTTTTT",
    "TTTTTTTTTTTTTTTTTT.::.TTTTTTTTTTTTTTTTTT"
  ],
  events: [
    // 출입구
    // 서쪽 옛 분교로 가는 길 (3장부터 열린다)
    {
      id: 'toSchool', x: 0, y: 15, area: [1, 2],
      pages: [
        { trigger: 'touch', script: ['서쪽 옛 분교로 이어지는 길이다. 지금은 갈 일이 없다.', ['move', 'player', 'R']] },
        { cond: { chapterMin: 3, flag: 'c3_tree' }, warp: ['school', 24, 8, 'left', { se: 'whoosh' }] },
      ],
    },
    // 동쪽 골짜기로 가는 길 (2장부터 열린다)
    {
      id: 'toValley', x: 39, y: 15, area: [1, 2],
      pages: [
        { trigger: 'touch', script: ['동쪽 골짜기로 이어지는 길이다. 지금은 갈 일이 없다.', ['move', 'player', 'L']] },
        { cond: { chapterMin: 2, flag: 'c2_tree' }, warp: ['valley', 1, 8, 'right', { se: 'whoosh' }] },
      ],
    },
    { id: 'toBus', x: 18, y: 29, area: [4, 1], warp: ['busstop', 10, 1, 'down', { se: 'whoosh' }] },
    { id: 'grandmaDoor', x: 7, y: 11, warp: ['house', 8, 9, 'up'] },
    { id: 'shopDoor', x: 28, y: 20, warp: ['shop', 5, 7, 'up'] },
    // 할머니 집 마루 밑 틈 (감투만 들어갈 수 있다)
    {
      id: 'holeGrandma', x: 5, y: 11,
      pages: [
        { trigger: 'action', script: ['마루 밑으로 이어진 작은 틈이다. 사람은 못 들어가지만, 고양이라면…'] },
        { cond: { control: 'gamtu' }, trigger: 'touch', script: [['var', 'under', '=', 'grandma'], ['warp', 'underfloor', 4, 4, 'up', { cat: true, se: 'rustle' }]] },
      ],
    },
    {
      id: 'holeIjang', x: 30, y: 11,
      pages: [
        { trigger: 'action', script: ['이장님 댁 마루 밑으로 이어진 틈이다. 고양이 한 마리쯤은 들어갈 수 있겠다.'] },
        { cond: { control: 'gamtu' }, trigger: 'touch', script: [['var', 'under', '=', 'ijang'], ['warp', 'underfloor', 4, 4, 'up', { cat: true, se: 'rustle' }]] },
      ],
    },
    // 둘러보기
    { id: 'well', x: 15, y: 19, script: ['오래된 우물이다. 들여다보니 동그란 하늘이 비친다.', ['if', { flag: 'p_fog', notFlag: 'c1_frag' }, ['…하늘마저 잿빛이다.']]] },
    { id: 'jar2', x: 1, y: 10, script: ['장독 뚜껑 위에 잠자리 한 마리가 앉아 있다.'] },
    { id: 'jar1', x: 1, y: 9, area: [2, 1], script: ['할머니의 장독대. 된장, 고추장, 간장… 뚜껑마다 반짝반짝 윤이 난다.'] },
    { id: 'crops', x: 12, y: 10, area: [2, 3], script: ['고추가 빨갛게 익어 간다.'] },
    { id: 'pavilion', x: 22, y: 12, script: ['마을 정자. 여름이면 어르신들이 모여 부채질을 하신다.'] },
    { id: 'ijangHouse', x: 32, y: 11, script: ['이장님 댁 현관문이다. 굳게 닫혀 있다.'] },
    { id: 'shopSign', x: 25, y: 20, script: ['"달무리상회 — 없는 것 빼고 다 있음"'] },
  ],
});
