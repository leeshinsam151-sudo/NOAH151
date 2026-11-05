/*
 * 7장 · 다시, 달무리 (엔딩)
 * 감투가 넘는 무서운 것: 이별 — 별방울의 힘이 다해 더는 재희와 말이 통하지 않게 되는 것
 * 성장: 말이 통하지 않아도 마음은 통한다는 걸 받아들인다. (용기 7)
 * 흐름: 할머니의 깜빡임 → 할머니 기억 수첩 만들기(마을을 돌며 8가지 이야기 모으기) → 엄마 아빠 도착
 *      → 느티나무: 방울은 할 일을 다 했다 → 마지막 밤 마루, 방울의 마지막 소리 → 버스 정류장 배웅
 *      → 크레딧 → 겨울 방학, 담장 위 감투와 비닐봉지 → 완결
 */
GameData.defineChapter({ num: 7, id: 'chapter7', title: '7장 · 다시, 달무리', start: 'c7_start' });

GameData.defineSprites({
  dad: { type: 'human', hair: '#2a2a2a', cloth: '#5a7ab8', pants: '#3a3a4a' },
});
GameData.defineCharacters({
  아빠: { sprite: 'dad', color: '#b8d0ff', voice: 0.75 },
  '엄마 ': { display: '엄마', sprite: 'adultMom', color: '#ffd0e0', voice: 1.0 },
});
GameData.defineItems({
  notebook: { name: '할머니 기억 수첩', desc: '재희가 만든 수첩. 할머니가 잊어도 다시 읽을 수 있도록.', icon: 'letter' },
});

/* 기억 수첩에 적히는 이야기 (flag 가 켜진 것만 보인다) */
GameData.config.notebook = [
  { text: '재희는 열한 살. 할머니 손녀.', sticker: 'jaehee' },
  { text: '된장찌개는 멸치 국물로.' },
  { text: '감투 대감은 폭풍우 치던 밤에 우리 집에 왔다.', sticker: 'gamtu' },
  { flag: 'note_ijang', text: '할머니는 마을에서 노래를 제일 잘했다.', sticker: 'ijang' },
  { flag: 'note_geumsun', text: '사탕 외상은 꼭 다음 날 갚는다.', sticker: 'geumsun' },
  { flag: 'note_minsu', text: '"울어도 괜찮다." — 할머니가 해 준 말.', sticker: 'minsu' },
  { flag: 'note_bori', text: '비 오는 날엔 보리네 집 지붕을 덮어 준다.', sticker: 'boriCollar' },
  { flag: 'note_kkachi', text: '아침마다 까치들에게 쌀 한 줌.', sticker: 'magpie' },
  { flag: 'note_mouse', text: '장독대 밑 찍찍이는 모른 척해 준다.', sticker: 'mouse' },
  { flag: 'note_owl', text: '오후 4시 종소리 = 엄마를 데리러 가던 시간.', sticker: 'owl' },
  { flag: 'note_kkam', text: '정전된 밤엔 "달아 달아 밝은 달아".', sticker: 'firefly' },
];

