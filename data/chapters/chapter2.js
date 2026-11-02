/*
 * 2장 · 캄캄한 동굴의 반딧불
 * 감투가 넘는 무서운 것: 어둠
 * 성장: 처음엔 동굴에서 재희 곁을 떠나지 못한다(전환 불가) → 마지막엔 '고양이 눈'으로 앞장서고 재희가 감투를 따라온다
 * 흐름: 할머니의 손전등 → 느티나무 → 동쪽 골짜기(징검다리 점프 + 통나무 다리) → 동굴(반딧불 깜빡이, '감투 등불')
 *      → 거울돌 빛 반사 퍼즐 → 박쥐 피하기 → 손전등이 꺼진 완전한 어둠 → 감투가 눈을 뜬다(심장 박자)
 *      → 감투가 앞장서 숨은 돌길을 건넌다 → 기억 조각 ②(어린 순덕과 촛불) → 반딧불이 날아오는 밤
 */
GameData.defineChapter({ num: 2, id: 'chapter2', title: '2장 · 캄캄한 동굴의 반딧불', start: 'c2_start' });

/* ---------- 이 장에서 새로 나오는 캐릭터·아이템 ---------- */
GameData.config.party.kkam = { sprite: 'firefly', kind: 'npc', speed: 5.4, offset: [0, -7], float: true, light: 26 };
GameData.defineSprites({
  littleSoondeok: { type: 'human', hair: '#2a2228', cloth: '#f0e6d2', pants: '#c0504a', style: 'bun', skin: '#f4d3b2', shoes: '#ffffff' },
  sibling1: { type: 'human', hair: '#2a2228', cloth: '#8ab0d8', pants: '#4a4a5a', skin: '#f4d3b2' },
  sibling2: { type: 'human', hair: '#2a2228', cloth: '#d8b08a', pants: '#4a4a5a', skin: '#f4d3b2' },
});
GameData.defineCharacters({
  깜빡이: { sprite: 'firefly', color: '#e6ff8a', voice: 1.9 },
  어린순덕: { display: '어린 순덕', sprite: 'littleSoondeok', color: '#ffd9e0', voice: 1.25 },
  순길: { sprite: 'sibling1', color: '#c8e0ff', voice: 1.5 },
  순남: { sprite: 'sibling2', color: '#ffe0c0', voice: 1.6 },
});
GameData.defineItems({
  flashlight: { name: '할머니 손전등', desc: '오래된 파란 손전등. "깜깜한 데선 서두르지 말고, 천천히."', icon: 'flashlightIcon' },
  fragment2: { name: '기억 조각 · 두 번째', desc: '촛불처럼 작고 따뜻하게 빛나는 조각.', icon: 'fragment' },
});

