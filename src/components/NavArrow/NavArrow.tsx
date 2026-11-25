import type { ButtonHTMLAttributes } from 'react';
import './NavArrow.css';

type NavArrowProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  direction: 'prev' | 'next';
  /** light = white button on a dark / photo background · dark = bordó button on a light background */
  tone: 'light' | 'dark';
};

/**
 * Round prev / next arrow for carousels.
 * Filled when paging in that direction is possible, outlined only when it is not (`disabled`).
 */
export function NavArrow({ direction, tone, className, disabled, ...rest }: NavArrowProps) {
  return (
    <button
      type="button"
      className={['nav-arrow', `nav-arrow--${tone}`, className].filter(Boolean).join(' ')}
      disabled={disabled}
      {...rest}
    >
      <svg className="nav-arrow__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d={direction === 'next' ? 'M10 18L16 12L10 6M16 12H4' : 'M14 18L8 12L14 6M8 12H20'}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
