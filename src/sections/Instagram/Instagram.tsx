import { useRef, type CSSProperties } from 'react';
import ig1 from '@/assets/instagram/ig-1.webp';
import ig2 from '@/assets/instagram/ig-2.webp';
import ig3 from '@/assets/instagram/ig-3.webp';
import ig4 from '@/assets/instagram/ig-4.webp';
import ig5 from '@/assets/instagram/ig-5.webp';
import ig6 from '@/assets/instagram/ig-6.webp';
import ig7 from '@/assets/instagram/ig-7.webp';
import ig8 from '@/assets/instagram/ig-8.webp';
import { Button } from '@/components/Button/Button';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { gsap, useGSAP } from '@/lib/gsap';
import './Instagram.css';

/** Photo centres, sizes and tilt from Figma („11 Instagram és felhívás”, 1920 × 1100). */
const PHOTOS = [
  { src: ig1, x: 222, y: 287.7, w: 260, h: 330, r: 6, speed: -60 },
  { src: ig2, x: 612.1, y: 157.4, w: 210, h: 210, r: -4, speed: 40 },
  { src: ig3, x: 1368.4, y: 201.4, w: 250, h: 250, r: 3, speed: -30 },
  { src: ig4, x: 1722.9, y: 308.6, w: 250, h: 310, r: -7, speed: 70 },
  { src: ig5, x: 294.4, y: 751.1, w: 310, h: 230, r: -5, speed: 50 },
  { src: ig6, x: 696.7, y: 952.7, w: 230, h: 230, r: 4, speed: -50 },
  { src: ig7, x: 1310.3, y: 907.8, w: 270, h: 210, r: -3, speed: 60 },
  { src: ig8, x: 1665.1, y: 815.7, w: 260, h: 330, r: 5, speed: -40 },
];

/** „11 Instagram és felhívás” – photos drift in and float at different speeds around the call to action. */
export default function Instagram() {
  const root = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  useScrollReveal(root);

  useGSAP(
    () => {
      if (reducedMotion) return;
      gsap.utils.toArray<HTMLElement>('.insta__photo', root.current).forEach((el, i) => {
        const r = Number(el.dataset.r);
        // arrive: from a little further out, more tilted and smaller
        gsap.from(el.querySelector('.insta__reveal'), {
          autoAlpha: 0,
          scale: 0.7,
          rotation: r * 2,
          duration: 1.4,
          delay: (i % 4) * 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
        });
        // float: each photo moves at its own pace while scrolling (parallax)
        gsap.fromTo(
          el.querySelector('.insta__inner'),
          { y: Number(el.dataset.speed) },
          { y: -Number(el.dataset.speed), ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } },
        );
      });
    },
    { scope: root, dependencies: [reducedMotion] },
  );

  return (
    <section ref={root} className="insta" aria-labelledby="insta-title">
      <ul className="insta__photos" aria-hidden="true">
        {PHOTOS.map((p, i) => (
          <li
            key={i}
            className="insta__photo"
            data-r={p.r}
            data-speed={p.speed}
            style={{ '--x': p.x, '--y': p.y, '--w': p.w, '--h': p.h, '--r': `${p.r}deg` } as CSSProperties}
          >
            {/* reveal (arrive) and float (parallax) live on separate layers, the tilt on the <li> */}
            <div className="insta__reveal">
              <div className="insta__inner">
                <img src={p.src} alt="" loading="lazy" />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="insta__cta">
        <h2 id="insta-title" className="insta__title">
          <span data-reveal="clip" data-reveal-group="insta">Mozogjunk együtt.</span>
          <span data-reveal="clip" data-reveal-group="insta">Kapcsolódjunk egymáshoz.</span>
        </h2>
        <div data-reveal>
          <Button href="https://www.instagram.com/" target="_blank" rel="noreferrer">
            Kövess minket Instagramon
          </Button>
        </div>
      </div>
    </section>
  );
}
