import { useEffect, useId, useState } from 'react';
import logo from '@/assets/hero/logo.svg';
import { Button } from '@/components/Button/Button';
import { heroContent } from '@/content/hero';
import './Header.css';

export function Header() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const { nav, languages, activeLanguage, booking, menuLabel, closeLabel } = heroContent;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className={`header${open ? ' is-open' : ''}`}>
      <a className="header__logo" href="#" data-anim="header" aria-label="The Wellbeing Club">
        <img src={logo} alt="The Wellbeing Club" width={125.698} height={60} />
      </a>

      <nav className="header__nav" id={menuId} aria-label="Fő navigáció">
        <ul className="header__menu">
          {nav.map((item) => (
            <li key={item.href} data-anim="header">
              <a href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="header__right">
        <div className="header__lang" data-anim="header">
          {languages.map((lang, i) => (
            <span key={lang} className="header__lang-item">
              {i > 0 && (
                <span className="header__lang-sep" aria-hidden="true">
                  /
                </span>
              )}
              <a
                href="#"
                lang={lang.toLowerCase()}
                aria-current={lang === activeLanguage ? 'true' : undefined}
                className={lang === activeLanguage ? 'is-active' : undefined}
              >
                {lang}
              </a>
            </span>
          ))}
        </div>
        <span data-anim="header" className="header__booking">
          <Button href={booking.href}>{booking.label}</Button>
        </span>
        <button
          type="button"
          className="header__toggle"
          data-anim="header"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="visually-hidden">{open ? closeLabel : menuLabel}</span>
          <span className="header__toggle-bar" aria-hidden="true" />
          <span className="header__toggle-bar" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
