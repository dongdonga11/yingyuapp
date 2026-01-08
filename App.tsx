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
import { initialVocabulary } from './data/vocabulary';
import { TAROT_DECK } from './data/tarot'; 
import { getProphecy } from './data/tarot';
import { getOracleReading } from './services/geminiService';
import { WordData, TarotArcana, DailyProphecy, OracleTopic, TarotReadingResponse, Grimoire, AppState, ProphecyRecord } from './types';

// Tab Logic Type
type MainTab = 'oracle' | 'grimoire' | 'profile';
type RitualStage = 'selection' | 'congregation' | 'revelation';

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
  // Coordinates for the particle attractor (0-1 normalized)
  const [particleTarget, setParticleTarget] = useState<{x: number, y: number} | null>(null);
  
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
      setParticleTarget(null);
  };

  // --- RITUAL LOGIC ---

  const topicConfig = {
      love: { color: '#E0115F', label: 'Love', icon: '💘', x: 0.3, y: 0.35, desc: "Bonds of the Heart" },
      wealth: { color: '#FFD700', label: 'Wealth', icon: '💰', x: 0.7, y: 0.35, desc: "Fortune & Career" },
      decision: { color: '#00FFFF', label: 'Challenge', icon: '⚔️', x: 0.3, y: 0.65, desc: "The Crossroads" },
      energy: { color: '#7851A9', label: 'Destiny', icon: '🌟', x: 0.7, y: 0.65, desc: "Cosmic Flow" },
  };

  const handleHoverTopic = (topic: OracleTopic | null) => {
      if (ritualStage !== 'selection') return;
      setHoveredTopic(topic);
      // NOTE: We REMOVED the logic that sets particleTarget on hover.
      // We want particles to stay scattered (Idle) until the CLICK happens.
      // The riot should be sudden!
  };

  const handleSelectTopic = async (topic: OracleTopic) => {
      if (ritualStage !== 'selection') return;
      
      setOracleTopic(topic);
      setRitualStage('congregation'); // Triggers the Vortex
      
      // NOW we set the target, causing the scattered particles to suddenly swirl in
      setParticleTarget({ x: topicConfig[topic].x, y: topicConfig[topic].y });

      // The vortex needs time to tighten.
      // 2 seconds of swirling, then Flash.
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
      }, 3500); // 2s vortex + 1.5s flash duration logic
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

  // --- COMPONENT: RITUAL CARD (Floating Arcana) ---
  const RitualCard = ({ topic }: { topic: OracleTopic }) => {
      const config = topicConfig[topic];
      const isSelected = oracleTopic === topic;
      const isHovered = hoveredTopic === topic;
      const isDimmed = hoveredTopic && hoveredTopic !== topic && ritualStage === 'selection';
      const isHidden = oracleTopic && oracleTopic !== topic && ritualStage === 'congregation';
      
      // Position Logic
      const stylePosition = {
          left: `${config.x * 100}%`,
          top: `${config.y * 100}%`,
      };

      return (
          <div 
            className={`
                absolute w-32 h-48 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 preserve-3d cursor-pointer
                ${isHidden ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100'}
                ${isSelected && ritualStage === 'congregation' ? 'animate-absorb z-[60]' : 'z-20'} 
                ${isDimmed ? 'opacity-30 scale-90 blur-sm' : ''}
                ${isHovered ? 'scale-110' : 'animate-float'}
            `}
            style={stylePosition}
            onMouseEnter={() => handleHoverTopic(topic)}
            onMouseLeave={() => handleHoverTopic(null)}
            onClick={() => handleSelectTopic(topic)}
          >
               {/* Card Back Visual */}
               <div 
                 className={`
                    absolute inset-0 bg-midnight border rounded-lg shadow-2xl overflow-hidden flex flex-col items-center justify-center
                    transition-all duration-500
                 `}
                 style={{ 
                     borderColor: config.color,
                     boxShadow: isHovered || isSelected ? `0 0 50px ${config.color}90` : `0 0 15px ${config.color}30`
                 }}
               >
                   {/* Pattern */}
                   <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                   
                   {/* Icon */}
                   <div className="text-4xl filter drop-shadow-lg z-10 transition-transform duration-500" style={{ transform: isHovered ? 'scale(1.2)' : 'scale(1)' }}>
                       {config.icon}
                   </div>
                   
                   {/* Label */}
                   <div 
                    className="absolute bottom-4 font-mystic text-xs uppercase tracking-[0.2em]" 
                    style={{ color: config.color }}
                   >
                       {config.label}
                   </div>

                   {/* Energy Core (Glowing center) */}
                   <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle, ${config.color}20 0%, transparent 70%)` }}
                   ></div>
               </div>
          </div>
      );
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
      // THE NEW ASTRAL RITUAL (VORTEX EDITION)
      // =========================================================================
      if (appState === 'oracle_reading') {
         
         // determine active particle color
         const activeColor = hoveredTopic ? topicConfig[hoveredTopic].color : 
                             oracleTopic ? topicConfig[oracleTopic].color : 
                             '#C5A059';

         return (
            <div className="absolute inset-0 z-[50] bg-[#050508] flex flex-col overflow-hidden animate-fade-in">
              
              {/* 1. White Out Flash */}
              {showFlash && (
                  <div className="absolute inset-0 z-[999] bg-white animate-white-out pointer-events-none"></div>
              )}

              {/* 2. Particle Canvas (Background Layer) */}
              {/* Note: mode is 'idle' until we actually SELECT a topic. Hover doesn't trigger swarm anymore. */}
              <RitualCanvas 
                  target={particleTarget} 
                  color={activeColor}
                  mode={ritualStage === 'selection' ? 'idle' : 'congregate'}
              />

              {/* Top Bar */}
              <div className="flex-none flex justify-between items-center p-6 z-40 relative">
                  <h3 className="font-mystic text-white/30 tracking-widest text-xs">THE ASTRAL VOID</h3>
                  <button onClick={handleReset} className="text-white/20 hover:text-white">✕</button>
              </div>

              {/* STAGE A: SELECTION & CONGREGATION */}
              {ritualStage !== 'revelation' && (
                  <div className="flex-1 w-full h-full relative perspective-1000">
                      
                      {/* Floating Cards Array */}
                      <RitualCard topic="love" />
                      <RitualCard topic="wealth" />
                      <RitualCard topic="decision" />
                      <RitualCard topic="energy" />

                      {/* Text Hint */}
                      <div className="absolute bottom-20 w-full text-center pointer-events-none transition-opacity duration-500" style={{ opacity: hoveredTopic ? 1 : 0.5 }}>
                          <h2 className="font-mystic text-lg tracking-[0.2em] mb-1" style={{ color: activeColor }}>
                              {hoveredTopic ? topicConfig[hoveredTopic].label.toUpperCase() : "WHERE DOES YOUR INTUITION GUIDE YOU?"}
                          </h2>
                          {hoveredTopic && (
                              <p className="text-white/50 text-[10px] uppercase tracking-widest font-serif italic">
                                  {topicConfig[hoveredTopic].desc}
                              </p>
                          )}
                      </div>
                  </div>
              )}

              {/* STAGE B: REVELATION (Result) */}
              {ritualStage === 'revelation' && oracleResult && (
                  <div className="flex-1 w-full relative z-20 flex flex-col items-center animate-fade-in h-full">
                      
                      {/* Wizard/Void Background */}
                      <div className="absolute inset-0 z-0">
                           {/* Mystic Glow */}
                           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[70%] bg-gradient-to-t from-purple-900/30 to-transparent blur-3xl"></div>
                           {/* Wizard Silhouette Placeholder */}
                           <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-[280px] h-[400px] bg-black opacity-80 blur-2xl rounded-t-full"></div>
                      </div>

                      {/* Content Container */}
                      <div className="relative z-10 w-full h-full flex flex-col p-6 overflow-hidden">
                          
                          {/* Floating Cards (Top) */}
                          <div className="flex justify-center gap-4 mt-4 mb-8 animate-float">
                                {readingCards.map((c, i) => (
                                    <div key={i} className="w-14 h-20 bg-midnight border border-gold/40 rounded shadow-lg flex items-center justify-center text-2xl">
                                        {c.icon}
                                    </div>
                                ))}
                          </div>

                          {/* Scroll */}
                          <div className="flex-1 bg-black/40 border border-gold/20 backdrop-blur-md p-6 rounded-lg animate-unroll origin-top overflow-y-auto custom-scrollbar">
                                <div className="text-center mb-6">
                                    <h2 className="font-mystic text-xl text-gold mb-2 text-glow">{oracleResult.synthesis_title}</h2>
                                    <div className="w-16 h-[1px] bg-gold/50 mx-auto"></div>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-white/5 p-3 rounded border-l-2 border-purple-500">
                                        <h4 className="text-purple-300 text-xs font-bold uppercase mb-1">Status</h4>
                                        <p className="text-sm text-gray-300 font-serif leading-relaxed">{oracleResult.card1_content}</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded border-l-2 border-red-500">
                                        <h4 className="text-red-300 text-xs font-bold uppercase mb-1">Obstacle</h4>
                                        <p className="text-sm text-gray-300 font-serif leading-relaxed">{oracleResult.card2_content}</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded border-l-2 border-emerald-500">
                                        <h4 className="text-emerald-300 text-xs font-bold uppercase mb-1">Action</h4>
                                        <p className="text-sm text-gray-300 font-serif leading-relaxed">{oracleResult.card3_content}</p>
                                    </div>
                                    <div className="bg-gold/5 p-4 rounded border border-gold/10 mt-4">
                                        <p className="font-serif text-parchment italic text-sm text-justify leading-relaxed">
                                            "{oracleResult.synthesis_content}"
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setShowShareCard(true)} className="w-full mt-6 py-4 border border-gold/30 text-gold hover:bg-gold hover:text-midnight transition-colors font-mystic text-sm uppercase tracking-widest">
                                    ✦ Crystallize Fate ✦
                                </button>
                          </div>

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