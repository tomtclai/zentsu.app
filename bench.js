/* ───────────────────────────────────────────────────────────
       Tool registry — single source of truth.
       Adding a tool in the DOM is enough; this script rebuilds
       numbers, counts, chip labels, and filter pills from it.
       ─────────────────────────────────────────────────────────── */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// When the App Store launches, swap this for the ASC URL.
const NAV_CTA_HREF = '#tools';
const NAV_CTA_LABEL_SHORT = 'Tools';
const NAV_CTA_LABEL_LONG = 'See all tools';

/* ── Collect tools from the DOM (only place they're authored) ── */
function collectTools() {
  const out = [];
  document.querySelectorAll('.tool-cat').forEach((cat) => {
    const category = cat.getAttribute('data-cat');
    cat.querySelectorAll('li[data-tool]').forEach((li) => {
      out.push({
        name: li.getAttribute('data-tool'),
        category,
        popular: li.hasAttribute('data-popular'),
        el: li,
      });
    });
  });
  return out;
}

const TOOLS = collectTools();
const TOTAL = TOOLS.length;

/* ── Tool numbering + counts + tool-count words ── */
(function numberAndCount() {
  TOOLS.forEach((t, i) => {
    const n = String(i + 1).padStart(2, '0');
    const nEl = t.el.querySelector('.n');
    if (nEl) nEl.textContent = n;
    if (t.popular) {
      const pop = document.createElement('span');
      pop.className = 'pop';
      pop.textContent = 'Popular';
      t.el.appendChild(pop);
    }
  });
  document.querySelectorAll('.tool-cat').forEach((cat) => {
    const n = cat.querySelectorAll('li[data-tool]').length;
    const countEl = cat.querySelector('[data-count]');
    if (countEl) countEl.textContent = String(n).padStart(2, '0');
  });
  const specCount = document.getElementById('spec-tool-count');
  if (specCount) specCount.textContent = String(TOTAL).padStart(2, '0');

  const words = [
    'Zero',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
    'Twenty',
    'Twenty‑one',
    'Twenty‑two',
    'Twenty‑three',
    'Twenty‑four',
    'Twenty‑five',
  ];
  const label = document.getElementById('tool-count-label');
  if (label) label.textContent = words[TOTAL] || String(TOTAL);
})();

/* ── Filter pills ── */
(function buildFilters() {
  const host = document.getElementById('tool-filters');
  if (!host) return;
  const byCat = {};
  TOOLS.forEach((t) => {
    byCat[t.category] = (byCat[t.category] || 0) + 1;
  });
  const order = ['Encoding', 'Formatting', 'Generators', 'Crypto', 'Converters', 'Media'];
  const frag = document.createDocumentFragment();

  const mkPill = (label, count, value, active) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tool-filter' + (active ? ' active' : '');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', active ? 'true' : 'false');
    b.dataset.filter = value;
    b.innerHTML = label + '<span class="fcount">' + String(count).padStart(2, '0') + '</span>';
    return b;
  };

  frag.appendChild(mkPill('All', TOTAL, 'all', true));
  order.forEach((c) => {
    if (byCat[c]) frag.appendChild(mkPill(c, byCat[c], c, false));
  });
  host.appendChild(frag);

  host.addEventListener('click', (e) => {
    const btn = e.target.closest('.tool-filter');
    if (!btn) return;
    host.querySelectorAll('.tool-filter').forEach((el) => {
      el.classList.remove('active');
      el.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.tool-cat').forEach((cat) => {
      if (filter === 'all' || cat.getAttribute('data-cat') === filter) {
        cat.classList.remove('dim');
      } else {
        cat.classList.add('dim');
      }
    });
  });
})();

/* ── Scroll reveal ── */
(function revealOnScroll() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    items.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  );
  items.forEach((el) => io.observe(el));
})();

