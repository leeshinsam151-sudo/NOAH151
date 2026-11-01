/*
 * data/game.js — 게임 전체 설정, 캐릭터 모습, 대화 이름표, 아이템, 공용 스크립트
 * 새 캐릭터는 GameData.defineSprites 에 색과 모양만 적으면 픽셀 아트가 자동으로 만들어진다.
 */
GameData.defineConfig({
  title: '감투와 별방울',
  start: { map: 'busstop', x: 10, y: 8, dir: 'up' },
  maxCourage: 7,
  party: {
    jaehee: { sprite: 'jaehee', kind: 'jaehee', speed: 5 },
    gamtu: { sprite: 'gamtu', kind: 'gamtu', speed: 5.4 },
    bori: { sprite: 'bori', kind: 'npc', speed: 5 },
  },
  cantLeaveLine: '…재희를 두고 혼자 멀리 갈 수는 없어. (C 키 / 감투 버튼으로 재희에게 돌아가자)',
  helpHTML: `
    <b>이동</b> 방향키 / WASD / 화면 방향 패드<br>
    <b>확인·말 걸기·조사</b> Z / Enter / Space / 확인 버튼<br>
    <b>메뉴·취소</b> X / Esc / 메뉴 버튼<br>
    <b>감투로 바꾸기</b> C / Shift / 감투 버튼 (배운 뒤부터)<br>
    <br>
    감투만 들어갈 수 있는 좁은 틈이 있습니다.<br>
    무서워서 못 하던 일도, 용기가 자라면 해낼 수 있게 됩니다.<br>
    막히면 메뉴의 <b>할 일</b>을 확인하세요.`,
});

GameData.defineSprites({
  jaehee: { type: 'human', hair: '#4a2e1e', cloth: '#ff7f9e', pants: '#3e4f8f', style: 'pigtail', ribbon: '#ffd34d', shoes: '#ffffff' },
  littleJaehee: { type: 'human', hair: '#4a2e1e', cloth: '#ffd34d', pants: '#ffb84d', style: 'pigtail', ribbon: '#ff6f91', shoes: '#ff6f91' },
  grandma: { type: 'human', hair: '#d2d2d8', cloth: '#9a7ac8', pants: '#5a5a70', style: 'bun', skin: '#f0cfae', shoes: '#ffffff' },
  grandmaPin: { type: 'human', hair: '#d2d2d8', cloth: '#9a7ac8', pants: '#5a5a70', style: 'bun', pin: true, skin: '#f0cfae', shoes: '#ffffff' },
  youngGrandma: { type: 'human', hair: '#3a3a44', cloth: '#7aa8d8', pants: '#5a5a70', style: 'bun', pin: true, skin: '#f4d3b2', shoes: '#ffffff' },
  ijang: { type: 'human', hair: '#9a9aa0', cloth: '#8a6a3a', pants: '#4a4a4a', style: 'bald', skin: '#e8c09a', mustache: '#d0d0d0' },
  geumsun: { type: 'human', hair: '#2a1e1e', cloth: '#5aa86a', pants: '#3a3a5a', style: 'apron', apron: '#fff2d8' },
  minsu: { type: 'human', hair: '#2a1e1e', cloth: '#4a9ae8', pants: '#3a3a3a', style: 'cap', ribbon: '#e84a4a' },
  gamtu: { type: 'cat', fur: '#f2a24a', patch: '#f2a24a', white: '#f7c27a', outline: '#5a2e14' },
  kitten: { type: 'cat', fur: '#f2a24a', patch: '#f2a24a', white: '#f7c27a', outline: '#5a2e14' },
  bori: { type: 'dog', fur: '#e8c27a', white: '#fff4dc' },
  boriCollar: { type: 'dog', fur: '#e8c27a', white: '#fff4dc', collar: '#d03a3a' },
  jaeheeSleep: { type: 'proc', draw: 'sleeper', hair: '#4a2e1e', quilt: '#f08aa8' },
  grandmaSleep: { type: 'proc', draw: 'sleeper', hair: '#d2d2d8', quilt: '#9a7ac8' },
});

