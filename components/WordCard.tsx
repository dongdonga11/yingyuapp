import React, { useState, useEffect, useRef } from 'react';
import { WordData } from '../types';
import { chatWithLogos } from '../services/geminiService';

interface WordCardProps {
  data: WordData;
  onNext: () => void; // Mapped to "Remember" (Right)
  onHard: () => void; // Mapped to "Forget" (Left)
}

const WordCard: React.FC<WordCardProps> = ({ data, onNext, onHard }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);
  
  // Chat State
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);

  // Audio Ref
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Reset state when data changes (new card)
    setIsFlipped(false);
    setSwipeDir(null);
    setShowChat(false);
    setChatHistory([]);
    if (typeof window !== 'undefined') {
        synthRef.current = window.speechSynthesis;
    }
  }, [data.id]);

  const playAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (synthRef.current) {
        // Cancel existing to avoid queue buildup
        synthRef.current.cancel(); 
        const utterance = new SpeechSynthesisUtterance(data.word);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        synthRef.current.speak(utterance);
    }
  };

  const handleDecision = (decision: 'remember' | 'forget') => {
      const dir = decision === 'remember' ? 'right' : 'left';
      setSwipeDir(dir);

      // Wait for animation to finish before switching data
      setTimeout(() => {
          if (decision === 'remember') {
              onNext();
          } else {
              onHard();
          }
      }, 500); // Match CSS duration
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

  // Logic to determine Card Styles based on swipe
  const getCardTransform = () => {
      if (!swipeDir) return '';
      if (swipeDir === 'right') return 'translate-x-[150%] rotate-12 opacity-0';
      if (swipeDir === 'left') return '-translate-x-[150%] -rotate-12 opacity-0';
      return '';
  };

  return (
    <div className="flex flex-col h-full w-full relative py-2">
        
        {/* Card Container with Perspective */}
        <div className="flex-1 w-full relative perspective-1000 mb-16">
            
            <div 
                className={`
                    w-full h-full duration-700 preserve-3d relative transition-all ease-in-out
                    ${isFlipped ? 'rotate-y-180' : ''}
                    ${swipeDir ? getCardTransform() : ''}
                `}
            >
                
                {/* ============================================================
                    SIDE A: THE PUZZLE (ENIGMA) - "GUESS THE MEANING"
                   ============================================================ */}
                <div className="absolute inset-0 backface-hidden bg-obsidian rounded-2xl border border-gold/30 shadow-glow overflow-hidden flex flex-col">
                    {/* Background Texture */}
                    <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay pointer-events-none"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>

                    {/* 1. Header: The Word & Audio */}
                    <div className="pt-10 pb-6 flex flex-col items-center relative z-10">
                        <div className="text-[10px] text-gold/40 uppercase tracking-[0.3em] mb-2">Decipher The Glyphs</div>
                        
                        <h2 className="text-4xl text-center font-mystic text-gold text-glow tracking-wide mb-3">
                            {data.word}
                        </h2>
                        
                        <div className="flex items-center gap-3">
                            <span className="font-serif italic text-gold/60">{data.phonetic}</span>
                            <button 
                                onClick={playAudio}
                                className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* 2. The Clues (Formula) */}
                    <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
                        {/* Clue Connector Visual */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                            <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-gold to-transparent"></div>
                            <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent"></div>
                        </div>

                        {/* Breakdown */}
                        <div className="w-full space-y-4 bg-midnight/50 backdrop-blur-sm p-6 rounded-lg border border-gold/10">
                            {data.components.map((c, i) => (
                                <div key={i} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${c.type === 'root' ? 'bg-gold' : 'bg-gold/30'}`}></span>
                                        <span className="font-serif text-lg text-parchment">{c.part}</span>
                                    </div>
                                    <div className="h-[1px] flex-1 mx-4 bg-white/10 border-t border-dashed border-white/20"></div>
                                    <span className="font-serif text-gold/80 italic">{c.meaning}</span>
                                </div>
                            ))}
                        </div>
                        
                        {/* The Synthesis Question */}
                        <div className="mt-8 text-center">
                            <p className="text-gold/60 text-xs uppercase tracking-widest mb-2">Synthesis Logic</p>
                            <p className="text-parchment font-serif text-lg leading-relaxed">
                                "{data.etymology_story.logic.split('→')[0].trim()}..."
                            </p>
                            <p className="text-gold animate-pulse mt-2">?</p>
                        </div>
                    </div>

                    {/* 3. Unlock Action */}
                    <div className="p-8 pb-10 flex justify-center z-10">
                         <button 
                            onClick={() => setIsFlipped(true)}
                            className="group relative px-8 py-3 bg-gradient-to-b from-gold to-[#8a7038] text-midnight font-bold tracking-widest uppercase rounded-full shadow-[0_0_20px_rgba(197,160,89,0.4)] hover:shadow-[0_0_35px_rgba(197,160,89,0.6)] hover:scale-105 transition-all active:scale-95"
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-xl">🔓</span> Reveal Meaning
                            </span>
                            {/* Shine Effect */}
                            <div className="absolute inset-0 rounded-full bg-white/20 group-hover:animate-pulse"></div>
                        </button>
                    </div>
                </div>


                {/* ============================================================
                    SIDE B: THE REVELATION (TRUTH) - ANSWER & SORTING
                   ============================================================ */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-obsidian rounded-2xl border-2 border-gold flex flex-col shadow-glow-strong overflow-hidden">
                    {/* Inner Content Scroller */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                        {/* Header: Meaning */}
                        <div className="p-8 pb-6 bg-gradient-to-b from-gold/10 to-transparent text-center border-b border-gold/10">
                             <div className="text-[10px] text-gold/50 uppercase tracking-[0.3em] mb-3">The Truth</div>
                             <h2 className="font-serif text-3xl font-bold text-parchment mb-2 text-glow">
                                {data.etymology_story.modern_meaning.split(' ')[1] || data.etymology_story.modern_meaning}
                             </h2>
                             <div className="text-gold/60 text-sm font-serif italic">{data.word} {data.phonetic}</div>
                        </div>

                        {/* Detailed Story */}
                        <div className="p-6 space-y-6">
                            {/* Logic Chain */}
                            <div className="p-4 bg-white/5 rounded border border-white/10">
                                <div className="text-xs text-gold uppercase tracking-widest mb-2">Logic Chain</div>
                                <p className="text-sm text-parchment/80 leading-relaxed font-serif">
                                    {data.etymology_story.logic}
                                </p>
                            </div>

                            {/* Story */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-gold text-lg">📜</span>
                                    <span className="text-xs text-gold uppercase tracking-widest">Origin Story</span>
                                </div>
                                <p className="text-sm font-serif text-parchment/90 leading-loose text-justify opacity-90">
                                    {data.etymology_story.origin_image}
                                </p>
                            </div>

                            {/* Chat Button (Small inline) */}
                            <div className="pt-4 flex justify-center">
                                <button 
                                    onClick={() => setShowChat(true)}
                                    className="text-gold/50 text-xs hover:text-gold flex items-center gap-1 transition-colors"
                                >
                                    <span>🔮</span> Ask Oracle about nuances
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* SORTING ACTIONS (The Altar Slots) */}
                    <div className="h-24 bg-midnight border-t border-gold/20 flex relative">
                        
                        {/* LEFT: FORGET (The Abyss) */}
                        <button 
                            onClick={() => handleDecision('forget')}
                            className="flex-1 flex flex-col items-center justify-center gap-1 group hover:bg-alchemist/20 transition-colors border-r border-white/5 relative overflow-hidden"
                        >
                            <span className="text-2xl opacity-50 group-hover:scale-125 group-hover:opacity-100 transition-all duration-300">💀</span>
                            <span className="text-[10px] uppercase tracking-widest text-white/40 group-hover:text-alchemist">Forget</span>
                            {/* Hover Glow */}
                            <div className="absolute inset-0 bg-radial-gradient from-alchemist/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>

                        {/* CENTER DECORATION */}
                        <div className="w-12 flex items-center justify-center relative z-10">
                            <div className="w-8 h-8 rounded-full border border-gold/30 bg-midnight flex items-center justify-center">
                                <span className="text-gold/50 text-xs">⚖️</span>
                            </div>
                        </div>

                        {/* RIGHT: REMEMBER (The Sanctum) */}
                        <button 
                            onClick={() => handleDecision('remember')}
                            className="flex-1 flex flex-col items-center justify-center gap-1 group hover:bg-gold/20 transition-colors border-l border-white/5 relative overflow-hidden"
                        >
                            <span className="text-2xl opacity-50 group-hover:scale-125 group-hover:opacity-100 transition-all duration-300">☀️</span>
                            <span className="text-[10px] uppercase tracking-widest text-white/40 group-hover:text-gold">Mastered</span>
                            {/* Hover Glow */}
                            <div className="absolute inset-0 bg-radial-gradient from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>

                    </div>
                </div>

            </div>
        </div>

        {/* Chat Interface (Overlay) */}
        {showChat && (
             <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col m-2 rounded-xl border border-gold/30 overflow-hidden animate-fade-in">
                <div className="p-3 border-b border-gold/20 bg-midnight flex justify-between items-center">
                    <span className="font-mystic text-gold text-sm">Logos Oracle</span>
                    <button onClick={() => setShowChat(false)} className="text-gold/50 hover:text-gold">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-midnight/50 custom-scrollbar">
                    {chatHistory.length === 0 && <div className="text-xs text-gold/30 text-center mt-10">Ask regarding "{data.word}"...</div>}
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
                        placeholder="Inquire..."
                    />
                </div>
             </div>
        )}
    </div>
  );
};

export default WordCard;