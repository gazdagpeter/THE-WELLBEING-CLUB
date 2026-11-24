import Hero from '@/sections/Hero/Hero';
import Intro from '@/sections/Intro/Intro';
import Practices from '@/sections/Practices/Practices';
import Events from '@/sections/Events/Events';

function App() {
  return (
    <main className="page">
      <Hero />
      <Intro />
      <Practices />
      <Events />
    </main>
  );
}

export default App;
