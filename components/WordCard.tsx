import React, { useState, useEffect } from 'react';
import { WordData } from '../types';
import { chatWithLogos } from '../services/geminiService';

interface WordCardProps {
  data: WordData;
  onNext: () => void;
  onHard: () => void;
}

const WordCard: React.FC<WordCardProps> = ({ data, onNext, onHard }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
    setShowChat(false);
    setChatHistory([]);
  }, [data.id]);

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

  return (
    <div className="flex flex-col h-full w-full relative py-4">
        {/* Card Container */}
        <div 
            className="flex-1 w-full relative perspective-1000 cursor-pointer group mb-20"
            // For desktop hover effect, but keeping click for mobile mainly
        >
            <div className={`w-full h-full duration-700 preserve-3d relative transition-all ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* --- SIDE A: THE RIDDLE (The Mystery) --- */}
                <div className="absolute inset-0 backface-hidden bg-obsidian rounded-xl border-2 border-gold/30 flex flex-col items-center p-1 shadow-glow overflow-hidden">
                    {/* Inner Border (Tarot style) */}
                    <div className="w-full h-full border border-gold/20 rounded-lg p-6 flex flex-col relative bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.03),transparent)]">
                        
                        {/* Family Badge */}
                        <div className="absolute top-4 left-0 right-0 flex justify-center">
                            <div className="px-3 py-1 border-b border-gold/30 text-gold/60 text-[10px] uppercase tracking-[0.3em] font-serif">
                                {data.root_family} Arcana
                            </div>
                        </div>

                        {/* Visual Centerpiece (Placeholder for Etching) */}
                        <div className="mt-12 mb-8 flex-1 flex items-center justify-center relative">
                            {/* Decorative Circle */}
                            <div className="absolute w-48 h-48 border border-gold/10 rounded-full animate-[spin_60s_linear_infinite]"></div>
                            <div className="absolute w-32 h-32 border border-gold/20 rounded-full rotate-45"></div>
                             {/* Text Art Placeholder */}
                            <div className="text-center">
                                <span className="text-4xl block mb-2 opacity-50">⚖️</span>
                                <span className="text-xs text-gold/30 uppercase tracking-widest">Etching Visualization</span>
                            </div>
                        </div>

                        {/* The Word */}
                        <h2 className="text-4xl text-center font-mystic text-gold mb-8 text-glow tracking-wide uppercase">
                            {data.word}
                        </h2>

                        {/* The Formula (Visual Etymology) */}
                        <div className="flex flex-wrap justify-center gap-2 mb-10">
                             {data.components.map((c, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <span className="text-parchment font-serif text-lg border-b border-gold/30 pb-1 mb-1">{c.part}</span>
                                    <span className="text-[10px] text-gold/60 uppercase tracking-wider">{c.meaning}</span>
                                </div>
                             ))}
                        </div>

                        {/* Socratic Prompt */}
                        <div className="mt-auto text-center">
                            <p className="font-serif italic text-parchment/80 text-sm leading-relaxed mb-6">
                                "当{data.root_meaning}被{data.components[0]?.meaning}驱赶到一处，<br/>会发生什么？"
                            </p>
                            
                            {/* The Seal Button */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                                className="w-16 h-16 rounded-full border border-gold/40 flex items-center justify-center mx-auto hover:bg-gold/10 hover:scale-105 transition-all active:scale-95 group-hover:border-gold"
                            >
                                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                                    <span className="text-xl opacity-80">🔓</span>
                                </div>
                            </button>
                            <p className="text-[10px] text-gold/40 mt-2 uppercase tracking-widest">Tap the seal to reveal</p>
                        </div>
                    </div>
                </div>

                {/* --- SIDE B: THE REVELATION (The Truth) --- */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-obsidian rounded-xl border-2 border-gold/50 flex flex-col p-1 shadow-glow-strong overflow-hidden">
                     <div className="w-full h-full border border-gold/20 rounded-lg flex flex-col relative bg-midnight overflow-y-auto custom-scrollbar">
                        
                        {/* Header: Meaning */}
                        <div className="p-6 border-b border-gold/10 bg-gold/5 text-center">
                            <h3 className="font-mystic text-2xl text-gold mb-1">{data.word}</h3>
                            <div className="text-xl font-serif text-parchment font-bold mb-1">
                                {data.etymology_story.modern_meaning.split(' ')[1] || data.etymology_story.modern_meaning}
                            </div>
                            <div className="text-xs font-serif italic text-gold/60">
                                {data.phonetic}
                            </div>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* 1. Root Deep Dive */}
                            <div className="relative pl-4 border-l border-gold/30">
                                <div className="text-[10px] text-gold/50 uppercase tracking-widest mb-1">The Root</div>
                                <div className="text-parchment text-sm leading-relaxed">
                                    <span className="text-gold font-bold">Origin:</span> {data.root_family} = {data.root_meaning}
                                </div>
                            </div>

                            {/* 2. Logic & Story */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-[1px] flex-1 bg-gold/20"></div>
                                    <span className="text-xs text-gold uppercase tracking-widest">The Legend</span>
                                    <div className="h-[1px] flex-1 bg-gold/20"></div>
                                </div>
                                <p className="text-sm font-serif text-parchment/90 leading-loose text-justify">
                                    {data.etymology_story.origin_image}
                                </p>
                                <div className="mt-3 p-3 bg-gold/5 rounded border border-gold/10 text-xs text-gold/80 font-mono">
                                    Logic: {data.etymology_story.logic}
                                </div>
                            </div>

                            {/* 3. Family Ties (Related Words) */}
                            {data.related_words && data.related_words.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-lg">⚜️</span>
                                        <span className="text-xs text-gold uppercase tracking-widest">Family Ties</span>
                                    </div>
                                    <div className="space-y-3">
                                        {data.related_words.map((rw, idx) => (
                                            <div key={idx} className="flex justify-between items-start text-sm pb-2 border-b border-white/5 last:border-0">
                                                <div>
                                                    <span className="text-parchment font-bold block">{rw.word}</span>
                                                    <span className="text-[10px] text-gold/60">{rw.relation}</span>
                                                </div>
                                                <span className="text-xs text-gray-400">{rw.meaning}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                             {/* 4. The Prophecy (Quote) */}
                            {data.quote && (
                                <div className="pt-4 text-center">
                                    <p className="font-serif italic text-gold/80 text-sm mb-2">"{data.quote.text}"</p>
                                    <div className="w-8 h-[1px] bg-gold/40 mx-auto"></div>
                                </div>
                            )}
                        </div>

                        <div className="h-16"></div> {/* Spacer */}
                    </div>
                </div>
            </div>
        </div>

        {/* Floating Actions (Mystic Runes) */}
        <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto flex justify-between items-center z-50 pointer-events-none">
             <button 
                onClick={onHard}
                className="pointer-events-auto w-14 h-14 rounded-full bg-obsidian border border-alchemist text-alchemist shadow-lg flex items-center justify-center hover:bg-alchemist hover:text-white transition-colors"
            >
                <span className="text-2xl">⚡️</span>
            </button>

             <button 
                onClick={(e) => { e.stopPropagation(); setShowChat(true); }}
                className="pointer-events-auto w-12 h-12 rounded-full bg-gold/10 border border-gold/30 text-gold flex items-center justify-center backdrop-blur-sm"
            >
                <span>🔮</span>
            </button>

            <button 
                onClick={onNext}
                className="pointer-events-auto w-14 h-14 rounded-full bg-gold text-midnight shadow-glow flex items-center justify-center hover:scale-105 transition-transform"
            >
                <span className="text-2xl">➔</span>
            </button>
        </div>

        {/* Chat Interface (The Oracle) */}
        {showChat && (
             <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col m-4 rounded-xl border border-gold/30 overflow-hidden animate-fade-in">
                <div className="p-3 border-b border-gold/20 bg-midnight flex justify-between items-center">
                    <span className="font-mystic text-gold">The Oracle</span>
                    <button onClick={() => setShowChat(false)} className="text-gold/50 hover:text-gold">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-midnight/50 custom-scrollbar">
                    <div className="text-xs text-gold/40 text-center uppercase tracking-widest mb-4">- Ask the Spirits -</div>
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