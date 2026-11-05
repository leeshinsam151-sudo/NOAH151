/*
 * 3장 · 시계탑의 부엉이
 * 감투가 넘는 무서운 것: 높은 곳
 * 성장: 처음엔 들보 앞에서 다리가 굳어 한 발짝도 못 간다 → 들보를 스스로 건너 재희를 꼭대기로 데려간다
 * 흐름: 시간을 잊은 마을 → 느티나무 → 옛 분교(교실 낙서·칠판 단서, 보리) → 시계탑 1층 톱니바퀴 퍼즐
 *      → 2층 들보와 부엉이 똑딱 선생 → 들보 앞의 용기(심장 박자) → 손잡이·다리 → 꼭대기 시계 맞추기(오후 4시)
 *      → 기억 조각 ③(어린 엄마와 할머니) → 그날 밤 엄마와의 전화
 */
GameData.defineChapter({ num: 3, id: 'chapter3', title: '3장 · 시계탑의 부엉이', start: 'c3_start' });

GameData.defineSprites({
  littleMom: { type: 'human', hair: '#3a2a1e', cloth: '#78c88c', pants: '#5aa86e', style: 'pigtail', ribbon: '#ff6f91', shoes: '#ffffff' },
});
GameData.defineCharacters({
  '똑딱 선생': { sprite: 'owl', color: '#e8c890', voice: 0.75 },
  어린엄마: { display: '어린 엄마', sprite: 'littleMom', color: '#b8f0c8', voice: 1.3 },
  엄마: { color: '#ffd0e0', voice: 1.0, portrait: false },
});
GameData.defineItems({
  fragment3: { name: '기억 조각 · 세 번째', desc: '째깍째깍, 작은 시계 소리가 나는 조각.', icon: 'fragment' },
});

