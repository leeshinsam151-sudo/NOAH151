'use strict';
/*
 * interp.js — 이벤트 스크립트 해석기
 * 스크립트는 명령 배열이다. 문자열 "이름: 대사" 는 대사, 이름 없는 문자열은 내레이션.
 * 명령 목록은 docs/scripting.md 참고.
 */
(function () {
  const U = G.U;
  const IP = (G.interp = { running: 0 });

  const st = () => G.game.state;

  /* ---------- 조건 ---------- */
  IP.cond = function (c) {
    if (!c) return true;
    if (typeof c === 'function') return !!c(st(), G);
    if (Array.isArray(c)) return c.every(IP.cond);
    const s = st();
    for (const k in c) {
      const v = c[k];
      switch (k) {
        case 'flag':
          if (![].concat(v).every((f) => s.flags[f])) return false;
          break;
        case 'notFlag':
          if ([].concat(v).some((f) => s.flags[f])) return false;
          break;
        case 'item':
          if (![].concat(v).every((i) => (s.items[i] || 0) > 0)) return false;
          break;
        case 'noItem':
          if ([].concat(v).some((i) => (s.items[i] || 0) > 0)) return false;
          break;
        case 'var': {
          const [name, op, val] = v;
          const x = s.vars[name];
          const ok = { '==': x === val, '!=': x !== val, '>=': x >= val, '<=': x <= val, '>': x > val, '<': x < val }[op];
          if (!ok) return false;
          break;
        }
        case 'chapter':
          if (s.vars.chapter !== v) return false;
          break;
        case 'chapterMin':
          if (s.vars.chapter < v) return false;
          break;
        case 'ability':
          if (!s.abilities[v]) return false;
          break;
        case 'noAbility':
          if (s.abilities[v]) return false;
          break;
        case 'control':
          if (s.control !== v) return false;
          break;
        case 'inParty':
          if (!s.party.includes(v)) return false;
          break;
        case 'any':
          if (!v.some(IP.cond)) return false;
          break;
        case 'not':
          if (IP.cond(v)) return false;
          break;
        case 'boxesSolved':
          if ((IP.condMap || G.game.map).boxesSolved() !== v) return false;
          break;
        default:
          console.warn('알 수 없는 조건', k);
      }
    }
    return true;
  };

  /* ---------- 실행 ---------- */
  const KEEP_MSG = new Set(['say', 'choice', 'flag', 'var', 'se', 'face', 'emote', 'item', 'if', 'call', 'goal', 'sprite', 'shake', 'bgm', 'stopBgm', 'anim', 'js', 'notify']);

  IP.run = async function (script, ctx = {}) {
    if (typeof script === 'string') script = GameData.scripts[script] || (console.warn('스크립트 없음', script), []);
    IP.running++;
    G.game.busy = IP.running > 0;
    try {
      await IP.exec(script, ctx);
    } catch (e) {
      if (e !== 'abort') console.error(e);
    } finally {
      IP.running--;
      if (IP.running === 0) {
        G.dialog.hide();
        G.game.busy = false;
      }
    }
  };

  IP.exec = async function (list, ctx) {
    for (const cmd of list) {
      if (ctx.stop) throw 'abort';
      await IP.one(cmd, ctx);
      if (G.game.map) G.game.map.refresh();
    }
  };

  IP.target = function (t, ctx) {
    const g = G.game;
    if (!t || t === 'self') return ctx.self;
    if (t === 'player') return g.controlled();
    if (g.actors[t]) return g.actors[t];
    const e = g.map && g.map.eventById(t);
    if (!e) console.warn('대상 없음:', t);
    return e;
  };

  const SAY_RE = /^([^:\n]{1,10}): ([\s\S]*)$/;

  IP.one = async function (cmd, ctx) {
    const g = G.game,
      s = st(),
      D = G.dialog;
    if (typeof cmd === 'string') {
      const m = SAY_RE.exec(cmd);
      if (m) return D.say(m[1], m[2]);
      return D.say(null, cmd);
    }
    if (typeof cmd === 'function') return cmd(s, G, ctx);
    const [op, ...a] = cmd;
    if (!KEEP_MSG.has(op)) D.hide();
    const H = CMDS[op];
    if (!H) {
      console.warn('알 수 없는 명령', op);
      return;
    }
    return H(a, ctx, g, s, D);
  };

  const CMDS = {
    say: ([name, text, opt]) => G.dialog.say(name, text, opt || {}),
    narr: ([text]) => G.dialog.say(null, text),
    choice: async ([opts, branches, opt], ctx, g, s, D) => {
      const i = await D.choice(opts, opt || {});
      s.vars.choice = i;
      D.hide();
      if (branches && branches[i]) await IP.exec(branches[i], ctx);
    },
    if: async ([c, yes, no], ctx) => {
      if (IP.cond(c)) {
        if (yes) await IP.exec(yes, ctx);
      } else if (no) await IP.exec(no, ctx);
    },
    call: ([name], ctx) => IP.exec(GameData.scripts[name] || [], ctx),
    js: ([fn], ctx) => fn(st(), G, ctx),
    flag: ([name, v = true], ctx, g, s) => {
      s.flags[name] = v;
    },
    var: ([name, opr, v], ctx, g, s) => {
      if (opr === '+') s.vars[name] = (s.vars[name] || 0) + v;
      else if (opr === '-') s.vars[name] = (s.vars[name] || 0) - v;
      else if (opr === 'toggle') s.vars[name] = s.vars[name] ? 0 : 1;
      else s.vars[name] = v;
    },
    item: ([id, n = 1, opt = {}], ctx, g, s, D) => {
      s.items[id] = Math.max(0, (s.items[id] || 0) + n);
      const it = GameData.items[id] || { name: id };
      if (n > 0 && !opt.silent) {
        G.audio.se('item');
        D.toast(`[${it.name}]을(를) 얻었다!`, 'item');
      }
      if (n < 0 && !opt.silent) D.toast(`[${it.name}]을(를) 건넸다.`);
    },
    goal: ([text], ctx, g, s, D) => {
      s.goal = text;
      if (text) D.toast('목표: ' + text, 'goal');
    },
    notify: ([text, cls]) => G.dialog.toast(text, cls || ''),
    wait: ([ms]) => G.wait(ms),
    se: ([name, p]) => G.audio.se(name, p),
    bgm: ([name, fade], ctx, g, s) => {
      s.bgm = name;
      G.audio.playBgm(name, fade === undefined ? 800 : fade);
    },
    stopBgm: ([fade], ctx, g, s) => {
      s.bgm = null;
      G.audio.stopBgm(fade === undefined ? 800 : fade);
    },
    fadeOut: ([ms = 600, color = '#000']) => g_fade(1, ms, color),
    fadeIn: ([ms = 600]) => g_fade(0, ms),
    flash: async ([color = '#fff', ms = 400]) => {
      G.audio.se('flash');
      const f = G.$('#flash');
      f.style.transition = 'none';
      f.style.background = color;
      f.style.opacity = 1;
      await G.nextFrame();
      await G.nextFrame();
      f.style.transition = `opacity ${ms}ms`;
      f.style.opacity = 0;
      await G.wait(ms);
    },
    shake: ([power = 3, ms = 500]) => {
      G.game.shake = { power, t: ms / 1000 };
    },
    lights: ([v], ctx, g, s) => {
      s.screen.lights = v;
    },
    lightning: (a, ctx, g) => g.lightning(true),
    dark: ([v], ctx, g, s) => {
      s.screen.dark = v;
    },
    gray: async ([v, ms = 1200], ctx, g, s) => {
      s.screen.gray = v;
      g.applyScreen(ms);
    },
    tone: async ([name, ms = 1000], ctx, g, s) => {
      s.screen.tone = name || '';
      g.applyScreen(ms);
    },
    weather: ([name], ctx, g) => g.setWeather(name),
    amb: ([name]) => G.audio.playAmb(name),
    warp: async ([map, x, y, dir, opt = {}], ctx, g, s, D) => {
      if (s.control === 'gamtu' && !opt.cat && !s.flags.gamtuLeads) {
        await D.say('감투', GameData.config.cantLeaveLine || '재희를 두고 갈 수는 없어.');
        D.hide();
        ctx.stop = true;
        return;
      }
      const fade = opt.fade !== false;
      if (fade) {
        G.audio.se(opt.se || 'door');
        await g_fade(1, opt.ms || 300);
      }
      g.warp(map, x, y, dir, opt);
      if (fade) await g_fade(0, opt.ms || 300);
    },
    move: async ([who, path, opt = {}], ctx) => {
      const a = IP.target(who, ctx);
      if (!a) return;
      const p = a.setRoute(path, opt);
      if (opt.wait !== false) await p;
    },
    waitMove: async ([who], ctx) => {
      const a = IP.target(who, ctx);
      while (a && (a.route || a.moving)) await G.nextFrame();
    },
    face: ([who, d], ctx) => {
      const a = IP.target(who, ctx);
      if (!a) return;
      if (d === 'player' || G.game.actors[d] || (G.game.map && G.game.map.eventById(d))) {
        const b = IP.target(d, ctx);
        if (b) a.dir = U.dirTo(a.x, a.y, b.x, b.y);
      } else a.dir = d;
    },
    setPos: ([who, x, y, dir], ctx) => {
      const a = IP.target(who, ctx);
      if (a) a.place(x, y, dir);
    },
    emote: async ([who, type, opt = {}], ctx) => {
      const a = IP.target(who, ctx);
      if (!a) return;
      a.emote = { type, t: opt.ms ? opt.ms / 1000 : 1.1 };
      const se = { '!': 'pop', '?': 'pop', '♥': 'pop', '♪': 'pop' }[type];
      if (se && !opt.silent) G.audio.se(se);
      if (opt.wait) await G.wait(opt.ms || 1100);
    },
    anim: async ([who, type, ms = 600], ctx) => {
      const a = IP.target(who, ctx);
      if (!a) return;
      if (type === 'shiver') a.shiver = ms / 1000;
      if (type === 'hop') a.doHop();
    },
    sprite: ([who, key], ctx) => {
      const a = IP.target(who, ctx);
      if (a) a.sprite = key;
    },
    show: ([who, opt = {}], ctx) => {
      const a = IP.target(who, ctx);
      if (!a) return;
      a.visible = true;
      a.erased = false;
      if (opt.fade) {
        a.alpha = 0;
        return a.fadeTo(1, opt.fade);
      }
    },
    hide: async ([who, opt = {}], ctx) => {
      const a = IP.target(who, ctx);
      if (!a) return;
      if (opt.fade) await a.fadeTo(0, opt.fade);
      if (a instanceof G.GameEvent) a.erased = true;
      else a.visible = false;
      a.alpha = 1;
    },
    fadeActor: ([who, to, ms = 500], ctx) => {
      const a = IP.target(who, ctx);
      if (a) return a.fadeTo(to, ms);
    },
    erase: (a, ctx) => {
      if (ctx.self) ctx.self.erased = true;
    },
    party: ([op, id, x, y, dir], ctx, g) => g.partyOp(op, id, x, y, dir),
    follow: ([id, v], ctx, g, s) => {
      s.follow[id] = v;
    },
    gather: (a, ctx, g) => g.gather(),
    control: ([who], ctx, g) => g.setControl(who, true),
    camera: async ([t, ms = 600], ctx, g) => {
      if (t === null || t === 'reset') return g.cameraTo(null, ms);
      if (Array.isArray(t)) return g.cameraTo({ x: t[0] * 16, y: t[1] * 16 }, ms);
      const a = IP.target(t, ctx);
      return g.cameraTo(a, ms);
    },
    ability: async ([id, name], ctx, g, s, D) => {
      s.abilities[id] = true;
      G.audio.se('success');
      D.toast(`감투가 [${name}]을(를) 할 수 있게 되었다!`, 'ability');
      await G.wait(400);
    },
    courage: async ([n = 1], ctx, g, s, D) => {
      s.vars.courage = (s.vars.courage || 0) + n;
      G.audio.se('bell');
      g.sparkleAt(g.actors.gamtu);
      D.toast(`감투의 용기가 자랐다!  (용기 ${s.vars.courage})`, 'courage');
      await G.wait(600);
    },
    caption: ([lines, opt]) => G.dialog.caption(lines, opt || {}),
    clearCaption: ([ms]) => G.dialog.clearCaption(ms),
    chapterCard: ([label, title, opt]) => G.dialog.chapterCard(label, title, opt || {}),
    chapter: ([num, title], ctx, g, s) => {
      s.vars.chapter = num;
      s.chapterTitle = title;
    },
    autosave: async (a, ctx, g, s, D) => {
      g.save('auto');
      D.toast('자동 저장되었습니다.', 'save');
    },
    minigame: async ([type, opt], ctx, g, s) => {
      const r = await G.minigames.run(type, opt || {});
      s.vars.mg = r;
    },
    hideParty: ([v = true], ctx, g, s) => {
      s.hideParty = v;
    },
    title: async (a, ctx, g) => {
      ctx.stop = true;
      await g_fade(1, 1200);
      G.ui.toTitle();
    },
    sparkle: ([who], ctx, g) => g.sparkleAt(IP.target(who, ctx)),
    lock: ([v = true], ctx, g, s) => {
      s.noSwitch = v;
    },
  };
  IP.CMDS = CMDS;

  async function g_fade(to, ms, color) {
    const f = G.$('#fade');
    if (color) f.style.background = color;
    f.style.transition = `opacity ${ms}ms`;
    f.style.opacity = to;
    G.game.fadeLevel = to;
    await G.wait(ms);
    if (to === 0) f.style.background = '#000';
  }
  IP.fade = g_fade;
})();
