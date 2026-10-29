const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/DWK7UWQMTC';

(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- header, burger, smooth anchors ---------- */
  const burger = $('#burger'), nav = $('#nav');
  const closeNav = () => { burger.classList.remove('is-open'); nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); };
  burger?.addEventListener('click', () => {
    const open = burger.classList.toggle('is-open');
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href.length <= 1) return;
    const target = $(href);
    if (!target) return;
    e.preventDefault();
    closeNav();
    const top = target.getBoundingClientRect().top + scrollY - 64;
    scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ---------- phone mask ---------- */
  $$('input[type="tel"]').forEach(input => input.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.startsWith('8')) v = '7' + v.slice(1);
    if (!v.startsWith('7')) v = '7' + v;
    v = v.slice(0, 11);
    let out = '+7';
    if (v.length > 1) out += ' (' + v.slice(1, 4);
    if (v.length >= 4) out += ') ' + v.slice(4, 7);
    if (v.length >= 7) out += '-' + v.slice(7, 9);
    if (v.length >= 9) out += '-' + v.slice(9, 11);
    e.target.value = out;
  }));

  /* ---------- reveal on scroll (once, staggered) ---------- */
  const revealEls = $$('[data-reveal], .why__row, .mosaic__grid .tile, .bar, .footer__mark');
  $$('.why__rows, .mosaic__grid, .est__list').forEach(group => {
    $$('[data-reveal], .why__row, .tile', group).forEach((el, i) => el.style.setProperty('--i', i % 4));
  });
  $$('.bar__seg').forEach((s, i) => s.style.setProperty('--n', i));
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealEls.forEach(el => io.observe(el));
    setTimeout(() => revealEls.forEach(el => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && !el.classList.contains('is-in')) el.classList.add('is-in'); }), 2500);
  } else revealEls.forEach(el => el.classList.add('is-in'));

  /* ---------- lines that rise on scroll ---------- */
  const lineEls = $$('[data-lines]');
  if (lineEls.length && 'IntersectionObserver' in window && !reduce) {
    const restore = el => { el.textContent = el.dataset.text; el.classList.remove('is-split', 'is-in'); };
    const split = el => {
      const text = el.textContent.trim().replace(/\s+/g, ' ');
      el.dataset.text = text;
      el.textContent = '';
      const words = text.split(' ').map(word => {
        const s = document.createElement('span');
        s.style.display = 'inline-block';
        s.textContent = word;
        el.append(s, ' ');
        return s;
      });
      const lines = [];
      for (const w of words) {
        const last = lines.at(-1);
        if (last && Math.abs(last.top - w.offsetTop) < 4) last.words.push(w.textContent);
        else lines.push({ top: w.offsetTop, words: [w.textContent] });
      }
      el.textContent = '';
      lines.forEach((line, i) => {
        const mask = document.createElement('span');
        const inner = document.createElement('span');
        mask.className = 'line';
        inner.style.setProperty('--i', i);
        inner.textContent = line.words.join(' ');
        mask.append(inner);
        el.append(mask, ' ');
      });
      el.classList.add('is-split');
    };
    const lio = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        lio.unobserve(e.target);
        e.target.classList.add('is-in');
        const last = e.target.querySelector('.line:last-of-type > span');
        last?.addEventListener('transitionend', () => restore(e.target), { once: true });
      }
    }, { rootMargin: '0px 0px -12% 0px' });
    document.fonts.ready.then(() => lineEls.forEach(el => { split(el); lio.observe(el); }));
  }

  /* ---------- ink fill ---------- */
  if (CSS.supports('animation-timeline: view()') && !reduce) {
    $$('[data-fill]').forEach(el => {
      const words = el.textContent.trim().split(/\s+/);
      el.textContent = '';
      words.forEach((word, i) => {
        const s = document.createElement('span');
        s.textContent = word;
        el.append(s, i < words.length - 1 ? ' ' : '');
      });
      el.classList.add('is-filling');
    });
  }

  /* ---------- count-up figures ---------- */
  const rolls = $$('[data-roll]');
  const countUp = el => {
    const final = el.textContent.trim();
    const num = parseFloat(final.replace(',', '.'));
    const dec = final.includes(',') ? final.split(',')[1].length : 0;
    if (reduce || Number.isNaN(num)) return;
    const start = performance.now(), dur = 1300;
    const tick = t => {
      const p = Math.min(1, (t - start) / dur), k = 1 - Math.pow(1 - p, 4);
      el.textContent = (num * k).toFixed(dec).replace('.', ',');
      if (p < 1) requestAnimationFrame(tick); else el.textContent = final;
    };
    el.textContent = (0).toFixed(dec).replace('.', ',');
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const rio = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { countUp(e.target); rio.unobserve(e.target); }
    }, { rootMargin: '0px 0px -15% 0px' });
    rolls.forEach(el => rio.observe(el));
  }

  /* ---------- estimator ---------- */
  const rows = $$('.row');
  const outMin = $('#totalMin'), outMax = $('#totalMax'), note = $('#sumNote'), send = $('#sendEstimate'), totalEl = $('.est__total');
  const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  let shown = { min: 0, max: 0 }, raf;
  const tween = (to) => {
    cancelAnimationFrame(raf);
    const from = { ...shown }, start = performance.now(), dur = reduce ? 1 : 450;
    const tick = t => {
      const p = Math.min(1, (t - start) / dur), k = 1 - Math.pow(1 - p, 3);
      shown = { min: from.min + (to.min - from.min) * k, max: from.max + (to.max - from.max) * k };
      outMin.textContent = fmt(shown.min);
      outMax.textContent = fmt(shown.max);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  };
  const selection = () => rows.filter(r => r.classList.contains('is-on')).map(r => ({
    name: r.dataset.name, qty: +$('.qty__val', r).textContent, min: +r.dataset.min, max: +r.dataset.max
  }));
  const recalc = () => {
    const sel = selection();
    const to = sel.reduce((a, s) => ({ min: a.min + s.min * s.qty, max: a.max + s.max * s.qty }), { min: 0, max: 0 });
    tween(to);
    totalEl.classList.remove('bump'); void totalEl.offsetWidth; totalEl.classList.add('bump');
    send.disabled = !sel.length;
    note.textContent = sel.length
      ? `Выбрано работ: ${sel.length}. Материалы и сантехнику в сумму не включаем: точную цену мастер называет на осмотре, до начала работ.`
      : 'Выбрано: ничего. Материалы и саму сантехнику в сумму не включаем: мастер называет точную цену на осмотре, до начала работ.';
  };
  rows.forEach(row => {
    const check = $('.row__check', row), val = $('.qty__val', row);
    check.addEventListener('change', () => { row.classList.toggle('is-on', check.checked); if (!check.checked) val.textContent = '1'; recalc(); });
    $$('.qty__btn', row).forEach(b => b.addEventListener('click', () => {
      val.textContent = Math.max(1, Math.min(99, +val.textContent + +b.dataset.d));
      recalc();
    }));
  });

  const estimateText = () => {
    const sel = selection();
    if (!sel.length) return '';
    const tot = sel.reduce((a, s) => ({ min: a.min + s.min * s.qty, max: a.max + s.max * s.qty }), { min: 0, max: 0 });
    return 'Смета с сайта:\n' + sel.map(s => `- ${s.name} × ${s.qty}: ${fmt(s.min * s.qty)}–${fmt(s.max * s.qty)} ₽`).join('\n') +
      `\nИтого ориентир: ${fmt(tot.min)}–${fmt(tot.max)} ₽`;
  };
  send.addEventListener('click', () => {
    const ta = $('#leadForm textarea[name="comment"]');
    const base = ta.value.replace(/\n*Смета с сайта:[\s\S]*$/, '').trim();
    ta.value = (base ? base + '\n\n' : '') + estimateText();
    $('#contact').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => $('#leadForm input[name="name"]').focus({ preventScroll: true }), 600);
  });

  /* ---------- lead form -> Cloudflare Worker -> Telegram ---------- */
  const form = $('#leadForm'), status = $('#formStatus');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    const fd = new FormData(form);
    const payload = {};
    fd.forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;
    if (!payload.name || !payload.phone || payload.phone.replace(/\D/g, '').length < 11) { status.textContent = 'Укажите имя и телефон полностью'; return; }
    if (!payload.agree) { status.textContent = 'Нужно согласие на обработку данных'; return; }
    delete payload.agree;
    if (payload.comment && !payload.comment.includes('Смета с сайта')) { const t = estimateText(); if (t) payload.comment += '\n\n' + t; }
    else if (!payload.comment) payload.comment = estimateText();
    btn.disabled = true; btn.textContent = 'Отправляем...'; status.textContent = '';
    try {
      const resp = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      btn.textContent = 'Заявка отправлена';
      status.textContent = 'Спасибо! Мастер перезвонит за 5–10 минут.';
      form.reset();
    } catch (err) {
      console.error(err);
      btn.textContent = 'Не отправилось';
      status.textContent = 'Не получилось отправить. Позвоните: +7 999 548-57-02';
    } finally {
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3500);
    }
  });
})();
