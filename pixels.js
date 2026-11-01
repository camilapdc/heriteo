// Tiny 8-bit sprites drawn from text maps: one string per row,
// K = black pixel, W = white pixel, . = empty. A sprite with several
// frames gets one <g class="frame frame-N"> per frame; CSS flips between them.
(() => {
  const SPRITES = {
    arrow: {
      px: 3,
      frames: [[
        '...K...',
        '...K...',
        '...K...',
        '...K...',
        '...K...',
        '...K...',
        '...K...',
        '...K...',
        '...K...',
        '...K...',
        'KKKKKKK',
        '.KKKKK.',
        '..KKK..',
        '...K...',
      ]],
    },
    mail: {
      px: 2,
      frames: [[
        'KKKKKKKKKKK',
        'KK.......KK',
        'K.K.....K.K',
        'K..K...K..K',
        'K...K.K...K',
        'K....K....K',
        'K.........K',
        'KKKKKKKKKKK',
      ]],
    },
    fence: {
      px: 3,
      frames: [[
        '.K...K...K.',
        'KKK.KKK.KKK',
        '.K...K...K.',
        'KKKKKKKKKKK',
        '.K...K...K.',
        '.K...K...K.',
        'KKKKKKKKKKK',
        '.K...K...K.',
        '.K...K...K.',
      ]],
    },
    grass: {
      px: 3,
      frames: [[
        '.K...K.',
        '.K.K.K.',
        'K.KKK.K',
      ]],
    },
    flower: {
      px: 3,
      frames: [[
        '.K.',
        'K.K',
        '.K.',
        '.K.',
        'KK.',
        '.K.',
      ]],
    },
    sheep: {
      px: 3,
      frames: [[
        '...KKK.KKK........',
        '..KWWWKWWWKK......',
        '.KWWWWWWWWWWK.KK..',
        'KWWWWWWWWWWWKKKKK.',
        'KWWWWWWWWWWWKKWKKK',
        'KWWWWWWWWWWWKKKKKK',
        '.KWWWWWWWWWWKKKK..',
        '..KWWWWWWWWWK.....',
        '...KKKKKKKKK......',
        '..KK......KK......',
        '.KK........KK.....',
        'KK..........KK....',
      ], [
        '...KKK.KKK........',
        '..KWWWKWWWKK......',
        '.KWWWWWWWWWWK.KK..',
        'KWWWWWWWWWWWKKKKK.',
        'KWWWWWWWWWWWKKWKKK',
        'KWWWWWWWWWWWKKKKKK',
        '.KWWWWWWWWWWKKKK..',
        '..KWWWWWWWWWK.....',
        '...KKKKKKKKK......',
        '....KK..KK........',
        '....KK..KK........',
        '....KK..KK........',
      ]],
    },
  };
  SPRITES.lamb = { px: 2, frames: SPRITES.sheep.frames };   // a mini sheep for the photo gallery
  const NS = 'http://www.w3.org/2000/svg';
  const make = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  };

  document.querySelectorAll('[data-sprite]').forEach(host => {
    const s = SPRITES[host.dataset.sprite];
    if (!s) return;
    const w = s.frames[0][0].length, h = s.frames[0].length;
    const svg = make('svg', {
      viewBox: `0 0 ${w} ${h}`, width: w * s.px, height: h * s.px,
      'shape-rendering': 'crispEdges', 'aria-hidden': 'true',
    });
    s.frames.forEach((rows, i) => {
      const g = make('g', { class: `frame frame-${i}` });
      rows.forEach((row, y) => [...row].forEach((ch, x) => {
        if (ch !== '.') g.appendChild(make('rect', { x, y, width: 1, height: 1, fill: ch === 'K' ? '#000' : '#fff' }));
      }));
      svg.appendChild(g);
    });
    host.appendChild(svg);
  });

  // In each pasture a sheep runs across and hops over the fence in the middle.
  // Positions snap to whole sprite pixels so the motion stays 8-bit.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const PX = SPRITES.sheep.px, SPEED = 140, HOP = 42, REACH = 66;   // px/s, hop height, half the hop length
  const snap = v => Math.round(v / PX) * PX;
  const runners = [...document.querySelectorAll('.pasture')].map(pasture => {
    const sheep = pasture.querySelector('.sheep'), fence = pasture.querySelector('.fence');
    if (!sheep || !fence) return null;
    sheep.classList.add('running');
    return { pasture, sheep, fence, x: -sheep.offsetWidth };
  }).filter(Boolean);
  if (!runners.length) return;

  let last = performance.now();
  (function step(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    runners.forEach(r => {
      const w = r.sheep.offsetWidth, width = r.pasture.clientWidth;
      r.x += SPEED * dt;
      if (r.x > width) r.x = -w;
      const d = r.x + w / 2 - (r.fence.offsetLeft + r.fence.offsetWidth / 2);
      const y = Math.abs(d) < REACH ? HOP * (1 - (d / REACH) ** 2) : 0;
      r.sheep.classList.toggle('jumping', y > 0);
      r.sheep.style.transform = `translate(${snap(r.x)}px, ${-snap(y)}px)`;
    });
    requestAnimationFrame(step);
  })(last);
})();
