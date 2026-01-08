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
  const [showFlash, setShowFlash] = useState(false); 
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
  };

  // --- RITUAL LOGIC ---

  const topicConfig = {
      love: { color: '#4ADE80', label: 'Love', icon: '💘', id: 'love' },
      wealth: { color: '#FBBF24', label: 'Wealth', icon: '💰', id: 'wealth' },
      decision: { color: '#60A5FA', label: 'Logic', icon: '⚔️', id: 'decision' },
      energy: { color: '#F87171', label: 'Energy', icon: '🔥', id: 'energy' },
  };

  const handleSelectTopic = async (topic: OracleTopic) => {
      if (ritualStage !== 'selection') return;
      
      setOracleTopic(topic);
      // Wait a tiny bit for the click animation
      setTimeout(() => setRitualStage('channeling'), 100);

      // 3 seconds of Channeling (Spinning Array + Runes)
      setTimeout(() => {
          setShowFlash(true); // White out
      }, 3000);

      // Trigger API in background
      const result = await getOracleReading(readingCards, topic);
      
      // Transition to Result
      setTimeout(() => {
          setOracleResult(result);
          setRitualStage('revelation');
          setShowFlash(false);
      }, 4500); 
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
      // THE MAGIC ARRAY RITUAL (CARD INSERTION MODE)
      // =========================================================================
      if (appState === 'oracle_reading') {
         
         const activeColor = oracleTopic ? topicConfig[oracleTopic].color : '#C5A059';

         return (
            <div className="absolute inset-0 z-[50] bg-[#050508] flex flex-col items-center justify-center overflow-hidden animate-fade-in">
              
              {/* Background */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#050508] to-black z-0"></div>
              <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] z-0"></div>

              {/* 1. White Out Flash */}
              {showFlash && (
                  <div className="absolute inset-0 z-[999] bg-white animate-white-out pointer-events-none"></div>
              )}

              {/* 2. Particle Canvas (Runes Implosion) */}
              <RitualCanvas 
                  target={{x: 0.5, y: 0.5}} 
                  color={activeColor}
                  mode={ritualStage === 'channeling' ? 'implode' : 'idle'}
              />

              {/* 3. The Central Magic Array & Card Slot */}
              <div className="relative z-10 mb-20">
                  <MagicArray isActive={ritualStage === 'channeling'}>
                      {/* CARD IN THE CENTER */}
                      {oracleTopic && (
                          <div 
                            className={`
                                w-32 h-48 rounded-lg border border-gold/50 bg-midnight shadow-[0_0_30px_currentColor] flex flex-col items-center justify-center relative overflow-hidden
                                ${ritualStage === 'channeling' ? 'animate-fly-center' : 'opacity-0'}
                            `}
                            style={{ color: activeColor }}
                          >
                               <div className="absolute inset-0 bg-gold/10 mix-blend-overlay"></div>
                               <div className="text-4xl filter drop-shadow-md">{topicConfig[oracleTopic].icon}</div>
                               <div className="absolute bottom-4 font-mystic text-xs tracking-widest uppercase">{topicConfig[oracleTopic].label}</div>
                               {/* Energy beams */}
                               <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]"></div>
                          </div>
                      )}
                  </MagicArray>
              </div>

              {/* Top Bar */}
              <div className="absolute top-0 w-full flex justify-between items-center p-6 z-40">
                  <h3 className="font-mystic text-white/30 tracking-widest text-xs">THE ELEMENTAL GATE</h3>
                  <button onClick={handleReset} className="text-white/20 hover:text-white">✕</button>
              </div>

              {/* STAGE A: SELECTION (Bottom Deck) */}
              {ritualStage !== 'revelation' && (
                  <div className={`absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-20 transition-all duration-700 ${ritualStage === 'channeling' ? 'translate-y-40 opacity-0' : 'translate-y-0 opacity-100'}`}>
                      {(['love', 'wealth', 'decision', 'energy'] as OracleTopic[]).map((key) => {
                          const config = topicConfig[key];
                          return (
                              <div 
                                key={key}
                                onClick={() => handleSelectTopic(key)}
                                className="w-20 h-32 bg-obsidian border border-gold/30 rounded cursor-pointer hover:-translate-y-4 hover:border-gold hover:shadow-[0_0_20px_rgba(197,160,89,0.3)] transition-all duration-300 flex flex-col items-center justify-center group"
                              >
                                  <div className="text-2xl mb-2 grayscale group-hover:grayscale-0 transition-all">{config.icon}</div>
                                  <span className="font-mystic text-[10px] text-gold/50 group-hover:text-gold uppercase tracking-wider">{config.label}</span>
                              </div>
                          )
                      })}
                  </div>
              )}

              {/* STAGE B: REVELATION (Result) */}
              {ritualStage === 'revelation' && oracleResult && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl animate-fade-in p-6">
                      
                      {/* Result Scroll */}
                      <div className="w-full max-w-md bg-black/90 border border-gold/30 rounded-xl p-6 shadow-2xl overflow-y-auto max-h-full custom-scrollbar animate-pop-in">
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