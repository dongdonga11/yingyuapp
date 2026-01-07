import React, { useState } from 'react';
import Layout from './components/Layout';
import WordCard from './components/WordCard';
import TarotTable from './components/TarotTable';
import DailyProphecyCard from './components/DailyProphecy';
import ShareCard from './components/ShareCard';
import Bookshelf from './components/Bookshelf';
import NavBar from './components/NavBar';
import Profile from './components/Profile';
import { initialVocabulary } from './data/vocabulary';
import { getProphecy } from './data/tarot';
import { getOracleReading } from './services/geminiService';
import { WordData, TarotArcana, DailyProphecy, OracleTopic, TarotReadingResponse, Grimoire, AppState } from './types';

// Tab Logic Type
type MainTab = 'oracle' | 'grimoire' | 'profile';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('library'); // Internal Flow State
  const [activeTab, setActiveTab] = useState<MainTab>('oracle'); // Navigation State
  
  // Book State
  const [selectedBook, setSelectedBook] = useState<Grimoire | null>(null);

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
  
  // Reveal State
  const [revealStep, setRevealStep] = useState<number>(0);

  // Share State
  const [showShareCard, setShowShareCard] = useState(false);

  // --- TAB SWITCHING HANDLER ---
  const handleTabChange = (tab: MainTab) => {
      setActiveTab(tab);

      // Map Tabs to Internal Logic if needed
      if (tab === 'oracle') {
          // If we are in 'profile' or 'learning', go back to where we left off in Oracle?
          // Or strictly go to Altar?
          // For simplicity: If no reading exists, go to Altar. If reading exists, go to Prophecy/Oracle Ready.
          if (appState === 'learning' || appState === 'profile') {
             // Just switch the view, the internal appState can stay valid or reset?
             // Let's rely on Render Logic to show the right thing based on 'activeTab'.
             // But we might need to sync appState if we want to "reset" flow.
             // Actually, let's keep appState as the "Oracle/Learning" flow controller.
          }
      }
      else if (tab === 'grimoire') {
          // Switch to learning view
          // If deck is empty, maybe we should show a "Empty Deck" state in the render logic
      }
      else if (tab === 'profile') {
          // Just switch view
      }
  };

  const handleBookSelected = (book: Grimoire) => {
      setSelectedBook(book);
      setAppState('altar');
      setActiveTab('oracle');
  };
  
  const handleChangeBook = () => {
      setAppState('library');
      setSelectedBook(null); // Reset
  };

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
      
      // Move to Reveal Phase (Oracle Tab)
      setAppState('prophecy_reveal');
  };

  const handleAcceptProphecy = () => {
      setProphecyData(null);
      // Automatically switch to Learning Tab
      setAppState('learning'); 
      setActiveTab('grimoire');
  };

  const progress = Math.round(((currentIndex + 1) / deck.length) * 100);

  const handleNextWord = async () => {
     let nextUnlocked = new Set(unlockedIndices);
     const currentCard = deck[currentIndex];
     
     if (currentCard.hiddenTarot) {
         const foundIndex = readingCards.findIndex(c => c.id === currentCard.hiddenTarot?.id);
         if (foundIndex !== -1) {
             nextUnlocked.add(foundIndex);
             setUnlockedIndices(nextUnlocked);
         }
     }

     if (currentIndex < deck.length - 1) {
         setCurrentIndex(prev => prev + 1);
     } else {
         if (nextUnlocked.size === 3) {
             setTimeout(() => {
                 setAppState('oracle_ready');
                 setActiveTab('oracle'); // Force switch back to Oracle
             }, 1000);
         } else {
             setCurrentIndex(0); 
         }
     }
  };

  const handleEnterSanctuary = () => {
      setAppState('oracle_reading');
      setRevealStep(0); 
  };

  const handleTopicSelect = async (topic: OracleTopic) => {
      if(isConsulting) return;
      setOracleTopic(topic);
      setIsConsulting(true);
      const result = await getOracleReading(readingCards, topic);
      setOracleResult(result);
      setIsConsulting(false);
      if(result) {
          setRevealStep(1); 
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
      setShowShareCard(false);
      setActiveTab('oracle');
  };

  // --- RENDER HELPERS ---

  const currentActiveArcana = readingCards[0]; 

  const getOracleCardStyle = (index: number) => {
      const isRevealed = revealStep >= (index + 1);
      const isCurrentFocus = revealStep === (index + 1);
      const isSummary = revealStep === 4;

      if (isSummary) {
          return {
              opacity: 1,
              transform: 'scale(0.8) translateY(0)',
              filter: 'grayscale(0.3)',
              isFlipped: true
          };
      }
      if (isCurrentFocus) {
          return {
              opacity: 1,
              transform: 'scale(1.1) translateY(10px)',
              filter: 'brightness(1.2) drop-shadow(0 0 15px rgba(197,160,89,0.5))',
              zIndex: 50,
              isFlipped: true
          };
      }
      if (isRevealed) {
          return {
              opacity: 0.5,
              transform: 'scale(0.9)',
              filter: 'grayscale(0.5)',
              isFlipped: true
          };
      }
      return {
          opacity: 0.8,
          transform: 'scale(0.95)',
          filter: 'brightness(0.5)',
          isFlipped: false
      };
  };

  // --- CONDITIONAL CONTENT RENDERER ---
  // Decides what to show based on `activeTab` AND `appState`
  
  const renderContent = () => {
      
      // 1. PROFILE TAB
      if (activeTab === 'profile') {
          return (
            <Profile 
                currentBook={selectedBook} 
                collectedCards={readingCards} // In real app, this would be a cumulative list
                onChangeBook={handleChangeBook}
            />
          );
      }

      // 2. GRIMOIRE TAB (Learning)
      if (activeTab === 'grimoire') {
          // If deck is empty (not started yet), show placeholder
          if (deck.length === 0) {
              return (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 animate-fade-in">
                      <div className="text-4xl mb-4 opacity-50">🔒</div>
                      <p className="text-parchment/60 font-serif italic mb-4">"The pages are blank. Consult the Oracle to reveal your path."</p>
                      <button 
                        onClick={() => setActiveTab('oracle')}
                        className="text-gold border border-gold/30 px-4 py-2 rounded hover:bg-gold/10 transition-colors"
                      >
                          Go to Oracle
                      </button>
                  </div>
              );
          }

          // Otherwise show the Learning View
          return (
            <div className="w-full h-full flex flex-col relative animate-fade-in">
                {/* Top Right Tarot Slots (Mini Display) */}
                <div className="absolute right-4 top-16 z-50 flex flex-col gap-2 pointer-events-none scale-75 origin-top-right opacity-50">
                    {readingCards.map((card, i) => {
                        const isUnlocked = unlockedIndices.has(i);
                        return (
                            <div key={i} className={`w-10 h-14 rounded border flex items-center justify-center ${isUnlocked ? 'bg-gold/20 border-gold' : 'bg-black/20 border-white/10'}`}>
                                {isUnlocked && <div>{card.icon}</div>}
                            </div>
                        );
                    })}
                </div>

                {/* Deck Counter */}
                <div className="absolute right-6 bottom-32 z-50 pointer-events-none flex flex-col items-center">
                    <div className="bg-midnight/80 px-2 py-1 rounded text-xs text-gold font-bold">
                        {currentIndex + 1} / {deck.length}
                    </div>
                </div>

                {/* Top Bar */}
                <div className="pt-6 px-6 pr-20 mb-4 flex-none relative z-40">
                    <div className="flex items-center gap-3 mb-2">
                        {/* We don't reset here, we just navigate. Reset is in Oracle. */}
                        <span className="text-xs uppercase tracking-[0.2em] text-gold/80">{currentActiveArcana?.name_cn || "Unknown"}</span>
                    </div>
                    <div className="h-[2px] bg-white/10 rounded-full overflow-hidden w-full max-w-[200px]">
                        <div className="h-full transition-all duration-500 shadow-[0_0_10px_currentColor]" style={{ width: `${progress}%`, backgroundColor: currentActiveArcana?.theme_color || '#C5A059' }}></div>
                    </div>
                </div>

                {/* Cards */}
                <div className="flex-1 w-full relative px-4 pb-28 overflow-hidden z-10">
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
          );
      }

      // 3. ORACLE TAB (Default)
      // Checks internal appState
      
      if (appState === 'altar') {
          return (
            <div className="relative w-full h-full flex flex-col pb-24">
                {selectedBook && (
                  <div className="absolute top-4 left-4 z-50 text-white/20 text-xs flex items-center gap-2">
                      <span>{selectedBook.icon}</span>
                      <span className="uppercase tracking-wider">{selectedBook.title}</span>
                  </div>
                )}
                <TarotTable onReadingComplete={handleReadingComplete} />
            </div>
          );
      }

      if (appState === 'prophecy_reveal' && prophecyData) {
          return <DailyProphecyCard data={prophecyData} onClose={handleAcceptProphecy} />;
      }

      // If user is "learning" but clicked back to Oracle tab, show a "In Progress" or summary state?
      // Or just redirect them to Altar if they want to start over? 
      // For now, let's show the Oracle Ready state if they collected everything, otherwise Altar.
      if (appState === 'learning') {
          // If they are in learning, Oracle tab acts as "Home".
          // Maybe show a "Mission In Progress" dashboard?
          return (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 animate-fade-in">
                  <div className="w-24 h-24 rounded-full border-4 border-gold/20 flex items-center justify-center animate-spin-slow mb-6">
                      <span className="text-4xl">⏳</span>
                  </div>
                  <h2 className="font-mystic text-xl text-gold mb-2">Mission Active</h2>
                  <p className="text-center text-parchment/60 font-serif italic mb-6">
                      "You are currently traversing the path of {currentActiveArcana?.name}. Complete the Grimoire to return here."
                  </p>
                  <button 
                    onClick={() => setActiveTab('grimoire')}
                    className="px-6 py-3 bg-gold text-midnight font-bold tracking-widest uppercase text-xs rounded shadow-glow"
                  >
                      Continue Journey
                  </button>
                  <button 
                    onClick={handleReset}
                    className="mt-4 text-xs text-white/30 hover:text-white underline"
                  >
                      Abandon Quest (Reset)
                  </button>
              </div>
          );
      }

      if (appState === 'oracle_ready') {
         return (
          <div className="absolute inset-0 z-[50] bg-midnight/90 backdrop-blur-lg flex flex-col items-center justify-center animate-fade-in pb-24">
              <div className="absolute inset-0 bg-gold/5 animate-pulse"></div>
              
              <div className="relative flex flex-col items-center text-center p-8">
                  <div className="flex gap-4 mb-10">
                      {readingCards.map((card, i) => (
                          <div key={i} className="w-16 h-24 bg-gold text-midnight rounded flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(197,160,89,0.5)] animate-[float_3s_ease-in-out_infinite]" style={{ animationDelay: `${i*0.2}s` }}>
                              {card.icon}
                          </div>
                      ))}
                  </div>
                  <h2 className="text-3xl font-mystic text-gold text-glow mb-4 tracking-wider">The Oracle is Ready</h2>
                  <button 
                    onClick={handleEnterSanctuary}
                    className="group relative px-8 py-3 bg-transparent border border-gold/50 text-gold font-mystic text-lg uppercase tracking-[0.2em] hover:bg-gold hover:text-midnight hover:shadow-[0_0_40px_rgba(197,160,89,0.6)] transition-all duration-500"
                  >
                      Reveal Truth
                  </button>
              </div>
          </div>
         );
      }

      if (appState === 'oracle_reading') {
         return (
            <div className="absolute inset-0 z-[50] bg-[#1a1025] flex flex-col overflow-hidden animate-fade-in pb-24">
              <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-[pulse_5s_infinite]"></div>
              
              <div className="flex-none flex justify-between items-center p-6 z-10">
                  <h3 className="font-mystic text-purple-300 tracking-widest text-sm">THE SANCTUARY</h3>
                  <button onClick={handleReset} className="text-white/20 hover:text-white">✕</button>
              </div>

              <div className="flex-1 flex flex-col items-center relative z-10 px-6 pb-6 overflow-y-auto custom-scrollbar">
                  {/* --- TOP: CARD DISPLAY AREA --- */}
                  <div className="h-[180px] w-full flex items-center justify-center mb-4 perspective-1000 flex-none">
                     {oracleTopic && (
                         <div className="flex gap-4 items-center justify-center w-full">
                            {readingCards.map((card, i) => {
                                const style = getOracleCardStyle(i);
                                return (
                                    <div 
                                      key={i}
                                      className={`w-24 h-36 rounded-lg relative preserve-3d transition-all duration-700 ease-out`}
                                      style={{
                                          ...style,
                                          transformStyle: 'preserve-3d',
                                          transform: `${style.isFlipped ? 'rotateY(0)' : 'rotateY(180deg)'} ${style.transform}`
                                      }}
                                    >
                                        <div className="absolute inset-0 backface-hidden bg-midnight rounded-lg border border-purple-500/50 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                                            <div className="text-4xl mb-2">{card.icon}</div>
                                            <div className="text-[9px] text-purple-200 text-center font-mystic px-1 leading-tight">{card.name_cn}</div>
                                        </div>
                                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-obsidian rounded-lg border border-purple-900 flex items-center justify-center shadow-lg">
                                            <div className="text-purple-900/50 text-xl animate-pulse">✦</div>
                                        </div>
                                    </div>
                                );
                            })}
                         </div>
                     )}
                  </div>

                  {/* --- BOTTOM: TEXT AREA --- */}
                  <div className="flex-1 w-full max-w-md bg-midnight/40 border border-purple-500/20 rounded-xl backdrop-blur-md p-6 relative flex flex-col items-center justify-center min-h-[300px]">
                      
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

                      {oracleTopic && !oracleResult && (
                          <div className="flex flex-col items-center animate-fade-in">
                               <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                               <span className="text-purple-300/50 font-mystic tracking-widest text-xs animate-pulse">
                                  DIVINING THE PATH...
                               </span>
                          </div>
                      )}

                      {oracleResult && (
                          <div className="w-full h-full flex flex-col">
                              <div className="flex-1 flex flex-col justify-center items-center text-center">
                                  {revealStep === 1 && (
                                      <div className="animate-[pop-in_0.5s]">
                                          <span className="text-xs text-purple-400 font-bold uppercase tracking-[0.2em] mb-3 block">Step 1: The Present</span>
                                          <h3 className="text-xl font-mystic text-white mb-4">{oracleResult.card1_title}</h3>
                                          <p className="font-serif text-purple-100/90 leading-relaxed italic">"{oracleResult.card1_content}"</p>
                                      </div>
                                  )}
                                  {revealStep === 2 && (
                                      <div className="animate-[pop-in_0.5s]">
                                          <span className="text-xs text-red-400 font-bold uppercase tracking-[0.2em] mb-3 block">Step 2: The Obstacle</span>
                                          <h3 className="text-xl font-mystic text-white mb-4">{oracleResult.card2_title}</h3>
                                          <p className="font-serif text-purple-100/90 leading-relaxed italic">"{oracleResult.card2_content}"</p>
                                      </div>
                                  )}
                                  {revealStep === 3 && (
                                      <div className="animate-[pop-in_0.5s]">
                                          <span className="text-xs text-emerald-400 font-bold uppercase tracking-[0.2em] mb-3 block">Step 3: The Revelation</span>
                                          <h3 className="text-xl font-mystic text-white mb-4">{oracleResult.card3_title}</h3>
                                          <p className="font-serif text-purple-100/90 leading-relaxed italic">"{oracleResult.card3_content}"</p>
                                      </div>
                                  )}
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
                              <div className="mt-6 flex justify-center w-full">
                                  {revealStep < 4 ? (
                                      <button onClick={nextReveal} className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-mystic tracking-widest text-xs uppercase rounded shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all active:scale-95 animate-pulse">
                                          {revealStep === 0 ? "Reveal" : revealStep === 3 ? "Show Conclusion" : "Next"}
                                      </button>
                                  ) : (
                                      <button onClick={() => setShowShareCard(true)} className="w-full py-4 bg-gold text-midnight font-mystic text-sm uppercase tracking-[0.2em] rounded shadow-[0_0_30px_rgba(197,160,89,0.5)] hover:bg-white transition-all hover:scale-105 active:scale-95">
                                          ✧ Crystallize Fate ✧
                                      </button>
                                  )}
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
         );
      }

      return null;
  };

  // --- MAIN RENDER ---

  // Special Case: Initial Load -> Bookshelf (No Nav Bar yet)
  if (appState === 'library') {
      return <Bookshelf onBookSelected={handleBookSelected} />;
  }

  return (
    <Layout themeColor={appState === 'oracle_reading' ? '#9333EA' : currentActiveArcana?.theme_color}>
      
      {/* MAIN CONTENT WRAPPER */}
      <div className="w-full h-full relative overflow-hidden">
          {renderContent()}
      </div>

      {/* NAVIGATION BAR (Always present after library) */}
      <NavBar currentTab={activeTab} onChange={handleTabChange} />

      {/* GLOBAL OVERLAYS */}
      {showShareCard && oracleResult && (
          <ShareCard 
            readingCards={readingCards}
            oracleResult={oracleResult}
            wordCount={deck.length}
            onClose={() => setShowShareCard(false)}
          />
      )}

    </Layout>
  );
};

export default App;