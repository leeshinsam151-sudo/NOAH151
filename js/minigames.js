'use strict';
/*
 * minigames.js — 미니게임 틀
 * G.minigames.register(이름, async (opt, ui) => 결과) 로 새 미니게임을 추가할 수 있다.
 * 스크립트에서는 ['minigame', '이름', {옵션}] 으로 실행하고 결과는 vars.mg 에 저장된다.
 */
(function () {
  const I = G.input;
  const M = (G.minigames = { list: {}, active: null });
  M.register = (name, fn) => {
    M.list[name] = fn;
  };

  M.run = async function (name, opt) {
    const fn = M.list[name];
    if (!fn) {
      console.warn('미니게임 없음', name);
      return null;
    }
    const root = G.$('#minigame');
    root.innerHTML = '';
    root.className = 'layer show mg-' + name;
    M.active = name;
    try {
      return await fn(opt, root);
    } finally {
      M.active = null;
      root.className = 'layer';
      root.innerHTML = '';
    }
  };

  /* ---------- 심장 박자 맞추기 (용기 내기) ----------
   * 좌우로 움직이는 표시가 가운데 하트 칸에 들어왔을 때 Z(터치)를 누른다.
   * 실패해도 게임 오버는 없다. 격려 대사가 나오고 다시 도전한다. */
  M.register('heartbeat', async (opt, root) => {
    const need = opt.hits || 3;
    root.innerHTML = `
      <div class="mg-box">
        <div class="mg-title">${opt.title || '용기를 내!'}</div>
        <canvas width="200" height="48"></canvas>
        <div class="mg-line"></div>
        <div class="mg-help">${G.input.touch ? '화면을 터치' : 'Z / Enter'} : 하트에 맞춰 누르기</div>
      </div>`;
    const cv = root.querySelector('canvas'),
      g = cv.getContext('2d'),
      lineEl = root.querySelector('.mg-line');
    root.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      I.tap('ok');
    });
    const lines = opt.lines || [];
    const miss = opt.missLines || ['조금만 더…!'];
    let hits = 0,
      misses = 0,
      t = 0,
      flash = 0,
      shake = 0,
      zone = opt.zone || 0.16,
      spd = opt.speed || 1.4;
    lineEl.textContent = lines[0] || '';
    M.state = { pos: 0, zone, hits };
    let done = false;
    while (!done) {
      await G.nextFrame();
      t += (1 / 60) * spd * G.debug.speed;
      const pos = Math.sin(t * 2.2); // -1..1
      M.state.pos = pos;
      M.state.zone = zone;
      if (I.hit('ok') || (G.debug.autoMinigame && Math.abs(pos) < zone * 0.5)) {
        if (Math.abs(pos) <= zone) {
          hits++;
          flash = 1;
          G.audio.se('heart');
          lineEl.textContent = lines[hits] || lines[lines.length - 1] || '';
          zone = Math.max(0.09, zone * 0.85);
          spd *= 1.12;
          if (hits >= need) done = true;
        } else {
          misses++;
          shake = 1;
          G.audio.se('miss');
          lineEl.textContent = miss[(misses - 1) % miss.length];
          spd = Math.max(1.0, spd * 0.92);
        }
        M.state.hits = hits;
      }
      // 그리기
      g.clearRect(0, 0, 200, 48);
      const sx = shake > 0 ? Math.round((Math.random() - 0.5) * 6 * shake) : 0;
      shake = Math.max(0, shake - 0.06);
      g.fillStyle = '#1b1b30';
      g.fillRect(10 + sx, 20, 180, 10);
      const zw = zone * 90;
      g.fillStyle = '#ff6f91';
      g.fillRect(100 - zw + sx, 18, zw * 2, 14);
      // 하트
      const beat = 1 + flash * 0.6 + Math.max(0, Math.sin(t * 6)) * 0.08;
      drawHeart(g, 100 + sx, 25, 7 * beat, flash > 0.1 ? '#ffffff' : '#ff3d6e');
      flash = Math.max(0, flash - 0.05);
      // 표시
      const mx = 100 + pos * 88;
      g.fillStyle = '#ffe066';
      g.fillRect(mx - 1 + sx, 12, 3, 26);
      // 진행
      for (let i = 0; i < need; i++) {
        g.fillStyle = i < hits ? '#ffe066' : '#444466';
        g.fillRect(100 - need * 7 + i * 14 + 3, 40, 8, 5);
      }
    }
    lineEl.textContent = opt.doneLine || '';
    await G.wait(700);
    return { hits, misses };
  });

  function drawHeart(g, cx, cy, r, col) {
    g.fillStyle = col;
    for (let y = -r; y <= r; y++)
      for (let x = -r * 1.2; x <= r * 1.2; x++) {
        const X = x / r,
          Y = -y / r;
        const v = Math.pow(X * X + Y * Y - 1, 3) - X * X * Y * Y * Y;
        if (v <= 0) g.fillRect(Math.round(cx + x), Math.round(cy + y), 1, 1);
      }
  }
})();
