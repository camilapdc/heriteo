// Heriteo: the trumpet rabbit.
// The drawing (rabbit.webp, black ink on transparent) is mirrored to face the
// menu on the right. Its pupil is cut out and redrawn so the eye can follow
// the cursor; clicking a menu item sends sound strokes from the trumpet.
(() => {
  // all coordinates below are in pixels of the original 2000x2000 drawing
  const CROP = { x: 100, y: 30, w: 1515, h: 1955 };
  const RES = 0.5;                          // canvas resolution vs. the drawing
  const EYE_BOX = { x: 900, y: 460, w: 200, h: 130 };   // holds only the eye's white
  const PUPIL = { x: 990, y: 514, r: 31 };
  const LOOK = { x: 13, y: 10 };            // how far the pupil can travel
  const MOUTH = { x: 215, y: 625 };         // where the sound strokes start

  const cv = document.getElementById('rabbit');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  cv.width = Math.round(CROP.w * RES); cv.height = Math.round(CROP.h * RES);

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const links = [...document.querySelectorAll('nav a')];
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  let base = null, eye = null;              // drawing without its pupil; outline of the eye's white
  let look = { x: 0, y: 0 }, goal = { x: 0, y: 0 }, busy = false, ticking = false;

  // drawing coords -> position inside the (mirrored) canvas, as a fraction of its size
  const frac = p => ({ x: (CROP.w - (p.x - CROP.x)) / CROP.w, y: (p.y - CROP.y) / CROP.h });

  // convex hull of the transparent pixels in EYE_BOX = the white of the eye
  function eyeOutline(c) {
    const d = c.getContext('2d').getImageData(EYE_BOX.x, EYE_BOX.y, EYE_BOX.w, EYE_BOX.h).data;
    const pts = [];
    for (let j = 0; j < EYE_BOX.h; j++) {
      let lo = -1, hi = -1;
      for (let i = 0; i < EYE_BOX.w; i++) if (d[(j * EYE_BOX.w + i) * 4 + 3] < 128) { if (lo < 0) lo = i; hi = i; }
      if (lo >= 0) pts.push([lo + EYE_BOX.x, j + EYE_BOX.y], [hi + EYE_BOX.x, j + EYE_BOX.y]);
    }
    pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const half = list => {
      const h = [];
      for (const p of list) {
        while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop();
        h.push(p);
      }
      return h.slice(0, -1);
    };
    const hull = half(pts).concat(half(pts.slice().reverse()));
    const path = new Path2D();
    hull.forEach(([px, py], k) => (k ? path.lineTo(px, py) : path.moveTo(px, py)));
    path.closePath();
    return path;
  }

  function load(img) {
    base = document.createElement('canvas');
    base.width = img.naturalWidth; base.height = img.naturalHeight;
    const b = base.getContext('2d');
    b.drawImage(img, 0, 0);
    eye = eyeOutline(base);
    b.globalCompositeOperation = 'destination-out';
    b.fill(eye);                            // remove the drawn pupil
    render();
  }

  function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (!base) return;
    // mirror and crop, then work in drawing coordinates
    ctx.setTransform(-RES, 0, 0, RES, (CROP.w + CROP.x) * RES, -CROP.y * RES);
    ctx.drawImage(base, 0, 0);
    ctx.save();
    ctx.clip(eye);
    ctx.beginPath();
    ctx.arc(PUPIL.x - look.x, PUPIL.y + look.y, PUPIL.r, 0, Math.PI * 2);   // x flipped by the mirror
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.restore();
  }

  // ease the pupil toward where it should look
  function tick() {
    look.x += (goal.x - look.x) * 0.2;
    look.y += (goal.y - look.y) * 0.2;
    render();
    if (Math.abs(goal.x - look.x) + Math.abs(goal.y - look.y) > 0.05) requestAnimationFrame(tick);
    else { look = { ...goal }; render(); ticking = false; }
  }
  function client(p) {
    const r = cv.getBoundingClientRect(), f = frac(p);
    return { x: r.left + f.x * r.width, y: r.top + f.y * r.height };
  }
  function lookAt(x, y) {
    const e = client(PUPIL), dx = x - e.x, dy = y - e.y;
    const dist = Math.hypot(dx, dy) || 1, k = Math.min(1, dist / 250);
    goal = { x: dx / dist * k * LOOK.x, y: dy / dist * k * LOOK.y };
    if (!ticking) { ticking = true; requestAnimationFrame(tick); }
  }

  function target(link) {
    const r = (link.querySelector('.word') || link).getBoundingClientRect();
    return { x: r.left - 8, y: r.top + r.height / 2 };
  }

  // three little strokes, like the ones in the drawing, fly to the menu item
  function toot(link) {
    busy = true;
    const t = target(link);
    lookAt(t.x, t.y);
    return new Promise(done => {
      if (reduce) { setTimeout(done, 120); return; }
      setTimeout(() => {
        const m = client(MOUTH), sx = scrollX, sy = scrollY;
        const th = Math.atan2(t.y - m.y, t.x - m.x);
        const dist = Math.hypot(t.x - m.x, t.y - m.y);
        const dur = clamp(dist / 1.4, 260, 700);
        [-0.22, 0, 0.22].forEach((spread, i) => {
          const el = document.createElement('span');
          el.className = 'note';
          document.body.appendChild(el);
          const a = th + spread;
          const from = `translate(${sx + m.x}px, ${sy + m.y}px) rotate(${a}rad)`;
          const to = `translate(${sx + m.x + Math.cos(a) * dist}px, ${sy + m.y + Math.sin(a) * dist}px) rotate(${a}rad)`;
          el.animate(
            [{ transform: from, opacity: 1 }, { transform: to, opacity: 1, offset: 0.85 }, { transform: to, opacity: 0 }],
            { duration: dur, delay: i * 40, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' }
          ).onfinish = () => el.remove();
        });
        setTimeout(() => {
          link.classList.remove('hit'); void link.offsetWidth; link.classList.add('hit');
        }, dur * 0.85);
        setTimeout(done, dur + 380);
      }, 180);
    });
  }

  addEventListener('pointermove', e => { if (!busy) lookAt(e.clientX, e.clientY); });
  links.forEach(link => link.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (busy) return;
    toot(link).then(() => { location.href = link.href; });
  }));
  // coming back with the browser's back button: let the rabbit play again
  addEventListener('pageshow', e => { if (e.persisted) busy = false; });

  const img = new Image();
  img.onload = () => load(img);
  img.src = 'rabbit.webp';
})();
