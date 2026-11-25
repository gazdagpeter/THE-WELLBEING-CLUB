import { useLayoutEffect, useRef, useState } from 'react';
import { NavArrow } from '@/components/NavArrow/NavArrow';
import { testimonialsContent } from '@/content/testimonials';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { gsap } from '@/lib/gsap';
import './Testimonials.css';

/** „09 Rólunk mondták” – quotes cross-fade, the author's name is written out each time. */
export default function Testimonials() {
  const root = useRef<HTMLElement>(null);
  const slide = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const first = useRef(true);
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const c = testimonialsContent;
  const item = c.items[index];
  useScrollReveal(root);

  const go = (dir: 1 | -1) => {
    if (busy.current) return;
    const el = slide.current;
    const nextIndex = index + dir;
    if (nextIndex < 0 || nextIndex >= c.items.length) return;
    if (!el || reducedMotion) {
      setIndex(nextIndex);
      return;
    }
    busy.current = true;
    // out: the current quote drifts away softly, then the next one comes in (see effect)
    gsap.to(el, {
      autoAlpha: 0,
      x: -30 * dir,
      duration: 0.45,
      ease: 'power2.in',
      onComplete: () => {
        el.dataset.dir = String(dir);
        setIndex(nextIndex);
      },
    });
  };

  useLayoutEffect(() => {
    const el = slide.current;
    if (first.current || !el) {
      first.current = false;
      return;
    }
    const dir = Number(el.dataset.dir || 1);
    const tl = gsap.timeline({ onComplete: () => void (busy.current = false) });
    tl.fromTo(el, { autoAlpha: 0, x: 30 * dir }, { autoAlpha: 1, x: 0, duration: 0.7, ease: 'power3.out' });
    tl.fromTo(el.querySelector('.testimonials__author'), { '--reveal': '-10%' }, { '--reveal': '115%', duration: 1.2, ease: 'power1.inOut' }, 0.2);
  }, [index]);

  return (
    <section ref={root} className="testimonials" aria-labelledby="testimonials-title">
      <h2 id="testimonials-title" className="testimonials__title" data-reveal>
        {c.title}
      </h2>

      <div ref={slide} className="testimonials__slide" aria-live="polite">
        <blockquote className="testimonials__quote" data-reveal>
          {item.before}
          <span className="testimonials__script">{item.script}</span>
          {item.after}
        </blockquote>
        <p className="testimonials__author write-reveal" data-reveal>
          {item.author}
        </p>
        <p className="testimonials__detail" data-reveal>
          {item.detail}
        </p>
      </div>

      <div className="testimonials__nav" data-reveal>
        <NavArrow
          direction="prev"
          tone="light"
          className="testimonials__btn"
          onClick={() => go(-1)}
          aria-label={c.prevLabel}
          disabled={index === 0}
        />
        <NavArrow
          direction="next"
          tone="light"
          className="testimonials__btn"
          onClick={() => go(1)}
          aria-label={c.nextLabel}
          disabled={index === c.items.length - 1}
        />
      </div>
    </section>
  );
}
