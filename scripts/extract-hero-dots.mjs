/**
 * Extracts individual dot positions from the hero's Figma-exported dot SVGs
 * so they can be animated as particles (src/three/heroDots.json).
 *
 * Usage: node scripts/extract-hero-dots.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const dir = new URL('../src/assets/hero/', import.meta.url);
const read = (name) => readFileSync(new URL(name, dir), 'utf8');
const round = (n) => Math.round(n * 100) / 100;

/** Each sub-path of the silhouette SVGs is one circle drawn with bezier arcs. */
function dotsFromPath(svg) {
  const d = svg.match(/ d="([^"]+)"/)[1];
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

const data = {
  bordo: dotsFromPath(read('dots-bordo.svg')),
  soft: dotsFromPath(read('dots-soft.svg')),
  scatter: dotsFromCircles(read('dots-scatter.svg')),
};

writeFileSync(new URL('../src/three/heroDots.json', import.meta.url), JSON.stringify(data));
console.log(`bordo: ${data.bordo.length}, soft: ${data.soft.length}, scatter: ${data.scatter.length}`);
