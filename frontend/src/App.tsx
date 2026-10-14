import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { EvoSimulationCanvas } from './components/EvoSimulationCanvas';
import { AbstractSection } from './components/AbstractSection';
import { LadderLoopSection } from './components/LadderLoopSection';
import { SystemStackSection } from './components/SystemStackSection';
import { OperatorsTerminalSection } from './components/OperatorsTerminalSection';
import { ResultsBenchmarkSection } from './components/ResultsBenchmarkSection';
import { RLTrainingTraceSection } from './components/RLTrainingTraceSection';
import { BibtexSection } from './components/BibtexSection';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Hero />
        <EvoSimulationCanvas />
        <AbstractSection />
        <LadderLoopSection />
        <SystemStackSection />
        <OperatorsTerminalSection />
        <ResultsBenchmarkSection />
        <RLTrainingTraceSection />
        <BibtexSection />
      </main>
      <Footer />
    </div>
  );
};

export default App;