GameData.scripts.talk_gamtu_c02 = GameData.scripts.talk_gamtu;
GameData.defineScripts({
  talk_gamtu: [
    ['if', { chapterMin: 3 }, [
      ['if', { flag: 'c3_frag' }, ['감투: 들보 건널 때… 사실 눈 반쯤 감고 건넜어. 비밀이야.'], [
        ['if', { ability: 'beam' }, ['감투: 다리가 아직 젤리 같아. 좀만 쉬었다 가자.'], ['감투: 시계탑… 아래에서 올려다만 봐도 목이 아파. 꼭대기는 진짜 싫어.']],
      ]],
    ], [['call', 'talk_gamtu_c02']]],
  ],

  /* 감투가 들보에 다가갈 때 (아직 '들보 걷기'를 못 할 때) */
  fear_height: [
    ['if', { flag: 'c3_owl', notFlag: 'c3_climax' }, [['call', 'c3_climax']], [
      ['emote', 'player', '!'],
      ['se', 'scared'],
      ['shake', 2, 600],
      ['anim', 'player', 'shiver', 900],
      '감투: 아, 아래 봤어…. 세상이 빙글빙글 돌아…. 못 가! 절대 못 가!',
    ]],
  ],
  jaehee_beam: [
    '재희: 들보가 너무 좁아. 사람은 못 건너겠어.',
    ['if', { flag: 'c3_owl', noAbility: 'beam' }, ['재희: (…감투라면 건널 수 있을지도. C 키로 감투를 움직여 보자.)']],
  ],

  c3_start: [
    ['chapterCard', '3장', '시계탑의 부엉이'],
    ['flag', 'c3_started'],
    ['bgm', 'village', 1500],
    ['fadeIn', 1200],
    '다음 날. 그런데 마을이 어딘가 이상하다.',
    ['se', 'caw'],
    '꼬끼오오오—! 해가 머리 위에 떴는데, 이제야 닭이 울었다.',
    ['move', 'player', 'U', { speed: 3 }],
    ['face', 'player', 'left'],
    '할머니 : 재희야, 지금 몇 시고? 할미 시계가 멈췄네. …아침 먹었나? 점심 먹었나?',
    '재희: 할머니, 지금 아침이야.',
    '할머니 : 그렇나? 그럼 아침을 두 번 먹어도 되겠네. 허허.',
    '감투: (재희야, 그럼 나도 아침 두 번 먹어도 돼?)',
    '재희: (안 돼.)',
    ['goal', '느티나무 할아버지께 여쭤보자'],
    ['autosave'],
  ],

  c3_tree: [
    '느티나무: 회색 손님이 지난밤 서쪽 옛 분교 쪽으로 지나갔다. 그 뒤로 분교 시계탑이 멈추고, 마을 사람들도 시간을 잊어 가고 있지.',
    '느티나무: 세 번째 조각은 그 [시계탑 꼭대기]에 있다.',
    '감투: 꼭대기…? 시계탑 꼭대기면… 엄청 높은 데잖아요.',
    '느티나무: 그렇지. 아주 높지.',
    '감투: 저, 높은 데 진짜 진짜 싫어해요. 아래를 보면 세상이 빙글빙글 돌아요.',
    '느티나무: 허허. 높은 곳에선 아래가 아니라 가야 할 곳을 보는 게다.',
    '느티나무: 마을 서쪽 끝 길로 가거라. 탑에는 시간을 잊은 늙은 부엉이가 살고 있을 게다.',
    ['flag', 'c3_tree'],
    ['goal', '마을 서쪽 끝 길로 옛 분교에 가자'],
  ],

  c3_schoolIn: [
    '풀이 무성한 운동장. 녹슨 그네가 바람에 끼익끼익 흔들린다.',
    '재희: 여기가 엄마가 다녔던 학교래. 할머니가 그랬어.',
    '감투: 저기… 저 높은 게 시계탑이야? …꼭대기가 구름에 닿을 것 같아.',
    '재희: 그렇게 높진 않아.',
    '감투: 고양이한테는 높아!',
    ['se', 'bark'],
    '보리: 월! 나도 왔어!',
    '보리: 깍순이가 너희 분교 간다길래 따라왔지. 높은 데는 내 담당 아니지만, 아래는 내가 지킬게!',
    ['flag', 'c3_school'],
    ['goal', '교실을 둘러보고 시계탑으로 (탑 문은 오른쪽 위)'],
  ],

  c3_desk: [
    '책상 위에 연필로 꾹꾹 눌러 쓴 낙서가 있다.',
    '"순덕이 딸 여기 앉았음. 커서 서울 갈 거임."',
    ['emote', 'jaehee', '!'],
    '재희: …순덕이 딸이면… 엄마다! 우리 엄마가 이 자리에 앉았었구나.',
    '감투: 재희 엄마도 낙서했구나. 재희랑 똑같네.',
    '재희: 나 낙서 안 해!',
    '감투: 재희 수학책 맨 뒷장.',
    '재희: …….',
    ['wait', 600],
    '재희: (엄마가 이 작은 의자에 앉아서, 서울 가는 꿈을 꿨구나.)',
    ['flag', 'c3_desk'],
  ],

  c3_board: [
    '칠판에 희미하게 글씨가 남아 있다.',
    '"[하교 시간 — 오후 4시]. 부모님이 데리러 오실 때까지 운동장에서 기다리기."',
    ['flag', 'c3_clue'],
  ],

  c3_tower1In: [
    '시계탑 안. 커다란 톱니바퀴들이 바닥에 흩어져 있다. 위쪽은 컴컴해서 끝이 보이지 않는다.',
    '재희: 저기 도르래 바구니가 있어. 위층으로 올라가는 건가 봐. 그런데 꿈쩍도 안 해.',
    '감투: 바닥에 동그란 자국이 세 개 있어. 저기 톱니바퀴를 끼우면 되는 거 아닐까?',
    '(톱니바퀴는 재희가 밀 수 있습니다. 노란 표시 위로 밀어 넣으세요. 막히면 오른쪽 아래 기름통을 조사하면 처음 상태로 돌아갑니다.)',
    ['flag', 'c3_tower1_in'],
    ['goal', '톱니바퀴 세 개를 노란 표시 위로 밀어 넣자'],
  ],

  c3_gearsDone: [
    ['se', 'push'],
    ['shake', 1, 600],
    '끼릭… 끼릭… 덜컹! 톱니바퀴가 맞물려 돌아가기 시작했다!',
    '재희: 됐다! 이제 바구니가 움직일 거야.',
    '감투: 바구니… 저거 타고 위로 올라가는 거야? 아래가 보이는 바구니야?',
    ['flag', 'c3_gears'],
    ['goal', '도르래 바구니를 타고 위층으로 (오른쪽 위)'],
  ],

  c3_basketUp: [
    ['if', { flag: 'c3_gears' }, [
      '재희: 타자, 감투!',
      '감투: 눈 감고 탈게. 다 올라가면 말해 줘.',
      ['fadeOut', 500],
      ['se', 'push'],
      ['wait', 600],
      ['se', 'push'],
      ['warp', 'tower2', 3, 11, 'up', { fade: false }],
      ['fadeIn', 500],
    ], ['도르래 바구니다. 줄은 위로 이어져 있지만 꿈쩍도 하지 않는다. 톱니바퀴가 빠져 있는 것 같다.']],
  ],

  c3_tower2In: [
    '2층. 바닥 가운데가 뻥 뚫려 있어, 까마득한 아래로 톱니바퀴들이 돌아가는 게 보인다.',
    '감투: …보지 말걸. 아래 보지 말걸.',
    ['anim', 'gamtu', 'shiver', 1200],
    '재희: 건너편으로 가는 건… 저 좁은 들보 하나뿐이네.',
    ['se', 'caw'],
    '???: 부엉— 부엉— 지금은… 부엉 시 부엉 분이다!',
    ['emote', 'owl', '!'],
    ['flag', 'c3_tower2_in'],
    ['goal', '부엉이에게 말을 걸어 보자'],
  ],

  c3_owl: [
    '똑딱 선생: 에헴! 지금은 부엉 시 부엉 분이다. 아니, 열세 시… 아니, 몇 시였더라.',
    '재희: 안녕하세요. 혹시 시계탑을 지키는 부엉이세요?',
    '똑딱 선생: 그래, 나는 똑딱 선생. 이 탑의 시계와 함께 육십 년을 살았지. 종이 칠 때마다 시간을 외워 왔다네.',
    '똑딱 선생: 그런데 며칠 전 잿빛 안개가 탑을 지나간 뒤로 시계가 멈췄어. 그 뒤로 내 머릿속 시간도 같이 멈춰 버렸지.',
    '감투: (재희야, 부엉이 안경 쓴 거 봐. …근데 안경이 거꾸로야.)',
    '똑딱 선생: 기억나는 건 단 하나. 매일 오후, 종이 울리면 어떤 아주머니가 탑 아래로 딸아이를 데리러 오셨지. 그 종이 몇 번 울렸는지는… 흐음.',
    '재희: (아주머니랑 딸…. 혹시 할머니랑 엄마?)',
    '똑딱 선생: 꼭대기 시계를 다시 움직이려면, 건너편 손잡이를 당겨 접힌 다리를 내려야 하네. 그런데 거기로 가는 길은 저 들보 하나뿐이지.',
    '똑딱 선생: 이 늙은 날개로는 손잡이를 당길 힘이 없고… 사람에겐 들보가 너무 좁고….',
    ['face', 'owl', 'gamtu'],
    '똑딱 선생: …고양이라면 건널 수 있겠군.',
    ['emote', 'gamtu', '!'],
    '감투: 나, 나? 저 위를? 아래가 까마득한데?',
    '똑딱 선생: 건너편에서 기다리겠네. 부엉—',
    ['se', 'whoosh'],
    ['move', 'owl', 'RRRRRRRRRRRR', { speed: 5 }],
    ['flag', 'c3_owl'],
    ['goal', '감투로 들보를 건너 건너편 손잡이를 당기자 (C 키)'],
  ],

  c3_climax: [
    ['flag', 'c3_climax'],
    ['setPos', 'jaehee', 4, 7, 'right'],
    ['face', 'gamtu', 'right'],
    ['stopBgm', 1200],
    '감투: (…밑이 까마득해. 저 아래 톱니바퀴가 꼭 입을 벌린 것 같아.)',
    ['shake', 2, 800],
    ['anim', 'gamtu', 'shiver', 2000],
    '감투: (발을 떼면… 떨어질 것 같아.)',
    '— 그때, 아래층 입구에서 보리의 커다란 목소리가 탑 안을 울렸다.',
    '보리: 감투야아! 떨어지면 내가 받아 줄게! 진짜야! 나 받는 거 엄청 잘해!',
    '감투: (…보리는 탑 밖에 있잖아. 거리가 하나도 안 맞잖아.)',
    '감투: (…그래도 좀 웃기다.)',
    '똑딱 선생: 에헴! 고양이 군. 아래를 보지 말고, 가야 할 곳만 보거라. 내가 여기서 날개를 펴고 있으마.',
    '재희: 감투야. 무서우면 안 해도 돼. 다른 방법 찾아볼게.',
    '감투: …….',
    '감투: 다른 방법 없잖아. 재희가 꼭대기에 가야 할머니 기억을 찾지.',
    ['choice', ['아래를 본다', '건너편만 본다'], [
      [
        ['shake', 3, 900],
        ['se', 'scared'],
        '감투: (으으… 빙글빙글….)',
        ['wait', 600],
        '감투: (…아니야. 아래 말고. 똑딱 선생님만 보자.)',
      ],
      ['감투: (건너편… 똑딱 선생님 안경만 보자.)'],
    ]],
    ['minigame', 'heartbeat', {
      title: '들보 끝에서, 감투의 심장이 쿵쾅거린다…!',
      hits: 4,
      speed: 1.75,
      zone: 0.13,
      lines: ['앞만 보고…', '한 발…', '두 발…', '안경만 보자…!', '건너간다!'],
      missLines: ['아래 봤어…! 빙글빙글…', '다시, 앞만 보자…', '한 번만 더…!'],
      doneLine: '……!',
    }],
    ['bgm', 'brave', 0],
    ['se', 'bell'],
    ['flash', '#fff6d0', 600],
    ['ability', 'beam', '들보 걷기'],
    '감투가 앞발을 들보 위에 올렸다. 한 발, 또 한 발.',
    ['move', 'gamtu', 'RRRRRRRRR', { speed: 2.2 }],
    ['courage', 1],
    '감투: …건넜어?',
    '똑딱 선생: 건넜지! 에헴, 훌륭한 걸음걸이였네.',
    '감투: …나 지금 다리가 젤리 같아.',
    '재희: 감투야! 최고야!',
    ['goal', '손잡이를 당겨 다리를 내리자'],
  ],

  c3_lever: [
    ['if', { control: 'gamtu' }, [
      '감투: 이걸… 당기면 되는 거지? 영차!',
      ['se', 'thud'],
      ['shake', 3, 700],
      ['flag', 'c3_lever'],
      '끼이이익— 쿵! 접혀 있던 나무 다리가 내려왔다!',
      '감투: 재희야! 건너와! …천천히!',
      ['goal', '재희에게 돌아가(C 키) 다리를 건너 꼭대기로 (오른쪽 위 문)'],
    ], ['녹슨 손잡이다.']],
  ],

  c3_topIn: [
    '탑 꼭대기. 커다란 시계의 뒤편이다. 시곗바늘이 멈춰 있다.',
    '똑딱 선생: 에헴! 바늘을 맞추고 태엽을 감으면 시계가 다시 움직일 걸세. 몇 시에 맞춰야 할지가 문제지만….',
    '재희: (그 아주머니가 딸을 데리러 오던 시간….)',
    ['if', { flag: 'c3_clue' }, ['재희: (교실 칠판에 "하교 시간 오후 4시"라고 적혀 있었어!)'], ['감투: (아래 교실에 뭔가 단서가 있지 않을까? 분교 교실 칠판 같은 데.)']],
    ['flag', 'c3_top_in'],
    ['goal', '시계 바늘을 맞추자 (시계 앞에서 조사)'],
  ],

  c3_clockPuzzle: [
    ['if', { flag: 'c3_clock' }, ['시계가 째깍째깍 힘차게 움직이고 있다.'], [
      ['minigame', 'clock', { title: '시침을 몇 시에 맞출까?', start: 12, answer: 4 }],
      ['if', { var: ['mg', '==', 4] }, [['call', 'c3_clockDone']], [
        ['if', { var: ['mg', '==', 0] }, ['재희: (조금 더 생각해 보자.)'], [
          ['se', 'miss'],
          '덜컥. 바늘이 다시 제자리로 돌아갔다.',
          '똑딱 선생: 흐음, 그 시간이 아니야. 아주머니가 딸아이를 데리러 오던 시간… 아이들이 학교를 마치는 시간이었지.',
          ['if', { notFlag: 'c3_clue' }, ['감투: (분교 교실 칠판에 뭔가 적혀 있지 않을까? 다시 내려가 볼까….)']],
        ]],
      ]],
    ]],
  ],

  c3_clockDone: [
    ['se', 'push'],
    '끼릭… 끼릭… 째깍.',
    ['flag', 'c3_clock'],
    ['sprite', 'clock', 'clockFace4'],
    ['wait', 600],
    ['se', 'bell'],
    ['shake', 1, 300],
    '댕—',
    ['se', 'bell'],
    '댕—',
    ['se', 'bell'],
    '댕—',
    ['se', 'bell'],
    '댕—',
    '똑딱 선생: …네 시. 그래, 네 시였어!',
    '똑딱 선생: 아, 다 생각났네! 순덕 씨! 순덕 씨가 매일 네 시면 딸아이 손을 잡고 이 탑 아래서 종소리를 기다렸지!',
    '재희: 순덕… 우리 할머니예요!',
    '똑딱 선생: 허허, 그렇구먼. 그 딸아이 눈매를 똑 닮았어.',
    '시계 앞에 작은 빛 조각이 떠올랐다.',
    ['goal', '기억 조각을 줍자'],
  ],

  c3_fragment: [
    '재희가 빛 조각에 손을 뻗자, 째깍째깍 작은 시계 소리가 들려왔다.',
    ['item', 'fragment3'],
    ['flag', 'c3_frag'],
    ['se', 'sparkle'],
    ['fadeOut', 1400, '#ffffff'],
    ['call', 'c3_memory'],
  ],

  c3_memory: [
    ['flag', 'c3_mem'],
    ['hideParty', true],
    ['tone', 'memory', 0],
    ['gray', 0, 0],
    ['warp', 'towerTop', 6, 4, 'up', { fade: false }],
    ['weather', 'dust'],
    ['bgm', 'memory', 0],
    ['fadeIn', 1800],
    '— 할머니의 기억 —',
    '…아주 오래전 가을. 분교 시계탑 꼭대기로 가는 계단.',
    '어린엄마: 엄마, 무서워… 너무 높아. 밑에 보니까 다리가 덜덜 떨려.',
    '젊은할머니: 아래 보지 말고, 엄마 손만 봐라.',
    ['move', 'memGm3', 'U', { speed: 1.2 }],
    ['move', 'memMom', 'U', { speed: 1.2 }],
    '젊은할머니: 봐라, 한 칸. 또 한 칸.',
    ['move', 'memGm3', 'U', { speed: 1.2 }],
    ['move', 'memMom', 'U', { speed: 1.2 }],
    '젊은할머니: 다 왔다.',
    ['face', 'memMom', 'up'],
    '어린엄마: 와아… 우리 마을이 다 보여! 우리 집 지붕도 보여!',
    '젊은할머니: 이 시계가 오후 네 시를 치면, 엄마가 니 데리러 학교 오는 거다. 매일매일.',
    ['wait', 700],
    ['face', 'memMom', 'right'],
    '어린엄마: …엄마.',
    '어린엄마: 나 커서 서울 가도… 이 시계 소리 들리면 엄마 생각할게.',
    ['wait', 1200],
    '젊은할머니: …그래.',
    '젊은할머니: 멀리 가도 괜찮다. 시계는 여기서 계속 갈 테니까.',
    '젊은할머니: 엄마도 여기서 계속 기다릴게.',
    ['wait', 1600],
    ['flag', 'c3_memdone'],
    ['fadeOut', 1600, '#ffffff'],
    ['weather', null],
    ['tone', '', 0],
    ['gray', 0.2, 0],
    ['hideParty', false],
    ['warp', 'towerTop', 5, 4, 'up', { fade: false }],
    ['fadeIn', 1600],
    '재희: …엄마도 높은 데 무서워했구나.',
    '감투: 재희 엄마도 겁쟁이였어?',
    '재희: 응. 할머니 손 꼭 잡고 올라왔대.',
    '감투: 그럼 재희 엄마, 할머니, 재희, 나… 다 겁쟁이네.',
    '재희: 겁쟁이 가족이다.',
    '감투: 근데 다 올라왔잖아. 꼭대기까지.',
    '재희: …응.',
    '똑딱 선생: 에헴. 겁쟁이가 올라온 꼭대기가, 원래 제일 높은 법이지.',
    ['wait', 600],
    ['se', 'bell'],
    '댕— 시계탑 종소리가 마을 끝까지 울려 퍼졌다.',
    ['stopBgm', 1600],
    ['fadeOut', 1600],
    ['call', 'c3_end'],
  ],

  c3_end: [
    ['flag', 'c3_night'],
    ['tone', 'night', 0],
    ['warp', 'house', 10, 3, 'up', { fade: false }],
    ['bgm', 'night', 0],
    ['fadeIn', 1500],
    '그날 밤. 마을 사람들은 시간을 되찾았다. 이장님 시계도, 할머니 시계도 다시 째깍째깍 움직였다.',
    '재희는 할머니 집 전화기 앞에 한참을 서 있었다.',
    '감투: …걸 거야?',
    '재희: …응.',
    ['se', 'pop'],
    '뚜르르… 뚜르르….',
    '엄마: 여보세요? …재희야? 이 시간에 웬일이야. 무슨 일 있어?',
    '재희: 아니… 그냥.',
    ['wait', 800],
    '재희: 엄마. 오늘 분교 시계탑에 올라갔어.',
    '엄마: 시계탑? …아직도 있구나, 그 탑. 엄마도 어릴 때 할머니랑 올라갔었는데.',
    '엄마: 엄마 그때 엄청 무서워서 울었다? 할머니 손만 꼭 잡고.',
    '재희: 알아.',
    '엄마: 응? 어떻게 알아?',
    '재희: …비밀.',
    '감투: (비밀.)',
    ['wait', 600],
    '엄마: 재희야, 할머니는 좀 어떠셔? …요즘 깜빡깜빡하신다던데.',
    '재희: 응. 근데 괜찮아. 내가 옆에 있으니까. 감투도 있고.',
    ['wait', 1000],
    ['stopBgm', 1500],
    '재희: …엄마.',
    ['wait', 1300],
    '재희: 보고 싶어.',
    ['wait', 2600],
    '엄마: …….',
    ['wait', 1200],
    ['bgm', 'memory', 2000],
    '엄마: …엄마도.',
    '엄마: 재희야, 엄마도 보고 싶어. 많이.',
    '엄마: 일 끝나면… 꼭 갈게. 꼭.',
    '재희: …응. 약속.',
    ['se', 'purr'],
    '감투가 재희 다리에 몸을 비볐다. 골골골골….',
    ['wait', 900],
    ['stopBgm', 2000],
    ['fadeOut', 2200],
    ['bgm', 'clear', 0],
    ['chapterCard', '3장 끝', '시계탑의 부엉이', { hold: 3800 }],
    ['caption', ['감투의 용기가 또 한 칸 자랐다.'], { hold: 2200 }],
    ['flag', 'c3_end'],
    ['chapter', 4, '4장 · 천둥 치는 밤'],
    ['tone', '', 0],
    ['warp', 'village', 7, 15, 'up', { fade: false }],
    ['goal', ''],
    ['autosave'],
    ['call', 'c4_start'],
  ],
});

