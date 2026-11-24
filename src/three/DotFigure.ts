import {
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  OrthographicCamera,
  Points,
  Scene,
  SRGBColorSpace,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';
import dots from './heroDots.json';

/** Art board of the hero figure in Figma units (see Hero.css). */
export const ART_WIDTH = 804.96;
export const ART_HEIGHT = 744.92;

/** Offsets of the dot layers inside the art board (Figma). */
const SILHOUETTE_OFFSET = { x: 123.84, y: 237.795 };
const SCATTER_OFFSET = { x: 0, y: 113.955 };
const SILHOUETTE_SIZE = { w: 557.28, h: 445.205 };

const BORDO = '#590110';
/** Raw sRGB components – the shader writes them straight to the sRGB canvas. */
function srgb(hex: string): [number, number, number] {
  const out = { r: 0, g: 0, b: 0 };
  new Color(hex).getRGB(out, SRGBColorSpace);
  return [out.r, out.g, out.b];
}

const GLOW = srgb('#d8b4b8');

type Particle = {
  x: number;
  y: number;
  r: number;
  color: string;
  glow: boolean;
  delay: number;
};

const vertexShader = /* glsl */ `
  attribute vec2 aStart;
  attribute float aRadius;
  attribute float aDelay;
  attribute float aGlow;
  attribute float aSeed;
  attribute vec3 aColor;

  uniform float uProgress;
  uniform float uTime;
  uniform float uPxScale;
  uniform vec2 uMouse;
  uniform float uMouseStrength;
  uniform float uMouseRadius;
  uniform float uMinPx;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vGlow;
  varying float vCore;
  varying float vPointPx;

  void main() {
    // per-particle progress: the figure is drawn in a sweep, each dot easing in
    float t = clamp((uProgress * 1.7 - aDelay) / 0.7, 0.0, 1.0);
    float e = 1.0 - pow(1.0 - t, 4.0);

    vec2 p = mix(aStart, position.xy, e);

    // gentle idle breathing once the dot has arrived
    float idle = e * 0.9;
    p += vec2(sin(uTime * 0.7 + aSeed * 6.2831), cos(uTime * 0.6 + aSeed * 12.566)) * idle;

    // pointer interaction: dots are pushed away from the cursor and spring back
    vec2 d = p - uMouse;
    float dist = length(d);
    float falloff = 1.0 - smoothstep(0.0, uMouseRadius, dist);
    falloff = falloff * falloff;
    p += (d / max(dist, 0.001)) * falloff * uMouseStrength * 40.0;
    // a slight swirl makes the displacement feel organic
    p += vec2(-d.y, d.x) / max(dist, 0.001) * falloff * uMouseStrength * 10.0 * (aSeed - 0.5);

    gl_Position = projectionMatrix * vec4(p, 0.0, 1.0);

    // glowing dots get a halo around their core
    float halo = aGlow > 0.5 ? aRadius * 3.6 : aRadius;
    // keep dots legible on small screens
    float sizePx = max(halo * 2.0 * uPxScale, uMinPx * (halo / aRadius));
    gl_PointSize = sizePx;

    vColor = aColor;
    vAlpha = smoothstep(0.0, 0.35, t);
    vGlow = aGlow;
    vCore = aRadius / halo;
    vPointPx = sizePx;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uGlowColor;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vGlow;
  varying float vCore;
  varying float vPointPx;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float aa = 1.2 / max(vPointPx, 1.0);

    float core = 1.0 - smoothstep(vCore - aa, vCore + aa * 0.5, d);

    vec3 color = vColor;
    float alpha = core;

    if (vGlow > 0.5) {
      float halo = exp(-pow(d / max(vCore, 0.001), 2.0) * 0.35) * (1.0 - smoothstep(0.8, 1.0, d));
      color = mix(uGlowColor, vColor, core);
      alpha = max(core, halo * 0.85);
    }

    alpha *= vAlpha;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

function buildParticles(): Particle[] {
  const list: Particle[] = [];

  const silhouette = (layer: number[][]) => {
    for (const [x, y, r] of layer) {
      // sweep from the raised arm (top-left) towards the knees (bottom-right)
      const sweep = (x / SILHOUETTE_SIZE.w) * 0.55 + (y / SILHOUETTE_SIZE.h) * 0.3;
      list.push({
        x: x + SILHOUETTE_OFFSET.x,
        y: y + SILHOUETTE_OFFSET.y,
        r,
        color: BORDO,
        glow: false,
        delay: sweep * 0.85 + Math.random() * 0.25,
      });
    }
  };

  silhouette(dots.soft);
  silhouette(dots.bordo);

  for (const [x, y, r, color, glow] of dots.scatter as [number, number, number, string, number][]) {
    list.push({
      x: x + SCATTER_OFFSET.x,
      y: y + SCATTER_OFFSET.y,
      r,
      color,
      glow: glow === 1,
      delay: 0.55 + Math.random() * 0.45,
    });
  }

  return list;
}

/**
 * Hero dot figure: thousands of dots assemble into the silhouette
 * and react to the pointer (repel + spring back).
 */
export class DotFigure {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new OrthographicCamera(0, ART_WIDTH, 0, ART_HEIGHT, -1, 1);
  private material: ShaderMaterial;
  private geometry: BufferGeometry;
  private resizeObserver: ResizeObserver;
  private container: HTMLElement;
  private mouseTarget = { x: -9999, y: -9999, strength: 0 };
  private mouse = { x: -9999, y: -9999 };
  private visible = true;
  private intersection: IntersectionObserver;

  /** Formation progress 0 → 1 (animate with GSAP). */
  progress = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    this.renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(this.renderer.domElement);

    const particles = buildParticles();
    const count = particles.length;
    const position = new Float32Array(count * 3);
    const start = new Float32Array(count * 2);
    const radius = new Float32Array(count);
    const delay = new Float32Array(count);
    const glow = new Float32Array(count);
    const seed = new Float32Array(count);
    const color = new Float32Array(count * 3);

    particles.forEach((p, i) => {
      position.set([p.x, p.y, 0], i * 3);
      // dots drift in from a loose cloud around their final position
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 330;
      start.set([p.x + Math.cos(angle) * distance, p.y + Math.sin(angle) * distance * 0.75 - 60], i * 2);
      radius[i] = p.r;
      delay[i] = p.delay;
      glow[i] = p.glow ? 1 : 0;
      seed[i] = Math.random();
      color.set(srgb(p.color), i * 3);
    });

    this.geometry = new BufferGeometry();
    this.geometry.setAttribute('position', new BufferAttribute(position, 3));
    this.geometry.setAttribute('aStart', new BufferAttribute(start, 2));
    this.geometry.setAttribute('aRadius', new BufferAttribute(radius, 1));
    this.geometry.setAttribute('aDelay', new BufferAttribute(delay, 1));
    this.geometry.setAttribute('aGlow', new BufferAttribute(glow, 1));
    this.geometry.setAttribute('aSeed', new BufferAttribute(seed, 1));
    this.geometry.setAttribute('aColor', new BufferAttribute(color, 3));

    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: NormalBlending,
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uPxScale: { value: 1 },
        uMouse: { value: [-9999, -9999] },
        uMouseStrength: { value: 0 },
        uMouseRadius: { value: 112 },
        uGlowColor: { value: GLOW },
        uMinPx: { value: 2 },
      },
    });

    const points = new Points(this.geometry, this.material);
    points.frustumCulled = false;
    this.scene.add(points);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();

    this.intersection = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
    });
    this.intersection.observe(container);

    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', this.onPointerLeave);
  }

  /** WebGL support check, used to fall back to the static SVGs. */
  static isSupported() {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch {
      return false;
    }
  }

  private resize() {
    const { clientWidth: w, clientHeight: h } = this.container;
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h);
    this.material.uniforms.uPxScale.value = (w / ART_WIDTH) * dpr;
    this.material.uniforms.uMinPx.value = 2.2 * dpr;
  }

  private onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const rect = this.container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * ART_WIDTH;
    const y = ((e.clientY - rect.top) / rect.height) * ART_HEIGHT;
    const inside = x > -80 && x < ART_WIDTH + 80 && y > -80 && y < ART_HEIGHT + 80;
    this.mouseTarget.x = x;
    this.mouseTarget.y = y;
    this.mouseTarget.strength = inside ? 1 : 0;
    if (this.mouse.x < -9000) {
      this.mouse.x = x;
      this.mouse.y = y;
    }
  };

  private onPointerLeave = () => {
    this.mouseTarget.strength = 0;
  };

  /** Call every frame (hooked to gsap.ticker). */
  tick = (time: number) => {
    if (!this.visible) return;
    const u = this.material.uniforms;
    // eased follow → the displaced dots trail the cursor softly
    this.mouse.x += (this.mouseTarget.x - this.mouse.x) * 0.12;
    this.mouse.y += (this.mouseTarget.y - this.mouse.y) * 0.12;
    u.uMouse.value = [this.mouse.x, this.mouse.y];
    u.uMouseStrength.value += (this.mouseTarget.strength - u.uMouseStrength.value) * 0.06;
    u.uProgress.value = this.progress;
    u.uTime.value = time;
    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    window.removeEventListener('pointermove', this.onPointerMove);
    document.documentElement.removeEventListener('pointerleave', this.onPointerLeave);
    this.resizeObserver.disconnect();
    this.intersection.disconnect();
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
