import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { TarotArcana, TarotReadingResponse } from '../types';

interface ShareCardProps {
    readingCards: TarotArcana[];
    oracleResult: TarotReadingResponse;
    wordCount: number;
    onClose: () => void;
}

const ShareCard: React.FC<ShareCardProps> = ({ readingCards, oracleResult, wordCount, onClose }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // The revelation card (3rd card) is the "Guide"
    const guideCard = readingCards[2] || readingCards[0];
    const dateStr = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);
        try {
            // Wait for fonts/images to be ready
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: '#0F111A',
                scale: 2, // High resolution
                useCORS: true,
                logging: false,
            });

            const link = document.createElement('a');
            link.download = `Logos_Oracle_${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Capture failed", err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="absolute inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-fade-in">
            
            {/* Action Bar */}
            <div className="w-full max-w-sm flex justify-between items-center mb-4 text-parchment">
                <span className="font-mystic text-gold text-xs tracking-widest uppercase">Crystallized Fate</span>
                <button onClick={onClose} className="hover:text-gold transition-colors">✕</button>
            </div>

            {/* --- THE TALISMAN (What gets captured) --- */}
            <div className="relative shadow-2xl overflow-hidden rounded-2xl" style={{ width: '300px' }}>
                <div 
                    ref={cardRef} 
                    className="w-[300px] h-[533px] bg-midnight relative flex flex-col items-center overflow-hidden border-4 border-double border-gold/40"
                >
                    {/* Background Texture */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                    <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay"></div>
                    
                    {/* Mystic Glows */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-900/20 blur-[80px] rounded-full"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold/10 blur-[80px] rounded-full"></div>

                    {/* --- CARD CONTENT --- */}
                    <div className="flex-1 w-full p-6 flex flex-col items-center relative z-10 justify-between">
                        
                        {/* Header */}
                        <div className="w-full flex justify-between items-end border-b border-gold/30 pb-2">
                            <div className="flex flex-col">
                                <span className="font-mystic text-gold text-xl tracking-widest">LOGOS</span>
                                <span className="font-serif text-[8px] text-parchment/60 uppercase tracking-[0.2em]">The Language Tarot</span>
                            </div>
                            <span className="font-serif text-parchment/80 italic text-xs">{dateStr}</span>
                        </div>

                        {/* Hero Section: The Guide Card */}
                        <div className="flex flex-col items-center mt-4">
                            <span className="text-[8px] text-purple-300 uppercase tracking-[0.3em] mb-2">Sign of the Day</span>
                            <div className="w-24 h-36 rounded border border-gold/50 bg-white/5 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(197,160,89,0.2)] relative mb-3">
                                <div className="text-5xl mb-2 filter drop-shadow-lg">{guideCard.icon}</div>
                                <div className="absolute -bottom-3 bg-midnight border border-gold/30 px-3 py-1 rounded-full text-xs font-mystic text-gold shadow-lg whitespace-nowrap">
                                    {guideCard.name_cn}
                                </div>
                            </div>
                        </div>

                        {/* The Whisper (Oracle Vibe) */}
                        <div className="w-full text-center my-2">
                            <div className="text-2xl text-gold/20 mb-1">❝</div>
                            <p className="font-serif text-sm text-parchment leading-relaxed px-2 italic">
                                {oracleResult.vibe || "Stars guide the silent traveler."}
                            </p>
                            <div className="text-2xl text-gold/20 mt-1 rotate-180">❝</div>
                        </div>

                        {/* Stats / Footer */}
                        <div className="w-full mt-auto">
                            {/* Memory Crystal */}
                            <div className="flex items-center justify-between bg-white/5 rounded border border-white/10 p-3 mb-4 backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">🧠</span>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] text-parchment/50 uppercase tracking-wider">Memory Harvest</span>
                                        <span className="text-xs text-gold font-bold">{wordCount} Words Collected</span>
                                    </div>
                                </div>
                                <div className="h-full w-[1px] bg-white/10 mx-2"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">🔮</span>
                                    <div className="flex flex-col text-right">
                                        <span className="text-[8px] text-parchment/50 uppercase tracking-wider">Outcome</span>
                                        <span className="text-xs text-purple-300 font-bold">{readingCards[2].name}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Branding Footer */}
                            <div className="w-full flex justify-center items-center gap-2 opacity-60">
                                <div className="w-16 h-[1px] bg-gold/50"></div>
                                <span className="text-[8px] uppercase tracking-[0.3em] text-gold">Divined by AI</span>
                                <div className="w-16 h-[1px] bg-gold/50"></div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="mt-8 flex flex-col gap-3 w-full max-w-xs z-50">
                <button 
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="w-full py-4 bg-gold text-midnight font-mystic text-sm uppercase tracking-widest rounded shadow-[0_0_20px_rgba(197,160,89,0.4)] hover:bg-white hover:text-midnight transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {isGenerating ? (
                        <span className="animate-pulse">Crystallizing...</span>
                    ) : (
                        <>
                            <span>⬇ Save Talisman</span>
                        </>
                    )}
                </button>
                <p className="text-center text-[10px] text-white/30 uppercase tracking-widest">
                    Save to share your journey
                </p>
            </div>

        </div>
    );
};

export default ShareCard;