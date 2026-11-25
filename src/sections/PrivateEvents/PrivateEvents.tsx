import { useRef, type CSSProperties } from 'react';
import { Button } from '@/components/Button/Button';
import { privateEventsContent } from '@/content/privateEvents';
import { useDragLoop } from '@/hooks/useDragLoop';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { gsap, useGSAP } from '@/lib/gsap';
import './PrivateEvents.css';

/** Figma px per second */
const SPEED = 40;

/** „07 Privát és céges rendezvények” – slides over the previous block, endless slow card loop that can be swiped by hand. */
export default function PrivateEvents() {
  const root = useRef<HTMLElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const c = privateEventsContent;

  // endless slow card loop – swipeable by hand, a photo under the mouse eases it to a stop
  useDragLoop(row, track, {
    enabled: !reducedMotion,
    pauseOnHover: '.private__photo',
    speed: () => {
      // SPEED Figma px per second, measured from the first card
      const first = track.current?.querySelector<HTMLElement>('.private__card');
      return first ? (SPEED * first.offsetWidth) / c.items[0].w : SPEED;
    },
  });

  useGSAP(
    () => {
      if (reducedMotion || !root.current) return;
      const q = gsap.utils.selector(root);

      // parallax: the previous block lags behind while this one slides over it
      const prevBlock = root.current.previousElementSibling as HTMLElement | null;
      if (prevBlock) {
        gsap.fromTo(
          prevBlock,
          { y: 0 },
          {
            // a lighter lag on small screens – the previous block stays readable longer
            y: () => window.innerHeight * (window.innerWidth < 1200 ? 0.25 : 0.45),
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
          <img src={item.image} alt="" loading="lazy" draggable={false} />
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

      <div ref={row} className={`private__row${reducedMotion ? ' is-static' : ''}`}>
        <div ref={track} className="private__track">
          <ul className="private__set">{cards(0)}</ul>
          {!reducedMotion && (
            <ul className="private__set" aria-hidden="true">
              {cards(1)}
            </ul>
          )}
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
