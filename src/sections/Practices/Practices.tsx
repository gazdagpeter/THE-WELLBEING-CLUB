import { useRef } from 'react';
import arrow from '@/assets/practices/arrow-light.svg';
import glowMauve from '@/assets/practices/glow-mauve.svg';
import balanceSvg from '@/assets/practices/balance-figure.svg';
import { Button } from '@/components/Button/Button';
import { practicesContent } from '@/content/practices';
import { useDotFigure } from '@/hooks/useDotFigure';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { gsap, useGSAP } from '@/lib/gsap';
import { balanceFigure } from '@/three/figures';
import './Practices.css';

/** „03 Mozgásformák” – list with hover photo, small-group fact, balance silhouette. */
export default function Practices() {
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const figureHost = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const animated = !reducedMotion;
  const { figure, webgl } = useDotFigure(figureHost, balanceFigure, animated);
  const c = practicesContent;

  /* ───────── scroll: elements fade in one by one, silhouette assembles ───────── */
  useGSAP(
    () => {
      if (!animated) return;
      const q = gsap.utils.selector(root);

      q('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          autoAlpha: 0,
          y: 36,
          duration: 1.3,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });

      // list rows: line draws, then the row fades in
      q('.practices__row').forEach((row) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 88%', once: true } });
        tl.from(row.querySelector('.practices__line'), { scaleX: 0, duration: 1.2, ease: 'power3.inOut' }, 0);
        tl.from(row.querySelectorAll('[data-row-part]'), { autoAlpha: 0, y: 26, duration: 1.1, stagger: 0.1, ease: 'power3.out' }, 0.2);
      });

      const balance = figure.current;
      if (balance) {
        gsap.fromTo(
          balance,
          { progress: 0 },
          {
            progress: 1,
            ease: 'none',
            scrollTrigger: { trigger: figureHost.current, start: 'top 92%', end: 'center 50%', scrub: 1 },
          },
        );
      }
    },
    { scope: root, dependencies: [animated, webgl] },
  );

  /* ───────── hover: the row lights up, the photo glides to it ───────── */
  const showRow = (index: number) => {
    const listEl = list.current;
    const photoEl = photo.current;
    if (!listEl || !photoEl) return;
    const row = listEl.children[index] as HTMLElement;
    if (!row) return;

    listEl.dataset.active = String(index);
    const y = row.offsetTop + row.offsetHeight / 2 - photoEl.offsetHeight / 2;
    const visible = photoEl.dataset.visible === 'true';
    photoEl.dataset.visible = 'true';

    photoEl.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
      gsap.to(img, {
        autoAlpha: Number(img.dataset.index) === index ? 1 : 0,
        scale: Number(img.dataset.index) === index ? 1 : 1.08,
        duration: animated ? 0.6 : 0,
        ease: 'power2.out',
      });
    });

    if (!visible) {
      gsap.set(photoEl, { y });
      gsap.fromTo(
        photoEl,
        { autoAlpha: 0, scale: 0.82, clipPath: 'inset(18% 0% 18% 0% round 999px)' },
        {
          autoAlpha: 1,
          scale: 1,
          clipPath: 'inset(0% 0% 0% 0% round 999px)',
          duration: animated ? 0.8 : 0,
          ease: 'power3.out',
        },
      );
    } else {
      gsap.to(photoEl, { y, duration: animated ? 0.75 : 0, ease: 'power3.out' });
    }
  };

  const hide = () => {
    const listEl = list.current;
    const photoEl = photo.current;
    if (!listEl || !photoEl) return;
    delete listEl.dataset.active;
    photoEl.dataset.visible = 'false';
    gsap.to(photoEl, {
      autoAlpha: 0,
      scale: 0.9,
      clipPath: 'inset(18% 0% 18% 0% round 999px)',
      duration: animated ? 0.5 : 0,
      ease: 'power2.in',
    });
  };

  return (
    <section ref={root} className="practices" id="orak" aria-labelledby="practices-title">
      <div className="practices__bg" aria-hidden="true">
        <img className="practices__glow" src={glowMauve} alt="" />
      </div>

      <h2 id="practices-title" className="practices__title" data-reveal>
        {c.title}
      </h2>
      <p className="practices__intro" data-reveal>
        {c.intro}
      </p>

      <div className="practices__list-wrap" onMouseLeave={hide}>
        <ul ref={list} className="practices__list">
          {c.items.map((item, i) => {
            // outer spans are revealed on scroll, inner `.practices__dim` spans carry the hover state
            const content = (
              <>
                <span className="practices__name" data-row-part>
                  <span className="practices__dim">{item.name}</span>
                  {'soon' in item && <span className="practices__soon">{item.soon}</span>}
                </span>
                <span className="practices__text" data-row-part>
                  <span className="practices__dim">{item.text}</span>
                </span>
                {'href' in item && (
                  <span className="practices__arrow" data-row-part>
                    <img className="practices__dim" src={arrow} alt="" width={32} height={32} />
                  </span>
                )}
              </>
            );
            return (
              <li key={item.name} className={`practices__row${'soon' in item ? ' is-soon' : ''}`}>
                <span className="practices__line" aria-hidden="true" />
                {'href' in item ? (
                  <a
                    className="practices__link"
                    href={item.href}
                    onMouseEnter={() => showRow(i)}
                    onFocus={() => showRow(i)}
                    onBlur={hide}
                  >
                    {content}
                  </a>
                ) : (
                  <div className="practices__link">{content}</div>
                )}
              </li>
            );
          })}
        </ul>

        <div ref={photo} className="practices__photo" aria-hidden="true" data-visible="false">
          {c.items.map((item, i) =>
            'image' in item ? (
              <img key={item.name} src={item.image} alt="" data-index={i} loading="lazy" />
            ) : null,
          )}
        </div>
      </div>

      <div className="practices__figure" aria-hidden="true">
        <div ref={figureHost} className="practices__figure-canvas">
          {!webgl && <img src={balanceSvg} alt="" width={831.447} height={524.849} />}
        </div>
      </div>

      <p className="practices__number" data-reveal aria-hidden="true">
        {c.groupNumber}
      </p>
      <div className="practices__group" data-reveal>
        <h3 className="practices__group-title">
          <span className="visually-hidden">{c.groupNumber} </span>
          {c.groupTitle}
        </h3>
        <p className="practices__group-text">{c.groupText}</p>
        <div className="practices__group-cta">
          <Button variant="secondary" href={c.cta.href}>
            {c.cta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
