/**
 * Hero texts – taken 1:1 from the Figma design.
 * Kept in one place so the HU / SK versions can be swapped later.
 */
export const heroContent = {
  nav: [
    { label: 'Rólunk', href: '#rolunk' },
    { label: 'Stúdió', href: '#studio' },
    { label: 'Események', href: '#esemenyek' },
    { label: 'Rendezvények', href: '#rendezvenyek' },
    { label: 'Árak', href: '#arak' },
    { label: 'Kapcsolat', href: '#kapcsolat' },
  ],
  languages: ['HU', 'SK'] as const,
  activeLanguage: 'HU',
  booking: { label: 'Foglalás', href: '#foglalas' },
  menuLabel: 'Menü',
  closeLabel: 'Bezárás',
  titleLine1: 'Move and',
  titleLine2: 'Connect.',
  lead: 'Több mint mozgás. Egy hely, ahol találkozunk, megismerjük egymást és közös élményeket teremtünk.',
  primaryCta: { label: 'Fedezd fel az órákat', href: '#orak' },
  secondaryCta: { label: 'Események', href: '#esemenyek' },
  scroll: 'Görgess',
};
