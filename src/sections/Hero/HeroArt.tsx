import { forwardRef, useImperativeHandle, useRef } from 'react';
import photo from '@/assets/hero/studio-photo.webp';
import dotsSoft from '@/assets/hero/dots-soft.svg';
import dotsBordo from '@/assets/hero/dots-bordo.svg';
import dotsScatter from '@/assets/hero/dots-scatter.svg';
import connectLines from '@/assets/hero/connect-lines.svg';
import { useDotFigure } from '@/hooks/useDotFigure';
import type { DotFigure } from '@/three/DotFigure';
import { heroFigure } from '@/three/figures';
import { COLUMNS, COLUMN_W, PHOTO, TRANSITION_COLUMN } from './heroGeometry';

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
  const { figure: figureRef, webgl } = useDotFigure(canvasHost, heroFigure, animated);

  useImperativeHandle(ref, () => ({
    get figure() {
      return figureRef.current;
    },
  }));

  return (
    <div className="hero-art" aria-hidden="true">
      <div className="hero-art__photo" data-hero-photo>
        {COLUMNS.map((col, i) => (
          <div
            key={col.x}
            className="hero-art__column"
            data-anim="column"
            data-transition-column={i === TRANSITION_COLUMN ? '' : undefined}
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
            <img className="hero-art__dots-soft" src={dotsSoft} alt="" width={557.342} height={447.124} />
            <img className="hero-art__dots-bordo" src={dotsBordo} alt="" width={557.528} height={446.381} />
          </div>
          <img className="hero-art__scatter" src={dotsScatter} alt="" width={804.96} height={630.965} />
        </>
      )}

      <div ref={canvasHost} className="hero-art__canvas" />

      <div className="hero-art__lines" data-disperse>
        <img src={connectLines} alt="" width={329.414} height={175.853} data-anim="lines" />
      </div>
    </div>
  );
});