GameData.scripts.talk_gamtu_c06 = GameData.scripts.talk_gamtu;
GameData.scripts.talk_kkam_c06 = GameData.scripts.talk_kkam;
GameData.defineScripts({
  talk_gamtu: [
    ['if', { chapterMin: 7 }, [
      ['if', { flag: 'c7_finale' }, [['se', 'meowSmall'], '감투: 냐아. {(…응. 다 알아.)}'], [
        ['if', { flag: 'c7_tree' }, ['감투: 재희야… 방울 소리가… 냐… 작아졌어.'], ['감투: 수첩 만드는 거야? 나도 도울래. 발도장 찍어 줄까?']],
      ]],
    ], [['call', 'talk_gamtu_c06']]],
  ],
  talk_kkam: [
    ['if', { chapterMin: 7, notFlag: 'note_kkam' }, [
      '깜빡이: 할머니 이야기? 음… 할머니가 동생들한테 불러 준 노래! 달아 달아 밝은 달아!',
      '깜빡이: 나 그 노래 들으면 빛이 더 밝아져. 수첩에 적어 줘!',
      ['call', 'c7_note', { flag: 'note_kkam' }],
      ['flag', 'note_kkam'],
      ['call', 'c7_noteCount'],
    ], [['call', 'talk_kkam_c06']]],
  ],

  c7_note: [['se', 'item'], ['notify', '기억 수첩에 한 줄 적었다!', 'goal']],
  c7_noteCount: [
    ['var', 'notes', '+', 1],
    ['if', { var: ['notes', '>=', 8] }, [['goal', '수첩이 다 채워졌다! 할머니 집 마당으로']], [
      ['js', (s, G) => G.dialog.toast(`기억 수첩 ${s.vars.notes} / 8`)],
    ]],
  ],

  c7_start: [
    ['chapterCard', '7장', '다시, 달무리'],
    ['flag', 'c7_started'],
    ['var', 'notes', '=', 0],
    ['bgm', 'village', 1500],
    ['fadeIn', 1200],
    '여름 방학 마지막 주. 마을은 처음 왔던 날처럼 반짝였다.',
    ['move', 'player', 'U', { speed: 3 }],
    ['face', 'player', 'left'],
    '할머니 : 재희야, 오늘이… 무슨 요일이고?',
    '재희: 목요일이야, 할머니.',
    '할머니 : 아이고, 또 깜빡했네. 회색 안개도 다 걷혔다는데… 할미 머리는 원래 이렇다. 허허.',
    ['wait', 900],
    '재희: (…회색 손님이 사라져도, 할머니는 나이가 드셔서 앞으로도 조금씩 깜빡하실 거야.)',
    '재희: (그럼… 약속대로 내가 기억해 줘야지.)',
    ['wait', 500],
    '재희: 할머니! 나 수첩 만들 거야. [할머니 기억 수첩]!',
    '할머니 : 기억 수첩?',
    '재희: 할머니가 잊어버려도, 펼치면 다 생각나게. 마을 사람들한테 할머니 이야기 모아 올게!',
    '할머니 : …허허. 우리 재희가 할미 책을 써 주는 기가.',
    ['item', 'notebook'],
    '감투: 나도 도울래. 친구들한테 물어보면 되지?',
    ['goal', '마을을 돌며 할머니 이야기를 모으자 (0 / 8)'],
    '(이장님, 금순 아줌마, 민수, 보리, 깍순이, 찍찍이, 똑딱 선생, 깜빡이에게 말을 걸어 보세요.)',
    ['autosave'],
  ],

  c7_parents: [
    ['flag', 'c7_parents'],
    ['fadeOut', 600],
    ['setPos', 'jaehee', 7, 15, 'down'],
    ['gather'],
    ['flag', 'c7_parentsArrive'],
    ['fadeIn', 600],
    '그때, 마을 아래쪽 길에서 익숙한 목소리가 들렸다.',
    '엄마 : 재희야—!',
    ['move', 'momV', 'UU', { speed: 2.5 }],
    ['move', 'dadV', 'UU', { speed: 2.5 }],
    ['emote', 'jaehee', '!'],
    '재희: …엄마? 아빠!!',
    ['bgm', 'house', 1000],
    '재희는 달려가 엄마 품에 안겼다.',
    '아빠: 많이 컸네, 우리 딸. 감투도 안녕?',
    '감투: (아빠다. 아빠는 맨날 나보고 "뚱땡이"래.)',
    '아빠: 어이, 뚱땡이!',
    '감투: (거봐.)',
    ['wait', 600],
    '엄마 : …엄마.',
    ['face', 'player', 'up'],
    '할머니 : 왔나. 먼 길 오느라 욕봤다.',
    '엄마 : 엄마, 혼자 있게 해서 미안해. 연락도 자주 못 하고.',
    '할머니 : 혼자 아니었다. 재희랑 감투 대감이 있었다.',
    '할머니 : 그라고… 이제는 이것도 있고.',
    '재희가 기억 수첩을 엄마에게 건넸다.',
    ['minigame', 'notebook', { foot: '엄마가 한 장 한 장 천천히 넘겨 보았다.' }],
    '엄마 : "오후 4시 종소리 = 엄마를 데리러 가던 시간"….',
    '엄마 : …엄마, 이거 기억해?',
    '할머니 : 그럼. 니가 맨날 탑 위에서 손 흔들었제. 겁쟁이가 높은 데 올라가서.',
    ['emote', 'momV', '💧'],
    '엄마 : …응.',
    '엄마는 한참 동안 수첩을 품에 안고 있었다.',
    ['wait', 800],
    ['goal', '느티나무 할아버지께 인사드리자'],
  ],

  c7_tree: [
    ['flag', 'c7_tree'],
    ['se', 'bell'],
    '딸랑…. 별방울 소리가 어쩐지 아주 작게 들렸다.',
    '감투: 재희야, 요즘 방울 소리가 작아진 것 같지 않… 냐…?',
    ['emote', 'gamtu', '?'],
    '감투: …냐? 방금 내 말… 냐아… 끊겼어?',
    '느티나무: 방울은 할 일을 다 했단다. 기억이 모두 돌아왔으니, 이제 쉴 때가 된 게지.',
    '재희: 그럼… 이제 감투랑 얘기 못 해요?',
    '느티나무: 오늘 밤, 달무리가 뜨면… 방울은 마지막으로 한 번 울릴 게다.',
    ['wait', 900],
    '감투: …….',
    '감투: 재희야. 나 무서워.',
    '감투: 말을 못 하게 되면… 재희가 내 마음을 모를까 봐.',
    '재희: …….',
    '재희: 감투야. 너 말 못 할 때도, 나 다 알았어.',
    '재희: …아마 반쯤은.',
    '감투: 반쯤…?',
    '느티나무: 허허. 나머지 반은, 같이 지내다 보면 알게 되는 게다. 오백 년 지켜본 내가 장담하마.',
    ['goal', '밤이 되면 할머니 집 마루로'],
  ],

  c7_finale: [
    ['flag', 'c7_finale'],
    ['fadeOut', 800],
    ['tone', 'night', 0],
    ['setPos', 'jaehee', 8, 9, 'down'],
    ['setPos', 'gamtu', 9, 9, 'down'],
    ['setPos', 'kkam', 9, 8, 'down'],
    ['bgm', 'night', 0],
    ['fadeIn', 1500],
    '그날 밤. 모두 함께 마루 끝에 나란히 앉았다.',
    '할머니, 엄마, 아빠, 재희, 그리고 감투.',
    '마당 너머로 둥근 달이 떠올랐다. 달 둘레로 무지갯빛 테두리— 달무리가 졌다.',
    '재희: …처음 온 날 밤에도 달무리가 졌었어.',
    '할머니 : 그랬제. 그날 니가 그랬다. 할미가 잊어버리면 다시 알려 준다고.',
    '할머니 : …진짜로 알려 줬네.',
    ['wait', 1200],
    ['se', 'bell'],
    ['flash', '#fff6d0', 900],
    '딸랑— 별방울이 마지막으로, 아주 맑게 울렸다.',
    ['stopBgm', 1500],
    ['wait', 1000],
    '감투: …재희야.',
    '감투: 고마워. 그날 밤 찾아와 줘서. 이번 여름 내내, 같이 가 줘서.',
    '감투: 나, 이제 안 무서워.',
    ['wait', 900],
    '감투: …아니, 사실 조금 무서워.',
    '감투: 그래도 갈 수 있어. 어디든. 너랑 같이라면.',
    ['wait', 1200],
    '방울 소리가 잦아들었다.',
    ['wait', 1800],
    ['se', 'meow'],
    '감투: 냐아.',
    ['wait', 1500],
    ['bgm', 'title', 2000],
    '재희: …응.',
    '재희: 알아들었어.',
    ['emote', 'jaehee', '♥'],
    ['courage', 1],
    '감투의 용기가 가득 찼다.',
    ['se', 'purr'],
    '감투는 재희 무릎 위로 올라가, 동그랗게 몸을 말았다. 골골골골….',
    '아빠: …얘 원래 이렇게 사람 무릎에 올라오는 애였어?',
    '재희: 응. 원래 이랬어. 몰랐지?',
    ['wait', 1500],
    ['stopBgm', 2000],
    ['fadeOut', 2200],
    ['call', 'c7_farewell'],
  ],

  c7_farewell: [
    ['flag', 'c7_morning'],
    ['tone', '', 0],
    ['flag', 'c7_bye'],
    ['party', 'remove', 'kkam'],
    ['warp', 'busstop', 10, 8, 'up', { fade: false }],
    ['bgm', 'house', 0],
    ['fadeIn', 1500],
    '다음 날 아침. 버스 정류장.',
    '마을 사람들과 친구들이 모두 배웅을 나왔다.',
    '이장님: 겨울 방학에 또 와라. 보리 녀석이 기다릴 거여.',
    ['se', 'bark'],
    '보리: 월! 월월! {(또 와! 무서운 거 있으면 크게 짖어 줄게!)}',
    '민수: 누나! 감투 대감님! 겨울엔 눈싸움하자!',
    ['se', 'caw'],
    '깍순이: 깍깍! {(빅뉴스는 편지로 보내 줄게!)}',
    ['se', 'squeak'],
    '찍찍이: 찍! {(다음엔 노크하고 와!)}',
    '똑딱 선생: 부엉. {(에헴. 4시 종소리, 서울까지 들리게 쳐 주마.)}',
    '깜빡이가 재희 코끝에서 한 번 반짝, 하고 빛났다.',
    '재희: (깜빡이 말은 이제 안 들리지만… "또 와"라는 거 알아.)',
    ['wait', 600],
    '할머니 : 재희야.',
    '할머니가 기억 수첩을 가슴에 꼭 안았다.',
    '할머니 : 이거 매일 읽을게. 잊어버리면 또 읽고, 또 잊어버리면 또 읽고.',
    '재희: 응. 그리고 내가 겨울에 또 와서, 새로 적어 줄게.',
    '할머니 : 오냐. 겨울 방학에 또 오너라. 할미가 된장찌개 끓여 놓고 기다릴게.',
    ['wait', 800],
    '아빠: 자, 감투도 이동장에 들어가야지. …또 한참 걸리겠지?',
    ['move', 'gamtu', 'R', { speed: 2 }],
    ['hide', 'gamtu'],
    ['flag', 'c7_carrier'],
    ['se', 'meowSmall'],
    '감투가 스스로, 이동장 안으로 쏙 들어갔다.',
    '아빠: …어? 감투가 이동장에 스스로 들어가네? 이런 적 한 번도 없었는데.',
    '재희: 감투 이제 겁쟁이 아니야.',
    ['se', 'meowSmall'],
    '이동장 안에서— 냐아. 작지만 또렷한 소리가 났다.',
    '재희: (응. 알아들었어.)',
    ['se', 'bus'],
    ['flag', 'c7_busCome'],
    ['move', 'bus7', 'RRRRRRR', { speed: 4 }],
    '버스가 도착했다.',
    ['wait', 600],
    ['stopBgm', 2500],
    ['fadeOut', 2500],
    ['bgm', 'title', 0],
    ['chapterCard', '감투와 별방울', '— 끝 —', { hold: 4200 }],
    ['caption', ['겁쟁이 고양이 감투', '소녀 재희', '순덕 할머니', '보리 · 깜빡이 · 똑딱 선생 · 깍순이 · 찍찍이', '이장님 · 금순 아줌마 · 민수', '느티나무 할아버지', '그리고 회색 손님'], { hold: 1900, keep: true }],
    ['clearCaption', 800],
    ['caption', ['무서운 건 창피한 게 아니다.', '무서운데도 한 걸음 가 보는 것.', '그게 용기란다.'], { hold: 2600, keep: true }],
    ['clearCaption', 800],
    ['caption', ['플레이해 주셔서 고맙습니다.', '그리고 진짜 감투에게, 사랑을 담아.'], { hold: 3200 }],
    ['call', 'c7_winter'],
  ],

  c7_winter: [
    ['flag', 'c7_winter'],
    ['hideParty', true],
    ['warp', 'village', 8, 13, 'up', { fade: false }],
    ['weather', 'snow'],
    ['bgm', 'village', 0],
    ['caption', ['그해 겨울 방학.'], { hold: 1800 }],
    ['fadeIn', 1500],
    '할머니 집 담장 위에, 치즈색 고양이 한 마리가 앉아 있다.',
    ['wait', 800],
    ['se', 'rustle'],
    '바스락—',
    ['move', 'bagW', 'RRRRR', { speed: 3 }],
    ['wait', 300],
    ['anim', 'gamtuW', 'hop'],
    ['se', 'pop'],
    '감투가 앞발로 비닐봉지를 툭, 쳐냈다.',
    ['move', 'bagW', 'UUUU', { speed: 7, wait: false }],
    ['hide', 'bagW', { fade: 600 }],
    ['se', 'meowSmall'],
    '감투: 냐. {(비닐봉지쯤이야.)}',
    ['wait', 1000],
    '재희: 감투야— 할머니가 된장찌개 다 됐대!',
    ['se', 'meow'],
    '감투: 냐아! {(지금 가!)}',
    ['wait', 1200],
    ['fadeOut', 2500],
    ['js', () => {
      try {
        localStorage.setItem('gamtu_cleared', '1');
      } catch (e) {
        /* 무시 */
      }
    }],
    ['flag', 'c7_end'],
    ['chapter', 7, '완결 · 다시, 달무리'],
    ['weather', null],
    ['hideParty', false],
    ['show', 'gamtu'],
    ['flag', 'c7_carrier', false],
    ['warp', 'village', 7, 15, 'up', { fade: false }],
    ['goal', '완결! 마을을 자유롭게 둘러보세요.'],
    ['autosave'],
    ['chapterCard', '완결', '감투의 용기 ★★★★★★★', { hold: 3200 }],
    ['title'],
  ],
});

