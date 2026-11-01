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
    sheep: {
      px: 4,
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
})();