/* ── Sticky mini-CTA in nav ── */
(function navMiniCta() {
  const nav = document.querySelector('nav ul');
  if (!nav) return;
  const li = document.createElement('li');
  li.style.marginLeft = 'auto';
  const a = document.createElement('a');
  a.className = 'nav-mini-cta';
  a.href = NAV_CTA_HREF;
  a.innerHTML =
    '<span class="nav-mini-long">' +
    NAV_CTA_LABEL_LONG +
    '</span><span aria-hidden="true" style="opacity:.6;">→</span>';
  // Shorter label on narrow screens (handled in CSS by .nav-mini-long hide)
  const short = document.createElement('span');
  short.textContent = NAV_CTA_LABEL_SHORT;
  short.style.display = 'none';
  li.appendChild(a);
  nav.appendChild(li);

  // Show once hero is mostly offscreen
  const hero = document.querySelector('.hero');
  if (!hero) return;
  if (!('IntersectionObserver' in window)) {
    a.classList.add('show');
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      const e = entries[0];
      if (e.intersectionRatio < 0.18) a.classList.add('show');
      else a.classList.remove('show');
    },
    { threshold: [0, 0.18, 0.5, 1] },
  );
  io.observe(hero);
})();

/* ───────────────────────────────────────────────────────────
       Hero chip summoning system
       - All TOOLS placed on an elliptical orbit around the icon
       - Only ~10 visible at a time, cycling every ~3s
       - Hovering the icon triggers a staggered summon animation
       ─────────────────────────────────────────────────────────── */
