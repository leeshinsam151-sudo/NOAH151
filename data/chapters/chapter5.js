/*
 * 5장 · 거울 숲
 * 감투가 넘는 무서운 것: 혼자 남는 것
 * 성장: 늘 "재희를 두고 혼자 갈 수는 없어"였던 감투가, 재희를 구하려고 혼자 숲 끝까지 간다.
 * 흐름: 느티나무가 연 은빛 길 → 거울 숲 입구, 재희가 거울에 갇힘 → 감투 혼자(홀로 모드)
 *      → 거울 쌍둥이 퍼즐 세 방(그림자 감투가 좌우를 거꾸로 따라온다) → 친구들이 모두 달려옴
 *      → 마지막 거울 앞(심장 박자) → 재희 구출, 그림자 감투를 받아들임 → 기억 조각 ⑤(엄마가 떠난 날 밤의 할머니)
 */
GameData.defineChapter({ num: 5, id: 'chapter5', title: '5장 · 거울 숲', start: 'c5_start' });

GameData.defineSprites({
  // 그림자 감투 (시안 B: 거울에 비친 듯 색이 뒤집힌 감투)
  shadowGamtu: {
    type: 'cat', fur: '#0d5db5', patch: '#0d5db5', white: '#083d85', outline: '#a5d1eb',
    stripes: Object.assign({}, GAMTU_STRIPES, { color: '#65addd' }),
  },
  adultMom: { type: 'human', hair: '#3a2a1e', cloth: '#c8a878', pants: '#4a4a5a', style: 'long', shoes: '#5a3a2a' },
});
GameData.defineCharacters({
  '그림자 감투': { sprite: 'shadowGamtu', color: '#9ad0ff', voice: 1.4 },
  어른엄마: { display: '엄마', sprite: 'adultMom', color: '#ffd0e0', voice: 1.0 },
});
GameData.defineItems({
  fragment5: { name: '기억 조각 · 다섯 번째', desc: '차갑게 반짝이다가, 손에 쥐면 따뜻해지는 거울 같은 조각.', icon: 'fragment' },
});

