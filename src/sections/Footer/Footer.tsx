import { useRef } from 'react';
import logoFull from '@/assets/footer/logo-full.svg';
import { heroContent } from '@/content/hero';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { gsap, useGSAP } from '@/lib/gsap';
import './Footer.css';

const COLUMNS = [
  { title: 'Stúdió', lines: ['Minta utca 12.', '945 01 Minta város'] },
  { title: 'Nyitvatartás', lines: ['Hétfő–péntek 7:00–21:00', 'Szombat 8:00–14:00', 'Vasárnap zárva'] },
  { title: 'Elérhetőség', lines: ['hello@thewellbeingclub.sk', '+421 900 000 000'] },
  { title: 'Kövess minket', lines: ['Instagram', 'Facebook'] },
];

/** „12 Lábléc” – columns rise in, the full-width logo is uncovered when it comes into view. */
export default function Footer() {
  const root = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  useScrollReveal(root);

  useGSAP(
    () => {
      if (reducedMotion) return;
      // a one-shot reveal (not scrubbed): it always finishes, even when the logo sits
      // so close to the page end that a scroll-linked tween could never reach 100 %
      gsap.fromTo(
        '.footer__logo',
        { clipPath: 'inset(100% 0% 0% 0%)', y: 60 },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          y: 0,
          duration: 1.6,
          ease: 'power3.out',
          clearProps: 'clipPath,transform',
          scrollTrigger: { trigger: '.footer__logo', start: 'top 92%', once: true },
        },
      );
    },
    { scope: root, dependencies: [reducedMotion] },
  );

  return (
    <footer ref={root} className="footer" id="kapcsolat">
      <p className="footer__claim" data-reveal>
        <span>Gyere el egy órára,</span>
        <span>maradj a közösségért.</span>
      </p>

      <div className="footer__cols">
        {COLUMNS.map((col) => (
          <div key={col.title} className="footer__col" data-reveal data-reveal-group="cols">
            <h2 className="footer__col-title">{col.title}</h2>
            {col.lines.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>
        ))}
      </div>

      <nav className="footer__nav" aria-label="Lábléc navigáció">
        <ul>
          {heroContent.nav.map((item) => (
            <li key={item.href} data-reveal data-reveal-group="nav">
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
        <p className="footer__lang" data-reveal data-reveal-group="nav">
          <a href="#" className="is-active">
            HU
          </a>
          <a href="#">SK</a>
        </p>
      </nav>
      <span className="footer__rule" data-reveal="line" aria-hidden="true" />

      <img className="footer__logo" src={logoFull} alt="The Wellbeing Club" width={1720} height={821} />

      <div className="footer__bottom">
        <p>© 2026 The Well Being Club</p>
        <p className="footer__legal">
          <a href="#">Adatvédelem</a>
          <a href="#">ÁSZF</a>
          <a href="#">Süti beállítások</a>
        </p>
        <p className="footer__credit">Created by Cstudios</p>
      </div>
    </footer>
  );
}
