// Draws the tree rings and writes them into index.html between the rings markers.
// One group per year. Ring width is the story: wide while the name was held,
// drought-thin from 2019 to 2023 while it was not, and a dashed ring for the next owner.
// Run: node scripts/rings.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const SEED = 14;
const YEARS = [
  [2014, 40], [2015, 46], [2016, 52], [2017, 50], [2018, 34],
  [2019, 13], [2020, 9], [2021, 10], [2022, 8], [2023, 9],
  [2024, 30], [2025, 46], [2026, 44],
];
const NEXT_WIDTH = 46;
const POINTS = 40;

// Every ring shares the same harmonics, with phase drifting slowly outward,
// so neighbouring rings echo each other and never cross.
const HARMONICS = [[2, 0.030, 0.4], [3, 0.022, 2.1], [4, 0.012, 4.4], [5, 0.009, 1.2], [7, 0.005, 3.3]];

function radius(theta, r) {
  let wobble = 0;
  for (const [k, amp, phase] of HARMONICS) wobble += amp * Math.sin(k * theta + phase + r / 420);
  return r * (1 + wobble);
}

function path(r) {
  const pts = Array.from({ length: POINTS }, (_, i) => {
    const t = (i / POINTS) * Math.PI * 2;
    const q = radius(t, r);
    return [q * Math.cos(t), q * Math.sin(t)];
  });
  const at = (i) => pts[(i + POINTS) % POINTS];
  const n = (v) => Math.round(v * 10) / 10;
  let d = `M${n(pts[0][0])} ${n(pts[0][1])}`;
  for (let i = 0; i < POINTS; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += i === 0
      ? `C${n(c1[0])} ${n(c1[1])} ${n(c2[0])} ${n(c2[1])} ${n(p2[0])} ${n(p2[1])}`
      : `S${n(c2[0])} ${n(c2[1])} ${n(p2[0])} ${n(p2[1])}`;
  }
  return d + 'Z';
}

let r = SEED;
const groups = YEARS.map(([year, width], i) => {
  const start = r;
  r += width;
  const grain = Math.floor(width / 13);
  let lines = '';
  for (let g = 1; g <= grain; g++) {
    // Grain tightens toward the year boundary, as late wood does.
    const f = Math.pow(g / (grain + 1), 0.72);
    lines += `<path class="grain" d="${path(start + width * f)}"/>`;
  }
  return `<g data-year="${year}" style="--i:${i}">${lines}<path d="${path(r)}"/></g>`;
});
groups.push(`<g data-year="next" style="--i:${YEARS.length}"><path d="${path(r + NEXT_WIDTH)}"/></g>`);

const svg = `<svg viewBox="-520 -520 1040 1040" role="img" aria-label="Tree rings, one for each year since 2014. They narrow from 2019 to 2023 and widen again from 2024. The outermost ring is dashed."><circle class="seed" r="5.5"/>\n${groups.join('\n')}\n</svg>`;

const file = new URL('../index.html', import.meta.url);
const html = readFileSync(file, 'utf8');
const marker = /<!-- rings -->[\s\S]*<!-- \/rings -->/;
if (!marker.test(html)) throw new Error('rings markers missing from index.html');
writeFileSync(file, html.replace(marker, `<!-- rings -->\n${svg}\n<!-- /rings -->`));
console.log(`wrote ${groups.length} rings, ${(svg.length / 1024).toFixed(1)} KB`);
