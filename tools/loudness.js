/*
 * 음량 측정 (개발용): 모든 곡·효과음·발소리·환경음의 평균 크기(RMS)와 피크를 dB 로 출력
 *   node tools/loudness.js
 * 조정은 data/music.js 맨 아래 GameData.config.mix 표에서 한다.
 */
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const p = await b.newPage();
 await p.goto('file://' + require('path').resolve(__dirname, '../index.html')); await p.waitForTimeout(400);
 await p.evaluate(() => {
   const orig = AudioNode.prototype.connect;
   AudioNode.prototype.connect = function (dst, ...r) {
     if (dst instanceof AudioDestinationNode && !window.__an) { const an = this.context.createAnalyser(); an.fftSize = 2048; window.__an = an; orig.call(this, an); }
     return orig.call(this, dst, ...r);
   };
   G.audio.unlock();
   // 짧게 측정: 매 20ms 블록 RMS 중 '소리 나는 구간' 평균(-60dB 이상)과 최대 피크
   window.meas = (ms) => new Promise((res) => { const buf = new Float32Array(2048); let peak = 0, sum = 0, n = 0, blocks = []; const t = setInterval(() => { __an.getFloatTimeDomainData(buf); let s = 0; for (const v of buf) { s += v * v; peak = Math.max(peak, Math.abs(v)); } blocks.push(Math.sqrt(s / buf.length)); }, 20); setTimeout(() => { clearInterval(t); const act = blocks.filter((x) => x > 0.001); const rms = act.length ? Math.sqrt(act.reduce((a, x) => a + x * x, 0) / act.length) : 0; res([rms, peak]); }, ms); });
 });
 const db = (x) => (x > 0 ? (20 * Math.log10(x)).toFixed(1) : '-inf').padStart(6);
 const rows = [];
 const music = await p.evaluate(() => Object.keys(GameData.music));
 for (const m of music) { await p.evaluate((m) => G.audio.playBgm(m, 0), m); await p.waitForTimeout(200); const [r, pk] = await p.evaluate(() => meas(6000)); rows.push(['음악', m, r, pk]); await p.evaluate(() => G.audio.stopBgm(0)); await p.waitForTimeout(300); }
 const ses = ['blip', 'cursor', 'ok', 'cancel', 'door', 'meow', 'meowSmall', 'scared', 'hiss', 'bark', 'whine', 'bell', 'item', 'jump', 'land', 'heart', 'success', 'miss', 'push', 'whoosh', 'shadow', 'roar', 'thud', 'save', 'sparkle', 'bus', 'flash', 'pop', 'squeak', 'caw', 'rustle', 'thunder', 'rain', 'purr', 'bump', 'splash'];
 for (const s of ses) { const m = p.evaluate(() => meas(1500)); await p.evaluate((s) => G.audio.se(s), s); const [r, pk] = await m; rows.push(['효과음', s, r, pk]); await p.waitForTimeout(700); }
 for (const f of ['grass', 'wood', 'stone', 'dirt', 'water']) { const m = p.evaluate(() => meas(1200)); await p.evaluate((f) => { let i = 0; const t = setInterval(() => { G.audio.step(f); if (++i > 5) clearInterval(t); }, 200); }, f); const [r, pk] = await m; rows.push(['발소리', f, r, pk]); await p.waitForTimeout(300); }
 for (const a of ['summer', 'night', 'stream', 'rain', 'cave', 'wind', 'mirror', 'indoor']) { await p.evaluate((a) => G.audio.playAmb(a), a); await p.waitForTimeout(1500); const [r, pk] = await p.evaluate(() => meas(5000)); rows.push(['환경음', a, r, pk]); }
 await p.evaluate(() => G.audio.playAmb(null));
 for (const r of rows) console.log(r[0], r[1].padEnd(10), 'RMS', db(r[2]), 'dB  피크', db(r[3]), 'dB');
 await b.close(); })();
