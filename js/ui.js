'use strict';
/* ui.js — 타이틀 화면, 메뉴, 저장/불러오기, 설정 */
(function () {
  const I = G.input;
  const UI = (G.ui = { menuOpen: false });
  const SETTINGS_KEY = 'gamtu_settings';

  UI.settings = { bgm: 6, se: 7, speed: 1 };
  UI.loadSettings = function () {
    try {
      Object.assign(UI.settings, JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'));
    } catch (e) {
      /* 기본값 */
    }
    UI.applySettings();
  };
  UI.applySettings = function () {
    G.audio.setVolume(UI.settings.bgm / 10, UI.settings.se / 10);
    G.dialog.settings.speed = UI.settings.speed;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(UI.settings));
    } catch (e) {
      /* 무시 */
    }
  };

  /* ---------- 공용: 목록 선택 ---------- */
  async function listSelect(root, items, opt = {}) {
    let sel = opt.start || 0;
    while (items[sel] && items[sel].disabled) sel = (sel + 1) % items.length;
    root.innerHTML = '';
    const els = items.map((it, i) => {
      const el = document.createElement('div');
      el.className = 'opt' + (it.disabled ? ' off' : '');
      el.innerHTML = it.html || it.label;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (it.disabled) return;
        sel = i;
        picked = i;
      });
      root.appendChild(el);
      return el;
    });
    let picked = -1;
    const render = () => {
      els.forEach((el, i) => el.classList.toggle('sel', i === sel));
      if (opt.onMove) opt.onMove(sel);
    };
    render();
    for (;;) {
      await G.nextFrame();
      if (picked >= 0) {
        G.audio.se('ok');
        return picked;
      }
      const mv = I.hit('up') ? -1 : I.hit('down') ? 1 : 0;
      if (mv) {
        let n = sel;
        for (let k = 0; k < items.length; k++) {
          n = (n + mv + items.length) % items.length;
          if (!items[n].disabled) break;
        }
        sel = n;
        G.audio.se('cursor');
        render();
      }
      if (opt.lr && (I.hit('left') || I.hit('right'))) {
        opt.lr(sel, I.hit('left') ? -1 : 1);
        items.forEach((it, i) => (els[i].innerHTML = it.html || it.label));
        render();
      }
      if (I.hit('ok')) {
        G.audio.se('ok');
        return sel;
      }
      if (I.hit('cancel')) {
        G.audio.se('cancel');
        return -1;
      }
    }
  }
  UI.listSelect = listSelect;

  /* ---------- 타이틀 ---------- */
  UI.toTitle = async function () {
    try {
      UI.cleared = !!localStorage.getItem('gamtu_cleared');
    } catch (e) {
      UI.cleared = false;
    }
    G.game.scene = 'title';
    G.audio.playAmb(null);
    G.audio.setEcho(false);
    G.game.map = null;
    G.game.busy = false;
    UI.menuOpen = false;
    G.dialog.hide();
    G.$('#menu').className = 'layer';
    G.$('#game').style.filter = '';
    G.$('#tone').className = 'layer';
    G.$('#caption').className = 'layer';
    G.$('#caption').innerHTML = '';
    const fade = G.$('#fade');
    fade.style.transition = 'opacity 900ms';
    fade.style.opacity = 0;
    G.audio.playBgm('title', 1200);
    const root = G.$('#title');
    root.className = 'layer show';
    root.innerHTML = `
      <div class="logo"><div class="logo-sub">겁쟁이 고양이의 아주 커다란 모험</div><div class="logo-main">감투와 별방울</div>${UI.cleared ? '<div class="logo-clear">★ 완결 ★</div>' : ''}</div>
      <div class="title-menu"></div>
      <div class="title-foot">${I.touch ? '' : '방향키 이동 · Z/Enter 결정 · X/Esc 취소'}</div>`;
    const menu = root.querySelector('.title-menu');
    for (;;) {
      const has = G.game.hasAnySave();
      const i = await listSelect(menu, [{ label: '처음부터' }, { label: '이어하기', disabled: !has }, { label: '설정' }], { start: has ? 1 : 0 });
      if (i === 0) {
        root.className = 'layer';
        await G.interp.fade(1, 600);
        root.innerHTML = '';
        G.game.newGame();
        return;
      }
      if (i === 1) {
        const slot = await UI.slotPicker(menu, 'load');
        if (slot !== null) {
          root.className = 'layer';
          root.innerHTML = '';
          await G.interp.fade(1, 400);
          G.game.load(slot);
          await G.interp.fade(0, 600);
          return;
        }
      }
      if (i === 2) await UI.settingsMenu(menu);
    }
  };

  UI.slotPicker = async function (root, mode) {
    const slots = mode === 'load' ? ['auto', 1, 2, 3] : [1, 2, 3];
    const items = slots.map((s) => {
      const inf = G.game.saveInfo(s);
      const name = s === 'auto' ? '자동 저장' : `저장 ${s}`;
      const html = inf
        ? `<b>${name}</b> <span class="slot-info">${inf.chapter || ''} · ${inf.map || ''} · ${G.U.fmtTime(inf.playtime || 0)}</span>`
        : `<b>${name}</b> <span class="slot-info">— 비어 있음 —</span>`;
      return { html, disabled: mode === 'load' && !inf };
    });
    items.push({ label: '돌아가기' });
    const i = await listSelect(root, items);
    if (i < 0 || i >= slots.length) return null;
    return slots[i];
  };

  UI.settingsMenu = async function (root) {
    const S = UI.settings;
    const speeds = ['느림', '보통', '빠름', '즉시'];
    const bar = (v) => '■'.repeat(v) + '□'.repeat(10 - v);
    const items = [{}, {}, {}, { label: '돌아가기' }];
    const refresh = () => {
      items[0].html = `음악 볼륨 ◀ ${bar(S.bgm)} ▶`;
      items[1].html = `효과음 볼륨 ◀ ${bar(S.se)} ▶`;
      items[2].html = `글자 속도 ◀ ${speeds[S.speed]} ▶`;
    };
    refresh();
    const lr = (sel, d) => {
      if (sel === 0) S.bgm = G.U.clamp(S.bgm + d, 0, 10);
      if (sel === 1) S.se = G.U.clamp(S.se + d, 0, 10);
      if (sel === 2) S.speed = G.U.clamp(S.speed + d, 0, 3);
      UI.applySettings();
      G.audio.se('cursor');
      refresh();
    };
    let start = 0;
    for (;;) {
      const i = await listSelect(root, items, { lr, start });
      if (i === 3 || i < 0) return;
      // Z(터치)로 누르면 값이 한 칸씩 올라가고 끝에서 처음으로 돈다
      if (i === 0) S.bgm = (S.bgm + 1) % 11;
      if (i === 1) S.se = (S.se + 1) % 11;
      if (i === 2) S.speed = (S.speed + 1) % 4;
      UI.applySettings();
      start = i;
      refresh();
    }
  };

  /* ---------- 게임 내 메뉴 ---------- */
  UI.openMenu = async function () {
    if (UI.menuOpen) return;
    UI.menuOpen = true;
    G.input.releaseAll();
    G.audio.se('ok');
    const s = G.game.state;
    const root = G.$('#menu');
    root.className = 'layer show';
    const courage = s.vars.courage || 0;
    const max = GameData.config.maxCourage || 7;
    const bell = G.sprites.dataURL('bell', 2);
    const bells = Array.from({ length: max }, (_, i) => `<img src="${bell}" class="${i < courage ? 'on' : ''}">`).join('');
    const items = Object.entries(s.items).filter(([, n]) => n > 0);
    root.innerHTML = `
      <div class="menu-wrap">
        <div class="menu-left panel"><div class="menu-list"></div></div>
        <div class="menu-right panel">
          <div class="m-chapter">${s.chapterTitle || ''}</div>
          <div class="m-goal"><span>할 일</span>${s.goal || '—'}</div>
          <div class="m-courage"><span>감투의 용기</span><div class="bells">${bells}</div></div>
          <div class="m-time">플레이 시간 ${G.U.fmtTime(s.playtime)}</div>
          <div class="m-sub"></div>
        </div>
      </div>`;
    const list = root.querySelector('.menu-list'),
      sub = root.querySelector('.m-sub');
    const showItems = () => {
      sub.innerHTML = items.length
        ? '<div class="m-items">' +
          items
            .map(([id, n]) => {
              const it = GameData.items[id] || { name: id };
              const ic = it.icon ? `<img src="${G.sprites.dataURL(it.icon, 2)}">` : '';
              return `<div class="m-item">${ic}<b>${it.name}</b>${n > 1 ? ' ×' + n : ''}<small>${it.desc || ''}</small></div>`;
            })
            .join('') +
          '</div>'
        : '<div class="m-items">가진 물건이 없다.</div>';
    };
    showItems();
    for (;;) {
      const MENU = ['돌아가기', '감투의 귀띔', '소지품', '저장하기', '불러오기', '설정', '도움말', '타이틀로'];
      const k = await listSelect(list, MENU.map((label) => ({ label })));
      // 아래 번호는 예전 순서(돌아가기·소지품·저장·불러오기·설정·도움말·타이틀로, 귀띔=7)를 그대로 쓴다
      const i = k < 0 ? k : [0, 7, 1, 2, 3, 4, 5, 6][k];
      if (i <= 0) break;
      if (i === 7) {
        const goal = s.goal || '';
        const hit = (GameData.config.hints || []).find(([k]) => goal.startsWith(k));
        const face = G.sprites.dataURL('gamtu', 3);
        sub.innerHTML = `<div class="m-hint"><img src="${face}"><div><b>감투의 귀띔</b><p>${hit ? hit[1] : GameData.config.hintDefault || ''}</p></div></div>`;
        G.audio.se('meowSmall');
      }
      if (i === 1) showItems();
      if (i === 2) {
        const slot = await UI.slotPicker(sub, 'save');
        if (slot !== null) {
          if (G.game.save(slot)) {
            G.audio.se('save');
            G.dialog.toast(`저장 ${slot}에 저장했습니다.`, 'save');
          }
        }
        showItems();
      }
      if (i === 3) {
        const slot = await UI.slotPicker(sub, 'load');
        if (slot !== null) {
          await G.interp.fade(1, 300);
          root.className = 'layer';
          UI.menuOpen = false;
          G.game.load(slot);
          await G.interp.fade(0, 500);
          return;
        }
        showItems();
      }
      if (i === 4) {
        await UI.settingsMenu(sub);
        showItems();
      }
      if (i === 5) {
        sub.innerHTML = `<div class="m-help">${GameData.config.helpHTML || ''}</div>`;
      }
      if (i === 6) {
        const c = await listSelect(sub, [{ label: '저장하지 않은 진행은 사라집니다. 타이틀로 갈까요?', disabled: true }, { label: '타이틀로 간다' }, { label: '취소' }], { start: 2 });
        if (c === 1) {
          root.className = 'layer';
          UI.menuOpen = false;
          await G.interp.fade(1, 600);
          UI.toTitle();
          return;
        }
        showItems();
      }
    }
    root.className = 'layer';
    UI.menuOpen = false;
    G.input.releaseAll();
  };

  /* ---------- 타이틀 배경 그리기 ---------- */
  const stars = Array.from({ length: 70 }, (_, i) => ({ x: G.U.hash(i, 3) * 320, y: G.U.hash(i, 4) * 150, p: G.U.hash(i, 5) * 6 }));
  let shoot = null;
  UI.renderTitle = function (g) {
    const t = G.time / 1000;
    const sky = g.createLinearGradient(0, 0, 0, 240);
    sky.addColorStop(0, '#0b1033');
    sky.addColorStop(0.6, '#2a2560');
    sky.addColorStop(1, '#4a3a70');
    g.fillStyle = sky;
    g.fillRect(0, 0, 320, 240);
    for (const s of stars) {
      const a = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + s.p));
      g.fillStyle = `rgba(255,255,230,${a})`;
      g.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
    }
    // 달무리
    const mx = 238,
      my = 62;
    const halo = g.createRadialGradient(mx, my, 14, mx, my, 54);
    halo.addColorStop(0, 'rgba(255,250,220,0.35)');
    halo.addColorStop(0.55, 'rgba(200,190,255,0.12)');
    halo.addColorStop(0.75, 'rgba(255,220,200,0.18)');
    halo.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = halo;
    g.fillRect(mx - 60, my - 60, 120, 120);
    G.sprites.ellipse(g, mx, my, 16, 16, '#fff6d6');
    G.sprites.ellipse(g, mx - 5, my - 4, 3, 3, '#efe2b8');
    G.sprites.ellipse(g, mx + 6, my + 5, 2, 2, '#efe2b8');
    // 별똥별
    if (!shoot && Math.random() < 0.006) shoot = { x: 40 + Math.random() * 180, y: 10 + Math.random() * 40, t: 0 };
    if (shoot) {
      shoot.t += 1 / 60;
      for (let i = 0; i < 12; i++) {
        g.fillStyle = `rgba(255,255,220,${1 - i / 12})`;
        g.fillRect(Math.round(shoot.x + shoot.t * 160 - i * 2), Math.round(shoot.y + shoot.t * 60 - i * 0.75), 1, 1);
      }
      if (shoot.t > 0.7) shoot = null;
    }
    // 언덕과 마을
    g.fillStyle = '#1c2a3a';
    for (let x = 0; x < 320; x++) {
      const h = 170 + Math.sin(x / 40) * 10 + Math.sin(x / 13) * 3;
      g.fillRect(x, h, 1, 240 - h);
    }
    g.fillStyle = '#243548';
    for (const [x, w] of [[30, 34], [76, 28], [250, 40]]) {
      g.fillRect(x, 168, w, 14);
      for (let i = 0; i < 6; i++) g.fillRect(x - 4 + i, 168 - i, w + 8 - i * 2, 1);
      g.fillStyle = 'rgba(255,210,120,0.8)';
      g.fillRect(x + 8, 172, 4, 4);
      g.fillStyle = '#243548';
    }
    g.fillStyle = '#16212e';
    for (let x = 0; x < 320; x++) {
      const h = 196 + Math.sin(x / 55 + 1) * 8;
      g.fillRect(x, h, 1, 240 - h);
    }
    // 재희와 감투
    const j = G.sprites.get('jaehee'),
      c = G.sprites.get('gamtu');
    g.drawImage(G.sprites.frame(j, 'up', 0, 0), 150, 178);
    if (UI.cleared) {
      // 완결 후에는 할머니도 함께 언덕에 앉아 있다
      g.drawImage(G.sprites.frame(G.sprites.get('grandmaPin'), 'up', 0, 0), 134, 178);
    }
    g.drawImage(G.sprites.frame(c, 'up', 0, 0), 166, 180);
    // 반딧불
    for (let i = 0; i < 10; i++) {
      const x = (G.U.hash(i, 9) * 320 + Math.sin(t * 0.6 + i) * 14 + 320) % 320;
      const y = 190 + G.U.hash(i, 8) * 40 + Math.cos(t * 0.8 + i) * 6;
      g.fillStyle = `rgba(230,255,140,${0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i))})`;
      g.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
  };
})();
