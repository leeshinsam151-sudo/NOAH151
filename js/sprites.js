'use strict';
/*
 * sprites.js — 코드로 그리는 픽셀 아트
 * 사람/고양이/개는 문자열 템플릿 + 팔레트로, 나머지는 절차적으로 그린다.
 * 캐릭터별 색·머리 모양은 data/game.js 의 GameData.sprites 에서 지정한다.
 */
(function () {
  const U = G.U;
  const S = (G.sprites = { cache: {} });

  /* ---------- 사람 템플릿 (16x16) ---------- */
  const HUMAN = {
    down: [
      '................',
      '.....oooooo.....',
      '....ohhhhhho....',
      '...ohhhhhhhho...',
      '...ohhhhhhhho...',
      '...ohssssssho...',
      '...osesssseso...',
      '...osbssssbso...',
      '....osssssso....',
      '.....oooooo.....',
      '....occcccco....',
      '...osccccccso...',
      '...osccccccso...',
      '....oppppppo....',
      '.....kk..kk.....',
      '................',
    ],
    up: [
      '................',
      '.....oooooo.....',
      '....ohhhhhho....',
      '...ohhhhhhhho...',
      '...ohhhhhhhho...',
      '...ohhhhhhhho...',
      '...ohhhhhhhho...',
      '...ohhhhhhhho...',
      '....ohhhhhho....',
      '.....oooooo.....',
      '....occcccco....',
      '...osccccccso...',
      '...osccccccso...',
      '....oppppppo....',
      '.....kk..kk.....',
      '................',
    ],
    left: [
      '................',
      '.....oooooo.....',
      '....ohhhhhho....',
      '...ohhhhhhhho...',
      '...ohhhhhhhho...',
      '...osshhhhhho...',
      '...oseshhhhho...',
      '...osssshhhho...',
      '....ossssho.....',
      '.....oooooo.....',
      '....occcccco....',
      '....occcscco....',
      '....occcscco....',
      '....oppppppo....',
      '.....kk.kk......',
      '................',
    ],
  };
  const HUMAN_LEGS = {
    down: ['.....kk..kk.....', '....kk...kk.....', '.....kk...kk....'],
    up: ['.....kk..kk.....', '....kk...kk.....', '.....kk...kk....'],
    left: ['.....kk.kk......', '....kk...kk.....', '......kkk.......'],
  };

  /* ---------- 고양이 템플릿 ---------- */
  const CAT = {
    down: [
      '................',
      '................',
      '................',
      '...o........o...',
      '...oo......oo...',
      '...oko....oko...',
      '...ofnnnnnnfo...',
      '..offnnnnnnffo..',
      '..ofeffffffefo..',
      '..offffkkffffo..',
      '...offwwwwffo...',
      '...ofwwwwwwfo...',
      '...offwwwwffo...',
      '...offffffffo...',
      '...ofo.oo.ofo...',
      '................',
    ],
    up: [
      '................',
      '................',
      '................',
      '...o........o...',
      '...oo......oo...',
      '...ooo....ooo...',
      '...ofnnnnnnfo...',
      '..offnnnnnnffo..',
      '..offffffffffo..',
      '..offffffffffo..',
      '...offffffffo...',
      '...offffffffofo.',
      '...offffffffofo.',
      '...offffffffoo..',
      '...ofo.oo.ofo...',
      '................',
    ],
    left: [
      '................',
      '................',
      '................',
      '................',
      '................',
      '..o...o.........',
      '.oko.oko........',
      '.onnnnno.....oo.',
      'ofnnnnnfo....ofo',
      'oefffffffoooofo.',
      'okfffffffffffo..',
      '.owwfffffffffo..',
      '..owwffffffffo..',
      '...offffffffo...',
      '...oo.oo..oo.oo.',
      '................',
    ],
  };
  const CAT_LEGS = {
    down: ['...ofo.oo.ofo...', '...ofo....ofo...', '...ofoo..oofo...'],
    up: ['...ofo.oo.ofo...', '...ofo....ofo...', '...ofoo..oofo...'],
    left: ['...oo.oo..oo.oo.', '....o.oo...o.oo.', '...oo..o.oo..o..'],
  };

  /* ---------- 개 템플릿 ---------- */
  const DOG = {
    down: [
      '................',
      '...oo......oo...',
      '...oko....oko...',
      '...offoooooffo..',
      '..offffffffffo..',
      '..ofeffffffefo..',
      '..offffffffffo..',
      '..offfwwwwfffo..',
      '...ofwwnnwwfo...',
      '....owwwwwwo....',
      '...offwwwwffo...',
      '..offfwwwwfffo..',
      '..offffffffffo..',
      '..offffffffffo..',
      '..ofo.oooo.ofo..',
      '................',
    ],
    up: [
      '................',
      '...oo......oo...',
      '...ooo....ooo...',
      '...offoooooffo..',
      '..offffffffffo..',
      '..offffffffffo..',
      '..offffffffffo..',
      '..offffffffffo..',
      '...offffffffo...',
      '....offwwffo....',
      '...offwwwwffo...',
      '..offffwwffffo..',
      '..offffffffffo..',
      '..offffffffffo..',
      '..ofo.oooo.ofo..',
      '................',
    ],
    left: [
      '................',
      '................',
      '....o...........',
      '...oko..........',
      '..offfo.....oo..',
      '.offeffo...ofo..',
      'owwfffffooooffo.',
      'nwwffffffffffo..',
      'owwwfffffffffo..',
      '.oowfffffffffo..',
      '...offffffffffo.',
      '...offffffffffo.',
      '...offfffffffo..',
      '...ofo.ofo.ofo..',
      '...oo..oo..oo...',
      '................',
    ],
  };
  const DOG_LEGS = {
    down: ['..ofo.oooo.ofo..', '..ofo......ofo..', '..ofoo....oofo..'],
    up: ['..ofo.oooo.ofo..', '..ofo......ofo..', '..ofoo....oofo..'],
    left: ['...oo..oo..oo...', '..oo...oo...oo..', '....oo..oo.oo...'],
  };
  S.templates = { HUMAN, CAT, DOG };

  function setPx(rows, x, y, ch) {
    if (y < 0 || y >= rows.length) return;
    const r = rows[y];
    rows[y] = r.substring(0, x) + ch + r.substring(x + 1);
  }

  function renderRows(rows, pal, legRow, bob) {
    const c = U.canvas(16, 16),
      g = c.getContext('2d');
    const draw = (row, y) => {
      for (let x = 0; x < 16; x++) {
        const ch = row[x];
        if (ch === '.' || ch === undefined) continue;
        const col = pal[ch];
        if (!col) continue;
        g.fillStyle = col;
        g.fillRect(x, y, 1, 1);
      }
    };
    for (let y = 0; y < 16; y++) {
      if (y === legRow) continue;
      draw(rows[y], y - (bob && y < legRow ? 1 : 0));
    }
    if (legRow >= 0) {
      if (bob) draw(rows[legRow], legRow - 1);
      draw(rows[legRow], legRow);
    }
    return c;
  }

  function mirror(c) {
    const m = U.canvas(c.width, c.height),
      g = m.getContext('2d');
    g.translate(c.width, 0);
    g.scale(-1, 1);
    g.drawImage(c, 0, 0);
    return m;
  }

  function applyHumanStyle(rows, dir, p) {
    const st = p.style || '';
    if (st.includes('pigtail')) {
      if (dir === 'left') {
        setPx(rows, 13, 5, 'h');
        setPx(rows, 13, 6, 'h');
        setPx(rows, 14, 5, 'o');
        setPx(rows, 14, 6, 'o');
        setPx(rows, 13, 7, 'o');
        setPx(rows, 13, 4, 'r');
      } else {
        for (const y of [5, 6]) {
          setPx(rows, 2, y, 'h');
          setPx(rows, 13, y, 'h');
          setPx(rows, 1, y, 'o');
          setPx(rows, 14, y, 'o');
        }
        setPx(rows, 2, 7, 'o');
        setPx(rows, 13, 7, 'o');
        setPx(rows, 2, 4, 'r');
        setPx(rows, 13, 4, 'r');
      }
    }
    if (st.includes('bun')) {
      for (let x = 6; x <= 9; x++) {
        setPx(rows, x, 0, 'o');
        setPx(rows, x, 1, 'h');
      }
      setPx(rows, 5, 1, 'o');
      setPx(rows, 10, 1, 'o');
      if (p.pin) {
        setPx(rows, 10, 0, 'y');
        setPx(rows, 11, 0, 'y');
        setPx(rows, 5, 0, 'y');
      }
    }
    if (st.includes('bald')) {
      for (let y = 2; y <= 3; y++) for (let x = 5; x <= 10; x++) if (rows[y][x] === 'h') setPx(rows, x, y, 's');
      if (dir !== 'up') for (let x = 6; x <= 9; x++) setPx(rows, x, 8, 'm');
      if (dir === 'left') {
        setPx(rows, 5, 8, 'm');
        setPx(rows, 6, 8, 'm');
        setPx(rows, 7, 8, 's');
      }
    }
    if (st.includes('cap')) {
      for (let y = 1; y <= 3; y++) for (let x = 0; x < 16; x++) if (rows[y][x] === 'h') setPx(rows, x, y, 'r');
      if (dir === 'down') for (let x = 4; x <= 11; x++) setPx(rows, x, 4, 'r');
      if (dir === 'left') for (let x = 2; x <= 7; x++) setPx(rows, x, 4, 'r');
    }
    if (st.includes('apron')) {
      if (dir === 'down') for (let y = 11; y <= 13; y++) for (let x = 6; x <= 9; x++) setPx(rows, x, y, 'a');
      if (dir === 'left') for (let y = 11; y <= 13; y++) setPx(rows, 5, y, 'a');
    }
    if (st.includes('long')) {
      if (dir === 'up') for (let y = 9; y <= 11; y++) for (let x = 5; x <= 10; x++) setPx(rows, x, y, 'h');
    }
    return rows;
  }

  function buildSheet(tpl, legs, legRow, pal, styler) {
    const frames = {};
    for (const dir of ['down', 'up', 'left']) {
      frames[dir] = legs[dir].map((leg, i) => {
        let rows = tpl[dir].slice();
        rows[legRow] = leg;
        if (styler) rows = styler(rows, dir);
        return renderRows(rows, pal, legRow, i > 0);
      });
    }
    frames.right = frames.left.map(mirror);
    return { w: 16, h: 16, dirs: true, frames };
  }

  function human(p) {
    const pal = {
      o: p.outline || '#2b1d1d', h: p.hair, s: p.skin || '#f7d3b5', e: '#2b1d1d', b: p.blush || '#f2a0a0',
      c: p.cloth, p: p.pants, k: p.shoes || '#5a3a2a', r: p.ribbon || '#ff6f91', w: '#ffffff',
      y: '#ffd34d', a: p.apron || '#ffffff', m: p.mustache || p.hair,
    };
    return buildSheet(HUMAN, HUMAN_LEGS, 14, pal, (rows, dir) => applyHumanStyle(rows, dir, p));
  }
  function cat(p) {
    const pal = { o: p.outline || '#2a2430', f: p.fur, n: p.patch || p.fur, w: p.white || '#f5f5f5', k: '#f29aa8', e: p.eye || '#3a3020', s: p.stripes ? p.stripes.color : p.fur };
    // 줄무늬: data 의 stripes.{down,up,left} 좌표에 털(f/n) 칸만 칠한다
    const styler = p.stripes
      ? (rows, dir) => {
          for (const [x, y] of p.stripes[dir] || []) if (rows[y] && 'fn'.includes(rows[y][x])) setPx(rows, x, y, 's');
          return rows;
        }
      : null;
    return buildSheet(CAT, CAT_LEGS, 14, pal, styler);
  }
  function dog(p) {
    const pal = { o: p.outline || '#3a2a1a', f: p.fur, w: p.white || '#fff6e0', k: '#f29aa8', e: '#2a1e10', n: '#2a1e10', r: p.collar || p.white || '#fff6e0' };
    return buildSheet(DOG, DOG_LEGS, 14, pal, (rows, dir) => {
      if (p.collar) {
        if (dir === 'down') for (let x = 4; x <= 11; x++) setPx(rows, x, 9, x === 7 || x === 8 ? 'k' : 'r');
        if (dir === 'up') for (let x = 4; x <= 11; x++) setPx(rows, x, 9, 'r');
        if (dir === 'left') for (const [x, y] of [[4, 9], [5, 9], [6, 9], [6, 10], [7, 10]]) setPx(rows, x, y, 'r');
      }
      return rows;
    });
  }

  /* ---------- 절차적 스프라이트 ---------- */
  function px(g, x, y, c) {
    g.fillStyle = c;
    g.fillRect(x, y, 1, 1);
  }
  function rect(g, x, y, w, h, c) {
    g.fillStyle = c;
    g.fillRect(x, y, w, h);
  }
  function ellipse(g, cx, cy, rx, ry, c) {
    g.fillStyle = c;
    for (let y = -ry; y <= ry; y++)
      for (let x = -rx; x <= rx; x++) if ((x * x) / (rx * rx + 0.5) + (y * y) / (ry * ry + 0.5) <= 1) g.fillRect(Math.round(cx + x), Math.round(cy + y), 1, 1);
  }
  S.px = px;
  S.rect = rect;
  S.ellipse = ellipse;

  function frames(n, w, h, fn) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const c = U.canvas(w, h);
      const g = c.getContext('2d');
      fn(g, i, c);
      out.push(c);
    }
    return out;
  }

  const PROC = {
    shadow: (p) => ({
      w: 16, h: 16, fps: 3,
      frames: frames(2, 16, 16, (g, f) => {
        ellipse(g, 8, 8, 6, 6, 'rgba(40,40,55,0.9)');
        ellipse(g, 8, 8, 5, 5, 'rgba(85,85,105,0.9)');
        ellipse(g, 7, 6, 2, 2, 'rgba(120,120,140,0.7)');
        for (let i = 0; i < 4; i++) rect(g, 3 + i * 3 + (f ? 1 : 0), 13, 2, 2 + ((i + f) % 2), 'rgba(60,60,78,0.85)');
        rect(g, 5, 8, 2, 2, '#f4f4ff');
        rect(g, 10, 8, 2, 2, '#f4f4ff');
        if (f) {
          px(g, 5, 8, 'rgba(85,85,105,1)');
          px(g, 10, 8, 'rgba(85,85,105,1)');
        }
      }),
    }),
    bigShadow: () => ({
      w: 32, h: 32, fps: 3,
      frames: frames(2, 32, 32, (g, f) => {
        // 늑대 모양 그림자
        for (const [x, d] of [[8, 1], [22, -1]]) for (let i = 0; i < 7; i++) rect(g, x + (d > 0 ? i / 2 : -i / 2) | 0, 3 + i, 4 - (i > 4 ? 1 : 0), 1, 'rgba(45,45,60,0.95)');
        ellipse(g, 16, 16, 12, 11, 'rgba(35,35,50,0.95)');
        ellipse(g, 16, 16, 10, 9, 'rgba(70,70,90,0.95)');
        ellipse(g, 13, 12, 4, 3, 'rgba(105,105,125,0.6)');
        ellipse(g, 16, 21, 5, 3, 'rgba(50,50,65,1)');
        for (let i = 0; i < 6; i++) rect(g, 5 + i * 4 + (f ? 2 : 0), 26, 3, 3 + ((i + f) % 2) * 2, 'rgba(50,50,68,0.9)');
        rect(g, 9, 14, 4, 3, '#fffbe0');
        rect(g, 19, 14, 4, 3, '#fffbe0');
        rect(g, 10, 15, 2, 2, '#c2b250');
        rect(g, 20, 15, 2, 2, '#c2b250');
        for (let i = 0; i < 4; i++) px(g, 13 + i * 2, 22, '#e8e8f0');
      }),
    }),
    greyGuest: () => ({
      w: 24, h: 40, fps: 2,
      frames: frames(2, 24, 40, (g, f) => {
        for (let y = 8; y < 40; y++) {
          const w = Math.min(11, 4 + (y - 8) * 0.35) + Math.sin(y * 0.6 + f * 2) * 1.2;
          g.fillStyle = `rgba(${70 + y},${70 + y},${88 + y},${0.88 - y * 0.012})`;
          g.fillRect(Math.round(12 - w), y, Math.round(w * 2), 1);
        }
        ellipse(g, 12, 7, 6, 6, 'rgba(90,90,110,0.92)');
        rect(g, 9, 6, 2, 2, '#ffffff');
        rect(g, 14, 6, 2, 2, '#ffffff');
      }),
    }),
    zelkova: () => ({
      w: 64, h: 72, fps: 0,
      frames: frames(1, 64, 72, (g) => {
        // 줄기
        rect(g, 22, 44, 20, 28, '#5a3a22');
        rect(g, 24, 44, 6, 28, '#6e4a2c');
        rect(g, 36, 50, 3, 18, '#4a2f1b');
        rect(g, 18, 66, 28, 6, '#5a3a22');
        rect(g, 14, 69, 36, 3, '#4a2f1b');
        // 수관
        const blobs = [[32, 26, 26, 20], [16, 30, 13, 11], [48, 30, 13, 11], [32, 12, 18, 11], [22, 18, 12, 9], [44, 18, 12, 9]];
        for (const [x, y, rx, ry] of blobs) ellipse(g, x, y, rx, ry, '#2c6e37');
        for (const [x, y, rx, ry] of blobs) ellipse(g, x - 2, y - 2, rx - 3, ry - 3, '#3c8c45');
        for (const [x, y, rx, ry] of blobs) ellipse(g, x - 4, y - 4, rx * 0.45, ry * 0.4, '#5aab55');
        for (let i = 0; i < 40; i++) px(g, 8 + U.hash(i, 1) * 48, 6 + U.hash(i, 2) * 38, '#7cc96a');
        // 오색 천
        const cols = ['#e84a4a', '#f2c84b', '#4a8be8', '#ffffff', '#4ac46a'];
        cols.forEach((c, i) => {
          rect(g, 14 + i * 9, 40, 2, 7 + (i % 2) * 3, c);
          rect(g, 15 + i * 9, 44 + (i % 2) * 3, 1, 4, c);
        });
        rect(g, 12, 39, 42, 1, '#d9c9a0');
      }),
    }),
    bus: () => ({
      w: 56, h: 34, fps: 6,
      frames: frames(2, 56, 34, (g, f) => {
        rect(g, 1, 4, 54, 24, '#2b2b2b');
        rect(g, 2, 5, 52, 22, '#f0c84a');
        rect(g, 2, 19, 52, 3, '#3a8a5a');
        for (let i = 0; i < 5; i++) rect(g, 6 + i * 9, 8, 7, 7, '#8fd0ff');
        for (let i = 0; i < 5; i++) rect(g, 6 + i * 9, 8, 7, 2, '#c8ecff');
        rect(g, 49, 8, 4, 10, '#8fd0ff');
        rect(g, 2, 3, 52, 2, '#d9a830');
        rect(g, 52, 22, 3, 3, '#fff6a0');
        for (const x of [10, 42]) {
          ellipse(g, x, 28, 4, 4, '#1a1a1a');
          ellipse(g, x, 28, 2, 2, f ? '#777' : '#999');
        }
      }),
    }),
    carrier: () => ({
      w: 16, h: 16, fps: 4,
      frames: frames(2, 16, 16, (g, f) => {
        const o = f ? 1 : 0;
        rect(g, 2 + o, 5, 12, 10, '#5a4a3a');
        rect(g, 3 + o, 6, 10, 8, '#e8dcc6');
        rect(g, 3 + o, 6, 10, 2, '#f6efe0');
        rect(g, 5 + o, 2, 6, 1, '#5a4a3a');
        rect(g, 5 + o, 2, 1, 4, '#5a4a3a');
        rect(g, 10 + o, 2, 1, 4, '#5a4a3a');
        rect(g, 5 + o, 8, 6, 5, '#2a2430');
        for (let i = 0; i < 3; i++) rect(g, 6 + o + i * 2, 8, 1, 5, '#b0b0b0');
        if (!f) {
          px(g, 7, 10, '#e8e060');
          px(g, 9, 10, '#e8e060');
        }
      }),
    }),
    sparkle: () => ({
      w: 16, h: 16, fps: 6,
      frames: frames(4, 16, 16, (g, f) => {
        const s = [1, 2, 3, 2][f];
        rect(g, 8 - s, 11, s * 2 + 1, 1, '#fff8c0');
        rect(g, 8, 11 - s, 1, s * 2 + 1, '#fff8c0');
        px(g, 8, 11, '#ffffff');
        if (f === 2) {
          px(g, 6, 9, '#ffe680');
          px(g, 10, 13, '#ffe680');
        }
      }),
    }),
    fragment: () => ({
      w: 16, h: 16, fps: 5,
      frames: frames(4, 16, 16, (g, f) => {
        const a = [0.25, 0.4, 0.55, 0.4][f];
        ellipse(g, 8, 8, 7, 7, `rgba(180,230,255,${a * 0.5})`);
        ellipse(g, 8, 8, 5, 5, `rgba(220,245,255,${a})`);
        const d = [[8, 3], [9, 4], [10, 6], [12, 8], [10, 10], [9, 12], [8, 13], [7, 12], [6, 10], [4, 8], [6, 6], [7, 4]];
        g.fillStyle = '#9fe0ff';
        for (let y = 4; y <= 12; y++) {
          const w = 4 - Math.abs(8 - y) * 0.5;
          g.fillRect(Math.round(8 - w), y, Math.round(w * 2), 1);
        }
        g.fillStyle = '#e6f8ff';
        for (let y = 5; y <= 9; y++) g.fillRect(7, y, 1, 1);
        px(g, 8, 3, '#ffffff');
        px(g, 8, 13, '#ffffff');
        if (f % 2) for (const [x, y] of d.filter((_, i) => i % 3 === 0)) px(g, x + (x > 8 ? 2 : -2), y, '#fff6b0');
      }),
    }),
    doghouse: () => ({
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        for (let i = 0; i < 6; i++) rect(g, 7 - i, 2 + i, 2 + i * 2, 1, '#b8463a');
        rect(g, 1, 7, 14, 1, '#8a2e26');
        rect(g, 2, 8, 12, 7, '#c08a52');
        for (let i = 0; i < 3; i++) rect(g, 2, 9 + i * 2, 12, 1, '#a8743f');
        ellipse(g, 8, 12, 3, 3, '#2a1a10');
        rect(g, 5, 12, 7, 3, '#2a1a10');
        rect(g, 1, 15, 14, 1, '#6a4a2a');
      }),
    }),
    scarecrow: () => ({
      w: 16, h: 24, fps: 0,
      frames: frames(1, 16, 24, (g) => {
        rect(g, 7, 8, 2, 16, '#7a5230');
        rect(g, 1, 11, 14, 2, '#7a5230');
        rect(g, 3, 10, 10, 7, '#4a7ac8');
        rect(g, 3, 13, 10, 1, '#3a5ea0');
        rect(g, 1, 10, 3, 3, '#d8b860');
        rect(g, 12, 10, 3, 3, '#d8b860');
        ellipse(g, 8, 6, 4, 4, '#e6d6a8');
        rect(g, 2, 2, 12, 2, '#d8b040');
        rect(g, 5, 0, 6, 3, '#e8c450');
        px(g, 6, 6, '#3a2a1a');
        px(g, 10, 6, '#3a2a1a');
        rect(g, 6, 8, 5, 1, '#8a3a2a');
      }),
    }),
    bench: () => ({
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        rect(g, 1, 6, 14, 2, '#8a5a30');
        rect(g, 1, 9, 14, 3, '#b07a45');
        rect(g, 2, 12, 2, 3, '#6a4020');
        rect(g, 12, 12, 2, 3, '#6a4020');
      }),
    }),
    crate: () => ({
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        rect(g, 1, 2, 14, 13, '#6a4220');
        rect(g, 2, 3, 12, 11, '#c08a4a');
        rect(g, 2, 3, 12, 1, '#dca868');
        for (let i = 0; i < 11; i++) {
          px(g, 2 + i, 3 + i, '#8a5a2a');
          px(g, 13 - i, 3 + i, '#8a5a2a');
        }
        rect(g, 1, 8, 14, 1, '#8a5a2a');
        rect(g, 1, 15, 14, 1, 'rgba(0,0,0,0.25)');
      }),
    }),
    mouse: () => ({
      w: 16, h: 16, fps: 4,
      frames: frames(2, 16, 16, (g, f) => {
        ellipse(g, 8, 12, 4, 3, '#8c8c96');
        ellipse(g, 5, 11, 2, 2, '#9c9ca6');
        ellipse(g, 4, 9, 1, 1, '#f2a0b0');
        ellipse(g, 7, 9, 1, 1, '#f2a0b0');
        px(g, 3, 11, '#1a1a1a');
        px(g, 2, 12, '#f2a0b0');
        for (let i = 0; i < 4; i++) px(g, 12 + i, 12 - (f ? i % 2 : (i + 1) % 2), '#d08a98');
      }),
    }),
    magpie: () => ({
      w: 16, h: 16, fps: 2,
      frames: frames(2, 16, 16, (g, f) => {
        ellipse(g, 8, 10, 4, 3, '#1e1e2a');
        ellipse(g, 9, 11, 3, 2, '#f6f6f6');
        ellipse(g, 5, 7 - f, 2, 2, '#1e1e2a');
        px(g, 4, 6 - f, '#ffffff');
        rect(g, 2, 7 - f, 2, 1, '#3a3a3a');
        rect(g, 11, 9, 4, 2, '#2a3a7a');
        rect(g, 12, 8, 3, 1, '#3a5ab0');
        rect(g, 7, 13, 1, 2, '#3a3a3a');
        rect(g, 9, 13, 1, 2, '#3a3a3a');
      }),
    }),
    plasticBag: () => ({
      w: 16, h: 16, fps: 3,
      frames: frames(2, 16, 16, (g, f) => {
        ellipse(g, 8, 11, 5, 4 - f, '#e8eef0');
        rect(g, 5, 6 + f, 2, 3, '#e8eef0');
        rect(g, 10, 6 + f, 2, 3, '#e8eef0');
        px(g, 7, 11, '#c0c8cc');
        px(g, 9, 12, '#c0c8cc');
      }),
    }),
    ball: () => ({
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        ellipse(g, 8, 11, 4, 4, '#d83a3a');
        rect(g, 4, 11, 9, 1, '#ffffff');
        px(g, 6, 9, '#ff9a9a');
      }),
    }),
    backpack: () => ({
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        rect(g, 1, 6, 14, 2, '#8a5a30');
        rect(g, 1, 9, 14, 3, '#b07a45');
        rect(g, 2, 12, 2, 3, '#6a4020');
        rect(g, 12, 12, 2, 3, '#6a4020');
        rect(g, 5, 3, 7, 7, '#e86a8a');
        rect(g, 6, 6, 5, 3, '#f8a0b8');
        rect(g, 7, 2, 3, 1, '#a83a5a');
      }),
    }),
    sleeper: (p) => ({
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        rect(g, 1, 2, 14, 14, '#f6f0e6');
        ellipse(g, 8, 4, 3, 3, p.hair || '#3a2a20');
        rect(g, 6, 5, 4, 2, p.skin || '#f7d3b5');
        rect(g, 1, 7, 14, 9, p.quilt || '#f08aa8');
        for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) px(g, 3 + i * 3, 9 + j * 3, '#ffffff');
        rect(g, 1, 7, 14, 1, 'rgba(255,255,255,0.5)');
      }),
    }),
    bell: () => ({
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        ellipse(g, 8, 9, 5, 5, '#b8862a');
        ellipse(g, 8, 9, 4, 4, '#f2c84b');
        ellipse(g, 7, 7, 1, 1, '#fff2b0');
        rect(g, 3, 9, 10, 1, '#b8862a');
        rect(g, 7, 11, 2, 2, '#5a3a10');
        rect(g, 7, 2, 2, 2, '#b8862a');
      }),
    }),
    leek: () => ({
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        rect(g, 7, 3, 2, 9, '#4caf50');
        rect(g, 5, 2, 1, 6, '#4caf50');
        rect(g, 10, 2, 1, 6, '#4caf50');
        rect(g, 7, 11, 2, 4, '#eef6e6');
      }),
    }),
    hairpin: () => ({
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        rect(g, 3, 8, 10, 1, '#d8dce4');
        rect(g, 3, 7, 2, 3, '#c0c4cc');
        ellipse(g, 12, 8, 2, 2, '#e6e8f0');
        px(g, 12, 8, '#9ad');
      }),
    }),
    collar: () => ({
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        ellipse(g, 8, 9, 5, 4, '#c03030');
        ellipse(g, 8, 9, 3, 2, 'rgba(0,0,0,0)');
        g.clearRect(5, 8, 7, 2);
        rect(g, 7, 12, 3, 3, '#f2c84b');
      }),
    }),
    chew: () => ({
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        rect(g, 4, 7, 8, 2, '#f0e0c0');
        ellipse(g, 4, 6, 2, 2, '#f0e0c0');
        ellipse(g, 4, 10, 2, 2, '#f0e0c0');
        ellipse(g, 12, 6, 2, 2, '#f0e0c0');
        ellipse(g, 12, 10, 2, 2, '#f0e0c0');
      }),
    }),
    anchovy: () => ({
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        ellipse(g, 8, 8, 5, 2, '#b8c4d0');
        rect(g, 12, 6, 2, 5, '#98a4b0');
        px(g, 4, 7, '#1a1a1a');
      }),
    }),
    paw: () => ({
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        ellipse(g, 8, 10, 4, 3, '#ffffff');
        for (const [x, y] of [[3, 5], [6, 3], [10, 3], [13, 5]]) ellipse(g, x, y, 1, 2, '#ffffff');
      }),
    }),
    /* ---- 2장 ---- */
    firefly: () => ({
      // 깜빡이 (시안 A: 연두빛 동글이)
      w: 16, h: 16, fps: 3,
      frames: frames(2, 16, 16, (g, f) => {
        ellipse(g, 8, 8, 6, 6, `rgba(230,255,120,${f ? 0.35 : 0.2})`);
        ellipse(g, 8, 6, 3, 3, '#3a3a2a');
        px(g, 7, 6, '#fff');
        px(g, 9, 6, '#fff');
        ellipse(g, 8, 10, 3, 3, f ? '#f6ff8a' : '#d8f060');
        px(g, 8, 11, '#ffffff');
        rect(g, 4, 6, 2, 2, 'rgba(255,255,255,0.7)');
        rect(g, 10, 6, 2, 2, 'rgba(255,255,255,0.7)');
        px(g, 6, 3, '#3a3a2a');
        px(g, 10, 3, '#3a3a2a');
        px(g, 5, 2, '#3a3a2a');
        px(g, 11, 2, '#3a3a2a');
      }),
    }),
    bat: () => ({
      w: 16, h: 16, fps: 6,
      frames: frames(2, 16, 16, (g, f) => {
        ellipse(g, 8, 7, 3, 3, '#1a1420');
        if (f) {
          rect(g, 1, 4, 5, 2, '#1a1420');
          rect(g, 10, 4, 5, 2, '#1a1420');
          px(g, 1, 6, '#1a1420');
          px(g, 14, 6, '#1a1420');
        } else {
          rect(g, 2, 7, 4, 2, '#1a1420');
          rect(g, 10, 7, 4, 2, '#1a1420');
          px(g, 2, 9, '#1a1420');
          px(g, 13, 9, '#1a1420');
        }
        px(g, 7, 6, '#ff4a4a');
        px(g, 9, 6, '#ff4a4a');
        px(g, 6, 4, '#1a1420');
        px(g, 10, 4, '#1a1420');
      }),
    }),
    mirrorA: () => mirrorStone(false),
    mirrorB: () => mirrorStone(true),
    crystal: () => crystal(false),
    crystalLit: () => crystal(true),
    lightCrack: () => ({
      w: 16, h: 16, fps: 3,
      frames: frames(2, 16, 16, (g, f) => {
        rect(g, 6, 2, 4, 12, f ? '#fff6c0' : '#ffe680');
        rect(g, 7, 0, 2, 16, '#ffffff');
        ellipse(g, 8, 8, 7, 7, 'rgba(255,240,150,0.25)');
      }),
    }),
    gateRock: () => ({
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        rect(g, 0, 0, 16, 16, '#3a3346');
        ellipse(g, 8, 8, 7, 7, '#4a4258');
        rect(g, 3, 4, 10, 1, '#2a2433');
        rect(g, 5, 9, 8, 1, '#2a2433');
        ellipse(g, 8, 8, 2, 2, '#5ab0e0');
      }),
    }),
    log: () => ({
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        rect(g, 0, 7, 16, 6, '#7a4a28');
        rect(g, 0, 7, 16, 1, '#9a6a3a');
        ellipse(g, 14, 10, 2, 3, '#c08a52');
        px(g, 14, 10, '#7a4a28');
        rect(g, 4, 5, 1, 2, '#4caf50');
      }),
    }),
    plank: () => ({
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        rect(g, 0, 3, 16, 10, '#8a5a30');
        rect(g, 0, 3, 16, 1, '#b07a45');
        rect(g, 0, 8, 16, 1, '#6a4020');
        ellipse(g, 2, 8, 1, 3, '#c08a52');
      }),
    }),
    candle: () => ({
      w: 16, h: 16, fps: 4,
      frames: frames(2, 16, 16, (g, f) => {
        rect(g, 6, 9, 4, 6, '#f6f0e0');
        rect(g, 5, 14, 6, 2, '#c08a52');
        ellipse(g, 8, 6 - f, 2, 3, '#ffb04a');
        px(g, 8, 6 - f, '#fff6c0');
      }),
    }),
    flashlightIcon: () => ({
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        rect(g, 3, 6, 8, 4, '#3a6ae8');
        rect(g, 11, 5, 3, 6, '#c0c4cc');
        rect(g, 14, 6, 1, 4, '#fff6a0');
        rect(g, 5, 7, 2, 1, '#8fb0ff');
      }),
    }),
    /* ---- 3장 ---- */
    owl: () => ({
      // 똑딱 선생 (시안 A: 갈색 수리부엉이 + 동그란 안경)
      w: 16, h: 18, fps: 1,
      frames: frames(2, 16, 18, (g, f) => {
        rect(g, 3, 1, 2, 3, '#6a4a2a');
        rect(g, 11, 1, 2, 3, '#6a4a2a');
        ellipse(g, 8, 10, 6, 7, '#8a5e36');
        ellipse(g, 8, 12, 4, 4, '#d8c09a');
        for (let i = 0; i < 3; i++) {
          px(g, 6 + i * 2, 11, '#8a5e36');
          px(g, 7 + i * 2, 13, '#8a5e36');
        }
        ellipse(g, 5, 7, 3, 3, '#f0e0b0');
        ellipse(g, 11, 7, 3, 3, '#f0e0b0');
        if (f) {
          rect(g, 4, 7, 3, 1, '#1a1a1a');
          rect(g, 10, 7, 3, 1, '#1a1a1a');
        } else {
          px(g, 5, 7, '#1a1a1a');
          px(g, 11, 7, '#1a1a1a');
        }
        g.strokeStyle = '#d0a020';
        g.lineWidth = 1;
        g.beginPath();
        g.arc(5.5, 7.5, 3.2, 0, 7);
        g.stroke();
        g.beginPath();
        g.arc(11.5, 7.5, 3.2, 0, 7);
        g.stroke();
        rect(g, 8, 9, 1, 2, '#e0a030');
        rect(g, 5, 17, 2, 1, '#e0a030');
        rect(g, 9, 17, 2, 1, '#e0a030');
      }),
    }),
    gear: () => ({
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          rect(g, Math.round(8 + Math.cos(a) * 6) - 1, Math.round(9 + Math.sin(a) * 6) - 1, 3, 3, '#8a7a5a');
        }
        ellipse(g, 8, 9, 5, 5, '#b0a070');
        ellipse(g, 8, 9, 2, 2, '#4a3a20');
        px(g, 6, 6, '#e0d0a0');
      }),
    }),
    basket: () => ({
      w: 16, h: 24, fps: 0,
      frames: frames(1, 16, 24, (g) => {
        rect(g, 7, 0, 2, 10, '#c8b090');
        rect(g, 2, 10, 12, 12, '#8a5a30');
        for (let y = 12; y < 22; y += 3) rect(g, 2, y, 12, 1, '#6a4020');
        for (let x = 4; x < 14; x += 3) rect(g, x, 10, 1, 12, '#a07040');
        rect(g, 1, 9, 14, 2, '#5a3a1a');
      }),
    }),
    lever: () => lever(false),
    leverOn: () => lever(true),
    clockFace: () => ({
      w: 32, h: 32, fps: 1,
      frames: frames(2, 32, 32, (g, f) => {
        ellipse(g, 16, 16, 15, 15, '#6a4a2a');
        ellipse(g, 16, 16, 13, 13, '#f0e6cc');
        for (let h = 0; h < 12; h++) {
          const a = (h / 12) * Math.PI * 2;
          px(g, Math.round(16 + Math.cos(a) * 11), Math.round(16 + Math.sin(a) * 11), '#3a2a1a');
        }
        rect(g, 16, 6, 1, 10, '#2a1a10');
        rect(g, 16, 16, 6, 1, '#2a1a10');
        ellipse(g, 16, 16, 1, 1, '#c0a040');
        void f;
      }),
    }),
    clockFace4: () => ({
      w: 32, h: 32, fps: 2,
      frames: frames(2, 32, 32, (g, f) => {
        ellipse(g, 16, 16, 15, 15, '#6a4a2a');
        ellipse(g, 16, 16, 13, 13, f ? '#fff8dc' : '#f0e6cc');
        for (let h = 0; h < 12; h++) {
          const a = (h / 12) * Math.PI * 2;
          px(g, Math.round(16 + Math.cos(a) * 11), Math.round(16 + Math.sin(a) * 11), '#3a2a1a');
        }
        rect(g, 16, 5, 1, 11, '#2a1a10');
        for (let i = 0; i < 7; i++) px(g, 16 + i, 16 + Math.round(i * 0.58), '#2a1a10');
        ellipse(g, 16, 16, 1, 1, '#c0a040');
      }),
    }),
    phone: () => ({
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        rect(g, 2, 8, 12, 6, '#c03a3a');
        rect(g, 3, 6, 10, 3, '#d84a4a');
        rect(g, 2, 5, 3, 2, '#2a2a2a');
        rect(g, 11, 5, 3, 2, '#2a2a2a');
        rect(g, 4, 4, 8, 2, '#2a2a2a');
        ellipse(g, 8, 11, 2, 2, '#f0e6cc');
      }),
    }),
    /* ---- 5장 ---- */
    plate: () => ({
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        rect(g, 2, 3, 12, 11, '#a89040');
        rect(g, 3, 4, 10, 9, '#e8d070');
        rect(g, 6, 7, 4, 3, '#c8b050');
      }),
    }),
    glassGate: () => ({
      w: 16, h: 16, fps: 2,
      frames: frames(2, 16, 16, (g, f) => {
        rect(g, 1, 0, 14, 16, '#8a8aac');
        rect(g, 2, 1, 12, 14, f ? '#d8e8fc' : '#c8dcf4');
        for (let i = 0; i < 4; i++) px(g, 4 + i * 2, 3 + i * 2, '#ffffff');
      }),
    }),
    bigMirror: () => bigMirror(false),
    bigMirrorJ: () => bigMirror(true),
    bigMirrorBroken: () => ({
      w: 24, h: 32, fps: 0,
      frames: frames(1, 24, 32, (g) => {
        rect(g, 0, 0, 24, 32, '#8a7a9a');
        rect(g, 2, 2, 20, 28, '#3a3a58');
        for (const [x, y] of [[4, 6], [12, 4], [16, 14], [6, 20], [14, 24]]) rect(g, x, y, 3, 2, '#c8dcf4');
        rect(g, 0, 30, 24, 2, '#5a4a6a');
      }),
    }),
    suitcase: () => ({
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        rect(g, 3, 6, 10, 9, '#8a4a3a');
        rect(g, 3, 6, 10, 1, '#aa6a5a');
        rect(g, 6, 3, 4, 3, '#5a2a1a');
        rect(g, 7, 4, 2, 2, 'rgba(0,0,0,0)');
      }),
    }),
    /* ---- 4장 ---- */
    kittenB: () => ({
      // 아기 감투 (시안 B: 동글동글 솜뭉치 + 큰 눈)
      w: 16, h: 16, fps: 3,
      frames: frames(2, 16, 16, (g, f) => {
        const o = f ? 1 : 0;
        ellipse(g, 8, 10 + o, 5, 5 - o, '#5a2e14');
        ellipse(g, 8, 10 + o, 4, 4 - o, '#f2a24a');
        rect(g, 4, 4 + o, 2, 3, '#5a2e14');
        rect(g, 10, 4 + o, 2, 3, '#5a2e14');
        px(g, 5, 6 + o, '#f29aa8');
        px(g, 10, 6 + o, '#f29aa8');
        rect(g, 6, 9 + o, 2, 2, '#2a1a10');
        rect(g, 9, 9 + o, 2, 2, '#2a1a10');
        px(g, 6, 9 + o, '#fff');
        px(g, 9, 9 + o, '#fff');
        px(g, 8, 11 + o, '#f29aa8');
        rect(g, 7, 6 + o, 2, 1, '#9a5222');
        ellipse(g, 8, 13 + o, 2, 1, '#f7c27a');
      }),
    }),
    umbrellaJaehee: () => ({
      w: 16, h: 24, fps: 0,
      frames: frames(1, 16, 24, (g) => {
        for (let i = 0; i < 6; i++) rect(g, 8 - i - 2, 1 + i, (i + 2) * 2, 1, '#ffd34d');
        rect(g, 1, 7, 14, 1, '#d8a020');
        g.drawImage(S.frame(S.get('littleJaehee'), 'up', 0, 0), 0, 8);
        rect(g, 8, 7, 1, 6, '#5a3a1a');
      }),
    }),
    branch: () => ({
      w: 32, h: 16, fps: 0,
      frames: frames(1, 32, 16, (g) => {
        rect(g, 2, 9, 28, 4, '#5a3a22');
        rect(g, 2, 9, 28, 1, '#7a5232');
        for (const [x, y] of [[6, 5], [14, 4], [22, 6], [27, 7]]) {
          rect(g, x, y + 2, 1, 4, '#5a3a22');
          ellipse(g, x, y, 3, 2, '#3c8c45');
        }
      }),
    }),
    gateWood: () => ({
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        rect(g, 1, 3, 14, 12, '#6a4424');
        for (let x = 2; x < 15; x += 3) rect(g, x, 4, 2, 10, '#9a6a3a');
        rect(g, 1, 6, 14, 1, '#4a2e14');
        rect(g, 1, 11, 14, 1, '#4a2e14');
      }),
    }),
    none: () => ({ w: 16, h: 16, fps: 0, frames: [U.canvas(16, 16)] }),
  };
  function bigMirror(withJ) {
    return {
      w: 24, h: 32, fps: 2,
      frames: frames(2, 24, 32, (g, f) => {
        rect(g, 0, 0, 24, 32, '#8a7a9a');
        rect(g, 2, 2, 20, 28, f ? '#d0e0f6' : '#c8d8f0');
        for (let i = 0; i < 6; i++) px(g, 4 + i * 2, 4 + i, '#ffffff');
        if (withJ) {
          g.globalAlpha = 0.8;
          g.drawImage(S.frame(S.get('jaehee'), 'down', f ? 1 : 0, 0), 4, 10);
          g.globalAlpha = 1;
        }
        rect(g, 0, 30, 24, 2, '#5a4a6a');
      }),
    };
  }
  function lever(on) {
    return {
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        rect(g, 4, 11, 8, 4, '#5a4a3a');
        rect(g, 4, 11, 8, 1, '#7a6a5a');
        for (let i = 0; i < 7; i++) px(g, on ? 8 + Math.round(i * 0.6) : 8 - Math.round(i * 0.6), 11 - i, '#8a8a90');
        ellipse(g, on ? 12 : 4, 4, 2, 2, '#d84a4a');
      }),
    };
  }
  function mirrorStone(back) {
    return {
      w: 16, h: 16, fps: 0,
      frames: frames(1, 16, 16, (g) => {
        ellipse(g, 8, 12, 6, 3, '#4a4258');
        ellipse(g, 8, 11, 6, 3, '#7a7a8a');
        for (let i = 0; i < 9; i++) {
          const x = back ? 4 + i : 12 - i;
          rect(g, x, 2 + i, 2, 1, '#bfe8ff');
          px(g, x + 2, 2 + i, '#5a7a9a');
        }
      }),
    };
  }
  function crystal(lit) {
    return {
      w: 16, h: 16, fps: lit ? 4 : 0,
      frames: frames(lit ? 2 : 1, 16, 16, (g, f) => {
        if (lit) ellipse(g, 8, 8, 8, 8, `rgba(150,220,255,${f ? 0.4 : 0.25})`);
        ellipse(g, 8, 8, 5, 7, lit ? '#9fe0ff' : '#4a6a8a');
        ellipse(g, 7, 6, 2, 3, lit ? '#ffffff' : '#7a9aba');
        rect(g, 4, 14, 8, 2, '#3a3346');
      }),
    };
  }
  S.PROC = PROC;

  /** 키로 스프라이트 시트를 얻는다 (지연 생성 + 캐시) */
  S.get = function (key) {
    if (!key) return null;
    if (S.cache[key]) return S.cache[key];
    const def = GameData.sprites[key] || (PROC[key] ? { type: 'proc', draw: key } : null);
    if (!def) {
      console.warn('스프라이트 없음:', key);
      return (S.cache[key] = PROC.none());
    }
    let sheet;
    if (def.type === 'human') sheet = human(def);
    else if (def.type === 'cat') sheet = cat(def);
    else if (def.type === 'dog') sheet = dog(def);
    else sheet = PROC[def.draw](def);
    sheet.key = key;
    return (S.cache[key] = sheet);
  };

  /** 프레임 하나를 고른다 */
  S.frame = function (sheet, dir, step, t) {
    if (sheet.dirs) {
      const fr = sheet.frames[dir] || sheet.frames.down;
      return fr[step] || fr[0];
    }
    if (!sheet.fps) return sheet.frames[0];
    return sheet.frames[Math.floor((t / 1000) * sheet.fps) % sheet.frames.length];
  };

  /** 초상화(대화창용) 캔버스에 그린다 */
  S.drawPortrait = function (canvas, key) {
    const g = canvas.getContext('2d');
    g.clearRect(0, 0, canvas.width, canvas.height);
    const sh = S.get(key);
    if (!sh) return;
    const img = S.frame(sh, 'down', 0, 0);
    const sc = Math.max(1, Math.floor(Math.min(canvas.width / sh.w, canvas.height / sh.h)));
    g.imageSmoothingEnabled = false;
    // 얼굴 위주로 확대
    const crop = sh.h > 20 ? sh.h : 13;
    const s2 = Math.max(1, Math.floor(canvas.width / Math.max(sh.w, crop)));
    const dw = sh.w * s2,
      dh = sh.h * s2;
    g.drawImage(img, Math.round((canvas.width - dw) / 2), Math.round((canvas.height - dh) / 2 + (sh.h > 20 ? 0 : s2 * 1.5)), dw, dh);
    void sc;
  };

  S.dataURL = function (key, scale = 2) {
    const sh = S.get(key);
    const img = S.frame(sh, 'down', 0, 0);
    const c = U.canvas(sh.w * scale, sh.h * scale);
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL();
  };
})();
