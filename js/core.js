'use strict';
/*
 * core.js — 전역 네임스페이스와 데이터 등록 API
 * data/ 폴더의 파일들은 GameData.define* 함수만 사용해서 내용을 등록한다.
 * (엔진 코드와 데이터가 분리되어 있어 새 장을 추가하기 쉽다)
 */
(function () {
  const GD = (window.GameData = {
    config: {},
    sprites: {},
    characters: {},
    items: {},
    music: {},
    maps: {},
    mapEvents: {},
    scripts: {},
    chapters: [],
  });

  GD.defineConfig = (o) => Object.assign(GD.config, o);
  GD.defineSprites = (o) => Object.assign(GD.sprites, o);
  GD.defineCharacters = (o) => Object.assign(GD.characters, o);
  GD.defineItems = (o) => Object.assign(GD.items, o);
  GD.defineMusic = (o) => Object.assign(GD.music, o);
  GD.defineScripts = (o) => Object.assign(GD.scripts, o);
  GD.defineMap = (id, def) => {
    GD.maps[id] = def;
  };
  /** 다른 파일(장)에서 기존 맵에 이벤트를 추가한다 */
  GD.addEvents = (mapId, events) => {
    (GD.mapEvents[mapId] = GD.mapEvents[mapId] || []).push(...events);
  };
  GD.defineChapter = (ch) => {
    GD.chapters.push(ch);
    GD.chapters.sort((a, b) => a.num - b.num);
  };

  const G = (window.G = { T: 16, W: 320, H: 240, time: 0, frame: 0, debug: { speed: 1 } });

  G.U = {
    clamp: (v, a, b) => (v < a ? a : v > b ? b : v),
    lerp: (a, b, t) => a + (b - a) * t,
    hash(x, y, s = 0) {
      let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 982451653);
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    },
    DIRS: { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] },
    OPP: { up: 'down', down: 'up', left: 'right', right: 'left' },
    LETTER: { U: 'up', D: 'down', L: 'left', R: 'right' },
    canvas(w, h) {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      return c;
    },
    copy: (o) => JSON.parse(JSON.stringify(o)),
    dirTo(ax, ay, bx, by) {
      const dx = bx - ax,
        dy = by - ay;
      if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? 'left' : 'right';
      return dy < 0 ? 'up' : 'down';
    },
    fmtTime(sec) {
      sec = Math.floor(sec);
      const h = Math.floor(sec / 3600),
        m = Math.floor((sec % 3600) / 60),
        s = sec % 60;
      return (h ? h + ':' : '') + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    },
  };

  /* 게임 시간 기반 대기 (디버그 배속에도 맞춰 빨라진다) */
  G.frameWaiters = [];
  G.nextFrame = () => new Promise((r) => G.frameWaiters.push(r));
  G.wait = async (ms) => {
    const end = G.time + ms;
    while (G.time < end) await G.nextFrame();
  };
  G.$ = (sel) => document.querySelector(sel);
})();
