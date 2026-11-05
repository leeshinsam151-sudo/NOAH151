/*
 * 숨은 감투 찾기 (수집 요소, 1장부터)
 * 마을 곳곳의 장독·덤불·상자 옆으로 치즈색 꼬리가 살랑거린다. 조사하면 따라오던 감투가
 * 도깨비감투를 쓴 것처럼 "펑" 사라졌다가 그 뒤에서 튀어나온다. 10군데를 모두 찾으면 작은 선물.
 * 자리 추가: SPOTS 에 [맵, x, y, 종류(jar/bush/box), [대사...]] 를 더하고 TOTAL 을 맞춘다.
 */
(function () {
  const SPOTS = [
    ['village', 16, 7, 'bush', ['감투: 개울 소리 들으면서 숨는 게… 제일 무섭고 제일 재밌어.']],
    ['village', 24, 17, 'jar', ['재희: 장독 뒤에서 뭐 해?', '감투: 된장 냄새 맡고 있었어. …할머니한텐 비밀이야.']],
    ['village', 31, 21, 'box', ['감투: 상자는 고양이의 집이야. 이건 법이야.', '재희: 누가 정했는데?', '감투: 고양이가.']],
    ['village', 11, 25, 'bush', ['재희: 꼬리 다 보였어.', '감투: 꼬리는… 숨는 법을 아직 몰라. 말을 안 들어.']],
    ['village', 35, 26, 'jar', ['감투: 장독 옆은 시원해. 여름엔 장독이 최고야.', '재희: 그냥 더워서 숨은 거구나.']],
    ['busstop', 2, 6, 'box', ['감투: 버스 또 오면 이 상자에 숨으려고 연습했어.', '재희: …이동장 싫어서 그렇지?', '감투: …응.']],
    ['forest', 3, 12, 'bush', ['감투: 숲에서 숨는 건 그림자한테 배웠… 아니다. 그건 무서웠어. 취소.']],
    ['valley', 24, 4, 'bush', ['감투: 깜빡이가 여기 숨으면 아무도 못 찾는댔어.', '재희: 찾았는데?', '감투: 깜빡이가 거짓말했네.']],
    ['school', 2, 4, 'box', ['감투: 엄마도 어릴 때 여기서 숨바꼭질했을까?', '재희: …했을 것 같아. 술래는 맨날 엄마였을 거야.']],
    ['school', 22, 12, 'jar', ['감투: 분교 장독엔 옛날 냄새가 나. …할머니 냄새 같기도 하고.']],
  ];
  const TOTAL = SPOTS.length;
  const SPR = { jar: ['hideJar', 'jarPlain', '장독'], bush: ['hideBush', 'bushPlain', '덤불'], box: ['hideBox', 'boxPlain', '나무 상자'] };

  GameData.defineItems({
    paperHat: { name: '종이 도깨비감투', desc: '숨은 감투를 모두 찾은 증표. 재희가 접어 준 고깔모자. 감투에게는 조금 크다.' },
  });

  GameData.defineScripts({
    hide_pop: [
      ['emote', 'player', '?'],
      '재희: 어? 저 치즈색 꼬리…. 감투?',
      '감투: 응? 나 여기 있는데?',
      ['se', 'whoosh'],
      ['sparkle', 'gamtu'],
      ['hide', 'gamtu', { fade: 200 }],
      ['wait', 300],
      '펑! 감투가 감쪽같이 사라졌다.',
      ['se', 'meow'],
      ['sparkle', 'self'],
      ['emote', 'self', '!', { silent: true }],
      '감투: 짜잔! …아, 또 나도 모르게 사라져 버렸어.',
    ],
    hide_after: [
      ['show', 'gamtu', { fade: 300 }],
      ['sparkle', 'gamtu'],
      ['var', 'hidden', '+', 1],
      ['se', 'item'],
      ['js', (s, G) => G.dialog.toast(`숨은 감투 ${s.vars.hidden} / ${TOTAL}`)],
      ['if', { var: ['hidden', '==', 1] }, ['감투: 헤헤. 마을 여기저기 내가 숨을 데가 더 있어. 꼬리 보이면 찾아봐!']],
      ['if', { var: ['hidden', '>=', TOTAL] }, [['call', 'hide_reward']]],
    ],
    hide_reward: [
      ['js', (s) => { s.vars.hideBgm = s.bgm || ''; }],
      ['bgm', 'brave', 600],
      '재희: 다 찾았다! 숨은 감투 열 마리!',
      '감투: 한 마리야. 나는 한 마리야.',
      '재희: 상으로 이거 줄게. 신문지로 접은… 도깨비감투!',
      ['item', 'paperHat'],
      ['emote', 'gamtu', '♥'],
      '감투: …커. 눈까지 내려와. 앞이 하나도 안 보여.',
      '재희: 그럼 이제 진짜로 안 보이네. 도깨비감투 맞네!',
      '감투: …헤헤. 그럼 상으로 내 배 만지게 해 줄게. 딱 3초.',
      ['se', 'purr'],
      '그르릉…. 3초는 30초가 되었다.',
      ['js', (s, G) => {
        s.bgm = s.vars.hideBgm || null;
        if (s.bgm) G.audio.playBgm(s.bgm);
        else G.audio.stopBgm();
      }],
    ],
  });

  SPOTS.forEach(([map, x, y, kind, lines], i) => {
    const flag = 'hide' + (i + 1);
    const [tailSpr, plainSpr, name] = SPR[kind];
    GameData.addEvents(map, [
      {
        id: 'hideSpot' + (i + 1),
        x, y,
        pages: [
          { sprite: plainSpr, noTurn: true, trigger: 'action', script: [`평범한 ${name}다.`] },
          {
            cond: { chapterMin: 1, notFlag: [flag, 'solo', 'gamtuLeads'], inParty: 'gamtu', control: 'jaehee' },
            sprite: tailSpr, noTurn: true, trigger: 'action',
            script: [['call', 'hide_pop'], ...lines, ['flag', flag], ['call', 'hide_after']],
          },
        ],
      },
    ]);
  });
})();
