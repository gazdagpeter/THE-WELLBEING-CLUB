import { useRef } from 'react';
import circle1 from '@/assets/pricing/circle-1.svg';
import circle2 from '@/assets/pricing/circle-2.svg';
import { Button } from '@/components/Button/Button';
import { pricingContent } from '@/content/pricing';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { gsap, useGSAP } from '@/lib/gsap';
import './Pricing.css';

/** „08 Árlista” – prices count up, lines draw, the private panel and its circles grow in. */
export default function Pricing() {
  const root = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const c = pricingContent;
  useScrollReveal(root);

  useGSAP(
    () => {
      if (reducedMotion) return;
      gsap.utils.toArray<HTMLElement>('[data-count]', root.current).forEach((el) => {
        const target = Number(el.dataset.count);
        const state = { v: 0 };
        gsap.to(state, {
          v: target,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = `${Math.round(state.v)} €`;
          },
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });
      // the two circles slide together into their overlap
      gsap.from('.pricing__circle--1', { xPercent: -25, autoAlpha: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: '.pricing__circles', start: 'top 85%', once: true } });
      gsap.from('.pricing__circle--2', { xPercent: 25, autoAlpha: 0, duration: 1.4, delay: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.pricing__circles', start: 'top 85%', once: true } });
    },
    { scope: root, dependencies: [reducedMotion] },
  );

  return (
    <section ref={root} className="pricing" id="arak" aria-labelledby="pricing-title">
      <h2 id="pricing-title" className="pricing__title" data-reveal>
        {c.title.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </h2>
      <p className="pricing__intro" data-reveal>
        {c.intro}
      </p>

      <div className="pricing__group">
        <h3 className="pricing__subtitle" data-reveal>
          {c.groupTitle}
        </h3>
        <ul className="pricing__list">
          {c.group.map((row, i) => (
            <li key={row.label} className={`pricing__row pricing__row--${i + 1}`}>
              {i > 0 && <span className="pricing__line" data-reveal="line" data-reveal-group={`row${i}`} aria-hidden="true" />}
              <span className="pricing__label" data-reveal="left" data-reveal-group={`row${i}`}>
                {row.label}
              </span>
              <span className="pricing__price" data-count={row.price} data-reveal data-reveal-group={`row${i}`}>
                {row.price} €
              </span>
            </li>
          ))}
        </ul>
        <div className="pricing__group-cta" data-reveal>
          <Button href={c.groupCta.href}>{c.groupCta.label}</Button>
        </div>
      </div>

      <div className="pricing__panel" data-reveal="scale">
        <h3 className="pricing__panel-title">{c.privateTitle}</h3>
        <div className="pricing__circles">
          {c.private.map((p, i) => (
            <div key={p.label} className={`pricing__circle pricing__circle--${i + 1}`}>
              <img src={i === 0 ? circle1 : circle2} alt="" aria-hidden="true" />
              <span className="pricing__circle-price" data-count={p.price}>
                {p.price} €
              </span>
              <span className="pricing__circle-label">{p.label}</span>
            </div>
          ))}
        </div>
        <p className="pricing__panel-text">{c.privateText}</p>
        <div className="pricing__panel-cta">
          <Button variant="secondary" href={c.privateCta.href}>
            {c.privateCta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