/* ---------- 마을: 기억 수첩 모으기 ---------- */
{
  const NOTE = (id, x, y, sprite, flag, lines, after, extra = {}) => ({
    id, x, y,
    pages: [
      { cond: { chapterMin: 7 }, sprite, ...extra, script: [after] },
      { cond: { chapterMin: 7, notFlag: flag, flag: 'c7_started' }, sprite, ...extra, script: [...lines, ['call', 'c7_note'], ['flag', flag], ['call', 'c7_noteCount']] },
    ],
  });
  GameData.addEvents('village', [
    {
      id: 'gm7', x: 6, y: 13,
      pages: [
        { cond: { chapterMin: 7 }, sprite: 'grandmaPin', dir: 'right', script: ['할머니 : 수첩은 잘 되어 가나? 할미 얘기 이상한 거 적으면 안 된다. 허허.'] },
        { cond: { flag: 'c7_parents' }, sprite: 'grandmaPin', dir: 'right', script: ['할머니 : 우리 딸, 우리 사위, 우리 손녀, 우리 감투 대감. 다 모였네.'] },
        { cond: { flag: 'c7_winter' }, sprite: 'grandmaPin', dir: 'right', script: ['할머니 : 수첩은 매일 읽는다. 오늘은 "4시 종소리"까지 읽었다. 허허.'] },
      ],
    },
    {
      id: 'zelkova7', x: 16, y: 11, area: [2, 2], offset: [8, 16],
      pages: [
        { cond: { chapterMin: 7 }, sprite: 'zelkova', noTurn: true, script: ['느티나무: 수첩을 만든다고? 허허, 그것도 용기란다. 잊어도 괜찮다고 말해 주는 용기.'] },
        { cond: { chapterMin: 7, flag: 'c7_parents', notFlag: 'c7_tree' }, sprite: 'zelkova', noTurn: true, script: 'c7_tree' },
        { cond: { flag: 'c7_tree' }, sprite: 'zelkova', noTurn: true, script: ['느티나무: 오늘 밤 달무리를 놓치지 말거라.'] },
      ],
    },
    NOTE('ijang7', 33, 15, 'ijang', 'note_ijang', ['이장님: 순덕 할매 이야기? 할매는 젊을 적 마을에서 노래를 제일 잘했지.', '이장님: 정자에서 한 곡 뽑으면 온 동네 개들까지 조용해졌어. 우리 보리 할아버지 개도.'], '이장님: 수첩에 내 얘기도 한 줄 넣어 다오. "이장은 잘생겼다." 크하하!', { dir: 'down' }),
    NOTE('minsu7', 16, 21, 'minsu', 'note_minsu', ['민수: 할머니? 나 작년에 넘어져서 무릎 까졌을 때, 할머니가 "울어도 괜찮다" 했어!', '민수: 그래서 엄청 울었어. 그랬더니 진짜 괜찮아졌어!', '재희: (…할머니, 여섯 살 나한테도 그 말 해 줬는데.)'], '민수: 누나 가면 감투 대감님 보고 싶을 거야….'),
    NOTE('bori7', 35, 13, 'boriCollar', 'note_bori', [['se', 'bark'], '보리: 할머니는 비 오는 날마다 내 집 지붕에 비닐을 덮어 줘! 이장님보다 먼저!', '감투: (재희야, 보리가 비닐은 안 무섭대.)'], '보리: 월! 겨울에 또 와! 눈밭에서 달리기 하자!'),
    NOTE('kkachi7', 23, 9, 'magpie', 'note_kkachi', [['se', 'caw'], '깍순이: 깍깍! 할머니는 아침마다 마당에 쌀 한 줌 뿌려 줘. 우리 까치들 아침밥이야!', '깍순이: 그래서 우리가 맨날 좋은 소식 물어다 주는 거지! 깍깍!'], '깍순이: 깍깍! 수첩 완성되면 빅뉴스로 퍼뜨려 줄게!'),
    NOTE('owl7', 25, 9, 'owl', 'note_owl', ['똑딱 선생: 에헴. 마지막 인사차 내려왔네.', '똑딱 선생: 순덕 씨는 매일 오후 4시 종이 치면 딸 손을 잡고 탑을 올려다봤지. 그건 내가 육십 년 시간 중에 제일 좋아하는 장면이었네.'], '똑딱 선생: 째깍째깍. 시간은 흘러도 수첩은 남지. 에헴.'),
    NOTE('mouse7', 28, 12, 'mouse', 'note_mouse', [['se', 'squeak'], '찍찍이: 찍! 노크했어! …아니 이번엔 너희가 나 찾아왔구나.', '찍찍이: 할머니 장독대 밑은 겨울에 따뜻해. 할머니는 내가 거기 사는 거 알면서 모른 척해 줘. 찍.'], '찍찍이: 찍. 비밀이야. 수첩엔 작게 적어 줘.'),
    { id: 'c7ParentsAuto', x: 0, y: 4, pages: [{ cond: { chapter: 7, var: ['notes', '>=', 8], notFlag: 'c7_parents' }, trigger: 'auto', script: 'c7_parents' }] },
    { id: 'momV', x: 7, y: 19, pages: [{ cond: { flag: 'c7_parentsArrive', notFlag: 'c7_tree' }, sprite: 'adultMom', dir: 'up', noTurn: true, script: ['엄마 : 엄마랑 오랜만에 시장 가기로 했어. 재희도 같이 갈래?'] }] },
    { id: 'dadV', x: 8, y: 19, pages: [{ cond: { flag: 'c7_parentsArrive', notFlag: 'c7_tree' }, sprite: 'dad', dir: 'up', noTurn: true, script: ['아빠: 여기 공기 진짜 좋다. 감투 너 여기서 살이 더 쪘구나?', '감투: (…쪘어?)'] }] },
    // 엔딩 뒤: 겨울 담장 위의 감투
    { id: 'gamtuW', x: 8, y: 14, pages: [{ cond: { flag: 'c7_winter', notFlag: 'c7_end' }, sprite: 'gamtu', dir: 'left', offset: [0, -6], noTurn: true, through: true, trigger: 'none' }] },
    { id: 'bagW', x: 2, y: 13, pages: [{ cond: { flag: 'c7_winter', notFlag: 'c7_end' }, sprite: 'plasticBag', noTurn: true, through: true, trigger: 'none' }] },
  ]);
}