GameData.scripts.talk_gamtu_c04 = GameData.scripts.talk_gamtu;
GameData.defineScripts({
  talk_gamtu: [
    ['if', { chapterMin: 5 }, [
      ['if', { flag: 'c5_free' }, ['감투: 재희야. 다음엔 거울 함부로 들여다보지 마. …진짜로.'], ['감투: 거울 숲… 이름부터 싫어. 재희, 손 꼭 잡아.']],
    ], [['call', 'talk_gamtu_c04']]],
  ],

  c5_start: [
    ['chapterCard', '5장', '거울 숲'],
    ['flag', 'c5_started'],
    ['bgm', 'village', 1500],
    ['fadeIn', 1200],
    '며칠 뒤. 마을에 색이 거의 다 돌아왔다.',
    ['move', 'player', 'U', { speed: 3 }],
    ['face', 'player', 'left'],
    '할머니 : 재희야, 요즘 할미 머리가 많이 맑아졌다. 니 덕분인가?',
    '재희: 감투 덕분이야.',
    '할머니 : 허허, 그래. 감투 대감 덕분이다.',
    '할머니 : …그런데 이상하제. 어젯밤 꿈에 우리 집 마루가 텅 비어 있더라. 아무도 없이.',
    '재희: …….',
    ['goal', '느티나무 할아버지께 가자'],
    ['autosave'],
  ],

  c5_tree: [
    '느티나무: 남은 조각은 둘. 회색 손님은 마을 북쪽 너머, 안개가 거울처럼 굳은 숲으로 갔다. [거울 숲]이지.',
    '느티나무: 그 숲의 거울은 마음속 무서운 것을 비춘다. 그리고… 서로를 잃기 쉽단다.',
    '느티나무: 손을 놓지 말거라.',
    '재희: 응. 감투 손… 아니 발, 꼭 잡고 갈게.',
    '감투: 꼭 잡아. 진짜 꼭.',
    '느티나무: 길을 열어 주마.',
    ['se', 'whoosh'],
    ['flash', '#e8f0ff', 700],
    '느티나무 가지가 크게 흔들리자, 안개 속으로 은빛 길이 열렸다.',
    ['flag', 'c5_tree'],
    ['fadeOut', 900],
    ['warp', 'mirrorEntry', 10, 12, 'up', { fade: false }],
    ['fadeIn', 900],
  ],

  c5_entryIn: [
    '은빛 나무들 사이로 짙은 안개가 흐른다. 여기저기 커다란 거울이 서 있다.',
    '깜빡이: 거울이 엄청 많아…. 내가 백 마리가 됐어!',
    '감투: 거울 속 나도 떨고 있어. 거울 속 나도 겁쟁이야.',
    ['flag', 'c5_entry'],
    ['goal', '거울 숲 안쪽(위)으로'],
  ],

  c5_trap: [
    ['flag', 'c5_trapped'],
    ['face', 'jaehee', 'up'],
    '재희: 이 거울은… 다른 거울이랑 달라. 안쪽이 반짝여.',
    '거울 속 재희가 손을 흔든다. 그런데— 재희는 손을 흔들지 않았다.',
    '재희: …어?',
    ['emote', 'jaehee', '!'],
    ['se', 'whoosh'],
    ['flash', '#ffffff', 600],
    ['hide', 'jaehee'],
    ['flag', 'c5_inMirror'],
    '거울이 재희를 빨아들였다!',
    ['emote', 'gamtu', '!'],
    ['se', 'scared'],
    '감투: 재희야!!!',
    '깜빡이: 재희 내놔!',
    ['se', 'thud'],
    ['shake', 3, 400],
    '거울에 부딪힌 깜빡이의 빛이, 불씨처럼 흩어져 안개 속으로 사라졌다.',
    ['hide', 'kkam'],
    ['control', 'gamtu'],
    ['flag', 'solo'],
    ['flag', 'gamtuLeads'],
    ['stopBgm', 1500],
    ['wait', 1200],
    '감투: 재희야…. 재희야!',
    '거울 속 재희가 유리를 두드린다. 하지만 아무 소리도 들리지 않는다.',
    '감투는 그 자리에 주저앉았다.',
    '감투: (재희가 없어.)',
    '감투: (나 혼자야.)',
    ['wait', 1500],
    '감투: (…혼자는 싫어. 제일 싫어. 천둥보다, 어둠보다, 높은 데보다 더.)',
    ['flag', 'c5_shadowE'],
    ['fadeActor', 'shadowE', 0.8, 1200],
    ['se', 'shadow'],
    '???: …그럼 숨으면 되잖아.',
    '그림자 감투: 넌 원래 숨는 고양이잖아. 도깨비감투처럼 사라지는 게 네 특기잖아.',
    '그림자 감투: 그냥 숨어. 그럼 아무도 너한테 기대 안 해. 아무도 실망 안 해.',
    '감투: …….',
    '거울 속 재희가 입 모양으로 무언가를 말했다. — 감. 투. 야.',
    '감투: …재희가 날 부르고 있어.',
    '그림자 감투: 그럼 가 보시든가. 숲 끝의 마지막 거울까지. 혼자서. 갈 수 있으면.',
    ['fadeActor', 'shadowE', 0, 900],
    ['flag', 'c5_shadowE', false],
    ['bgm', 'fog', 1500],
    '(이제부터 감투 혼자 움직입니다. 재희로 바꿀 수 없습니다.)',
    ['goal', '감투 혼자 숲 안쪽(위)으로'],
  ],

  c5_room1In: [
    '거울 벽 건너편에 그림자 감투가 서 있다. 감투가 움직이면, 그림자는 좌우를 거꾸로 따라 움직인다.',
    '그림자 감투: 같이 놀자. 네가 오른쪽 가면 난 왼쪽. 네가 숨으면 나도 숨고.',
    '(감투는 왼쪽 노란 판, 그림자는 오른쪽 노란 판을 동시에 밟으면 길이 열립니다.\n감투가 벽에 막혀도 그림자는 움직입니다. 막히면 왼쪽 아래 거울 조각을 조사하세요.)',
    ['flag', 'c5_room1_in'],
    ['goal', '감투와 그림자가 동시에 노란 판을 밟자'],
  ],
  c5_room2In: ['그림자 감투: 또 왔네. 혼자서. …재미없게.', ['flag', 'c5_room2_in']],
  c5_room3In: ['그림자 감투: 이번엔 어려울걸. 넌 혼자서는 아무것도 못 하니까.', '감투: …….', ['flag', 'c5_room3_in']],
  c5_room1Done: [['se', 'success'], '스르륵— 위쪽 길을 막고 있던 거울문이 녹아내렸다.', '감투: …됐다. 나 혼자 했어.', ['flag', 'c5_room1'], ['goal', '위쪽 길로']],
  c5_room2Done: [['se', 'success'], '스르륵— 거울문이 녹아내렸다.', '감투: (재희라면 "잘했어!" 해 줬을 텐데.)', ['flag', 'c5_room2'], ['goal', '위쪽 길로']],
  c5_room3Done: [
    ['se', 'success'],
    '스르륵— 마지막 거울문이 녹아내렸다.',
    '그림자 감투: …어떻게 했어? 너 혼자서?',
    '감투: 몰라. 그냥… 한 발씩 했어.',
    ['flag', 'c5_room3'],
    ['goal', '숲 끝의 마지막 거울로'],
  ],

  c5_hall: [
    ['flag', 'c5_hall'],
    '안개 가장 깊은 곳. 가장 큰 거울 속에서 재희가 감투를 보고 있다.',
    ['fadeActor', 'shadowH', 0.8, 900],
    '그림자 감투: 다 왔네. 근데 이 거울은 못 깨. 너 혼자서는.',
    '감투: …….',
    '감투: (…맞아. 나 혼자서는 무서워. 다리가 떨려.)',
    ['wait', 900],
    ['se', 'bark'],
    '보리: 월! 월월! 감투야아!',
    ['fadeActor', 'boriH', 1, 500],
    '감투: 보리…?',
    '보리: 깍순이가 너 혼자 거울 숲에 있대서 달려왔어! 나도 혼자 있는 거 싫어. 그래서 그때 다리 위에서 짖었잖아.',
    ['se', 'caw'],
    ['fadeActor', 'kkachiH', 1, 500],
    '깍순이: 깍깍! 소식통이 빠질 수 있나! …사실 무서워서 날개가 엄청 떨려!',
    ['se', 'squeak'],
    ['fadeActor', 'mouseH', 1, 500],
    '찍찍이: 찍! 노, 노크하고 왔어! 똑똑!',
    '감투: …숲에 문이 어디 있어.',
    ['fadeActor', 'owlH', 1, 500],
    '똑딱 선생: 에헴. 겁쟁이 가족 소식은 놓칠 수 없지.',
    ['se', 'sparkle'],
    ['fadeActor', 'kkamH', 1, 500],
    '깜빡이: 감투야! 정신 차려 보니까 숲 입구였어! 그래서 다들 데리고 왔어!',
    '감투: 다들… 무섭지 않아?',
    '보리: 무섭지! 근데 무서운 거랑 도망치는 건 다른 거니까.',
    '깜빡이: 둘이면 반만 무섭고, 여섯이면… 음….',
    '똑딱 선생: 육분의 일일세. 에헴.',
    '그림자 감투: …….',
    '그림자 감투: 그래도 마지막 거울 앞에는 혼자 서야 해. 그건 아무도 대신 못 해.',
    '보리: 우린 여기서 응원할게! 크게!',
    '감투: …크게는 하지 마.',
    ['goal', '마지막 거울 앞에 서자 (위쪽 큰 거울을 조사)'],
  ],

  c5_climax: [
    ['if', { flag: 'c5_free' }, ['산산조각 난 거울이다.'], [
      '감투가 마지막 거울 앞에 섰다. 거울 속에는 재희, 그리고 그 옆에 겁에 질린 작은 고양이가 비쳤다.',
      '그림자 감투: 봐. 저게 너야. 겁쟁이. 숨는 고양이. 넌 혼자서는 아무것도 못 해.',
      '감투: …응. 맞아.',
      '감투: 나 혼자서는 무서워. 지금도 무서워. 다리가 젤리 같아.',
      '감투: 그래도… 지금은 숨지 않을 거야.',
      '감투: 재희가 저 안에서 기다리니까. 그리고— 다들 뒤에 있으니까.',
      ['choice', ['숨는다', '거울에 앞발을 댄다'], [
        [
          '감투가 몸을 동그랗게 웅크렸다.',
          '…그 순간, 뒤에서 보리가, 깜빡이가, 모두가 숨죽여 지켜보는 게 느껴졌다.',
          '감투: (…아니야. 이번엔 안 숨어.)',
        ],
        ['감투: (재희야. 지금 갈게.)'],
      ]],
      ['minigame', 'heartbeat', {
        title: '마지막 거울 앞에서, 감투의 심장이 쿵쾅거린다…!',
        hits: 5,
        speed: 1.9,
        zone: 0.12,
        lines: ['재희…', '한 발…', '두 발…', '안 숨어…!', '재희야!', '지금!'],
        missLines: ['…혼자야. 무서워….', '아니야, 다들 있어. 다시…!', '한 번만 더…!'],
        doneLine: '……!',
      }],
      ['bgm', 'brave', 0],
      ['se', 'bell'],
      ['flash', '#ffffff', 600],
      '감투가 거울에 앞발을 댔다.',
      ['se', 'thud'],
      ['shake', 5, 700],
      ['flag', 'c5_free'],
      '쨍그랑—!',
      '거울이 산산조각 나며, 재희가 쏟아지듯 빠져나왔다!',
      ['flag', 'solo', false],
      ['flag', 'gamtuLeads', false],
      ['setPos', 'jaehee', 7, 3, 'right'],
      ['show', 'jaehee'],
      ['face', 'gamtu', 'left'],
      ['emote', 'jaehee', '♥'],
      '재희: 감투야!!',
      '재희가 감투를 와락 끌어안았다.',
      '재희: 다 봤어. 거울 안에서 다 봤어. 너 혼자서 여기까지 왔어.',
      '감투: …혼자 아니었어. 다들 왔어.',
      '감투: …그리고 재희가 부르는 것도 들렸어.',
      ['courage', 1],
      ['wait', 600],
      '그림자 감투가 작게 웅크렸다.',
      '그림자 감투: …나는? 나는 이제 어떻게 돼?',
      '그림자 감투: 겁쟁이인 나는… 이제 버려지는 거야?',
      '감투: …….',
      '감투: 아니. 같이 가자. 너도 나니까.',
      '그림자 감투: ……응.',
      ['fadeActor', 'shadowH', 0, 1200],
      ['flag', 'c5_shadowGone'],
      '그림자 감투는 감투의 그림자 속으로 조용히 스며들었다.',
      ['wait', 600],
      ['se', 'sparkle'],
      '거울 조각들 사이에서 작은 빛 조각이 떠올랐다.',
      ['item', 'fragment5'],
      ['flag', 'c5_frag'],
      ['fadeOut', 1400, '#ffffff'],
      ['call', 'c5_memory'],
    ]],
  ],

  c5_memory: [
    ['flag', 'c5_mem'],
    ['control', 'jaehee'],
    ['hideParty', true],
    ['tone', 'memory', 0],
    ['gray', 0, 0],
    ['warp', 'house', 9, 6, 'down', { fade: false }],
    ['weather', 'dust'],
    ['bgm', 'memory', 0],
    ['fadeIn', 1800],
    '— 할머니의 기억 —',
    '…어느 해 봄. 엄마가 도시로 떠나던 날.',
    '어른엄마: 엄마, 나 갈게. 명절엔 꼭 올게.',
    '할머니: 그래. 밥 잘 챙겨 묵고. 아프지 말고.',
    '어른엄마: …엄마 혼자 괜찮겠어?',
    '할머니: 괜찮다, 괜찮아. 엄마는 씩씩하다. 얼른 가라, 차 놓친다.',
    ['move', 'memMom5', 'DDD', { speed: 2 }],
    ['se', 'door'],
    ['hide', 'memMom5', { fade: 500 }],
    '대문이 닫혔다.',
    ['wait', 1200],
    ['move', 'memGm5', 'DD', { speed: 1.2 }],
    '그날 밤. 할머니는 텅 빈 마루 끝에 혼자 앉아 달을 올려다보았다.',
    '할머니: 괜찮다…. 괜찮다. 혼자도 괜찮다.',
    ['wait', 2000],
    '할머니: …….',
    ['wait', 1500],
    '할머니: …아니다.',
    '할머니: 사실은… 하나도 안 괜찮다.',
    ['wait', 2200],
    ['flag', 'c5_memdone'],
    ['fadeOut', 1600, '#ffffff'],
    ['weather', null],
    ['tone', 'night', 0],
    ['gray', 0.05, 0],
    ['hideParty', false],
    ['show', 'kkam'],
    ['warp', 'house', 8, 9, 'down', { fade: false }],
    ['bgm', 'night', 0],
    ['fadeIn', 1600],
    '재희: …할머니도, 혼자 남는 게 무서웠구나.',
    '감투: …나랑 똑같다. 아까 거울 숲에서 나도 그랬어.',
    '그날 밤. 마루 끝에 할머니가 혼자 달을 보고 있었다.',
    '재희: 할머니.',
    '할머니 : 아이고, 안 자고 뭐 하노.',
    '재희: 할머니 혼자 있지 마. 오늘은 같이 달 보자.',
    '할머니 : …허허. 웬일이고.',
    ['wait', 1000],
    '할머니 : …그래. 같이 보자. 혼자 보는 것보다 훨씬 곱네.',
    '감투: (재희야. 이제 할머니도 혼자 두지 말자.)',
    '재희: (응. 약속.)',
    ['se', 'purr'],
    '감투가 할머니 무릎에 올라가 몸을 동그랗게 말았다.',
    ['wait', 1000],
    ['stopBgm', 2000],
    ['fadeOut', 2200],
    ['bgm', 'clear', 0],
    ['chapterCard', '5장 끝', '거울 숲', { hold: 3800 }],
    ['caption', ['감투의 용기가 또 한 칸 자랐다.', '6장 「잊혀진 것들의 섬」', '— 다음 이야기에서 계속됩니다 —'], { hold: 2600 }],
    ['flag', 'c5_end'],
    ['chapter', 6, '6장 · 잊혀진 것들의 섬 (준비 중)'],
    ['tone', '', 0],
    ['warp', 'village', 7, 15, 'up', { fade: false }],
    ['goal', '6장은 다음 이야기에서 계속됩니다. 마을을 자유롭게 둘러보세요.'],
    ['autosave'],
    ['fadeIn', 1200],
    '(5장을 클리어했습니다! 진행 상황이 자동 저장되었습니다.)',
    ['choice', ['마을을 더 둘러본다', '타이틀로 돌아간다'], [[], [['title']]]],
  ],
});

