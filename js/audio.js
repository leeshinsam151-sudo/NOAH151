'use strict';
/*
 * audio.js — WebAudio 칩튠 신디사이저
 * 음악은 data/music.js 의 트래커 형식(8분음표 단위 토큰)으로 정의된다.
 *   'c5' 음표, '-' 앞 음 늘이기, '.' 쉼표, 드럼 채널은 'k'(킥) 'x'(스네어) 'h'(하이햇)
 */
(function () {
  const A = (G.audio = { ctx: null, bgmVol: 0.6, seVol: 0.7, cur: null, curName: null, pending: null });
  let master, bgmBus, seBus, ambBus, echoDelay, echoFb, echoLp, echoSend, noiseBuf;
  const mix = (k) => ((GameData.config.mix || {})[k] || {});
  let seMul = 1;
  const NOTE = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

  function freq(tok) {
    const m = /^([a-g])([#b]?)(\d)$/.exec(tok);
    if (!m) return 0;
    const n = NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (parseInt(m[3], 10) + 1) * 12;
    return 440 * Math.pow(2, (n - 69) / 12);
  }
  A.freq = freq;

  A.unlock = function () {
    if (A.ctx) {
      if (A.ctx.state === 'suspended') A.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      A.ctx = new AC();
    } catch (e) {
      return;
    }
    master = A.ctx.createGain();
    master.gain.value = 0.9 * ((GameData.config.mix || {}).master || 1);
    // 리미터: 천둥처럼 큰 소리가 겹쳐도 찢어지지 않게
    const lim = A.ctx.createDynamicsCompressor();
    lim.threshold.value = -6;
    lim.knee.value = 4;
    lim.ratio.value = 12;
    lim.attack.value = 0.003;
    lim.release.value = 0.15;
    master.connect(lim);
    lim.connect(A.ctx.destination);
    bgmBus = A.ctx.createGain();
    bgmBus.gain.value = A.bgmVol;
    bgmBus.connect(master);
    seBus = A.ctx.createGain();
    seBus.gain.value = A.seVol;
    seBus.connect(master);
    // 환경음(매미·빗소리·물소리 등)은 효과음 볼륨을 따른다
    ambBus = A.ctx.createGain();
    ambBus.gain.value = A.seVol;
    ambBus.connect(master);
    // 동굴·탑 메아리: 효과음에 짧은 되울림을 더한다 (A.setEcho)
    echoDelay = A.ctx.createDelay(1);
    echoDelay.delayTime.value = 0.23;
    echoFb = A.ctx.createGain();
    echoFb.gain.value = 0.35;
    echoLp = A.ctx.createBiquadFilter();
    echoLp.type = 'lowpass';
    echoLp.frequency.value = 1800;
    echoSend = A.ctx.createGain();
    echoSend.gain.value = 0;
    seBus.connect(echoSend);
    echoSend.connect(echoDelay);
    echoDelay.connect(echoLp);
    echoLp.connect(echoFb);
    echoFb.connect(echoDelay);
    echoLp.connect(master);
    if (A.echoOn) A.setEcho(true);
    if (A.ambPending !== undefined) A.playAmb(A.ambPending);
    noiseBuf = A.ctx.createBuffer(1, A.ctx.sampleRate, A.ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    setInterval(tick, 25);
    if (A.pending !== null) {
      const p = A.pending;
      A.pending = null;
      A.curName = null;
      A.playBgm(p, 0);
    }
  };

  A.setVolume = function (bgm, se) {
    A.bgmVol = bgm;
    A.seVol = se;
    if (bgmBus) bgmBus.gain.value = bgm;
    if (seBus) seBus.gain.value = se;
    if (ambBus) ambBus.gain.value = se;
  };
  A.setEcho = function (on) {
    A.echoOn = !!on;
    if (echoSend) echoSend.gain.setTargetAtTime(on ? 0.45 : 0, A.ctx.currentTime, 0.1);
  };

  /* ---------- BGM ---------- */
  function compile(def) {
    const steps = def.steps || 2;
    let len = 0;
    const chans = def.channels.map((ch) => {
      const toks = ch.notes.trim().split(/\s+/);
      len = Math.max(len, toks.length);
      const byStep = {};
      let last = null;
      toks.forEach((t, i) => {
        if (t === '-') {
          if (last) last.len++;
        } else if (t === '.') last = null;
        else {
          last = { t, len: 1 };
          byStep[i] = last;
        }
      });
      return { o: ch, byStep };
    });
    return { def, chans, len, stepDur: 60 / def.bpm / steps };
  }
  const compiled = {};

  A.playBgm = function (name, fade = 800) {
    if (name === A.curName) return;
    A.curName = name;
    if (!A.ctx) {
      A.pending = name;
      return;
    }
    A.stopBgm(fade, true);
    A.curName = name;
    if (!name) return;
    const def = GameData.music[name];
    if (!def) {
      console.warn('BGM 없음:', name);
      return;
    }
    const song = (compiled[name] = compiled[name] || compile(def));
    const g = A.ctx.createGain();
    g.gain.value = 0;
    g.connect(bgmBus);
    const t0 = A.ctx.currentTime + 0.06;
    g.gain.setValueAtTime(0, A.ctx.currentTime);
    g.gain.linearRampToValueAtTime((def.vol || 1) * (mix('bgm')[name] || 1), t0 + Math.max(0.05, fade / 1000));
    A.cur = { song, gain: g, start: t0, next: 0, loop: def.loop !== false };
  };

  A.stopBgm = function (fade = 800, keepName) {
    if (!keepName) A.curName = null;
    if (!A.ctx) {
      if (!keepName) A.pending = null;
      return;
    }
    const c = A.cur;
    A.cur = null;
    if (c) {
      const t = A.ctx.currentTime;
      c.gain.gain.cancelScheduledValues(t);
      c.gain.gain.setValueAtTime(c.gain.gain.value, t);
      c.gain.gain.linearRampToValueAtTime(0, t + Math.max(0.03, fade / 1000));
      setTimeout(() => c.gain.disconnect(), fade + 400);
    }
  };

  function tick() {
    const c = A.cur;
    if (!c || !A.ctx) return;
    const ahead = A.ctx.currentTime + 0.2;
    const s = c.song;
    while (c.start + c.next * s.stepDur < ahead) {
      if (!c.loop && c.next >= s.len) {
        A.cur = null;
        A.curName = null;
        return;
      }
      const step = c.next % s.len;
      const t = c.start + c.next * s.stepDur;
      for (const ch of s.chans) {
        const n = ch.byStep[step];
        if (n) playNote(ch.o, n, t, n.len * s.stepDur, c.gain);
      }
      c.next++;
    }
  }

  function playNote(o, n, t, dur, bus) {
    const c = A.ctx;
    const v = o.vol || 0.08;
    if (o.wave === 'noise') return drum(n.t, t, v, bus);
    const f = freq(n.t);
    if (!f) return;
    const osc = c.createOscillator();
    osc.type = o.wave || 'square';
    osc.frequency.value = f;
    if (o.detune) osc.detune.value = o.detune;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 0.008);
    let end;
    if (o.env === 'pluck') {
      end = t + Math.max(0.25, dur * 1.6);
      g.gain.exponentialRampToValueAtTime(0.0004, end);
    } else {
      const hold = Math.max(t + 0.03, t + dur - 0.03);
      g.gain.linearRampToValueAtTime(v * 0.75, t + Math.min(0.08, hold - t));
      g.gain.setValueAtTime(v * 0.75, hold);
      end = t + dur;
      g.gain.linearRampToValueAtTime(0, end);
    }
    if (o.vib) {
      const lfo = c.createOscillator(),
        lg = c.createGain();
      lfo.frequency.value = 5;
      lg.gain.value = o.vib;
      lfo.connect(lg);
      lg.connect(osc.detune);
      lfo.start(t);
      lfo.stop(end + 0.02);
    }
    osc.connect(g);
    g.connect(bus);
    osc.start(t);
    osc.stop(end + 0.02);
  }

  function noiseSrc(t, dur) {
    const s = A.ctx.createBufferSource();
    s.buffer = noiseBuf;
    s.start(t, Math.random() * 0.5);
    s.stop(t + dur);
    return s;
  }

  function drum(kind, t, v, bus) {
    const c = A.ctx;
    if (kind === 'k') {
      const o = c.createOscillator(),
        g = c.createGain();
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
      g.gain.setValueAtTime(v * 2.2, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      o.connect(g);
      g.connect(bus);
      o.start(t);
      o.stop(t + 0.18);
      return;
    }
    const s = noiseSrc(t, kind === 'h' ? 0.05 : 0.14);
    const f = c.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = kind === 'h' ? 6000 : 1200;
    const g = c.createGain();
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + (kind === 'h' ? 0.045 : 0.13));
    s.connect(f);
    f.connect(g);
    g.connect(bus);
  }

  /* ---------- 효과음 ---------- */
  function tone(type, f0, f1, dur, v, t0 = 0, opt = {}) {
    const c = A.ctx,
      t = c.currentTime + t0;
    const o = c.createOscillator(),
      g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    v *= seMul;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + (opt.att || 0.005));
    g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    let node = o;
    if (opt.lp) {
      const f = c.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = opt.lp;
      o.connect(f);
      node = f;
    }
    if (opt.vib) {
      const l = c.createOscillator(),
        lg = c.createGain();
      l.frequency.value = opt.vibRate || 7;
      lg.gain.value = opt.vib;
      l.connect(lg);
      lg.connect(o.frequency);
      l.start(t);
      l.stop(t + dur);
    }
    node.connect(g);
    g.connect(seBus);
    o.start(t);
    o.stop(t + dur + 0.02);
    return o;
  }
  function noise(dur, v, type, freqV, t0 = 0, sweep) {
    const c = A.ctx,
      t = c.currentTime + t0;
    const s = noiseSrc(t, dur + 0.02);
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freqV, t);
    if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(v * seMul, t);
    g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    s.connect(f);
    f.connect(g);
    g.connect(seBus);
  }
  function arp(notes, step, type, v, dur) {
    notes.forEach((n, i) => tone(type, freq(n), freq(n), dur || step * 2, v, i * step));
  }

  const SE = {
    blip: (p = 1) => tone('square', 520 * p, 520 * p, 0.035, 0.025),
    cursor: () => tone('square', 900, 900, 0.04, 0.04),
    ok: () => {
      tone('square', 660, 660, 0.05, 0.05);
      tone('square', 990, 990, 0.07, 0.05, 0.05);
    },
    cancel: () => tone('square', 440, 300, 0.09, 0.05),
    door: () => {
      noise(0.12, 0.25, 'lowpass', 700);
      tone('square', 180, 120, 0.12, 0.06, 0.02);
    },
    meow: () => tone('sawtooth', 620, 820, 0.18, 0.07, 0, { lp: 1800, vib: 25 }) && tone('sawtooth', 820, 560, 0.25, 0.07, 0.17, { lp: 1600, vib: 25 }),
    meowSmall: () => tone('triangle', 900, 1150, 0.12, 0.08, 0, { vib: 30 }) && tone('triangle', 1150, 850, 0.16, 0.08, 0.11),
    scared: () => {
      tone('sawtooth', 900, 1500, 0.12, 0.07, 0, { lp: 2500, vib: 60, vibRate: 18 });
      tone('sawtooth', 1500, 1100, 0.18, 0.06, 0.12, { lp: 2500, vib: 60, vibRate: 18 });
    },
    hiss: () => noise(0.5, 0.18, 'highpass', 3000),
    bark: () => {
      tone('square', 260, 170, 0.11, 0.09, 0, { lp: 1200 });
      tone('square', 280, 180, 0.12, 0.09, 0.2, { lp: 1200 });
    },
    whine: () => tone('triangle', 900, 600, 0.5, 0.06, 0, { vib: 20 }),
    bell: () => {
      tone('sine', 1568, 1568, 2.2, 0.12);
      tone('sine', 2349, 2349, 1.6, 0.06, 0.01);
      tone('sine', 3136, 3136, 1.0, 0.03, 0.02);
    },
    item: () => arp(['c5', 'e5', 'g5', 'c6'], 0.07, 'square', 0.05, 0.12),
    jump: () => tone('square', 300, 760, 0.16, 0.05),
    land: () => noise(0.08, 0.15, 'lowpass', 500),
    heart: () => {
      tone('sine', 75, 55, 0.13, 0.35);
      tone('sine', 70, 50, 0.16, 0.28, 0.16);
    },
    success: () => arp(['c5', 'e5', 'g5', 'c6', 'e6'], 0.06, 'triangle', 0.09, 0.25),
    miss: () => tone('square', 220, 110, 0.2, 0.05),
    push: () => noise(0.16, 0.2, 'lowpass', 380),
    whoosh: () => noise(0.5, 0.18, 'bandpass', 400, 0, 3000),
    shadow: () => {
      tone('sawtooth', 70, 55, 1.1, 0.07, 0, { lp: 400, att: 0.3 });
      tone('sawtooth', 73, 57, 1.1, 0.07, 0, { lp: 400, att: 0.3 });
    },
    roar: () => {
      tone('sawtooth', 120, 60, 0.9, 0.12, 0, { lp: 600, vib: 15 });
      noise(0.9, 0.12, 'lowpass', 800);
    },
    thud: () => tone('sine', 110, 45, 0.2, 0.3),
    save: () => arp(['g5', 'c6'], 0.09, 'triangle', 0.08, 0.3),
    sparkle: () => arp(['e6', 'g6', 'b6', 'e7'], 0.045, 'triangle', 0.04, 0.12),
    bus: () => noise(1.6, 0.18, 'lowpass', 220),
    flash: () => noise(0.6, 0.12, 'highpass', 1500, 0, 8000),
    pop: () => tone('square', 500, 900, 0.06, 0.05),
    squeak: () => tone('square', 1800, 2400, 0.06, 0.03) && tone('square', 2200, 1800, 0.06, 0.03, 0.08),
    caw: () => {
      tone('sawtooth', 900, 700, 0.1, 0.05, 0, { lp: 2000 });
      tone('sawtooth', 950, 700, 0.12, 0.05, 0.15, { lp: 2000 });
    },
    rustle: () => noise(0.35, 0.1, 'highpass', 2500),
    thunder: () => {
      noise(0.25, 0.35, 'highpass', 2000);
      noise(2.2, 0.4, 'lowpass', 300, 0.1, 60);
      tone('sawtooth', 55, 35, 1.8, 0.12, 0.15, { lp: 200, att: 0.05 });
    },
    rain: () => noise(1.5, 0.05, 'highpass', 4000),
    bump: () => tone('sine', 150, 90, 0.07, 0.07),
    splash: () => {
      noise(0.3, 0.18, 'bandpass', 1200, 0, 400);
      tone('sine', 900, 300, 0.12, 0.03);
    },
    purr: () => {
      for (let i = 0; i < 6; i++) tone('sawtooth', 40, 38, 0.12, 0.08, i * 0.16, { lp: 300 });
    },
  };

  /* ---------- 환경음 ----------
   * 맵의 ambience: 'summer' 낮 매미·새 | 'night' 귀뚜라미 | 'stream' 개울 | 'rain' 빗소리·바람
   *              'cave' 물방울·웅웅 | 'wind' 안개 바람 | 'mirror' 유리 풍경 | 'indoor' 아주 조용한 실내
   * 바닥에 깔리는 소리(bed)는 필터 건 노이즈 루프, 그 위에 가끔 나는 소리(ev)를 무작위로 얹는다. */
  function ambOut(v) {
    const g = A.ctx.createGain();
    g.gain.value = v;
    g.connect(ambBus);
    return g;
  }
  function bed(type, f, v, q = 0.7, lfoRate = 0, lfoDepth = 0) {
    const c = A.ctx;
    const src = c.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const fl = c.createBiquadFilter();
    fl.type = type;
    fl.frequency.value = f;
    fl.Q.value = q;
    const g = c.createGain();
    g.gain.value = 0;
    g.gain.setTargetAtTime(v, c.currentTime, 0.8);
    src.connect(fl);
    fl.connect(g);
    g.connect(ambTarget || ambBus);
    let lfo;
    if (lfoRate) {
      lfo = c.createOscillator();
      const lg = c.createGain();
      lfo.frequency.value = lfoRate;
      lg.gain.value = lfoDepth;
      lfo.connect(lg);
      lg.connect(g.gain);
      lfo.start();
    }
    src.start();
    return {
      stop() {
        g.gain.setTargetAtTime(0, c.currentTime, 0.5);
        setTimeout(() => {
          try { src.stop(); if (lfo) lfo.stop(); } catch (e) { /* 무시 */ }
          g.disconnect();
        }, 2500);
      },
    };
  }
  function blipAt(type, f0, f1, dur, v, t, out, att = 0.005) {
    const c = A.ctx;
    const o = c.createOscillator(),
      g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + att);
    g.gain.exponentialRampToValueAtTime(0.0003, t + dur);
    o.connect(g);
    g.connect(out);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
  const R = (a, b) => a + Math.random() * (b - a);
  const AMB = {
    summer: {
      beds: () => [bed('bandpass', 4200, 0.018, 3, 0.35, 0.012), bed('lowpass', 500, 0.012)],
      ev: [
        [0.18, (t, o) => { // 새 지저귐
          const f = R(2400, 3400), n = 2 + ((Math.random() * 3) | 0);
          for (let i = 0; i < n; i++) blipAt('sine', f * R(0.9, 1.1), f * R(1.2, 1.5), 0.07, 0.03, t + i * 0.11, o);
        }],
        [0.05, (t, o) => { // 매미 한 줄기
          // 떨림(AM)은 0~1 사이로 따로 걸고, 그 뒤에 크기(엔벨로프)를 건다
          const c = A.ctx, os = c.createOscillator(), am = c.createOscillator(), ag = c.createGain(), trem = c.createGain(), g = c.createGain();
          os.type = 'sawtooth'; os.frequency.value = R(3800, 4600); am.frequency.value = R(28, 40);
          trem.gain.value = 0.5; ag.gain.value = 0.5;
          g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.012, t + 0.8); g.gain.setValueAtTime(0.012, t + 2.6); g.gain.linearRampToValueAtTime(0.0001, t + 3.6);
          const fl = c.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = 4200; fl.Q.value = 2;
          am.connect(ag); ag.connect(trem.gain); os.connect(fl); fl.connect(trem); trem.connect(g); g.connect(o);
          os.start(t); am.start(t); os.stop(t + 3.7); am.stop(t + 3.7);
        }],
      ],
    },
    night: {
      beds: () => [bed('lowpass', 400, 0.01)],
      ev: [
        [0.9, (t, o) => { // 귀뚜라미 귀뚤귀뚤
          const f = R(4300, 4900), v = R(0.01, 0.022);
          for (let i = 0; i < 3; i++) blipAt('sine', f, f, 0.045, v, t + i * 0.06, o);
        }],
        [0.06, (t, o) => { blipAt('sine', 420, 380, 0.35, 0.02, t, o, 0.08); blipAt('sine', 420, 380, 0.35, 0.02, t + 0.45, o, 0.08); }], // 멀리 부엉
      ],
    },
    stream: {
      beds: () => [bed('bandpass', 900, 0.035, 0.8, 0.6, 0.012), bed('highpass', 3000, 0.012)],
      ev: [[1.4, (t, o) => blipAt('sine', R(500, 1200), R(1300, 2200), 0.05, 0.02, t, o)]], // 졸졸
    },
    rain: {
      beds: () => [bed('highpass', 2500, 0.05), bed('lowpass', 700, 0.04, 0.7, 0.15, 0.03)],
      ev: [[0.25, (t, o) => blipAt('sine', R(1800, 2600), R(900, 1200), 0.04, 0.03, t, o)]], // 처마 물방울
    },
    cave: {
      beds: () => [bed('lowpass', 160, 0.05, 1, 0.08, 0.02)],
      ev: [[0.35, (t, o) => { const f = R(900, 1600); blipAt('sine', f, f * 0.55, 0.12, 0.05, t, o); }]], // 똑
    },
    wind: {
      beds: () => [bed('bandpass', 500, 0.03, 1.5, 0.12, 0.025)],
      ev: [],
    },
    mirror: {
      beds: () => [bed('bandpass', 700, 0.015, 2, 0.1, 0.01)],
      ev: [[0.3, (t, o) => { const f = R(1800, 3000); blipAt('sine', f, f, 0.9, 0.012, t, o); blipAt('sine', f * 1.5, f * 1.5, 0.6, 0.006, t + 0.01, o); }]], // 유리 풍경
    },
    indoor: {
      beds: () => [bed('lowpass', 250, 0.006)],
      ev: [[0.03, (t, o) => { blipAt('square', 1200, 1200, 0.015, 0.006, t, o); blipAt('square', 1000, 1000, 0.015, 0.006, t + 0.5, o); }]], // 벽시계 똑딱
    },
  };
  let amb = null, ambTarget = null;
  const AMB_GAIN = { summer: 2.6, night: 3.5, stream: 1.4, rain: 1, cave: 2.2, wind: 2.2, mirror: 2.4, indoor: 3 };
  A.playAmb = function (name) {
    name = name || null;
    if (!A.ctx) {
      A.ambPending = name;
      return;
    }
    if (amb && amb.name === name) return;
    if (amb) {
      amb.beds.forEach((b) => b.stop());
      clearInterval(amb.timer);
      amb = null;
    }
    const def = AMB[name];
    if (!def) return;
    const out = ambOut((AMB_GAIN[name] || 1) * (mix('amb')[name] || 1));
    ambTarget = out;
    amb = { name, beds: def.beds(), timer: null };
    ambTarget = null;
    // 0.25초마다 각 소리를 확률(초당 횟수)로 굴린다
    amb.timer = setInterval(() => {
      if (document.hidden) return;
      for (const [rate, fn] of def.ev) if (Math.random() < rate * 0.25) {
        try { fn(A.ctx.currentTime + Math.random() * 0.2, out); } catch (e) { /* 무시 */ }
      }
    }, 250);
  };

  /* 발소리: 재희만 (고양이는 발소리가 없다). 바닥 종류에 따라 소리가 다르다 */
  let stepN = 0;
  A.step = function (floor) {
    if (!A.ctx) return;
    const t = A.ctx.currentTime,
      alt = stepN++ % 2 ? 1 : 1.12;
    const c = A.ctx;
    const s = noiseSrc(t, 0.08);
    const f = c.createBiquadFilter();
    const g = c.createGain();
    const P = { grass: ['highpass', 2600, 0.05, 0.05], wood: ['lowpass', 500, 0.09, 0.06], stone: ['bandpass', 1500, 0.06, 0.04], dirt: ['lowpass', 900, 0.06, 0.05], water: ['bandpass', 800, 0.08, 0.08] }[floor] || ['lowpass', 900, 0.04, 0.05];
    f.type = P[0];
    f.frequency.value = P[1] * alt;
    g.gain.setValueAtTime(P[2] * (mix('step')[floor] || 1), t);
    g.gain.exponentialRampToValueAtTime(0.0005, t + P[3]);
    s.connect(f);
    f.connect(g);
    g.connect(seBus);
    if (floor === 'wood') blipAt('sine', 140 * alt, 90, 0.05, 0.03, t, seBus);
  };

  A.se = function (name, p) {
    if (!A.ctx || !SE[name]) return;
    seMul = mix('se')[name] || 1;
    try {
      SE[name](p);
    } catch (e) {
      /* 무시 */
    }
    seMul = 1;
  };

  document.addEventListener('visibilitychange', () => {
    if (!A.ctx) return;
    if (document.hidden) A.ctx.suspend();
    else A.ctx.resume();
  });
})();
