import React, { useState } from 'react';
import Layout from './components/Layout';
import WordCard from './components/WordCard';
import TarotTable from './components/TarotTable'; // New Component
import DailyProphecyCard from './components/DailyProphecy';
import { initialVocabulary } from './data/vocabulary';
import { getProphecy } from './data/tarot';
import { WordData, TarotArcana, DailyProphecy } from './types';

type AppState = 'altar' | 'learning' | 'prophecy';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('altar');
  const [currentArcana, setCurrentArcana] = useState<TarotArcana | null>(null);
  
  // Vocabulary State
  const [deck, setDeck] = useState<WordData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Prophecy State
  const [prophecyData, setProphecyData] = useState<DailyProphecy | null>(null);

  // 1. Handle Draw from the Table
  const handleTarotDraw = (card: TarotArcana) => {
      const filteredWords = card.filter_logic(initialVocabulary);
      // Ensure we have at least some words, fallback to all if filter is too strict
      const finalDeck = filteredWords.length > 0 ? filteredWords : initialVocabulary.slice(0, 3);
      
      setCurrentArcana(card);
      setDeck(finalDeck);
      setCurrentIndex(0);
      
      // Short delay for the "Accept Fate" button animation
      setTimeout(() => setAppState('learning'), 300);
  };

  // 2. Handle Progress
  const currentWord = deck[currentIndex];
  const progress = Math.round(((currentIndex + 1) / deck.length) * 100);

  const handleNext = async () => {
     if (currentIndex < deck.length - 1) {
         setCurrentIndex(prev => prev + 1);
     } else {
         // 3. Complete -> Generate Prophecy
         if (currentArcana && deck.length > 0) {
             const randomWordFromSession = deck[Math.floor(Math.random() * deck.length)];
             const p = getProphecy(currentArcana, randomWordFromSession);
             setProphecyData(p);
             setAppState('prophecy');
         }
     }
  };

  // Reset Flow
  const handleReset = () => {
      setAppState('altar');
      setCurrentArcana(null);
      setProphecyData(null);
  };

  return (
    <Layout themeColor={currentArcana?.theme_color}>
      
      {/* STATE: ALTAR (THE TABLE) */}
      {appState === 'altar' && (
          <TarotTable onDraw={handleTarotDraw} />
      )}

      {/* STATE: LEARNING */}
      {appState === 'learning' && currentWord && currentArcana && (
        <div className="w-full h-full flex flex-col px-4 pt-2 animate-fade-in">
            {/* The Bond (Theme Header) */}
            <div className="text-center mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-60" style={{ color: currentArcana.theme_color }}>
                    The Decree of {currentArcana.name}
                </span>
            </div>

            {/* Progress/Nav */}
            <div className="flex items-center gap-4 mb-2 px-2">
                 <button onClick={handleReset} className="text-white/20 hover:text-white w-8 h-8 flex items-center justify-center rounded">
                    ✕
                 </button>
                 <div className="flex-1 h-[2px] bg-white/10 rounded-full overflow-hidden">
                    <div 
                        className="h-full transition-all duration-500 shadow-[0_0_10px_currentColor]" 
                        style={{ width: `${progress}%`, backgroundColor: currentArcana.theme_color, color: currentArcana.theme_color }}
                    ></div>
                 </div>
                 <span className="font-mono text-[10px] opacity-40" style={{ color: currentArcana.theme_color }}>
                    {currentIndex + 1} / {deck.length}
                 </span>
            </div>

            <WordCard 
                data={currentWord} 
                onNext={handleNext}
                onHard={handleNext}
            />
        </div>
      )}

      {/* STATE: PROPHECY */}
      {appState === 'prophecy' && prophecyData && (
          <DailyProphecyCard 
            data={prophecyData} 
            onClose={handleReset} 
          />
      )}

    </Layout>
  );
};

export default App;