/* ---------- 마을 ---------- */
GameData.addEvents('village', [
  {
    id: 'gm5', x: 6, y: 13,
    pages: [
      { cond: { chapterMin: 5 }, sprite: 'grandmaPin', dir: 'right', script: ['할머니 : 어젯밤 꿈에 마루가 텅 비어 있더라…. 허허, 꿈은 꿈이지.'] },
      { cond: { flag: 'c5_end' }, sprite: 'grandmaPin', dir: 'right', script: ['할머니 : 어젯밤 달 참 곱더라. 우리 셋이 보니까 더 곱더라.'] },
    ],
  },
  {
    id: 'zelkova5', x: 16, y: 11, area: [2, 2], offset: [8, 16],
    pages: [
      { cond: { chapterMin: 5 }, sprite: 'zelkova', noTurn: true, script: 'c5_tree' },
      { cond: { flag: 'c5_end' }, sprite: 'zelkova', noTurn: true, script: ['느티나무: 혼자 걸었구나. 그리고 혼자가 아니라는 걸 알았구나.', '느티나무: 마지막 조각은 회색 손님 한가운데, 잊혀진 것들의 섬에 있다. 그때는… 네 그림자도 데려가거라.'] },
    ],
  },
  { id: 'ijang5', x: 33, y: 15, pages: [{ cond: { chapterMin: 5 }, sprite: 'ijang', dir: 'down', script: [['if', { flag: 'c5_end' }, ['이장님: 보리 녀석이 어제 어디 갔다 왔는지 온몸에 은가루를 묻혀 왔더라. 허허.'], ['이장님: 요즘은 마을이 다시 환해졌어. 할매도 웃음이 늘었고.']]] }] },
  { id: 'bori5', x: 35, y: 13, pages: [{ cond: { flag: 'c5_end' }, sprite: 'boriCollar', move: { type: 'random', radius: 1, wait: 2 }, script: [['se', 'bark'], '보리: 감투! 거울 깨는 거 봤어! 크게 응원한 거 들었지?', '감투: …크게 하지 말랬잖아. 근데… 들었어. 고마워.'] }] },
  { id: 'minsu5', x: 16, y: 21, pages: [{ cond: { chapterMin: 5 }, sprite: 'minsu', move: { type: 'random', radius: 2, wait: 2.5 }, script: [['if', { flag: 'c5_end' }, ['민수: 누나, 감투 대감님 요즘 좀 멋있어진 것 같아. 걸음걸이가 달라!'], ['민수: 누나, 거울 보면 무서운 얘기 알아? 밤에 거울 보면 거울 속 내가 먼저 웃는대!', '감투: (……그 얘기 하지 마.)']]] }] },
  { id: 'kkachi5', x: 23, y: 9, pages: [{ cond: { chapterMin: 5 }, sprite: 'magpie', script: [['se', 'caw'], ['if', { flag: 'c5_end' }, ['깍순이: 깍깍! 빅뉴스! 꼬맹이 고양이가 거울을 깼대! 혼자서! 아니, 우리 다 같이!'], ['깍순이: 깍깍! 북쪽 안개 속에 거울 숲이 있대. 나는 거기 무서워서 못 가. …아마도.']]] }] },
]);

