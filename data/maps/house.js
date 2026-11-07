/* 할머니 집 안 (16 x 12): 왼쪽 안방, 가운데 마루, 오른쪽 부엌 */
GameData.defineMap('house', {
  name: '할머니 집',
  bgm: [{ cond: { flag: 'p_fog', notFlag: 'c1_frag' }, v: 'sad' }, { v: 'house' }],
  ambience: 'indoor',
  tiles: [
    'XXXXXXXXXXXXXXXX',
    'XMMMMMXMMMMXMMMX',
    'XJCCJJXFFFFXKKKX',
    'XJJJJJXFFFFXFFFX',
    'XJZZJJXFFLFXFFFX',
    'XJZZJJJFFFFFFFFX',
    'XJJJJJXFFFFXFFKX',
    'XXXXXXXFFFFXXXXX',
    '      XFFFFX    ',
    '      XFFFFX    ',
    '      XXDDXX    ',
    '                ',
  ],
  events: [
    { id: 'exit', x: 8, y: 10, area: [2, 1], warp: ['village', 7, 12, 'down'] },
    { id: 'wardrobe', x: 2, y: 2, area: [2, 1], script: ['오래된 자개장롱. 문짝에 학과 구름이 반짝반짝 새겨져 있다.'] },
    { id: 'stove', x: 12, y: 2, area: [3, 1], script: ['부엌 아궁이와 가마솥. 할머니 냄새가 난다. 구수한 밥 냄새.'] },
    { id: 'stove2', x: 14, y: 6, script: ['반질반질한 장독 뚜껑 위에 국자가 놓여 있다.'] },
    { id: 'photo', x: 4, y: 1, script: ['벽에 걸린 오래된 사진. 젊은 할머니가 어린 엄마를 안고 활짝 웃고 있다.'] },
    { id: 'calendar', x: 9, y: 1, script: ['달력에 동그라미가 그려져 있다. "재희 오는 날!!"', '같은 날짜에 동그라미가 세 번이나 겹쳐 그려져 있다.'] },
  ],
});
