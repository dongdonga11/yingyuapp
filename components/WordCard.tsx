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
  const [isFlying, setIsFlying] = useState(false); // State for the "Fly to Deck" animation
  
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
        setIsFlying(false);
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
      // Prevent double firing
      if (!isActive || isFlying) return;

      console.log("Decision made:", decision); // Debugging

      // Trigger the "Fly" animation
      setIsFlying(true);

      // Wait for animation (600ms) to complete before switching data
      setTimeout(() => {
          if (decision === 'remember') {
              onNext();
          } else {
              onHard();
          }
      }, 600); 
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

  // --- ANIMATION STYLES ---
  
  // 1. Stack Styles (Depth)
  const stackScale = 1 - (stackIndex * 0.05); 
  const stackTranslateY = stackIndex * 15;    
  const stackOpacity = stackIndex === 0 ? 1 : (1 - stackIndex * 0.3);
  const stackBrightness = stackIndex === 0 ? 1 : 0.5;

  // 2. Fly Styles (Action)
  // Target: Top Right Sidebar (approx relative to center of screen)
  // Moving X: +140px (Right), Y: -250px (Up towards sidebar)
  const flyStyle = isFlying ? {
      transform: 'translate(140px, -350px) rotate(10deg) scale(0.2)',
      opacity: 0,
      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' 
  } : {};

  return (
    <div 
        className={`absolute top-0 left-0 w-full h-full flex flex-col items-center py-4 transition-all duration-500 ease-out`}
        style={{
            zIndex: 10 - stackIndex,
            transform: `translateY(${stackTranslateY}px) scale(${stackScale})`,
            opacity: stackOpacity,
            filter: `brightness(${stackBrightness})`,
            // IMPORTANT: The container allows pointer events if active, 
            // but we fine-tune inner elements to avoid blocking.
            pointerEvents: isActive ? 'none' : 'none', 
        }}
    >
        {/* Card Wrapper - This animates the fly effect */}
        <div 
            className="w-full max-w-md flex-1 relative perspective-1000 mb-8"
            style={isActive ? { ...flyStyle, pointerEvents: 'auto' } : { pointerEvents: 'none' }}
        >
            
            <div 
                className={`
                    w-full h-full preserve-3d relative transition-transform duration-700
                `}
                style={{
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
            >
                
                {/* ============================================================
                    SIDE A: THE RITUAL (正面)
                   ============================================================ */}
                <div 
                    className="absolute inset-0 backface-hidden bg-obsidian rounded-xl shadow-glow overflow-hidden text-parchment"
                    // CRITICAL FIX: Disable pointer events on Side A when flipped so it doesn't block Side B buttons
                    style={{ pointerEvents: isFlipped ? 'none' : 'auto' }}
                >
                    {/* Frame */}
                    <div className="absolute inset-2 border border-gold/40 rounded-lg pointer-events-none"></div>
                    <div className="absolute inset-3 border border-gold/20 rounded-md pointer-events-none"></div>

                    {/* Content */}
                    <div className="w-full h-full flex flex-col items-center p-6 relative z-10">
                        
                        {/* Header */}
                        <div className="flex flex-col items-center mb-6 w-full">
                            <h3 className="font-mystic text-gold text-sm tracking-[0.3em] uppercase border-b border-gold/30 pb-1 mb-1">
                                {data.root_family.toUpperCase()} ARCANA
                            </h3>
                        </div>

                        {/* Visualization */}
                        <div className="relative flex flex-col items-center justify-center mb-8 w-full">
                             <div className="absolute w-24 h-24 rounded-full border border-gold/10 animate-[spin_10s_linear_infinite]"></div>
                             <div className="absolute w-20 h-20 rounded-full border border-gold/20"></div>
                             <div className="text-4xl text-gold mb-2 relative z-10">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                    <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v.816c1.32.122 2.6.438 3.793.923l1.144-2.288a.75.75 0 011.342.67l-1.076 2.152c1.78.966 3.237 2.378 4.168 4.098a.75.75 0 11-1.318.714 8.261 8.261 0 00-2.036-2.583l-1.205 3.614a.75.75 0 01-1.423-.474l.904-2.712A9.771 9.771 0 0012.75 4.582V20.25h2.25a.75.75 0 010 1.5h-6a.75.75 0 010-1.5h2.25V4.582a9.771 9.771 0 00-4.343 2.535l.904 2.712a.75.75 0 01-1.423.474l-1.205-3.614a8.261 8.261 0 00-2.036 2.583.75.75 0 11-1.318-.714 9.766 9.766 0 014.168-4.098L5.968 2.43a.75.75 0 011.342-.67L8.454 4.05c1.193-.485 2.473-.8 3.793-.923V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
                                </svg>
                             </div>
                             <span className="text-[10px] text-gold/30 tracking-[0.2em] uppercase font-sans">
                                Etching Visualization
                             </span>
                        </div>

                        {/* Word */}
                        <div className="flex items-center gap-2 mb-6">
                            <h1 className="font-mystic text-4xl text-gold text-glow tracking-wide text-center">
                                {data.word}
                            </h1>
                             <button onClick={playAudio} className="text-gold/40 hover:text-gold mt-1">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 2.485.6 4.85 1.691 6.941.342 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 2.001 2.001 0 000-11.668.75.75 0 010-1.06z" />
                                </svg>
                             </button>
                        </div>

                        {/* Components */}
                        <div className="w-full px-2 mb-8 grid grid-cols-2 gap-y-4 text-center">
                            {data.components.filter(c => c.type === 'prefix').map((p, i) => (
                                <div key={`pre-${i}`} className="flex flex-col items-center">
                                    <span className="font-serif text-lg text-parchment underline decoration-gold/30 underline-offset-4">{p.part}</span>
                                    <span className="text-[10px] text-gold/60 uppercase mt-1">{p.meaning}</span>
                                </div>
                            ))}
                            {data.components.filter(c => c.type === 'root').map((r, i) => (
                                <div key={`root-${i}`} className="flex flex-col items-center">
                                    <span className="font-serif text-lg text-parchment underline decoration-gold/30 underline-offset-4">{r.part}</span>
                                    <span className="text-[10px] text-gold/60 uppercase mt-1">{r.meaning}</span>
                                </div>
                            ))}
                            {data.components.filter(c => c.type === 'suffix').length > 0 && (
                                <div className="col-span-2 flex flex-col items-center mt-2">
                                     <span className="font-serif text-lg text-parchment underline decoration-gold/30 underline-offset-4">{data.components.find(c => c.type === 'suffix')?.part}</span>
                                     <span className="text-[10px] text-gold/60 uppercase mt-1">{data.components.find(c => c.type === 'suffix')?.meaning}</span>
                                </div>
                            )}
                        </div>

                        {/* Origin */}
                        <div className="flex-1 flex items-center justify-center w-full px-4 text-center mb-6">
                            <p className="font-serif text-parchment/80 italic text-sm leading-relaxed">
                                "{data.etymology_story.origin_image}"
                            </p>
                        </div>

                        {/* Seal Button */}
                        <div className="mt-auto pt-4 flex flex-col items-center cursor-pointer group" onClick={() => isActive && setIsFlipped(true)}>
                            <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center bg-midnight/50 group-hover:bg-gold/10 group-hover:scale-110 transition-all">
                                <span className="text-xl">🔒</span>
                            </div>
                            <span className="font-mystic text-gold/60 text-xs tracking-[0.2em] mt-2 group-hover:text-gold transition-colors">
                                TAP THE SEAL TO REVEAL
                            </span>
                        </div>
                    </div>
                </div>


                {/* ============================================================
                    SIDE B: THE REVELATION (背面 - 答案 & 操作面)
                   ============================================================ */}
                <div 
                    className="absolute inset-0 backface-hidden rotate-y-180 bg-obsidian rounded-xl shadow-glow overflow-hidden"
                    // CRITICAL FIX: Enable pointer events on Side B only when flipped
                    style={{ pointerEvents: isFlipped ? 'auto' : 'none' }}
                >
                     {/* Frame */}
                    <div className="absolute inset-2 border border-gold/40 rounded-lg pointer-events-none"></div>
                    <div className="absolute inset-3 border border-gold/20 rounded-md pointer-events-none"></div>

                    <div className="w-full h-full relative flex flex-col items-center p-6 z-10">
                        
                        {/* 1. Top Section: Icon & Word */}
                        <div className="flex-1 w-full flex flex-col items-center justify-center">
                            <div className="w-20 h-20 rounded-full border border-gold/30 flex items-center justify-center mb-4 relative">
                                 <div className="absolute inset-0 bg-gold/10 rounded-full blur-xl animate-pulse"></div>
                                 <span className="text-4xl filter drop-shadow-lg relative z-10 text-gold">📜</span>
                            </div>
                            <h2 className="text-2xl font-mystic text-parchment mb-4 tracking-wider">{data.word}</h2>
                            
                            <div className="relative py-3 px-8 mb-4 border-t border-b border-gold/30 w-full text-center bg-gold/5">
                                <span className="text-3xl font-bold font-serif text-gold text-glow">
                                    {data.etymology_story.modern_meaning.split(' ')[1] || data.etymology_story.modern_meaning}
                                </span>
                            </div>

                            <p className="text-sm font-serif text-parchment/70 text-center leading-relaxed italic max-w-[90%] mb-4">
                                "{data.nuance.split('。')[0]}。"
                            </p>
                            
                            {/* Chat Button (Small) */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowChat(true); }}
                                className="text-xs text-gold/50 hover:text-gold flex items-center gap-1 border border-gold/20 px-3 py-1 rounded-full hover:bg-gold/10 transition-all z-20"
                            >
                                <span>🔮</span> Ask Oracle
                            </button>
                        </div>

                        {/* 2. Bottom Section: DECISION BUTTONS */}
                        <div className="w-full pb-2 pt-4 border-t border-gold/10 flex justify-between items-end gap-4 relative z-20">
                            
                            {/* FORGET BUTTON */}
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    handleDecision('forget'); 
                                }}
                                className="flex-1 group flex flex-col items-center gap-2 py-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-full border border-alchemist/50 text-alchemist bg-midnight shadow-[0_0_15px_rgba(138,35,35,0.1)] flex items-center justify-center group-hover:scale-110 group-hover:bg-alchemist group-hover:text-white transition-all duration-300">
                                    <span className="text-lg">⚡</span>
                                </div>
                                <span className="text-[10px] font-mystic text-alchemist/70 tracking-[0.2em] group-hover:text-alchemist">FORGET</span>
                            </button>

                            {/* REMEMBER BUTTON */}
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    handleDecision('remember'); 
                                }}
                                className="flex-1 group flex flex-col items-center gap-2 py-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-full border border-gold/50 text-gold bg-midnight shadow-[0_0_15px_rgba(197,160,89,0.1)] flex items-center justify-center group-hover:scale-110 group-hover:bg-gold group-hover:text-midnight transition-all duration-300">
                                    <span className="text-lg">🧠</span>
                                </div>
                                <span className="text-[10px] font-mystic text-gold/70 tracking-[0.2em] group-hover:text-gold">REMEMBER</span>
                            </button>

                        </div>

                    </div>
                </div>

            </div>
        </div>

        {/* Chat Interface (Overlay) */}
        {showChat && (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col m-2 rounded-xl border border-gold/30 overflow-hidden animate-fade-in pointer-events-auto">
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
    </div>
  );
};

export default WordCard;