/* ---------- 마을 ---------- */
GameData.addEvents('village', [
  {
    id: 'gm3', x: 6, y: 13,
    pages: [
      { cond: { chapterMin: 3, notFlag: 'c4_started' }, sprite: 'grandmaPin', dir: 'right', script: ['할머니 : 시계가 멈추니까 하루가 길어서 좋네. 허허. …그래도 밥때는 알아야 할 텐데.'] },
      { cond: { flag: 'c3_frag', notFlag: 'c4_started' }, sprite: 'grandmaPin', dir: 'right', script: ['할머니 : 분교 종소리 들었나? 아이고, 몇십 년 만에 듣는지.', '할머니 : 저 종이 네 번 치면… 할미가 니 엄마 데리러 학교 가던 시간이다. 허허, 그게 갑자기 생각나네.'] },
    ],
  },
  {
    id: 'zelkova3', x: 16, y: 11, area: [2, 2], offset: [8, 16],
    pages: [
      { cond: { chapterMin: 3, notFlag: 'c4_started' }, sprite: 'zelkova', noTurn: true, script: 'c3_tree' },
      { cond: { chapterMin: 3, flag: 'c3_tree', notFlag: 'c4_started' }, sprite: 'zelkova', noTurn: true, script: ['느티나무: 옛 분교는 마을 서쪽 끝 길을 따라가면 된다.', '느티나무: 높은 곳에선 아래가 아니라, 가야 할 곳을 보거라.'] },
      { cond: { flag: 'c3_frag', notFlag: 'c4_started' }, sprite: 'zelkova', noTurn: true, script: ['느티나무: 종소리가 들리는구나. 마을의 시간이 돌아왔어.', '느티나무: 다음 조각은… 폭풍우 치는 밤에 찾아올 게다. 감투야, 그 밤은 네 기억과도 이어져 있단다.'] },
    ],
  },
  {
    id: 'ijang3', x: 33, y: 15,
    pages: [{
      cond: { chapterMin: 3, notFlag: 'c4_started' }, sprite: 'ijang', dir: 'down',
      script: [['if', { flag: 'c3_frag' }, ['이장님: 분교 종소리가 울리니께 시계가 다시 가더라. 신기한 일이여.'], ['이장님: 내 시계가 멈췄어. 해를 보니 대충 열두 시… 아니 세 시… 아이고 모르겠다.', '이장님: 보리 녀석은 아침부터 분교 쪽으로 뛰어가던디.']]],
    }],
  },
  {
    id: 'bori3', x: 35, y: 13,
    pages: [{ cond: { flag: 'c3_frag', notFlag: 'c4_started' }, sprite: 'boriCollar', move: { type: 'random', radius: 1, wait: 2 }, script: [['se', 'bark'], '보리: 감투! 내가 받아 준다고 한 거 들었지? 나 진짜 받을 수 있었어!', '감투: …탑 밖에서?', '보리: …….'] }],
  },
  {
    id: 'minsu3', x: 16, y: 21,
    pages: [{
      cond: { chapterMin: 3, notFlag: 'c4_started' }, sprite: 'minsu', move: { type: 'random', radius: 2, wait: 2.5 },
      script: [['if', { flag: 'c3_frag' }, ['민수: 누나! 종소리 들었어? 엄마가 이제 학교 늦지 말래. 히잉.'], ['민수: 누나, 지금 학교 끝났어? 아니면 시작했어? 엄마도 모른대!']]],
    }],
  },
  {
    id: 'kkachi3', x: 23, y: 9,
    pages: [{
      cond: { chapterMin: 3, notFlag: 'c4_started' }, sprite: 'magpie',
      script: [['se', 'caw'], ['if', { flag: 'c3_frag' }, ['깍순이: 깍깍! 빅뉴스! 꼬맹이 고양이가 들보를 건넜대! 안경 쓴 부엉이 영감이 동네방네 자랑하고 다녀!'], ['깍순이: 깍깍! 분교 시계탑에 안경 쓴 부엉이 영감이 사는데, 요즘 시간을 몽땅 까먹었대! 깍깍!']]],
    }],
  },
]);

