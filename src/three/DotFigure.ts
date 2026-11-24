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

/** Raw sRGB components – the shader writes them straight to the sRGB canvas. */
function srgb(hex: string): [number, number, number] {
  const out = { r: 0, g: 0, b: 0 };
  new Color(hex).getRGB(out, SRGBColorSpace);
  return [out.r, out.g, out.b];
}

const GLOW = srgb('#d8b4b8');

export type Particle = {
  x: number;
  y: number;
  r: number;
  color: string;
  /** 0–1, e.g. the 40 % „lágy réteg” */
  alpha: number;
  glow: boolean;
  /** formation order, 0 (first) – 1 (last) */
  delay: number;
};

export type FigureConfig = {
  /** art board size in Figma units – the canvas covers this box */
  width: number;
  height: number;
  particles: Particle[];
  /** cursor influence radius in art units */
  mouseRadius?: number;
};

const vertexShader = /* glsl */ `
  attribute vec2 aStart;
  attribute float aRadius;
  attribute float aDelay;
  attribute float aGlow;
  attribute float aSeed;
  attribute vec3 aColor;
  attribute float aAlpha;

  uniform float uProgress;
  uniform float uDisperse;
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

    // dispersal: the figure breaks up into a drifting cloud and fades away
    float seedAngle = aSeed * 43.98;
    vec2 away = vec2(cos(seedAngle), sin(seedAngle) * 0.8 - 0.35);
    float dispEase = uDisperse * uDisperse * (3.0 - 2.0 * uDisperse);
    p += away * dispEase * (90.0 + aSeed * 320.0);

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
    vAlpha = smoothstep(0.0, 0.35, t) * aAlpha * (1.0 - smoothstep(0.15, 0.95, uDisperse));
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

/**
 * Dot figure: thousands of dots assemble into a silhouette,
 * react to the pointer (repel + spring back) and can disperse.
 */
export class DotFigure {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera: OrthographicCamera;
  private width: number;
  private height: number;
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
  /** Dispersal 0 → 1 (animate with GSAP). */
  disperse = 0;
  private renderedDisperse = 0;

  constructor(container: HTMLElement, config: FigureConfig) {
    this.container = container;
    this.width = config.width;
    this.height = config.height;
    this.camera = new OrthographicCamera(0, config.width, 0, config.height, -1, 1);
    this.renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(this.renderer.domElement);

    const { particles } = config;
    const count = particles.length;
    const position = new Float32Array(count * 3);
    const start = new Float32Array(count * 2);
    const radius = new Float32Array(count);
    const delay = new Float32Array(count);
    const glow = new Float32Array(count);
    const seed = new Float32Array(count);
    const alpha = new Float32Array(count);
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
      alpha[i] = p.alpha;
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
    this.geometry.setAttribute('aAlpha', new BufferAttribute(alpha, 1));

    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: NormalBlending,
      uniforms: {
        uProgress: { value: 0 },
        uDisperse: { value: 0 },
        uTime: { value: 0 },
        uPxScale: { value: 1 },
        uMouse: { value: [-9999, -9999] },
        uMouseStrength: { value: 0 },
        uMouseRadius: { value: config.mouseRadius ?? 112 },
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
    this.material.uniforms.uPxScale.value = (w / this.width) * dpr;
    this.material.uniforms.uMinPx.value = 2.2 * dpr;
  }

  private onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const rect = this.container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * this.width;
    const y = ((e.clientY - rect.top) / rect.height) * this.height;
    const inside = x > -80 && x < this.width + 80 && y > -80 && y < this.height + 80;
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
    // fully dispersed & already drawn that way → nothing to render
    if (!this.visible || (this.disperse >= 1 && this.renderedDisperse >= 1)) return;
    this.renderedDisperse = this.disperse;
    const u = this.material.uniforms;
    // eased follow → the displaced dots trail the cursor softly
    this.mouse.x += (this.mouseTarget.x - this.mouse.x) * 0.12;
    this.mouse.y += (this.mouseTarget.y - this.mouse.y) * 0.12;
    u.uMouse.value = [this.mouse.x, this.mouse.y];
    u.uMouseStrength.value += (this.mouseTarget.strength - u.uMouseStrength.value) * 0.06;
    u.uProgress.value = this.progress;
    u.uDisperse.value = this.disperse;
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
