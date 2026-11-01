# 데이터·스크립트 작성 가이드

엔진(`js/`)은 건드리지 않고 `data/` 파일만으로 맵·대사·이벤트·음악을 추가할 수 있다.

## 새 장 추가하기
1. `data/chapters/chapter2.js` 를 만든다.
2. `GameData.defineChapter({ num: 2, id: 'chapter2', title: '2장 · …', start: 'c2_start' })`
3. 새 맵은 `data/maps/*.js` 에 `GameData.defineMap(id, {...})`.
4. 기존 맵에 이 장의 이벤트를 넣을 때는 `GameData.addEvents('village', [...])` — 조건(`cond`)에 `{ chapter: 2 }` 등을 붙여 장끼리 섞이지 않게 한다.
5. `index.html` 의 데이터 스크립트 목록에 파일을 한 줄 추가한다.
6. 1장 마지막 스크립트(`c1_final`)는 `['chapter', 2, ...]` 로 넘어간다. 2장의 시작 이벤트를 `{ chapter: 2, notFlag: 'c2_started' }` 조건의 `auto` 이벤트로 만들면 이어진다.

## 맵
```js
GameData.defineMap('id', {
  name: '배너에 뜨는 이름',
  bgm: 'village',                       // 또는 [{ cond: {...}, v: 'sad' }, { v: 'village' }]
  weather: 'fog',                       // fog | fireflies | dust | rain | snow (조건 배열 가능)
  tone: 'night',                        // 맵 고정 색조 (night | dusk | memory | dawn)
  dark: 0.7,                            // 어두운 맵 (주인공 주변만 밝다)
  noSwitch: true,                       // 감투 전환 금지
  tiles: ['....', ...],
  events: [...],
});
```

### 타일 문자
| 문자 | 타일 | | 문자 | 타일 |
|---|---|---|---|---|
| `.` | 풀 | | `T` | 나무 (막힘) |
| `,` | 꽃 | | `t` | 덤불 (막힘) |
| `"` | 긴 풀 | | `#` | 울타리 |
| `:` | 흙길 | | `R` / `r` | 기와 / 함석 지붕 |
| `=` | 아스팔트 | | `H` `W` `D` | 벽 / 창문 / 문 |
| `~` | 물 (감투 점프 대상) | | `h` | 고양이 틈 (감투만 통과) |
| `o` | 징검돌 | | `f` / `v` | 밭 / 작물(막힘) |
| `b` | 다리 | | `w` `j` `k` | 우물 / 장독 / 바위 |
| `p` / `P` | 정자 마루 / 기둥 | | `S` | 표지판 |
| `Y` `O` | 큰 나무 밑동 / 그루터기 | | `E` | 모래 |
| `F` `J` `n` | 나무 바닥 / 장판 / 시멘트 | | `X` `M` | 실내 벽 윗면 / 벽면 |
| `C` `K` `L` `Q` | 장롱 / 부엌 / 상(카운터) / 선반 | | `Z` `B` `g` | 이불 / 고정 상자 / 퍼즐 목표 |

## 이벤트
```js
{
  id: 'npc', x: 5, y: 3, area: [2, 1],      // area: 여러 칸을 덮는 구역
  pages: [                                   // 조건이 맞는 '마지막' 페이지가 쓰인다
    {
      cond: { flag: 'a', notFlag: 'b', chapter: 1, item: 'x', var: ['n', '>=', 2], control: 'gamtu' },
      sprite: 'grandma', dir: 'down', pos: [x, y],
      trigger: 'action',   // action(조사) | touch(밟기/부딪히기) | auto(자동 실행) | none
      script: [...] 또는 '스크립트이름',
      through: true, below: true, above: true, noTurn: true, priority: 1,
      move: { type: 'random', radius: 2 } | { type: 'patrol', route: 'LLRR', chase: 2, speed: 2 },
      catch: true,          // 주인공과 닿으면 script 실행 (그림자 등)
      push: true,           // 재희가 밀 수 있는 상자
      light: 40,            // 어두운 맵에서 빛나는 반경
      warp: ['map', x, y, 'dir', { cat: true }],   // 출입구 축약형
      offset: [dx, dy],
    },
  ],
}
```

## 스크립트 명령
- `'이름: 대사'` — 대사 (이름은 `data/game.js` 의 `defineCharacters`), `'대사'` — 내레이션
  - `{속마음}` 회색 작은 글씨, `[강조]` 노란 글씨, `\n` 줄바꿈
- `['choice', ['가', '나'], [[...가 명령], [...나 명령]]]`
- `['if', 조건, [참], [거짓]]`, `['call', '스크립트']`, `['js', (state, G) => {}]`
- `['flag', 이름, 값]`, `['var', 이름, '='|'+'|'-', 값]`, `['item', id, ±n]`, `['goal', '목표']`
- `['move', 대상, 'UDLR udlr _ J j', {speed, wait}]` (대상: player · jaehee · gamtu · bori · 이벤트 id · self)
- `['face', 대상, 방향|대상]`, `['setPos', 대상, x, y, 방향]`, `['emote', 대상, '!'|'?'|'♥'|'♪'|'…'|'💧'|'zzz']`
- `['anim', 대상, 'shiver'|'hop', ms]`, `['show'|'hide', 대상, {fade}]`, `['sprite', 대상, 키]`, `['sparkle', 대상]`
- `['warp', 맵, x, y, 방향, {fade, cat, reload}]`, `['party', 'add'|'remove', id, x, y]`, `['follow', id, bool]`, `['gather']`, `['control', 'jaehee'|'gamtu']`, `['lock', bool]`
- `['fadeOut', ms, 색]`, `['fadeIn', ms]`, `['flash', 색, ms]`, `['shake', 세기, ms]`, `['gray', 0~1, ms]`, `['tone', 이름, ms]`, `['weather', 이름]`, `['camera', 대상|[x,y]|'reset', ms]`
- `['bgm', 이름, 페이드ms]`, `['stopBgm', ms]`, `['se', 이름]`, `['wait', ms]`
- `['caption', [줄...], {hold}]`, `['chapterCard', '1장', '제목']`, `['chapter', 번호, '메뉴 제목']`
- `['ability', id, '이름']`, `['courage', 1]`, `['minigame', 'heartbeat', {...}]` (결과는 `vars.mg`), `['autosave']`, `['hideParty', bool]`, `['title']`

## 음악 (`data/music.js`)
8분음표 한 칸 = 토큰 하나. `c5` 음, `-` 늘이기, `.` 쉼표, 드럼 채널은 `k x h`.

## 미니게임 추가
`G.minigames.register('이름', async (opt, rootElement) => 결과)` 를 `js/minigames.js` 에 추가한다.