GameData.addEvents('shop', [
  {
    id: 'geumsun3', x: 2, y: 3,
    pages: [{
      cond: { chapterMin: 3, notFlag: 'c4_started' }, sprite: 'geumsun', dir: 'down',
      script: [['if', { flag: 'c3_frag' }, ['금순 아줌마: 시계가 다시 가니까 손님들이 다 제시간에 오네. 호호.'], ['금순 아줌마: 가게 문을 몇 시에 열었더라…. 아이고, 오늘은 그냥 계속 열어 둘래.']]],
    }],
  },
]);

/* ---------- 옛 분교 ---------- */
GameData.addEvents('school', [
  { id: 'schoolIn', x: 0, y: 0, pages: [{ cond: { chapterMin: 3, notFlag: 'c3_school' }, trigger: 'auto', script: 'c3_schoolIn' }] },
  { id: 'towerDoor', x: 16, y: 4, pages: [{ cond: { chapterMin: 3 }, warp: ['tower1', 6, 9, 'up'] }] },
  {
    id: 'boriS', x: 18, y: 9,
    pages: [{ cond: { chapterMin: 3, notFlag: 'c3_frag' }, sprite: 'boriCollar', dir: 'down', move: { type: 'random', radius: 1, wait: 2 }, script: [['se', 'bark'], '보리: 높은 데는 내 담당 아니야! 대신 아래는 철통같이 지킬게! 월!'] }],
  },
  { id: 'swing', x: 12, y: 13, script: ['녹슨 그네. 앉으면 무너질 것 같다.', '감투: 흔들리는 것도 싫어. 높은 것도 싫어. 그네는 둘 다야.'] },
]);

