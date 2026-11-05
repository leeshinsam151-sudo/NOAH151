/*
 * 6장 · 잊혀진 것들의 섬
 * 감투가 넘는 무서운 것: 회색 손님 (= 잊혀질까 봐 무서운 마음들)
 * 성장: 무서운 것을 쫓아내지 않고, 다가가서 안아 준다. 섬 전체를 감투가 앞장서고 그림자 감투가 나란히 걷는다.
 * 흐름: 나룻배(보리가 노 젓기) → 섬: 이름 맞히기 등불 네 개 + 1~4장 능력 → 회색 손님(시안 B)
 *      → 안개 한가운데의 색을 잃은 아기 고양이를 안아 줌 → 기억 조각 ⑥(할머니의 진짜 마음) → 할머니가 모두 기억해 냄
 */
GameData.defineChapter({ num: 6, id: 'chapter6', title: '6장 · 잊혀진 것들의 섬', start: 'c6_start' });

GameData.config.party.shadowF = { sprite: 'shadowGamtu', kind: 'npc', speed: 5.4 };
GameData.defineCharacters({
  '회색 손님': { sprite: 'greyGuestBig', color: '#c8c8e0', voice: 0.5 },
  안개: { sprite: 'shadow', color: '#c8c8e0', voice: 0.6 },
  '색을 잃은 아기 고양이': { sprite: 'greyKitten', color: '#c8c8e0', voice: 2.0 },
});
GameData.defineItems({
  fragment6: { name: '기억 조각 · 마지막', desc: '"잊어도… 우리 재희가 알려 준댔다. 그럼 됐다."', icon: 'fragment' },
});

