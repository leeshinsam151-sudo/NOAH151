'use strict';
/*
 * dialog.js — 대화창(타자 효과, 이름표, 초상화), 선택지, 자막, 배너, 알림
 * 대사 안 표기:  {속마음}  → 회색 작은 글씨,  [강조] → 노란 글씨,  \n 줄바꿈
 */
(function () {
  const I = G.input;
  const D = (G.dialog = { open: false, settings: { speed: 1 } });
  let box, nameEl, textEl, face, nextEl, choiceEl, captionEl, bannerEl, toastEl;

  D.init = function () {
    box = G.$('#msg');
    nameEl = G.$('#msg-name');
    textEl = G.$('#msg-text');
    face = G.$('#msg-face');
    nextEl = G.$('#msg-next');
    choiceEl = G.$('#choice');
    captionEl = G.$('#caption');
    bannerEl = G.$('#banner');
    toastEl = G.$('#toast');
    box.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      I.tap('ok');
    });
    captionEl.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      I.tap('ok');
    });
  };

  function parse(text) {
    const out = [];
    let cls = '';
    for (const ch of text) {
      if (ch === '{') cls = 'sub';
      else if (ch === '}') cls = '';
      else if (ch === '[') cls = 'hl';
      else if (ch === ']') cls = '';
      else out.push({ ch, cls });
    }
    return out;
  }
  const esc = (c) => (c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c === '\n' ? '<br>' : c);
  function html(chars, n) {
    let s = '',
      cur = '';
      for (let i = 0; i < n; i++) {
      const c = chars[i];
      if (c.cls !== cur) {
        if (cur) s += '</span>';
        if (c.cls) s += `<span class="${c.cls}">`;
        cur = c.cls;
      }
      s += esc(c.ch);
    }
    if (cur) s += '</span>';
    return s;
  }

  D.hide = function () {
    if (!D.open) return;
    D.open = false;
    box.classList.remove('show');
  };

  /** 대사 출력. name 이 없으면 내레이션 */
  D.say = async function (name, text, opt = {}) {
    const ch = (name && GameData.characters[name]) || {};
    const display = ch.display || name;
    box.classList.add('show');
    box.classList.toggle('narr', !name);
    D.open = true;
    nameEl.textContent = display || '';
    nameEl.style.display = display ? '' : 'none';
    nameEl.style.color = ch.color || '#fff';
    const faceKey = opt.face || ch.face || ch.sprite;
    if (faceKey && ch.portrait !== false) {
      box.classList.add('has-face');
      G.sprites.drawPortrait(face, faceKey);
    } else box.classList.remove('has-face');
    const chars = parse(String(text));
    nextEl.style.visibility = 'hidden';
    let n = 0,
      acc = 0,
      pause = 0,
      blipN = 0;
    const speed = [0.45, 0.8, 1.6, 99][D.settings.speed] || 0.8;
    textEl.innerHTML = '';
    // 타자 효과
    while (n < chars.length) {
      await G.nextFrame();
      if (I.any('ok', 'cancel')) {
        n = chars.length;
        break;
      }
      const k = Math.min(3, (G.dt || 1 / 60) * 60) * (G.debug.speed || 1);
      if (pause > 0) {
        pause -= k;
        continue;
      }
      acc += speed * k;
      let changed = false;
      while (acc >= 1 && n < chars.length) {
        acc -= 1;
        const c = chars[n++].ch;
        changed = true;
        if (c !== ' ' && c !== '\n' && blipN++ % 2 === 0 && !opt.silent) G.audio.se('blip', ch.voice || 1);
        if ('.!?…'.includes(c) && n < chars.length && !'.!?…'.includes(chars[n].ch)) {
          pause = c === '…' ? 10 : 7;
          break;
        }
        if (c === ',') {
          pause = 3;
          break;
        }
      }
      if (changed) textEl.innerHTML = html(chars, n);
    }
    textEl.innerHTML = html(chars, chars.length);
    if (opt.noWait) return;
    nextEl.style.visibility = 'visible';
    // 넘기기 대기
    for (;;) {
      await G.nextFrame();
      if (I.any('ok', 'cancel')) break;
      if (opt.auto && (opt._t = (opt._t || 0) + 1) > opt.auto) break;
    }
    nextEl.style.visibility = 'hidden';
  };

  /** 선택지. 고른 번호를 돌려준다 */
  D.choice = async function (options, opt = {}) {
    let sel = 0;
    choiceEl.innerHTML = '';
    const items = options.map((label, i) => {
      const el = document.createElement('div');
      el.className = 'opt';
      el.textContent = label;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        sel = i;
        render();
        D._picked = i;
      });
      choiceEl.appendChild(el);
      return el;
    });
    const render = () => items.forEach((el, i) => el.classList.toggle('sel', i === sel));
    render();
    choiceEl.classList.add('show');
    D._picked = -1;
    for (;;) {
      await G.nextFrame();
      if (D._picked >= 0) {
        sel = D._picked;
        break;
      }
      if (I.hit('up')) {
        sel = (sel + options.length - 1) % options.length;
        G.audio.se('cursor');
        render();
      }
      if (I.hit('down')) {
        sel = (sel + 1) % options.length;
        G.audio.se('cursor');
        render();
      }
      if (I.hit('ok')) break;
      if (I.hit('cancel') && opt.cancel !== undefined) {
        sel = opt.cancel;
        break;
      }
    }
    G.audio.se('ok');
    choiceEl.classList.remove('show');
    return sel;
  };

  /** 검은 화면 위 가운데 자막 */
  D.caption = async function (lines, opt = {}) {
    captionEl.innerHTML = '';
    captionEl.className = 'layer show' + (opt.cls ? ' ' + opt.cls : '');
    for (const line of [].concat(lines)) {
      const p = document.createElement('p');
      p.innerHTML = html(parse(line), parse(line).length);
      captionEl.appendChild(p);
      await G.nextFrame();
      p.classList.add('in');
      const t0 = G.time;
      for (;;) {
        await G.nextFrame();
        if (G.time - t0 > (opt.hold || 2600)) break;
        if (G.time - t0 > 400 && I.any('ok', 'cancel')) break;
      }
    }
    if (opt.keep) return;
    await D.clearCaption(opt.fade || 900);
  };
  D.clearCaption = async function (ms = 900) {
    captionEl.querySelectorAll('p').forEach((p) => p.classList.remove('in'));
    await G.wait(ms);
    captionEl.className = 'layer';
    captionEl.innerHTML = '';
  };

  /** 장 제목 카드 */
  D.chapterCard = async function (label, title, opt = {}) {
    captionEl.innerHTML = `<div class="card"><div class="card-label">${label}</div><div class="card-title">${title}</div></div>`;
    captionEl.className = 'layer show';
    await G.nextFrame();
    captionEl.querySelector('.card').classList.add('in');
    G.audio.se('bell');
    const t0 = G.time;
    for (;;) {
      await G.nextFrame();
      if (G.time - t0 > (opt.hold || 3800)) break;
      if (G.time - t0 > 800 && I.any('ok')) break;
    }
    captionEl.querySelector('.card').classList.remove('in');
    await G.wait(900);
    captionEl.className = 'layer';
    captionEl.innerHTML = '';
  };

  let bannerTimer = 0;
  D.banner = function (text) {
    bannerEl.textContent = text;
    bannerEl.classList.add('show');
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => bannerEl.classList.remove('show'), 2600);
  };

  const toastQ = [];
  let toastBusy = false;
  D.toast = function (text, cls = '') {
    toastQ.push([text, cls]);
    if (!toastBusy) nextToast();
  };
  function nextToast() {
    const t = toastQ.shift();
    if (!t) {
      toastBusy = false;
      return;
    }
    toastBusy = true;
    toastEl.innerHTML = html(parse(t[0]), parse(t[0]).length);
    toastEl.className = 'show ' + t[1];
    setTimeout(() => {
      toastEl.className = '';
      setTimeout(nextToast, 350);
    }, 2800);
  }
})();
