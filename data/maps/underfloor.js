/* 마루 밑 (10 x 6) — 감투만 들어올 수 있는 좁고 어두운 곳 */
GameData.defineMap('underfloor', {
  name: '마루 밑',
  dark: 0.72,
  bgm: undefined,
  tiles: [
    'XXXXXXXXXX',
    'XMMMMMMMMX',
    'XnnBnnnnnX',
    'XnnnnnBnnX',
    'XnnnnnnnnX',
    'XXXXhXXXXX',
  ],
  events: [
    {
      id: 'exit', x: 4, y: 5, trigger: 'touch',
      script: [
        ['if', { var: ['under', '==', 'ijang'] },
          [['warp', 'village', 30, 12, 'down', { cat: true, se: 'rustle' }]],
          [['warp', 'village', 5, 12, 'down', { cat: true, se: 'rustle' }]]],
      ],
    },
  ],
});