/* 대사 이름표: 이름 → 초상화 스프라이트, 이름 색, 목소리 높이 */
GameData.defineCharacters({
  재희: { sprite: 'jaehee', color: '#ffb3c6', voice: 1.1 },
  감투: { sprite: 'gamtu', color: '#ffd29a', voice: 1.6 },
  할머니: { sprite: 'grandma', color: '#e0c8ff', voice: 0.8 },
  '할머니 ': { display: '할머니', sprite: 'grandmaPin', color: '#e0c8ff', voice: 0.8 },
  젊은할머니: { display: '할머니', sprite: 'youngGrandma', color: '#e0c8ff', voice: 0.85 },
  꼬마재희: { display: '어린 재희', sprite: 'littleJaehee', color: '#ffd9a0', voice: 1.3 },
  이장님: { sprite: 'ijang', color: '#e8c89a', voice: 0.6 },
  '금순 아줌마': { sprite: 'geumsun', color: '#a8f0b0', voice: 0.95 },
  민수: { sprite: 'minsu', color: '#a8dcff', voice: 1.3 },
  보리: { sprite: 'bori', color: '#ffd896', voice: 0.7 },
  깍순이: { sprite: 'magpie', color: '#b8c8ff', voice: 1.5 },
  찍찍이: { sprite: 'mouse', color: '#e0e0e8', voice: 1.9 },
  느티나무: { color: '#b4f0a8', voice: 0.5, portrait: false },
  '???': { color: '#bbbbcc', voice: 0.5, portrait: false },
  버스기사: { color: '#cccccc', voice: 0.7, portrait: false },
});

GameData.defineItems({
  anchovy: { name: '멸치 간식', desc: '감투가 제일 좋아하는 바삭한 멸치.', icon: 'anchovy' },
  leek: { name: '대파', desc: '할머니 텃밭에서 뽑은 싱싱한 대파.', icon: 'leek' },
  ball: { name: '빨간 공', desc: '어릴 적 할머니 집에서 갖고 놀던 공.', icon: 'ball' },
  starbell: { name: '별방울', desc: '작은 별 모양 방울. 흔들면 맑은 소리가 난다.', icon: 'bell' },
  collar: { name: '빨간 목걸이', desc: '"보리"라고 새겨진 이름표가 달려 있다.', icon: 'collar' },
  chew: { name: '개껌', desc: '달무리상회 특제 개껌. 보리가 제일 좋아한다.', icon: 'chew' },
  fragment1: { name: '기억 조각 · 첫 번째', desc: '할머니의 기억이 담긴, 따뜻하게 빛나는 조각.', icon: 'fragment' },
  hairpin: { name: '은비녀', desc: '할머니가 아끼는 은비녀. 끝에 작은 파란 돌이 박혀 있다.', icon: 'hairpin' },
});

/* ---------- 공용 스크립트 ---------- */
GameData.defineScripts({
  /* 재희가 감투에게 말을 걸 때 (장마다 대사가 바뀐다) */
  talk_gamtu: [
    ['if', { flag: 'p_bell' }, [
      ['if', { chapterMin: 1 }, [
        ['if', { flag: 'c1_end' }, [
          '감투: 응? 왜? …아, 나 늠름해 보여? 헤헤. 할머니가 그랬어. 늠름하대.',
        ], [
          ['if', { flag: 'c1_brave' }, [
            '감투: 나… 아까 진짜 소리 질렀지? 지금 생각하면 다리가 후들후들해.',
            '재희: 근데 멋있었어.',
            '감투: …헤헤. 한 번만 더 말해 줘.',
          ], [
            ['if', { flag: 'c1_bori_friend' }, [
              '감투: 보리는… 생각보다 착한 것 같아. 생각보다. 아주 조금.',
            ], [
              '감투: 재희야, 할머니 꼭 낫게 해 주자. …근데 무서운 데는 네가 앞장서.',
            ]],
          ]],
        ]],
      ], [
        '감투: 왜 불러? …설마 또 이동장에 넣으려는 건 아니지?',
      ]],
    ], [
      ['se', 'meow'],
      ['if', { flag: 'p_out' }, [
        '감투: 냐아. {(왜 불러? 나 지금 경계 중이야.)}',
      ], [
        '감투: 냐…. {(이동장 밖은 위험해.)}',
      ]],
    ]],
  ],
  talk_jaehee: [
    '재희: 감투야, 조심해! 무서우면 바로 돌아와.',
  ],
  talk_bori: [
    ['se', 'bark'],
    '보리: 월! 걱정 마. 내가 뒤를 지킬게.',
  ],
  /* 감투가 능력이 없는데 물을 건너려 할 때 */
  fear_water: [
    ['emote', 'player', '!'],
    ['se', 'scared'],
    ['anim', 'player', 'shiver', 700],
    ['if', { flag: 'p_bell' }, [
      '감투: 무, 물 위를 뛰라고? 저 돌까지? 절대, 절대 안 돼! 빠지면 어떡해!',
    ], [
      '감투: 냐아앙! {(물이다! 물은 안 돼!)}',
    ]],
  ],
  /* 재희가 징검다리 앞에서 */
  jaehee_water: [
    ['if', { ability: 'jump' }, [
      '재희: 사람이 뛰기엔 돌이 너무 멀어. …감투라면 건널 수 있을 거야. [C 키(감투 버튼)]로 감투를 움직여 보자.',
    ], [
      '재희: 물 가운데에 돌이 있다. 사람이 건너기엔 너무 멀다.',
    ]],
  ],
});
