import { useRef } from 'react';
import glowRose from '@/assets/hero/glow-rose.svg';
import glowPowder from '@/assets/hero/glow-powder.svg';
import { Button } from '@/components/Button/Button';
import { Header } from '@/components/Header/Header';
import { heroContent } from '@/content/hero';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { HeroArt, type HeroArtHandle } from './HeroArt';
import './Hero.css';

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const art = useRef<HeroArtHandle>(null);
  const reducedMotion = usePrefersReducedMotion();
  const animated = !reducedMotion;

  useGSAP(
    () => {
      if (!animated) return;
      const q = gsap.utils.selector(root);
      const figure = art.current?.figure ?? null;

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // 0 · soft background glows
      tl.from(q('[data-anim="glow"]'), { autoAlpha: 0, duration: 2.4, ease: 'sine.out' }, 0);

      // 1 · the figure is drawn from dots
      if (figure) {
        tl.fromTo(figure, { progress: 0 }, { progress: 1, duration: 3, ease: 'none' }, 0.1);
      }
      tl.from(q('[data-anim="lines"]'), { autoAlpha: 0, duration: 1.4, ease: 'sine.out' }, 2.2);

      // 2 · header items left → right, softly floating down
      tl.from(
        q('[data-anim="header"]'),
        { autoAlpha: 0, y: -14, duration: 0.9, stagger: 0.08 },
        1.6,
      );

      // 3 · title: “Move and” fades in, “Connect.” is written out
      tl.from(q('[data-anim="title-fade"]'), { autoAlpha: 0, y: 24, duration: 1.4 }, 2.3);
      tl.fromTo(
        q('[data-anim="title-write"]'),
        { '--reveal': '-10%' },
        { '--reveal': '115%', duration: 2.4, ease: 'power1.inOut' },
        2.6,
      );

      // 4 · everything else fades in, photo columns float up in the background
      tl.from(
        q('[data-anim="column"]'),
        { autoAlpha: 0, yPercent: 14, duration: 1.8, stagger: 0.14, ease: 'power3.out' },
        3.1,
      );
      tl.from(
        q('[data-anim="column-img"]'),
        { scale: 1.18, duration: 2.2, stagger: 0.14, ease: 'power2.out' },
        3.1,
      );
      tl.from(q('[data-anim="fade"]'), { autoAlpha: 0, y: 20, duration: 1.2, stagger: 0.12 }, 3.4);

      // 5 · scrolling away: the dot silhouette breaks up and fades
      //     while the photo column grows into the next section
      const disperse = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
        },
      });
      if (figure) disperse.fromTo(figure, { disperse: 0 }, { disperse: 1, ease: 'none' }, 0);
      disperse.to(q('[data-disperse]'), { autoAlpha: 0, ease: 'power1.in' }, 0);

      // fonts change the layout → recalculate scroll positions
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: root, dependencies: [animated] },
  );

  const c = heroContent;

  return (
    <section ref={root} className="hero" aria-labelledby="hero-title">
      <div className="hero__bg" aria-hidden="true">
        <img className="hero__glow hero__glow--rose" src={glowRose} alt="" data-anim="glow" />
        <img className="hero__glow hero__glow--powder" src={glowPowder} alt="" data-anim="glow" />
      </div>

      <Header />

      <div className="hero__stage">
        <div className="hero__art">
          <HeroArt ref={art} animated={animated} />
        </div>

        <h1 id="hero-title" className="hero__title">
          <span className="hero__title-line1" data-anim="title-fade">
            {c.titleLine1}
          </span>{' '}
          <span className="hero__title-line2 write-reveal" data-anim="title-write">
            {c.titleLine2}
          </span>
        </h1>

        <div className="hero__intro">
          <p className="hero__lead" data-anim="fade">
            {c.lead}
          </p>
          <div className="hero__actions" data-anim="fade">
            <Button href={c.primaryCta.href}>{c.primaryCta.label}</Button>
            <Button href={c.secondaryCta.href} variant="text">
              {c.secondaryCta.label}
            </Button>
          </div>
        </div>

        <a className="hero__scroll" href="#rolunk" data-anim="fade">
          <span>{c.scroll}</span>
          <span className="hero__scroll-line" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