GameData.addEvents('shop', [
  { id: 'geumsun5', x: 2, y: 3, pages: [{ cond: { chapterMin: 5 }, sprite: 'geumsun', dir: 'down', script: [['if', { flag: 'c5_end' }, ['금순 아줌마: 할머니가 요즘 가게에 자주 놀러 오셔. 재희 자랑하러. 호호.'], ['금순 아줌마: 어서 와~ 요즘 할머니 얼굴이 참 밝아지셨어.']]] }] },
]);

/* ---------- 거울 숲 입구 ---------- */
GameData.addEvents('mirrorEntry', [
  { id: 'entryIn', x: 0, y: 0, pages: [{ cond: { chapterMin: 5, notFlag: 'c5_entry' }, trigger: 'auto', script: 'c5_entryIn' }] },
  {
    id: 'trapMirror', x: 10, y: 4,
    pages: [
      { cond: { chapterMin: 5 }, sprite: 'bigMirror', noTurn: true, script: ['커다란 거울이다. 안쪽이 이상하게 반짝인다.'] },
      { cond: { flag: 'c5_inMirror' }, sprite: 'bigMirrorJ', noTurn: true, script: ['거울 속에서 재희가 유리를 두드리고 있다. 아무 소리도 들리지 않는다.', '감투: (기다려, 재희야. 꼭 갈게.)'] },
    ],
  },
  { id: 'trapZone', x: 9, y: 5, area: [3, 1], pages: [{ cond: { chapterMin: 5, notFlag: 'c5_trapped' }, trigger: 'touch', script: 'c5_trap' }] },
  { id: 'fogWall', x: 10, y: 1, pages: [{ cond: { chapterMin: 5, notFlag: 'c5_trapped' }, sprite: 'glassGate', noTurn: true, script: ['안개가 거울처럼 굳어 길을 막고 있다.'] }] },
  { id: 'mirrorL', x: 4, y: 4, pages: [{ cond: { chapterMin: 5 }, sprite: 'bigMirror', noTurn: true, script: ['거울 속 재희가 어른처럼 보인다. …엄마를 닮았다.'] }] },
  { id: 'mirrorR', x: 15, y: 4, pages: [{ cond: { chapterMin: 5 }, sprite: 'bigMirror', noTurn: true, script: [['if', { flag: 'c5_trapped' }, ['거울 속 감투가 혼자 서 있다. …이상하게, 아까보다 덜 떨고 있다.'], ['거울 속 감투가 아기 고양이처럼 작게 보인다.']]] }] },
  { id: 'shadowE', x: 12, y: 5, pages: [{ cond: { flag: 'c5_shadowE' }, sprite: 'shadowGamtu', dir: 'left', alpha: 0, noTurn: true, through: true, trigger: 'none' }] },
]);

