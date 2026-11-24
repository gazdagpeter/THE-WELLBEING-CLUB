import padel from '@/assets/events/event-padel.webp';
import barre from '@/assets/events/event-barre.webp';
import walk from '@/assets/events/event-walk.webp';

/** 04 Közelgő események – texts 1:1 from Figma. */
export const eventsContent = {
  title: 'Közelgő események',
  intro:
    'Programjaink, ahol a mozgás közös élménnyé válik. Gyere el, ismerj meg új embereket, és légy része a közösségnek.',
  all: { label: 'Összes esemény', href: '#esemenyek' },
  prevLabel: 'Előző esemény',
  nextLabel: 'Következő esemény',
  cta: 'Érdekel',
  ctaHref: '#kapcsolat',
  /** order on screen at start: left, centre, right */
  items: [
    {
      date: '2026. január 17., szombat · 10:00',
      title: 'Padel Pilates',
      text: 'Pilates alapú bemelegítés, utána közös padelezés. Kezdőket is szeretettel várunk.',
      place: 'Helyszín hamarosan',
      image: padel,
      imageAlt: 'Csoportos Pilates bemelegítés a stúdióban',
    },
    {
      date: '2026. február 1., vasárnap · 9:30',
      title: 'Barre & Brunch',
      text: 'Egy lendületes Barre óra, utána közös brunch és beszélgetés a stúdióban.',
      place: 'The Well Being Club stúdió',
      image: barre,
      imageAlt: 'A világos, fagerendás stúdió jógalabdákkal',
    },
    {
      date: '2026. február 22., vasárnap · 10:00',
      title: 'Séta és nyújtás',
      text: 'Könnyű séta a természetben, a végén közös nyújtással. Hozd el a barátaidat is!',
      place: 'Találkozó a stúdió előtt',
      image: walk,
      imageAlt: 'Barátnők nyújtanak a parkban egy közös séta után',
    },
  ],
};
