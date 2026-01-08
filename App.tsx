import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import WordCard from './components/WordCard';
import TarotTable from './components/TarotTable';
import DailyProphecyCard from './components/DailyProphecy';
import ShareCard from './components/ShareCard';
import Bookshelf from './components/Bookshelf';
import NavBar from './components/NavBar';
import Profile from './components/Profile';
import StartScreen from './components/StartScreen';
import { initialVocabulary } from './data/vocabulary';
import { TAROT_DECK } from './data/tarot'; // Import for mock data
import { getProphecy } from './data/tarot';
import { getOracleReading } from './services/geminiService';
import { WordData, TarotArcana, DailyProphecy, OracleTopic, TarotReadingResponse, Grimoire, AppState, ProphecyRecord } from './types';

// Tab Logic Type
type MainTab = 'oracle' | 'grimoire' | 'profile';
type RitualStage = 'selection' | 'incantation' | 'revelation';

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
  
  // History State (Mock Data for Profile)
  const [prophecyHistory, setProphecyHistory] = useState<ProphecyRecord[]>([
      {
          id: 'mock-1',
          date: 'October 24',
          card: TAROT_DECK.find(c => c.id === 'Magician') || TAROT_DECK[1],
          prophecy_text: "手中的魔杖已准备好，今日的积累将构筑明日的城堡。",
          words_sealed: 15
      },
  ]);

  // Oracle Reading State
  const [ritualStage, setRitualStage] = useState<RitualStage>('selection');
  const [oracleTopic, setOracleTopic] = useState<OracleTopic | null>(null);
  const [oracleResult, setOracleResult] = useState<TarotReadingResponse | null>(null);
  const [loadingText, setLoadingText] = useState("Invoking the stars...");
  const [showFlash, setShowFlash] = useState(false); // For the white-out effect
  
  // Share State
  const [showShareCard, setShowShareCard] = useState(false);

  // --- TAB SWITCHING HANDLER ---
  const handleTabChange = (tab: MainTab) => {
      setActiveTab(tab);
      // If switching back to Oracle tab, check if we were in the middle of something.
      if (tab === 'oracle' && appState === 'library' && selectedBook) {
          setAppState('oracle_start');
      }
  };

  // Called when user selects a book from the Grimoire Tab (Library)
  const handleBookSelected = (book: Grimoire) => {
      setSelectedBook(book);
      setAppState('oracle_start'); 
      setActiveTab('oracle');
  };
  
  const handleChangeBook = () => {
      setActiveTab('grimoire');
  };

  const handleStartOracle = () => {
      setAppState('altar');
  };

  const handleReadingComplete = (cards: TarotArcana[]) => {
      setReadingCards(cards);
      
      const firstCard = cards[0];
      const filteredWords = firstCard.filter_logic(initialVocabulary);
      
      let baseDeck = filteredWords.length > 0 ? filteredWords : initialVocabulary;
      while (baseDeck.length < 6) {
          baseDeck = [...baseDeck, ...baseDeck];
      }

      // Hide Tarot Cards in Deck logic
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
      setAppState('prophecy_reveal');

      const newRecord: ProphecyRecord = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
          card: firstCard,
          prophecy_text: p.prophecy_text.split('。')[0] + '。',
          words_sealed: finalDeck.length
      };
      setProphecyHistory(prev => [newRecord, ...prev]);
  };

  const handleAcceptProphecy = () => {
      setProphecyData(null);
      setAppState('learning'); 
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
             }, 1000);
         } else {
             setCurrentIndex(0); 
         }
     }
  };

  const handleEnterSanctuary = () => {
      setAppState('oracle_reading');
      setRitualStage('selection'); // Start at Selection
      setOracleTopic(null);
      setOracleResult(null);
  };

  // --- RITUAL LOGIC ---

  // 1. Select Topic (Laser Beam Effect)
  const handleTopicSelect = (topic: OracleTopic) => {
      setOracleTopic(topic);
  };

  // 2. Start Incantation (Click Orb)
  const handleConfirmRitual = async () => {
      if (!oracleTopic) return;
      
      setRitualStage('incantation');
      
      // Loading Text Cycle
      const texts = [
          "Aligning the stars...",
          "Consulting ancient roots...",
          "Weaving your fate...",
          "The Void answers..."
      ];
      let tIndex = 0;
      setLoadingText(texts[0]);
      const textInterval = setInterval(() => {
          tIndex = (tIndex + 1) % texts.length;
          setLoadingText(texts[tIndex]);
      }, 1500);

      // API Call
      const result = await getOracleReading(readingCards, oracleTopic);
      
      // Stop Cycling
      clearInterval(textInterval);

      if (result) {
          setOracleResult(result);
          // Trigger Flash and Transition
          setShowFlash(true);
          setTimeout(() => {
              setRitualStage('revelation');
              setShowFlash(false);
          }, 1200); // Wait for flash peak
      } else {
          setRitualStage('selection'); // Reset on error
      }
  };

  const handleReset = () => {
      setAppState('oracle_start');
      setReadingCards([]);
      setUnlockedIndices(new Set());
      setProphecyData(null);
      setOracleTopic(null);
      setOracleResult(null);
      setShowShareCard(false);
      setShowFlash(false);
  };

  // --- RENDER HELPERS ---

  const currentActiveArcana = readingCards[0]; 

  // --- COMPONENT: TOPIC NODE (The Icons on the Hexagram) ---
  const TopicNode = ({ type, icon, label, positionClass, color }: any) => {
      const isSelected = oracleTopic === type;
      return (
          <button
            onClick={() => handleTopicSelect(type)}
            className={`absolute flex flex-col items-center justify-center transition-all duration-300 group ${positionClass} ${ritualStage === 'incantation' ? 'opacity-30 pointer-events-none' : ''}`}
          >
              <div 
                  className={`
                      w-12 h-12 rounded-full border bg-black/60 backdrop-blur-sm flex items-center justify-center text-xl transition-all duration-300
                      ${isSelected ? 'scale-125 border-white shadow-[0_0_15px_currentColor]' : 'border-white/20 hover:border-white/50 hover:scale-110'}
                  `}
                  style={{ color: color, borderColor: isSelected ? color : undefined }}
              >
                  {icon}
              </div>
              <span className={`text-[9px] font-mystic mt-2 uppercase tracking-widest transition-opacity ${isSelected ? 'opacity-100 text-glow' : 'opacity-50 group-hover:opacity-100'}`} style={{color}}>{label}</span>
          </button>
      );
  };

  // --- CONDITIONAL CONTENT RENDERER ---
  
  const renderContent = () => {
      
      if (activeTab === 'grimoire') return <Bookshelf onBookSelected={handleBookSelected} />;
      
      if (activeTab === 'profile') {
          return (
            <Profile 
                currentBook={selectedBook} 
                prophecyHistory={prophecyHistory}
                onChangeBook={handleChangeBook}
            />
          );
      }
      
      if (appState === 'oracle_start' && selectedBook) {
          return <StartScreen book={selectedBook} onStart={handleStartOracle} />;
      }

      if (appState === 'altar') {
          return (
            <div className="relative w-full h-full flex flex-col pb-20">
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

      if (appState === 'learning') {
          return (
            <div className="w-full h-full flex flex-col relative animate-fade-in">
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

                <div className="absolute right-6 bottom-24 z-50 pointer-events-none flex flex-col items-center">
                    <div className="bg-midnight/80 px-2 py-1 rounded text-xs text-gold font-bold">
                        {currentIndex + 1} / {deck.length}
                    </div>
                </div>

                <div className="pt-6 px-6 pr-20 mb-4 flex-none relative z-40">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs uppercase tracking-[0.2em] text-gold/80">{currentActiveArcana?.name_cn || "Unknown"}</span>
                        <button onClick={handleReset} className="text-[10px] text-white/20 hover:text-white px-2">ABORT</button>
                    </div>
                    <div className="h-[2px] bg-white/10 rounded-full overflow-hidden w-full max-w-[200px]">
                        <div className="h-full transition-all duration-500 shadow-[0_0_10px_currentColor]" style={{ width: `${progress}%`, backgroundColor: currentActiveArcana?.theme_color || '#C5A059' }}></div>
                    </div>
                </div>

                <div className="flex-1 w-full relative px-4 pb-20 overflow-hidden z-10">
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

      if (appState === 'oracle_ready') {
         return (
          <div className="absolute inset-0 z-[50] bg-midnight/90 backdrop-blur-lg flex flex-col items-center justify-center animate-fade-in pb-20">
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
                      Enter The Void
                  </button>
              </div>
          </div>
         );
      }

      // =========================================================================
      // THE ASTRAL RITUAL (REFACTORED)
      // =========================================================================
      if (appState === 'oracle_reading') {
         
         const topicColors = {
             love: '#EC4899', // Pink
             wealth: '#EAB308', // Gold
             decision: '#EF4444', // Red
             energy: '#A855F7', // Purple
         };

         const activeColor = oracleTopic ? topicColors[oracleTopic] : '#64748B';

         return (
            <div className="absolute inset-0 z-[50] bg-[#050508] flex flex-col overflow-hidden animate-fade-in pb-20">
              
              {/* --- 1. THE FLASH (Transitions Phases) --- */}
              {showFlash && (
                  <div className="absolute inset-0 z-[999] bg-white animate-white-out pointer-events-none"></div>
              )}

              {/* --- 2. BACKGROUND (Deep Space) --- */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050508] to-black pointer-events-none"></div>
              <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-[pulse_8s_infinite]"></div>

              {/* Top Bar */}
              <div className="flex-none flex justify-between items-center p-6 z-40 relative">
                  <h3 className="font-mystic text-white/30 tracking-widest text-xs">THE ASTRAL VOID</h3>
                  <button onClick={handleReset} className="text-white/20 hover:text-white">✕</button>
              </div>

              {/* ============================================================
                  STAGE A: SELECTION & INCANTATION (The Magic Array)
                 ============================================================ */}
              {ritualStage !== 'revelation' && (
                  <div className="flex-1 flex flex-col items-center justify-center relative z-10 transition-opacity duration-1000">
                      
                      {/* --- THE CARDS (Flying into position) --- */}
                      <div className={`absolute top-16 flex gap-4 transition-all duration-1000 ${ritualStage === 'incantation' ? 'scale-75 opacity-80 animate-pulse' : 'scale-100'}`}>
                          {readingCards.map((card, i) => (
                              <div key={i} className="w-12 h-20 bg-midnight border border-white/20 rounded flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                  <span className="text-xl">{card.icon}</span>
                              </div>
                          ))}
                          {/* Energy Beams to Orb (During Incantation) */}
                          {ritualStage === 'incantation' && (
                              <div className="absolute top-full left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-b from-white to-transparent opacity-50"></div>
                          )}
                      </div>

                      {/* --- THE CENTRAL ORB (Nebula) --- */}
                      <div className="relative w-[340px] h-[340px] flex items-center justify-center mt-12">
                          
                          {/* 1. Hexagram Array (SVG) */}
                          <svg 
                             className={`absolute w-full h-full text-white/10 transition-all duration-[2000ms] ${ritualStage === 'incantation' ? 'animate-[spin_4s_linear_infinite] opacity-50 scale-110' : 'animate-[spin_60s_linear_infinite]'}`} 
                             viewBox="0 0 100 100"
                          >
                               <polygon points="50,5 90,80 10,80" fill="none" stroke="currentColor" strokeWidth="0.5" />
                               <polygon points="50,95 90,20 10,20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                               <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
                          </svg>

                          {/* 2. Runes (Only during Incantation) */}
                          {ritualStage === 'incantation' && (
                              <div className="absolute inset-[-40px] border border-dashed border-gold/30 rounded-full animate-[spin_10s_linear_infinite_reverse]">
                                  <div className="absolute top-0 left-1/2 -translate-x-1/2 text-xs text-gold font-mystic">Ω</div>
                                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-gold font-mystic">α</div>
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-gold font-mystic">Σ</div>
                                  <div className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-gold font-mystic">∆</div>
                              </div>
                          )}

                          {/* 3. The Orb (Interactive) */}
                          <div 
                              onClick={handleConfirmRitual}
                              className={`
                                  relative z-20 rounded-full cursor-pointer transition-all duration-1000
                                  ${ritualStage === 'incantation' ? 'w-48 h-48 shadow-[0_0_80px_currentColor] animate-shake' : 'w-40 h-40 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105'}
                              `}
                              style={{ color: activeColor }}
                          >
                              {/* Fluid Texture */}
                              <div 
                                className="absolute inset-0 rounded-full overflow-hidden"
                                style={{
                                    background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), ${activeColor} 40%, #000 90%)`,
                                    backgroundSize: '200% 200%',
                                    animation: 'nebula-flow 8s ease infinite'
                                }}
                              ></div>
                              {/* Mist Overlay */}
                              <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay rounded-full"></div>
                              
                              {/* Text Inside Orb */}
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  {ritualStage === 'selection' && !oracleTopic && (
                                      <span className="text-white/60 font-mystic text-xs tracking-widest opacity-50">TOUCH</span>
                                  )}
                                  {ritualStage === 'selection' && oracleTopic && (
                                      <span className="text-white font-mystic text-sm tracking-widest text-glow animate-pulse">CONFIRM</span>
                                  )}
                              </div>
                          </div>

                          {/* 4. Beams (Connecting Node to Orb) */}
                          {oracleTopic && ritualStage === 'selection' && (
                              <div 
                                className="absolute top-1/2 left-1/2 w-1 bg-white shadow-[0_0_10px_white] origin-bottom animate-beam-grow z-0"
                                style={{
                                    height: '140px', // Distance to nodes roughly
                                    transform: `translate(-50%, -100%) rotate(${
                                        oracleTopic === 'love' ? '0deg' : 
                                        oracleTopic === 'wealth' ? '-90deg' : 
                                        oracleTopic === 'energy' ? '90deg' : '180deg'
                                    })`
                                }}
                              ></div>
                          )}

                          {/* 5. Topic Nodes (N, S, E, W) */}
                          <TopicNode type="love" icon="💖" label="Love" color={topicColors.love} positionClass="top-[-60px]" />
                          <TopicNode type="decision" icon="⚔️" label="Challenge" color={topicColors.decision} positionClass="bottom-[-60px]" />
                          <TopicNode type="wealth" icon="💰" label="Wealth" color={topicColors.wealth} positionClass="left-[-60px]" />
                          <TopicNode type="energy" icon="✨" label="Destiny" color={topicColors.energy} positionClass="right-[-60px]" />

                      </div>

                      {/* --- TEXT FEEDBACK --- */}
                      <div className="mt-16 h-10 flex items-center justify-center">
                          {ritualStage === 'selection' && (
                               <div className="text-center transition-all duration-500">
                                   <h2 className="text-white/80 font-mystic text-lg tracking-[0.2em] mb-1">
                                       {oracleTopic ? oracleTopic.toUpperCase() : "WHAT DO YOU SEEK?"}
                                   </h2>
                                   {oracleTopic && <p className="text-white/40 text-[10px] uppercase tracking-widest">Click the orb to begin</p>}
                               </div>
                          )}
                          {ritualStage === 'incantation' && (
                              <div className="text-center animate-pulse">
                                  <h2 className="text-gold font-mystic text-lg tracking-[0.2em] text-glow">{loadingText}</h2>
                              </div>
                          )}
                      </div>
                  </div>
              )}

              {/* ============================================================
                  STAGE B: REVELATION (The Result)
                 ============================================================ */}
              {ritualStage === 'revelation' && oracleResult && (
                  <div className="flex-1 w-full relative z-20 flex flex-col items-center animate-fade-in">
                      
                      {/* --- WIZARD BACKGROUND --- */}
                      <div className="absolute inset-0 z-0 opacity-40">
                           {/* A placeholder CSS composition for a mystic figure */}
                           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-t from-purple-900/40 to-transparent rounded-full blur-3xl"></div>
                           {/* Silhouette */}
                           <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 w-[300px] h-[500px] bg-black rounded-t-[150px] blur-xl opacity-80"></div>
                      </div>

                      {/* --- HOVERING CARDS --- */}
                      <div className="relative z-10 mt-4 flex gap-4 animate-[float_4s_ease-in-out_infinite]">
                          {readingCards.map((card, i) => (
                              <div key={i} className="w-16 h-24 rounded border border-gold/40 bg-midnight shadow-[0_0_20px_rgba(197,160,89,0.3)] flex flex-col items-center justify-center">
                                  <div className="text-2xl">{card.icon}</div>
                              </div>
                          ))}
                      </div>

                      {/* --- THE SCROLL (Content) --- */}
                      <div className="flex-1 w-full px-6 py-8 mt-6 relative z-10 overflow-y-auto custom-scrollbar">
                           <div className="bg-black/40 border-y border-gold/20 backdrop-blur-md p-6 rounded-lg animate-unroll origin-top">
                                
                                <div className="text-center mb-8">
                                    <h2 className="font-mystic text-2xl text-gold mb-2 text-glow">{oracleResult.synthesis_title}</h2>
                                    <div className="w-20 h-[1px] bg-gold/50 mx-auto"></div>
                                </div>

                                {/* 3-Phase Breakdown */}
                                <div className="space-y-6 mb-8">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full border border-purple-500/30 flex-none flex items-center justify-center text-xs bg-black/50">1</div>
                                        <div>
                                            <h4 className="text-purple-300 font-bold text-xs uppercase tracking-wider mb-1">{oracleResult.card1_title}</h4>
                                            <p className="text-sm text-gray-300 leading-relaxed font-serif">{oracleResult.card1_content}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full border border-red-500/30 flex-none flex items-center justify-center text-xs bg-black/50">2</div>
                                        <div>
                                            <h4 className="text-red-300 font-bold text-xs uppercase tracking-wider mb-1">{oracleResult.card2_title}</h4>
                                            <p className="text-sm text-gray-300 leading-relaxed font-serif">{oracleResult.card2_content}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full border border-emerald-500/30 flex-none flex items-center justify-center text-xs bg-black/50">3</div>
                                        <div>
                                            <h4 className="text-emerald-300 font-bold text-xs uppercase tracking-wider mb-1">{oracleResult.card3_title}</h4>
                                            <p className="text-sm text-gray-300 leading-relaxed font-serif">{oracleResult.card3_content}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Synthesis */}
                                <div className="bg-gold/5 p-4 rounded border border-gold/10">
                                    <p className="font-serif text-parchment leading-7 text-justify italic">
                                        "{oracleResult.synthesis_content}"
                                    </p>
                                </div>

                           </div>
                           
                           {/* Save Button */}
                           <button onClick={() => setShowShareCard(true)} className="w-full mt-6 py-4 bg-transparent border border-gold/30 text-gold font-mystic text-sm uppercase tracking-[0.2em] hover:bg-gold hover:text-midnight transition-all">
                               ✦ Crystallize Fate ✦
                           </button>
                      </div>

                  </div>
              )}

            </div>
         );
      }

      return null;
  };

  // --- MAIN RENDER ---
  if (appState === 'library' && !selectedBook) {
      return <Bookshelf onBookSelected={handleBookSelected} />;
  }

  const isRitualActive = ['altar', 'prophecy_reveal', 'learning', 'oracle_ready', 'oracle_reading'].includes(appState);
  const showNavBar = !isRitualActive;

  return (
    <Layout themeColor={appState === 'oracle_reading' ? '#9333EA' : currentActiveArcana?.theme_color}>
      <div className="w-full h-full relative overflow-hidden">
          {renderContent()}
      </div>
      {showNavBar && (
          <NavBar currentTab={activeTab} onChange={handleTabChange} />
      )}
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