/* 감투에게 말 걸기: 2장부터는 새 대사, 그 전 장은 원래 대사 */
GameData.scripts.talk_gamtu_c01 = GameData.scripts.talk_gamtu;
GameData.defineScripts({
  talk_gamtu: [
    ['if', { chapterMin: 2 }, [
      ['if', { flag: 'c2_frag' }, [
        '감투: 깜깜한 데서 눈 뜨는 거, 생각보다 할 만하더라. …두 번은 하기 싫지만.',
      ], [
        ['if', { flag: 'c2_kkam' }, [
          '감투: 재희야, 내 엉덩이 아직 빛나? …빛나지? 하아.',
        ], [
          '감투: 동굴… 진짜 가는 거지? 손전등 건전지 넉넉하지? 그렇지?',
        ]],
      ]],
    ], [['call', 'talk_gamtu_c01']]],
  ],
  talk_kkam: [
    ['if', { flag: 'c2_frag' }, ['깜빡이: 나 이제 꺼진불 아니야! 반짝불이야! 헤헤.'], ['깜빡이: 감투 엉덩이 따뜻해. 비밀이야.']],
  ],

  c2_start: [
    ['chapterCard', '2장', '캄캄한 동굴의 반딧불'],
    ['flag', 'c2_started'],
    ['var', 'c2m1', '=', 1],
    ['var', 'c2m2', '=', 1],
    ['var', 'c2m3', '=', 0],
    ['bgm', 'village', 1500],
    ['fadeIn', 1200],
    '다음 날 아침. 마을의 색이 아주 조금 돌아와 있었다.',
    ['move', 'player', 'U', { speed: 3 }],
    ['face', 'player', 'left'],
    '할머니 : 우리 재희, 잘 잤나? 감투 대감도 굿모닝이요.',
    '감투: (재희야, 할머니가 영어 했어.)',
    '재희: 할머니, 나 오늘도 감투랑 어디 좀 다녀올게.',
    '할머니 : 오늘은 또 어딜 가노? …뭔지는 몰라도, 니 눈빛이 꼭 니 엄마 어릴 때 같다.',
    '할머니 : 자, 이거 가져가라.',
    ['item', 'flashlight'],
    ['flag', 'flashlight'],
    '할머니 : 할미 손전등이다. 깜깜한 데 가거든 꼭 켜고. 서두르지 말고, 천천히.',
    '재희: …할머니, 우리가 깜깜한 데 가는 거 어떻게 알았어?',
    '할머니 : 할미는 다 안다. …사실은 모르는데, 그냥 그런 기분이 들더라. 허허.',
    '감투: (깜깜한 데…? 우리 깜깜한 데 가는 거야?)',
    ['goal', '느티나무 할아버지께 다음 기억 조각에 대해 여쭤보자'],
    ['autosave'],
  ],

  c2_tree: [
    '느티나무: 왔구나. 두 번째 조각은 [동쪽 골짜기], 그 너머 동굴 깊은 곳에서 깜빡이고 있다.',
    '감투: 도, 동굴…. 어젯밤에 반짝인 게 진짜 동굴이었구나.',
    '느티나무: 빛 한 줌 들지 않는 곳이란다. 오래전엔 반딧불들이 살던 곳이지.',
    '재희: 할머니가 손전등을 주셨어요!',
    '느티나무: 허허. 할멈은 기억을 잃어도, 손녀 걱정은 잊지 않는구나.',
    '느티나무: 고양이야. 어둠이 무서우냐?',
    '감투: …네. 엄청요. 깜깜하면 아무것도 없는 것 같아서요. 나 혼자만 남은 것 같아서.',
    '느티나무: 고양이의 눈은 어둠 속에서 길을 찾도록 만들어졌단다. 네가 눈을 뜨기만 한다면.',
    '감투: 눈 뜨는 게 제일 어려운데요….',
    '느티나무: 마을 동쪽 끝 길을 따라가거라.',
    ['flag', 'c2_tree'],
    ['goal', '마을 동쪽 끝 길로 동쪽 골짜기에 가자'],
  ],

  c2_valleyIn: [
    '서늘한 바람이 부는 골짜기. 물소리가 크게 들린다.',
    '재희: 다리가… 없네. 물살이 세서 떠내려갔나 봐.',
    '감투: 저기 건너편에 쓰러진 통나무가 있어.',
    '재희: 저걸 개울에 걸치면 건널 수 있을 텐데….',
    '감투: …가운데 돌 하나만 밟고, 폴짝, 폴짝 하면 갈 수 있겠다.',
    ['emote', 'jaehee', '!'],
    '재희: 감투, 너….',
    '감투: 어제 했잖아. …무섭긴 한데, 할 수 있어.',
    ['flag', 'c2_valley'],
    ['goal', '감투로 징검돌을 건너 통나무를 밀자 (C 키 / 감투 버튼)'],
  ],

  c2_log: [
    ['if', { control: 'gamtu' }, [
      '감투: 이걸… 밀면 되는 거지? 끄응….',
      '감투: 영차! 영차아…!',
      ['shake', 3, 500],
      ['se', 'thud'],
      ['flag', 'c2_bridge'],
      '쿵! 통나무가 개울 위로 넘어지며 다리가 되었다!',
      '감투: …됐다! 재희야, 건너와!',
      ['goal', '재희에게 돌아가(C 키) 통나무 다리를 건너 동굴로'],
    ], ['쓰러진 통나무다. 개울 건너편에 있어서 닿지 않는다.']],
  ],

  c2_caveIn: [
    '깜깜하다. 손전등 불빛이 닿는 곳만 겨우 보인다.',
    ['emote', 'gamtu', '!'],
    ['anim', 'gamtu', 'shiver', 1200],
    '감투가 재희 다리에 착 달라붙었다.',
    '감투: 재, 재희야… 손전등 절대 끄지 마. 절대.',
    '재희: 알았어. 천천히 가자. 할머니가 서두르지 말랬어.',
    '감투: …발소리가 울려. 내 발소리인데도 무서워.',
    '(동굴 안에서는 감투가 무서워서 재희 곁을 떠나지 못합니다.)',
    ['flag', 'c2_cave_in'],
    ['goal', '동굴 안쪽으로 가 보자'],
  ],

  c2_kkam: [
    '???: 훌쩍… 훌쩍….',
    '재희: 반딧불…? 왜 울고 있어?',
    ['emote', 'kkamEv', '!'],
    '???: 히익! 누, 누구야! …사람? 그리고… 고양이?!',
    '감투: 고양이는 맞는데… 무섭지 않은 고양이야. 아마.',
    '깜빡이: 나, 나는 깜빡이야. 반딧불이야. …근데 빛이 이것밖에 안 나.',
    '깜빡이: 다른 반딧불들은 다 반짝반짝 밝은데, 나만 깜빡깜빡… 꺼질 듯 말 듯 해. 그래서 다들 날 "꺼진불"이라고 놀렸어.',
    '깜빡이: 창피해서 동굴 깊이 숨었다가… 길을 잃어버렸어. 흐아앙….',
    ['wait', 700],
    '감투: …나도 맨날 숨어.',
    ['emote', 'kkamEv', '?'],
    '깜빡이: …너도?',
    '감투: 응. 무서운 게 오면 숨어. 그래서 이름도 감투야. 도깨비감투 쓴 것처럼 맨날 사라진다고.',
    '감투: 근데 어제는 한 번 안 숨었어. 다리가 엄청 떨렸는데, 그래도 안 숨었어.',
    '감투: 그러니까… 너도 같이 가자. 숨지 말고. 우리 둘 다 겁쟁이니까, 둘이면 반만 무서울 거야.',
    ['emote', 'jaehee', '♥'],
    '재희: (감투가 누굴 달래 주다니…!)',
    '깜빡이: …진짜? 같이 가도 돼? 내 빛, 엄청 작은데?',
    '재희: 작아도 빛은 빛이야. 같이 가자, 깜빡이.',
    ['se', 'sparkle'],
    ['hide', 'kkamEv'],
    ['flag', 'c2_kkam'],
    ['party', 'add', 'kkam'],
    ['notify', '깜빡이가 동료가 되었다!', 'goal'],
    ['wait', 400],
    // 웃음 장면: 감투 등불
    '깜빡이: 그럼 나는… 여기!',
    ['js', (s, G) => {
      const k = G.game.actors.kkam, c = G.game.actors.gamtu;
      k.place(c.x, c.y, c.dir);
      k.offset = [c.dir === 'left' ? 5 : c.dir === 'right' ? -5 : 0, -1];
      k.float = false;
    }],
    ['se', 'pop'],
    ['emote', 'gamtu', '!'],
    '깜빡이가 감투 엉덩이에 착 내려앉았다. 감투 엉덩이가 은은하게 빛난다.',
    '감투: 야! 내 엉덩이는 등불이 아니야!',
    '깜빡이: 여기 따뜻하고 폭신해! 그리고 네가 꼬리 흔들 때마다 불빛이 흔들려서 재밌어!',
    '재희: 푸핫! 감투 등불이다! 걸어 다니는 감투 등불!',
    '감투: 웃지 마! …진짜 웃지 마!',
    ['anim', 'gamtu', 'hop'],
    ['js', (s, G) => {
      const k = G.game.actors.kkam;
      k.offset = [0, -14];
    }],
    '감투가 펄쩍 뛰자 깜빡이가 붕 떠올랐다가…',
    ['js', (s, G) => {
      const k = G.game.actors.kkam, c = G.game.actors.gamtu;
      k.offset = [c.dir === 'left' ? 5 : c.dir === 'right' ? -5 : 0, -1];
    }],
    ['se', 'pop'],
    '…다시 엉덩이에 앉았다.',
    '감투: …….',
    '감투: …알았어. 대신 걸을 때는 내 뒤에서 날아. 엉덩이에 앉는 건 쉴 때만.',
    '깜빡이: 헤헤, 약속!',
    ['js', (s, G) => {
      const k = G.game.actors.kkam;
      k.offset = [0, -7];
      k.float = true;
    }],
    ['gather'],
    ['goal', '동굴 안쪽으로 (위쪽 통로)'],
  ],

  c2_mirrorIn: [
    '넓은 방이다. 벽 틈으로 가느다란 빛줄기가 새어 들어오고 있다.',
    '깜빡이: 저기 저 수정 보여? 빛을 받으면 위쪽 바위문이 열린대! 반딧불 할머니가 그랬어.',
    '재희: 빛줄기를 수정까지 보내야 하는구나. 저 거울 같은 돌들로 빛의 방향을 바꾸면 될 것 같아.',
    '(거울돌을 조사하면 기울어진 방향이 바뀝니다. 빛줄기를 수정까지 이어 보세요.)',
    ['flag', 'c2_mirror_in'],
    ['goal', '거울돌로 빛줄기를 수정까지 보내자'],
  ],

  c2_gateOpen: [
    ['shake', 3, 900],
    ['se', 'thud'],
    '쿠구구궁… 위쪽 바위문이 열렸다!',
    '깜빡이: 열렸다! 너희 대단해!',
    '감투: 거울돌 돌린 건 재희야. 나는 응원했어.',
    ['flag', 'c2_gate'],
    ['goal', '열린 바위문으로 더 깊이 (위쪽)'],
  ],

  c2_cave2In: [
    '더 깊은 곳. 공기가 차갑다. 천장에서 무언가 바스락거린다.',
    '깜빡이: 박쥐들이야! 박쥐들은 빛을 싫어해서, 가까이 가면 달려들어!',
    '감투: 히익….',
    '(박쥐에게 닿으면 통로 입구로 돌아갑니다. 왼쪽 끝 통로로 올라가세요.)',
    ['flag', 'c2_cave2_in'],
    ['goal', '박쥐를 피해 왼쪽 위 통로로'],
  ],

  c2_bat: [
    ['se', 'squeak'],
    ['shake', 2, 400],
    '파드득! 박쥐 떼가 날개를 퍼덕이며 덤벼들었다!',
    ['var', 'c2_bat', '+', 1],
    ['if', { var: ['c2_bat', '>=', 3] }, ['깜빡이: 박쥐는 가까이 가면 쫓아와! 멀어질 때를 기다렸다가 지나가!'], ['감투: 으아아… 일단 도망!']],
    ['warp', 'cave2', 13, 20, 'up', { reload: true, se: 'whoosh' }],
  ],

  c2_climax: [
    ['fadeOut', 300],
    ['flag', 'c2_climax'],
    ['follow', 'gamtu', false],
    ['follow', 'kkam', false],
    ['setPos', 'jaehee', 5, 8, 'right'],
    ['setPos', 'gamtu', 4, 8, 'right'],
    ['setPos', 'kkam', 4, 7, 'right'],
    ['fadeIn', 300],
    '재희: 저기…! 건너편에 빛이 보여! 기억 조각이야!',
    '깜빡이: 근데… 길이 없어. 저 아래는 바닥이 안 보이는 낭떠러지야.',
    '재희: 손전등으로 잘 비춰 보면 어딘가 길이—',
    ['se', 'miss'],
    ['flag', 'flashlight', false],
    ['wait', 200],
    ['flag', 'flashlight', true],
    ['wait', 300],
    ['se', 'miss'],
    ['flag', 'flashlight', false],
    ['wait', 250],
    ['flag', 'flashlight', true],
    ['wait', 150],
    '치직… 치지직….',
    ['flag', 'blackout'],
    ['flag', 'flashlight', false],
    ['stopBgm', 0],
    ['se', 'thud'],
    '손전등이 꺼졌다.',
    ['wait', 1400],
    '재희: …어? 어? 왜 안 켜지지? 건전지가….',
    '재희: (금순 아줌마가 건전지가 다 팔렸다고 했었지….)',
    ['wait', 800],
    '완전한 어둠. 깜빡이의 작은 불빛만 희미하게 깜빡인다.',
    ['anim', 'jaehee', 'shiver', 1600],
    '재희: …감투야.',
    '재희: 나, 사실… 깜깜한 거 무서워.',
    '재희: 할머니 집에 처음 왔던 밤에도, 깜깜해서 한숨도 못 잤어. 지금도… 다리가 안 움직여.',
    '깜빡이: 미, 미안해… 내 빛이 더 밝았으면… 흐윽….',
    ['bgm', 'fog', 2000],
    ['camera', 'gamtu', 700],
    '감투: (재희가… 떨고 있어.)',
    '감투: (고양이 눈은 깜깜한 데서도 보인다고, 재희가 그림책에서 읽어 줬었지.)',
    '감투: (그런데… 눈을 못 뜨겠어. 눈을 뜨면, 깜깜한 게 진짜가 되잖아.)',
    '감투: (꼭 감고 있으면… 아무것도 없는 척할 수 있잖아.)',
    ['choice', ['눈을 꼭 감는다', '눈을 뜬다'], [
      [
        '감투는 눈을 더 꼭 감았다.',
        ['wait', 900],
        '그때, 감투의 꼬리 끝에 떨고 있는 재희의 손가락이 닿았다.',
        '감투: (……재희 손이 차가워.)',
        '감투: (어제는 재희가 날 믿어 줬어. 이번엔… 내 차례야.)',
      ],
      [
        '감투: (떠야 해. 눈을… 떠야 해.)',
      ],
    ]],
    ['minigame', 'heartbeat', {
      title: '어둠 속에서, 감투의 심장이 쿵쾅거린다…!',
      hits: 4,
      speed: 1.6,
      zone: 0.15,
      lines: ['숨을 크게 쉬고…', '하나…', '둘…', '재희가 기다리고 있어…!', '눈을 떠!'],
      missLines: ['…깜깜해. 아무것도 없어.', '아니야, 재희가 있어. 다시…!', '한 번만 더…!'],
      doneLine: '……!',
    }],
    ['se', 'bell'],
    ['flash', '#c8ffd8', 700],
    ['bgm', 'brave', 0],
    '감투가 천천히 눈을 떴다.',
    '어둠 속에서, 감투의 눈동자가 초록빛으로 반짝였다.',
    ['ability', 'cateye', '고양이 눈'],
    ['control', 'gamtu'],
    ['camera', 'reset', 300],
    '감투: …보여.',
    '감투: 보여, 재희야! 깜깜한데 다 보여! 낭떠러지 사이에 좁은 돌길이 있어!',
    '재희: 정말…?',
    ['courage', 1],
    '감투: 내가 앞장설게. 내 꼬리만 보고 따라와. 깜빡이, 넌 재희 옆에 꼭 붙어 있어.',
    '깜빡이: 응! 엉덩이 말고 재희 옆!',
    '재희: …응. 감투 꼬리, 꼭 보고 갈게.',
    ['flag', 'gamtuLeads'],
    ['follow', 'jaehee', true],
    ['follow', 'kkam', true],
    ['follow', 'gamtu', true],
    '(이제 감투가 앞장서고 재희가 따라옵니다. 초록 테두리로 보이는 돌길을 따라 기억 조각까지 가세요.)',
    ['goal', '감투가 앞장서서 숨은 돌길을 따라 기억 조각까지'],
  ],

  c2_fragment: [
    '감투: 찾았다…! 재희야, 여기야!',
    '재희가 감투의 꼬리를 따라 마지막 돌을 건넜다. 따뜻한 빛이 재희의 손끝에 닿는다.',
    ['item', 'fragment2'],
    ['flag', 'c2_frag'],
    ['se', 'sparkle'],
    ['fadeOut', 1400, '#ffffff'],
    ['call', 'c2_memory'],
  ],

  c2_memory: [
    ['flag', 'c2_mem'],
    ['hideParty', true],
    ['tone', 'memory', 0],
    ['gray', 0, 0],
    ['warp', 'house', 9, 7, 'up', { fade: false }],
    ['dark', 0.93],
    ['bgm', 'memory', 0],
    ['fadeIn', 1800],
    '— 할머니의 기억 —',
    '…아주 오래전, 할머니가 열 살이던 겨울밤.',
    '바람이 세게 불던 밤, 마을의 불이 모두 꺼졌다.',
    '순길: 누나야… 깜깜해… 무서워….',
    '순남: 으아앙….',
    '어린순덕: 괜찮다, 괜찮아. 누나가 촛불 켜 줄게. 잠깐만 기다려라.',
    ['se', 'pop'],
    ['flag', 'c2_candle'],
    ['dark', 0.88],
    '치익— 작은 촛불 하나가 켜졌다.',
    '순길: 촛불 하나로는 너무 작아. 저기 구석은 아직도 깜깜해.',
    '어린순덕: 그래도 봐라. 우리 셋 얼굴은 다 보이제?',
    '어린순덕: [작은 빛도 길이 된단다.] 하나만 있어도 돼. 서로 얼굴만 보이면, 하나도 안 무섭다.',
    ['wait', 700],
    '순남: …누나는 안 무서워?',
    ['wait', 900],
    '어린순덕: …사실 누나도 무섭다.',
    '어린순덕: 그래도 누나가 무서워하면 너희가 더 무서울까 봐, 꾹 참는 거다.',
    '어린순덕: 자, 누나가 노래 불러 줄게. 달아 달아 밝은 달아, 이태백이 놀던 달아….',
    ['wait', 1200],
    '어린 동생들은 누나 무릎에 기대 하나둘 잠이 들었다. 촛불은 밤새 꺼지지 않았다.',
    ['wait', 1400],
    ['flag', 'c2_memdone'],
    ['fadeOut', 1600, '#ffffff'],
    ['dark', null],
    ['tone', '', 0],
    ['gray', 0.3, 0],
    ['hideParty', false],
    ['warp', 'cave2', 25, 6, 'down', { fade: false }],
    ['fadeIn', 1600],
    '재희: …할머니한테도 무서운 밤이 있었대.',
    '재희: 정전된 밤에, 동생들 앞에서 촛불 하나 들고… 사실은 자기도 무서운데 꾹 참았대.',
    '감투: …나랑 똑같다. 아까 나도 엄청 무서웠는데, 재희가 떨고 있어서 꾹 참았어.',
    '재희: 응. 할머니처럼 멋있었어.',
    '깜빡이: "작은 빛도 길이 된다"…. 할머니가 그랬지?',
    ['wait', 600],
    ['se', 'sparkle'],
    ['var', 'flyLight', '=', 64],
    ['sparkle', 'kkam'],
    '깜빡이의 빛이 화아— 하고 밝아졌다!',
    '깜빡이: 어, 어? 나 빛나! 엄청 빛나!',
    '감투: 엉덩이에 안 앉아도 잘 빛나네.',
    '깜빡이: 헤헤! 이제 꺼진불 아니야. 깜빡이야!',
    '감투: …저기 위쪽에서 바람이 들어와. 바깥으로 나가는 틈이 있어. 거기 가는 돌길도 내 눈엔 보여.',
    ['bgm', 'forest', 1500],
    ['goal', '감투를 따라 위쪽 틈으로 동굴을 빠져나가자'],
    ['autosave'],
  ],

  c2_exit: [
    ['fadeOut', 600],
    ['warp', 'valley', 25, 8, 'left', { fade: false }],
    ['flag', 'gamtuLeads', false],
    ['flag', 'blackout', false],
    ['control', 'jaehee'],
    ['gather'],
    ['tone', 'dusk', 0],
    ['fadeIn', 1000],
    '동굴 밖으로 나오자, 하늘이 붉게 물들어 있었다.',
    '재희: 나왔다…! 감투, 네 덕분이야.',
    '감투: …다리 후들거려. 근데 기분은 좋아.',
    '깜빡이: 저기 봐! 하늘에 별이 하나 떴어!',
    ['wait', 600],
    ['stopBgm', 1500],
    ['fadeOut', 1500],
    ['call', 'c2_end'],
  ],

  c2_end: [
    ['tone', 'night', 0],
    ['warp', 'village', 7, 13, 'left', { fade: false }],
    ['weather', 'fireflies'],
    ['bgm', 'night', 0],
    ['fadeIn', 1500],
    '그날 밤. 할머니 집 마당.',
    '할머니 : 재희 왔나. 아이고, 얼굴이 꼬질꼬질하네. 어디서 굴렀노?',
    '재희: 동굴 탐험! …할머니, 근데 손전등 건전지가 다 됐어. 미안해.',
    '할머니 : 건전지야 사면 되지. 우리 재희만 무사하면 됐다.',
    ['wait', 700],
    '할머니 : …그라고 있제. 오늘 낮에 갑자기 옛날 생각이 하나 나더라.',
    '할머니 : 할미한테 남동생이 둘 있었거든. 순길이, 순남이.',
    '할머니 : 정전된 겨울밤에 둘이 하도 울어 쌓길래, 할미가 촛불 하나 켜 놓고 노래를 불러 줬지.',
    '할머니 : 사실 할미도 무서워 죽겠는데, 누나니까 꾹 참았다. 허허.',
    '재희: …알아. 할머니, 그때 정말 멋있었어.',
    '할머니 : 니가 그걸 어찌 아노?',
    '재희: 비밀!',
    '감투: (비밀.)',
    ['emote', 'gm2', '♪'],
    '할머니 : 그 녀석들도 이제 다 머리가 하얗다. 이번 추석엔 꼭 불러야겠네. 오래 연락도 못 했다.',
    ['wait', 600],
    '깜빡이: 재희야, 감투야! 저기 봐!',
    '어둠 저편에서 작은 불빛들이 하나, 둘… 수십 개가 날아왔다.',
    '깜빡이: 내 친구들이야! 내 빛을 보고 찾아왔대! 꺼진불이 아니라, 제일 반짝이는 불이래!',
    '할머니 : 아이고, 반딧불이네. 몇십 년 만에 보는지… 곱다, 참 곱다.',
    '감투: (재희야. 깜깜해야 반딧불도 보이는 거구나.)',
    '재희: (응. 깜깜한 것도… 나쁘기만 한 건 아니네.)',
    ['se', 'bell'],
    '깜빡이: 나, 다음 모험도 같이 가도 돼? 깜깜한 데 있으면 내가 비춰 줄게!',
    '감투: …엉덩이 말고 머리 위에서 비춰.',
    '깜빡이: 생각해 볼게!',
    ['wait', 900],
    ['stopBgm', 2000],
    ['fadeOut', 2200],
    ['bgm', 'clear', 0],
    ['chapterCard', '2장 끝', '캄캄한 동굴의 반딧불', { hold: 3800 }],
    ['caption', ['감투의 용기가 한 칸 더 자랐다.', '3장 「시계탑의 부엉이」', '— 다음 이야기에서 계속됩니다 —'], { hold: 2600 }],
    ['flag', 'c2_end'],
    ['chapter', 3, '3장 · 시계탑의 부엉이 (준비 중)'],
    ['tone', '', 0],
    ['warp', 'village', 7, 15, 'up', { fade: false }],
    ['weather', null],
    ['goal', '3장은 다음 이야기에서 계속됩니다. 마을을 자유롭게 둘러보세요.'],
    ['autosave'],
    ['fadeIn', 1200],
    '(2장을 클리어했습니다! 진행 상황이 자동 저장되었습니다.)',
    ['choice', ['마을을 더 둘러본다', '타이틀로 돌아간다'], [[], [['title']]]],
  ],
});

