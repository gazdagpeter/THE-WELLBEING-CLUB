import birthday from '@/assets/private/birthday.webp';
import hen from '@/assets/private/hen.webp';
import ladies from '@/assets/private/ladies.webp';
import privateClass from '@/assets/private/private.webp';
import team from '@/assets/private/team.webp';
import wellness from '@/assets/private/wellness.webp';
import brand from '@/assets/private/brand.webp';

/**
 * 07 Privát és céges rendezvények – texts 1:1 from Figma.
 * w / h = photo size, offset = vertical offset in the card row (Figma px).
 */
export const privateEventsContent = {
  title: ['Ti hozzátok az alkalmat,', 'mi megteremtjük hozzá a teret.'],
  intro:
    'Születésnap, lánybúcsú, csapatépítő vagy saját esemény: a stúdió a ti alkalmatokra szabva várja a társaságot.',
  cta: { label: 'Ajánlatkérés', href: '#kapcsolat' },
  items: [
    { name: 'Születésnap', text: 'Ünnepeld a kedvenc embereiddel, mozgással és pezsgővel.', image: birthday, w: 300, h: 380, offset: 160 },
    { name: 'Lánybúcsú', text: 'Vidám, közös mozgás a nagy nap előtt.', image: hen, w: 360, h: 300, offset: 40 },
    { name: 'Női összejövetel', text: 'Barátnős délután, ahol a közösség a lényeg.', image: ladies, w: 340, h: 440, offset: 180 },
    { name: 'Privát óra', text: 'Csak rád szabott edzés, a te tempódban.', image: privateClass, w: 520, h: 620, offset: 0 },
    { name: 'Csapatépítés', text: 'Céges csapatoknak: közös élmény, jobb hangulat.', image: team, w: 380, h: 320, offset: 60 },
    { name: 'Privát wellness élmény', text: 'Nyugodt mozgás és feltöltődés zárt körben.', image: wellness, w: 320, h: 420, offset: 200 },
    { name: 'Márkaesemények', text: 'Együttműködések és események a stúdió terében.', image: brand, w: 360, h: 300, offset: 40 },
  ],
};