GameData.scripts.talk_gamtu_c05 = GameData.scripts.talk_gamtu;
GameData.defineScripts({
  talk_gamtu: [
    ['if', { chapterMin: 6 }, [
      ['if', { flag: 'c6_core' }, ['감투: 이제 하나도 안 무서워. …아니, 조금 무서워. 그래도 괜찮아.'], ['감투: 회색 손님… 무섭지만, 왠지 불쌍한 것 같아.']],
    ], [['call', 'talk_gamtu_c05']]],
  ],
  talk_shadowF: ['그림자 감투: …나 아직 무서워. 그래도 같이 걸을게.'],

  c6_start: [
    ['chapterCard', '6장', '잊혀진 것들의 섬'],
    ['flag', 'c6_started'],
    ['bgm', 'village', 1500],
    ['fadeIn', 1200],
    '여름 방학이 끝나 가는 아침.',
    ['move', 'player', 'U', { speed: 3 }],
    ['face', 'player', 'left'],
    '할머니 : 재희야. 요새 할미가 꿈을 꾸면, 꼭 안개 낀 섬이 보인다.',
    '할머니 : 거기 뭔가 두고 온 것 같은데… 그게 뭔지 생각이 날 듯 말 듯 하다.',
    '재희: …할머니, 내가 찾아올게. 마지막 하나.',
    '할머니 : 허허. 우리 재희는 맨날 뭘 찾아온다 카네.',
    ['goal', '느티나무 할아버지께 가자'],
    ['autosave'],
  ],

  c6_tree: [
    '느티나무: 마지막 조각이구나.',
    '느티나무: 회색 손님은 개울 끝, 안개 섬에 머물고 있다. 그 한가운데에 마지막 조각이 있다.',
    '느티나무: 감투야. 회색 손님은 너희가 생각하는 괴물이 아닐지도 모른단다.',
    '감투: …괴물이 아니면 뭐예요?',
    '느티나무: 그건 네가 직접 보거라. 그리고… 네 그림자도 데려가거라.',
    '느티나무: 이장이 개울가에 나룻배를 준비해 두었다.',
    ['flag', 'c6_tree'],
    ['goal', '개울가 나룻배로 (다리 오른쪽 물가)'],
  ],

  c6_boat: [
    '이장님: 왔냐. 내 젊을 적 타던 나룻배여. 아직 물 안 새. …아마도.',
    '감투: (아마도…?)',
    ['se', 'bark'],
    '보리: 노는 내가 저을게! 개헤엄이랑 비슷하겠지?',
    '재희: …보리야, 노 저어 본 적 있어?',
    '보리: 없어! 근데 무서운 거랑 안 해 본 거는 다른 거니까!',
    '감투: 그건 그런 뜻이 아니잖아….',
    ['fadeOut', 800],
    ['se', 'whoosh'],
    '삐걱, 삐걱. 나룻배는 빙글빙글 세 바퀴를 돈 다음에야 앞으로 나아가기 시작했다.',
    '보리: 봐! 간다! 간다!',
    '감투: 어지러워….',
    ['wait', 600],
    '안개가 점점 짙어졌다. 이윽고 배가 모래에 닿았다.',
    ['flag', 'c6_island'],
    ['warp', 'island', 14, 24, 'up', { fade: false }],
    ['fadeIn', 1000],
    '보리: 나는 배를 지킬게! 돌아올 때 꼭 이 자리야!',
    '안개 속에 무언가가 둥둥 떠다닌다. 망가진 장난감, 부치지 못한 편지, 아무도 부르지 않는 이름들….',
    '깜빡이: 여기… 다 잊혀진 것들이야.',
    ['wait', 600],
    ['se', 'shadow'],
    '감투의 그림자가 스르르 일어섰다.',
    ['js', (s, G) => {
      const c = G.game.actors.gamtu;
      G.game.partyOp('add', 'shadowF', c.x - 1, c.y, 'up');
      G.game.actors.shadowF.alpha = 0.8;
    }],
    '그림자 감투: …이번엔 나도 같이 갈게. 무섭지만.',
    '감투: …응. 같이 가자.',
    '감투: 재희야. 여기선 내가 앞장설게. 이 섬은… 왠지 내가 알 것 같아.',
    '재희: …응. 감투 꼬리 보고 갈게.',
    ['control', 'gamtu'],
    ['flag', 'gamtuLeads'],
    ['flag', 'storm'],
    ['follow', 'jaehee', true],
    ['follow', 'kkam', true],
    ['follow', 'shadowF', true],
    ['gather'],
    '(섬에서는 감투가 앞장섭니다. 지금까지 배운 능력을 모두 쓸 수 있어요.)',
    ['goal', '안개 덩어리에게 말을 걸어 보자'],
  ],

  /* 이름 맞히기: 틀리면 힌트를 듣고 다시 고를 수 있다 */
  c6_q1: [
    ['if', { flag: 'c6_q1' }, [], [
      '안개: …내 이름, 기억해?',
      '안개: (빨간 목걸이를 하고, 다리 위에서 마을을 지키던 개….)',
      ['choice', ['누렁이', '보리', '똘이'], [
        ['안개: …아니야. 그건 다들 잘못 부르던 이름이야….', '감투: (이장님이 이름표를 보고 다시 불러 줬던 이름….)', ['call', 'c6_q1']],
        [['call', 'c6_qOk'], ['flag', 'c6_q1'], ['goal', '물 건너 다음 안개에게 (징검돌)']],
        ['안개: …아니야….', '감투: (찍찍이가 숨겨 놨던 목걸이 이름표에 적혀 있었지….)', ['call', 'c6_q1']],
      ]],
    ]],
  ],
  c6_q2: [
    ['if', { flag: 'c6_q2' }, [], [
      '안개: …내 이름, 기억해?',
      '안개: (꺼진불이라고 놀림받던, 아주 작은 빛….)',
      ['choice', ['꺼진불', '반딧이', '깜빡이'], [
        ['안개: …그건 놀리던 이름이야. 진짜 이름이 아니야….', ['call', 'c6_q2']],
        ['안개: …아니야….', '깜빡이: (속닥) 감투야, 나잖아, 나!', ['call', 'c6_q2']],
        [['call', 'c6_qOk'], '깜빡이: 헤헤, 내 이름이다!', ['flag', 'c6_q2'], ['goal', '숨은 돌길 너머 다음 안개에게']],
      ]],
    ]],
  ],
  c6_q3: [
    ['if', { flag: 'c6_q3' }, [], [
      '안개: …내 이름, 기억해?',
      '안개: (시계탑에서 육십 년 동안 시간을 외우던, 안경 쓴…. 에헴.)',
      ['choice', ['똑딱 선생', '부엉 선생', '째깍 영감'], [
        [['call', 'c6_qOk'], ['flag', 'c6_q3'], ['goal', '들보를 건너 마지막 안개에게']],
        ['안개: …아니야. 에헴.', '감투: (에헴… 똑딱똑딱….)', ['call', 'c6_q3']],
        ['안개: …아니야. 영감이라니. 에헴.', ['call', 'c6_q3']],
      ]],
    ]],
  ],
  c6_q4: [
    ['if', { flag: 'c6_q4' }, [], [
      '안개: …우리 이름, 기억해?',
      '안개: (정전된 겨울밤, 촛불 아래에서 울던… 누나의 두 동생….)',
      ['choice', ['순철이와 순자', '순길이와 순남이', '민수와 민호'], [
        ['안개: …아니야….', '재희: (할머니가 반딧불 뜬 밤에 말해 줬어. "순길이, 순남이"….)', ['call', 'c6_q4']],
        [['call', 'c6_qOk'], '재희: 할머니 동생들이야. 할머니가 이번 추석에 꼭 부른댔어.', ['flag', 'c6_q4'], ['goal', '섬 한가운데로']],
        ['안개: …아니야. 그건 다른 아이들 이름이야….', ['call', 'c6_q4']],
      ]],
    ]],
  ],
  c6_qOk: [
    ['se', 'bell'],
    ['flash', '#fff6d0', 400],
    '안개: …맞아. 그게 내 이름이었어.',
    '안개: 불러 줘서… 고마워.',
    ['hide', 'self', { fade: 700 }],
    '안개가 따뜻한 빛으로 흩어지고, 옆의 등불에 불이 켜졌다.',
  ],

  c6_core: [
    ['flag', 'c6_core'],
    ['follow', 'jaehee', false],
    ['follow', 'kkam', false],
    ['follow', 'shadowF', false],
    ['stopBgm', 1500],
    ['flag', 'storm', false],
    ['fadeOut', 300],
    ['setPos', 'gamtu', 14, 5, 'up'],
    ['setPos', 'jaehee', 13, 5, 'up'],
    ['setPos', 'kkam', 12, 5, 'up'],
    ['setPos', 'shadowF', 15, 5, 'up'],
    ['fadeIn', 300],
    '섬 한가운데. 커다란 회색 망토 같은 안개가 웅크리고 있다.',
    ['fadeActor', 'guest', 1, 1500],
    ['se', 'shadow'],
    '회색 손님: 잊지 마… 잊지 마….',
    '회색 손님: 잊혀지기 싫어…. 아무도 내 이름을 안 불러 줘….',
    '망토 자락 안에서 낡은 공, 은비녀, 몽당 촛불, 부치지 못한 편지가 비쳤다.',
    '회색 손님: …언젠가는 우리 재희 얼굴도 잊어버리면 우짜노….',
    ['emote', 'jaehee', '!'],
    '재희: …할머니 목소리야.',
    '깜빡이: 회색 손님은… 기억을 훔치는 괴물이 아니었어.',
    '깜빡이: 잊혀질까 봐 무서운 마음들이 모여서… 잊히기 전에 먼저 꼭 붙잡으려던 거야.',
    ['wait', 900],
    '그때— 안개 한가운데에서, 작은 울음소리가 들렸다.',
    ['fadeActor', 'greyKit', 1, 1200],
    '색을 잃은 아기 고양이: 냐… 냐아…. {(추워… 무서워… 아무도 날 기억 안 해….)}',
    ['emote', 'gamtu', '!'],
    '감투: …저건.',
    '그림자 감투: …우리야. 폭풍우 치던 밤, 정자 밑에서 혼자 떨던 우리.',
    '그림자 감투: 할머니랑 재희가 찾아와 주기 전까지… 우리는 잊혀질까 봐, 그게 제일 무서웠어.',
    ['wait', 900],
    '감투: …내가 갈게.',
    '재희: 감투야…!',
    '감투: 이번엔 아무도 같이 못 가. 저 애는… 나만 안아 줄 수 있어.',
    ['dark', 0.97],
    '감투가 혼자 안개 속으로 걸어 들어갔다. 차갑고, 깜깜하고, 아무 소리도 들리지 않았다.',
    ['move', 'gamtu', 'U', { speed: 1 }],
    '감투: (깜깜해. 혼자야. 아래가 안 보여. 쿵쿵 천둥 같은 소리도 나.)',
    '감투: (지금까지 무서웠던 게… 전부 한꺼번에 와.)',
    ['minigame', 'heartbeat', {
      title: '안개 한가운데, 감투의 심장이 쿵쾅거린다…!',
      hits: 6,
      speed: 2.0,
      zone: 0.11,
      lines: ['개도 무서웠고…', '어둠도 무서웠고…', '높은 데도, 천둥도…', '혼자 남는 것도…', '그래도…!', '저 애한테 가야 해!', '……!'],
      missLines: ['…춥고 깜깜해….', '아니야, 재희가 기다려. 다시…!', '한 번만 더…!'],
      doneLine: '……!',
    }],
    ['dark', 0.5],
    ['bgm', 'memory', 0],
    '감투는 안개 한가운데에 도착했다. 색을 잃은 아기 고양이가 동그랗게 몸을 말고 떨고 있었다.',
    '감투: …안녕.',
    '색을 잃은 아기 고양이: 냐…? {(…누구야?)}',
    '감투: 나는 감투야. …너도 감투고.',
    '감투가 아기 고양이를 꼭 안아 주었다.',
    ['se', 'purr'],
    '감투: 괜찮아. 무서운 건 창피한 게 아니래. 할머니가 그랬어.',
    '감투: 넌 이제 혼자가 아니야. 재희도 있고, 할머니도 있고, 보리도, 깜빡이도… 다 있어.',
    '감투: 그리고— 내가 기억할게. 너를. 그날 밤을.',
    ['wait', 1200],
    ['se', 'bell'],
    ['flash', '#ffe8b0', 900],
    ['sprite', 'greyKit', 'kittenB'],
    '아기 고양이의 털에 따뜻한 치즈색이 번져 갔다.',
    '색을 잃은 아기 고양이: …냐아. {(…따뜻해.)}',
    ['fadeActor', 'greyKit', 0, 1200],
    ['js', (s, G) => {
      const sh = G.game.actors.shadowF;
      if (sh) sh.fadeTo(0, 1200);
    }],
    '그림자 감투: …이제 무섭지 않아. 아니, 조금 무섭지만… 괜찮아.',
    '아기 고양이와 그림자 감투가 반짝이며 감투 안으로 스며들었다.',
    ['party', 'remove', 'shadowF'],
    ['courage', 1],
    ['wait', 600],
    '회색 손님: …아….',
    '회색 손님: 기억해 주는구나…. 잊혀지지… 않는구나….',
    ['fadeActor', 'guest', 0, 2500],
    ['weather', 'fireflies'],
    '회색 손님은 수천 개의 작은 빛으로 흩어졌다. 빛들은 반딧불처럼 날아올라, 저마다 마을 쪽으로 흘러갔다.',
    '깜빡이: 잊혀진 것들이… 다 집으로 돌아가고 있어.',
    ['wait', 900],
    ['se', 'sparkle'],
    '마지막으로 남은 빛 하나가 감투 앞에 내려앉았다.',
    ['item', 'fragment6'],
    ['flag', 'c6_frag'],
    ['fadeOut', 1600, '#ffffff'],
    ['call', 'c6_memory'],
  ],

  c6_memory: [
    ['flag', 'c6_mem'],
    ['flag', 'gamtuLeads', false],
    ['control', 'jaehee'],
    ['hideParty', true],
    ['dark', null],
    ['weather', null],
    ['tone', 'memory', 0],
    ['gray', 0, 0],
    ['warp', 'house', 9, 6, 'down', { fade: false }],
    ['bgm', 'memory', 0],
    ['fadeIn', 1800],
    '— 할머니의 기억 —',
    '…올여름, 재희가 처음 온 날 저녁.',
    '할머니: 이러다가 언젠가는… 우리 재희 얼굴도 잊어버리면 우짜노.',
    '재희: 그런 말 하지 마.',
    '재희: 할머니가 잊어버리면, 내가 다시 알려 줄게. 매일매일 얘기해 줄게.',
    '할머니: …그래. 고맙다, 우리 강아지.',
    ['move', 'memJ6', 'DDDD', { speed: 2 }],
    ['hide', 'memJ6', { fade: 400 }],
    '재희가 감투를 안고 마루로 나간 뒤, 할머니는 혼자 상을 치우다 손을 멈췄다.',
    ['wait', 1200],
    '할머니: …잊어도.',
    '할머니: 잊어도… 우리 재희가 알려 준댔다.',
    ['wait', 1000],
    '할머니: …그럼 됐다.',
    '할머니는 혼자, 오래오래 웃었다.',
    ['wait', 2000],
    ['flag', 'c6_memdone'],
    ['fadeOut', 1800, '#ffffff'],
    ['tone', '', 0],
    ['gray', 0, 0],
    ['hideParty', false],
    ['flag', 'c6_back'],
    ['warp', 'village', 7, 14, 'up', { fade: false }],
    ['bgm', 'title', 0],
    ['fadeIn', 1800],
    '마을로 돌아오자, 모든 것이 처음 왔던 날처럼 선명한 색을 되찾아 있었다.',
    ['move', 'player', 'U', { speed: 3 }],
    ['face', 'player', 'left'],
    '할머니 : …재희야.',
    '할머니 : 할미가 다 생각났다. 니 첫돌 때 일도, 니 엄마 학교 데리러 가던 일도, 순길이 순남이도… 감투 대감 처음 데려온 날도.',
    '할머니 : 니가… 다 찾아왔구나.',
    ['emote', 'jaehee', '♥'],
    '재희: …응. 감투랑 같이.',
    '할머니 : 감투 대감. 고맙다. 정말로 고맙다.',
    ['se', 'purr'],
    '감투: (…헤헤.)',
    ['wait', 900],
    ['stopBgm', 2000],
    ['fadeOut', 2200],
    ['bgm', 'clear', 0],
    ['chapterCard', '6장 끝', '잊혀진 것들의 섬', { hold: 3800 }],
    ['caption', ['감투의 용기가 또 한 칸 자랐다.', '이제, 마지막 이야기.'], { hold: 2200 }],
    ['flag', 'c6_end'],
    ['chapter', 7, '7장 · 다시, 달무리'],
    ['warp', 'village', 7, 15, 'up', { fade: false }],
    ['goal', ''],
    ['autosave'],
    ['call', 'c7_start'],
  ],
});