/* ---------- 마을 ---------- */
GameData.addEvents('village', [
  {
    id: 'gm2', x: 6, y: 13,
    pages: [
      { cond: { chapterMin: 2 }, sprite: 'grandmaPin', dir: 'right', script: ['할머니 : 손전등 챙겼제? 깜깜한 데선 서두르지 말고, 천천히.'] },
      { cond: { flag: 'c2_frag' }, sprite: 'grandmaPin', dir: 'right', script: ['할머니 : 반딧불이 참 곱제. 오래 살고 볼 일이다.', '할머니 : 순길이 순남이한테 전화 한번 해야겠다. 번호가… 어디 적어 놨더라.'] },
    ],
  },
  {
    id: 'zelkova2', x: 16, y: 11, area: [2, 2], offset: [8, 16],
    pages: [
      { cond: { chapterMin: 2 }, sprite: 'zelkova', noTurn: true, script: 'c2_tree' },
      { cond: { chapterMin: 2, flag: 'c2_tree' }, sprite: 'zelkova', noTurn: true, script: ['느티나무: 동쪽 골짜기는 마을 동쪽 끝 길을 따라가면 된다.', '느티나무: 어둠 속에서는 서두르지 말거라. 눈을 뜨는 데는 원래 시간이 걸리는 법이란다.'] },
      { cond: { flag: 'c2_frag' }, sprite: 'zelkova', noTurn: true, script: ['느티나무: 허허, 방울 소리가 또 한결 맑아졌구나.', '느티나무: 다음 조각은 옛 학교의 멈춘 시계탑 꼭대기에서 기다리고 있다. 오늘은 반딧불 구경이나 하거라.'] },
    ],
  },
  {
    id: 'ijang2', x: 33, y: 15,
    pages: [{
      cond: { chapterMin: 2 }, sprite: 'ijang', dir: 'down',
      script: [['if', { flag: 'c2_frag' }, ['이장님: 반딧불이 다시 돌아왔다고? 허허, 내 어릴 적엔 여름밤마다 저랬지.'], ['이장님: 동쪽 골짜기? 거긴 물살이 세서 다리가 떠내려갔어. 옛날엔 쓰러진 통나무를 걸쳐서 건너곤 했지.']]],
    }],
  },
  {
    id: 'bori2', x: 35, y: 13,
    pages: [{
      cond: { chapterMin: 2 }, sprite: 'boriCollar', move: { type: 'random', radius: 1, wait: 2 },
      script: [['se', 'bark'], ['if', { flag: 'c2_frag' }, ['보리: 감투! 동굴에서 앞장섰다며? 깍순이가 다 말해 줬어! 월월!', '감투: …소식 진짜 빠르다.'], ['보리: 동굴 간다며? 거긴 냄새가 안 통해서 내 코가 소용없어… 대신 마을은 내가 지킬게! 월!', '감투: …나도 마을 지키는 거 하고 싶다. 그게 덜 무서울 것 같아.', '보리: 크하하!']]],
    }],
  },
  {
    id: 'minsu2', x: 16, y: 21,
    pages: [{
      cond: { chapterMin: 2 }, sprite: 'minsu', move: { type: 'random', radius: 2, wait: 2.5 },
      script: [['if', { flag: 'c2_frag' }, ['민수: 누나! 어젯밤에 반딧불 봤어? 엄마가 그러는데 반딧불은 깨끗한 데만 산대!'], ['민수: 누나 동쪽 골짜기 동굴 가? 거기 도깨비 산대! 밤마다 도깨비불이 깜빡깜빡한대!', '감투: (도깨비불…? 도깨비는 감투 쓰면 안 보인다며. 그럼 안 보이는 도깨비가 있다는 거잖아….)']]],
    }],
  },
  {
    id: 'kkachi2', x: 23, y: 9,
    pages: [{
      cond: { chapterMin: 2 }, sprite: 'magpie',
      script: [['se', 'caw'], ['if', { flag: 'c2_frag' }, ['깍순이: 깍깍! 빅뉴스! 꺼진불이 반짝불이 됐대! 반딧불들이 다 축제래!'], ['깍순이: 깍깍! 새 소식! 동굴 입구 근처에서 아주 작은 불빛 하나가 훌쩍훌쩍 운대! 박쥐 할멈이 그러더라!']]],
    }],
  },
  { id: 'c2Start', x: 0, y: 2, pages: [{ cond: { chapter: 2, notFlag: 'c2_started' }, trigger: 'auto', script: 'c2_start' }] },
]);

