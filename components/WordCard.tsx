import React, { useState, useEffect, useRef } from 'react';
import { WordData } from '../types';

interface WordCardProps {
  data: WordData;
  onNext: () => void; // Remember
  onHard: () => void; // Forget
}

const WordCard: React.FC<WordCardProps> = ({ data, onNext, onHard }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);
  
  // Audio Ref
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    setIsFlipped(false);
    setSwipeDir(null);
    if (typeof window !== 'undefined') {
        synthRef.current = window.speechSynthesis;
    }
  }, [data.id]);

  const playAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (synthRef.current) {
        synthRef.current.cancel(); 
        const utterance = new SpeechSynthesisUtterance(data.word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8; 
        synthRef.current.speak(utterance);
    }
  };

  const handleDecision = (decision: 'remember' | 'forget') => {
      const dir = decision === 'remember' ? 'right' : 'left';
      setSwipeDir(dir);
      setTimeout(() => {
          if (decision === 'remember') onNext();
          else onHard();
      }, 500); 
  };

  // Logic to determine Card Styles based on swipe
  const getCardTransform = () => {
      if (!swipeDir) return '';
      if (swipeDir === 'right') return 'translate-x-[120%] rotate-12 opacity-0';
      if (swipeDir === 'left') return '-translate-x-[120%] -rotate-12 opacity-0';
      return '';
  };

  // Helper to extract the core nuance sentence
  const shortNuance = data.nuance.split('。')[0] + '。';

  return (
    <div className="flex flex-col h-full w-full relative py-2 items-center justify-center">
        
        {/* Card Container */}
        <div className="w-full max-w-[340px] aspect-[3/5] relative perspective-1000">
            
            <div 
                className={`
                    w-full h-full duration-700 preserve-3d relative transition-all ease-in-out
                    ${isFlipped ? 'rotate-y-180' : ''}
                    ${swipeDir ? getCardTransform() : ''}
                `}
            >
                
                {/* ============================================================
                    SIDE A: THE PUZZLE (线索面 - 复杂、笔记、引导猜测)
                   ============================================================ */}
                <div 
                    className="absolute inset-0 backface-hidden bg-[#E3DAC9] overflow-hidden shadow-2xl"
                    style={{
                        clipPath: 'polygon(0 0, 100% 0, 100% 95%, 90% 100%, 0 100%)' // Subtle cut corner
                    }}
                >
                    {/* --- TEXTURE: The "Dirty" Researcher's Notebook --- */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-40 mix-blend-multiply pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#D4C5A9] via-transparent to-[#C0B090] opacity-60 pointer-events-none"></div>
                    {/* Stains */}
                    <div className="absolute top-10 right-[-20px] w-24 h-24 bg-[#8B4513] opacity-10 blur-xl rounded-full mix-blend-multiply"></div>
                    <div className="absolute bottom-20 left-10 w-32 h-32 bg-[#2F4F4F] opacity-5 blur-2xl rounded-full mix-blend-multiply"></div>

                    {/* CONTENT */}
                    <div className="relative h-full flex flex-col p-6 z-10 text-[#3E342A]">
                        
                        {/* 1. Header: Audio & Phonetic (No Meaning yet!) */}
                        <div className="flex justify-between items-start mb-6 border-b border-[#3E342A]/20 pb-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-1">Subject</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="font-serif font-bold text-2xl tracking-wide">{data.word}</span>
                                </div>
                                <span className="font-serif italic opacity-60 text-sm mt-1">{data.phonetic}</span>
                            </div>
                            <button 
                                onClick={playAudio}
                                className="w-10 h-10 rounded-full border border-[#3E342A]/20 flex items-center justify-center hover:bg-[#3E342A]/5 active:scale-95 transition-all text-[#3E342A]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                                </svg>
                            </button>
                        </div>

                        {/* 2. The Formula (Roots) - The "Guide" */}
                        <div className="mb-6 space-y-3 bg-[#F5F0E6]/50 p-4 rounded-sm border border-[#3E342A]/10 rotate-[-1deg] shadow-sm">
                            <span className="text-[9px] uppercase tracking-widest opacity-50 block mb-2">Composition Analysis</span>
                            {data.components.map((c, i) => (
                                <div key={i} className="flex items-center text-sm">
                                    <span className="font-bold w-16 font-serif">{c.part}</span>
                                    <span className="mx-2 opacity-30">→</span>
                                    <span className="italic opacity-80 bg-[#C5A059]/20 px-1 rounded">{c.meaning}</span>
                                </div>
                            ))}
                        </div>

                        {/* 3. The Story/Logic - The "Guessing Context" */}
                        <div className="flex-1 overflow-y-auto pr-2 relative">
                             {/* Quote Mark */}
                            <div className="absolute -top-2 -left-2 text-4xl text-[#C5A059] opacity-20 font-serif">“</div>
                            
                            <div className="mt-2 space-y-4">
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase opacity-60 mb-1">Origin Scene</h4>
                                    <p className="font-serif text-sm leading-relaxed text-justify opacity-90 border-l-2 border-[#8A2323]/40 pl-3">
                                        {data.etymology_story.origin_image}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase opacity-60 mb-1">Logic Chain</h4>
                                    <p className="font-serif text-sm leading-relaxed text-justify opacity-90">
                                        {data.etymology_story.logic.split('→').map((chunk, idx, arr) => (
                                            <span key={idx}>
                                                {chunk.trim()}
                                                {idx < arr.length - 1 && <span className="text-[#8A2323] mx-1">➜</span>}
                                            </span>
                                        ))}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 4. Unlock Button */}
                        <div className="mt-4 pt-4 border-t border-[#3E342A]/10 flex justify-center">
                            <button 
                                onClick={() => setIsFlipped(true)}
                                className="group flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
                            >
                                <div className="w-12 h-12 rounded-full border-2 border-[#8A2323] flex items-center justify-center text-[#8A2323] shadow-sm group-hover:bg-[#8A2323] group-hover:text-[#E3DAC9] transition-colors">
                                    <span className="text-xl">🔓</span>
                                </div>
                                <span className="text-[10px] uppercase tracking-widest font-bold text-[#8A2323]">Unlock Truth</span>
                            </button>
                        </div>
                    </div>
                </div>


                {/* ============================================================
                    SIDE B: THE TRUTH (真相面 - 极简、仪式感、答案)
                   ============================================================ */}
                <div 
                    className="absolute inset-0 backface-hidden rotate-y-180 bg-[#0F111A] rounded-sm flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.8)] border-2 border-[#C5A059]"
                >
                    {/* Inner Gold Frame */}
                    <div className="absolute inset-1 border border-[#C5A059]/30 rounded-sm pointer-events-none"></div>
                    <div className="absolute inset-3 border border-[#C5A059]/10 rounded-sm pointer-events-none"></div>

                    {/* Content Container */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative z-10">
                        
                        {/* 1. The Icon (Visual Anchor) - Abstract Geometric Representation */}
                        <div className="mb-8 relative">
                            {/* Glowing Background */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#C5A059] opacity-10 blur-xl rounded-full"></div>
                            
                            {/* The Symbol */}
                            <div className="w-20 h-20 border-2 border-[#C5A059] rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(197,160,89,0.3)]">
                                <div className="w-16 h-16 border border-[#C5A059]/50 flex items-center justify-center -rotate-45">
                                    <span className="font-mystic text-4xl text-[#C5A059]">{data.word.charAt(0).toUpperCase()}</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. The Word (Beautiful Font) */}
                        <h2 className="font-mystic text-3xl text-[#E3DAC9] tracking-widest mb-2 text-shadow-glow">
                            {data.word}
                        </h2>

                        {/* 3. The Definition (Simple Answer) */}
                        <div className="relative mb-6">
                            <div className="h-[1px] w-12 bg-[#C5A059]/50 mx-auto mb-3"></div>
                            <p className="text-2xl font-serif font-bold text-[#C5A059] tracking-wide">
                                {data.etymology_story.modern_meaning.split(' ')[1] || data.etymology_story.modern_meaning}
                            </p>
                             <div className="h-[1px] w-12 bg-[#C5A059]/50 mx-auto mt-3"></div>
                        </div>

                        {/* 4. The Nuance/Sentence (Short context) */}
                        <p className="text-[#E3DAC9]/70 font-serif italic text-sm leading-relaxed max-w-[90%]">
                            "{shortNuance}"
                        </p>

                    </div>

                    {/* 5. Action Buttons (Ritual) */}
                    <div className="h-20 flex border-t border-[#C5A059]/30 relative z-20 bg-[#0F111A]">
                        {/* FORGET (Abyss) */}
                        <button 
                            onClick={() => handleDecision('forget')}
                            className="flex-1 flex items-center justify-center gap-2 text-[#E3DAC9]/50 hover:text-[#8A2323] hover:bg-[#8A2323]/10 transition-colors border-r border-[#C5A059]/20"
                        >
                            <span className="text-lg">✖</span>
                            <span className="text-xs uppercase tracking-widest font-bold">Forget</span>
                        </button>

                        {/* REMEMBER (Sanctum) */}
                        <button 
                            onClick={() => handleDecision('remember')}
                            className="flex-1 flex items-center justify-center gap-2 text-[#E3DAC9]/50 hover:text-[#C5A059] hover:bg-[#C5A059]/10 transition-colors"
                        >
                            <span className="text-xs uppercase tracking-widest font-bold">Remember</span>
                            <span className="text-lg">✔</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};

export default WordCard;