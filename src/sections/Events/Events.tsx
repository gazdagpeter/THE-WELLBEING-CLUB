import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import glowRose from '@/assets/events/glow-rose.svg';
import iconLocationLight from '@/assets/events/icon-location-light.svg';
import iconLocationDark from '@/assets/events/icon-location-dark.svg';
import navPrev from '@/assets/events/nav-prev.svg';
import navNext from '@/assets/events/nav-next.svg';
import { Button } from '@/components/Button/Button';
import { eventsContent } from '@/content/events';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { gsap, useGSAP } from '@/lib/gsap';
import './Events.css';

type Slot = { x: number; y: number; rotation: number };

/** Card centres + tilt in Figma units (1920 frame): left, centre, right. */
const DESKTOP_SLOTS: Slot[] = [
  { x: 903.24, y: 557.76, rotation: -5 },
  { x: 1215.1, y: 490.6, rotation: 2 },
  { x: 1549.9, y: 584.1, rotation: 5 },
];

const CENTER = 1;

function computeSlots(stage: HTMLElement, card: HTMLElement): Slot[] {
  if (window.matchMedia('(min-width: 1200px)').matches) {
    // 1rem = 10 Figma px on desktop (see tokens.css)
    const k = parseFloat(getComputedStyle(document.documentElement).fontSize) / 10;
    return DESKTOP_SLOTS.map((s) => ({ x: s.x * k, y: s.y * k, rotation: s.rotation }));
  }
  const w = stage.clientWidth;
  const h = stage.clientHeight;
  const d = Math.min(w * 0.4, card.offsetWidth * 0.92);
  return [
    { x: w / 2 - d, y: h / 2 + 28, rotation: -5 },
    { x: w / 2, y: h / 2, rotation: 2 },
    { x: w / 2 + d, y: h / 2 + 40, rotation: 5 },
  ];
}

/** „04 Közelgő események” – revealed underneath the previous block, 3-card carousel. */
export default function Events() {
  const root = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLUListElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const placed = useRef(false);
  const prevOrder = useRef<number[]>([0, 1, 2]);
  const reducedMotion = usePrefersReducedMotion();
  const animated = !reducedMotion;
  /** slot → card index (0 = left, 1 = centre, 2 = right) */
  const [order, setOrder] = useState([0, 1, 2]);
  const c = eventsContent;

  const next = useCallback(() => setOrder((o) => [o[1], o[2], o[0]]), []);
  const prev = useCallback(() => setOrder((o) => [o[2], o[0], o[1]]), []);

  /* ───────── place / rotate the cards ───────── */
  const place = useCallback(
    (instant: boolean) => {
      const stageEl = stage.current;
      const first = cards.current[0];
      if (!stageEl || !first) return;
      const slots = computeSlots(stageEl, first);
      const before = prevOrder.current;

      cards.current.forEach((card, index) => {
        if (!card) return;
        const slot = order.indexOf(index);
        const from = before.indexOf(index);
        // the card travelling from one side to the other passes behind the others
        const wraps = Math.abs(slot - from) === 2;
        const { x, y, rotation } = slots[slot];
        gsap.set(card, { zIndex: slot === CENTER ? 3 : wraps ? 0 : 1 });
        if (instant || !animated) {
          gsap.set(card, { x, y, rotation, xPercent: -50, yPercent: -50 });
          return;
        }
        gsap.to(card, {
          keyframes: wraps
            ? [
                { x: (x + Number(gsap.getProperty(card, 'x'))) / 2, y: y + 70, scale: 0.9, duration: 0.5, ease: 'power2.in' },
                { x, y, rotation, scale: 1, duration: 0.6, ease: 'power3.out' },
              ]
            : [{ x, y, rotation, duration: 1, ease: 'power3.inOut' }],
          overwrite: true,
        });
      });
      prevOrder.current = order;
    },
    [order, animated],
  );

  useLayoutEffect(() => {
    place(!placed.current);
    placed.current = true;
  }, [place]);

  useLayoutEffect(() => {
    const stageEl = stage.current;
    if (!stageEl) return;
    const ro = new ResizeObserver(() => place(true));
    ro.observe(stageEl);
    return () => ro.disconnect();
  }, [place]);

  /* ───────── scroll: revealed underneath the previous block (parallax) ───────── */
  useGSAP(
    () => {
      if (!animated || !inner.current) return;
      const q = gsap.utils.selector(root);

      gsap.fromTo(
        inner.current,
        { y: () => -window.innerHeight * 0.55 },
        {
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top bottom',
            end: 'top top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );

      // contents emerge gradually while the block is uncovered
      gsap.fromTo(
        q('[data-emerge]'),
        { autoAlpha: 0, y: 60 },
        {
          autoAlpha: 1,
          y: 0,
          ease: 'power1.out',
          stagger: 0.12,
          scrollTrigger: { trigger: root.current, start: 'top 75%', end: 'top 10%', scrub: 0.8 },
        },
      );
    },
    { scope: root, dependencies: [animated] },
  );

  return (
    <section ref={root} className="events" id="esemenyek" aria-labelledby="events-title">
      <div ref={inner} className="events__inner">
        <div className="events__bg" aria-hidden="true">
          <img className="events__glow" src={glowRose} alt="" />
        </div>

        <div className="events__copy" data-emerge>
          <h2 id="events-title" className="events__title">
            {c.title}
          </h2>
          <p className="events__intro">{c.intro}</p>
          <Button variant="text" href={c.all.href}>
            {c.all.label}
          </Button>
        </div>

        <div className="events__nav" data-emerge>
          <button type="button" className="events__nav-btn events__nav-btn--prev" onClick={prev} aria-label={c.prevLabel}>
            <img src={navPrev} alt="" width={24} height={24} />
          </button>
          <button type="button" className="events__nav-btn events__nav-btn--next" onClick={next} aria-label={c.nextLabel}>
            <img src={navNext} alt="" width={24} height={24} />
          </button>
        </div>

        <div className="events__stage-wrap" data-emerge>
          <ul ref={stage} className="events__stage">
            {c.items.map((item, index) => {
              const slot = order.indexOf(index);
              const theme = slot === CENTER ? 'puder' : 'bordo';
              return (
                <li
                  key={item.title}
                  ref={(el) => {
                    cards.current[index] = el;
                  }}
                  className="event-card"
                  data-theme={theme}
                  data-slot={slot}
                  onClick={(e) => {
                    // a side card clicked (not its button) → bring it to the centre
                    if ((e.target as HTMLElement).closest('a')) return;
                    if (slot === 0) prev();
                    if (slot === 2) next();
                  }}
                >
                  <article className="event-card__body">
                    <div className="event-card__photo">
                      <img src={item.image} alt={item.imageAlt} loading="lazy" />
                    </div>
                    <div className="event-card__content">
                      <p className="event-card__date">{item.date}</p>
                      <h3 className="event-card__title">{item.title}</h3>
                      <p className="event-card__text">{item.text}</p>
                      <p className="event-card__place">
                        <span className="event-card__place-icon" aria-hidden="true">
                          <img className="is-light" src={iconLocationLight} alt="" width={16} height={16} />
                          <img className="is-dark" src={iconLocationDark} alt="" width={16} height={16} />
                        </span>
                        {item.place}
                      </p>
                      <div className="event-card__cta">
                        <Button
                          variant={theme === 'puder' ? 'primary' : 'secondary'}
                          href={c.ctaHref}
                          tabIndex={slot === CENTER ? 0 : -1}
                        >
                          {c.cta}
                        </Button>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
