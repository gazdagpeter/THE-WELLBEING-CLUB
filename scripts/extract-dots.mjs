/**
 * Extracts individual dot positions from the Figma-exported dot SVGs
 * so they can be animated as particles:
 *  - hero:   src/three/heroDots.json
 *  - intro:  src/three/teaserDots.json (02 Bemutatkozás – teaser pose)
 *
 * Usage: node scripts/extract-dots.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const dir = new URL('../src/assets/', import.meta.url);
const read = (name) => readFileSync(new URL(name, dir), 'utf8');
const round = (n) => Math.round(n * 100) / 100;

/** Each sub-path of the silhouette SVGs is one circle drawn with bezier arcs. */
function dotsFromPath(svg) {
  return dotsFromD(svg.match(/ d="([^"]+)"/)[1]);
}

function dotsFromD(d) {
  return d
    .split('M')
    .filter((s) => s.trim())
    .map((sub) => {
      const nums = sub.match(/-?\d*\.?\d+(?:e-?\d+)?/g).map(Number);
      const xs = nums.filter((_, i) => i % 2 === 0);
      const ys = nums.filter((_, i) => i % 2 === 1);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      return [round((minX + maxX) / 2), round((minY + maxY) / 2), round((maxX - minX + maxY - minY) / 4)];
    });
}

/** Scatter layer: plain <circle>s; the ones wrapped in a filtered <g> glow. */
function dotsFromCircles(svg) {
  const body = svg.split('<defs>')[0];
  const out = [];
  const re = /(<g [^>]*filter="[^"]+"[^>]*>\s*)?<circle ([^>]+)\/>/g;
  let m;
  while ((m = re.exec(body))) {
    const attr = (k) => m[2].match(new RegExp(`${k}="([^"]+)"`))?.[1];
    if (attr('opacity') === '0') continue;
    out.push([round(+attr('cx')), round(+attr('cy')), round(+attr('r')), attr('fill'), m[1] ? 1 : 0]);
  }
  return out;
}

const write = (name, data) => {
  writeFileSync(new URL(`../src/three/${name}`, import.meta.url), JSON.stringify(data));
  console.log(`${name} → bordo: ${data.bordo.length}, soft: ${data.soft.length}, scatter: ${data.scatter.length}`);
};

write('heroDots.json', {
  bordo: dotsFromPath(read('hero/dots-bordo.svg')),
  soft: dotsFromPath(read('hero/dots-soft.svg')),
  scatter: dotsFromCircles(read('hero/dots-scatter.svg')),
});

/** Teaser pose: one SVG – soft layer path (with opacity), bordó path, loose circles. */
{
  const svg = read('intro/teaser-figure.svg');
  const [, w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const paths = [...svg.matchAll(/<path ([^>]*?)\sd="([^"]+)"([^>]*)\/>/g)].map((m) => ({
    opacity: Number((m[1] + m[3]).match(/opacity="([^"]+)"/)?.[1] ?? 1),
    dots: dotsFromD(m[2]),
  }));
  const soft = paths.find((p) => p.opacity < 1);
  const bordo = paths.find((p) => p.opacity === 1);
  // bordó background variant: same dots, light colours
  const dark = read('intro/teaser-figure-dark.svg');
  const darkPathFills = [...dark.matchAll(/<path ([^>]*?)\sd="[^"]+"([^>]*)\/>/g)].map(
    (m) => (m[1] + m[2]).match(/fill="([^"]+)"/)[1],
  );
  write('teaserDots.json', {
    width: Number(w),
    height: Number(h),
    softOpacity: soft.opacity,
    soft: soft.dots,
    bordo: bordo.dots,
    scatter: dotsFromCircles(svg),
    dark: {
      soft: darkPathFills[paths.indexOf(soft)],
      bordo: darkPathFills[paths.indexOf(bordo)],
      scatter: dotsFromCircles(dark).map((c) => c[3]),
    },
  });
}

/** 03 Mozgásformák – balance pose on bordó: light dots, colours taken from the SVG. */
{
  const svg = read('practices/balance-figure.svg');
  const [, w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const paths = [...svg.matchAll(/<path ([^>]*?)\sd="([^"]+)"([^>]*)\/>/g)].map((m) => ({
    opacity: Number((m[1] + m[3]).match(/opacity="([^"]+)"/)?.[1] ?? 1),
    color: (m[1] + m[3]).match(/fill="([^"]+)"/)[1],
    dots: dotsFromD(m[2]),
  }));
  const soft = paths.find((p) => p.opacity < 1);
  const main = paths.find((p) => p.opacity === 1);
  write('balanceDots.json', {
    width: Number(w),
    height: Number(h),
    softOpacity: soft.opacity,
    softColor: soft.color,
    mainColor: main.color,
    soft: soft.dots,
    bordo: main.dots,
    scatter: dotsFromCircles(svg),
  });
}
