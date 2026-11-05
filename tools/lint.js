/*
 * 데이터 정적 검사 (개발용)
 *   node tools/lint.js
 * 모든 맵·이벤트·스크립트를 훑어서 없는 스크립트/그림/음악/아이템/맵 참조, 벽 속으로의 이동,
 * 이름표 없는 대사, 괄호 짝 오류, 모르는 명령 등을 찾는다.
 */
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html'));
  await p.waitForTimeout(400);
  const report = await p.evaluate(() => {
    const out = { error: [], warn: [] };
    const E = (m) => out.error.push(m);
    const W = (m) => out.warn.push(m);
    G.game.state = G.game.newState();
    const GD = GameData;
    const SE = ['blip', 'cursor', 'ok', 'cancel', 'door', 'meow', 'meowSmall', 'scared', 'hiss', 'bark', 'whine', 'bell', 'item', 'jump', 'land', 'heart', 'success', 'miss', 'push', 'whoosh', 'shadow', 'roar', 'thud', 'save', 'sparkle', 'bus', 'flash', 'pop', 'squeak', 'caw', 'rustle', 'thunder', 'rain', 'purr'];
    const PARTY = ['player', 'self', ...Object.keys(GD.config.party)];
    const spriteOk = (k) => !!(GD.sprites[k] || G.sprites.PROC[k]);
    const allEventIds = new Set();
    const mapEvents = {};
    for (const id in GD.maps) {
      const defs = [...(GD.maps[id].events || []), ...(GD.mapEvents[id] || [])];
      mapEvents[id] = defs;
      defs.forEach((d) => allEventIds.add(d.id));
    }
    for (const id in GD.mapEvents) if (!GD.maps[id]) E(`addEvents: 없는 맵 ${id}`);
    const maps = {};
    const getMap = (id) => (maps[id] = maps[id] || new G.GameMap(id));
    const checkWarp = (where, [m, x, y, d, o = {}]) => {
      if (!GD.maps[m]) return E(`${where}: 없는 맵으로 이동 ${m}`);
      const mp = getMap(m);
      if (x < 0 || y < 0 || x >= mp.w || y >= mp.h) return E(`${where}: ${m} 밖 좌표 (${x},${y})`);
      const kind = o.cat ? 'gamtu' : 'jaehee';
      const t = G.tiles.get(mp.tile(x, y));
      if (!t.pass && !(t.cat && kind === 'gamtu')) W(`${where}: ${m} (${x},${y}) 도착 타일 '${mp.tile(x, y)}'이 막힌 타일`);
    };
    const checkText = (where, text) => {
      let c1 = 0, c2 = 0;
      for (const ch of text) {
        if (ch === '{') c1++;
        if (ch === '}') c1--;
        if (ch === '[') c2++;
        if (ch === ']') c2--;
      }
      if (c1 || c2) E(`${where}: 괄호 짝이 안 맞음 → ${text.slice(0, 40)}`);
    };
    const SAY = /^([^:\n]{1,10}): ([\s\S]*)$/;
    const walk = (where, list, evIds) => {
      if (!Array.isArray(list)) return;
      for (const c of list) {
        if (typeof c === 'string') {
          const m = SAY.exec(c);
          if (m) {
            if (!GD.characters[m[1]]) W(`${where}: 이름표 없는 화자 "${m[1]}" → ${c.slice(0, 40)}`);
            checkText(where, m[2]);
          } else checkText(where, c);
          continue;
        }
        if (typeof c === 'function') continue;
        if (!Array.isArray(c)) {
          E(`${where}: 이상한 명령 ${JSON.stringify(c).slice(0, 60)}`);
          continue;
        }
        const [op, ...a] = c;
        if (!G.interp.CMDS[op]) E(`${where}: 모르는 명령 ${op}`);
        const tgt = (t) => {
          if (t === undefined || t === null || PARTY.includes(t)) return;
          if (!(evIds ? evIds.has(t) : allEventIds.has(t))) E(`${where}: [${op}] 없는 대상 "${t}"`);
        };
        switch (op) {
          case 'call':
            if (!GD.scripts[a[0]]) E(`${where}: 없는 스크립트 호출 ${a[0]}`);
            break;
          case 'bgm':
            if (a[0] && !GD.music[a[0]]) E(`${where}: 없는 음악 ${a[0]}`);
            break;
          case 'se':
            if (!SE.includes(a[0])) E(`${where}: 없는 효과음 ${a[0]}`);
            break;
          case 'item':
            if (!GD.items[a[0]]) E(`${where}: 없는 아이템 ${a[0]}`);
            break;
          case 'warp':
            checkWarp(where, a);
            break;
          case 'minigame':
            if (!G.minigames.list[a[0]]) E(`${where}: 없는 미니게임 ${a[0]}`);
            break;
          case 'sprite':
            tgt(a[0]);
            if (!spriteOk(a[1])) E(`${where}: 없는 그림 ${a[1]}`);
            break;
          case 'move': case 'face': case 'emote': case 'anim': case 'show': case 'hide': case 'fadeActor': case 'setPos': case 'sparkle': case 'waitMove':
            tgt(a[0]);
            if (op === 'face' && a[1] && !['up', 'down', 'left', 'right'].includes(a[1])) tgt(a[1]);
            if (op === 'move' && /[^UDLRudlr_Jj\s]/.test(a[1])) E(`${where}: 이동 경로 오류 ${a[1]}`);
            break;
          case 'camera':
            if (typeof a[0] === 'string' && a[0] !== 'reset') tgt(a[0]);
            break;
          case 'party':
            if (!GD.config.party[a[1]]) E(`${where}: 없는 동료 ${a[1]}`);
            break;
          case 'choice':
            (a[0] || []).forEach((o) => checkText(where, o));
            (a[1] || []).forEach((br, i) => walk(`${where} > 선택${i}`, br, evIds));
            break;
          case 'if':
            walk(where, a[1], evIds);
            walk(where, a[2], evIds);
            break;
          default:
        }
      }
    };
    // 전역 스크립트
    for (const name in GD.scripts) walk(`스크립트 ${name}`, GD.scripts[name], null);
    // 맵과 이벤트
    for (const id in GD.maps) {
      const def = GD.maps[id];
      const mp = getMap(id);
      for (const v of [].concat(def.bgm || [])) {
        const name = typeof v === 'string' ? v : v.v;
        if (name && !GD.music[name]) E(`맵 ${id}: 없는 음악 ${name}`);
      }
      const ids = new Set(mapEvents[id].map((d) => d.id));
      const seen = {};
      for (const d of mapEvents[id]) {
        const where = `맵 ${id} 이벤트 ${d.id}`;
        if (seen[d.id]) W(`${where}: 같은 맵에 같은 id 가 둘 (${d.id}) — 대상 지정 시 앞의 것만 쓰임`);
        seen[d.id] = true;
        if (d.x < 0 || d.y < 0 || d.x >= mp.w || d.y >= mp.h) E(`${where}: 맵 밖 좌표 (${d.x},${d.y})`);
        for (const pg of d.pages || [d]) {
          if (pg.sprite && !spriteOk(pg.sprite)) E(`${where}: 없는 그림 ${pg.sprite}`);
          if (pg.warp) checkWarp(where, pg.warp);
          if (typeof pg.script === 'string' && !GD.scripts[pg.script]) E(`${where}: 없는 스크립트 ${pg.script}`);
          if (Array.isArray(pg.script)) walk(where, pg.script, ids);
          if (pg.move && pg.move.route && /[^UDLR_]/.test(pg.move.route)) E(`${where}: 순찰 경로 오류`);
          if (pg.pos && (pg.pos[0] >= mp.w || pg.pos[1] >= mp.h)) E(`${where}: pos 가 맵 밖`);
        }
      }
    }
    for (const k in GD.items) if (GD.items[k].icon && !spriteOk(GD.items[k].icon)) E(`아이템 ${k}: 없는 아이콘 ${GD.items[k].icon}`);
    for (const k in GD.characters) {
      const c = GD.characters[k];
      if (c.sprite && !spriteOk(c.sprite)) E(`이름표 ${k}: 없는 초상화 ${c.sprite}`);
    }
    for (const k in GD.sprites) {
      try {
        G.sprites.get(k);
      } catch (e) {
        E(`그림 ${k}: 만들기 실패 ${e.message}`);
      }
    }
    return out;
  });
  console.log(`오류 ${report.error.length}개`);
  report.error.forEach((m) => console.log('  ✗ ' + m));
  console.log(`경고 ${report.warn.length}개`);
  report.warn.forEach((m) => console.log('  △ ' + m));
  if (errs.length) console.log('페이지 오류:', errs);
  await b.close();
  process.exitCode = report.error.length ? 1 : 0;
})();
