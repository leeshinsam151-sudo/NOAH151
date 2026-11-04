'use strict';
/* world.js — 액터(캐릭터), 맵 이벤트, 맵 */
(function () {
  const U = G.U;
  const T = 16;

  class Actor {
    constructor(o) {
      this.id = o.id;
      this.x = o.x | 0;
      this.y = o.y | 0;
      this.px = this.x * T;
      this.py = this.y * T;
      this.dir = o.dir || 'down';
      this.sprite = o.sprite || null;
      this.speed = o.speed || 5; // 타일/초
      this.kind = o.kind || 'npc';
      this.moving = false;
      this.visible = o.visible !== false;
      this.alpha = 1;
      this.jumpH = 0;
      this.shiver = 0;
      this.emote = null;
      this.route = null;
      this.walkDist = 0;
      this.offset = o.offset || [0, 0];
      this.stepAnim = false;
      this.onMoveStart = null;
      this.onArrive = null;
      this.fade = null;
    }
    get tileBusy() {
      return this.moving;
    }
    startMove(dir, opt = {}) {
      const [dx, dy] = U.DIRS[dir];
      this.dir = dir;
      const n = opt.jump ? 2 : 1;
      this.moveTo(this.x + dx * n, this.y + dy * n, { ...opt, keepDir: true });
    }
    moveTo(tx, ty, opt = {}) {
      if (tx === this.x && ty === this.y) return;
      if (!opt.keepDir) this.dir = U.dirTo(this.x, this.y, tx, ty);
      const fx = this.x,
        fy = this.y;
      this.fromX = this.px;
      this.fromY = this.py;
      this.x = tx;
      this.y = ty;
      this.moving = true;
      this.mt = 0;
      this.jumping = !!opt.jump;
      this.moveDist = Math.max(1, Math.hypot(tx - fx, ty - fy));
      this.curSpeed = opt.speed || this.speed;
      if (this.onMoveStart) this.onMoveStart(this, fx, fy);
    }
    place(x, y, dir) {
      this.x = x;
      this.y = y;
      this.px = x * T;
      this.py = y * T;
      this.moving = false;
      this.jumpH = 0;
      if (dir) this.dir = dir;
    }
    update(dt) {
      if (this.moving) {
        const dur = this.jumping ? 0.42 : this.moveDist / this.curSpeed;
        this.mt += dt / dur;
        const t = Math.min(1, this.mt);
        this.px = U.lerp(this.fromX, this.x * T, t);
        this.py = U.lerp(this.fromY, this.y * T, t);
        this.jumpH = this.jumping ? Math.sin(t * Math.PI) * 12 : 0;
        if (!this.jumping) this.walkDist += (dt * this.curSpeed);
        if (t >= 1) {
          this.moving = false;
          this.jumping = false;
          this.jumpH = 0;
          this.px = this.x * T;
          this.py = this.y * T;
          if (this.onArrive) this.onArrive(this);
        }
      } else if (this.route) {
        this.stepRoute(dt);
      }
      if (this.shiver > 0) this.shiver -= dt;
      if (this.emote) {
        this.emote.t -= dt;
        if (this.emote.t <= 0) this.emote = null;
      }
      if (this.fade) {
        this.fade.t += dt;
        const k = Math.min(1, this.fade.t / this.fade.dur);
        this.alpha = U.lerp(this.fade.from, this.fade.to, k);
        if (k >= 1) {
          const r = this.fade.resolve;
          this.fade = null;
          r && r();
        }
      }
    }
    /** 경로 문자열: U D L R 이동, u d l r 방향 전환, _ 잠깐 대기, J 앞으로 두 칸 점프, j 제자리 깡충 */
    setRoute(str, opt = {}) {
      return new Promise((resolve) => {
        this.route = { steps: str.replace(/\s/g, '').split(''), i: 0, wait: 0, opt, resolve };
      });
    }
    stepRoute(dt) {
      const r = this.route;
      if (r.wait > 0) {
        r.wait -= dt;
        return;
      }
      if (this.hop) return;
      if (r.i >= r.steps.length) {
        this.route = null;
        r.resolve();
        return;
      }
      const s = r.steps[r.i++];
      if ('UDLR'.includes(s)) this.startMove(U.LETTER[s], { speed: r.opt.speed });
      else if ('udlr'.includes(s)) this.dir = U.LETTER[s.toUpperCase()];
      else if (s === '_') r.wait = 0.25;
      else if (s === 'J') this.startMove(this.dir, { jump: true });
      else if (s === 'j') this.doHop();
    }
    doHop() {
      this.hop = true;
      let t = 0;
      const tickHop = () => {
        t += 1 / 60;
        this.jumpH = Math.sin(Math.min(1, t / 0.25) * Math.PI) * 5;
        if (t < 0.25) G.nextFrame().then(tickHop);
        else {
          this.jumpH = 0;
          this.hop = false;
        }
      };
      G.nextFrame().then(tickHop);
    }
    fadeTo(to, ms) {
      return new Promise((resolve) => {
        this.fade = { from: this.alpha, to, t: 0, dur: Math.max(0.01, ms / 1000), resolve };
      });
    }
    animStep() {
      if (!this.moving && !this.stepAnim) return 0;
      if (this.jumping) return 1;
      const k = Math.floor(this.walkDist * 4) % 4;
      return [1, 0, 2, 0][k];
    }
  }

  class GameEvent extends Actor {
    constructor(def, map) {
      super({ id: def.id, x: def.x, y: def.y, dir: def.dir || 'down', speed: 3 });
      this.def = def;
      this.map = map;
      this.pages = def.pages || [def];
      this.page = null;
      this.pageIndex = -1;
      this.erased = false;
      this.origin = [def.x, def.y];
      this.moveTimer = 1 + Math.random() * 2;
      this.patrolI = 0;
    }
    get area() {
      return this.def.area || [1, 1];
    }
    covers(x, y) {
      const [w, h] = this.area;
      return x >= this.x && x < this.x + w && y >= this.y && y < this.y + h;
    }
    refresh() {
      let idx = -1;
      for (let i = this.pages.length - 1; i >= 0; i--) {
        if (G.interp.cond(this.pages[i].cond)) {
          idx = i;
          break;
        }
      }
      if (idx === this.pageIndex) return;
      this.pageIndex = idx;
      this.page = idx >= 0 ? this.pages[idx] : null;
      const p = this.page;
      if (!p) return;
      this.sprite = p.sprite || null;
      if (p.pos) this.place(p.pos[0], p.pos[1]);
      if (p.dir) this.dir = p.dir;
      this.speed = p.speed || 3;
      this.offset = p.offset || this.def.offset || [0, 0];
      this.stepAnim = !!p.stepAnim;
      this.float = !!p.float;
      this.alpha = p.alpha !== undefined ? p.alpha : 1;
      if (p.warp && !p.script) {
        const [m, x, y, d, o] = p.warp;
        p.script = [['warp', m, x, y, d, o || {}]];
        p.trigger = p.trigger || 'touch';
      }
    }
    get active() {
      return !!this.page && !this.erased;
    }
    get through() {
      const p = this.page;
      if (!p) return true;
      if (p.through !== undefined) return p.through;
      return !p.sprite;
    }
    get trigger() {
      return this.page ? this.page.trigger || 'action' : null;
    }
  }

  class GameMap {
    constructor(id) {
      const def = GameData.maps[id];
      if (!def) throw new Error('맵 없음: ' + id);
      this.id = id;
      this.def = def;
      this.grid = def.tiles.map((r) => r.split(''));
      this.h = this.grid.length;
      this.w = Math.max(...this.grid.map((r) => r.length));
      this.grid.forEach((r) => {
        while (r.length < this.w) r.push(' ');
      });
      const defs = [...(def.events || []), ...(GameData.mapEvents[id] || [])];
      this.events = defs.map((d) => new GameEvent(d, this));
      this.layers = G.tiles.prerender(this.grid, this.w, this.h, id.length);
      this.refresh();
    }
    tile(x, y) {
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) return ' ';
      return this.grid[y][x];
    }
    tilePass(x, y, kind) {
      if (this.events.some((e) => e.active && e.page.bridge && e.covers(x, y))) return true;
      const t = G.tiles.get(this.tile(x, y));
      if (t.cat) return kind === 'gamtu';
      if (t.catEye) return kind === 'gamtu' && !!G.game.state.abilities.cateye;
      if (t.beamWalk) return kind === 'gamtu' && !!G.game.state.abilities.beam;
      return !!t.pass;
    }
    refresh() {
      for (const e of this.events) e.refresh();
    }
    eventById(id) {
      return this.events.find((e) => e.id === id);
    }
    eventsAt(x, y) {
      return this.events
        .filter((e) => e.active && e.covers(x, y))
        .sort((a, b) => (b.page.priority || 0) - (a.page.priority || 0));
    }
    blockerAt(x, y) {
      return this.events.find((e) => e.active && !e.through && e.covers(x, y));
    }
    boxesSolved() {
      const boxes = this.events.filter((e) => e.active && e.page.push);
      return boxes.length > 0 && boxes.every((b) => this.tile(b.x, b.y) === 'g' && !b.moving);
    }
  }

  G.Actor = Actor;
  G.GameEvent = GameEvent;
  G.GameMap = GameMap;
})();
