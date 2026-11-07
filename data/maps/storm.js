/* 폭풍우 치는 밤의 마을 뒷길 (30 x 22)
 * 아래(할머니 집·개울) → 가운데(들보 통로) → 위(정전된 골목, 숨은 돌길) → 정자 언덕
 * 1~3장에서 배운 능력(징검다리 점프·들보 걷기·고양이 눈)을 모두 쓴다 */
GameData.defineMap('storm', {
  name: '폭풍우 치는 밤',
  bgm: [{ cond: { flag: 'c4_found' }, v: 'night' }, { v: 'tension' }],
  weather: 'rain',
  dark: 0.8,
  lights: 'party',
  ambience: 'rain',
  tiles: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTT,........T',
    'TTTTTTTTTTTTTTTTTTTT.,.......T',
    'TTTTTTTTTTTTTTTTTTTT....PpP..T',
    'TTTTTTTTTTTTTVVVVVVV....ppp..T',
    'TTTTTTTTTTTTTVVVVVVV....PpP..T',
    'TTTTTTTTTTTTTVVVIIII.......YYT',
    'TTTTTTTTTTTTTVVVIVVV..,....YYT',
    'TTTTTTTTTTTTTVIIIVVV.........T',
    'TTTTTTTTTTTTTVIVVVVVTTTTTTTTTT',
    'TTTTTTTTTTTTTT:TTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTT:TTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTT:TTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTT.:..VVV....TTTTTT',
    'TTTTTTTTTTTTT.:..lll:::#TTTTTT',
    'TRRRRRR..~~~T.:..VVV....TTTTTT',
    'TRRRRRR..~~~T.:..TTTTTTTTTTTTT',
    'THWHDHW..~~~..:..TTTTTTTTTTTTT',
    'T...:....~~~..:..TTTTTTTTTTTTT',
    'T::::::::~o~::::.TTTTTTTTTTTTT',
    'T........~~~.....TTTTTTTTTTTTT',
    'TTTTTTTTT~~~TTTTTTTTTTTTTTTTTT'
  ],
  events: [],
});
