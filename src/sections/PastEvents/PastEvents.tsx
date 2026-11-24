import { useRef } from 'react';
import navPrev from '@/assets/past/nav-prev.svg';
import navNext from '@/assets/past/nav-next.svg';
import { Button } from '@/components/Button/Button';
import { pastEventsContent } from '@/content/pastEvents';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { gsap, useGSAP } from '@/lib/gsap';
import './PastEvents.css';

/** „05 Korábbi események” – the photo rises from below and grows to full size, then the texts fade in. */
export default function PastEvents() {
  const root = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const c = pastEventsContent;
  const item = c.items[0];

  useGSAP(
    () => {
      if (reducedMotion) return;
      const q = gsap.utils.selector(root);
      const photo = q('.past__photo')[0];

      // 1 · photo comes up from below, smaller than final, and reaches full size when fully scrolled in
      gsap.fromTo(
        photo,
        { y: 160, scale: 0.78 },
        {
          y: 0,
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
        },
      );

      // 2 · then the texts and buttons in / around the photo fade in
      gsap.from(q('[data-past-fade]'), {
        autoAlpha: 0,
        y: 24,
        duration: 1.1,
        stagger: 0.12,
        ease: 'power3.out',
        // triggered by the (untransformed) section, so the start point is always reachable
        scrollTrigger: { trigger: root.current, start: 'bottom-=80 bottom', toggleActions: 'play none none reverse' },
      });
    },
    { scope: root, dependencies: [reducedMotion] },
  );

  return (
    <section ref={root} className="past" aria-labelledby="past-title">
      <h2 id="past-title" className="past__title" data-past-fade>
        {c.title}
      </h2>
      <div className="past__all" data-past-fade>
        <Button variant="text" href={c.all.href}>
          {c.all.label}
        </Button>
      </div>

      <div className="past__photo">
        <img src={item.image} alt={item.imageAlt} loading="lazy" />
        <div className="past__shade" aria-hidden="true" />
        <div className="past__info">
          <h3 className="past__name" data-past-fade>
            {item.title}
          </h3>
          <p className="past__meta" data-past-fade>
            {item.date}
          </p>
          <p className="past__meta" data-past-fade>
            {item.place}
          </p>
        </div>
        <div className="past__nav" data-past-fade>
          <button type="button" className="past__nav-btn past__nav-btn--prev" aria-label={c.prevLabel}>
            <img src={navPrev} alt="" width={36} height={36} />
          </button>
          <button type="button" className="past__nav-btn past__nav-btn--next" aria-label={c.nextLabel}>
            <img src={navNext} alt="" width={36} height={36} />
          </button>
        </div>
      </div>
    </section>
  );
}
