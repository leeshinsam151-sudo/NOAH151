/* 동쪽 골짜기 (30 x 18) — 개울을 건너 동굴 입구로 */
GameData.defineMap('valley', {
  name: '동쪽 골짜기',
  bgm: [{ cond: { flag: 'c2_frag' }, v: 'village' }, { v: 'forest' }],
  tiles: [
    'TTTTTTTTTTTTT~~~TTTTTTTTTTkkkk',
    'TTT..........~~~..........kkkk',
    'TTT.....T....~~~..........kkkk',
    'T.T.T........~~~....T.....kkkk',
    'TT.........,.~~~.......T..kkkk',
    'TTT...t......~~~..t.......kkkk',
    "TTT,.....\"\"..~~~....,.....kkkk",
    'TT...........~~~..........kkkk',
    ':::::::::::::~o~::::::::::Akkk',
    ':............~~~..........kkkk',
    'T.T..,.......~~~.....t....kkkk',
    "T.T....,.....~~~..\"\"......kkkk",
    "T.T.\"........~~~...T....,.kkkk",
    'TTT......T...~~~..........kkkk',
    'TT...T.......~~~.,....T...kkkk',
    'TT........t..~~~..........kkkk',
    'T.T..........~~~..........kkkk',
    'TTTTTTTTTTTTT~~~TTTTTTTTTTkkkk'
  ],
  events: [
    { id: 'toVillage', x: 0, y: 8, area: [1, 2], warp: ['village', 38, 15, 'left', { se: 'whoosh' }] },
  ],
});
