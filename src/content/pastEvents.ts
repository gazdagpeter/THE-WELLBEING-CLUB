import photo from '@/assets/past/past-event.webp';
import pilates from '@/assets/past/past-pilates.webp';
import studio from '@/assets/intro/studio-photo-wide.webp';

/** 05 Korábbi események – texts 1:1 from Figma. */
export const pastEventsContent = {
  title: 'Korábbi események',
  all: { label: 'Összes esemény', href: '#esemenyek' },
  prevLabel: 'Előző esemény',
  nextLabel: 'Következő esemény',
  items: [
    {
      title: 'Jótékonysági futás a gyerekekért',
      date: '2026. október 4., vasárnap · 9:00',
      place: 'Városliget, Budapest',
      image: photo,
      imageAlt: 'Mosolygó futók egy jótékonysági futáson a parkban',
    },
    // ↓ fictional placeholder programmes (existing photos) – replace with real ones
    {
      title: 'Nyitott stúdiónap közös Pilates órával',
      date: '2026. szeptember 13., szombat · 10:00',
      place: 'The Well Being Club stúdió',
      image: studio,
      imageAlt: 'A világos, fagerendás stúdió jógalabdákkal és matracokkal',
    },
    {
      title: 'Nyárbúcsúztató Pilates a szabadban',
      date: '2026. augusztus 30., vasárnap · 9:30',
      place: 'Margitsziget, Budapest',
      image: pilates,
      imageAlt: 'Csoportos Pilates edzés, mosolygó résztvevőkkel',
    },
  ],
};