/* ---------- 마을 ---------- */
GameData.addEvents('village', [
  {
    id: 'gm6', x: 6, y: 13,
    pages: [
      { cond: { chapterMin: 6, notFlag: 'c7_started' }, sprite: 'grandmaPin', dir: 'right', script: ['할머니 : 안개 낀 섬… 거기 뭘 두고 왔을꼬.'] },
      { cond: { flag: 'c6_back', notFlag: 'c7_started' }, sprite: 'grandmaPin', dir: 'right', script: ['할머니 : 다 생각났다. 하나도 빠짐없이. …우리 재희 덕분이다.'] },
    ],
  },
  {
    id: 'zelkova6', x: 16, y: 11, area: [2, 2], offset: [8, 16],
    pages: [
      { cond: { chapterMin: 6, notFlag: 'c7_started' }, sprite: 'zelkova', noTurn: true, script: 'c6_tree' },
      { cond: { chapterMin: 6, flag: 'c6_tree', notFlag: 'c7_started' }, sprite: 'zelkova', noTurn: true, script: ['느티나무: 나룻배는 다리 오른쪽 개울가에 있단다.'] },
      { cond: { flag: 'c6_back', notFlag: 'c7_started' }, sprite: 'zelkova', noTurn: true, script: ['느티나무: 별방울 소리가… 오백 년 동안 들은 소리 중에 가장 맑구나.'] },
    ],
  },
  { id: 'ijangBoat', x: 25, y: 7, pages: [{ cond: { chapterMin: 6, flag: 'c6_tree', notFlag: 'c6_back' }, sprite: 'ijang', dir: 'up', script: 'c6_boat' }] },
  { id: 'boatV', x: 25, y: 6, pages: [{ cond: { chapterMin: 6, notFlag: 'c6_back' }, sprite: 'boat', noTurn: true, through: true, trigger: 'none', offset: [8, 0] }] },
  { id: 'ijang6', x: 33, y: 15, pages: [{ cond: { chapterMin: 6, notFlag: ['c6_tree', 'c7_started'] }, sprite: 'ijang', dir: 'down', script: ['이장님: 개울가에 내 옛날 나룻배를 꺼내 놨다. 느티나무가 그러라 하더라. …나무가 말을 하더라니께.'] }, { cond: { flag: 'c6_back', notFlag: 'c7_started' }, sprite: 'ijang', dir: 'down', script: ['이장님: 나룻배 돌아왔네! 보리 녀석이 저었다며? 세 바퀴 돌았다며? 크하하!'] }] },
  { id: 'bori6', x: 35, y: 13, pages: [{ cond: { flag: 'c6_back', notFlag: 'c7_started' }, sprite: 'boriCollar', move: { type: 'random', radius: 1, wait: 2 }, script: [['se', 'bark'], '보리: 나 노 젓기 천재인 것 같아! 다음엔 다섯 바퀴만 돌 거야!'] }] },
  { id: 'minsu6', x: 16, y: 21, pages: [{ cond: { chapterMin: 6, notFlag: 'c7_started' }, sprite: 'minsu', move: { type: 'random', radius: 2, wait: 2.5 }, script: [['if', { flag: 'c6_back' }, ['민수: 누나! 어젯밤에 반딧불 같은 게 집집마다 들어갔어! 엄마가 잃어버린 반지 찾았대!'], ['민수: 누나, 방학 끝나면 가? …가지 마. 감투 대감님이랑 더 놀고 싶어.']]] }] },
  { id: 'kkachi6', x: 23, y: 9, pages: [{ cond: { chapterMin: 6, notFlag: 'c7_started' }, sprite: 'magpie', script: [['se', 'caw'], ['if', { flag: 'c6_back' }, ['깍순이: 깍깍! 오늘의 빅뉴스! 마을 사람들이 잃어버린 물건을 몽땅 찾았대! 무슨 일이야, 이게!'], ['깍순이: 깍깍! 개울 끝 안개 섬엔 잊혀진 것들이 산대. 나는 무서워서… 아니, 바빠서 못 가!']]] }] },
]);

