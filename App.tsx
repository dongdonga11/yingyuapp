import React, { useState } from 'react';
import Layout from './components/Layout';
import WordCard from './components/WordCard';
import TarotTable from './components/TarotTable';
import DailyProphecyCard from './components/DailyProphecy';
import { initialVocabulary } from './data/vocabulary';
import { getProphecy } from './data/tarot';
import { WordData, TarotArcana, DailyProphecy } from './types';

type AppState = 'altar' | 'prophecy_reveal' | 'learning';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('altar');
  
  // The Reading State
  const [readingCards, setReadingCards] = useState<TarotArcana[]>([]);
  const [unlockedIndices, setUnlockedIndices] = useState<Set<number>>(new Set([0])); // First card unlocked by default
  
  // Vocabulary State
  const [deck, setDeck] = useState<WordData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Prophecy State (The Active Overlay)
  const [prophecyData, setProphecyData] = useState<DailyProphecy | null>(null);

  // 1. Handle Completion of 3-Card Draw
  const handleReadingComplete = (cards: TarotArcana[]) => {
      setReadingCards(cards);
      
      const firstCard = cards[0];
      const filteredWords = firstCard.filter_logic(initialVocabulary);
      const finalDeck = filteredWords.length > 0 ? filteredWords : initialVocabulary.slice(0, 3);
      setDeck(finalDeck);
      setCurrentIndex(0);

      // Generate Prophecy
      const randomWord = finalDeck[Math.floor(Math.random() * finalDeck.length)];
      const p = getProphecy(firstCard, randomWord);
      setProphecyData(p);
      
      // Move to Reveal Phase
      setAppState('prophecy_reveal');
  };

  // 2. Handle Closing the Prophecy (Accepting Fate)
  const handleAcceptProphecy = () => {
      setProphecyData(null);
      setAppState('learning');
  };

  // 3. Handle Word Progress
  const progress = Math.round(((currentIndex + 1) / deck.length) * 100);

  const handleNextWord = async () => {
     if (currentIndex < deck.length - 1) {
         setCurrentIndex(prev => prev + 1);
     } else {
         setCurrentIndex(0); // Loop for demo
     }
  };

  // Reset Flow
  const handleReset = () => {
      setAppState('altar');
      setReadingCards([]);
      setUnlockedIndices(new Set([0]));
      setProphecyData(null);
  };

  const currentActiveArcana = readingCards[0]; 

  return (
    <Layout themeColor={currentActiveArcana?.theme_color}>
      
      {/* STATE: ALTAR (THE TABLE) */}
      {appState === 'altar' && (
          <TarotTable onReadingComplete={handleReadingComplete} />
      )}

      {/* STATE: PROPHECY REVEAL (The Flashy Card) */}
      {appState === 'prophecy_reveal' && prophecyData && (
          <DailyProphecyCard 
            data={prophecyData} 
            onClose={handleAcceptProphecy} 
          />
      )}

      {/* STATE: LEARNING (CARD STACK) */}
      {appState === 'learning' && deck.length > 0 && currentActiveArcana && (
        <div className="w-full h-full flex flex-col relative animate-fade-in">
            
            {/* --- SIDEBAR (THE COLLECTION) --- */}
            <div className="absolute right-4 top-4 z-20 flex flex-col gap-4">
                {readingCards.map((card, i) => {
                    const isUnlocked = unlockedIndices.has(i);
                    const isCurrent = i === 0; 
                    return (
                        <div 
                            key={i}
                            className={`
                                w-12 h-16 rounded border flex items-center justify-center transition-all duration-500
                                ${isUnlocked 
                                    ? 'bg-midnight border-gold shadow-[0_0_10px_rgba(197,160,89,0.3)]' 
                                    : 'bg-black/40 border-white/10 opacity-60'
                                }
                                ${isCurrent ? 'scale-110 ring-2 ring-gold/50' : ''}
                            `}
                        >
                            {isUnlocked ? (
                                <div className="text-xl animate-[pop-in_0.5s]">{card.icon}</div>
                            ) : (
                                <div className="text-white/20 text-xs">🔒</div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Top Bar Area */}
            <div className="pt-6 px-6 pr-20 mb-4 flex-none">
                <div className="flex items-center gap-3 mb-2">
                     <button onClick={handleReset} className="text-white/20 hover:text-white w-6 h-6 flex items-center justify-center rounded">
                        ✕
                     </button>
                     <span className="text-xs uppercase tracking-[0.2em] text-gold/80">
                        {currentActiveArcana.name_cn}
                     </span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-[2px] bg-white/10 rounded-full overflow-hidden w-full max-w-[200px]">
                    <div 
                        className="h-full transition-all duration-500 shadow-[0_0_10px_currentColor]" 
                        style={{ width: `${progress}%`, backgroundColor: currentActiveArcana.theme_color }}
                    ></div>
                 </div>
            </div>

            {/* CARD STACK CONTAINER */}
            <div className="flex-1 w-full relative px-4 pb-4 overflow-hidden">
                {/* 
                    We render the current card plus the next 2 cards.
                    We reverse them so the 'next' cards are rendered FIRST (at the bottom of DOM),
                    and the 'current' card is rendered LAST (on top of stack).
                */}
                {deck.slice(currentIndex, currentIndex + 3).map((wordData, i) => {
                    const realIndex = currentIndex + i; 
                    return (
                        <WordCard 
                            key={wordData.id} 
                            data={wordData} 
                            stackIndex={i} // 0 is active, 1 is next, etc.
                            onNext={handleNextWord}
                            onHard={handleNextWord}
                        />
                    );
                }).reverse()} 
            </div>
        </div>
      )}

    </Layout>
  );
};

export default App;