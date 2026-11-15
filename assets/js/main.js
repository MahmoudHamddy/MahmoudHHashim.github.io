/* ==========================================================
   Portfolio — tab navigation and interactions
   ========================================================== */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const restart = (el, cls) => { el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls); };

/* ---------- 1. Split headlines into words (keeps <em> highlights) ---------- */
$$('.split').forEach((h) => {
  const label = h.textContent.trim().replace(/\s+/g, ' ');
  let i = 0;
  const out = [];
  h.childNodes.forEach((node) => {
    const isEm = node.nodeType === 1;
    node.textContent.split(/\s+/).filter(Boolean).forEach((w) => {
      const inner = isEm ? `<em>${w}</em>` : w;
      out.push(`<span class="w" aria-hidden="true"><span style="--i:${i++}">${inner}</span></span>`);
    });
  });
  h.setAttribute('aria-label', label);
  h.innerHTML = out.join(' ');
});

/* ---------- 2. Sliding indicator under any tab group ---------- */
const placeIndicator = (group) => {
  const ind = $('.ind', group);
  const active = $('.active', group);
  if (!ind || !active || !active.offsetWidth) return;
  ind.style.width = `${active.offsetWidth}px`;
  ind.style.transform = `translateX(${active.offsetLeft}px)`;
};
const placeAllIndicators = () => $$('.tabbar-track, .subtabs, .filterbar').forEach(placeIndicator);
window.addEventListener('resize', placeAllIndicators);
if (document.fonts) document.fonts.ready.then(placeAllIndicators);

/* ---------- 3. Reveal blocks as they come into view ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  let n = 0;
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.style.setProperty('--d', `${Math.min(n++, 8) * 70}ms`);
    e.target.classList.add('in');
    revealObserver.unobserve(e.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

const runReveals = (panel) => {
  $$('.rv', panel).forEach((el) => { el.classList.remove('in'); revealObserver.observe(el); });
};

/* ---------- 4. Count-up numbers on Home ---------- */
const countUp = (panel) => {
  $$('[data-count]', panel).forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const t0 = performance.now() + 350;
    const dur = 1500;
    const tick = (now) => {
      const p = Math.max(0, Math.min((now - t0) / dur, 1));
      el.textContent = (target * (1 - Math.pow(1 - p, 4))).toFixed(dec);
      if (p < 1) requestAnimationFrame(tick);
    };
    el.textContent = (0).toFixed(dec);
    requestAnimationFrame(tick);
  });
};

/* ---------- 5. Tab router ---------- */
const panels = new Map($$('[data-panel]').map((p) => [p.dataset.panel, p]));
const navTabs = $$('.tabbar a[data-go]');
const tabbar = $('.tabbar');
const switchBar = $('.switch-bar');
let current = null;
let busy = false;

const enterPanel = (panel) => {
  panel.classList.add('is-active');
  placeAllIndicators();
  $$('.split', panel).forEach((h) => restart(h, 'play'));
  runReveals(panel);
  const portrait = $('.portrait', panel);
  if (portrait) restart(portrait, 'play');
  if (panel.dataset.panel === 'home') countUp(panel);
  const fig = $('.subpanel.active .fig', panel);
  if (fig) restart(fig, 'play');
};

const show = (id, push = true) => {
  if (!panels.has(id)) id = 'home';
  if (id === current) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  if (busy) return;
  const next = panels.get(id);
  const prev = current ? panels.get(current) : null;
  current = id;

  navTabs.forEach((a) => {
    const on = a.dataset.go === id;
    a.classList.toggle('active', on);
    a.setAttribute('aria-selected', String(on));
    if (on && tabbar.scrollWidth > tabbar.clientWidth) tabbar.scrollTo({ left: a.offsetLeft - 24, behavior: 'smooth' });
  });
  placeIndicator($('.tabbar-track'));
  document.title = next.dataset.title || document.title;
  if (push) history.pushState({ tab: id }, '', `#${id}`);

  if (!prev) { enterPanel(next); return; }

  busy = true;
  restart(switchBar, 'run');
  prev.classList.add('is-leaving');
  setTimeout(() => {
    prev.classList.remove('is-active', 'is-leaving');
    window.scrollTo(0, 0);
    enterPanel(next);
    const h1 = $('h1', next);
    if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
    busy = false;
  }, 280);
};

document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-go]');
  if (!link) return;
  e.preventDefault();
  show(link.dataset.go);
});