GameData.addEvents('shop', [
  { id: 'geumsun6', x: 2, y: 3, pages: [{ cond: { chapterMin: 6, notFlag: 'c7_started' }, sprite: 'geumsun', dir: 'down', script: [['if', { flag: 'c6_back' }, ['금순 아줌마: 어머, 오늘 아침에 가게 구석에서 우리 엄마가 쓰던 주판이 나왔어! 몇십 년 만이야!'], ['금순 아줌마: 방학 끝나 가지? 서운해서 어떡해.']]] }] },
]);

/* ---------- 잊혀진 것들의 섬 ---------- */
{
  const WISP = (id, x, y, script, flag, area) => [
    { id, x, y, pages: [{ cond: { chapterMin: 6, notFlag: flag }, sprite: 'shadow', dir: 'down', noTurn: true, light: 18, script }] },
    ...(area ? [{ id: id + 'Fog', x: area[0], y: area[1], area: [area[2], 1], pages: [{ cond: { chapterMin: 6, notFlag: flag }, through: false, trigger: 'none' }] }] : []),
  ];
  const LANTERN = (id, x, y, flag) => ({
    id, x, y,
    pages: [
      { cond: { chapterMin: 6 }, sprite: 'lantern', noTurn: true, script: ['꺼진 등불이다.'] },
      { cond: { flag }, sprite: 'lanternOn', noTurn: true, light: 48, script: ['등불이 따뜻하게 빛나고 있다.'] },
    ],
  });
  const THING = (id, x, y, sprite, line) => ({ id, x, y, pages: [{ cond: { chapterMin: 6, notFlag: 'c6_core' }, sprite, float: true, alpha: 0.75, noTurn: true, through: true, script: [line] }] });
  GameData.addEvents('island', [
    ...WISP('wisp1', 14, 20, 'c6_q1', 'c6_q1', [8, 20, 13]),
    ...WISP('wisp2', 14, 14, 'c6_q2', 'c6_q2'),
    ...WISP('wisp3', 11, 8, 'c6_q3', 'c6_q3', [10, 8, 2]),
    ...WISP('wisp4', 17, 6, 'c6_q4', 'c6_q4', [17, 6, 2]),
    LANTERN('lamp1', 12, 21, 'c6_q1'),
    LANTERN('lamp2', 16, 15, 'c6_q2'),
    LANTERN('lamp3', 10, 9, 'c6_q3'),
    LANTERN('lamp4', 19, 5, 'c6_q4'),
    THING('t1', 10, 22, 'ball', '빨간 공이 둥둥 떠 있다. …누군가 마루 밑에 잃어버린 공 같다.'),
    THING('t2', 18, 23, 'letter', '부치지 못한 편지다. 겉봉에 "엄마에게"라고 쓰여 있다.'),
    THING('t3', 17, 9, 'candle', '몽당 촛불이 꺼질 듯 말 듯 떠 있다.'),
    THING('t4', 10, 15, 'anchovy', '멸치 간식이 떠 있다. 감투가 침을 꿀꺽 삼켰다.'),
    THING('t5', 9, 3, 'collar', '이름표 없는 목걸이가 떠 있다. 누구 것이었을까.'),
    { id: 'coreZone', x: 8, y: 4, area: [14, 1], pages: [{ cond: { flag: 'c6_q4', notFlag: 'c6_core' }, trigger: 'touch', script: 'c6_core' }] },
    { id: 'guest', x: 14, y: 2, pages: [{ cond: { chapterMin: 6, notFlag: 'c6_frag' }, sprite: 'greyGuestBig', alpha: 0, noTurn: true, through: true, trigger: 'none' }] },
    { id: 'greyKit', x: 14, y: 3, pages: [{ cond: { flag: 'c6_core', notFlag: 'c6_frag' }, sprite: 'greyKitten', alpha: 0, noTurn: true, through: true, trigger: 'none', light: 20 }] },
  ]);
}

/* ---------- 회상: 첫날 저녁의 할머니 ---------- */
GameData.addEvents('house', [
  { id: 'memJ6', x: 8, y: 4, pages: [{ cond: { flag: 'c6_mem', notFlag: 'c6_memdone' }, sprite: 'jaehee', dir: 'right', noTurn: true, through: true, trigger: 'none' }] },
  { id: 'memGm6', x: 10, y: 4, pages: [{ cond: { flag: 'c6_mem', notFlag: 'c6_memdone' }, sprite: 'grandma', dir: 'left', noTurn: true, through: true, trigger: 'none' }] },
]);
