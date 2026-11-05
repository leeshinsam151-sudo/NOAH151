/*
 * data/music.js — 배경음악 (8분음표 한 칸 = 토큰 하나)
 * 'c5' 음, '-' 앞 음 늘이기, '.' 쉼표. 드럼 채널: k 킥, x 스네어, h 하이햇
 * wave: square | triangle | sine | sawtooth | noise,  env: 'pluck'(뜯는 소리) 또는 생략(지속음)
 */
(function () {
  const rep = (s, n) => Array(n).fill(s).join(' ');

  const TITLE_MEL = `
    e5 - g5 - c6 - b5 a5   g5 - - - d5 - e5 -   c5 - e5 - a5 - g5 f5   e5 - - - d5 - - -
    c5 - f5 - a5 - g5 f5   e5 - g5 - c6 - - -   d6 - c6 - b5 - g5 -    c6 - - - - - . .`;
  const TITLE_ARP = `
    c4 e4 g4 e4 c4 e4 g4 e4   b3 d4 g4 d4 b3 d4 g4 d4   a3 c4 e4 c4 a3 c4 e4 c4   f3 a3 c4 a3 g3 b3 d4 b3
    f3 a3 c4 a3 f3 a3 c4 a3   c4 e4 g4 e4 c4 e4 g4 e4   d4 f4 a4 f4 g3 b3 d4 b3   c4 e4 g4 c5 g4 e4 c4 .`;
  const TITLE_BASS = `
    c3 - - - - - - -   g2 - - - - - - -   a2 - - - - - - -   f2 - - - g2 - - -
    f2 - - - - - - -   c3 - - - - - - -   d3 - - - g2 - - -   c3 - - - - - . .`;

  GameData.defineMusic({
    /* 타이틀 · 할머니의 노래 (주제 선율) */
    title: {
      bpm: 84,
      channels: [
        { wave: 'triangle', vol: 0.13, env: 'pluck', notes: TITLE_MEL },
        { wave: 'square', vol: 0.025, env: 'pluck', notes: TITLE_ARP },
        { wave: 'triangle', vol: 0.09, notes: TITLE_BASS },
      ],
    },
    /* 회상 — 같은 선율을 오르골처럼 */
    memory: {
      bpm: 66,
      channels: [
        { wave: 'sine', vol: 0.16, env: 'pluck', notes: TITLE_MEL },
        { wave: 'sine', vol: 0.04, env: 'pluck', notes: TITLE_ARP },
      ],
    },
    village: {
      bpm: 116,
      channels: [
        {
          wave: 'square', vol: 0.045, notes: `
          d5 . b4 . g4 a4 b4 d5   e5 - d5 - c5 - b4 -   a4 . f#4 . a4 b4 c5 d5   b4 - - - g4 - . .
          d5 . b4 . g4 a4 b4 d5   e5 - g5 - e5 - c5 -   d5 - c5 - b4 - a4 -      g4 - - - . . d4 .`,
        },
        {
          wave: 'square', vol: 0.022, env: 'pluck', notes: `
          . b3 . d4 . b3 . d4   . c4 . e4 . c4 . e4   . a3 . d4 . a3 . d4   . b3 . d4 . b3 . d4
          . b3 . d4 . b3 . d4   . c4 . e4 . c4 . e4   . a3 . c4 . a3 . f#3  . b3 . d4 . g3 . .`,
        },
        {
          wave: 'triangle', vol: 0.11, notes: `
          g2 . . g2 d3 . . d3   c3 . . c3 g2 . . g2   d3 . . d3 a2 . . a2   g2 . . g2 d3 . b2 .
          g2 . . g2 d3 . . d3   c3 . . c3 e3 . . e3   d3 . . d3 a2 . . f#2  g2 . . . d2 . . .`,
        },
        { wave: 'noise', vol: 0.035, notes: rep('k . h . x . h .', 8) },
      ],
    },
    house: {
      bpm: 88,
      channels: [
        {
          wave: 'triangle', vol: 0.13, env: 'pluck', notes: `
          a4 - c5 - f5 - e5 d5   d5 - - - c5 - bb4 -   g4 - bb4 - e5 - d5 c5   a4 - - - - - . .
          f4 - a4 - d5 - c5 bb4  a4 - g4 - f4 - g4 -   a4 - g4 - e4 - g4 -     f4 - - - - - . .`,
        },
        {
          wave: 'square', vol: 0.022, env: 'pluck', notes: `
          f3 a3 c4 a3 f3 a3 c4 a3   bb2 d3 f3 d3 bb2 d3 f3 d3   c3 e3 g3 e3 c3 e3 g3 bb3   f3 a3 c4 a3 f3 a3 c4 a3
          d3 f3 a3 f3 d3 f3 a3 f3   bb2 d3 f3 d3 bb2 d3 f3 d3   c3 e3 g3 e3 c3 e3 g3 e3    f3 a3 c4 a3 f3 . . .`,
        },
      ],
    },
    night: {
      bpm: 66,
      channels: [
        {
          wave: 'sine', vol: 0.13, env: 'pluck', notes: `
          a4 - c5 - e5 - - -   f5 - e5 - c5 - - -   d5 - b4 - g4 - - -   a4 - - - - - - -
          c5 - a4 - f4 - a4 -  g4 - - - e4 - - -    f4 - a4 - d5 - c5 -  b4 - - - g#4 - - -`,
        },
        {
          wave: 'triangle', vol: 0.05, env: 'pluck', notes: `
          a2 e3 a3 e3 a2 e3 a3 e3   f2 c3 f3 c3 f2 c3 f3 c3   g2 d3 g3 d3 g2 d3 g3 d3   a2 e3 a3 e3 a2 e3 a3 e3
          f2 c3 f3 c3 f2 c3 f3 c3   c3 g3 c4 g3 c3 g3 c4 g3   d3 a3 d4 a3 d3 a3 d4 a3   e2 b2 e3 g#3 e3 b2 e2 .`,
        },
      ],
    },
    /* 동굴 — 물방울 같은 뜯는 소리와 낮은 울림 (2장) */
    cave: {
      bpm: 72,
      channels: [
        {
          wave: 'sine', vol: 0.12, notes: `
          d2 - - - - - - -   d2 - - - - - - -   bb1 - - - - - - -   a1 - - - - - - -
          d2 - - - - - - -   d2 - - - - - - -   g1 - - - - - - -    a1 - - - - - - -`,
        },
        {
          wave: 'triangle', vol: 0.05, env: 'pluck', notes: `
          . . a4 . . d5 . .   . f5 . . e5 . . .   . . d5 . . f4 . .   . e4 . . . . c#5 .
          . . a4 . . d5 . .   . f5 . . a5 . g5 .  . . f5 . . e5 . .   d5 . . . . . . .`,
        },
        {
          wave: 'sine', vol: 0.03, env: 'pluck', notes: `
          . . . . . . . a6   . . . . . . . .   . . . . . d6 . .   . . . . . . . .
          . . . . . . . .   . . . . . . . f6   . . . . . . . .   . . . a6 . . . .`,
        },
      ],
    },
    /* 거울 숲 — 한 선율과 그 '거울에 비친' 선율이 서로 대답한다 (5장) */
    mirror: {
      bpm: 60,
      channels: [
        {
          wave: 'sine', vol: 0.12, env: 'pluck', notes: `
          e5 . g5 . b5 . a5 .   g5 . . . . . . .   . . . . . . . .   . . . . . . . .
          e5 . g5 . c6 . b5 .   a5 . . . . . . .   . . . . . . . .   . . . . . . . .`,
        },
        {
          wave: 'sine', vol: 0.08, env: 'pluck', notes: `
          . . . . . . . .   . . . . . . . .   e5 . c5 . a4 . b4 .   c5 . . . . . . .
          . . . . . . . .   . . . . . . . .   e5 . c5 . g4 . a4 .   b4 . . . . . . .`,
        },
        {
          wave: 'triangle', vol: 0.07, notes: `
          e3 - - - - - - -   c3 - - - - - - -   a2 - - - - - - -   b2 - - - - - - -
          e3 - - - - - - -   c3 - - - - - - -   f2 - - - - - - -   b2 - - - - - - -`,
        },
        {
          wave: 'square', vol: 0.012, env: 'pluck', notes: `
          b5 e6 b5 e6 b5 e6 b5 e6   c6 e6 c6 e6 c6 e6 c6 e6   a5 e6 a5 e6 a5 e6 a5 e6   b5 d#6 b5 d#6 b5 d#6 b5 d#6
          b5 e6 b5 e6 b5 e6 b5 e6   c6 e6 c6 e6 c6 e6 c6 e6   a5 f6 a5 f6 a5 f6 a5 f6   b5 d#6 b5 d#6 b5 d#6 b5 d#6`,
        },
      ],
    },
    fog: {
      bpm: 56,
      channels: [
        {
          wave: 'triangle', vol: 0.11, notes: `
          a2 - - - - - - -   bb2 - - - - - - -   a2 - - - - - - -   g#2 - - - - - - -
          a2 - - - - - - -   bb2 - - - - - - -   f2 - - - - - - -   e2 - - - - - - -`,
        },
        {
          wave: 'sine', vol: 0.05, env: 'pluck', notes: `
          . . e5 . . . . .   . . . . f5 . . .   . e5 . . . . d#5 .   . . . . . . . .
          . . e5 . . . . .   . . . . f5 . e5 .  . . c5 . . . . .     . . . . b4 . . .`,
        },
      ],
    },
    sad: {
      bpm: 64,
      channels: [
        {
          wave: 'triangle', vol: 0.14, env: 'pluck', notes: `
          d5 - - - a4 - f4 -   g4 - - - f4 - d4 -   e4 - g4 - bb4 - a4 g4   a4 - - - - - . .
          f5 - e5 - d5 - a4 -  bb4 - a4 - g4 - f4 - e4 - g4 - c#5 - - -   d5 - - - - - . .`,
        },
        {
          wave: 'sine', vol: 0.05, env: 'pluck', notes: `
          d3 a3 d4 a3 d3 a3 d4 a3   bb2 f3 bb3 f3 bb2 f3 bb3 f3   g2 d3 g3 d3 g2 d3 g3 d3   a2 e3 a3 c#4 a3 e3 a2 e3
          d3 a3 d4 a3 d3 a3 d4 a3   bb2 f3 bb3 f3 bb2 f3 bb3 f3   a2 e3 a3 c#4 a3 e3 a2 e3  d3 a3 d4 a3 d3 . . .`,
        },
      ],
    },
    tension: {
      bpm: 132,
      channels: [
        {
          wave: 'square', vol: 0.045, notes: `
          ${rep('e2 e2 g2 e2 bb2 a2 g2 f#2', 4)}
          ${rep('c3 c3 e3 c3 f#3 e3 d3 b2', 2)}
          ${rep('e2 e2 g2 e2 bb2 a2 g2 f#2', 2)}`,
        },
        {
          wave: 'sawtooth', vol: 0.025, notes: `
          e4 - - - . . . .   g4 - - - f#4 - - -   e4 - - - . . b3 -   c4 - - - b3 - - -
          e4 - - - g4 - - -  a4 - - - g4 - f#4 -  e4 - - - . . . .    d#4 - - - - - - -`,
        },
        { wave: 'noise', vol: 0.04, notes: rep('k . h k x . h .', 8) },
      ],
    },
    brave: {
      bpm: 132,
      channels: [
        {
          wave: 'square', vol: 0.05, vib: 8, notes: `
          c5 - e5 - g5 - - g5   a5 - g5 - f5 - e5 -   d5 - g5 - b5 - - a5   g5 - - - e5 - - -
          a5 - g5 - e5 - c5 -   f5 - a5 - c6 - - -    b5 - a5 - g5 - d5 -   c6 - - - - - . .`,
        },
        {
          wave: 'square', vol: 0.022, env: 'pluck', notes: `
          . e4 . g4 . e4 . g4   . f4 . a4 . f4 . a4   . d4 . g4 . d4 . b4   . e4 . g4 . e4 . g4
          . e4 . a4 . e4 . a4   . f4 . a4 . f4 . c5   . d4 . g4 . d4 . b4   . e4 . g4 . c5 . .`,
        },
        {
          wave: 'triangle', vol: 0.12, notes: `
          c3 c3 c3 c3 c3 c3 g2 g2   f2 f2 f2 f2 f2 f2 c3 c3   g2 g2 g2 g2 g2 g2 d3 d3   c3 c3 c3 c3 e3 e3 g3 g3
          a2 a2 a2 a2 a2 a2 e3 e3   f2 f2 f2 f2 a2 a2 c3 c3   g2 g2 g2 g2 b2 b2 d3 d3   c3 - - - g2 - c3 .`,
        },
        { wave: 'noise', vol: 0.04, notes: rep('k . x . k k x .', 7) + ' k . x . x x x x' },
      ],
    },
    shop: {
      bpm: 132,
      channels: [
        { wave: 'square', vol: 0.04, notes: 'c5 . a4 . f4 . a4 c5   d5 . c5 . a4 . g4 .   bb4 . d5 . c5 . a4 .   g4 . a4 . f4 - . .' },
        { wave: 'triangle', vol: 0.1, notes: 'f2 . c3 . f2 . c3 .   bb2 . f3 . bb2 . f3 .   c3 . g3 . c3 . g3 .   f2 . c3 . f2 . . .' },
        { wave: 'noise', vol: 0.03, notes: rep('k . h . x . h .', 4) },
      ],
    },
    forest: {
      bpm: 96,
      channels: [
        {
          wave: 'triangle', vol: 0.11, notes: `
          d5 - . a4 c5 - d5 -   f5 - e5 - c5 - . .   d5 - . a4 c5 - a4 -   g4 - - - . . . .
          a4 - c5 - d5 - f5 -   e5 - c5 - a4 - . .   bb4 - a4 - g4 - e4 -  d4 - - - . . . .`,
        },
        {
          wave: 'square', vol: 0.02, env: 'pluck', notes: `
          d3 f3 a3 f3 d3 f3 a3 f3   f3 a3 c4 a3 f3 a3 c4 a3   d3 f3 a3 f3 d3 f3 a3 f3   c3 e3 g3 e3 c3 e3 g3 e3
          f3 a3 c4 a3 f3 a3 c4 a3   a2 c3 e3 c3 a2 c3 e3 c3   g2 bb2 d3 bb2 g2 bb2 d3 bb2   a2 c#3 e3 c#3 a2 c#3 e3 .`,
        },
        { wave: 'noise', vol: 0.02, notes: rep('h . . . h . . .', 8) },
      ],
    },
    clear: {
      bpm: 110,
      loop: false,
      channels: [
        { wave: 'square', vol: 0.05, notes: 'c5 e5 g5 c6 - - b5 c6 - - - - . . . .' },
        { wave: 'triangle', vol: 0.12, notes: 'c3 - - - - - g2 c3 - - - - . . . .' },
      ],
    },
  });
})();
