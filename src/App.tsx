import Hero from '@/sections/Hero/Hero';
import Intro from '@/sections/Intro/Intro';
import Practices from '@/sections/Practices/Practices';
import Events from '@/sections/Events/Events';
import PastEvents from '@/sections/PastEvents/PastEvents';
import PrivateEvents from '@/sections/PrivateEvents/PrivateEvents';
import Instructor from '@/sections/Instructor/Instructor';
import Pricing from '@/sections/Pricing/Pricing';
import Testimonials from '@/sections/Testimonials/Testimonials';
import Faq from '@/sections/Faq/Faq';
import Instagram from '@/sections/Instagram/Instagram';
import Footer from '@/sections/Footer/Footer';

function App() {
  return (
    <main className="page">
      <Hero />
      <Intro />
      <Practices />
      <Events />
      <PastEvents />
      <PrivateEvents />
      <Instructor />
      <Pricing />
      <Testimonials />
      <Faq />
      <Instagram />
      <Footer />
    </main>
  );
}

export default App;
