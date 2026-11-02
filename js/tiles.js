'use strict';
/*
 * tiles.js — 타일 정의와 코드로 그리는 타일 아트
 * 맵 데이터의 각 문자 하나가 타일 하나다. (범례는 docs/README 참고)
 */
(function () {
  const U = G.U;
  const { rect, px, ellipse } = G.sprites;

  const C = {
    grass: '#7cc46a', grassD: '#5ea953', grassL: '#9bd884',
    dirt: '#d9b47e', dirtD: '#c49b66', dirtL: '#e8c895',
    water: '#3f86d2', waterD: '#336fb3', waterL: '#8cc4f4', foam: '#c4e4ff',
    wood: '#b07a45', woodD: '#86592e', woodL: '#c99a61',
    leaf: '#2f7a3c', leafM: '#43994c', leafL: '#69bd5f', trunk: '#6b4423',
    wall: '#efe2c4', beam: '#7a4e2a', stone: '#8b8478',
  };

  function grassBase(g, r, dense) {
    rect(g, 0, 0, 16, 16, C.grass);
    const n = dense ? 10 : 6;
    for (let i = 0; i < n; i++) {
      const x = Math.floor(r(i) * 15),
        y = Math.floor(r(i + 20) * 14) + 1;
      px(g, x, y, C.grassD);
      px(g, x + 1, y - 1, C.grassD);
    }
    for (let i = 0; i < 3; i++) px(g, Math.floor(r(i + 40) * 16), Math.floor(r(i + 50) * 16), C.grassL);
  }
  function dirtBase(g, r) {
    rect(g, 0, 0, 16, 16, C.dirt);
    for (let i = 0; i < 6; i++) px(g, Math.floor(r(i) * 16), Math.floor(r(i + 9) * 16), i % 2 ? C.dirtD : C.dirtL);
  }
  function waterBase(g, n, f, r) {
    rect(g, 0, 0, 16, 16, C.water);
    for (let i = 0; i < 2; i++) {
      const y = 3 + i * 7 + Math.floor(r(i) * 3);
      const x = (Math.floor(r(i + 5) * 12) + f * 3) % 14;
      rect(g, x, y, 3, 1, C.waterL);
      px(g, (x + 7) % 16, y + 2, C.waterD);
    }
    const isW = (c) => '~xo'.includes(c);
    if (!isW(n(0, -1))) {
      rect(g, 0, 0, 16, 2, C.foam);
      rect(g, 0, 2, 16, 1, C.waterD);
    }
    if (!isW(n(0, 1))) rect(g, 0, 15, 16, 1, C.foam);
    if (!isW(n(-1, 0))) rect(g, 0, 0, 1, 16, C.foam);
    if (!isW(n(1, 0))) rect(g, 15, 0, 1, 16, C.foam);
  }
  function floorWood(g, r) {
    rect(g, 0, 0, 16, 16, C.woodL);
    for (let x = 0; x < 16; x += 4) rect(g, x, 0, 1, 16, '#a8783f');
    for (let i = 0; i < 4; i++) rect(g, i * 4 + 1, Math.floor(r(i) * 16), 3, 1, '#b8884f');
  }
  function jangpan(g) {
    rect(g, 0, 0, 16, 16, '#e9c46a');
    rect(g, 0, 7, 16, 1, '#d8b057');
    rect(g, 7, 0, 1, 16, '#d8b057');
    px(g, 3, 3, '#f6dc8e');
    px(g, 11, 11, '#f6dc8e');
  }
  function concrete(g, r) {
    rect(g, 0, 0, 16, 16, '#a39785');
    for (let i = 0; i < 7; i++) px(g, Math.floor(r(i) * 16), Math.floor(r(i + 7) * 16), i % 2 ? '#8f8473' : '#b5aa98');
  }

  const T = (G.tiles = {});
  /* pass: 지나갈 수 있음, cat: 감투만 지나갈 수 있음, water: 물 (점프 대상) */
  T.defs = {
    ' ': { pass: false, draw: (g) => rect(g, 0, 0, 16, 16, '#000') },
    '.': { pass: true, draw: (g, n, f, r) => grassBase(g, r) },
    ',': {
      pass: true,
      draw: (g, n, f, r) => {
        grassBase(g, r);
        const cols = ['#ff8fb0', '#ffe066', '#ffffff', '#c59bff'];
        for (let i = 0; i < 3; i++) {
          const x = 2 + Math.floor(r(i + 60) * 11),
            y = 2 + Math.floor(r(i + 70) * 11);
          const c = cols[Math.floor(r(i + 80) * 4)];
          px(g, x, y, c);
          px(g, x - 1, y, c);
          px(g, x + 1, y, c);
          px(g, x, y - 1, c);
          px(g, x, y + 1, '#3f8f3f');
          px(g, x, y, '#fff6a0');
        }
      },
    },
    '"': {
      pass: true,
      draw: (g, n, f, r) => {
        grassBase(g, r, true);
        for (let i = 0; i < 5; i++) {
          const x = 1 + Math.floor(r(i + 90) * 13),
            y = 6 + Math.floor(r(i + 99) * 8);
          rect(g, x, y, 1, 4, '#4c9a45');
          px(g, x + 1, y - 1, '#4c9a45');
          px(g, x - 1, y + 1, '#68b85a');
        }
      },
    },
    ':': {
      pass: true,
      draw: (g, n, f, r) => {
        dirtBase(g, r);
        const isP = (c) => ':D='.includes(c);
        if (!isP(n(0, -1))) rect(g, 0, 0, 16, 1, '#b99a64');
        if (!isP(n(-1, 0))) rect(g, 0, 0, 1, 16, '#c8a46e');
        if (!isP(n(1, 0))) rect(g, 15, 0, 1, 16, '#c8a46e');
      },
    },
    '=': {
      pass: true,
      draw: (g, n, f, r) => {
        rect(g, 0, 0, 16, 16, '#5f646a');
        for (let i = 0; i < 6; i++) px(g, Math.floor(r(i) * 16), Math.floor(r(i + 5) * 16), i % 2 ? '#6c7178' : '#555a60');
        if (n(0, -1) !== '=') rect(g, 0, 0, 16, 2, '#c2c2c2');
        if (n(0, 1) === '=' && n(0, -1) !== '=') {
          /* 위쪽 차선 */
        }
        if (n(0, 1) !== '=') rect(g, 0, 14, 16, 2, '#c2c2c2');
        if (n(0, -1) === '=' && n(0, 1) === '=') rect(g, 2, 0, 8, 1, '#f2d24a');
      },
    },
    '~': { pass: false, water: true, draw: (g, n, f, r) => waterBase(g, n, f, r) },
    x: {
      pass: false,
      water: true,
      draw: (g, n, f, r) => {
        waterBase(g, n, f, r);
        rect(g, 2, 2, 5, 3, C.woodD);
        rect(g, 9, 9, 5, 3, C.woodD);
      },
    },
    o: {
      pass: true,
      draw: (g, n, f, r) => {
        waterBase(g, n, f, r);
        ellipse(g, 8, 9, 6, 5, '#5f666c');
        ellipse(g, 8, 8, 6, 5, '#959ca3');
        ellipse(g, 6, 6, 2, 1, '#c6cbd0');
      },
    },
    b: {
      pass: true,
      draw: (g, n) => {
        rect(g, 0, 0, 16, 16, C.wood);
        for (let y = 0; y < 16; y += 4) rect(g, 0, y, 16, 1, C.woodD);
        px(g, 3, 2, '#5a3a1a');
        px(g, 12, 2, '#5a3a1a');
        if (n(-1, 0) !== 'b') {
          rect(g, 0, 0, 2, 16, '#6b4423');
          rect(g, 0, 0, 3, 2, '#5a3a1a');
        }
        if (n(1, 0) !== 'b') {
          rect(g, 14, 0, 2, 16, '#6b4423');
          rect(g, 13, 0, 3, 2, '#5a3a1a');
        }
      },
    },
    T: {
      pass: false,
      draw: (g, n, f, r) => {
        grassBase(g, r);
        const dense = n(0, -1) === 'T';
        ellipse(g, 8, 13, 6, 2, 'rgba(0,0,0,0.18)');
        rect(g, 7, 10, 3, 5, C.trunk);
        ellipse(g, 8, dense ? 6 : 7, 7, dense ? 7 : 6, C.leaf);
        ellipse(g, 7, dense ? 5 : 6, 5, 4, C.leafM);
        ellipse(g, 5, 4, 2, 2, C.leafL);
        px(g, 10, 8, C.leafL);
        if (dense) rect(g, 2, 0, 12, 2, C.leaf);
      },
    },
    t: {
      pass: false,
      draw: (g, n, f, r) => {
        grassBase(g, r);
        ellipse(g, 8, 13, 6, 2, 'rgba(0,0,0,0.18)');
        ellipse(g, 8, 9, 6, 5, '#357f3a');
        ellipse(g, 7, 8, 4, 3, '#4fa34c');
        px(g, 5, 7, C.leafL);
        if (r(3) > 0.5) {
          px(g, 10, 10, '#e84a5a');
          px(g, 6, 11, '#e84a5a');
        }
      },
    },
    '#': {
      pass: false,
      draw: (g, n, f, r) => {
        grassBase(g, r);
        const L = n(-1, 0) === '#' || n(-1, 0) === ':',
          R = n(1, 0) === '#' || n(1, 0) === ':',
          Up = n(0, -1) === '#',
          Dn = n(0, 1) === '#';
        if (L || R) {
          const x0 = L ? 0 : 6,
            x1 = R ? 16 : 10;
          for (const y of [5, 10]) {
            rect(g, x0, y, x1 - x0, 2, '#a0703c');
            rect(g, x0, y + 2, x1 - x0, 1, '#6e4a26');
          }
        }
        if (Up || Dn) {
          const y0 = Up ? 0 : 3,
            y1 = Dn ? 16 : 15;
          rect(g, 6, y0, 4, y1 - y0, '#a0703c');
          rect(g, 9, y0, 1, y1 - y0, '#6e4a26');
        }
        rect(g, 6, 3, 4, 12, '#b5824a');
        rect(g, 6, 3, 4, 1, '#d4a46a');
        rect(g, 9, 4, 1, 11, '#6e4a26');
      },
    },
    R: { pass: false, draw: (g, n) => roof(g, n, 'R', '#5b6470', '#47505b', '#78828f') },
    r: { pass: false, draw: (g, n) => roof(g, n, 'r', '#c0564a', '#9a3f36', '#dc7a6a') },
    H: { pass: false, draw: (g, n) => wall(g, n) },
    W: {
      pass: false,
      draw: (g, n) => {
        wall(g, n);
        rect(g, 3, 4, 10, 8, C.beam);
        rect(g, 4, 5, 8, 6, '#fbf3dd');
        rect(g, 7, 5, 2, 6, '#c9a87a');
        rect(g, 4, 7, 8, 1, '#c9a87a');
      },
    },
    D: {
      pass: true,
      draw: (g, n, f, r) => {
        const up = n(0, -1);
        if ('FJn.'.includes(up)) {
          // 실내 출구 (문턱)
          if (up === 'n') concrete(g, r);
          else floorWood(g, r);
          rect(g, 2, 9, 12, 7, '#7a4e2a');
          rect(g, 3, 10, 10, 1, '#9a6a3a');
          rect(g, 3, 13, 10, 1, '#9a6a3a');
          return;
        }
        if (up === 'M' || up === 'X') {
          rect(g, 0, 0, 16, 16, '#ecdcbc');
          rect(g, 2, 1, 12, 15, '#6e4422');
          rect(g, 3, 2, 10, 14, '#94602f');
          rect(g, 7, 2, 1, 14, '#6e4422');
          px(g, 10, 9, '#f2c84b');
          return;
        }
        wall(g, n);
        rect(g, 2, 1, 12, 15, '#5a3a1e');
        rect(g, 3, 2, 10, 14, '#94602f');
        rect(g, 7, 2, 2, 14, '#7a4e26');
        for (let y = 4; y < 14; y += 3) {
          rect(g, 4, y, 3, 1, '#b07a45');
          rect(g, 9, y, 3, 1, '#b07a45');
        }
        px(g, 6, 9, '#f2c84b');
        px(g, 9, 9, '#f2c84b');
      },
    },
    h: {
      pass: false,
      cat: true,
      draw: (g, n) => {
        wall(g, n);
        rect(g, 4, 10, 8, 6, '#1a1212');
        rect(g, 5, 9, 6, 1, '#1a1212');
        rect(g, 4, 10, 1, 6, '#3a2a20');
        px(g, 6, 12, '#ffd34d');
        px(g, 9, 12, '#ffd34d');
      },
    },
    f: {
      pass: true,
      draw: (g) => {
        rect(g, 0, 0, 16, 16, '#9b6b42');
        for (let y = 2; y < 16; y += 4) rect(g, 0, y, 16, 1, '#b3804f');
        for (let y = 3; y < 16; y += 4) rect(g, 0, y, 16, 1, '#7f5634');
      },
    },
    v: {
      pass: false,
      draw: (g) => {
        rect(g, 0, 0, 16, 16, '#9b6b42');
        for (let y = 2; y < 16; y += 4) rect(g, 0, y, 16, 1, '#b3804f');
        for (const x of [3, 8, 13]) {
          rect(g, x, 3, 1, 9, '#4caf50');
          px(g, x - 1, 4, '#66c46a');
          px(g, x + 1, 2, '#66c46a');
          rect(g, x, 11, 1, 3, '#eef6e6');
        }
      },
    },
    w: {
      pass: false,
      draw: (g, n, f, r) => {
        grassBase(g, r);
        ellipse(g, 8, 10, 7, 5, '#6b6b6b');
        ellipse(g, 8, 9, 7, 5, '#a8a8a8');
        ellipse(g, 8, 9, 4, 3, '#1f3f66');
        px(g, 6, 8, '#5a8acc');
        rect(g, 1, 1, 2, 9, '#7a4e2a');
        rect(g, 13, 1, 2, 9, '#7a4e2a');
        rect(g, 0, 0, 16, 2, '#9a3f36');
      },
    },
    j: {
      pass: false,
      draw: (g, n, f, r) => {
        rect(g, 0, 0, 16, 16, '#cfc7b8');
        rect(g, 0, 15, 16, 1, '#a8a090');
        ellipse(g, 8, 10, 6, 5, '#5b3a24');
        ellipse(g, 8, 4, 4, 1, '#3e2618');
        rect(g, 4, 4, 8, 2, '#4a2e1c');
        px(g, 5, 8, '#8a6a50');
        px(g, 5, 9, '#8a6a50');
        void r;
      },
    },
    k: {
      pass: false,
      draw: (g, n, f, r) => {
        if (n(0, 1) === '~') waterBase(g, () => '.', f, r);
        else grassBase(g, r);
        ellipse(g, 8, 10, 6, 5, '#5f666c');
        ellipse(g, 8, 9, 6, 5, '#8e959c');
        ellipse(g, 6, 7, 2, 1, '#bfc4c9');
      },
    },
    p: {
      pass: true,
      draw: (g) => {
        rect(g, 0, 0, 16, 16, '#d4a56a');
        for (let y = 0; y < 16; y += 4) rect(g, 0, y, 16, 1, '#b8884f');
      },
    },
    P: {
      pass: false,
      draw: (g) => {
        rect(g, 0, 0, 16, 16, '#d4a56a');
        for (let y = 0; y < 16; y += 4) rect(g, 0, y, 16, 1, '#b8884f');
        rect(g, 5, 0, 6, 16, '#8b3a2e');
        rect(g, 5, 0, 2, 16, '#a84a3a');
        rect(g, 4, 0, 8, 3, '#3a8a6a');
        rect(g, 4, 14, 8, 2, '#8b8478');
      },
    },
    S: {
      pass: false,
      draw: (g, n, f, r) => {
        grassBase(g, r);
        rect(g, 7, 8, 2, 7, '#6b4423');
        rect(g, 2, 2, 12, 7, '#6b4423');
        rect(g, 3, 3, 10, 5, '#c99a61');
        rect(g, 4, 4, 8, 1, '#8a5a2e');
        rect(g, 4, 6, 6, 1, '#8a5a2e');
      },
    },
    Y: {
      pass: false,
      draw: (g, n, f, r) => {
        grassBase(g, r);
        rect(g, 0, 12, 16, 4, 'rgba(0,0,0,0.12)');
      },
    },
    O: {
      pass: false,
      draw: (g, n, f, r) => {
        grassBase(g, r);
        ellipse(g, 8, 11, 7, 4, '#5a3a22');
        rect(g, 1, 7, 15, 5, '#6b4423');
        ellipse(g, 8, 7, 7, 3, '#c08a52');
        ellipse(g, 8, 7, 4, 2, '#a8743f');
        ellipse(g, 8, 7, 1, 1, '#c08a52');
      },
    },
    E: {
      pass: true,
      draw: (g, n, f, r) => {
        rect(g, 0, 0, 16, 16, '#e8d9a8');
        for (let i = 0; i < 5; i++) px(g, Math.floor(r(i) * 16), Math.floor(r(i + 3) * 16), '#d0c090');
      },
    },
    /* ---- 실내 ---- */
    F: { pass: true, draw: (g, n, f, r) => floorWood(g, r) },
    J: { pass: true, draw: (g) => jangpan(g) },
    n: { pass: true, draw: (g, n, f, r) => concrete(g, r) },
    g: {
      pass: true,
      draw: (g, n, f, r) => {
        concrete(g, r);
        g.strokeStyle = '#f2c84b';
        rect(g, 2, 2, 12, 1, '#f2c84b');
        rect(g, 2, 13, 12, 1, '#f2c84b');
        rect(g, 2, 2, 1, 12, '#f2c84b');
        rect(g, 13, 2, 1, 12, '#f2c84b');
        rect(g, 6, 7, 4, 2, '#f2c84b');
      },
    },
    M: {
      pass: false,
      draw: (g, n) => {
        rect(g, 0, 0, 16, 16, '#ecdcbc');
        rect(g, 0, 0, 16, 2, '#cdb894');
        rect(g, 0, 13, 16, 3, '#8a5a2b');
        if (n(-1, 0) === 'X' || n(-1, 0) === ' ') rect(g, 0, 0, 1, 16, '#cdb894');
      },
    },
    X: {
      pass: false,
      draw: (g, n) => {
        rect(g, 0, 0, 16, 16, '#4b3a2d');
        if (!'X '.includes(n(0, 1)) && n(0, 1) !== 'M') rect(g, 0, 14, 16, 2, '#6e5a48');
      },
    },
    C: {
      pass: false,
      draw: (g, n) => {
        rect(g, 0, 0, 16, 16, '#e9c46a');
        rect(g, 0, 0, 16, 15, '#7a4424');
        rect(g, 1, 1, 14, 13, '#9a5a30');
        rect(g, 8, 1, 1, 13, '#6a3a1c');
        for (const [x, y] of [[6, 7], [10, 7]]) rect(g, x, y, 1, 2, '#e0b04a');
        rect(g, 1, 1, 14, 1, '#b8743f');
        void n;
      },
    },
    K: {
      pass: false,
      draw: (g, n, f, r) => {
        rect(g, 0, 0, 16, 16, '#9e9e9e');
        rect(g, 0, 0, 16, 3, '#bdbdbd');
        rect(g, 0, 14, 16, 2, '#7a7a7a');
        if (r(1) > 0.4) {
          ellipse(g, 8, 4, 5, 2, '#2a2a2a');
          rect(g, 4, 4, 9, 3, '#2a2a2a');
          px(g, 6, 3, '#555');
        }
        rect(g, 5, 9, 6, 4, '#3a2a20');
        px(g, 7, 11, '#e8662a');
        px(g, 8, 10, '#ffb04a');
      },
    },
    L: {
      pass: false,
      draw: (g, n, f, r) => {
        const fl = n(0, -1);
        if (fl === 'J') jangpan(g);
        else if (fl === 'n') concrete(g, r);
        else floorWood(g, r);
        rect(g, 1, 4, 14, 8, '#7a3a1c');
        rect(g, 1, 3, 14, 7, '#a0522d');
        rect(g, 2, 4, 12, 1, '#c0724a');
        rect(g, 2, 11, 2, 3, '#5a2a10');
        rect(g, 12, 11, 2, 3, '#5a2a10');
      },
    },
    Z: {
      pass: true,
      draw: (g) => {
        jangpan(g);
        rect(g, 1, 1, 14, 14, '#f48fb1');
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) px(g, 3 + i * 5, 3 + j * 5, '#fce4ec');
      },
    },
    Q: {
      pass: false,
      draw: (g, n, f, r) => {
        rect(g, 0, 0, 16, 16, '#6e4a2a');
        rect(g, 1, 1, 14, 14, '#8a5a32');
        rect(g, 1, 7, 14, 1, '#5a3a1e');
        rect(g, 1, 14, 14, 1, '#5a3a1e');
        const cols = ['#e84a4a', '#f2c84b', '#4a8be8', '#4ac46a', '#f08aa8', '#ffffff'];
        for (let i = 0; i < 4; i++) {
          rect(g, 2 + i * 3, 3, 2, 4, cols[Math.floor(r(i) * 6)]);
          rect(g, 2 + i * 3, 10, 2, 4, cols[Math.floor(r(i + 7) * 6)]);
        }
      },
    },
    /* ---- 동굴 ---- */
    U: {
      pass: false,
      draw: (g, n, f, r) => {
        rect(g, 0, 0, 16, 16, '#2a2433');
        if (n(0, 1) !== 'U') {
          rect(g, 0, 11, 16, 5, '#3a3346');
          rect(g, 0, 15, 16, 1, '#1c1824');
        }
        px(g, Math.floor(r(1) * 14), Math.floor(r(2) * 10), '#4a4258');
        px(g, Math.floor(r(3) * 14), Math.floor(r(4) * 10), '#1c1824');
      },
    },
    u: {
      pass: true,
      draw: (g, n, f, r) => {
        rect(g, 0, 0, 16, 16, '#5a5068');
        for (let i = 0; i < 6; i++) px(g, Math.floor(r(i) * 16), Math.floor(r(i + 9) * 16), i % 2 ? '#4a4258' : '#6a6078');
        if (n(0, -1) === 'U') rect(g, 0, 0, 16, 2, 'rgba(0,0,0,0.25)');
      },
    },
    V: { pass: false, chasm: true, draw: (g, n) => chasm(g, n) },
    I: { pass: false, chasm: true, catEye: true, draw: (g, n) => chasm(g, n) },
    A: {
      pass: true,
      draw: (g, n, f, r) => {
        grassBase(g, r);
        ellipse(g, 8, 9, 8, 8, '#5f666c');
        ellipse(g, 8, 10, 6, 7, '#141018');
        rect(g, 2, 10, 12, 6, '#141018');
        px(g, 4, 6, '#8e959c');
      },
    },
    B: {
      pass: false,
      draw: (g, n, f, r) => {
        concrete(g, r);
        rect(g, 1, 2, 14, 13, '#5a3a1a');
        rect(g, 2, 3, 12, 11, '#9a6a3a');
        rect(g, 2, 8, 12, 1, '#5a3a1a');
        rect(g, 7, 3, 1, 11, '#5a3a1a');
      },
    },
  };

  function chasm(g, n) {
    rect(g, 0, 0, 16, 16, '#07060c');
    const edge = (c) => !'VI'.includes(c);
    if (edge(n(0, -1))) {
      rect(g, 0, 0, 16, 3, '#3a3346');
      rect(g, 0, 3, 16, 1, '#1c1824');
    }
    if (edge(n(-1, 0))) rect(g, 0, 0, 1, 16, '#1c1824');
    if (edge(n(1, 0))) rect(g, 15, 0, 1, 16, '#1c1824');
  }
  function roof(g, n, ch, base, dark, light) {
    rect(g, 0, 0, 16, 16, base);
    for (let y = 2; y < 16; y += 4) {
      rect(g, 0, y, 16, 1, dark);
      for (let x = (y / 4) % 2 ? 0 : 4; x < 16; x += 8) rect(g, x, y - 3, 1, 3, dark);
    }
    if (n(0, -1) !== ch) {
      rect(g, 0, 0, 16, 2, dark);
      rect(g, 0, 0, 16, 1, light);
    }
    if (n(0, 1) !== ch) {
      rect(g, 0, 12, 16, 3, dark);
      rect(g, 0, 15, 16, 1, '#2a2a2a');
      if (n(-1, 0) !== ch) rect(g, 0, 10, 2, 2, dark);
      if (n(1, 0) !== ch) rect(g, 14, 10, 2, 2, dark);
    }
    if (n(-1, 0) !== ch) rect(g, 0, 0, 1, 16, dark);
    if (n(1, 0) !== ch) rect(g, 15, 0, 1, 16, dark);
  }
  function wall(g, n) {
    rect(g, 0, 0, 16, 16, C.wall);
    rect(g, 0, 0, 16, 2, C.beam);
    rect(g, 0, 13, 16, 3, C.stone);
    rect(g, 0, 13, 16, 1, '#a39b8e');
    if (!'HWDh'.includes(n(-1, 0))) rect(g, 0, 0, 2, 13, C.beam);
    if (!'HWDh'.includes(n(1, 0))) rect(g, 14, 0, 2, 13, C.beam);
  }

  T.get = (ch) => T.defs[ch] || T.defs[' '];

  /** 맵 전체를 미리 그린 캔버스(물 애니메이션 프레임 2장) */
  T.prerender = function (grid, w, h, seed = 0) {
    const out = [];
    for (let f = 0; f < 2; f++) {
      const c = U.canvas(w * 16, h * 16);
      const g = c.getContext('2d');
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const ch = grid[y][x];
          const def = T.get(ch);
          const n = (dx, dy) => {
            const yy = y + dy,
              xx = x + dx;
            if (yy < 0 || yy >= h || xx < 0 || xx >= w) return ch;
            return grid[yy][xx];
          };
          const r = (i) => U.hash(x, y, i + seed * 131);
          g.save();
          g.translate(x * 16, y * 16);
          def.draw(g, n, f, r);
          g.restore();
        }
      out.push(c);
    }
    return out;
  };
})();
