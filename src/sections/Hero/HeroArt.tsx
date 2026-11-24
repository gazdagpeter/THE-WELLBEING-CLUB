import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import photo from '@/assets/hero/studio-photo.webp';
import dotsSoft from '@/assets/hero/dots-soft.svg';
import dotsBordo from '@/assets/hero/dots-bordo.svg';
import dotsScatter from '@/assets/hero/dots-scatter.svg';
import connectLines from '@/assets/hero/connect-lines.svg';
import { gsap } from '@/lib/gsap';
import { DotFigure } from '@/three/DotFigure';

/**
 * The four rounded photo columns („Stúdiófotó – lamellák”) in Figma units,
 * relative to the 546.667 × 870 photo frame.
 */
const PHOTO = { w: 546.667, h: 870 };
const COLUMNS = [
  { x: 0, y: 80, h: 720 },
  { x: 146.667, y: 0, h: 870 },
  { x: 293.333, y: 120, h: 650 },
  { x: 440, y: 190, h: 650 },
];
const COLUMN_W = 106.667;

export type HeroArtHandle = {
  /** Drives the particle formation, 0 → 1. Null when WebGL is not used. */
  figure: DotFigure | null;
};

type HeroArtProps = {
  animated: boolean;
};

const pct = (value: number, total: number) => `${(value / total) * 100}%`;

export const HeroArt = forwardRef<HeroArtHandle, HeroArtProps>(function HeroArt({ animated }, ref) {
  const canvasHost = useRef<HTMLDivElement>(null);
  const figureRef = useRef<DotFigure | null>(null);
  const [webgl, setWebgl] = useState(false);

  useImperativeHandle(ref, () => ({
    get figure() {
      return figureRef.current;
    },
  }));

  useLayoutEffect(() => {
    if (!animated || !canvasHost.current || !DotFigure.isSupported()) {
      setWebgl(false);
      return;
    }
    const figure = new DotFigure(canvasHost.current);
    figureRef.current = figure;
    gsap.ticker.add(figure.tick);
    setWebgl(true);
    return () => {
      gsap.ticker.remove(figure.tick);
      figure.dispose();
      figureRef.current = null;
    };
  }, [animated]);

  return (
    <div className="hero-art" aria-hidden="true">
      <div className="hero-art__photo">
        {COLUMNS.map((col) => (
          <div
            key={col.x}
            className="hero-art__column"
            data-anim="column"
            style={{
              left: pct(col.x, PHOTO.w),
              top: pct(col.y, PHOTO.h),
              width: pct(COLUMN_W, PHOTO.w),
              height: pct(col.h, PHOTO.h),
            }}
          >
            <img
              src={photo}
              alt=""
              data-anim="column-img"
              style={{
                left: pct(-col.x, COLUMN_W),
                top: pct(-col.y, col.h),
                width: pct(PHOTO.w, COLUMN_W),
                height: pct(PHOTO.h, col.h),
              }}
            />
          </div>
        ))}
      </div>

      {/* static dots – shown when WebGL / motion is not available */}
      {!webgl && (
        <>
          <div className="hero-art__silhouette">
            <img className="hero-art__dots-soft" src={dotsSoft} alt="" width={648.072} height={519.912} />
            <img className="hero-art__dots-bordo" src={dotsBordo} alt="" width={648.288} height={519.048} />
          </div>
          <img className="hero-art__scatter" src={dotsScatter} alt="" width={936} height={733.68} />
        </>
      )}

      <div ref={canvasHost} className="hero-art__canvas" />

      <img
        className="hero-art__lines"
        src={connectLines}
        alt=""
        width={383.04}
        height={204.48}
        data-anim="lines"
      />
    </div>
  );
});
