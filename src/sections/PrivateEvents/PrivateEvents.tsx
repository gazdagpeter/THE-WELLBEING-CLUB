import { useRef, type CSSProperties } from 'react';
import { Button } from '@/components/Button/Button';
import { privateEventsContent } from '@/content/privateEvents';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { gsap, useGSAP } from '@/lib/gsap';
import './PrivateEvents.css';

/** Figma px per second */
const SPEED = 40;

/** „07 Privát és céges rendezvények” – slides over the previous block, endless slow card loop. */
export default function PrivateEvents() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const c = privateEventsContent;

  useGSAP(
    () => {
      if (reducedMotion || !root.current || !track.current) return;
      const q = gsap.utils.selector(root);
      const trackEl = track.current;

      // parallax: the previous block lags behind while this one slides over it
      const prevBlock = root.current.previousElementSibling as HTMLElement | null;
      if (prevBlock) {
        gsap.fromTo(
          prevBlock,
          { y: 0 },
          {
            y: () => window.innerHeight * 0.45,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top top', scrub: true, invalidateOnRefresh: true },
          },
        );
      }

      // texts fade in
      gsap.from(q('[data-private-fade]'), {
        autoAlpha: 0,
        y: 30,
        duration: 1.2,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
      });

      // endless loop: the set is rendered twice, so shifting by one set width is seamless
      const state = { speed: 1, x: 0 };
      const tick = (_t: number, dt: number) => {
        const setWidth = trackEl.scrollWidth / 2;
        if (!setWidth) return;
        // 1 Figma px on screen, measured from the first card (300 Figma px wide)
        const first = trackEl.querySelector<HTMLElement>('.private__card');
        const unit = first ? first.offsetWidth / c.items[0].w : 1;
        state.x -= (SPEED * unit * dt * state.speed) / 1000;
        if (state.x <= -setWidth) state.x += setWidth;
        gsap.set(trackEl, { x: state.x });
      };
      gsap.ticker.add(tick);

      // hovering the cards eases the loop to a stop, leaving lets it glide again
      const slow = () => gsap.to(state, { speed: 0, duration: 0.8, ease: 'power2.out', overwrite: true });
      const go = () => gsap.to(state, { speed: 1, duration: 1.2, ease: 'power2.inOut', overwrite: true });
      trackEl.addEventListener('mouseenter', slow);
      trackEl.addEventListener('mouseleave', go);

      return () => {
        gsap.ticker.remove(tick);
        trackEl.removeEventListener('mouseenter', slow);
        trackEl.removeEventListener('mouseleave', go);
      };
    },
    { scope: root, dependencies: [reducedMotion] },
  );

  const cards = (copy: number) =>
    c.items.map((item) => (
      <li
        key={`${copy}-${item.name}`}
        className="private__card"
        aria-hidden={copy > 0}
        style={{ '--w': item.w, '--h': item.h, '--offset': item.offset } as CSSProperties}
      >
        <div className="private__photo">
          <img src={item.image} alt="" loading="lazy" />
        </div>
        <h3 className="private__name">{item.name}</h3>
        <p className="private__text">{item.text}</p>
      </li>
    ));

  return (
    <section ref={root} className="private" id="rendezvenyek" aria-labelledby="private-title">
      <h2 id="private-title" className="private__title" data-private-fade>
        {c.title.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h2>
      <p className="private__intro" data-private-fade>
        {c.intro}
      </p>

      <div className="private__row">
        <div ref={track} className="private__track">
          <ul className="private__set">{cards(0)}</ul>
          <ul className="private__set" aria-hidden="true">
            {cards(1)}
          </ul>
        </div>
      </div>

      <div className="private__cta" data-private-fade>
        <Button variant="secondary" href={c.cta.href}>
          {c.cta.label}
        </Button>
      </div>
    </section>
  );
}