GameData.addEvents('shop', [
  {
    id: 'geumsun2', x: 2, y: 3,
    pages: [{
      cond: { chapterMin: 2 }, sprite: 'geumsun', dir: 'down',
      script: [['if', { flag: 'c2_frag' }, ['금순 아줌마: 건전지 들어왔어! 할머니 손전등에 넣어 드려. 이번엔 공짜야, 호호.'], ['금순 아줌마: 어서 와~ 오늘 아침엔 손님들 이름도 다 기억났어!', '금순 아줌마: 근데 건전지가 어제 다 팔렸지 뭐야. 동네 사람들이 죄다 손전등을 찾더라고.', '재희: (건전지…. 할머니 손전등은 괜찮겠지?)']]],
    }],
  },
]);

/* ---------- 동쪽 골짜기 ---------- */
GameData.addEvents('valley', [
  { id: 'valleyIn', x: 0, y: 0, pages: [{ cond: { chapterMin: 2, notFlag: 'c2_valley' }, trigger: 'auto', script: 'c2_valleyIn' }] },
  {
    id: 'stone2', x: 14, y: 8,
    pages: [{ cond: { chapterMin: 2, control: 'gamtu', notFlag: 'c2_stone' }, trigger: 'touch', script: ['감투: 흥, 이 정도 징검돌쯤이야. …꼬리털이 좀 쭈뼛하긴 하지만.', ['flag', 'c2_stone']] }],
  },
  { id: 'log', x: 16, y: 10, pages: [{ cond: { chapterMin: 2, notFlag: 'c2_bridge' }, sprite: 'log', noTurn: true, script: 'c2_log' }] },
  ...[13, 14, 15].map((x) => ({ id: 'plank' + x, x, y: 9, pages: [{ cond: { flag: 'c2_bridge' }, sprite: 'plank', below: true, through: true, bridge: true, trigger: 'none' }] })),
  { id: 'caveMouth', x: 26, y: 8, pages: [{ cond: { chapterMin: 2 }, warp: ['cave1', 13, 22, 'up', { se: 'whoosh' }] }] },
  {
    id: 'bankHint', x: 12, y: 9,
    pages: [{ cond: { chapterMin: 2, notFlag: 'c2_bridge', control: 'jaehee' }, trigger: 'action', script: ['재희: 물살이 세다. 건너편 통나무를 넘어뜨리면 다리가 될 텐데…. (C 키로 감투를 움직여 보자)'] }],
  },
]);

