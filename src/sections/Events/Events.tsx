import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import glowRose from '@/assets/events/glow-rose.svg';
import iconLocationLight from '@/assets/events/icon-location-light.svg';
import iconLocationDark from '@/assets/events/icon-location-dark.svg';
import navPrev from '@/assets/events/nav-prev.svg';
import navNext from '@/assets/events/nav-next.svg';
import arrowLight from '@/assets/hero/arrow-light.svg';
import arrowBordo from '@/assets/hero/arrow-bordo.svg';
import { Button } from '@/components/Button/Button';
import { eventsContent } from '@/content/events';
import { useMediaQuery } from '@/hooks/useMediaQuery';
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
const DESKTOP = '(min-width: 1200px)';

function desktopSlots(): Slot[] {
  // 1rem = 10 Figma px on desktop (see tokens.css)
  const k = parseFloat(getComputedStyle(document.documentElement).fontSize) / 10;
  return DESKTOP_SLOTS.map((s) => ({ x: s.x * k, y: s.y * k, rotation: s.rotation }));
}

/** „04 Közelgő események” – revealed underneath the previous block, 3-card carousel. */
export default function Events() {
  const root = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLUListElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const placed = useRef(false);
  const prevOrder = useRef<number[]>([0, 1, 2]);
  /** true while the cards are rotating – clicks are ignored, hover is frozen */
  const busy = useRef(false);
  const reducedMotion = usePrefersReducedMotion();
  const animated = !reducedMotion;
  /** desktop: tilted 3-card stack · below: side-by-side swipe row */
  const isDesktop = useMediaQuery(DESKTOP);
  /** slot → card index (0 = left, 1 = centre, 2 = right) */
  const [order, setOrder] = useState([0, 1, 2]);
  const c = eventsContent;

  /** mobile / tablet: page the native scroller one card at a time */
  const scrollByCard = useCallback((dir: 1 | -1) => {
    const stageEl = stage.current;
    const list = cards.current.filter((card): card is HTMLElement => !!card);
    if (!stageEl || !list.length) return;
    // scroll exactly onto the neighbouring card's snap point (no fight with scroll-snap)
    const pad = parseFloat(getComputedStyle(stageEl).paddingLeft) || 0;
    const current = list.reduce(
      (best, card, i) =>
        Math.abs(card.offsetLeft - pad - stageEl.scrollLeft) <
        Math.abs(list[best].offsetLeft - pad - stageEl.scrollLeft)
          ? i
          : best,
      0,
    );
    const target = list[Math.min(list.length - 1, Math.max(0, current + dir))];
    stageEl.scrollTo({ left: target.offsetLeft - pad, behavior: 'smooth' });
  }, []);

  const next = useCallback(() => {
    if (isDesktop) {
      if (busy.current) return;
      setOrder((o) => [o[1], o[2], o[0]]);
    }
    else scrollByCard(1);
  }, [isDesktop, scrollByCard]);
  const prev = useCallback(() => {
    if (isDesktop) {
      if (busy.current) return;
      setOrder((o) => [o[2], o[0], o[1]]);
    }
    else scrollByCard(-1);
  }, [isDesktop, scrollByCard]);

  /* ───────── place / rotate the cards ───────── */
  const place = useCallback(
    (instant: boolean) => {
      if (!isDesktop) {
        // swipe row: cards sit in normal flow
        cards.current.forEach((card) => card && gsap.set(card, { clearProps: 'transform,zIndex' }));
        return;
      }
      const slots = desktopSlots();
      const before = prevOrder.current;
      const stageEl = stage.current;
      const moving = !instant && animated && before.some((card, slot) => order[slot] !== card);
      const DURATION = 1.1;

      if (moving && stageEl) {
        // freeze hover effects while cards travel under the cursor (no jitter)
        busy.current = true;
        stageEl.classList.add('is-rotating');
        gsap.delayedCall(DURATION, () => {
          busy.current = false;
          stageEl.classList.remove('is-rotating');
        });
      }

      cards.current.forEach((card, index) => {
        if (!card) return;
        const slot = order.indexOf(index);
        const from = before.indexOf(index);
        // the card travelling from one side to the other passes behind the others
        const wraps = Math.abs(slot - from) === 2;
        const { x, y, rotation } = slots[slot];
        const zIndex = slot === CENTER ? 3 : wraps ? 0 : 1;
        if (!moving) {
          gsap.set(card, { x, y, rotation, zIndex, xPercent: -50, yPercent: -50 });
          return;
        }
        // stacking changes when the cards actually cross (mid-way), not at the start
        if (wraps) gsap.set(card, { zIndex: 0 });
        else gsap.delayedCall(DURATION * 0.4, () => gsap.set(card, { zIndex }));
        gsap.to(card, {
          keyframes: wraps
            ? [
                { x: (x + Number(gsap.getProperty(card, 'x'))) / 2, y: y + 60, scale: 0.92, rotation: 0, duration: DURATION * 0.5, ease: 'sine.in' },
                { x, y, rotation, scale: 1, duration: DURATION * 0.5, ease: 'sine.out' },
              ]
            : [{ x, y, rotation, duration: DURATION, ease: 'power2.inOut' }],
          overwrite: true,
          onComplete: () => gsap.set(card, { zIndex }),
        });
      });
      prevOrder.current = order;
    },
    [order, animated, isDesktop],
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
              // Figma: every second card is Púder – on desktop the centre one
              const theme = (isDesktop ? slot === CENTER : index % 2 === 1) ? 'puder' : 'bordo';
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
                    if (!isDesktop || (e.target as HTMLElement).closest('a')) return;
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
                      {/* Gomb: Másodlagos on bordó, Elsődleges on púder – colours cross-fade with the card */}
                      <a
                        className="event-card__cta"
                        href={c.ctaHref}
                        tabIndex={!isDesktop || slot === CENTER ? 0 : -1}
                      >
                        <span>{c.cta}</span>
                        <span className="event-card__cta-icon" aria-hidden="true">
                          <img className="is-on-bordo" src={arrowBordo} alt="" width={18} height={18} />
                          <img className="is-on-puder" src={arrowLight} alt="" width={18} height={18} />
                        </span>
                      </a>
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
