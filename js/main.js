'use strict';
/* main.js — 부팅, 화면 크기 맞추기, 메인 루프 */
(function () {
  const cv = G.$('#game');
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  function resize() {
    const touch = G.input.touch;
    const vw = window.innerWidth,
      vh = window.innerHeight;
    const portrait = vh > vw;
    const ctrlH = touch && portrait ? Math.min(230, vh * 0.36) : 0;
    const availW = vw,
      availH = vh - ctrlH;
    let s = Math.min(availW / G.W, availH / G.H);
    if (s >= 2 && !touch) s = Math.floor(s * 2) / 2;
    const scr = G.$('#screen');
    scr.style.width = Math.floor(G.W * s) + 'px';
    scr.style.height = Math.floor(G.H * s) + 'px';
    scr.style.setProperty('--u', s);
    document.body.classList.toggle('portrait', portrait);
    G.$('#app').style.justifyContent = touch && portrait ? 'flex-start' : 'center';
  }
  window.addEventListener('resize', resize);

  let last = performance.now();
  function frame(ts) {
    requestAnimationFrame(frame);
    const realDt = Math.min(0.05, Math.max(0, (ts - last) / 1000));
    last = ts;
    const waiters = G.frameWaiters;
    G.frameWaiters = [];
    G.input.beginFrame();
    const n = G.debug.speed | 0 || 1;
    G.dt = realDt;
    const hits = G.input.hits;
    for (let i = 0; i < n; i++) {
      G.input.hits = i === 0 ? hits : new Set(); // 한 번 누른 키는 한 번만 처리
      G.time += realDt * 1000;
      G.frame++;
      G.game.update(realDt);
    }
    G.input.hits = hits;
    if (G.game.scene === 'title') G.ui.renderTitle(ctx);
    else G.game.render(ctx);
    for (const r of waiters) r();
  }

  function boot() {
    G.input.setupTouch();
    G.dialog.init();
    G.ui.loadSettings();
    resize();
    // 타이틀 전 "터치/키 누르기" 화면 (오디오 잠금 해제용)
    const root = G.$('#title');
    root.className = 'layer show';
    root.innerHTML = `<div class="logo"><div class="logo-sub">겁쟁이 고양이의 아주 커다란 모험</div><div class="logo-main">감투와 별방울</div></div>
      <div class="press">${G.input.touch ? '화면을 터치하세요' : '아무 키나 누르세요'}</div>`;
    G.game.scene = 'title';
    const go = () => {
      window.removeEventListener('keydown', go);
      window.removeEventListener('pointerdown', go);
      G.audio.unlock();
      G.input.pending.clear();
      G.ui.toTitle();
    };
    window.addEventListener('keydown', go);
    window.addEventListener('pointerdown', go);
    requestAnimationFrame(frame);
    window.__game = G; // 디버그·자동 점검용
  }
  boot();
})();
