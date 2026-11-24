import type { AnchorHTMLAttributes } from 'react';
import arrowLight from '@/assets/hero/arrow-light.svg';
import arrowBordo from '@/assets/hero/arrow-bordo.svg';
import './Button.css';

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Figma „Gomb” variants: Elsődleges = primary, Másodlagos = secondary, Szöveges = text */
  variant?: 'primary' | 'secondary' | 'text';
};

export function Button({ variant = 'primary', className, children, ...rest }: ButtonProps) {
  return (
    <a className={['btn', `btn--${variant}`, className].filter(Boolean).join(' ')} {...rest}>
      <span className="btn__label">{children}</span>
      <img
        className="btn__icon"
        src={variant === 'primary' ? arrowLight : arrowBordo}
        alt=""
        width={18}
        height={18}
        aria-hidden="true"
      />
    </a>
  );
}
