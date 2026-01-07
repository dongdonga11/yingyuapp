import React, { useState, useEffect, useRef } from 'react';
import { WordData } from '../types';
import { chatWithLogos } from '../services/geminiService';

interface WordCardProps {
  data: WordData;
  onNext: () => void;
  onHard: () => void;
  stackIndex: number; // 0 = Active/Top, 1 = Behind, 2 = Far Behind
}

const WordCard: React.FC<WordCardProps> = ({ data, onNext, onHard, stackIndex }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);
  
  // Chat State
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);

  // Audio Ref
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Only the top card (index 0) is interactive
  const isActive = stackIndex === 0;

  useEffect(() => {
    // Reset state only when this card becomes active or data changes
    if (isActive) {
        setIsFlipped(false);
        setSwipeDir(null);
        setShowChat(false);
        setChatHistory([]);
    }
    if (typeof window !== 'undefined') {
        synthRef.current = window.speechSynthesis;
    }
  }, [data.id, isActive]);

  const playAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (synthRef.current && isActive) {
        synthRef.current.cancel(); 
        const utterance = new SpeechSynthesisUtterance(data.word);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        synthRef.current.speak(utterance);
    }
  };

  const handleDecision = (decision: 'remember' | 'forget') => {
      if (!isActive) return;

      const dir = decision === 'remember' ? 'right' : 'left';
      setSwipeDir(dir);

      // Wait for animation (400ms) to complete before switching data
      setTimeout(() => {
          if (decision === 'remember') {
              onNext();
          } else {
              onHard();
          }
      }, 400); 
  };

  const handleChat = async () => {
    if(!chatInput.trim()) return;
    setLoadingChat(true);
    const userMsg = chatInput;
    setChatHistory(prev => [...prev, `Seeker: ${userMsg}`]);
    setChatInput("");
    
    const response = await chatWithLogos(chatHistory, userMsg);
    setChatHistory(prev => [...prev, `Logos: ${response}`]);
    setLoadingChat(false);
  };

  // Logic to determine Card Styles based on swipe (Fly into buttons)
  const getSwipeTransform = () => {
      if (!swipeDir) return '';
      if (swipeDir === 'right') return 'translate(120px, 300px) rotate(25deg) scale(0.1)';
      if (swipeDir === 'left') return 'translate(-120px, 300px) rotate(-25deg) scale(0.1)';
      return '';
  };

  // --- STACKING STYLES ---
  // If stackIndex is 0: Standard position.
  // If stackIndex > 0: Scaled down, moved down, darkened.
  const stackScale = 1 - (stackIndex * 0.05); // 1, 0.95, 0.9
  const stackTranslateY = stackIndex * 15;    // 0px, 15px, 30px
  const stackOpacity = stackIndex === 0 ? 1 : (1 - stackIndex * 0.3);
  const stackBrightness = stackIndex === 0 ? 1 : 0.5; // Darken the back cards
  
  return (
    <div 
        className={`absolute top-0 left-0 w-full h-full flex flex-col items-center py-4 transition-all duration-500 ease-out`}
        style={{
            zIndex: 10 - stackIndex, // Higher index = lower z-index
            transform: `translateY(${stackTranslateY}px) scale(${stackScale})`,
            opacity: stackOpacity,
            filter: `brightness(${stackBrightness})`,
            pointerEvents: isActive ? 'auto' : 'none', // Only top card is clickable
        }}
    >
        {/* Card Container */}
        <div className="w-full max-w-md flex-1 relative perspective-1000 mb-24">
            
            <div 
                className={`
                    w-full h-full preserve-3d relative transition-all ease-out
                    ${swipeDir ? 'duration-500 opacity-0' : 'duration-700'} 
                `}
                style={{
                    // Combining the Flip Rotation with the Swipe Animation
                    transform: isFlipped 
                        ? `rotateY(180deg) ${getSwipeTransform()}`
                        : `${getSwipeTransform()}` 
                }}
            >
                
                {/* ============================================================
                    SIDE A: THE PUZZLE (正面)
                   ============================================================ */}
                <div className="absolute inset-0 backface-hidden bg-obsidian rounded-xl border-2 border-gold/30 flex flex-col shadow-glow overflow-hidden">
                    <div className="w-full h-full border border-gold/10 rounded-lg flex flex-col relative bg-[radial-gradient(circle_at_top,rgba(197,160,89,0.05),transparent)] p-6">
                        
                        {/* 1. Header: Word & Audio */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-3xl font-mystic text-gold text-glow tracking-wide">{data.word}</h2>
                                <span className="font-serif italic text-gold/60 text-sm">{data.phonetic}</span>
                            </div>
                            <button 
                                onClick={playAudio}
                                className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold hover:bg-gold/20 active:scale-95 transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 2.485.6 4.85 1.691 6.941.342 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 2.001 2.001 0 000-11.668.75.75 0 010-1.06z" />
                                  <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                                </svg>
                            </button>
                        </div>

                        {/* 2. The Clues (Components) */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {data.components.map((c, i) => (
                                <div key={i} className="px-3 py-1.5 rounded border border-gold/20 bg-gold/5 flex items-center gap-2">
                                    <span className="text-parchment font-bold">{c.part}</span>
                                    <span className="text-[10px] text-gold/50">➜</span>
                                    <span className="text-xs text-gold/80 italic">{c.meaning}</span>
                                </div>
                            ))}
                        </div>

                        {/* 3. The Story & Logic */}
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                            <div className="relative pl-4 border-l-2 border-gold/30">
                                <span className="absolute -left-[5px] -top-1 w-2 h-2 rounded-full bg-gold"></span>
                                <h4 className="text-[10px] font-bold uppercase text-gold/50 mb-1">Origin Scene</h4>
                                <p className="font-serif text-sm text-parchment/90 leading-relaxed text-justify">
                                    {data.etymology_story.origin_image}
                                </p>
                            </div>
                            
                            <div className="bg-white/5 p-3 rounded border border-white/5">
                                <h4 className="text-[10px] font-bold uppercase text-gold/50 mb-1">Logic Chain</h4>
                                <p className="font-serif text-sm text-gold/80">
                                    {data.etymology_story.logic.split('→').map((part, idx, arr) => (
                                        <span key={idx}>
                                            {part.trim()}
                                            {idx < arr.length - 1 && <span className="mx-1 opacity-50">➜</span>}
                                        </span>
                                    ))}
                                </p>
                            </div>

                             <div className="text-center pt-4 opacity-80">
                                <span className="text-4xl text-gold/20">?</span>
                                <p className="text-xs text-gold/40 mt-1 uppercase tracking-widest">Guess the meaning</p>
                            </div>
                        </div>

                        {/* 4. Unlock Button (Only visible if active) */}
                        <div className={`mt-4 pt-4 border-t border-gold/10 flex justify-center transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                            <button 
                                onClick={() => isActive && setIsFlipped(true)}
                                className="group relative w-full py-3 bg-gradient-to-r from-transparent via-gold/10 to-transparent hover:via-gold/20 border-y border-gold/20 text-gold font-mystic tracking-widest uppercase transition-all"
                            >
                                <span className="group-hover:tracking-[0.3em] transition-all">Unlock Truth</span>
                            </button>
                        </div>
                    </div>
                </div>


                {/* ============================================================
                    SIDE B: THE REVELATION (背面)
                   ============================================================ */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-obsidian rounded-xl border-2 border-gold flex flex-col shadow-glow-strong overflow-hidden">
                    <div className="w-full h-full relative flex flex-col items-center justify-center p-8 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.1),transparent)]">
                        
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

                        {/* 1. Icon / Symbol (THE SCALES OF JUSTICE) */}
                        <div className="w-24 h-24 rounded-full border border-gold/30 flex items-center justify-center mb-6 relative">
                             <div className="absolute inset-0 bg-gold/10 rounded-full blur-xl animate-pulse"></div>
                             <div className="text-gold filter drop-shadow-lg relative z-10 text-5xl">
                                {/* SVG Scales Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
                                    <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v.816c1.32.122 2.6.438 3.793.923l1.144-2.288a.75.75 0 011.342.67l-1.076 2.152c1.78.966 3.237 2.378 4.168 4.098a.75.75 0 11-1.318.714 8.261 8.261 0 00-2.036-2.583l-1.205 3.614a.75.75 0 01-1.423-.474l.904-2.712A9.771 9.771 0 0012.75 4.582V20.25h2.25a.75.75 0 010 1.5h-6a.75.75 0 010-1.5h2.25V4.582a9.771 9.771 0 00-4.343 2.535l.904 2.712a.75.75 0 01-1.423.474l-1.205-3.614a8.261 8.261 0 00-2.036 2.583.75.75 0 11-1.318-.714 9.766 9.766 0 014.168-4.098L5.968 2.43a.75.75 0 011.342-.67L8.454 4.05c1.193-.485 2.473-.8 3.793-.923V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
                                </svg>
                             </div>
                        </div>

                        {/* 2. The Word */}
                        <h2 className="text-3xl font-mystic text-parchment mb-2">{data.word}</h2>

                        {/* 3. The TRANSLATION (Answer) */}
                        <div className="relative py-4 px-8 mb-6 border-t border-b border-gold/30 w-full text-center bg-gold/5">
                            <span className="text-2xl font-bold font-serif text-gold text-glow">
                                {data.etymology_story.modern_meaning.split(' ')[1] || data.etymology_story.modern_meaning}
                            </span>
                        </div>

                        {/* 4. Nuance / Context */}
                        <p className="text-sm font-serif text-parchment/70 text-center leading-relaxed italic max-w-[80%]">
                            "{data.nuance.split('。')[0]}。"
                        </p>

                        <div className="absolute bottom-8 text-[10px] text-gold/30 uppercase tracking-widest animate-pulse">
                            Choose your path below
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {/* Floating Actions (Only visible for the Active/Top Card) */}
        {isActive && (
            <>
                <div className="fixed bottom-8 left-0 right-0 px-8 max-w-md mx-auto flex justify-between items-center z-50 pointer-events-none">
                    <button 
                        onClick={() => handleDecision('forget')}
                        className="pointer-events-auto group flex flex-col items-center gap-2 transition-transform active:scale-90"
                    >
                        <div className="w-16 h-16 rounded-full bg-midnight border border-alchemist text-alchemist shadow-[0_0_20px_rgba(138,35,35,0.2)] flex items-center justify-center group-hover:bg-alchemist group-hover:text-white transition-colors">
                            <span className="text-2xl">⚡️</span>
                        </div>
                        <span className="text-[10px] text-alchemist/60 uppercase tracking-widest font-bold group-hover:text-alchemist">Forget</span>
                    </button>

                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowChat(true); }}
                        className="pointer-events-auto w-10 h-10 rounded-full bg-gold/5 border border-gold/20 text-gold/50 flex items-center justify-center hover:bg-gold/10 hover:text-gold hover:border-gold transition-all backdrop-blur-sm -mb-8"
                    >
                        <span className="text-sm">🔮</span>
                    </button>

                    <button 
                        onClick={() => handleDecision('remember')}
                        className="pointer-events-auto group flex flex-col items-center gap-2 transition-transform active:scale-90"
                    >
                        <div className="w-16 h-16 rounded-full bg-midnight border border-gold text-gold shadow-[0_0_20px_rgba(197,160,89,0.2)] flex items-center justify-center group-hover:bg-gold group-hover:text-midnight transition-colors">
                            <span className="text-2xl">🧠</span>
                        </div>
                        <span className="text-[10px] text-gold/60 uppercase tracking-widest font-bold group-hover:text-gold">Remember</span>
                    </button>
                </div>

                {/* Chat Interface */}
                {showChat && (
                    <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col m-2 rounded-xl border border-gold/30 overflow-hidden animate-fade-in">
                        <div className="p-3 border-b border-gold/20 bg-midnight flex justify-between items-center">
                            <span className="font-mystic text-gold text-sm">Logos Oracle</span>
                            <button onClick={() => setShowChat(false)} className="text-gold/50 hover:text-gold">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-midnight/50 custom-scrollbar">
                            {chatHistory.length === 0 && <div className="text-xs text-gold/30 text-center mt-10">Inquire about "{data.word}"...</div>}
                            {chatHistory.map((msg, i) => {
                                const isUser = msg.startsWith('Seeker:');
                                return (
                                    <div key={i} className={`p-3 text-sm rounded border ${isUser ? 'bg-white/5 border-white/10 text-parchment self-end' : 'bg-gold/10 border-gold/20 text-gold self-start'}`}>
                                        {msg.replace(/^(Seeker:|Logos:)\s*/, '')}
                                    </div>
                                )
                            })}
                            {loadingChat && <div className="text-xs text-gold/50 animate-pulse text-center">Divining...</div>}
                        </div>
                        <div className="p-3 bg-midnight border-t border-gold/20 flex gap-2">
                            <input 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                                className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-parchment focus:border-gold outline-none placeholder-white/20"
                                placeholder="Type..."
                            />
                        </div>
                    </div>
                )}
            </>
        )}
    </div>
  );
};

export default WordCard;