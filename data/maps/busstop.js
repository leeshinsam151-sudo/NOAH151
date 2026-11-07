/* 마을 입구 버스 정류장 (20 x 15) */
GameData.defineMap('busstop', {
  name: '달무리 마을 입구',
  bgm: [{ cond: { flag: 'p_fog' }, v: 'sad' }, { v: 'village' }],
  weather: [{ cond: { flag: 'p_fog', notFlag: 'c1_frag' }, v: 'fog' }],
  ambience: [{ cond: { flag: 'p_fog', notFlag: 'c1_frag' }, v: 'wind' }, { v: 'summer' }],
  tiles: [
    'TTTTTTTTT::TTTTTTTTT',
    'TTTTTTTt.::.tTTTTTTT',
    'TTT,....::....,.tTTT',
    'TT......::......,.TT',
    'T..,....::........,T',
    'T.......::.........T',
    'T..t....::.....S...T',
    'T.......::.........T',
    '::::::::::::::::::::',
    '====================',
    '====================',
    '::::::::::::::::::::',
    '.,......,.......,...',
    'TTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTT',
  ],
  events: [
    { id: 'toVillage', x: 9, y: 0, area: [2, 1], warp: ['village', 19, 28, 'up', { se: 'whoosh' }] },
    { id: 'sign', x: 15, y: 6, script: ['"달무리 마을 입구 — 버스는 하루에 네 번 다닙니다."', '그 아래에 누군가 작게 적어 두었다. "고양이 조심. 아니, 고양이가 조심."'] },
    { id: 'road', x: 0, y: 9, area: [20, 2], through: false, trigger: 'none' },
  ],
});