GameData.addEvents('classroom', [
  { id: 'board', x: 4, y: 1, area: [4, 1], pages: [{ cond: { chapterMin: 3 }, script: 'c3_board' }] },
  { id: 'deskMom', x: 6, y: 5, pages: [{ cond: { chapterMin: 3 }, script: 'c3_desk' }] },
  { id: 'desks', x: 2, y: 3, area: [7, 1], script: ['작은 나무 책상. 의자가 무릎보다 낮다.'] },
]);

/* ---------- 시계탑 1층 ---------- */
{
  const GEAR = (id, x, y, gx, gy) => ({
    id, x, y,
    pages: [
      { cond: { chapterMin: 3 }, sprite: 'gear', push: true, trigger: 'none', noTurn: true },
      { cond: { flag: 'c3_gears' }, sprite: 'gear', pos: [gx, gy], trigger: 'none', noTurn: true },
    ],
  });
  GameData.addEvents('tower1', [
    GEAR('gear1', 4, 5, 2, 3),
    GEAR('gear2', 8, 5, 10, 3),
    GEAR('gear3', 6, 8, 6, 6),
    { id: 'tower1In', x: 0, y: 0, pages: [{ cond: { chapterMin: 3, notFlag: 'c3_tower1_in' }, trigger: 'auto', script: 'c3_tower1In' }] },
    { id: 'gearCheck', x: 0, y: 1, pages: [{ cond: { chapterMin: 3, boxesSolved: true, notFlag: 'c3_gears' }, trigger: 'auto', script: 'c3_gearsDone' }] },
    { id: 'basket1', x: 12, y: 2, pages: [{ cond: { chapterMin: 3 }, sprite: 'basket', noTurn: true, script: 'c3_basketUp' }] },
    {
      id: 'oil', x: 12, y: 9,
      pages: [{
        cond: { chapterMin: 3 },
        script: [['if', { flag: 'c3_gears' }, ['기름통이다. 톱니바퀴가 잘 돌아가고 있다.'], [
          '기름통이다. 톱니바퀴를 처음 자리로 되돌릴까?',
          ['choice', ['되돌린다', '그만둔다'], [[['warp', 'tower1', 6, 9, 'up', { reload: true, se: 'push' }]], []]],
        ]]],
      }],
    },
  ]);
}