// left / right arrow keys move between the main tabs
$('.tabbar-track').addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  const i = navTabs.findIndex((a) => a.dataset.go === current);
  const n = navTabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + navTabs.length) % navTabs.length];
  n.focus();
  show(n.dataset.go);
});

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('popstate', () => show(location.hash.slice(1) || 'home', false));
show(location.hash.slice(1) || 'home', false);
window.scrollTo(0, 0);
window.addEventListener('load', () => { window.scrollTo(0, 0); placeAllIndicators(); });

/* ---------- 6. Research sub-tabs ---------- */
const subtabs = $('.subtabs');
if (subtabs) {
  $$('button', subtabs).forEach((btn) => btn.addEventListener('click', () => {
    if (btn.classList.contains('active')) return;
    $$('button', subtabs).forEach((b) => { b.classList.toggle('active', b === btn); b.setAttribute('aria-selected', String(b === btn)); });
    placeIndicator(subtabs);
    $$('.subpanel').forEach((p) => {
      const on = p.dataset.subpanel === btn.dataset.sub;
      p.classList.toggle('active', on);
      if (on) { restart(p, 'entering'); const fig = $('.fig', p); if (fig) restart(fig, 'play'); }
    });
  }));
}

/* ---------- 7. Screening steps: highlight one after another ---------- */
const steps = $('.steps');
if (steps) {
  const items = $$('.step', steps);
  const STEP_TIME = 2800;
  let i = 0;
  steps.style.setProperty('--step-time', `${STEP_TIME}ms`);
  const setStep = (k) => {
    i = k;
    items.forEach((s, j) => {
      s.classList.toggle('active', j === k);
      if (j === k) { const bar = $('.bar', s); bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
    });
  };
  setInterval(() => {
    const visible = steps.offsetParent !== null;
    if (visible && !steps.classList.contains('paused')) setStep((i + 1) % items.length);
  }, STEP_TIME);
  items.forEach((s, k) => {
    s.addEventListener('mouseenter', () => { steps.classList.add('paused'); setStep(k); });
    s.addEventListener('click', () => setStep(k));
  });
  steps.addEventListener('mouseleave', () => { steps.classList.remove('paused'); setStep(i); });
}

/* ---------- 8. Filters (publications and projects) ---------- */
$$('.filterbar').forEach((bar) => {
  const group = bar.dataset.filterGroup;
  const rows = group === 'pubs' ? $$('.pub') : $$('.proj');
  $$('button', bar).forEach((btn) => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    $$('button', bar).forEach((b) => b.classList.toggle('active', b === btn));
    placeIndicator(bar);
    if (bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: btn.offsetLeft - 16, behavior: 'smooth' });
    let n = 0;
    rows.forEach((row) => {
      const keys = (row.dataset.cat || row.dataset.type || '').split(' ');
      const on = f === 'all' || keys.includes(f);
      row.classList.toggle('hidden', !on);
      row.classList.remove('show');
      if (on) {
        row.classList.add('in');
        row.style.setProperty('--d', `${n++ * 55}ms`);
        void row.offsetWidth;
        row.classList.add('show');
      }
    });
  }));
});

/* ---------- 9. Publication accordion ---------- */
$$('.pub-head').forEach((head) => head.addEventListener('click', () => {
  head.setAttribute('aria-expanded', String(head.getAttribute('aria-expanded') !== 'true'));
}));

/* ---------- 10. CV viewer (phones open the PDF directly) ---------- */
const cvModal = $('#cvModal');
const cvFrame = cvModal ? $('iframe', cvModal) : null;
$$('[data-open-cv]').forEach((btn) => btn.addEventListener('click', () => {
  if (!cvModal || window.innerWidth < 700 || typeof cvModal.showModal !== 'function') {
    window.open('assets/docs/Mahmoud_Hamdy_Hashim_CV.pdf', '_blank', 'noopener');
    return;
  }
  if (!cvFrame.src) cvFrame.src = cvFrame.dataset.src;
  cvModal.showModal();
}));
$$('[data-close-cv]').forEach((btn) => btn.addEventListener('click', () => cvModal.close()));
if (cvModal) cvModal.addEventListener('click', (e) => { if (e.target === cvModal) cvModal.close(); });

/* ---------- 11. Copy email + toast ---------- */
const toast = $('#toast');
const showToast = (msg) => { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1800); };
$$('[data-copy]').forEach((btn) => btn.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(btn.dataset.copy); showToast('Email copied'); }
  catch { showToast(btn.dataset.copy); }
}));