/* ---------- 거울 방 세 개 ---------- */
{
  const ROOM = (map, n, ax, ay, bx, by) => {
    const flag = 'c5_room' + n;
    GameData.addEvents(map, [
      { id: 'roomIn', x: 0, y: 0, pages: [{ cond: { chapterMin: 5, notFlag: flag + '_in' }, trigger: 'auto', script: 'c5_room' + n + 'In' }] },
      { id: 'twin', x: 12, y: 9, pages: [{ cond: { chapterMin: 5 }, sprite: 'shadowGamtu', dir: 'up', twin: true, alpha: 0.8, noTurn: true, trigger: 'none', script: [] }] },
      { id: 'plateA', x: ax, y: ay, pages: [{ cond: { chapterMin: 5 }, sprite: 'plate', below: true, through: true, trigger: 'none' }] },
      { id: 'plateB', x: bx, y: by, pages: [{ cond: { chapterMin: 5 }, sprite: 'plate', below: true, through: true, trigger: 'none' }] },
      { id: 'gate', x: 4, y: 1, pages: [{ cond: { chapterMin: 5, notFlag: flag }, sprite: 'glassGate', noTurn: true, script: ['거울문이 길을 막고 있다. 노란 판 두 개를 동시에 밟으면 열릴 것 같다.'] }] },
      {
        id: 'check', x: 0, y: 1,
        pages: [{
          cond: [{ chapterMin: 5, notFlag: flag }, (s, G) => {
            const a = G.game.controlled();
            const t = G.game.map.eventById('twin');
            return !!a && !!t && !a.moving && !t.moving && a.x === ax && a.y === ay && t.x === bx && t.y === by;
          }],
          trigger: 'auto', script: 'c5_room' + n + 'Done',
        }],
      },
      {
        id: 'shard', x: 1, y: 9,
        pages: [{
          cond: { chapterMin: 5 },
          script: [['if', { flag: flag }, ['깨진 거울 조각이 반짝인다.'], [
            '깨진 거울 조각이다. 처음 자리로 돌아갈까?',
            ['choice', ['돌아간다', '그만둔다'], [[['warp', map, 4, 9, 'up', { reload: true, cat: true, se: 'whoosh' }]], []]],
          ]]],
        }],
      },
    ]);
  };
  ROOM('mirror1', 1, 2, 3, 12, 3);
  ROOM('mirror2', 2, 6, 3, 11, 5);
  ROOM('mirror3', 3, 2, 2, 9, 5);
}