GameData.addEvents('shop', [
  {
    id: 'geumsun7', x: 2, y: 3,
    pages: [
      { cond: { chapterMin: 7 }, sprite: 'geumsun', dir: 'down', script: ['금순 아줌마: 겨울에 또 와. 사탕 잔뜩 준비해 둘게!'] },
      {
        cond: { chapterMin: 7, notFlag: 'note_geumsun', flag: 'c7_started' }, sprite: 'geumsun', dir: 'down',
        script: ['금순 아줌마: 할머니 이야기? 호호, 할머니는 꼭 외상으로 사탕을 한 봉지씩 사 가셔. 동네 애들 나눠 준다고.', '금순 아줌마: 그리고 다음 날 아침이면 꼭 갚으러 오셔. 한 번도 안 잊으셨어. 이상하지?', '재희: (사탕 외상은… 안 잊으셨구나.)', ['call', 'c7_note'], ['flag', 'note_geumsun'], ['call', 'c7_noteCount']],
      },
    ],
  },
]);

/* ---------- 할머니 집: 마지막 밤 ---------- */
GameData.addEvents('house', [
  { id: 'c7FinaleAuto', x: 0, y: 3, pages: [{ cond: { flag: 'c7_tree', notFlag: 'c7_finale' }, trigger: 'auto', script: 'c7_finale' }] },
  { id: 'gmF7', x: 7, y: 9, pages: [{ cond: { flag: 'c7_tree', notFlag: 'c7_morning' }, sprite: 'grandmaPin', dir: 'down', noTurn: true, script: ['할머니 : 달 참 곱다.'] }] },
  { id: 'momF7', x: 10, y: 9, pages: [{ cond: { flag: 'c7_tree', notFlag: 'c7_morning' }, sprite: 'adultMom', dir: 'down', noTurn: true, script: ['엄마 : 엄마 어릴 때도 여기 앉아서 달 봤어.'] }] },
  { id: 'dadF7', x: 10, y: 8, pages: [{ cond: { flag: 'c7_tree', notFlag: 'c7_morning' }, sprite: 'dad', dir: 'down', noTurn: true, script: ['아빠: …좋다. 진짜 좋다.'] }] },
]);

