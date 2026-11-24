import Hero from '@/sections/Hero/Hero';
import Intro from '@/sections/Intro/Intro';
import Practices from '@/sections/Practices/Practices';
import Events from '@/sections/Events/Events';
import PastEvents from '@/sections/PastEvents/PastEvents';
import PrivateEvents from '@/sections/PrivateEvents/PrivateEvents';

function App() {
  return (
    <main className="page">
      <Hero />
      <Intro />
      <Practices />
      <Events />
      <PastEvents />
      <PrivateEvents />
    </main>
  );
}

export default App;
