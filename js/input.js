'use strict';
/* input.js — 키보드 + 터치 입력 */
(function () {
  const DIRS = ['up', 'down', 'left', 'right'];
  const I = (G.input = { held: {}, pending: new Set(), hits: new Set(), dirOrder: [], touch: false });
  const KEYMAP = {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    KeyZ: 'ok', Enter: 'ok', NumpadEnter: 'ok', Space: 'ok',
    KeyX: 'cancel', Escape: 'cancel', Backspace: 'cancel',
    KeyC: 'switch', ShiftLeft: 'switch', ShiftRight: 'switch',
  };

  I.press = (a) => {
    if (I.held[a]) return;
    I.held[a] = true;
    I.pending.add(a);
    if (DIRS.includes(a)) {
      I.dirOrder = I.dirOrder.filter((d) => d !== a);
      I.dirOrder.push(a);
    }
  };
  I.release = (a) => {
    I.held[a] = false;
    if (DIRS.includes(a)) I.dirOrder = I.dirOrder.filter((d) => d !== a);
  };
  I.tap = (a) => I.pending.add(a);
  I.dir = () => (I.dirOrder.length ? I.dirOrder[I.dirOrder.length - 1] : null);
  I.hit = (a) => I.hits.has(a);
  I.any = (...as) => as.some((a) => I.hits.has(a));
  I.beginFrame = () => {
    I.hits = I.pending;
    I.pending = new Set();
  };
  I.releaseAll = () => {
    for (const k in I.held) I.release(k);
  };

  window.addEventListener('keydown', (e) => {
    const a = KEYMAP[e.code];
    if (!a) return;
    e.preventDefault();
    if (G.audio) G.audio.unlock();
    if (e.repeat) {
      if (DIRS.includes(a)) I.pending.add(a); // 메뉴 커서용 반복 입력
      return;
    }
    I.press(a);
  });
  window.addEventListener('keyup', (e) => {
    const a = KEYMAP[e.code];
    if (!a) return;
    e.preventDefault();
    I.release(a);
  });
  window.addEventListener('blur', I.releaseAll);

  /* ---------- 터치 ---------- */
  I.setupTouch = function () {
    const enable = () => {
      if (I.touch) return;
      I.touch = true;
      document.body.classList.add('touch');
      window.dispatchEvent(new Event('resize'));
    };
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) enable();
    window.addEventListener('touchstart', enable, { passive: true, once: true });

    // 버튼
    document.querySelectorAll('[data-act]').forEach((el) => {
      const act = el.dataset.act;
      const down = (e) => {
        e.preventDefault();
        if (G.audio) G.audio.unlock();
        el.classList.add('on');
        I.press(act);
        if (el.setPointerCapture && e.pointerId !== undefined) el.setPointerCapture(e.pointerId);
      };
      const up = (e) => {
        e.preventDefault();
        el.classList.remove('on');
        I.release(act);
      };
      el.addEventListener('pointerdown', down);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      el.addEventListener('lostpointercapture', up);
      el.addEventListener('contextmenu', (e) => e.preventDefault());
    });

    // 방향 패드 (미끄러지듯 방향 전환 가능)
    const pad = document.getElementById('dpad');
    if (pad) {
      let cur = null;
      const set = (d) => {
        if (d === cur) return;
        if (cur) I.release(cur);
        cur = d;
        if (d) I.press(d);
        pad.dataset.dir = d || '';
      };
      const fromEvent = (e) => {
        const r = pad.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2),
          dy = e.clientY - (r.top + r.height / 2);
        if (Math.hypot(dx, dy) < r.width * 0.12) return null;
        return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
      };
      pad.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (G.audio) G.audio.unlock();
        pad.setPointerCapture(e.pointerId);
        set(fromEvent(e));
      });
      pad.addEventListener('pointermove', (e) => {
        if (cur !== null || e.buttons) set(fromEvent(e));
      });
      const end = (e) => {
        e.preventDefault();
        set(null);
      };
      pad.addEventListener('pointerup', end);
      pad.addEventListener('pointercancel', end);
      pad.addEventListener('lostpointercapture', end);
    }
  };
})();