/* ---------- 시계탑 2층 ---------- */
GameData.addEvents('tower2', [
  { id: 'tower2In', x: 0, y: 0, pages: [{ cond: { chapterMin: 3, notFlag: 'c3_tower2_in' }, trigger: 'auto', script: 'c3_tower2In' }] },
  {
    id: 'owl', x: 4, y: 3,
    pages: [
      { cond: { chapterMin: 3, notFlag: 'c3_owl' }, sprite: 'owl', dir: 'down', noTurn: true, script: 'c3_owl' },
      { cond: { flag: 'c3_owl' }, pos: [16, 3], sprite: 'owl', dir: 'down', noTurn: true, script: [['if', { flag: 'c3_lever' }, ['똑딱 선생: 꼭대기는 저 문 너머 계단 위일세. 에헴.'], ['똑딱 선생: 아래를 보지 말고, 가야 할 곳만 보거라. 에헴.']]] },
    ],
  },
  { id: 'brokenStairs', x: 3, y: 1, script: ['위로 가는 계단이 무너져 있다. 위층으로 가려면 건너편으로 가야 한다.'] },
  {
    id: 'lever', x: 17, y: 8,
    pages: [
      { cond: { chapterMin: 3 }, sprite: 'lever', noTurn: true, script: 'c3_lever' },
      { cond: { flag: 'c3_lever' }, sprite: 'leverOn', noTurn: true, script: ['손잡이가 당겨져 있다. 다리가 내려와 있다.'] },
    ],
  },
  ...[6, 7, 8, 9, 10, 11, 12, 13].map((x) => ({ id: 'bridge' + x, x, y: 9, pages: [{ cond: { flag: 'c3_lever' }, sprite: 'plank', below: true, through: true, bridge: true, trigger: 'none' }] })),
  {
    id: 'topDoor', x: 16, y: 1,
    pages: [
      { trigger: 'touch', script: ['계단으로 가는 문이 잠겨 있다. 옆의 손잡이와 이어져 있는 것 같다.', ['move', 'player', 'D']] },
      { cond: { flag: 'c3_lever' }, warp: ['towerTop', 5, 8, 'up'] },
    ],
  },
  { id: 'basket2', x: 2, y: 12, pages: [{ cond: { chapterMin: 3 }, sprite: 'basket', noTurn: true, script: [['fadeOut', 400], ['se', 'push'], ['warp', 'tower1', 12, 3, 'down', { fade: false }], ['fadeIn', 400]] }] },
]);

