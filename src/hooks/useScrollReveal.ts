import type { RefObject } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Light, staggered reveals for elements marked with `data-reveal` inside `root`:
 *  - "up" (default) · fade + rise
 *  - "scale"        · fade + grow from 85 %
 *  - "clip"         · wipe in from the bottom edge
 *  - "line"         · draw horizontally from the left
 *  - "left"         · fade + slide in from the left
 * Elements sharing a `data-reveal-group` value are revealed together, staggered in DOM order.
 */
export function useScrollReveal(root: RefObject<HTMLElement | null>) {
  const reducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion || !root.current) return;
      const from: Record<string, gsap.TweenVars> = {
        up: { autoAlpha: 0, y: 40 },
        scale: { autoAlpha: 0, scale: 0.85 },
        clip: { clipPath: 'inset(100% 0% 0% 0%)' },
        line: { scaleX: 0, transformOrigin: 'left center' },
        left: { autoAlpha: 0, x: -40 },
      };
      const groups = new Map<string, HTMLElement[]>();
      root.current.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el, i) => {
        const key = el.dataset.revealGroup ?? `solo-${i}`;
        groups.set(key, [...(groups.get(key) ?? []), el]);
      });
      groups.forEach((els) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: els[0], start: 'top 88%', once: true } });
        els.forEach((el, i) => {
          const kind = el.dataset.reveal || 'up';
          tl.from(el, { ...from[kind], duration: kind === 'clip' ? 1.4 : 1.1, ease: 'power3.out', clearProps: 'clipPath' }, i * 0.1);
        });
      });
    },
    { scope: root, dependencies: [reducedMotion] },
  );
}