/* ---------- 동굴 입구 ---------- */
GameData.addEvents('cave1', [
  { id: 'cave1In', x: 0, y: 0, pages: [{ cond: { chapterMin: 2, notFlag: 'c2_cave_in' }, trigger: 'auto', script: 'c2_caveIn' }] },
  { id: 'kkamEv', x: 7, y: 18, pages: [{ cond: { chapterMin: 2, notFlag: 'c2_kkam' }, sprite: 'firefly', dir: 'down', noTurn: true, light: 16, script: 'c2_kkam' }] },
  {
    id: 'sobZone', x: 16, y: 15, area: [2, 1],
    pages: [{ cond: { chapterMin: 2, notFlag: 'c2_kkam' }, trigger: 'touch', priority: 1, script: ['…훌쩍… 훌쩍….', '재희: 어디서 우는 소리가 들려. 왼쪽 안쪽이야.', ['move', 'player', 'D']] }],
  },
  { id: 'mirrorIn', x: 16, y: 12, area: [2, 1], pages: [{ cond: { chapterMin: 2, flag: 'c2_kkam', notFlag: 'c2_mirror_in' }, trigger: 'touch', script: 'c2_mirrorIn' }] },
  { id: 'beamSrc', x: 2, y: 10, pages: [{ cond: { chapterMin: 2 }, sprite: 'lightCrack', beam: 'right', noTurn: true, light: 30, trigger: 'none' }] },
  ...[['m1', 7, 10, 'c2m1'], ['m2', 7, 4, 'c2m2'], ['m3', 12, 4, 'c2m3']].map(([id, x, y, v]) => ({
    id, x, y,
    pages: [
      { cond: { chapterMin: 2, var: [v, '!=', 1] }, sprite: 'mirrorA', mirror: v, noTurn: true, light: 12, script: [['var', v, 'toggle'], ['se', 'push']] },
      { cond: { chapterMin: 2, var: [v, '==', 1] }, sprite: 'mirrorB', mirror: v, noTurn: true, light: 12, script: [['var', v, 'toggle'], ['se', 'push']] },
    ],
  })),
  {
    id: 'crystal', x: 12, y: 8,
    pages: [
      { cond: { chapterMin: 2 }, sprite: 'crystal', beamTarget: 'c2_crystal', noTurn: true, light: 14, script: ['수정이다. 빛을 받으면 반응할 것 같다.'] },
      { cond: { flag: 'c2_crystal' }, sprite: 'crystalLit', beamTarget: 'c2_crystal', noTurn: true, light: 44, script: ['수정이 환하게 빛나고 있다.'] },
    ],
  },
  ...[17, 18].map((x) => ({ id: 'gate' + x, x, y: 2, pages: [{ cond: { chapterMin: 2, notFlag: 'c2_crystal' }, sprite: 'gateRock', noTurn: true, script: ['단단한 바위문이다. 수정이 빛나면 열린다고 했다.'] }] })),
  { id: 'gateAuto', x: 0, y: 1, pages: [{ cond: { flag: 'c2_crystal', notFlag: 'c2_gate' }, trigger: 'auto', script: 'c2_gateOpen' }] },
  { id: 'toCave2', x: 17, y: 0, area: [2, 1], pages: [{ cond: { flag: 'c2_crystal' }, warp: ['cave2', 13, 20, 'up', { se: 'whoosh' }] }] },
]);