(function chipSystem() {
  const wrap = document.getElementById('hero-icon-wrap');
  const icon = document.getElementById('hero-icon');
  if (!wrap || !icon) return;

  const VISIBLE = Math.min(10, TOOLS.length);

  function chipLabel(name) {
    const map = {
      Base64: 'Base64',
      'URL Encode': '%20 URL',
      'JSON Formatter': '{ } JSON',
      'Markdown Preview': '# Markdown',
      'Text Diff': '± Diff',
      'Image Diff': '▣ Image Diff',
      'UUID Generator': 'UUID v4',
      Timestamp: '⏱ timestamp',
      'Lorem Ipsum': 'lorem…',
      'Hash Generator': 'sha256',
      'JWT Decoder': 'JWT.decode',
      'Color Converter': '#ff8a3d',
      'Text Case': 'camelCase',
      'Number Base': '0x2A',
      'Regex Tester': '/regex/g',
      'Regex Explainer': '/(a|b)+/',
      'MOV → MP4': 'MOV → MP4',
      'MOV → GIF': 'MOV → GIF',
    };
    return map[name] || name;
  }

  const state = TOOLS.map((t, i) => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.dataset.tool = t.name;
    chip.textContent = chipLabel(t.name);
    chip.addEventListener('click', () => scrollToTool(t.name));
    wrap.appendChild(chip);
    return {
      tool: t,
      el: chip,
      visible: false,
      // orbit params — assigned when the chip is given a slot
      phase: 0, // current angle along the orbit (radians)
      tilt: 0, // slight rotation for visual variety
      summonK: 1, // 0 = at icon, 1 = at full orbit radius (summon swells this to 1.15 then back to 1)
      fadeK: 0, // 0 = invisible, 1 = fully faded in
    };
  });

  // Hover tooltip — one shared element, rendered at document.body so it
  // never gets clipped by ancestor overflow. JS positions per-hover.
  const tip = document.createElement('div');
  tip.className = 'chip-tip';
  tip.innerHTML = '<span class="chip-tip-name"></span><span class="chip-tip-body"></span>';
  document.body.appendChild(tip);
  const tipName = tip.querySelector('.chip-tip-name');
  const tipBody = tip.querySelector('.chip-tip-body');

  // Orbit pauses while any chip is hovered.
  let hoveredChip = null;

  function showTip(s) {
    hoveredChip = s;
    tipName.textContent = s.tool.name;
    const benefit = s.tool.el && s.tool.el.getAttribute('data-benefit');
    tipBody.textContent = benefit || '';
    positionTip(s);
    tip.classList.add('visible');
  }
  function hideTip() {
    hoveredChip = null;
    tip.classList.remove('visible');
  }
  function positionTip(s) {
    // Measure the chip in viewport coords; place the tip below-center by default,
    // but flip above / clamp to viewport edges if it would spill.
    const chipRect = s.el.getBoundingClientRect();
    const gap = 10;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // First render the tip offscreen to measure it
    tip.style.left = '-9999px';
    tip.style.top = '-9999px';
    tip.classList.add('visible');
    const tipRect = tip.getBoundingClientRect();
    const tw = tipRect.width;
    const th = tipRect.height;

    // Default position: below the chip, horizontally centered on it.
    let x = chipRect.left + chipRect.width / 2 - tw / 2;
    let y = chipRect.bottom + gap;

    // Flip above if it would clip the bottom
    if (y + th > vh - 8) {
      y = chipRect.top - gap - th;
    }
    // Clamp horizontally with 8px gutter
    if (x < 8) x = 8;
    if (x + tw > vw - 8) x = vw - 8 - tw;
    // If after all that it's still off-screen vertically, clamp.
    if (y < 8) y = 8;

    tip.style.left = x.toFixed(1) + 'px';
    tip.style.top = y.toFixed(1) + 'px';
  }

  state.forEach((s) => {
    s.el.addEventListener('mouseenter', () => showTip(s));
    s.el.addEventListener('mouseleave', () => hideTip());
    // Accessibility — keyboard focus also shows the tip.
    s.el.setAttribute('tabindex', '0');
    s.el.addEventListener('focus', () => showTip(s));
    s.el.addEventListener('blur', () => hideTip());
  });

  function iconRadius() {
    const r = icon.getBoundingClientRect();
    return Math.max(r.width, r.height) / 2;
  }

  function orbitRadii() {
    const r = iconRadius();
    return { rx: r + 260, ry: r + 200 };
  }

  // Orbit speed — radians per ms. Slow and stately; planets, not blades.
  const OMEGA = 0.00018;

  // Take VISIBLE chips, space them evenly around the orbit
  function assignSlots() {
    const shuffled = [...state].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, VISIBLE);
    const chosenSet = new Set(chosen);
    chosen.forEach((s, i) => {
      s.phase = (i / VISIBLE) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
      s.tilt = ((Math.random() * 16 - 8) * Math.PI) / 180;
      s.visible = true;
    });
    state.forEach((s) => {
      if (!chosenSet.has(s)) s.visible = false;
    });
  }

  let last = performance.now();
  let summonBurstStart = -Infinity;

  function frame(now) {
    const dt = now - last;
    last = now;
    const { rx, ry } = orbitRadii();

    // Global summon burst — rises fast, settles ~1s
    let burstK = 0;
    const since = now - summonBurstStart;
    if (since >= 0 && since < 1200) {
      // 0 → 1 in 180ms, then ease back to steady 1
      burstK = since < 180 ? since / 180 : 1;
    } else if (summonBurstStart !== -Infinity) {
      burstK = 1;
    }

    state.forEach((s, i) => {
      if (s.visible) {
        // advance phase — but pause while any chip is hovered
        if (!hoveredChip) {
          s.phase += OMEGA * dt;
        }
        // ease summon radius
        if (since >= 0 && since < 1200) {
          // Each chip has its own stagger so they fan out.
          const staggerStart = i * 40;
          const t = Math.max(0, Math.min(1, (since - staggerStart) / 600));
          // Shoot out past 1, settle back
          s.summonK = t < 0.6 ? (t / 0.6) * 1.12 : 1.12 - ((t - 0.6) / 0.4) * 0.12;
          s.fadeK = Math.min(1, s.fadeK + dt / 400);
        } else {
          s.summonK += (1 - s.summonK) * Math.min(1, dt / 180);
          s.fadeK = Math.min(1, s.fadeK + dt / 500);
        }
      } else {
        s.fadeK = Math.max(0, s.fadeK - dt / 350);
      }

      const x = Math.cos(s.phase) * rx * s.summonK;
      const y = Math.sin(s.phase) * ry * s.summonK;
      const rot = s.tilt;
      s.el.style.transform =
        'translate(calc(-50% + ' +
        x.toFixed(1) +
        'px), calc(-50% + ' +
        y.toFixed(1) +
        'px)) rotate(' +
        rot.toFixed(3) +
        'rad)';
      if (s.fadeK > 0) s.el.classList.add('alive');
      else s.el.classList.remove('alive');
      s.el.style.opacity = s.fadeK.toFixed(3);
    });

    requestAnimationFrame(frame);
  }

  // Periodic swap: hide one, reveal another. The spin keeps going.
  function cycleOne() {
    const visibles = state.filter((s) => s.visible);
    const hiddens = state.filter((s) => !s.visible);
    if (!visibles.length || !hiddens.length) return;
    const leaving = visibles[Math.floor(Math.random() * visibles.length)];
    const entering = hiddens[Math.floor(Math.random() * hiddens.length)];
    leaving.visible = false;
    // entering chip takes the leaving slot's phase so orbit stays evenly spaced
    entering.phase = leaving.phase;
    entering.tilt = ((Math.random() * 16 - 8) * Math.PI) / 180;
    entering.summonK = 0.4; // pop in from closer to the icon
    entering.visible = true;
  }

  // (No hover-to-resummon — chips just orbit steadily after the initial burst.)

  if (prefersReducedMotion) {
    // Static placement, no rAF, no cycling.
    assignSlots();
    const { rx, ry } = orbitRadii();
    state.forEach((s) => {
      if (!s.visible) return;
      const x = Math.cos(s.phase) * rx;
      const y = Math.sin(s.phase) * ry;
      s.el.style.transform = 'translate(calc(-50% + ' + x + 'px), calc(-50% + ' + y + 'px))';
      s.el.classList.add('alive');
      s.el.style.opacity = 1;
    });
  } else {
    requestAnimationFrame(() => {
      assignSlots();
      // initial burst so chips fly out on load too
      summonBurstStart = performance.now();
      last = performance.now();
      requestAnimationFrame(frame);
      setInterval(cycleOne, 3200);
    });
  }
})();