/* ---------- 마지막 거울 ---------- */
GameData.addEvents('mirrorHall', [
  { id: 'hallIn', x: 0, y: 0, pages: [{ cond: { chapterMin: 5, notFlag: 'c5_hall' }, trigger: 'auto', script: 'c5_hall' }] },
  {
    id: 'finalMirror', x: 8, y: 2,
    pages: [
      { cond: { chapterMin: 5 }, sprite: 'bigMirrorJ', noTurn: true, script: 'c5_climax' },
      { cond: { flag: 'c5_free' }, sprite: 'bigMirrorBroken', noTurn: true, script: ['산산조각 난 거울이다.'] },
    ],
  },
  { id: 'shadowH', x: 10, y: 3, pages: [{ cond: { chapterMin: 5, notFlag: 'c5_shadowGone' }, sprite: 'shadowGamtu', dir: 'left', alpha: 0, noTurn: true, through: true, trigger: 'none' }] },
  ...[['boriH', 5, 7, 'boriCollar', 'up'], ['kkachiH', 11, 7, 'magpie', 'up'], ['mouseH', 4, 9, 'mouse', 'up'], ['owlH', 12, 9, 'owl', 'up'], ['kkamH', 8, 7, 'firefly', 'up']].map(([id, x, y, sp, d]) => ({
    id, x, y,
    pages: [
      { cond: { flag: 'c5_hall', notFlag: 'c5_free' }, sprite: sp, dir: d, alpha: 0, noTurn: true, through: true, trigger: 'none' },
      { cond: { flag: 'c5_free', notFlag: 'c5_mem' }, sprite: sp, dir: d, noTurn: true, through: true, trigger: 'none' },
    ],
  })),
]);

/* ---------- 회상: 엄마가 떠난 날 ---------- */
GameData.addEvents('house', [
  { id: 'memMom5', x: 8, y: 6, pages: [{ cond: { flag: 'c5_mem', notFlag: 'c5_memdone' }, sprite: 'adultMom', dir: 'down', noTurn: true, through: true, trigger: 'none' }] },
  { id: 'memGm5', x: 9, y: 6, pages: [{ cond: { flag: 'c5_mem', notFlag: 'c5_memdone' }, sprite: 'grandma', dir: 'left', noTurn: true, through: true, trigger: 'none' }] },
  { id: 'gmMoon5', x: 9, y: 9, pages: [{ cond: { flag: 'c5_memdone', notFlag: 'c5_end' }, sprite: 'grandmaPin', dir: 'down', noTurn: true, script: ['할머니 : 같이 보니까 달이 참 곱다.'] }] },
]);
