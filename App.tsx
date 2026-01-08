import React, { useState } from 'react';
import Layout from './components/Layout';
import WordCard from './components/WordCard';
import TarotTable from './components/TarotTable';
import DailyProphecyCard from './components/DailyProphecy';
import ShareCard from './components/ShareCard';
import Bookshelf from './components/Bookshelf';
import NavBar from './components/NavBar';
import Profile from './components/Profile';
import StartScreen from './components/StartScreen';
import RitualCanvas from './components/RitualCanvas';
import MagicArray from './components/MagicArray';
import { initialVocabulary } from './data/vocabulary';
import { TAROT_DECK } from './data/tarot'; 
import { getProphecy } from './data/tarot';
import { getOracleReading } from './services/geminiService';
import { WordData, TarotArcana, DailyProphecy, OracleTopic, TarotReadingResponse, Grimoire, AppState, ProphecyRecord } from './types';

// Tab Logic Type
type MainTab = 'oracle' | 'grimoire' | 'profile';
type RitualStage = 'selection' | 'channeling' | 'revelation';

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
  
  // History State
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
  const [showFlash, setShowFlash] = useState(false); // For the white-out effect
  
  // Ritual Visual State
  const [hoveredTopic, setHoveredTopic] = useState<OracleTopic | null>(null);
  // Source Coordinate for the particle stream
  const [streamSource, setStreamSource] = useState<{x: number, y: number} | null>(null);
  
  // Share State
  const [showShareCard, setShowShareCard] = useState(false);

  // --- TAB SWITCHING HANDLER ---
  const handleTabChange = (tab: MainTab) => {
      setActiveTab(tab);
      if (tab === 'oracle' && appState === 'library' && selectedBook) {
          setAppState('oracle_start');
      }
  };

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
      setRitualStage('selection'); 
      setOracleTopic(null);
      setOracleResult(null);
      setHoveredTopic(null);
      setStreamSource(null);
  };

  // --- RITUAL LOGIC ---

  const topicConfig = {
      love: { 
          color: '#4ADE80', // Green (Life/Heart)
          label: 'Love', 
          icon: '🌿', // Nature/Life
          pos: 'top-10 left-1/2 -translate-x-1/2',
          coord: {x: 0.5, y: 0.1}
      },
      wealth: { 
          color: '#FBBF24', // Gold (Sun)
          label: 'Wealth', 
          icon: '☀️', // Sun
          pos: 'bottom-32 left-8',
          coord: {x: 0.15, y: 0.8}
      },
      decision: { 
          color: '#60A5FA', // Blue (Ice/Mind)
          label: 'Logic', 
          icon: '❄️', // Ice
          pos: 'bottom-32 right-8',
          coord: {x: 0.85, y: 0.8}
      },
      energy: { 
          color: '#F87171', // Red (Fire/Power)
          label: 'Power', 
          icon: '🔥', // Fire
          pos: 'top-[45%] right-4', // Right side (optional slot, or remove if 3 orbs desired. User ref had 4)
          // Adjusting user image ref: 4 circles. Let's do diamond layout.
          // Top(Love), Bottom(Wealth), Left(Decision), Right(Energy)
          // Wait, user ref image is circular. Let's do 4 corners or Diamond.
      },
  };

  // Redefining positions for Diamond Layout around center
  const orbs = [
      { id: 'love', ...topicConfig.love, style: { top: '5%', left: '50%', transform: 'translateX(-50%)' }, cx: 0.5, cy: 0.1 },
      { id: 'wealth', ...topicConfig.wealth, style: { bottom: '20%', left: '10%' }, cx: 0.15, cy: 0.8 }, 
      { id: 'decision', ...topicConfig.decision, style: { bottom: '20%', right: '10%' }, cx: 0.85, cy: 0.8 },
      { id: 'energy', ...topicConfig.energy, style: { top: '50%', right: '5%', transform: 'translateY(-50%)' }, cx: 0.95, cy: 0.5 } 
      // Actually, let's stick to a clean Triangle + 1 Center or Square. 
      // Let's do: Top, Bottom, Left, Right relative to the Magic Circle.
  ];

  // Final Layout Coordinates for Orbs (Relative to screen)
  const orbLayout: Record<string, { top?: string, bottom?: string, left?: string, right?: string, cx: number, cy: number }> = {
      love: { top: '15%', left: '50%', cx: 0.5, cy: 0.15 }, // Top
      wealth: { bottom: '15%', left: '50%', cx: 0.5, cy: 0.85 }, // Bottom
      decision: { top: '50%', left: '10%', cx: 0.1, cy: 0.5 }, // Left
      energy: { top: '50%', right: '10%', cx: 0.9, cy: 0.5 } // Right
  };


  const handleSelectTopic = async (topic: OracleTopic) => {
      if (ritualStage !== 'selection') return;
      
      setOracleTopic(topic);
      setRitualStage('channeling');
      
      // Set source for particle stream
      const layout = orbLayout[topic];
      setStreamSource({ x: layout.cx, y: layout.cy });

      // 2 seconds of Channeling, then Flash
      setTimeout(() => {
          setShowFlash(true); // White out
      }, 2000);

      // Trigger API in background
      const result = await getOracleReading(readingCards, topic);
      
      // Transition to Result
      setTimeout(() => {
          setOracleResult(result);
          setRitualStage('revelation');
          setShowFlash(false);
      }, 3500); 
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

  // --- RENDER CONTENT ---
  const renderContent = () => {
      
      if (activeTab === 'grimoire') return <Bookshelf onBookSelected={handleBookSelected} />;
      if (activeTab === 'profile') return <Profile currentBook={selectedBook} prophecyHistory={prophecyHistory} onChangeBook={handleChangeBook} />;
      if (appState === 'oracle_start' && selectedBook) return <StartScreen book={selectedBook} onStart={handleStartOracle} />;
      
      if (appState === 'altar') return <TarotTable onReadingComplete={handleReadingComplete} />;
      if (appState === 'prophecy_reveal' && prophecyData) return <DailyProphecyCard data={prophecyData} onClose={handleAcceptProphecy} />;
      
      if (appState === 'learning') {
          return (
            <div className="w-full h-full flex flex-col relative animate-fade-in">
                {/* Progress Bar & Header */}
                <div className="pt-6 px-6 pr-20 mb-4 flex-none relative z-40">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs uppercase tracking-[0.2em] text-gold/80">{readingCards[0]?.name_cn || "Unknown"}</span>
                        <button onClick={handleReset} className="text-[10px] text-white/20 hover:text-white px-2">ABORT</button>
                    </div>
                    <div className="h-[2px] bg-white/10 rounded-full overflow-hidden w-full max-w-[200px]">
                        <div className="h-full transition-all duration-500 shadow-[0_0_10px_currentColor]" style={{ width: `${progress}%`, backgroundColor: readingCards[0]?.theme_color || '#C5A059' }}></div>
                    </div>
                </div>
                {/* Cards */}
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
                  <h2 className="text-3xl font-mystic text-gold text-glow mb-4 tracking-wider">The Oracle is Ready</h2>
                  <button onClick={handleEnterSanctuary} className="group relative px-8 py-3 bg-transparent border border-gold/50 text-gold font-mystic text-lg uppercase tracking-[0.2em] hover:bg-gold hover:text-midnight transition-all duration-500">
                      Enter The Void
                  </button>
              </div>
          </div>
         );
      }

      // =========================================================================
      // THE NEW MAGIC CIRCLE RITUAL
      // =========================================================================
      if (appState === 'oracle_reading') {
         
         const activeColor = oracleTopic ? topicConfig[oracleTopic].color : '#C5A059';

         return (
            <div className="absolute inset-0 z-[50] bg-[#050508] flex flex-col items-center justify-center overflow-hidden animate-fade-in">
              
              {/* Background: Deep Space */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#050508] to-black z-0"></div>
              <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] z-0"></div>

              {/* 1. White Out Flash */}
              {showFlash && (
                  <div className="absolute inset-0 z-[999] bg-white animate-white-out pointer-events-none"></div>
              )}

              {/* 2. Particle Canvas (Interacts with Center and Orbs) */}
              <RitualCanvas 
                  source={streamSource} 
                  target={{x: 0.5, y: 0.5}} 
                  color={activeColor}
                  mode={ritualStage === 'selection' ? 'idle' : 'stream'}
              />

              {/* 3. The Central Magic Array */}
              <div className="relative z-10">
                  <MagicArray isActive={ritualStage === 'channeling'} />
              </div>

              {/* Top Bar */}
              <div className="absolute top-0 w-full flex justify-between items-center p-6 z-40">
                  <h3 className="font-mystic text-white/30 tracking-widest text-xs">THE ELEMENTAL GATE</h3>
                  <button onClick={handleReset} className="text-white/20 hover:text-white">✕</button>
              </div>

              {/* STAGE A: SELECTION (The Orbs) */}
              {ritualStage !== 'revelation' && (
                  <div className="absolute inset-0 z-20 pointer-events-none">
                      {Object.entries(orbLayout).map(([key, pos]) => {
                          const topic = key as OracleTopic;
                          const config = topicConfig[topic];
                          const isSelected = oracleTopic === topic;
                          const isHidden = oracleTopic && oracleTopic !== topic;
                          
                          // Convert pos object to style with transform translation to center elements
                          const style: React.CSSProperties = {
                              position: 'absolute',
                              top: pos.top,
                              bottom: pos.bottom,
                              left: pos.left,
                              right: pos.right,
                              transform: pos.left === '50%' ? 'translateX(-50%)' : (pos.top === '50%' ? 'translateY(-50%)' : 'none'),
                              pointerEvents: 'auto'
                          };

                          return (
                              <div 
                                key={key}
                                className={`
                                    w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center cursor-pointer transition-all duration-700
                                    ${isHidden ? 'opacity-0 scale-50' : 'opacity-100'}
                                    ${isSelected ? 'scale-125 shadow-[0_0_50px_currentColor]' : 'hover:scale-110 animate-float'}
                                `}
                                style={{ ...style, color: config.color }}
                                onClick={() => handleSelectTopic(topic)}
                                onMouseEnter={() => setHoveredTopic(topic)}
                                onMouseLeave={() => setHoveredTopic(null)}
                              >
                                  {/* THE ORB VISUAL */}
                                  <div 
                                    className="absolute inset-0 rounded-full border border-white/20"
                                    style={{
                                        background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), ${config.color}, #000)`,
                                        boxShadow: `0 0 20px ${config.color}80, inset 0 0 20px rgba(0,0,0,0.5)`
                                    }}
                                  ></div>
                                  
                                  {/* Icon */}
                                  <div className="relative z-10 text-3xl filter drop-shadow-md">{config.icon}</div>
                                  
                                  {/* Label */}
                                  <div className="absolute -bottom-8 font-mystic text-[10px] uppercase tracking-[0.2em] text-white/60">
                                      {config.label}
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              )}

              {/* STAGE B: REVELATION (Result) */}
              {ritualStage === 'revelation' && oracleResult && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl animate-fade-in p-6">
                      
                      {/* Result Scroll (Reused UI logic) */}
                      <div className="w-full max-w-md bg-black/80 border border-gold/30 rounded-xl p-6 shadow-2xl overflow-y-auto max-h-full custom-scrollbar animate-pop-in">
                          <div className="text-center mb-6">
                              <h2 className="font-mystic text-xl text-gold mb-2 text-glow">{oracleResult.synthesis_title}</h2>
                              <div className="w-16 h-[1px] bg-gold/50 mx-auto"></div>
                          </div>
                          
                          <div className="space-y-4 font-serif text-sm text-parchment leading-relaxed">
                              <div className="p-3 bg-white/5 rounded border-l-2 border-gold/50">
                                  <h4 className="text-xs font-bold text-gold uppercase mb-1">Status</h4>
                                  <p>{oracleResult.card1_content}</p>
                              </div>
                              <div className="p-3 bg-white/5 rounded border-l-2 border-red-500/50">
                                  <h4 className="text-xs font-bold text-red-400 uppercase mb-1">Challenge</h4>
                                  <p>{oracleResult.card2_content}</p>
                              </div>
                              <div className="p-3 bg-white/5 rounded border-l-2 border-blue-500/50">
                                  <h4 className="text-xs font-bold text-blue-400 uppercase mb-1">Action</h4>
                                  <p>{oracleResult.card3_content}</p>
                              </div>
                              <div className="mt-4 pt-4 border-t border-white/10 italic text-gold/80">
                                  "{oracleResult.synthesis_content}"
                              </div>
                          </div>

                          <button onClick={() => setShowShareCard(true)} className="w-full mt-6 py-3 bg-gold/10 border border-gold/30 text-gold hover:bg-gold hover:text-black transition-colors font-mystic text-xs uppercase tracking-widest">
                              Crystallize Fate
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
  if (appState === 'library' && !selectedBook) return <Bookshelf onBookSelected={handleBookSelected} />;

  const isRitualActive = ['altar', 'prophecy_reveal', 'learning', 'oracle_ready', 'oracle_reading'].includes(appState);

  return (
    <Layout themeColor={appState === 'oracle_reading' ? '#9333EA' : readingCards[0]?.theme_color}>
      <div className="w-full h-full relative overflow-hidden">
          {renderContent()}
      </div>
      {!isRitualActive && (
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