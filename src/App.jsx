import { useRef, useState } from 'react';
import { Navigation, Footer } from './components/SiteChrome.jsx';
import {
  Contact,
  Events,
  Faq,
  MakingJourney,
  Opening,
  Process,
  Season,
  StandingOrders,
  StudioNotes,
  StudioSessions,
  Work,
} from './components/sections.jsx';
import { useMotion } from './hooks/useMotion.js';

export default function App() {
  const rootRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState('Custom bouquet');
  useMotion(rootRef);

  return (
    <div className="site-root" ref={rootRef}>
      <a className="skip" href="#main">Skip to content</a>
      <Navigation onSelectProduct={setSelectedProduct} />
      <main id="main">
        <Opening onSelectProduct={setSelectedProduct} />
        <Season onSelectProduct={setSelectedProduct} />
        <Work onSelectProduct={setSelectedProduct} />
        <MakingJourney />
        <StandingOrders onSelectProduct={setSelectedProduct} />
        <Events onSelectProduct={setSelectedProduct} />
        <Process />
        <StudioSessions onSelectProduct={setSelectedProduct} />
        <StudioNotes onSelectProduct={setSelectedProduct} />
        <Faq />
        <Contact selectedProduct={selectedProduct} onSelectProduct={setSelectedProduct} />
      </main>
      <Footer onSelectProduct={setSelectedProduct} />
    </div>
  );
}
