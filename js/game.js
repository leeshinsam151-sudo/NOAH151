'use strict';
/* game.js — 게임 상태, 맵 진행, 플레이어 조작, 동료 따라오기, 렌더링, 저장/불러오기 */
(function () {
  const U = G.U;
  const T = 16;
  const SAVE_KEY = 'gamtu_save_';

  const Game = (G.game = {
    scene: 'boot',
    state: null,
    map: null,
    actors: {},
    busy: false,
    cam: { x: 0, y: 0 },
    camOverride: null,
    shake: null,
    particles: [],
    weather: { type: null, parts: [] },
    bumpCool: 0,
    fadeLevel: 0,
  });

  Game.newState = function () {
    return {
      flags: {},
      vars: { chapter: 0, courage: 0 },
      items: {},
      abilities: {},
      party: ['jaehee'],
      follow: {},
      control: 'jaehee',
      screen: { gray: 0, tone: '' },
      goal: '',
      chapterTitle: '',
      playtime: 0,
      hideParty: false,
      noSwitch: false,
      bgm: null,
    };
  };

  function makeActor(id) {
    const def = GameData.config.party[id];
    const a = new G.Actor({ id, sprite: def.sprite, kind: def.kind || id, speed: def.speed || 5, offset: def.offset });
    a.float = !!def.float;
    a.lightR = def.light || 0;
    a.onMoveStart = (actor, fx, fy) => Game.trail(actor, fx, fy);
    a.onArrive = (actor) => Game.arrived(actor);
    a.mapId = null;
    return a;
  }
  Game.actor = function (id) {
    if (!Game.actors[id]) Game.actors[id] = makeActor(id);
    return Game.actors[id];
  };
  Game.controlled = () => Game.actor(Game.state.control || 'jaehee');
  Game.partyHere = () => Game.state.party.map((id) => Game.actor(id)).filter((a) => a.mapId === (Game.map && Game.map.id));

  /** 앞장서는 캐릭터: 보통은 재희, flags.gamtuLeads 일 때는 감투가 앞장서고 재희가 따라온다 */
  Game.leader = function () {
    const s = Game.state;
    if (s.control === 'jaehee') return 'jaehee';
    if (s.control === 'gamtu' && s.flags.gamtuLeads) return 'gamtu';
    return null;
  };
  /** 따라오는 동료들 */
  Game.chain = function () {
    const s = Game.state;
    const lead = Game.leader();
    if (!lead) return [];
    const order = lead === 'jaehee' ? s.party.slice(1) : ['jaehee', ...s.party.filter((id) => id !== 'jaehee' && id !== 'gamtu')];
    return order
      .filter((id) => s.follow[id] !== false)
      .map((id) => Game.actor(id))
      .filter((a) => a.mapId === Game.map.id && a.visible);
  };
  Game.trail = function (actor, fx, fy) {
    if (actor.id !== Game.leader() || actor.jumping) return;
    let px = fx,
      py = fy;
    for (const f of Game.chain()) {
      const ox = f.x,
        oy = f.y;
      if ((ox !== px || oy !== py) && !f.route) f.moveTo(px, py, { speed: actor.curSpeed });
      px = ox;
      py = oy;
    }
  };
  Game.arrived = function (actor) {
    if (actor === Game.controlled() && !Game.busy && Game.scene === 'map') Game.checkTouch(actor);
    if (actor.id === 'gamtu' && actor === Game.controlled() && G.tiles.get(Game.map.tile(actor.x, actor.y))) {
      if (actor._landing) G.audio.se('land');
    }
  };

  /* ---------- 새 게임 / 장면 ---------- */
  Game.newGame = async function () {
    Game.state = Game.newState();
    Game.actors = {};
    Game.scene = 'map';
    const first = GameData.chapters[0];
    const start = GameData.config.start;
    Game.warp(start.map, start.x, start.y, start.dir, { initial: true });
    Game.applyScreen(0);
    await G.interp.run(first.start);
  };

  Game.warp = function (mapId, x, y, dir, opt = {}) {
    const s = Game.state;
    const lead = Game.controlled();
    const oldMap = Game.map && Game.map.id;
    const movers = opt.cat ? [lead] : s.party.map((id) => Game.actor(id)).filter((a) => !oldMap || a.mapId === oldMap || a.mapId === null || opt.all);
    if (oldMap !== mapId || !Game.map || opt.reload) Game.loadMap(mapId, opt);
    lead.mapId = mapId;
    lead.place(x, y, dir || lead.dir);
    if (!opt.cat) {
      const others = movers.filter((a) => a !== lead);
      Game.placeBehind(lead, others);
    }
    Game.snapCamera();
    Game.checkTouchOnWarp = true;
  };

  Game.placeBehind = function (lead, others) {
    const back = U.DIRS[U.OPP[lead.dir]];
    let x = lead.x,
      y = lead.y;
    for (const a of others) {
      a.mapId = Game.map.id;
      const nx = x + back[0],
        ny = y + back[1];
      if (Game.map.tilePass(nx, ny, a.kind) && !Game.map.blockerAt(nx, ny)) {
        x = nx;
        y = ny;
      }
      a.place(x, y, lead.dir);
    }
  };

  Game.gather = function () {
    const lead = Game.actors.jaehee;
    const others = Game.state.party.slice(1).map((id) => Game.actor(id)).filter((a) => a.visible);
    Game.placeBehind(lead, others);
  };

  Game.loadMap = function (id, opt = {}) {
    Game.map = new G.GameMap(id);
    const def = Game.map.def;
    Game.camOverride = null;
    Game.particles = [];
    const bgm = Game.resolve(def.bgm);
    if (bgm !== undefined && !opt.keepBgm) {
      Game.state.bgm = bgm;
      if (bgm) G.audio.playBgm(bgm);
      else G.audio.stopBgm();
    }
    Game.setWeather(Game.resolve(def.weather) || null);
    Game.applyScreen(0);
    if (def.name && !def.noBanner && !opt.initial) G.dialog.banner(def.name);
  };

  /** 맵 속성: 값 또는 [{cond, v}, ...] */
  Game.resolve = function (v) {
    if (!Array.isArray(v)) return v;
    for (const it of v) if (G.interp.cond(it.cond)) return it.v;
    return undefined;
  };

  Game.partyOp = function (op, id, x, y, dir) {
    const s = Game.state;
    if (op === 'add') {
      if (!s.party.includes(id)) s.party.push(id);
      const a = Game.actor(id);
      a.mapId = Game.map.id;
      a.visible = true;
      if (x !== undefined) a.place(x, y, dir);
      else Game.placeBehind(Game.actors.jaehee, [a]);
      s.follow[id] = true;
    } else if (op === 'remove') {
      s.party = s.party.filter((p) => p !== id);
      if (Game.actors[id]) Game.actors[id].mapId = null;
    }
  };

  Game.setControl = function (who, silent) {
    const s = Game.state;
    s.control = who;
    if (who === 'jaehee') {
      const c = Game.actors.gamtu;
      if (c && c.mapId === Game.map.id) {
        const j = Game.actors.jaehee;
        if (Math.abs(c.x - j.x) + Math.abs(c.y - j.y) > 1) {
          Game.sparkleAt(c, '#ffffff');
          Game.placeBehind(j, [c]);
          Game.sparkleAt(c, '#ffffff');
        }
      }
    }
    if (!silent) G.dialog.toast(who === 'gamtu' ? '감투를 조작합니다' : '재희를 조작합니다', 'switch');
  };

  Game.trySwitch = function () {
    const s = Game.state;
    if (!s.flags.canSwitch || !s.party.includes('gamtu')) return;
    if (s.noSwitch || s.flags.gamtuLeads || (Game.map.def.noSwitch && !Game.resolve(Game.map.def.allowSwitch))) {
      G.dialog.toast(Game.map.def.noSwitchMsg || '지금은 바꿀 수 없다.');
      return;
    }
    if (s.control === 'jaehee') {
      const c = Game.actors.gamtu;
      if (!c || c.mapId !== Game.map.id || !c.visible) return;
      G.audio.se('meowSmall');
      Game.setControl('gamtu');
    } else {
      const j = Game.actors.jaehee;
      if (j.mapId !== Game.map.id) {
        G.dialog.toast('재희는 밖에서 기다리고 있다. 먼저 돌아가자.');
        return;
      }
      G.audio.se('ok');
      Game.setControl('jaehee');
    }
  };

  /* ---------- 업데이트 ---------- */
  Game.update = function (dt) {
    if (Game.scene !== 'map' || !Game.map) return;
    const s = Game.state;
    s.playtime += dt / G.debug.speed;
    if (Game.bumpCool > 0) Game.bumpCool -= dt;
    for (const a of Game.partyHere()) a.update(dt);
    for (const e of Game.map.events) {
      if (!e.active) continue;
      e.update(dt);
      if (!Game.busy) Game.updateEventMove(e, dt);
    }
    if (!Game.busy && !G.ui.menuOpen) {
      if (G.frame % 6 === 0) Game.map.refresh();
      Game.updatePlayer();
      if (!Game.busy) Game.checkAuto();
      if (!Game.busy) Game.checkCatch();
    }
    if (Game.shake) {
      Game.shake.t -= dt;
      if (Game.shake.t <= 0) Game.shake = null;
    }
    Game.updateBeams();
    Game.updateParticles(dt);
    Game.updateCamera(dt);
  };

  Game.free = function (x, y, kind, ignoreParty) {
    const m = Game.map;
    if (!m.tilePass(x, y, kind)) return false;
    if (m.blockerAt(x, y)) return false;
    if (!ignoreParty && Game.partyHere().some((a) => a.visible && a.x === x && a.y === y)) return false;
    return true;
  };

  Game.updatePlayer = function () {
    const I = G.input,
      s = Game.state;
    if (s.hideParty) return;
    const lead = Game.controlled();
    if (!lead || lead.moving || lead.route || lead.mapId !== Game.map.id) return;
    if (I.hit('cancel')) {
      G.ui.openMenu();
      return;
    }
    if (I.hit('switch')) {
      Game.trySwitch();
      return;
    }
    if (I.hit('ok') && Game.checkAction(lead)) return;
    const d = I.dir();
    if (d) Game.tryMove(lead, d);
  };

  Game.tryMove = function (a, d) {
    const m = Game.map,
      s = Game.state;
    const [dx, dy] = U.DIRS[d];
    const nx = a.x + dx,
      ny = a.y + dy;
    a.dir = d;
    const ev = m.blockerAt(nx, ny);
    if (ev) {
      if (ev.page.push && a.kind === 'jaehee') {
        if (Game.free(nx + dx, ny + dy, 'box') && !ev.moving) {
          ev.startMove(d, { speed: 3.2 });
          G.audio.se('push');
          a.startMove(d, { speed: 3.2 });
        }
        return;
      }
      if (ev.trigger === 'touch') Game.runEvent(ev);
      return;
    }
    if (!m.tilePass(nx, ny, a.kind)) {
      const t = G.tiles.get(m.tile(nx, ny));
      const jx = nx + dx,
        jy = ny + dy;
      const landing = t.water && m.tilePass(jx, jy, 'gamtu') && !m.blockerAt(jx, jy);
      if (landing && a.kind === 'gamtu') {
        if (s.abilities.jump) {
          G.audio.se('jump');
          a._landing = true;
          a.startMove(d, { jump: true });
        } else Game.bumpScript('fear_water');
        return;
      }
      if (landing && a.kind === 'jaehee') Game.bumpScript('jaehee_water');
      return;
    }
    a._landing = false;
    a.startMove(d);
  };

  Game.bumpScript = function (name) {
    if (Game.bumpCool > 0 || !GameData.scripts[name]) return;
    Game.bumpCool = 0.8;
    G.input.releaseAll();
    G.interp.run(name);
  };

  Game.checkAction = function (a) {
    const m = Game.map;
    const [dx, dy] = U.DIRS[a.dir];
    const fx = a.x + dx,
      fy = a.y + dy;
    const pick = (list) => list.find((e) => e.trigger === 'action' && e.page.script);
    let ev = pick(m.eventsAt(fx, fy));
    if (!ev && 'LQ'.includes(m.tile(fx, fy))) ev = pick(m.eventsAt(fx + dx, fy + dy));
    if (!ev) ev = pick(m.eventsAt(a.x, a.y).filter((e) => e.through));
    if (ev) {
      Game.runEvent(ev);
      return true;
    }
    // 동료에게 말 걸기
    const mate = Game.partyHere().find((p) => p !== a && p.visible && p.x === fx && p.y === fy);
    if (mate) {
      const name = 'talk_' + mate.id;
      if (GameData.scripts[name]) {
        const old = mate.dir;
        mate.dir = U.OPP[a.dir];
        G.interp.run(name).then(() => {
          mate.dir = mate.dir || old;
        });
        return true;
      }
    }
    return false;
  };

  Game.runEvent = function (ev) {
    const p = ev.page;
    if (!p || !p.script) return;
    if (ev.sprite && !p.noTurn && !ev.moving) {
      const sh = G.sprites.get(ev.sprite);
      if (sh && sh.dirs) {
        const pl = Game.controlled();
        ev.dir = U.dirTo(ev.x, ev.y, pl.x, pl.y);
      }
    }
    G.input.releaseAll();
    G.interp.run(p.script, { self: ev });
  };

  Game.checkTouch = function (a) {
    const evs = Game.map.eventsAt(a.x, a.y).filter((e) => e.through && e.trigger === 'touch' && e.page.script);
    if (evs.length) Game.runEvent(evs[0]);
  };

  Game.checkAuto = function () {
    if (Game.checkTouchOnWarp) {
      Game.checkTouchOnWarp = false;
    }
    const ev = Game.map.events.find((e) => e.active && e.trigger === 'auto' && e.page.script);
    if (ev) Game.runEvent(ev);
  };

  Game.checkCatch = function () {
    if (Game.state.hideParty || G.debug.noCatch) return;
    for (const e of Game.map.events) {
      if (!e.active || !e.page.catch) continue;
      for (const a of Game.partyHere()) {
        if (!a.visible) continue;
        if (Math.abs(e.px - a.px) < 11 && Math.abs(e.py - a.py) < 11) {
          Game.runEvent(e);
          return;
        }
      }
    }
  };

  Game.updateEventMove = function (e, dt) {
    const m = e.page.move;
    if (!m || e.moving || e.route) return;
    e.moveTimer -= dt;
    if (e.moveTimer > 0) return;
    const dirs = ['up', 'down', 'left', 'right'];
    const tryStep = (d, ignoreParty) => {
      const [dx, dy] = U.DIRS[d];
      const nx = e.x + dx,
        ny = e.y + dy;
      if (m.radius !== undefined && (Math.abs(nx - e.origin[0]) > m.radius || Math.abs(ny - e.origin[1]) > m.radius)) return false;
      if (!Game.free(nx, ny, 'npc', ignoreParty)) return false;
      e.startMove(d, { speed: m.speed || 2 });
      return true;
    };
    if (m.type === 'random') {
      e.moveTimer = (m.wait || 2) * (0.5 + Math.random());
      const d = dirs[Math.floor(Math.random() * 4)];
      if (!tryStep(d)) e.dir = d;
    } else if (m.type === 'turn') {
      e.moveTimer = (m.wait || 2) * (0.5 + Math.random());
      e.dir = dirs[Math.floor(Math.random() * 4)];
    } else if (m.type === 'patrol') {
      const lead = Game.controlled();
      const dist = Math.abs(lead.x - e.x) + Math.abs(lead.y - e.y);
      if (m.chase && dist <= m.chase && lead.mapId === Game.map.id) {
        e.chasing = true;
        e.moveTimer = m.chaseWait || 0.1;
        const d1 = U.dirTo(e.x, e.y, lead.x, lead.y);
        const alt = d1 === 'left' || d1 === 'right' ? (lead.y < e.y ? 'up' : 'down') : lead.x < e.x ? 'left' : 'right';
        const m0 = { ...m };
        void m0;
        if (!tryStepNoRadius(e, d1, m) && lead.y !== e.y && lead.x !== e.x) tryStepNoRadius(e, alt, m);
        return;
      }
      if (e.chasing) {
        // 제자리로 돌아간다
        if (e.x === e.origin[0] && e.y === e.origin[1]) {
          e.chasing = false;
          e.patrolI = 0;
        } else {
          e.moveTimer = 0.15;
          const d1 = U.dirTo(e.x, e.y, e.origin[0], e.origin[1]);
          if (!tryStepNoRadius(e, d1, m)) {
            const alt = e.y !== e.origin[1] ? (e.origin[1] < e.y ? 'up' : 'down') : e.origin[0] < e.x ? 'left' : 'right';
            if (!tryStepNoRadius(e, alt, m)) e.place(e.origin[0], e.origin[1]);
          }
          return;
        }
      }
      const r = m.route;
      const step = r[e.patrolI % r.length];
      e.patrolI++;
      e.moveTimer = m.wait || 0;
      if (step === '_') {
        e.moveTimer = 0.4;
        return;
      }
      const d = U.LETTER[step];
      if (!tryStepNoRadius(e, d, m)) e.dir = d;
    }
  };
  function tryStepNoRadius(e, d, m) {
    const [dx, dy] = U.DIRS[d];
    if (!Game.free(e.x + dx, e.y + dy, 'npc', true)) return false;
    e.startMove(d, { speed: m.speed || 2 });
    return true;
  }

  /* ---------- 카메라 ---------- */
  Game.camTarget = function () {
    const o = Game.camOverride;
    if (o && o.target) return { x: o.target.px !== undefined ? o.target.px : o.target.x, y: o.target.py !== undefined ? o.target.py : o.target.y };
    const a = Game.controlled();
    return a ? { x: a.px, y: a.py } : { x: 0, y: 0 };
  };
  Game.clampCam = function (x, y) {
    const m = Game.map;
    const mw = m.w * T,
      mh = m.h * T;
    const cx = mw <= G.W ? (mw - G.W) / 2 : U.clamp(x, 0, mw - G.W);
    const cy = mh <= G.H ? (mh - G.H) / 2 : U.clamp(y, 0, mh - G.H);
    return { x: cx, y: cy };
  };
  Game.snapCamera = function () {
    const t = Game.camTarget();
    const c = Game.clampCam(t.x + 8 - G.W / 2, t.y + 8 - G.H / 2);
    Game.cam.x = c.x;
    Game.cam.y = c.y;
  };
  Game.updateCamera = function (dt) {
    const t = Game.camTarget();
    const c = Game.clampCam(t.x + 8 - G.W / 2, t.y + 8 - G.H / 2);
    const o = Game.camOverride;
    const k = o && o.pan ? Math.min(1, dt * o.pan) : 1;
    Game.cam.x = U.lerp(Game.cam.x, c.x, k);
    Game.cam.y = U.lerp(Game.cam.y, c.y, k);
    if (!o || !o.pan) {
      // 조작 캐릭터 카메라는 부드럽게 따라온다
      Game.cam.x = c.x;
      Game.cam.y = c.y;
    }
  };
  Game.cameraTo = async function (target, ms) {
    if (!target) {
      Game.camOverride = { target: null, pan: 4 };
      await G.wait(ms);
      Game.camOverride = null;
      return;
    }
    Game.camOverride = { target, pan: 4 };
    await G.wait(ms);
  };

  /* ---------- 화면 효과 ---------- */
  Game.applyScreen = function (ms = 1000) {
    const s = Game.state;
    if (!s) return;
    const def = Game.map ? Game.map.def : {};
    const tone = def.tone !== undefined ? def.tone : s.screen.tone;
    const cv = G.$('#game');
    cv.style.transition = `filter ${ms}ms`;
    let f = `grayscale(${s.screen.gray || 0})`;
    if (tone === 'memory') f += ' sepia(0.8) contrast(0.95)';
    if (tone === 'night') f += ' brightness(0.85)';
    cv.style.filter = f;
    const tl = G.$('#tone');
    tl.style.transition = `background-color ${ms}ms, opacity ${ms}ms`;
    tl.className = 'layer tone-' + (tone || 'none');
  };

  Game.setWeather = function (type) {
    Game.weather = { type, parts: [] };
    if (!type) return;
    const n = { fog: 14, fireflies: 22, dust: 30, snow: 40, rain: 60 }[type] || 0;
    for (let i = 0; i < n; i++) Game.weather.parts.push({ x: Math.random() * G.W, y: Math.random() * G.H, r: Math.random(), p: Math.random() * 6.28 });
  };

  Game.sparkleAt = function (a, color) {
    if (!a) return;
    for (let i = 0; i < 14; i++) {
      const ang = (i / 14) * Math.PI * 2;
      Game.particles.push({ x: a.px + 8, y: a.py + 8, vx: Math.cos(ang) * 40, vy: Math.sin(ang) * 40 - 10, life: 0.8, color: color || (i % 2 ? '#fff6a0' : '#ffffff') });
    }
  };
  Game.updateParticles = function (dt) {
    for (const p of Game.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 30 * dt;
      p.life -= dt;
    }
    Game.particles = Game.particles.filter((p) => p.life > 0);
  };

  /* ---------- 렌더링 ---------- */
  Game.render = function (g) {
    g.fillStyle = '#000';
    g.fillRect(0, 0, G.W, G.H);
    if (Game.scene !== 'map' || !Game.map) return;
    const m = Game.map;
    let cx = Math.round(Game.cam.x),
      cy = Math.round(Game.cam.y);
    if (Game.shake) {
      cx += Math.round((Math.random() - 0.5) * Game.shake.power * 2);
      cy += Math.round((Math.random() - 0.5) * Game.shake.power * 2);
    }
    const layer = m.layers[Math.floor(G.time / 500) % 2];
    g.drawImage(layer, -cx, -cy);
    drawBeams(g, cx, cy);

    const list = [];
    for (const e of m.events) {
      if (!e.active || !e.sprite || !e.visible || e.page.hidden) continue;
      list.push({ a: e, z: e.page.below ? -1 : e.page.above ? 1 : 0 });
    }
    if (!Game.state.hideParty) for (const a of Game.partyHere()) if (a.visible) list.push({ a, z: 0, party: true });
    list.sort((p, q) => p.z - q.z || p.a.py - q.a.py || (p.party ? 1 : 0) - (q.party ? 1 : 0));
    for (const it of list) drawActor(g, it.a, cx, cy);
    for (const it of list) if (it.a.emote) drawEmote(g, it.a, cx, cy);

    for (const p of Game.particles) {
      g.globalAlpha = Math.min(1, p.life * 2);
      g.fillStyle = p.color;
      g.fillRect(Math.round(p.x - cx), Math.round(p.y - cy), 2, 2);
    }
    g.globalAlpha = 1;
    drawWeather(g);
    const dark = Game.darkLevel();
    if (dark) drawDark(g, dark, cx, cy);
    drawCatEye(g, cx, cy);
  };

  /** 어둠 정도: 스크립트 지정값(screen.dark) > 맵 설정. 정전(flags.blackout)이면 더 어둡다 */
  Game.darkLevel = function () {
    const s = Game.state;
    if (s.screen.dark !== undefined && s.screen.dark !== null) return s.screen.dark;
    const d = Game.map.def.dark || 0;
    return d && s.flags.blackout && Game.map.def.lights === 'party' ? 0.96 : d;
  };

  /* 빛 반사 퍼즐: beam 이벤트에서 나온 빛이 mirror 이벤트에서 꺾여 beamTarget 에 닿으면 플래그가 켜진다 */
  Game.updateBeams = function () {
    const m = Game.map,
      s = Game.state;
    Game.beams = [];
    for (const src of m.events) {
      if (!src.active || !src.page.beam) continue;
      let x = src.x,
        y = src.y,
        dir = src.page.beam;
      const pts = [[x, y]];
      for (let i = 0; i < 80; i++) {
        const [dx, dy] = U.DIRS[dir];
        x += dx;
        y += dy;
        const ev = m.eventsAt(x, y).find((e) => e.page.mirror || e.page.beamTarget);
        const t = G.tiles.get(m.tile(x, y));
        if (!ev && !t.pass && !t.water && !t.chasm) {
          pts.push([x - dx * 0.5, y - dy * 0.5]);
          break;
        }
        if (ev && ev.page.beamTarget) {
          pts.push([x, y]);
          if (!s.flags[ev.page.beamTarget]) {
            s.flags[ev.page.beamTarget] = true;
            G.audio.se('sparkle');
            m.refresh();
          }
          break;
        }
        if (ev && ev.page.mirror) {
          pts.push([x, y]);
          const back = !!s.vars[ev.page.mirror]; // 0 = '/', 1 = '\'
          const R = back ? { right: 'down', down: 'right', left: 'up', up: 'left' } : { right: 'up', up: 'right', left: 'down', down: 'left' };
          dir = R[dir];
        }
      }
      Game.beams.push(pts);
    }
  };
  function drawBeams(g, cx, cy) {
    if (!Game.beams || !Game.beams.length) return;
    g.save();
    g.lineCap = 'round';
    for (const pts of Game.beams) {
      for (const [w, c] of [[5, 'rgba(255,240,150,0.25)'], [2, 'rgba(255,250,210,0.95)']]) {
        g.lineWidth = w;
        g.strokeStyle = c;
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo : g.moveTo).call(g, x * 16 + 8 - cx, y * 16 + 8 - cy));
        g.stroke();
      }
    }
    g.restore();
  }
  Game._drawBeams = drawBeams;

  /** 고양이 눈: 감투를 조작 중이면 숨은 발판(I 타일)이 초록 테두리로 보인다 */
  function drawCatEye(g, cx, cy) {
    const s = Game.state;
    if (!s.abilities.cateye || s.control !== 'gamtu') return;
    const m = Game.map;
    const x0 = Math.floor(cx / 16),
      y0 = Math.floor(cy / 16);
    const a = 0.55 + 0.35 * Math.sin(G.time / 250);
    g.fillStyle = `rgba(150,255,200,${a})`;
    for (let y = y0; y <= y0 + 16; y++)
      for (let x = x0; x <= x0 + 21; x++) {
        if (!G.tiles.get(m.tile(x, y)).catEye) continue;
        const px = x * 16 - cx,
          py = y * 16 - cy;
        for (let i = 2; i < 14; i += 3) {
          g.fillRect(px + i, py + 2, 2, 1);
          g.fillRect(px + i, py + 13, 2, 1);
          g.fillRect(px + 2, py + i, 1, 2);
          g.fillRect(px + 13, py + i, 1, 2);
        }
      }
  }

  function drawActor(g, a, cx, cy) {
    const sh = G.sprites.get(a.sprite);
    if (!sh) return;
    const img = G.sprites.frame(sh, a.dir, a.animStep(), G.time);
    if (!img) {
      if (!drawActor.warned) console.warn('프레임 없음', a.id, a.sprite, a.dir, a.animStep(), G.time);
      drawActor.warned = true;
      return;
    }
    const off = a.offset || [0, 0];
    let dx = Math.round(a.px - cx + 8 - sh.w / 2 + off[0]);
    const dy = Math.round(a.py - cy + 16 - sh.h + off[1] - a.jumpH + (a.float ? Math.sin(G.time / 300) * 2 : 0));
    if (a.shiver > 0) dx += G.frame % 4 < 2 ? 1 : -1;
    if (a.jumpH > 1) {
      g.fillStyle = 'rgba(0,0,0,0.25)';
      g.fillRect(Math.round(a.px - cx + 4), Math.round(a.py - cy + 13), 8, 2);
    }
    g.globalAlpha = a.alpha;
    try {
      g.drawImage(img, dx, dy);
    } catch (e) {
      if (!drawActor.warned2) console.warn('그리기 실패', a.id, a.sprite, a.dir, a.animStep(), Object.prototype.toString.call(img), Array.isArray(img) ? img.length : '');
      drawActor.warned2 = true;
    }
    g.globalAlpha = 1;
  }

  function drawEmote(g, a, cx, cy) {
    const sh = G.sprites.get(a.sprite);
    const h = sh ? sh.h : 16;
    const x = Math.round(a.px - cx + 8),
      y = Math.round(a.py - cy + 16 - h - a.jumpH - 4);
    const bob = Math.round(Math.sin(G.time / 120) * 1);
    g.fillStyle = '#2a2430';
    g.fillRect(x - 7, y - 12 + bob, 14, 11);
    g.fillStyle = '#ffffff';
    g.fillRect(x - 6, y - 11 + bob, 12, 9);
    g.fillRect(x - 1, y - 2 + bob, 3, 2);
    const t = a.emote.type;
    const col = { '!': '#e83a3a', '?': '#3a6ae8', '♥': '#ff4d7a', '♪': '#3aa04a', '…': '#444', '💧': '#3a8ae8', '!!': '#e83a3a', '?!': '#d0408a', zzz: '#4a4a8a' }[t] || '#333';
    g.fillStyle = col;
    g.font = 'bold 8px sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const label = t === '💧' ? ';' : t === 'zzz' ? 'z' : t;
    g.fillText(label, x, y - 6 + bob);
  }

  function drawWeather(g) {
    const w = Game.weather;
    if (!w.type) return;
    const t = G.time / 1000;
    if (w.type === 'fog') {
      for (const p of w.parts) {
        const x = (p.x + t * (6 + p.r * 8)) % (G.W + 120) - 60;
        const y = p.y + Math.sin(t * 0.5 + p.p) * 8;
        const r = 40 + p.r * 40;
        const gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, 'rgba(200,200,215,0.22)');
        gr.addColorStop(1, 'rgba(200,200,215,0)');
        g.fillStyle = gr;
        g.fillRect(x - r, y - r, r * 2, r * 2);
      }
    } else if (w.type === 'fireflies' || w.type === 'dust') {
      for (const p of w.parts) {
        const x = (p.x + Math.sin(t * 0.7 + p.p) * 12 + G.W) % G.W;
        const y = w.type === 'dust' ? (p.y + t * (4 + p.r * 6)) % G.H : (p.y + Math.cos(t * 0.5 + p.p) * 10 + G.H) % G.H;
        const a = 0.4 + 0.6 * Math.max(0, Math.sin(t * 2 + p.p * 3));
        g.fillStyle = w.type === 'dust' ? `rgba(255,240,200,${a * 0.6})` : `rgba(230,255,120,${a})`;
        g.fillRect(Math.round(x), Math.round(y), w.type === 'dust' ? 1 : 2, w.type === 'dust' ? 1 : 2);
      }
    } else if (w.type === 'rain') {
      g.fillStyle = 'rgba(180,200,255,0.5)';
      for (const p of w.parts) {
        const x = (p.x + t * 40) % G.W,
          y = (p.y + t * (220 + p.r * 80)) % G.H;
        g.fillRect(Math.round(x), Math.round(y), 1, 5);
      }
    } else if (w.type === 'snow') {
      g.fillStyle = 'rgba(255,255,255,0.8)';
      for (const p of w.parts) {
        const x = (p.x + Math.sin(t + p.p) * 10 + G.W) % G.W,
          y = (p.y + t * (12 + p.r * 10)) % G.H;
        g.fillRect(Math.round(x), Math.round(y), 2, 2);
      }
    }
  }

  let darkCanvas = null;
  function drawDark(g, level, cx, cy) {
    if (!darkCanvas) darkCanvas = U.canvas(G.W, G.H);
    const d = darkCanvas.getContext('2d');
    d.globalCompositeOperation = 'source-over';
    d.clearRect(0, 0, G.W, G.H);
    d.fillStyle = `rgba(5,5,15,${level})`;
    d.fillRect(0, 0, G.W, G.H);
    d.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r, inner = 8, core = 1) => {
      const gr = d.createRadialGradient(x, y, Math.min(inner, r * 0.5), x, y, r);
      gr.addColorStop(0, `rgba(0,0,0,${core})`);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      d.fillStyle = gr;
      d.fillRect(0, 0, G.W, G.H);
    };
    const s = Game.state;
    if (!s.hideParty) {
      if (Game.map.def.lights === 'party') {
        // 손전등을 든 재희, 빛나는 동료
        for (const p of Game.partyHere()) {
          if (!p.visible) continue;
          let r = p.lightR ? s.vars.flyLight || p.lightR : 0;
          if (p.id === 'jaehee' && s.flags.flashlight && !s.flags.blackout) r = Math.max(r, 70);
          if (p.id === 'gamtu' && s.abilities.cateye && s.control === 'gamtu') r = Math.max(r, 24); // 고양이 눈: 감투 주변이 조금 보인다
          if (r) hole(p.px - cx + 8, p.py - cy + 8 + (p.offset ? p.offset[1] : 0), r);
        }
      } else {
        const a = Game.controlled();
        if (a) hole(a.px - cx + 8, a.py - cy + 8, 64);
      }
    }
    for (const e of Game.map.events) {
      if (!e.active || !e.page.light) continue;
      const x = e.px - cx + 8,
        y = e.py - cy + 8;
      const gr = d.createRadialGradient(x, y, 2, x, y, e.page.light);
      gr.addColorStop(0, 'rgba(0,0,0,0.9)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      d.fillStyle = gr;
      d.fillRect(0, 0, G.W, G.H);
    }
    g.drawImage(darkCanvas, 0, 0);
  }

  /* ---------- 저장 / 불러오기 ---------- */
  Game.save = function (slot) {
    const s = Game.state;
    const actors = {};
    for (const id of s.party) {
      const a = Game.actor(id);
      actors[id] = { map: a.mapId, x: a.x, y: a.y, dir: a.dir, visible: a.visible };
    }
    const data = {
      v: 1,
      state: U.copy(s),
      actors,
      savedAt: Date.now(),
      info: { chapter: s.chapterTitle || '', map: Game.map.def.name || '', playtime: s.playtime },
    };
    try {
      localStorage.setItem(SAVE_KEY + slot, JSON.stringify(data));
      return true;
    } catch (e) {
      G.dialog.toast('저장에 실패했습니다.');
      return false;
    }
  };
  Game.saveInfo = function (slot) {
    try {
      const raw = localStorage.getItem(SAVE_KEY + slot);
      if (!raw) return null;
      const d = JSON.parse(raw);
      return d.info ? { ...d.info, savedAt: d.savedAt } : null;
    } catch (e) {
      return null;
    }
  };
  Game.hasAnySave = () => ['auto', 1, 2, 3].some((s) => Game.saveInfo(s));
  Game.load = function (slot) {
    const raw = localStorage.getItem(SAVE_KEY + slot);
    if (!raw) return false;
    const d = JSON.parse(raw);
    Game.state = Object.assign(Game.newState(), d.state);
    Game.actors = {};
    for (const id of Game.state.party) {
      const a = Game.actor(id);
      const p = d.actors[id];
      if (p) {
        a.mapId = p.map;
        a.place(p.x, p.y, p.dir);
        a.visible = p.visible !== false;
      }
    }
    const lead = Game.controlled();
    Game.scene = 'map';
    Game.map = null;
    Game.loadMap(lead.mapId || GameData.config.start.map);
    if (Game.state.bgm && Game.resolve(Game.map.def.bgm) === undefined) G.audio.playBgm(Game.state.bgm);
    Game.snapCamera();
    Game.applyScreen(0);
    Game.busy = false;
    return true;
  };
})();