/* ---------- 12. Edmonton local time ---------- */
const fmt = new Intl.DateTimeFormat('en-CA', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Edmonton', timeZoneName: 'short' });
const updateTime = () => { const t = fmt.format(new Date()); $$('#localTime, #localTimeHome').forEach((el) => { el.textContent = t; }); };
updateTime();
setInterval(updateTime, 30000);

/* ---------- 13. Light / dark theme ---------- */
const root = document.documentElement;
const themeBtn = $('.theme-btn');
const metaTheme = $('meta[name="theme-color"]');
const syncThemeUI = () => {
  const light = root.dataset.theme === 'light';
  themeBtn.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
  metaTheme.setAttribute('content', light ? '#f3f7fd' : '#0b1730');
};
syncThemeUI();
themeBtn.addEventListener('click', (e) => {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  const apply = () => {
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (err) { /* storage blocked */ }
    syncThemeUI();
  };
  if (!document.startViewTransition) {
    root.classList.add('theme-anim');
    apply();
    setTimeout(() => root.classList.remove('theme-anim'), 600);
    return;
  }
  // circular reveal that grows from the button
  const r = themeBtn.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const t = document.startViewTransition(apply);
  t.ready.then(() => {
    root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 700, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' });
  });
});

/* ---------- 14. Background lines follow the mouse a little ---------- */
const topo = $('.topo');
if (topo && matchMedia('(pointer: fine)').matches) {
  let raf = null;
  window.addEventListener('pointermove', (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      topo.style.setProperty('--px', `${(e.clientX / innerWidth - 0.5) * -28}px`);
      topo.style.setProperty('--py', `${(e.clientY / innerHeight - 0.5) * -20}px`);
      raf = null;
    });
  });
}

/* ---------- 15. Event photos: show only photos that exist ---------- */
const gallery = $('.gallery');
// arrange photos depending on how many an event has (1 to 6)
const layoutPhotos = (group) => {
  const box = $('.photos', group);
  const ph = $$('.photo.loaded', group);
  const n = ph.length;
  const small = innerWidth < 720;
  ph.forEach((p) => { p.style.gridRow = ''; p.style.gridColumn = ''; });
  let cols, row;
  if (small) {
    cols = n === 1 ? '1fr' : '1fr 1fr'; row = n === 1 ? '240px' : '150px';
    if (n > 1 && n % 2 === 1) ph[0].style.gridColumn = 'span 2';
  } else if (n === 1) { cols = 'minmax(0, 760px)'; row = '420px'; }
  else if (n === 2) { cols = '1fr 1fr'; row = '320px'; }
  else if (n === 6) { cols = 'repeat(3, 1fr)'; row = '230px'; }
  else {
    cols = n === 3 ? '2fr 1fr' : '2fr 1fr 1fr'; row = '200px';
    ph[0].style.gridRow = 'span 2';
    if (n === 4) ph[3].style.gridColumn = 'span 2';
  }
  box.style.gridTemplateColumns = cols;
  box.style.gridAutoRows = row;
};
window.addEventListener('resize', () => $$('.event-photos.has-photos').forEach(layoutPhotos));

if (gallery) {
  $$('.photo', gallery).forEach((btn) => {
    const img = $('img', btn);
    const ok = () => {
      const group = btn.closest('.event-photos');
      btn.style.setProperty('--d', `${$$('.photo.loaded', group).length * 70}ms`);
      btn.classList.add('loaded');
      group.classList.add('has-photos');
      layoutPhotos(group);
      gallery.classList.add('has-photos');
    };
    const bad = () => btn.classList.add('missing');
    if (img.complete) { img.naturalWidth ? ok() : bad(); }
    else { img.addEventListener('load', ok, { once: true }); img.addEventListener('error', bad, { once: true }); }
  });

  // photo viewer
  const lb = $('#lightbox');
  const lbImg = $('img', lb);
  const lbCap = $('figcaption', lb);
  let list = [], pos = 0;
  const showPhoto = (k) => {
    pos = (k + list.length) % list.length;
    const img = $('img', list[pos]);
    lbImg.src = img.src; lbImg.alt = img.alt;
    lbCap.textContent = `${img.alt}  ·  ${pos + 1} / ${list.length}`;
    restart(lbImg, 'swap');
  };
  gallery.addEventListener('click', (e) => {
    const btn = e.target.closest('.photo');
    if (!btn) return;
    list = $$('.photo.loaded', btn.closest('.event-photos'));
    showPhoto(list.indexOf(btn));
    lb.showModal();
  });
  $('.lb-prev', lb).addEventListener('click', () => showPhoto(pos - 1));
  $('.lb-next', lb).addEventListener('click', () => showPhoto(pos + 1));
  $('.lb-close', lb).addEventListener('click', () => lb.close());
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') showPhoto(pos + 1);
    if (e.key === 'ArrowLeft') showPhoto(pos - 1);
  });
}