/* ---------- 동굴 깊은 곳 ---------- */
{
  const BAT = (id, x, y, route, chase) => ({
    id, x, y,
    pages: [{ cond: { chapterMin: 2, notFlag: 'c2_climax' }, sprite: 'bat', through: true, trigger: 'none', catch: true, light: 10, script: 'c2_bat', move: { type: 'patrol', route, speed: 2.2, wait: 0.1, chase } }],
  });
  GameData.addEvents('cave2', [
    { id: 'cave2In', x: 0, y: 0, pages: [{ cond: { chapterMin: 2, notFlag: 'c2_cave2_in' }, trigger: 'auto', script: 'c2_cave2In' }] },
    BAT('b1', 8, 16, 'DDUU', 1),
    BAT('b2', 11, 18, 'UUDD', 1),
    BAT('b3', 5, 12, 'DDDUUU', 0),
    { id: 'climaxZone', x: 3, y: 10, area: [4, 1], pages: [{ cond: { chapterMin: 2, notFlag: 'c2_climax' }, trigger: 'touch', script: 'c2_climax' }] },
    { id: 'frag2', x: 25, y: 6, pages: [{ cond: { chapterMin: 2, notFlag: 'c2_frag' }, sprite: 'fragment', offset: [0, -8], through: true, above: true, light: 40, trigger: 'touch', script: 'c2_fragment' }] },
    { id: 'exitUp', x: 25, y: 1, pages: [{ cond: { flag: 'c2_frag' }, trigger: 'touch', script: 'c2_exit' }] },
    {
      id: 'exitDown2', x: 13, y: 21, area: [2, 1],
      pages: [
        { cond: { chapterMin: 2 }, warp: ['cave1', 17, 1, 'down', { se: 'whoosh' }] },
        { cond: { flag: 'c2_climax' }, trigger: 'touch', priority: 1, script: ['감투: 돌아가는 길은 너무 멀어. 위쪽 바람 들어오는 틈으로 나가자!', ['move', 'player', 'U']] },
      ],
    },
  ]);
}

/* ---------- 회상: 어린 순덕과 촛불 (할머니 집) ---------- */
GameData.addEvents('house', [
  { id: 'memSoondeok', x: 8, y: 4, pages: [{ cond: { flag: 'c2_mem', notFlag: 'c2_memdone' }, sprite: 'littleSoondeok', dir: 'right', noTurn: true, trigger: 'none' }] },
  { id: 'memSib1', x: 10, y: 4, pages: [{ cond: { flag: 'c2_mem', notFlag: 'c2_memdone' }, sprite: 'sibling1', dir: 'left', noTurn: true, trigger: 'none' }] },
  { id: 'memSib2', x: 9, y: 5, pages: [{ cond: { flag: 'c2_mem', notFlag: 'c2_memdone' }, sprite: 'sibling2', dir: 'up', noTurn: true, trigger: 'none' }] },
  { id: 'memCandle', x: 9, y: 4, pages: [{ cond: { flag: ['c2_mem', 'c2_candle'], notFlag: 'c2_memdone' }, sprite: 'candle', offset: [0, -6], above: true, noTurn: true, light: 60, trigger: 'none' }] },
]);
