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
  async function press(k) { await page.keyboard.press(k); await sleep(30); }

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
  async function expectFlag(name) {
    if (!(await flag(name))) { await snap('fail_' + name); throw new Error('플래그 없음: ' + name + ' / 목표: ' + (await st()).goal); }
    console.log('  ✓', name);
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
    await snap('end');
    const fin = await page.evaluate(() => ({ ch: G.game.state.vars.chapter, courage: G.game.state.vars.courage, map: G.game.map.id, auto: !!localStorage.getItem('gamtu_save_auto'), play: G.game.state.playtime }));
    console.log('끝 상태', fin);
    // 저장 / 불러오기
    await press('x');
    await sleep(300);
    await press('ArrowDown'); await press('ArrowDown'); await press('z'); // 저장하기
    await sleep(200);
    await press('z'); // 저장 1
    await sleep(300);
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
  console.log(errors.length ? '콘솔:\n' + errors.join('\n') : '콘솔 오류 없음');
  await browser.close();
})();
