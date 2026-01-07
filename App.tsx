import React, { useState } from 'react';
import Layout from './components/Layout';
import WordCard from './components/WordCard';
import TarotTable from './components/TarotTable';
import DailyProphecyCard from './components/DailyProphecy';
import { initialVocabulary } from './data/vocabulary';
import { getProphecy } from './data/tarot';
import { getOracleReading } from './services/geminiService';
import { WordData, TarotArcana, DailyProphecy, OracleTopic, TarotReadingResponse } from './types';

type AppState = 'altar' | 'prophecy_reveal' | 'learning' | 'oracle_ready' | 'oracle_reading';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('altar');
  
  // The Reading State
  const [readingCards, setReadingCards] = useState<TarotArcana[]>([]);
  const [unlockedIndices, setUnlockedIndices] = useState<Set<number>>(new Set()); 
  
  // Vocabulary State
  const [deck, setDeck] = useState<WordData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Prophecy State (The Active Overlay)
  const [prophecyData, setProphecyData] = useState<DailyProphecy | null>(null);

  // Oracle Reading State
  const [oracleTopic, setOracleTopic] = useState<OracleTopic | null>(null);
  const [oracleResult, setOracleResult] = useState<TarotReadingResponse | null>(null);
  const [isConsulting, setIsConsulting] = useState(false);
  
  // NEW: Step-by-Step Reveal State
  // 0: Hidden (Selection)
  // 1: Card 1 (Status) Revealed
  // 2: Card 2 (Obstacle) Revealed
  // 3: Card 3 (Revelation) Revealed
  // 4: Synthesis (All Cards + Summary)
  const [revealStep, setRevealStep] = useState<number>(0);

  // 1. Handle Completion of 3-Card Draw
  const handleReadingComplete = (cards: TarotArcana[]) => {
      setReadingCards(cards);
      
      const firstCard = cards[0];
      const filteredWords = firstCard.filter_logic(initialVocabulary);
      
      let baseDeck = filteredWords.length > 0 ? filteredWords : initialVocabulary;
      while (baseDeck.length < 6) {
          baseDeck = [...baseDeck, ...baseDeck];
      }

      // --- LOGIC: HIDE TAROT CARDS IN DECK ---
      const finalDeck = JSON.parse(JSON.stringify(baseDeck)) as WordData[];
      
      const indicesToHide: number[] = [];
      while(indicesToHide.length < 3 && indicesToHide.length < finalDeck.length) {
          const r = Math.floor(Math.random() * finalDeck.length);
          if(indicesToHide.indexOf(r) === -1) indicesToHide.push(r);
      }

      indicesToHide.forEach((deckIndex, i) => {
          finalDeck[deckIndex].hiddenTarot = cards[i];
      });

      setDeck(finalDeck);
      setCurrentIndex(0);

      // Generate Prophecy
      const randomWord = finalDeck[Math.floor(Math.random() * finalDeck.length)];
      const p = getProphecy(firstCard, randomWord);
      setProphecyData(p);
      
      // Move to Reveal Phase
      setAppState('prophecy_reveal');
  };

  const handleAcceptProphecy = () => {
      setProphecyData(null);
      setAppState('learning');
  };

  const progress = Math.round(((currentIndex + 1) / deck.length) * 100);

  const handleNextWord = async () => {
     let nextUnlocked = new Set(unlockedIndices);

     // CHECK: Did we just find a Tarot card?
     const currentCard = deck[currentIndex];
     if (currentCard.hiddenTarot) {
         const foundIndex = readingCards.findIndex(c => c.id === currentCard.hiddenTarot?.id);
         if (foundIndex !== -1) {
             nextUnlocked.add(foundIndex);
             setUnlockedIndices(nextUnlocked);
         }
     }

     // CHECK: NAVIGATION & TRIGGER LOGIC
     // We only move to Oracle if we are at the END of the deck AND have all cards.
     if (currentIndex < deck.length - 1) {
         // Not the last card yet, keep learning
         setCurrentIndex(prev => prev + 1);
     } else {
         // We are at the last card.
         // Have we collected all 3 cards?
         if (nextUnlocked.size === 3) {
             // YES: Trigger the Grand Finale (Oracle)
             setTimeout(() => {
                 setAppState('oracle_ready');
             }, 1000);
         } else {
             // NO: Start over (Looping) until collected
             // Note: In current logic, cards are guaranteed to be in the deck, 
             // so this is just a fallback for safety.
             setCurrentIndex(0); 
         }
     }
  };

  // --- ORACLE LOGIC ---
  const handleEnterSanctuary = () => {
      setAppState('oracle_reading');
      setRevealStep(0); // Reset reveal
  };

  const handleTopicSelect = async (topic: OracleTopic) => {
      if(isConsulting) return;
      setOracleTopic(topic);
      setIsConsulting(true);
      
      // Call Gemini
      const result = await getOracleReading(readingCards, topic);
      setOracleResult(result);
      setIsConsulting(false);
      
      // Auto-start reveal sequence after loading
      if(result) {
          setRevealStep(1); // Show Card 1 immediately
      }
  };
  
  const nextReveal = () => {
      if(revealStep < 4) {
          setRevealStep(prev => prev + 1);
      }
  };

  const handleReset = () => {
      setAppState('altar');
      setReadingCards([]);
      setUnlockedIndices(new Set());
      setProphecyData(null);
      setOracleTopic(null);
      setOracleResult(null);
      setRevealStep(0);
  };

  const currentActiveArcana = readingCards[0]; 

  // Helper to determine Card styling based on reveal step
  const getOracleCardStyle = (index: number) => {
      // Index 0: Status (Reveal at Step 1)
      // Index 1: Obstacle (Reveal at Step 2)
      // Index 2: Revelation (Reveal at Step 3)
      const isRevealed = revealStep >= (index + 1);
      const isCurrentFocus = revealStep === (index + 1);
      const isSummary = revealStep === 4;

      if (isSummary) {
          // In summary, all cards are smaller and aligned
          return {
              opacity: 1,
              transform: 'scale(0.8) translateY(0)',
              filter: 'grayscale(0.3)',
              isFlipped: true
          };
      }

      if (isCurrentFocus) {
          // The active card is BIG and glowing
          return {
              opacity: 1,
              transform: 'scale(1.1) translateY(10px)',
              filter: 'brightness(1.2) drop-shadow(0 0 15px rgba(197,160,89,0.5))',
              zIndex: 50,
              isFlipped: true
          };
      }
      
      if (isRevealed) {
          // Already revealed cards (but not focus)
          return {
              opacity: 0.5,
              transform: 'scale(0.9)',
              filter: 'grayscale(0.5)',
              isFlipped: true
          };
      }

      // Hidden cards
      return {
          opacity: 0.8,
          transform: 'scale(0.95)',
          filter: 'brightness(0.5)',
          isFlipped: false
      };
  };

  return (
    <Layout themeColor={appState === 'oracle_reading' ? '#9333EA' : currentActiveArcana?.theme_color}>
      
      {/* STATE: ALTAR (THE TABLE) */}
      {appState === 'altar' && (
          <TarotTable onReadingComplete={handleReadingComplete} />
      )}

      {/* STATE: PROPHECY REVEAL */}
      {appState === 'prophecy_reveal' && prophecyData && (
          <DailyProphecyCard 
            data={prophecyData} 
            onClose={handleAcceptProphecy} 
          />
      )}

      {/* STATE: LEARNING */}
      {appState === 'learning' && deck.length > 0 && currentActiveArcana && (
        <div className="w-full h-full flex flex-col relative animate-fade-in">
            {/* Top Right Tarot Slots */}
            <div className="absolute right-4 top-16 z-50 flex flex-col gap-4 pointer-events-none">
                {readingCards.map((card, i) => {
                    const isUnlocked = unlockedIndices.has(i);
                    return (
                        <div 
                            key={i}
                            className={`
                                w-14 h-20 rounded-md border-2 flex items-center justify-center transition-all duration-700 backdrop-blur-md relative
                                ${isUnlocked 
                                    ? 'bg-midnight/90 border-gold shadow-[0_0_20px_rgba(197,160,89,0.6)] scale-100 opacity-100' 
                                    : 'bg-black/40 border-white/5 opacity-50 scale-95'
                                }
                            `}
                        >
                            {isUnlocked ? (
                                <div className="text-2xl animate-[pop-in_0.5s]">{card.icon}</div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full border border-dashed border-white/20 flex items-center justify-center text-[10px] text-white/20">?</div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Bottom Right Pile */}
            <div className="absolute right-6 bottom-10 z-50 pointer-events-none flex flex-col items-center">
                 <div className="w-16 h-20 bg-midnight rounded-lg border border-gold/30 shadow-[0_0_20px_rgba(197,160,89,0.1)] flex items-center justify-center relative rotate-6 backdrop-blur-sm">
                    <span className="text-gold/40 text-xs font-mystic tracking-widest">DECK</span>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gold text-midnight rounded-full flex items-center justify-center font-bold text-xs shadow-glow">
                        {currentIndex + 1} / {deck.length}
                    </div>
                 </div>
            </div>

            {/* Top Bar */}
            <div className="pt-6 px-6 pr-20 mb-4 flex-none relative z-40">
                <div className="flex items-center gap-3 mb-2">
                     <button onClick={handleReset} className="text-white/20 hover:text-white w-6 h-6 flex items-center justify-center rounded transition-colors">✕</button>
                     <span className="text-xs uppercase tracking-[0.2em] text-gold/80">{currentActiveArcana.name_cn}</span>
                </div>
                <div className="h-[2px] bg-white/10 rounded-full overflow-hidden w-full max-w-[200px]">
                    <div className="h-full transition-all duration-500 shadow-[0_0_10px_currentColor]" style={{ width: `${progress}%`, backgroundColor: currentActiveArcana.theme_color }}></div>
                 </div>
            </div>

            {/* Cards */}
            <div className="flex-1 w-full relative px-4 pb-4 overflow-hidden z-10">
                {deck.slice(currentIndex, currentIndex + 3).map((wordData, i) => (
                    <WordCard 
                        key={wordData.id} 
                        data={wordData} 
                        stackIndex={i}
                        onNext={handleNextWord}
                        onHard={handleNextWord}
                    />
                )).reverse()} 
            </div>
        </div>
      )}

      {/* STATE: ORACLE READY (Modal) */}
      {appState === 'oracle_ready' && (
          <div className="absolute inset-0 z-[100] bg-midnight/90 backdrop-blur-lg flex flex-col items-center justify-center animate-fade-in">
              <div className="absolute inset-0 bg-gold/5 animate-pulse"></div>
              
              <div className="relative flex flex-col items-center text-center p-8">
                  {/* Glowing Slots */}
                  <div className="flex gap-4 mb-10">
                      {readingCards.map((card, i) => (
                          <div key={i} className="w-16 h-24 bg-gold text-midnight rounded flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(197,160,89,0.5)] animate-[float_3s_ease-in-out_infinite]" style={{ animationDelay: `${i*0.2}s` }}>
                              {card.icon}
                          </div>
                      ))}
                  </div>

                  <h2 className="text-3xl font-mystic text-gold text-glow mb-4 tracking-wider">The Oracle is Ready</h2>
                  <p className="text-parchment/80 font-serif italic mb-10 max-w-xs">
                      "The words have been spoken. The path is clear. Reveal your truth."
                  </p>

                  <button 
                    onClick={handleEnterSanctuary}
                    className="group relative px-8 py-3 bg-transparent border border-gold/50 text-gold font-mystic text-lg uppercase tracking-[0.2em] hover:bg-gold hover:text-midnight hover:shadow-[0_0_40px_rgba(197,160,89,0.6)] transition-all duration-500"
                  >
                      Reveal Truth
                  </button>
              </div>
          </div>
      )}

      {/* STATE: ORACLE READING (Sanctuary) - FIXED LAYOUT NO SCROLL */}
      {appState === 'oracle_reading' && (
          <div className="absolute inset-0 z-[100] bg-[#1a1025] flex flex-col overflow-hidden animate-fade-in">
              
              {/* Background Stars */}
              <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-[pulse_5s_infinite]"></div>

              {/* Header */}
              <div className="flex-none flex justify-between items-center p-6 z-10">
                  <h3 className="font-mystic text-purple-300 tracking-widest text-sm">THE SANCTUARY</h3>
                  <button onClick={handleReset} className="text-white/20 hover:text-white">✕</button>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col items-center relative z-10 px-6 pb-6">
                  
                  {/* --- TOP: CARD DISPLAY AREA --- */}
                  {/* Fixed height container for cards to ensure they don't jump around */}
                  <div className="h-[220px] w-full flex items-center justify-center mb-4 perspective-1000">
                     {/* Show Cards Only if Topic Selected */}
                     {oracleTopic && (
                         <div className="flex gap-4 items-center justify-center w-full">
                            {readingCards.map((card, i) => {
                                const style = getOracleCardStyle(i);
                                return (
                                    <div 
                                      key={i}
                                      className={`w-28 h-44 rounded-lg relative preserve-3d transition-all duration-700 ease-out`}
                                      style={{
                                          ...style,
                                          // Override transform if needed, but style object handles scale/translate
                                          transformStyle: 'preserve-3d',
                                          transform: `${style.isFlipped ? 'rotateY(0)' : 'rotateY(180deg)'} ${style.transform}`
                                      }}
                                    >
                                        {/* FRONT (Revealed) */}
                                        <div className="absolute inset-0 backface-hidden bg-midnight rounded-lg border border-purple-500/50 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                                            <div className="text-5xl mb-3">{card.icon}</div>
                                            <div className="text-[10px] text-purple-200 text-center font-mystic px-1 leading-tight">{card.name_cn}</div>
                                            {/* Position Label */}
                                            <div className="absolute -top-3 bg-purple-900 border border-purple-500/50 text-[8px] px-2 py-0.5 rounded-full text-purple-200 uppercase tracking-widest">
                                                {i === 0 ? 'STATUS' : i === 1 ? 'OBSTACLE' : 'REVELATION'}
                                            </div>
                                        </div>
                                        
                                        {/* BACK (Hidden) */}
                                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-obsidian rounded-lg border border-purple-900 flex items-center justify-center shadow-lg">
                                            <div className="text-purple-900/50 text-2xl animate-pulse">✦</div>
                                        </div>
                                    </div>
                                );
                            })}
                         </div>
                     )}
                  </div>

                  {/* --- BOTTOM: DYNAMIC TEXT AREA --- */}
                  <div className="flex-1 w-full max-w-md bg-midnight/40 border border-purple-500/20 rounded-xl backdrop-blur-md p-6 relative overflow-hidden flex flex-col items-center justify-center">
                      
                      {/* 1. SELECTION PHASE */}
                      {!oracleTopic && (
                          <div className="w-full animate-fade-in text-center">
                              <h2 className="text-xl font-serif text-purple-100 italic mb-8">"What do you seek today?"</h2>
                              <div className="grid grid-cols-2 gap-4 w-full">
                                  {(['love', 'wealth', 'energy', 'decision'] as OracleTopic[]).map(topic => (
                                      <button
                                        key={topic}
                                        onClick={() => handleTopicSelect(topic)}
                                        className="py-4 border border-purple-500/30 bg-purple-900/10 rounded hover:bg-purple-500/20 hover:border-purple-400 transition-all text-purple-200 font-mystic tracking-wider text-sm flex flex-col items-center gap-2 group"
                                      >
                                          <span className="text-xl group-hover:scale-110 transition-transform">
                                            {topic === 'love' ? '💘' : topic === 'wealth' ? '💰' : topic === 'energy' ? '🌟' : '⚔️'}
                                          </span>
                                          {topic.toUpperCase()}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}

                      {/* 2. LOADING PHASE */}
                      {oracleTopic && !oracleResult && (
                          <div className="flex flex-col items-center animate-fade-in">
                               <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                               <span className="text-purple-300/50 font-mystic tracking-widest text-xs animate-pulse">
                                  DIVINING THE PATH...
                               </span>
                          </div>
                      )}

                      {/* 3. REVEAL STEPS (LINEAR NARRATIVE) */}
                      {oracleResult && (
                          <div className="w-full h-full flex flex-col">
                              
                              {/* Content Container with Transition */}
                              <div className="flex-1 flex flex-col justify-center items-center text-center">
                                  
                                  {/* STEP 1: STATUS */}
                                  {revealStep === 1 && (
                                      <div className="animate-[pop-in_0.5s]">
                                          <span className="text-xs text-purple-400 font-bold uppercase tracking-[0.2em] mb-3 block">Step 1: The Present</span>
                                          <h3 className="text-xl font-mystic text-white mb-4">{oracleResult.card1_title}</h3>
                                          <p className="font-serif text-purple-100/90 leading-relaxed italic">
                                              "{oracleResult.card1_content}"
                                          </p>
                                      </div>
                                  )}

                                  {/* STEP 2: OBSTACLE */}
                                  {revealStep === 2 && (
                                      <div className="animate-[pop-in_0.5s]">
                                          <span className="text-xs text-red-400 font-bold uppercase tracking-[0.2em] mb-3 block">Step 2: The Obstacle</span>
                                          <h3 className="text-xl font-mystic text-white mb-4">{oracleResult.card2_title}</h3>
                                          <p className="font-serif text-purple-100/90 leading-relaxed italic">
                                              "{oracleResult.card2_content}"
                                          </p>
                                      </div>
                                  )}

                                  {/* STEP 3: REVELATION */}
                                  {revealStep === 3 && (
                                      <div className="animate-[pop-in_0.5s]">
                                          <span className="text-xs text-emerald-400 font-bold uppercase tracking-[0.2em] mb-3 block">Step 3: The Revelation</span>
                                          <h3 className="text-xl font-mystic text-white mb-4">{oracleResult.card3_title}</h3>
                                          <p className="font-serif text-purple-100/90 leading-relaxed italic">
                                              "{oracleResult.card3_content}"
                                          </p>
                                      </div>
                                  )}

                                  {/* STEP 4: SYNTHESIS */}
                                  {revealStep === 4 && (
                                      <div className="animate-[unroll_0.8s] w-full text-left">
                                          <div className="text-center mb-4">
                                              <h3 className="text-lg font-mystic text-gold text-glow mb-1">{oracleResult.synthesis_title}</h3>
                                              <div className="w-16 h-[2px] bg-gold/50 mx-auto"></div>
                                          </div>
                                          <p className="font-serif text-sm text-parchment leading-7 text-justify bg-black/20 p-4 rounded-lg border border-white/5">
                                              {oracleResult.synthesis_content}
                                          </p>
                                      </div>
                                  )}

                              </div>

                              {/* NEXT BUTTON */}
                              <div className="mt-6 flex justify-center w-full">
                                  {revealStep < 4 ? (
                                      <button 
                                        onClick={nextReveal}
                                        className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-mystic tracking-widest text-xs uppercase rounded shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all active:scale-95 animate-pulse"
                                      >
                                          {revealStep === 0 ? "Reveal First Card" : revealStep === 3 ? "Show Conclusion" : "Reveal Next"}
                                      </button>
                                  ) : (
                                      <button 
                                        onClick={handleReset} 
                                        className="w-full py-3 text-xs text-purple-500/50 hover:text-purple-300 tracking-widest uppercase transition-colors"
                                      >
                                          Close Circle
                                      </button>
                                  )}
                              </div>

                          </div>
                      )}

                  </div>

              </div>
          </div>
      )}

    </Layout>
  );
};

export default App;