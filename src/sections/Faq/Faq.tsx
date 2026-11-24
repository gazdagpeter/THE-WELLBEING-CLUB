import { useId, useRef, useState, type CSSProperties } from 'react';
import iconOpen from '@/assets/faq/icon-open.svg';
import iconClose from '@/assets/faq/icon-close.svg';
import motionSvg from '@/assets/faq/motion-figure.svg';
import { Button } from '@/components/Button/Button';
import { faqContent } from '@/content/faq';
import { useDotFigure } from '@/hooks/useDotFigure';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { gsap, useGSAP } from '@/lib/gsap';
import { motionFigure } from '@/three/figures';
import './Faq.css';

/** „10 GYIK” – staggered question pills, soft accordion, movement silhouette drawn from dots. */
export default function Faq() {
  const root = useRef<HTMLElement>(null);
  const figureHost = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const animated = !reducedMotion;
  const { figure, webgl } = useDotFigure(figureHost, motionFigure, animated);
  const [open, setOpen] = useState(0);
  const baseId = useId();
  const c = faqContent;
  useScrollReveal(root);

  useGSAP(
    () => {
      if (!animated || !figure.current) return;
      gsap.fromTo(
        figure.current,
        { progress: 0 },
        { progress: 1, ease: 'none', scrollTrigger: { trigger: figureHost.current, start: 'top 85%', end: 'center 45%', scrub: 1 } },
      );
    },
    { scope: root, dependencies: [animated, webgl] },
  );

  return (
    <section ref={root} className="faq" aria-labelledby="faq-title">
      <div className="faq__copy">
        <h2 id="faq-title" className="faq__title" data-reveal>
          {c.title}
        </h2>
        <p className="faq__intro" data-reveal>
          {c.intro}
        </p>
        <div data-reveal>
          <Button href={c.cta.href}>{c.cta.label}</Button>
        </div>
      </div>

      <div className="faq__figure" aria-hidden="true">
        <div ref={figureHost} className="faq__figure-canvas">
          {!webgl && <img src={motionSvg} alt="" width={649.409} height={487.083} />}
        </div>
      </div>

      <ul className="faq__list">
        {c.items.map((item, i) => {
          const isOpen = open === i;
          const id = `${baseId}-${i}`;
          return (
            <li key={item.q} className={`faq__item${isOpen ? ' is-open' : ''}`} style={{ '--shift': item.shift } as CSSProperties}>
              <button
                type="button"
                className="faq__q"
                aria-expanded={isOpen}
                aria-controls={id}
                onClick={() => setOpen(isOpen ? -1 : i)}
                data-reveal="left"
                data-reveal-group="faq"
              >
                <span>{item.q}</span>
                <span className="faq__icon" aria-hidden="true">
                  <img className="faq__icon-open" src={iconOpen} alt="" width={36} height={36} />
                  <img className="faq__icon-close" src={iconClose} alt="" width={36} height={36} />
                </span>
              </button>
              <div className="faq__a-wrap" id={id} role="region" aria-hidden={!isOpen}>
                <div className="faq__a-inner">
                  <p className="faq__a">{item.a}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
