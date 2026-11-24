import reformer from '@/assets/practices/reformer-pilates.webp';
import mat from '@/assets/practices/mat-pilates.webp';
import barre from '@/assets/practices/barre-pilates.webp';

/**
 * 03 Mozgásformák – texts 1:1 from Figma.
 * Reformer / Mat photos: generated with Figma AI (placeholders until the photo shoot).
 */
export const practicesContent = {
  title: 'Fedezd fel a hozzád illő mozgásformát.',
  intro:
    'Stúdiónkban különböző mozgásformák közül választhatsz, amelyek fejlesztik az erőt, a hajlékonyságot, az egyensúlyt és támogatják az általános jóllétet.',
  items: [
    {
      name: 'Reformer Pilates',
      text: 'Dinamikus és precíz edzés, amely a test erősítésére, a stabilitásra és a hajlékonyságra összpontosít.',
      href: '#reformer-pilates',
      image: reformer,
      imageAlt: 'Mosolygó nő Reformer Pilates gépen edz a világos stúdióban',
    },
    {
      name: 'Mat Pilates',
      text: 'Tudatos mozgás, saját testsúlyos gyakorlatok és a mély stabilizáló izmok erősítése.',
      href: '#mat-pilates',
      image: mat,
      imageAlt: 'Nő oldalsó lábemelést végez matracon a világos stúdióban',
    },
    {
      name: 'Barre Pilates',
      text: 'A balett, a Pilates és a funkcionális edzés elemeinek ötvözése.',
      href: '#barre-pilates',
      image: barre,
      imageAlt: 'Mosolygó nő Barre Pilates gyakorlatot végez a stúdióban',
    },
    {
      name: 'Spinning',
      soon: '(hamarosan)',
      text: 'Új energia, ritmus és közös mozgás. Egy újabb lehetőség arra, hogy közösségünkben élvezd az aktív életmódot.',
    },
  ],
  groupNumber: '4',
  groupTitle: 'fő egy Reformer órán. Legfeljebb.',
  groupText:
    'Kis létszámú csoportokban dolgozunk, és minden vendégünknél fontosnak tartjuk az egyéni megközelítést. Így mindenkinek elegendő tér, figyelem és személyre szabott támogatás jut.',
  cta: { label: 'Foglalj helyet', href: '#foglalas' },
};