/* ---------- 버스 정류장: 배웅 ---------- */
GameData.addEvents('busstop', [
  ...[
    ['gmB', 10, 7, 'grandmaPin', 'down'], ['ijangB', 7, 7, 'ijang', 'right'], ['minsuB', 12, 6, 'minsu', 'down'], ['boriB', 12, 7, 'boriCollar', 'left'],
    ['kkachiB', 14, 5, 'magpie', 'down'], ['mouseB', 8, 6, 'mouse', 'down'], ['owlB', 5, 5, 'owl', 'down'], ['kkamB', 11, 5, 'firefly', 'down'],
    ['momB', 8, 8, 'adultMom', 'right'], ['dadB', 7, 8, 'dad', 'right'],
  ].map(([id, x, y, sp, d]) => ({ id, x, y, pages: [{ cond: { flag: 'c7_bye' }, sprite: sp, dir: d, noTurn: true, trigger: 'none' }] })),
  { id: 'carrier7', x: 11, y: 8, pages: [{ cond: { flag: 'c7_carrier' }, sprite: 'carrier', noTurn: true, trigger: 'none' }] },
  { id: 'bus7', x: 2, y: 10, pages: [{ cond: { flag: 'c7_busCome' }, sprite: 'bus', through: true, trigger: 'none' }] },
]);
