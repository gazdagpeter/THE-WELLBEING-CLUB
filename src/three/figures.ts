import type { FigureConfig, Particle } from './DotFigure';
import heroDots from './heroDots.json';
import teaserDots from './teaserDots.json';
import balanceDots from './balanceDots.json';
import echoDots from './echoDots.json';

const BORDO = '#590110';

type Scatter = [number, number, number, string, number][];

/* ───────── 01 Hero ───────── */

/** Art board of the hero figure in Figma units (see Hero.css). */
export const HERO_ART = { width: 804.96, height: 744.92 };

export function heroFigure(): FigureConfig {
  const silhouetteOffset = { x: 123.84, y: 237.795 };
  const silhouetteSize = { w: 557.28, h: 445.205 };
  const scatterOffset = { x: 0, y: 113.955 };
  const particles: Particle[] = [];

  for (const layer of [heroDots.soft, heroDots.bordo]) {
    for (const [x, y, r] of layer) {
      // sweep from the raised arm (top-left) towards the knees (bottom-right)
      const sweep = (x / silhouetteSize.w) * 0.55 + (y / silhouetteSize.h) * 0.3;
      particles.push({
        x: x + silhouetteOffset.x,
        y: y + silhouetteOffset.y,
        r,
        color: BORDO,
        alpha: 1,
        glow: false,
        delay: sweep * 0.85 + Math.random() * 0.25,
      });
    }
  }

  for (const [x, y, r, color, glow] of heroDots.scatter as Scatter) {
    particles.push({
      x: x + scatterOffset.x,
      y: y + scatterOffset.y,
      r,
      color,
      alpha: 1,
      glow: glow === 1,
      delay: 0.55 + Math.random() * 0.45,
    });
  }

  return { ...HERO_ART, particles };
}

/* ───────── 02 Bemutatkozás – teaser pose ───────── */

/** Art board = the exported SVG box (figure + loose dots). */
export const TEASER_ART = { width: teaserDots.width, height: teaserDots.height };

export function teaserFigure(): FigureConfig {
  const particles: Particle[] = [];
  const { width } = TEASER_ART;

  const silhouette = (layer: number[][], alpha: number, darkColor: string) => {
    for (const [x, y, r] of layer) {
      // sweep from the raised feet (left) to the head (right)
      particles.push({
        x,
        y,
        r,
        color: BORDO,
        darkColor,
        alpha,
        glow: false,
        delay: (x / width) * 0.8 + Math.random() * 0.25,
      });
    }
  };

  silhouette(teaserDots.soft, teaserDots.softOpacity, teaserDots.dark.soft);
  silhouette(teaserDots.bordo, 1, teaserDots.dark.bordo);

  (teaserDots.scatter as Scatter).forEach(([x, y, r, color, glow], i) => {
    particles.push({
      x,
      y,
      r,
      color,
      darkColor: teaserDots.dark.scatter[i],
      alpha: 1,
      glow: glow === 1,
      delay: 0.5 + Math.random() * 0.5,
    });
  });

  return { ...TEASER_ART, particles };
}

/* ───────── 03 Mozgásformák – balance pose (light dots on bordó) ───────── */

export function balanceFigure(): FigureConfig {
  const particles: Particle[] = [];
  const { width } = balanceDots;

  const silhouette = (layer: number[][], color: string, alpha: number) => {
    for (const [x, y, r] of layer) {
      // sweep from the extended arm (left) to the lifted leg (right)
      particles.push({ x, y, r, color, alpha, glow: false, delay: (x / width) * 0.8 + Math.random() * 0.25 });
    }
  };

  silhouette(balanceDots.soft, balanceDots.softColor, balanceDots.softOpacity);
  silhouette(balanceDots.bordo, balanceDots.mainColor, 1);

  for (const [x, y, r, color, glow] of balanceDots.scatter as Scatter) {
    particles.push({ x, y, r, color, alpha: 1, glow: glow === 1, delay: 0.5 + Math.random() * 0.5 });
  }

  return { width: balanceDots.width, height: balanceDots.height, particles };
}

/* ───────── 08 Az oktató – echo pose behind the photo ───────── */

export function echoFigure(): FigureConfig {
  const particles: Particle[] = [];
  const { width } = echoDots;
  for (const [x, y, r] of echoDots.bordo) {
    particles.push({ x, y, r, color: echoDots.mainColor, alpha: echoDots.mainOpacity, glow: false, delay: (x / width) * 0.8 + Math.random() * 0.25 });
  }
  for (const [x, y, r, color, glow] of echoDots.scatter as Scatter) {
    particles.push({ x, y, r, color, alpha: 1, glow: glow === 1, delay: 0.5 + Math.random() * 0.5 });
  }
  return { width: echoDots.width, height: echoDots.height, particles };
}
