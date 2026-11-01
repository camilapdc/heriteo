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

  // The sheep runs across the pasture and hops over the fence in the middle.
  // Positions snap to whole sprite pixels so the motion stays 8-bit.
  const pasture = document.querySelector('.pasture');
  const sheep = pasture && pasture.querySelector('.sheep');
  const fence = pasture && pasture.querySelector('.fence');
  if (!sheep || !fence || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const PX = SPRITES.sheep.px, SPEED = 140, HOP = 42, REACH = 66;   // px/s, hop height, half the hop length
  let x = -sheep.offsetWidth, last = performance.now();
  sheep.classList.add('running');
  (function step(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const w = sheep.offsetWidth, width = pasture.clientWidth;
    x += SPEED * dt;
    if (x > width) x = -w;
    const d = x + w / 2 - (fence.offsetLeft + fence.offsetWidth / 2);
    const y = Math.abs(d) < REACH ? HOP * (1 - (d / REACH) ** 2) : 0;
    sheep.classList.toggle('jumping', y > 0);
    const snap = v => Math.round(v / PX) * PX;
    sheep.style.transform = `translate(${snap(x)}px, ${-snap(y)}px)`;
    requestAnimationFrame(step);
  })(last);
})();
