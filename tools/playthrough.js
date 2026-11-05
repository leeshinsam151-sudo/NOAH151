/*
 * 자동 플레이 점검 스크립트 (개발용)
 * 실제 키 입력으로 프롤로그부터 1장 끝까지 진행하며 막히는 곳이 없는지 확인한다.
 *   python3 -m http.server 8123  (저장소 루트에서)
 *   node tools/playthrough.js
 */
const { chromium } = require('playwright');
const URL = process.env.URL || 'http://localhost:8123/index.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const KEY = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 720 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message + '\n' + e.stack));
  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await sleep(500);
  let shot = 0;
  const snap = async (name) => page.screenshot({ path: `/tmp/pt_${String(++shot).padStart(2, '0')}_${name}.png` });

  await page.evaluate(() => {
    G.debug.speed = Number(new URLSearchParams(location.search).get('speed') || 4);
    G.debug.autoMinigame = true;
    window.__bot = {
      st() {
        const g = G.game;
        const a = g.controlled && g.state ? g.controlled() : null;
        const next = document.querySelector('#msg-next');
        return {
          scene: g.scene,
          busy: g.busy,
          map: g.map && g.map.id,
          x: a && a.x, y: a && a.y, moving: a && (a.moving || !!a.route),
          msg: document.querySelector('#msg').classList.contains('show') && next.style.visibility === 'visible',
          choice: document.querySelector('#choice').classList.contains('show'),
          menu: G.ui.menuOpen,
          control: g.state && g.state.control,
          goal: g.state && g.state.goal,
        };
      },
      path(tx, ty) {
        const g = G.game, m = g.map, a = g.controlled();
        const kind = a.kind, jump = kind === 'gamtu' && g.state.abilities.jump;
        const key = (x, y) => x + ',' + y;
        const ok = (x, y) => m.tilePass(x, y, kind) && !m.blockerAt(x, y);
        const prev = { [key(a.x, a.y)]: null };
        const q = [[a.x, a.y]];
        const D = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
        while (q.length) {
          const [x, y] = q.shift();
          if (x === tx && y === ty) break;
          for (const d in D) {
            const [dx, dy] = D[d];
            let nx = x + dx, ny = y + dy;
            if (!ok(nx, ny)) {
              if (jump && G.tiles.get(m.tile(nx, ny)).water && ok(nx + dx, ny + dy)) { nx += dx; ny += dy; } else continue;
            }
            const k = key(nx, ny);
            if (k in prev) continue;
            prev[k] = [x, y, d];
            q.push([nx, ny]);
          }
        }
        if (!(key(tx, ty) in prev)) return null;
        const out = [];
        let k = key(tx, ty);
        while (prev[k]) { const [px, py, d] = prev[k]; out.unshift(d); k = key(px, py); }
        return out;
      },
    };
    G.dialog.settings.speed = 3;
  });

  const st = () => page.evaluate(() => __bot.st());
  // 천둥에 얼어붙어 있는 동안에는 입력이 먹히지 않으므로 풀릴 때까지 기다린다
  async function thaw() { for (let i = 0; i < 200; i++) { if (!(await page.evaluate(() => G.game.freezeT > 0))) return; await sleep(20); } }
  async function press(k) { await thaw(); await page.keyboard.press(k); await sleep(30); }

  async function advance(choices = [], label = '') {
    let idle = 0;
    for (let i = 0; i < 20000; i++) {
      const s = await st();
      if (s.choice) {
        const n = choices.length ? choices.shift() : 0;
        for (let k = 0; k < n; k++) await press('ArrowDown');
        await press('z');
        idle = 0;
        continue;
      }
      if (s.msg) { await press('z'); idle = 0; continue; }
      if (s.busy) { idle = 0; await sleep(25); continue; }
      if (++idle > 8) return s;
      await sleep(25);
    }
    throw new Error('advance timeout ' + label);
  }

  async function step(dir) {
    await thaw();
    const s0 = await st();
    await page.keyboard.down(KEY[dir]);
    for (let i = 0; i < 100; i++) {
      const s = await st();
      if (s.moving || s.x !== s0.x || s.y !== s0.y || s.busy || s.map !== s0.map) break;
      await sleep(8);
    }
    await page.keyboard.up(KEY[dir]);
    for (let i = 0; i < 200; i++) {
      const s = await st();
      if (!s.moving) break;
      await sleep(8);
    }
  }

  async function goto(tx, ty, label, choices = []) {
    for (let guard = 0; guard < 400; guard++) {
      let s = await st();
      if (s.busy) { await advance(choices, label); continue; }
      if (s.x === tx && s.y === ty) return;
      const p = await page.evaluate(([x, y]) => __bot.path(x, y), [tx, ty]);
      if (!p) throw new Error(`경로 없음 → (${tx},${ty}) [${label}] 현재 ${s.map} (${s.x},${s.y})`);
      if (!p.length) return;
      await step(p[0]);
    }
    throw new Error('goto guard ' + label);
  }
  // 맵을 옮기는 출구로 가기 (도착하면 맵이 바뀐다)
  async function exitTo(tx, ty, map, label) {
    for (let guard = 0; guard < 400; guard++) {
      const s = await st();
      if (s.scene === 'title') return;
      if (s.map === map) { await advance(); return; }
      if (s.busy) { await advance([], label); continue; }
      const p = await page.evaluate(([x, y]) => __bot.path(x, y), [tx, ty]);
      if (!p) throw new Error(`출구 경로 없음 (${tx},${ty}) [${label}] 현재 ${s.map} (${s.x},${s.y})`);
      if (!p.length) { await sleep(50); continue; }
      await step(p[0]);
    }
    throw new Error('exitTo guard ' + label);
  }
  async function face(dir) {
    await thaw();
    await page.keyboard.down(KEY[dir]);
    await sleep(40);
    await page.keyboard.up(KEY[dir]);
    await sleep(40);
  }
  async function talk(fromX, fromY, dir, choices = [], label = '') {
    await goto(fromX, fromY, label);
    await face(dir);
    await press('z');
    await sleep(60);
    await advance(choices, label);
  }
  async function flag(name) { return page.evaluate((n) => !!G.game.state.flags[n], name); }
  const audit = [];
  // 지금 맵에서 같은 칸에 겹친 그림 이벤트, 그리고 저장→불러오기 후 상태가 그대로인지 확인
  async function checkpoint(label) {
    for (let i = 0; i < 60 && (await page.evaluate(() => G.game.busy || G.interp.running > 0)); i++) await sleep(30);
    const r = await page.evaluate((label) => {
      const g = G.game, out = [];
      if (g.scene !== 'map' || g.busy || G.interp.running > 0) return { skipped: true };
      const seen = {};
      for (const e of g.map.events) {
        if (!e.active || !e.sprite || e.page.through || e.page.below || e.page.above) continue;
        const k = e.x + ',' + e.y;
        if (seen[k]) out.push(`${label}: ${g.map.id} (${k}) 에 ${seen[k]} 와 ${e.id} 가 겹침`);
        seen[k] = e.id;
      }
      for (const a of g.partyHere()) {
        if (!a.visible) continue;
        const e = g.map.events.find((e) => e.active && e.sprite && !e.page.through && e.x === a.x && e.y === a.y);
        if (e) out.push(`${label}: ${g.map.id} (${a.x},${a.y}) 에서 ${a.id} 와 ${e.id} 가 겹침`);
      }
      const snapOf = () => JSON.stringify({
        state: { ...g.state, playtime: 0 },
        map: g.map.id,
        actors: g.state.party.map((id) => { const a = g.actor(id); return [id, a.mapId, a.x, a.y, a.visible]; }),
        events: g.map.events.map((e) => [e.id, e.pageIndex, e.active, e.active ? e.x + ',' + e.y + e.dir : 0]),
      });
      const before = snapOf();
      g.save(3);
      g.load(3);
      const after = snapOf();
      if (before !== after) {
        const A = JSON.parse(before), B = JSON.parse(after);
        const flat = (o, pre = '', r = {}) => { for (const k in o) { const v = o[k]; if (v && typeof v === 'object' && !Array.isArray(v)) flat(v, pre + k + '.', r); else r[pre + k] = JSON.stringify(v); } return r; };
        const FA = flat(A), FB = flat(B);
        for (const k of new Set([...Object.keys(FA), ...Object.keys(FB)])) if (FA[k] !== FB[k]) out.push(`${label}: ${g.map.id} 불러오기 후 ${k} 가 달라짐 (${FA[k]} → ${FB[k]})`);
        if (false) for (const k of Object.keys(A)) if (JSON.stringify(A[k]) !== JSON.stringify(B[k])) out.push(`${label}: 불러오기 후 ${k} 가 달라짐\n    전 ${JSON.stringify(A[k]).slice(0, 300)}\n    후 ${JSON.stringify(B[k]).slice(0, 300)}`);
      }
      return { out };
    }, label);
    if (r.skipped) return;
    for (const m of r.out) if (!audit.includes(m)) { audit.push(m); console.log('  ⚠', m); }
  }
  async function expectFlag(name) {
    if (!(await flag(name))) { await snap('fail_' + name); throw new Error('플래그 없음: ' + name + ' / 목표: ' + (await st()).goal); }
    console.log('  ✓', name);
    if (process.env.AUDIT) await checkpoint(name);
  }
  async function switchChar() { await press('c'); await sleep(120); await advance(); }

  const t0 = Date.now();
  try {
    // 타이틀
    await press('z');
    await sleep(600);
    await snap('title');
    await press('z'); // 처음부터
    await sleep(800);
    await advance([], 'intro');
    await snap('busstop');
    console.log('[프롤로그]');
    await talk(10, 8, 'right', [2], 'carrier-no-snack');
    await talk(13, 7, 'up', [], 'bench');
    await expectFlag('p_bag');
    await talk(10, 8, 'right', [2], 'carrier-snack');
    await expectFlag('p_out');
    await exitTo(9, 0, 'village', 'to village');
    await expectFlag('p_vinyl');
    await advance();
    await snap('village');
    await goto(7, 16, 'to grandma');
    await advance();
    await expectFlag('p_meet');
    await goto(8, 20, 'field');
    await talk(8, 21, 'left', [0], 'leek');
    await expectFlag('p_crow');
    await expectFlag('p_leek');
    // 감투 조작
    await goto(5, 13, 'near hole');
    await switchChar();
    if ((await st()).control !== 'gamtu') {
      console.log(await page.evaluate(() => { const g = G.game, c = g.actors.gamtu; return JSON.stringify({ party: g.state.party, flags: g.state.flags, noSwitch: g.state.noSwitch, cmap: c && c.mapId, map: g.map.id, vis: c && c.visible }); }));
      throw new Error('감투 전환 실패');
    }
    await exitTo(5, 11, 'underfloor', 'hole');
    await advance();
    await snap('underfloor');
    await goto(7, 3, 'ball');
    await face('up');
    await advance();
    await expectFlag('p_ball');
    await exitTo(4, 5, 'village', 'out of hole');
    await switchChar();
    await exitTo(7, 11, 'house', 'house');
    await talk(13, 4, 'up', [], 'dinner');
    await expectFlag('p_dinner');
    await snap('dinner');
    await goto(8, 9, 'moon', [0]);
    await advance([0], 'night');
    await expectFlag('p_morning');
    await snap('morning');
    await talk(13, 4, 'up', [], 'forget');
    await expectFlag('p_forget');
    await exitTo(8, 10, 'village', 'out');
    await advance([], 'bell');
    await expectFlag('p_bell');
    await snap('chapter1');
    console.log('[1장]');
    const ch = await page.evaluate(() => G.game.state.vars.chapter);
    if (ch !== 1) throw new Error('1장 시작 안 됨');
    await talk(16, 13, 'up', [], 'tree');
    await expectFlag('c1_tree');
    await goto(19, 9, 'bridge approach');
    await step('up');
    await advance();
    await expectFlag('c1_bridge');
    await talk(33, 16, 'up', [], 'ijang');
    await expectFlag('c1_ijang');
    await goto(30, 13, 'ijang hole');
    await switchChar();
    await exitTo(30, 11, 'underfloor', 'ijang hole');
    await advance();
    await snap('mouse');
    await expectFlag('c1_collar');
    await exitTo(4, 5, 'village', 'out of ijang hole');
    await switchChar();
    await exitTo(28, 20, 'shop', 'shop');
    await talk(2, 5, 'up', [], 'geumsun');
    await expectFlag('c1_storage_ok');
    await exitTo(10, 1, 'storage', 'storage');
    await advance();
    // 상자 밀기
    const push = async (dir, n = 1) => { for (let i = 0; i < n; i++) await step(dir); };
    await goto(5, 5, 'b3');
    await push('down');
    await goto(5, 4, 'b1');
    await push('left', 2);
    await goto(2, 5, 'b1 up');
    await push('up');
    await goto(5, 4, 'b2');
    await push('right', 2);
    await goto(8, 5, 'b2 up');
    await push('up');
    await advance();
    await snap('storage');
    await expectFlag('c1_solved');
    await exitTo(5, 9, 'shop', 'back to shop');
    await talk(2, 5, 'up', [], 'chew');
    await expectFlag('c1_chew');
    await exitTo(5, 8, 'village', 'out of shop');
    await goto(19, 9, 'bridge2');
    await step('up');
    await advance();
    await expectFlag('c1_bori_friend');
    await snap('bori');
    await exitTo(19, 0, 'forest', 'forest');
    await advance();
    // 그림자에 잡히는 장면 한 번 확인
    await page.evaluate(() => { const a = G.game.controlled(); const s = G.game.map.eventById('s4'); s.place(a.x, a.y - 1); });
    await sleep(200);
    await advance();
    const caught = await page.evaluate(() => G.game.state.vars.c1_caught);
    if (caught !== 1) throw new Error('그림자 잡힘 이벤트 실패');
    console.log('  ✓ shadow catch');
    await page.evaluate(() => { G.debug.noCatch = true; });
    await goto(14, 4, 'climax', [0]);
    await advance([0], 'climax');
    await expectFlag('c1_brave');
    await expectFlag('c1_return');
    await snap('after memory');
    await page.evaluate(() => { G.debug.noCatch = false; });
    await exitTo(13, 23, 'village', 'back to village');
    await advance();
    await expectFlag('c1_reunion');
    await goto(30, 7, 'stones');
    await switchChar();
    await goto(31, 7, 'stone edge');
    await step('up');
    await advance();
    await expectFlag('c1_jump1');
    await step('up');
    await advance();
    await expectFlag('c1_pin');
    await snap('pin');
    await step('down');
    await step('down');
    await switchChar();
    await talk(7, 13, 'left', [0], 'final');
    await advance([0]);
    await expectFlag('c1_end');
    await snap('end1');
    console.log('[2장]');
    await expectFlag('c2_started');
    await talk(16, 13, 'up', [], 'tree2');
    await expectFlag('c2_tree');
    await exitTo(39, 15, 'valley', 'to valley');
    await expectFlag('c2_valley');
    await goto(12, 8, 'stream bank');
    await switchChar();
    await goto(16, 9, 'jump across');
    await expectFlag('c2_stone');
    await face('down');
    await press('z');
    await advance();
    await expectFlag('c2_bridge');
    await switchChar();
    await exitTo(26, 8, 'cave1', 'cave');
    await expectFlag('c2_cave_in');
    await snap('cave1');
    // 반딧불을 만나기 전엔 동굴 안에서 감투로 바꿀 수 없다
    await press('c');
    await sleep(150);
    if ((await st()).control !== 'jaehee') throw new Error('동굴에서 전환이 막히지 않음');
    console.log('  ✓ 동굴 안 전환 금지');
    await talk(8, 18, 'left', [], 'kkam');
    await expectFlag('c2_kkam');
    await snap('kkam');
    await goto(16, 12, 'room B');
    await advance();
    await expectFlag('c2_mirror_in');
    await talk(8, 10, 'left', [], 'm1');
    await talk(8, 4, 'left', [], 'm2');
    await talk(13, 4, 'left', [], 'm3');
    await advance();
    await expectFlag('c2_crystal');
    await expectFlag('c2_gate');
    await snap('mirror');
    await exitTo(17, 0, 'cave2', 'cave2');
    await page.evaluate(() => { G.debug.noCatch = true; });
    await goto(4, 11, 'chamber');
    await step('up');
    await advance([0], 'climax2');
    await expectFlag('gamtuLeads');
    await snap('cateye');
    await goto(25, 6, 'fragment2');
    await advance();
    await expectFlag('c2_frag');
    await snap('after memory2');
    await exitTo(25, 1, 'village', 'exit');
    await advance([0], 'end2');
    await expectFlag('c2_end');
    await page.evaluate(() => { G.debug.noCatch = false; });
    await snap('end2');
    console.log('[3장]');
    await expectFlag('c3_started');
    await talk(16, 13, 'up', [], 'tree3');
    await expectFlag('c3_tree');
    await exitTo(0, 15, 'school', 'to school');
    await expectFlag('c3_school');
    await exitTo(7, 3, 'classroom', 'classroom');
    await talk(6, 6, 'up', [], 'desk');
    await expectFlag('c3_desk');
    await talk(5, 2, 'up', [], 'board');
    await expectFlag('c3_clue');
    await exitTo(5, 8, 'school', 'out of class');
    await exitTo(16, 4, 'tower1', 'tower');
    await expectFlag('c3_tower1_in');
    const push3 = async (dir, n = 1) => { for (let i = 0; i < n; i++) await step(dir); };
    await goto(6, 9, 'g3'); await push3('up', 2);
    await goto(5, 5, 'g1'); await push3('left', 2);
    await goto(2, 6, 'g1 up'); await push3('up', 2);
    await goto(7, 5, 'g2'); await push3('right', 2);
    await goto(10, 6, 'g2 up'); await push3('up', 2);
    await advance();
    await expectFlag('c3_gears');
    await snap('gears');
    await talk(12, 3, 'up', [], 'basket');
    await advance();
    await expectFlag('c3_tower2_in');
    await talk(4, 4, 'up', [], 'owl');
    await expectFlag('c3_owl');
    await goto(5, 7, 'beam start');
    await switchChar();
    await goto(5, 6, 'beam edge');
    await step('right');
    await advance([0], 'climax3');
    await expectFlag('c3_climax');
    await snap('beam');
    await talk(17, 7, 'down', [], 'lever');
    await expectFlag('c3_lever');
    await switchChar();
    await exitTo(16, 1, 'towerTop', 'top');
    await advance();
    await talk(5, 2, 'up', [], 'clock');
    await expectFlag('c3_clock');
    await exitTo(6, 3, 'village', 'fragment3');
    await advance([0], 'end3');
    await expectFlag('c3_end');
    await snap('end3');
    console.log('[4장]');
    await expectFlag('c4_started');
    await exitTo(7, 11, 'house', 'home at dusk');
    await advance();
    await expectFlag('c4_storm');
    await exitTo(8, 10, 'storm', 'into the storm');
    await advance();
    await expectFlag('c4_storm_in');
    await snap('storm');
    await goto(8, 19, 'stream bank4');
    await switchChar();
    await goto(12, 19, 'jump4');
    await face('down');
    await press('z');
    await advance();
    await expectFlag('c4_bridge');
    await switchChar();
    await goto(14, 17, 'plaza');
    await advance();
    await expectFlag('c4_bori');
    await goto(15, 14, 'beam west');
    await switchChar();
    await goto(22, 14, 'beam east');
    await face('right');
    await press('z');
    await advance();
    await expectFlag('c4_gate');
    await switchChar();
    await goto(14, 10, 'alley');
    await advance();
    await expectFlag('c4_alley');
    await goto(20, 6, 'found', [0]);
    await advance([0], 'found4');
    await expectFlag('c4_escort');
    await snap('escort');
    await exitTo(4, 18, 'village', 'home');
    await advance([0], 'end4');
    await expectFlag('c4_end');
    await snap('end4');
    console.log('[5장]');
    await expectFlag('c5_started');
    await talk(16, 13, 'up', [], 'tree5');
    await expectFlag('c5_tree');
    await advance();
    await expectFlag('c5_entry');
    await goto(10, 5, 'trap');
    await advance();
    await expectFlag('solo');
    await press('c');
    if ((await st()).control !== 'gamtu') throw new Error('홀로 모드 전환 막힘 실패');
    console.log('  ✓ 홀로 모드: 재희로 못 바꿈');
    await exitTo(10, 0, 'mirror1', 'room1');
    await advance();
    // 쌍둥이 퍼즐: 막힌 방향 입력은 짧게 톡 눌러서 그림자만 한 칸 움직인다
    const twinMoving = () => page.evaluate(() => { const t = G.game.map.eventById('twin'); return !!(t && t.moving); });
    const nudge = async (dir) => { await thaw(); await page.keyboard.down(KEY[dir]);
      for (let i = 0; i < 200 && !(await twinMoving()); i++) await sleep(2);
      await page.keyboard.up(KEY[dir]);
      for (let i = 0; i < 100; i++) { if (!(await page.evaluate(() => { const t = G.game.map.eventById('twin'); return t && t.moving; }))) break; await sleep(10); } await sleep(30); };
    const steps = async (dir, n) => { for (let i = 0; i < n; i++) await step(dir); };
    await steps('left', 2); await steps('up', 6); await advance();
    await expectFlag('c5_room1');
    await exitTo(4, 0, 'mirror2', 'room2');
    await advance();
    await steps('right', 2); await steps('up', 6); await advance();
    await expectFlag('c5_room2');
    await exitTo(4, 0, 'mirror3', 'room3');
    await advance();
    await steps('left', 2); await steps('up', 1);
    for (let i = 0; i < 5; i++) await nudge('right');
    await steps('up', 6); await advance();
    await expectFlag('c5_room3');
    await snap('mirror3');
    await exitTo(4, 0, 'mirrorHall', 'hall');
    await advance();
    await expectFlag('c5_hall');
    await talk(8, 3, 'up', [0], 'final mirror');
    await advance([0], 'end5');
    await expectFlag('c5_end');
    await snap('end5');
    console.log('[6장]');
    await expectFlag('c6_started');
    await talk(16, 13, 'up', [], 'tree6');
    await expectFlag('c6_tree');
    await talk(25, 8, 'up', [], 'boat');
    await expectFlag('c6_island');
    await snap('island');
    await talk(14, 21, 'up', [0, 1], 'q1');
    await expectFlag('c6_q1');
    await talk(14, 15, 'up', [1, 2], 'q2');
    await expectFlag('c6_q2');
    await talk(11, 9, 'up', [1, 0], 'q3');
    await expectFlag('c6_q3');
    await talk(17, 7, 'up', [2, 1], 'q4');
    await expectFlag('c6_q4');
    await snap('lanterns');
    await exitTo(17, 4, 'village', 'core', [0]);
    await advance([0], 'end6');
    await expectFlag('c6_end');
    await snap('end6');
    console.log('[7장]');
    await expectFlag('c7_started');
    await exitTo(28, 20, 'shop', 'shop7');
    await talk(2, 5, 'up', [], 'geumsun7');
    await expectFlag('note_geumsun');
    await exitTo(5, 8, 'village', 'out shop7');
    await page.evaluate(() => { G.interp.run('talk_kkam'); });
    await advance();
    await expectFlag('note_kkam');
    await talk(33, 16, 'up', [], 'ijang7');
    await talk(16, 22, 'up', [], 'minsu7');
    await talk(23, 10, 'up', [], 'kkachi7');
    await talk(25, 10, 'up', [], 'owl7');
    await talk(29, 12, 'left', [], 'mouse7');
    await talk(34, 13, 'right', [], 'bori7');
    await advance();
    await expectFlag('c7_parents');
    await snap('parents');
    await talk(16, 13, 'up', [], 'tree7');
    await expectFlag('c7_tree');
    await exitTo(7, 11, 'house', 'finale');
    for (let i = 0; i < 400 && (await st()).scene !== 'title'; i++) await advance([0], 'finale');
    await expectFlag('c7_end');
    const c7 = await page.evaluate(() => ({ courage: G.game.state.vars.courage, cleared: localStorage.getItem('gamtu_cleared') }));
    if (c7.courage !== 7 || !c7.cleared) throw new Error('완결 상태 이상 ' + JSON.stringify(c7));
    console.log('  ✓ 완결 (용기 7, 완결 표시 저장)');
    await sleep(1500);
    await snap('cleared title');
    // 타이틀의 '이어하기' → 자동 저장으로 실제 화면 흐름 그대로 이어 간다
    await press('z');
    await sleep(500);
    await press('z');
    await sleep(1500);
    if ((await st()).scene !== 'map') throw new Error('이어하기 실패');
    console.log('  ✓ 타이틀 이어하기');
    await advance();
    const fin = await page.evaluate(() => ({ ch: G.game.state.vars.chapter, courage: G.game.state.vars.courage, map: G.game.map.id, auto: !!localStorage.getItem('gamtu_save_auto'), play: G.game.state.playtime }));
    console.log('끝 상태', fin);
    // 저장 / 불러오기
    await press('x');
    await sleep(800);
    await press('ArrowDown'); await press('ArrowDown'); await press('ArrowDown'); await press('z'); // 저장하기
    await sleep(200);
    await sleep(300);
    await press('z'); // 저장 1
    await sleep(400);
    await press('x');
    await sleep(300);
    const saved = await page.evaluate(() => G.game.saveInfo(1));
    if (!saved) throw new Error('저장 실패');
    console.log('  ✓ save', saved.chapter, saved.map);
    await page.evaluate(() => { G.game.state.flags.test_dirty = true; });
    await page.evaluate(() => G.game.load(1));
    if (await flag('test_dirty')) throw new Error('불러오기 실패');
    console.log('  ✓ load');
    await snap('loaded');
  } catch (e) {
    console.error('실패:', e.message);
    console.error('상태', await st());
    await snap('error');
    process.exitCode = 1;
  }
  console.log('소요', ((Date.now() - t0) / 1000).toFixed(1) + 's');
  if (process.env.AUDIT) console.log(audit.length ? `점검 경고 ${audit.length}개` : '저장/겹침 점검 이상 없음');
  console.log(errors.length ? '콘솔:\n' + errors.join('\n') : '콘솔 오류 없음');
  await browser.close();
})();