/* ---------- 시계탑 꼭대기 ---------- */
GameData.addEvents('towerTop', [
  { id: 'topIn', x: 0, y: 0, pages: [{ cond: { chapterMin: 3, notFlag: 'c3_top_in' }, trigger: 'auto', script: 'c3_topIn' }] },
  {
    id: 'clock', x: 5, y: 1, area: [2, 1], offset: [8, 0],
    pages: [
      { cond: { chapterMin: 3 }, sprite: 'clockFace', noTurn: true, script: 'c3_clockPuzzle' },
      { cond: { flag: 'c3_clock' }, sprite: 'clockFace4', noTurn: true, script: 'c3_clockPuzzle' },
    ],
  },
  { id: 'owlTop', x: 9, y: 3, pages: [{ cond: { flag: 'c3_lever', notFlag: 'c3_mem' }, sprite: 'owl', noTurn: true, script: ['똑딱 선생: 아주머니가 딸을 데리러 오던 시간… 아이들이 학교를 마치는 시간이었지. 에헴.'] }, { cond: { flag: 'c3_memdone' }, sprite: 'owl', noTurn: true, script: ['똑딱 선생: 째깍째깍. 이제야 머리가 맑구먼. 고맙네, 겁쟁이 가족.'] }] },
  { id: 'frag3', x: 6, y: 3, pages: [{ cond: { flag: 'c3_clock', notFlag: 'c3_frag' }, sprite: 'fragment', offset: [0, -6], through: true, trigger: 'touch', script: 'c3_fragment' }] },
  { id: 'memGm3', x: 6, y: 8, pages: [{ cond: { flag: 'c3_mem', notFlag: 'c3_memdone' }, sprite: 'youngGrandma', dir: 'up', noTurn: true, through: true, trigger: 'none' }] },
  { id: 'memMom', x: 5, y: 8, pages: [{ cond: { flag: 'c3_mem', notFlag: 'c3_memdone' }, sprite: 'littleMom', dir: 'up', noTurn: true, through: true, trigger: 'none' }] },
]);

/* ---------- 할머니 집: 전화기 ---------- */
GameData.addEvents('house', [
  { id: 'phone', x: 10, y: 2, pages: [{ cond: { chapterMin: 3 }, sprite: 'phone', noTurn: true, script: [['if', { flag: 'c3_night' }, ['할머니 집 빨간 전화기. 엄마 목소리가 아직 귀에 남아 있는 것 같다.'], ['할머니 집 빨간 전화기. 다이얼을 돌리는 옛날 전화기다.']]] }] },
]);
