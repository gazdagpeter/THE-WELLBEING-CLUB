import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { gsap } from '@/lib/gsap';
import { DotFigure, type FigureConfig } from '@/three/DotFigure';

/**
 * Mounts a WebGL dot figure into `host` (when enabled + supported).
 * Returns the figure ref and whether WebGL is in use (else show static SVGs).
 */
export function useDotFigure(
  host: RefObject<HTMLElement | null>,
  createConfig: () => FigureConfig,
  enabled: boolean,
) {
  const figure = useRef<DotFigure | null>(null);
  const [supported] = useState(() => typeof window !== 'undefined' && DotFigure.isSupported());
  const configRef = useRef(createConfig);
  const webgl = enabled && supported;

  useLayoutEffect(() => {
    if (!webgl || !host.current) return;
    const instance = new DotFigure(host.current, configRef.current());
    figure.current = instance;
    gsap.ticker.add(instance.tick);
    return () => {
      gsap.ticker.remove(instance.tick);
      instance.dispose();
      figure.current = null;
    };
  }, [webgl, host]);

  return { figure, webgl };
}
