'use strict';
/*
 * audio.js — WebAudio 칩튠 신디사이저
 * 음악은 data/music.js 의 트래커 형식(8분음표 단위 토큰)으로 정의된다.
 *   'c5' 음표, '-' 앞 음 늘이기, '.' 쉼표, 드럼 채널은 'k'(킥) 'x'(스네어) 'h'(하이햇)
 */
(function () {
  const A = (G.audio = { ctx: null, bgmVol: 0.6, seVol: 0.7, cur: null, curName: null, pending: null });
  let master, bgmBus, seBus, noiseBuf;
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
    master.gain.value = 0.9;
    master.connect(A.ctx.destination);
    bgmBus = A.ctx.createGain();
    bgmBus.gain.value = A.bgmVol;
    bgmBus.connect(master);
    seBus = A.ctx.createGain();
    seBus.gain.value = A.seVol;
    seBus.connect(master);
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
    g.gain.linearRampToValueAtTime(def.vol || 1, t0 + Math.max(0.05, fade / 1000));
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
    g.gain.setValueAtTime(v, t);
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
    purr: () => {
      for (let i = 0; i < 6; i++) tone('sawtooth', 40, 38, 0.12, 0.08, i * 0.16, { lp: 300 });
    },
  };

  A.se = function (name, p) {
    if (!A.ctx || !SE[name]) return;
    try {
      SE[name](p);
    } catch (e) {
      /* 무시 */
    }
  };

  document.addEventListener('visibilitychange', () => {
    if (!A.ctx) return;
    if (document.hidden) A.ctx.suspend();
    else A.ctx.resume();
  });
})();
