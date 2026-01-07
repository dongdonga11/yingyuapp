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
  const [cardsRevealed, setCardsRevealed] = useState(false); // Controls the flip animation

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
  };

  const handleTopicSelect = async (topic: OracleTopic) => {
      if(isConsulting) return;
      setOracleTopic(topic);
      setIsConsulting(true);
      setCardsRevealed(true); // Trigger Flip

      // Call Gemini
      const result = await getOracleReading(readingCards, topic);
      setOracleResult(result);
      setIsConsulting(false);
  };

  const handleReset = () => {
      setAppState('altar');
      setReadingCards([]);
      setUnlockedIndices(new Set());
      setProphecyData(null);
      setOracleTopic(null);
      setOracleResult(null);
      setCardsRevealed(false);
  };

  const currentActiveArcana = readingCards[0]; 

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

      {/* STATE: ORACLE READING (Sanctuary) */}
      {appState === 'oracle_reading' && (
          <div className="absolute inset-0 z-[100] bg-[#1a1025] flex flex-col items-center justify-center overflow-hidden animate-fade-in">
              
              {/* Stars Background */}
              <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-[pulse_5s_infinite]"></div>

              <div className="relative w-full max-w-lg h-full flex flex-col p-6 z-10">
                  
                  {/* Header */}
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-mystic text-purple-300 tracking-widest text-sm">THE SANCTUARY</h3>
                      <button onClick={handleReset} className="text-white/20 hover:text-white">✕</button>
                  </div>

                  {/* CARDS DISPLAY AREA */}
                  <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px]">
                      
                      {/* The 3 Cards */}
                      <div className="flex gap-4 items-center justify-center w-full perspective-1000 mb-8">
                          {readingCards.map((card, i) => (
                              <div 
                                key={i}
                                className={`
                                    w-24 h-40 rounded-lg relative preserve-3d transition-transform duration-1000 ease-in-out
                                    ${cardsRevealed ? 'rotate-y-0' : 'rotate-y-180'}
                                `}
                                style={{ transitionDelay: `${i * 300}ms` }}
                              >
                                  {/* FRONT (Revealed) */}
                                  <div className="absolute inset-0 backface-hidden bg-midnight rounded-lg border border-purple-500/50 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                                      <div className="text-4xl mb-2">{card.icon}</div>
                                      <div className="text-[10px] text-purple-200 text-center font-mystic px-1 leading-tight">{card.name}</div>
                                  </div>
                                  
                                  {/* BACK (Hidden) */}
                                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-obsidian rounded-lg border border-purple-900 flex items-center justify-center">
                                      <div className="text-purple-900/50 text-2xl">✦</div>
                                  </div>
                              </div>
                          ))}
                      </div>

                      {/* QUESTION SELECTION (Visible if no topic selected) */}
                      {!oracleTopic && (
                          <div className="w-full animate-fade-in flex flex-col items-center">
                              <h2 className="text-xl font-serif text-purple-100 italic mb-6 text-center">"What do you seek today?"</h2>
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

                      {/* LOADING OR RESULT */}
                      {oracleTopic && (
                          <div className="w-full flex-1 flex flex-col items-center animate-fade-in">
                              
                              {/* LOADING */}
                              {(isConsulting || !oracleResult) ? (
                                  <div className="flex flex-col items-center justify-center h-full">
                                      <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                                      <span className="text-purple-300/50 font-mystic tracking-widest text-xs animate-pulse">
                                          CONSULTING THE STARS...
                                      </span>
                                  </div>
                              ) : (
                                  /* RESULT DISPLAY */
                                  <div className="w-full h-full overflow-y-auto custom-scrollbar p-2 animate-[unroll_0.8s_ease-out]">
                                      
                                      <div className="bg-midnight/60 border border-purple-500/30 rounded-lg p-6 backdrop-blur-md">
                                          {/* Vibe */}
                                          <div className="mb-6 text-center">
                                              <span className="text-xs text-purple-400 uppercase tracking-[0.2em] block mb-2">The Vibe</span>
                                              <h3 className="text-lg font-serif italic text-purple-100 leading-relaxed">"{oracleResult.vibe}"</h3>
                                          </div>

                                          <div className="w-full h-[1px] bg-purple-500/20 mb-6"></div>

                                          {/* Analysis */}
                                          <div className="mb-6">
                                              <span className="text-xs text-purple-400 uppercase tracking-[0.2em] block mb-2">The Reading</span>
                                              <p className="text-sm text-parchment/80 leading-7 font-serif text-justify">
                                                  {oracleResult.analysis}
                                              </p>
                                          </div>

                                          {/* Advice */}
                                          <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded text-center">
                                              <span className="text-xs text-purple-300 font-bold uppercase tracking-[0.1em] block mb-1">Guidance</span>
                                              <p className="text-purple-100 font-serif">
                                                  {oracleResult.advice}
                                              </p>
                                          </div>
                                          
                                          <button onClick={handleReset} className="mt-6 w-full py-3 text-xs text-purple-500/50 hover:text-purple-300 tracking-widest uppercase transition-colors">
                                              Close Circle
                                          </button>
                                      </div>
                                  </div>
                              )}
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