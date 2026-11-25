import { useRef } from 'react';
import glowRose from '@/assets/instructor/glow-rose.svg';
import echoSvg from '@/assets/instructor/echo-figure.svg';
import { Button } from '@/components/Button/Button';
import { instructorContent } from '@/content/instructor';
import { useDotFigure } from '@/hooks/useDotFigure';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { gsap, useGSAP } from '@/lib/gsap';
import { echoFigure } from '@/three/figures';
import './Instructor.css';

/** „08 Az oktató” – dot silhouette draws first, then the photo fades over it with the texts. */
export default function Instructor() {
  const root = useRef<HTMLElement>(null);
  const figureHost = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const animated = !reducedMotion;
  const { figure, webgl } = useDotFigure(figureHost, echoFigure, animated);
  const c = instructorContent;

  useGSAP(
    () => {
      if (!animated) return;
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      // desktop: the block is held in place while the sequence plays, so the silhouette
      // only starts drawing once the whole block is on screen
      mm.add('(min-width: 1200px)', () => {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: root.current, start: 'top top', end: '+=900', pin: true, scrub: 0.8 },
        });
        // 1 · silhouette assembles from dots
        if (figure.current) tl.fromTo(figure.current, { progress: 0 }, { progress: 1, duration: 0.6 }, 0);
        // 2 · photo fades over it, texts appear meanwhile
        tl.fromTo(q('.instructor__photo'), { autoAlpha: 0, scale: 1.03 }, { autoAlpha: 1, scale: 1, duration: 0.4 }, 0.55);
        tl.fromTo(q('[data-instructor-fade]'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.25, stagger: 0.06 }, 0.6);
        // 3 · the name is written out
        tl.fromTo(q('.instructor__name'), { '--reveal': '-10%' }, { '--reveal': '115%', duration: 0.3 }, 0.75);
      });

      // mobile / tablet: the block is taller than the screen – no pinning. Each part
      // plays once as it scrolls into view: texts rise in, the silhouette is drawn,
      // the photo settles over it, then the name is written out.
      mm.add('(max-width: 1199.98px)', () => {
        q('[data-instructor-fade]').forEach((el) => {
          gsap.from(el, {
            autoAlpha: 0,
            y: 28,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          });
        });
        const tl = gsap.timeline({ scrollTrigger: { trigger: q('.instructor__art')[0], start: 'top 75%', once: true } });
        if (figure.current) tl.fromTo(figure.current, { progress: 0 }, { progress: 1, duration: 2, ease: 'power1.inOut' }, 0);
        tl.fromTo(q('.instructor__photo'), { autoAlpha: 0, scale: 1.04 }, { autoAlpha: 1, scale: 1, duration: 1.2, ease: 'power2.out' }, 1.2);
        tl.fromTo(q('.instructor__name'), { '--reveal': '-10%' }, { '--reveal': '115%', duration: 1.6, ease: 'power1.inOut' }, 1.6);
      });
    },
    { scope: root, dependencies: [animated, webgl] },
  );

  return (
    <section ref={root} className="instructor" aria-labelledby="instructor-title">
      <img className="instructor__glow" src={glowRose} alt="" aria-hidden="true" />
      {/* desktop: `display: contents` (pieces placed on the section) · mobile: one block below the title */}
      <div className="instructor__art">
        <div className="instructor__figure" aria-hidden="true">
          <div ref={figureHost} className="instructor__figure-canvas">
            {!webgl && <img src={echoSvg} alt="" width={1475.68} height={970.213} />}
          </div>
        </div>
        <img className="instructor__photo" src={c.photo} alt={c.photoAlt} loading="lazy" />
      </div>
      <p className="instructor__name write-reveal">
        {c.name.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>

      <div className="instructor__copy">
        <h2 id="instructor-title" className="instructor__title" data-instructor-fade>
          {c.title}
        </h2>
        <p className="instructor__lead" data-instructor-fade>
          {c.lead}
        </p>
        <p className="instructor__text" data-instructor-fade>
          {c.text}
        </p>
        <div className="instructor__cta" data-instructor-fade>
          <Button href={c.cta.href}>{c.cta.label}</Button>
        </div>
      </div>
    </section>
  );
}