/* ── Clickable hero chips → scroll & flash row ── */
function scrollToTool(name) {
  const li = document.querySelector('.tool-cat li[data-tool="' + CSS.escape(name) + '"]');
  if (!li) return;
  // Ensure category isn't dimmed by a stale filter
  const allBtn = document.querySelector('.tool-filter[data-filter="all"]');
  if (allBtn && !allBtn.classList.contains('active')) allBtn.click();
  const behavior = prefersReducedMotion ? 'auto' : 'smooth';
  li.scrollIntoView({ behavior, block: 'center' });
  li.classList.remove('flash');
  void li.offsetWidth;
  li.classList.add('flash');
  setTimeout(() => li.classList.remove('flash'), 1700);
}

/* ───────────────────────────────────────────────────────────
       Smart Paste interactive demo
       ─────────────────────────────────────────────────────────── */
(function smartPasteDemo() {
  const buttons = document.querySelectorAll('.sp-clip-btn');
  const toolLabel = document.getElementById('sp-tool');
  const body = document.getElementById('sp-body');
  if (!buttons.length || !body) return;

  const views = {
    jwt: {
      tool: 'JWT Decoder',
      html: `
<span class="sp-c"># detected → JWT (three base64url segments, dot-separated)</span>

<span class="sp-k">HEADER</span>
{
  <span class="sp-k">"alg"</span>: <span class="sp-v">"HS256"</span>,
  <span class="sp-k">"typ"</span>: <span class="sp-v">"JWT"</span>
}

<span class="sp-k">PAYLOAD</span>
{
  <span class="sp-k">"sub"</span>: <span class="sp-v">"1234567890"</span>,
  <span class="sp-k">"name"</span>: <span class="sp-v">"Never gonna give you up"</span>,
  <span class="sp-k">"iat"</span>: <span class="sp-v">1760000000</span>
}

<span class="sp-k">SIGNATURE</span>
<span class="sp-p">signature_placeholder</span>`,
    },
    json: {
      tool: 'JSON Formatter',
      html: `
<span class="sp-c"># detected → JSON (parses cleanly, keys and values)</span>

{
  <span class="sp-k">"order_id"</span>: <span class="sp-v">"8f3b"</span>,
  <span class="sp-k">"total"</span>: <span class="sp-v">42.99</span>,
  <span class="sp-k">"items"</span>: [
    {
      <span class="sp-k">"sku"</span>: <span class="sp-v">"BNCH-001"</span>,
      <span class="sp-k">"qty"</span>: <span class="sp-v">2</span>
    },
    {
      <span class="sp-k">"sku"</span>: <span class="sp-v">"BNCH-PRO"</span>,
      <span class="sp-k">"qty"</span>: <span class="sp-v">1</span>
    }
  ]
}`,
    },
    hex: {
      tool: 'Color Converter',
      html: `
<span class="sp-c"># detected → color (# followed by 3/6/8 hex digits)</span>

<span class="sp-k">HEX</span>    <span class="sp-swatch" style="background:#ff8a3d"></span><span class="sp-v">#ff8a3d</span>
<span class="sp-k">RGB</span>    <span class="sp-v">rgb(255, 138, 61)</span>
<span class="sp-k">HSL</span>    <span class="sp-v">hsl(20, 100%, 62%)</span>
<span class="sp-k">OKLCH</span>  <span class="sp-v">oklch(0.74 0.17 44)</span>

<span class="sp-c"># contrast vs #14110f</span>
<span class="sp-g">AA ✓ / AAA ✓ for large text</span>`,
    },
    regex: {
      tool: 'Regex Tester',
      html: `
<span class="sp-c"># detected → regex literal (/.../, flags optional)</span>

<span class="sp-k">PATTERN</span>  <span class="sp-v">/\\d{4}/</span>
<span class="sp-k">FLAGS</span>    <span class="sp-v">—</span>

<span class="sp-k">SAMPLE</span>
Order <span class="sp-r">2847</span>, shipped <span class="sp-r">2026</span>-04-23 for <span class="sp-r">1998</span> USD.

<span class="sp-k">MATCHES</span>  <span class="sp-v">3</span>
<span class="sp-g">  1. 2847   @ 6-10</span>
<span class="sp-g">  2. 2026   @ 21-25</span>
<span class="sp-g">  3. 1998   @ 36-40</span>`,
    },
  };

  function show(key) {
    const v = views[key];
    if (!v) return;
    toolLabel.textContent = v.tool;
    body.innerHTML = '<div class="sp-fade">' + v.html.trim() + '</div>';
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      show(btn.dataset.clip);
    });
  });
})();

/* ───────────────────────────────────────────────────────────
       Screenshots scroller — progress dots + reduced-motion guard
       ─────────────────────────────────────────────────────────── */
(function shotsDots() {
  const scroller = document.getElementById('shots-scroller');
  const dotsHost = document.getElementById('shots-dots');
  if (!scroller || !dotsHost) return;
  const shots = [...scroller.querySelectorAll('.shot')];
  if (!shots.length) return;

  shots.forEach((s, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dot' + (i === 0 ? ' active' : '');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Screenshot ' + (i + 1));
    b.addEventListener('click', () => {
      const behavior = prefersReducedMotion ? 'auto' : 'smooth';
      s.scrollIntoView({ behavior, inline: 'start', block: 'nearest' });
    });
    dotsHost.appendChild(b);
  });

  let ticking = false;
  scroller.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const sl = scroller.scrollLeft;
      let best = 0;
      let bestDist = Infinity;
      shots.forEach((s, i) => {
        const d = Math.abs(s.offsetLeft - sl);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      dotsHost.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i === best);
      });
      ticking = false;
    });
  });
  // No auto-scroll is implemented; if one is added later, wrap it in:
  //   if (!prefersReducedMotion) { ... }
})();
