import { useRef } from 'react';
import photoWide from '@/assets/intro/studio-photo-wide.webp';
import glowTransition from '@/assets/intro/glow-transition.svg';
import glowTransitionPowder from '@/assets/intro/glow-transition-powder.svg';
import glowRose from '@/assets/intro/glow-rose.svg';
import glowClosing from '@/assets/intro/glow-closing.svg';
import glowMauve from '@/assets/intro/glow-mauve.svg';
import teaserSvg from '@/assets/intro/teaser-figure.svg';
import { Button } from '@/components/Button/Button';
import { introContent } from '@/content/intro';
import { useDotFigure } from '@/hooks/useDotFigure';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { gsap, useGSAP } from '@/lib/gsap';
import { teaserFigure } from '@/three/figures';
import { COLUMNS, COLUMN_W, PHOTO, TRANSITION_COLUMN } from '@/sections/Hero/heroGeometry';
import './Intro.css';

/** Natural aspect ratio of the studio photo (4096 × 2731 original). */
const PHOTO_ASPECT = 2400 / 1600;

type Box = { x: number; y: number; w: number; h: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** „02 Bemutatkozás” – the hero photo column grows into the large studio photo. */
export default function Intro() {
  const root = useRef<HTMLElement>(null);
  const fly = useRef<HTMLDivElement>(null);
  const flyImg = useRef<HTMLImageElement>(null);
  const target = useRef<HTMLDivElement>(null);
  const figureHost = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const animated = !reducedMotion;
  const { figure, webgl } = useDotFigure(figureHost, teaserFigure, animated);
  const c = introContent;

  useGSAP(
    () => {
      if (!animated || !root.current || !fly.current || !flyImg.current || !target.current) return;
      const section = root.current;
      const flyEl = fly.current;
      const img = flyImg.current;
      const targetEl = target.current;
      const q = gsap.utils.selector(root);

      /* ───────── 1 · hero column → large photo ───────── */

      const heroPhoto = document.querySelector<HTMLElement>('[data-hero-photo]');
      const heroColumn = document.querySelector<HTMLElement>('[data-transition-column]');
      const col = COLUMNS[TRANSITION_COLUMN];

      let from: Box & { dx: number; dy: number } = { x: 0, y: 0, w: 0, h: 0, dx: 0, dy: 0 };
      let to: Box & { r: number } = { x: 0, y: 0, w: 0, h: 0, r: 0 };

      const measure = () => {
        const s = section.getBoundingClientRect();
        const t = targetEl.getBoundingClientRect();
        to = {
          x: t.left - s.left,
          y: t.top - s.top,
          w: t.width,
          h: t.height,
          r: parseFloat(getComputedStyle(targetEl).borderTopLeftRadius) || 0,
        };
        if (!heroPhoto) {
          from = { ...to, dx: 0, dy: 0 };
          return;
        }
        const p = heroPhoto.getBoundingClientRect();
        const kx = p.width / PHOTO.w;
        const ky = p.height / PHOTO.h;
        from = {
          x: p.left - s.left + col.x * kx,
          y: p.top - s.top + col.y * ky,
          w: COLUMN_W * kx,
          h: col.h * ky,
          // keeps the crop identical to the hero column at the start
          dx: (PHOTO.w / 2 - (col.x + COLUMN_W / 2)) * kx,
          dy: (PHOTO.h / 2 - (col.y + col.h / 2)) * ky,
        };
      };

      const render = (t: number) => {
        const w = lerp(from.w, to.w, t);
        const h = lerp(from.h, to.h, t);
        const x = lerp(from.x, to.x, t);
        const y = lerp(from.y, to.y, t);
        const r = Math.min(lerp(from.w / 2, to.r, t), w / 2, h / 2);

        // object-fit: cover, computed by hand so the crop can be shifted
        const iw = w / h > PHOTO_ASPECT ? w : h * PHOTO_ASPECT;
        const ih = w / h > PHOTO_ASPECT ? w / PHOTO_ASPECT : h;

        flyEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        flyEl.style.width = `${w}px`;
        flyEl.style.height = `${h}px`;
        flyEl.style.borderRadius = `${r}px`;
        img.style.width = `${iw}px`;
        img.style.height = `${ih}px`;
        img.style.transform = `translate3d(${(w - iw) / 2 + from.dx * (1 - t)}px, ${(h - ih) / 2 + from.dy * (1 - t)}px, 0)`;

        const started = t > 0.001 || !heroPhoto;
        flyEl.style.visibility = started ? 'visible' : 'hidden';
        if (heroColumn) heroColumn.style.visibility = started ? 'hidden' : '';
      };

      const state = { t: 0 };
      measure();
      render(0);

      gsap.to(state, {
        t: 1,
        ease: 'power2.inOut',
        scrollTrigger: {
          start: 0,
          endTrigger: targetEl,
          end: 'center center',
          scrub: 0.6,
          invalidateOnRefresh: true,
          onRefresh: () => {
            measure();
            render(state.t);
          },
        },
        onUpdate: () => render(state.t),
      });

      /* ───────── 2 · texts fade in softly ───────── */

      gsap.from(q('[data-intro-fade]'), {
        autoAlpha: 0,
        y: 32,
        duration: 1.4,
        stagger: 0.14,
        ease: 'power3.out',
        scrollTrigger: { trigger: q('.intro__text')[0], start: 'top 82%', once: true },
      });

      /* ───────── 3 · the teaser silhouette assembles from dots ───────── */

      const teaser = figure.current;
      if (teaser) {
        gsap.fromTo(
          teaser,
          { progress: 0 },
          {
            progress: 1,
            ease: 'none',
            scrollTrigger: { trigger: figureHost.current, start: 'top 92%', end: 'center 50%', scrub: 1 },
          },
        );
      }

      /* ───────── 4 · colour shift: rosy glows → bordó closing state ─────────
       * Ends when the closing block sits like the Figma variant
       * „02 Bemutatkozás – zárás, bordó háttér”.                              */

      const tone = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: figureHost.current,
          start: 'top bottom',
          endTrigger: q('.intro__closing')[0],
          end: 'bottom 95%',
          scrub: true,
        },
      });
      tone
        .fromTo(q('[data-color-glow]'), { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.08 }, 0)
        .fromTo(q('[data-dark-bg]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.55 }, 0.45)
        .fromTo(q('[data-dark-glow]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45 }, 0.55)
        .to(q('[data-color-glow]'), { autoAlpha: 0, duration: 0.4 }, 0.6)
        .fromTo(q('.intro__closing-line1'), { color: '#590110' }, { color: '#f7f2ee', duration: 0.5 }, 0.5)
        .fromTo(q('.intro__closing-line2'), { color: '#590110' }, { color: '#d8b4b8', duration: 0.5 }, 0.5);
      if (teaser) tone.fromTo(teaser, { theme: 0 }, { theme: 1, duration: 0.5 }, 0.5);

      /* ───────── 5 · closing thought ───────── */

      const closing = gsap.timeline({
        scrollTrigger: { trigger: q('.intro__closing')[0], start: 'top 85%', once: true },
      });
      closing.from(q('[data-closing-fade]'), { autoAlpha: 0, y: 28, duration: 1.4, ease: 'power3.out' }, 0);
      closing.fromTo(
        q('[data-closing-write]'),
        { '--reveal': '-10%' },
        { '--reveal': '115%', duration: 2.6, ease: 'power1.inOut' },
        0.5,
      );
    },
    { scope: root, dependencies: [animated, webgl] },
  );

  return (
    <section ref={root} className="intro" id="rolunk" aria-labelledby="intro-title">
      <div className="intro__bg" aria-hidden="true">
        <img className="intro__glow intro__glow--transition" src={glowTransition} alt="" />
        <img className="intro__glow intro__glow--transition-powder" src={glowTransitionPowder} alt="" />
        <img className="intro__glow intro__glow--rose" src={glowRose} alt="" data-color-glow />
        <img className="intro__glow intro__glow--closing" src={glowClosing} alt="" data-color-glow />
        {animated && (
          <>
            <div className="intro__dark" data-dark-bg />
            <img className="intro__glow intro__glow--mauve" src={glowMauve} alt="" data-dark-glow />
          </>
        )}
      </div>

      {animated && (
        <div ref={fly} className="intro__fly" aria-hidden="true">
          <img ref={flyImg} src={photoWide} alt="" />
        </div>
      )}

      <div ref={target} className="intro__photo" role="img" aria-label={c.photoAlt}>
        {!animated && <img src={photoWide} alt="" />}
      </div>

      <div className="intro__text">
        <h2 id="intro-title" className="intro__heading" data-intro-fade>
          {c.heading}
        </h2>
        <div className="intro__body">
          {c.paragraphs.map((text) => (
            <p key={text} data-intro-fade>
              {text}
            </p>
          ))}
          <div className="intro__cta" data-intro-fade>
            <Button variant="secondary" href={c.cta.href}>
              {c.cta.label}
            </Button>
          </div>
        </div>
      </div>

      <div className="intro__figure" aria-hidden="true">
        <div ref={figureHost} className="intro__figure-canvas">
          {!webgl && <img src={teaserSvg} alt="" width={830.638} height={532.991} />}
        </div>
      </div>

      <div className="intro__closing">
        <p className="intro__closing-line1" data-closing-fade>
          {c.closingLine1}
        </p>
        <p className="intro__closing-line2 write-reveal" data-closing-write>
          {c.closingLine2}
        </p>
      </div>
    </section>
  );
}
