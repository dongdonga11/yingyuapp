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

      const randomWord = finalDeck[Math.floor(Math.random() * finalDeck.length)];
      const p = getProphecy(firstCard, randomWord);
      setProphecyData(p);
      setAppState('prophecy_reveal');
  };

  // 2. Handle Closing the Prophecy
  const handleAcceptProphecy = () => {
      setProphecyData(null);
      setAppState('learning');
  };

  // 3. Handle Word Progress
  const currentWord = deck[currentIndex];
  const progress = Math.round(((currentIndex) / deck.length) * 100);

  const handleNextWord = async () => {
     if (currentIndex < deck.length - 1) {
         setCurrentIndex(prev => prev + 1);
     } else {
         setCurrentIndex(0); // Loop for demo
     }
  };

  const handleReset = () => {
      setAppState('altar');
      setReadingCards([]);
      setUnlockedIndices(new Set([0]));
      setProphecyData(null);
  };

  const currentActiveArcana = readingCards[0];

  return (
    <Layout themeColor={currentActiveArcana?.theme_color}>
      
      {/* STATE: ALTAR */}
      {appState === 'altar' && (
          <TarotTable onReadingComplete={handleReadingComplete} />
      )}

      {/* STATE: PROPHECY */}
      {appState === 'prophecy_reveal' && prophecyData && (
          <DailyProphecyCard 
            data={prophecyData} 
            onClose={handleAcceptProphecy} 
          />
      )}

      {/* STATE: LEARNING */}
      {appState === 'learning' && currentWord && currentActiveArcana && (
        <div className="w-full h-full flex flex-col relative animate-fade-in overflow-hidden">
            
            {/* --- VISUAL SLOTS (Animation Targets) --- */}
            {/* Left Slot: Abyss */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-64 rounded-r-2xl bg-gradient-to-l from-transparent to-[#8A2323]/20 border-r border-[#8A2323]/30 flex flex-col items-center justify-center gap-4 z-0 opacity-50">
                <div className="text-[#8A2323] text-opacity-50 text-2xl animate-pulse">☠</div>
                <div className="text-[#8A2323] text-[10px] tracking-widest -rotate-90 whitespace-nowrap opacity-60">ABYSS</div>
            </div>

            {/* Right Slot: Sanctum */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-64 rounded-l-2xl bg-gradient-to-r from-transparent to-gold/20 border-l border-gold/30 flex flex-col items-center justify-center gap-4 z-0 opacity-50">
                 <div className="text-gold text-opacity-50 text-2xl animate-pulse">☀</div>
                 <div className="text-gold text-[10px] tracking-widest rotate-90 whitespace-nowrap opacity-60">SANCTUM</div>
            </div>


            {/* --- SIDEBAR (THE COLLECTION) --- */}
            <div className="absolute right-4 top-4 z-20 flex flex-col gap-4">
                {readingCards.map((card, i) => {
                    const isUnlocked = unlockedIndices.has(i);
                    const isCurrent = i === 0;
                    return (
                        <div 
                            key={i}
                            className={`
                                w-10 h-14 rounded border flex items-center justify-center transition-all duration-500
                                ${isUnlocked 
                                    ? 'bg-midnight border-gold shadow-[0_0_10px_rgba(197,160,89,0.3)]' 
                                    : 'bg-black/40 border-white/10 opacity-60'
                                }
                                ${isCurrent ? 'scale-110 ring-1 ring-gold/50' : ''}
                            `}
                        >
                            {isUnlocked ? (
                                <div className="text-lg animate-[pop-in_0.5s]">{card.icon}</div>
                            ) : (
                                <div className="text-white/20 text-[10px]">🔒</div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Top Bar Area */}
            <div className="pt-6 px-6 pr-16 mb-2 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                     <button onClick={handleReset} className="text-white/20 hover:text-white w-6 h-6 flex items-center justify-center rounded">
                        ✕
                     </button>
                     <span className="text-xs uppercase tracking-[0.2em] text-gold/80">
                        {currentActiveArcana.name_cn} Phase
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

            {/* Word Card Area */}
            <div className="flex-1 px-4 pb-4 flex items-center justify-center z-10">
                <WordCard 
                    data={currentWord} 
                    onNext={handleNextWord} // Mastered (Fly Right)
                    onHard={handleNextWord} // Forget (Fly Left) - Logic is same for now, just animation differs
                />
            </div>
        </div>
      )}

    </Layout>
  );
};

export default App;