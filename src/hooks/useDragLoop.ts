import { useEffect, useRef, type RefObject } from 'react';
import { gsap } from '@/lib/gsap';

type DragLoopOptions = {
  /** run the loop at all (e.g. off for reduced motion or on another breakpoint) */
  enabled: boolean;
  /** automatic drift in screen px per second (read every frame, so it can follow the layout) */
  speed: () => number;
  /** with a real mouse, hovering an element matching this selector eases the loop to a stop */
  pauseOnHover?: string;
};

/**
 * Endless, slowly drifting row that can be grabbed and swiped by hand.
 *
 * `track` holds the content twice (two identical sets), so shifting it by one set width is
 * seamless. Horizontal swipes (touch, pen or mouse) move the row directly; on release it
 * glides on with the swipe's momentum, then eases back into the automatic drift.
 * Vertical page scrolling stays native – give `row` `touch-action: pan-y`.
 */
export function useDragLoop(
  row: RefObject<HTMLElement | null>,
  track: RefObject<HTMLElement | null>,
  { enabled, speed, pauseOnHover }: DragLoopOptions,
) {
  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  });

  useEffect(() => {
    const rowEl = row.current;
    const trackEl = track.current;
    if (!enabled || !rowEl || !trackEl) return;

    /** auto: 0…1 multiplier of the drift · x: offset in px · vel: fling velocity in px / ms */
    const state = { auto: 1, x: 0, vel: 0 };
    let drag: {
      id: number;
      startX: number;
      startY: number;
      baseX: number;
      lastX: number;
      lastT: number;
      active: boolean;
    } | null = null;

    const wrap = () => {
      const setWidth = trackEl.scrollWidth / 2;
      if (!setWidth) return;
      while (state.x <= -setWidth) state.x += setWidth;
      while (state.x > 0) state.x -= setWidth;
    };

    const tick = (_t: number, dt: number) => {
      if (!drag?.active) {
        state.x -= (speedRef.current() * dt * state.auto) / 1000;
        // momentum after a swipe, decaying smoothly (frame-rate independent)
        if (Math.abs(state.vel) > 0.005) {
          state.x += state.vel * dt;
          state.vel *= Math.pow(0.94, dt / 16.67);
        } else state.vel = 0;
      }
      wrap();
      gsap.set(trackEl, { x: state.x });
    };
    gsap.ticker.add(tick);

    const easeTo = (auto: number, duration: number, delay = 0) =>
      gsap.to(state, { auto, duration, delay, ease: auto ? 'power2.inOut' : 'power2.out', overwrite: true });

    // real mouse only – emulated mouse events after a tap would stop the loop for good
    const over = (e: PointerEvent) => {
      if (pauseOnHover && e.pointerType === 'mouse' && !drag && (e.target as HTMLElement).closest(pauseOnHover)) easeTo(0, 0.8);
    };
    const out = (e: PointerEvent) => {
      if (!pauseOnHover || e.pointerType !== 'mouse' || drag) return;
      const from = (e.target as HTMLElement).closest(pauseOnHover);
      const to = (e.relatedTarget as HTMLElement | null)?.closest(pauseOnHover);
      if (from && from !== to) easeTo(1, 1.2);
    };

    const down = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      drag = { id: e.pointerId, startX: e.clientX, startY: e.clientY, baseX: state.x, lastX: e.clientX, lastT: e.timeStamp, active: false };
    };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.active) {
        const dx = e.clientX - drag.startX;
        // wait until the gesture is clearly sideways – vertical moves scroll the page
        if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(e.clientY - drag.startY)) return;
        drag.active = true;
        drag.baseX = state.x;
        drag.startX = e.clientX;
        drag.lastX = e.clientX;
        state.vel = 0;
        gsap.killTweensOf(state);
        state.auto = 0;
        rowEl.setPointerCapture(e.pointerId);
        rowEl.classList.add('is-dragging');
      }
      const dt = Math.max(1, e.timeStamp - drag.lastT);
      state.vel = state.vel * 0.6 + ((e.clientX - drag.lastX) / dt) * 0.4;
      drag.lastX = e.clientX;
      drag.lastT = e.timeStamp;
      state.x = drag.baseX + (e.clientX - drag.startX);
      wrap();
      // keep the finger anchored to the same spot after wrapping
      drag.baseX = state.x - (e.clientX - drag.startX);
    };
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const { active, lastT } = drag;
      drag = null;
      rowEl.classList.remove('is-dragging');
      if (rowEl.hasPointerCapture(e.pointerId)) rowEl.releasePointerCapture(e.pointerId);
      if (!active) return;
      // held still before letting go → no fling
      state.vel = e.timeStamp - lastT > 90 ? 0 : gsap.utils.clamp(-3, 3, state.vel);
      easeTo(1, 1.4, 0.6);
    };
    // a swipe must not also count as a click on a link inside the row
    let suppressClick = false;
    const markClick = () => {
      suppressClick = rowEl.classList.contains('is-dragging');
    };
    const click = (e: MouseEvent) => {
      if (suppressClick) {
        e.preventDefault();
        e.stopPropagation();
        suppressClick = false;
      }
    };

    trackEl.addEventListener('pointerover', over);
    trackEl.addEventListener('pointerout', out);
    rowEl.addEventListener('pointerdown', down);
    rowEl.addEventListener('pointermove', move);
    rowEl.addEventListener('pointerup', markClick, true);
    rowEl.addEventListener('pointerup', up);
    rowEl.addEventListener('pointercancel', up);
    rowEl.addEventListener('click', click, true);

    return () => {
      gsap.ticker.remove(tick);
      gsap.killTweensOf(state);
      gsap.set(trackEl, { clearProps: 'transform' });
      rowEl.classList.remove('is-dragging');
      trackEl.removeEventListener('pointerover', over);
      trackEl.removeEventListener('pointerout', out);
      rowEl.removeEventListener('pointerdown', down);
      rowEl.removeEventListener('pointermove', move);
      rowEl.removeEventListener('pointerup', markClick, true);
      rowEl.removeEventListener('pointerup', up);
      rowEl.removeEventListener('pointercancel', up);
      rowEl.removeEventListener('click', click, true);
    };
  }, [row, track, enabled, pauseOnHover]);
}
