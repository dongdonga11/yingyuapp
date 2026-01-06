import React, { useState, useEffect, useRef } from 'react';
import { TAROT_DECK } from '../data/tarot';
import { TarotArcana } from '../types';

interface TarotTableProps {
    onDraw: (card: TarotArcana) => void;
}

type Phase = 'shuffle' | 'spread' | 'reveal';

const TarotTable: React.FC<TarotTableProps> = ({ onDraw }) => {
    const [phase, setPhase] = useState<Phase>('shuffle');
    const [deck, setDeck] = useState<TarotArcana[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isShuffling, setIsShuffling] = useState(false);
    
    // Touch handling state
    const touchStartX = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize deck
    useEffect(() => {
        // 4x Deck to create a really thick pile feel
        const fullDeck = [...TAROT_DECK, ...TAROT_DECK, ...TAROT_DECK, ...TAROT_DECK];
        setDeck(fullDeck.sort(() => Math.random() - 0.5));
        // START AT 0: The deck is full on the left (Future)
        setActiveIndex(0);
    }, []);

    // --- PHASE 1: SHUFFLE ---
    const handleShuffle = () => {
        setIsShuffling(true);
        setTimeout(() => {
            setIsShuffling(false);
            setPhase('spread');
        }, 600); 
    };

    // --- INTERACTION HANDLERS ---
    
    const handleWheel = (e: React.WheelEvent) => {
        if (phase !== 'spread') return;
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        
        if (Math.abs(delta) > 5) {
            const direction = delta > 0 ? 1 : -1;
            const newIndex = Math.min(Math.max(0, activeIndex + direction), deck.length - 1);
            setActiveIndex(newIndex);
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (phase !== 'spread' || touchStartX.current === null) return;
        
        const currentX = e.touches[0].clientX;
        const diff = touchStartX.current - currentX;

        if (Math.abs(diff) > 20) {
            const direction = diff > 0 ? 1 : -1;
            const newIndex = Math.min(Math.max(0, activeIndex + direction), deck.length - 1);
            setActiveIndex(newIndex);
            touchStartX.current = currentX; 
        }
    };

    const handleTouchEnd = () => {
        touchStartX.current = null;
    };

    const handleCardClick = (index: number) => {
        if (index === activeIndex) {
            setPhase('reveal');
        } else {
            setActiveIndex(index);
        }
    };

    const handleAcceptFate = () => {
        onDraw(deck[activeIndex]);
    };

    // --- THE HAND FAN LOGIC ---
    // Rule: Z-Index is FIXED (index). 
    // Flow: Left (Future, High Z) -> Center (Active) -> Right (Past, Low Z).
    // To ensure visibility: Future pile must have a gap or extreme rotation to not cover Active.
    const getCardStyle = (index: number) => {
        const zIndex = index; // STATIC Z-INDEX

        // SHUFFLE ANIMATION
        if (phase === 'shuffle') {
            const randomRot = Math.random() * 6 - 3;
            const randomX = Math.random() * 4 - 2;
            const randomY = Math.random() * 4 - 2;
            return {
                transform: `translate(${randomX}px, ${randomY}px) rotate(${randomRot}deg)`,
                opacity: 1,
                zIndex,
                transition: 'transform 0.1s',
                transformOrigin: 'center center'
            };
        }

        // SPREAD ANIMATION
        if (phase === 'spread') {
            const offset = index - activeIndex; 
            
            // 1. ACTIVE CARD (CENTER)
            if (offset === 0) {
                return {
                    transform: `translateX(0px) translateY(-80px) rotate(0deg) scale(1.15)`,
                    zIndex, 
                    opacity: 1,
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    transformOrigin: '50% 120%',
                    filter: 'brightness(1.1) drop-shadow(0 20px 20px rgba(0,0,0,0.5))'
                };
            }

            // 2. FUTURE CARDS (LEFT SIDE)
            // Index > Active. Higher Z-Index. 
            // They are "on top" of Active if we aren't careful.
            // We push them to the Left (Negative X).
            if (offset > 0) {
                // Determine pile structure
                // We want a "Fan" look for the immediate future, and "Stack" for distant.
                const isImmediate = offset <= 6;
                
                if (isImmediate) {
                    // Immediate Future: Fan out to the left
                    // We add an extra gap (offset * -35) minus a base gap (-60) to clear the Active card.
                    return {
                        transform: `
                            translateX(${-80 + (offset * -25)}px) 
                            translateY(${20 + (offset * 5)}px) 
                            rotate(${offset * -4}deg) 
                            scale(1)
                        `,
                        zIndex,
                        opacity: 1,
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        transformOrigin: '50% 120%'
                    };
                } else {
                    // Distant Future: The Pile
                    const stackOffset = Math.min(offset - 6, 15);
                    return {
                        transform: `
                            translateX(${-230 - (stackOffset * 2)}px) 
                            translateY(${50 + (stackOffset * 0.5)}px) 
                            rotate(${-24 - (stackOffset * 0.2)}deg)
                        `,
                        zIndex,
                        opacity: 1,
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        transformOrigin: '50% 120%'
                    };
                }
            }

            // 3. PAST CARDS (RIGHT SIDE)
            // Index < Active. Lower Z-Index.
            // They tuck *under* the Active card naturally.
            if (offset < 0) {
                 const absOffset = Math.abs(offset);
                 const isImmediate = absOffset <= 4;
                 
                 // They slide to the right
                 if (isImmediate) {
                    return {
                        transform: `
                            translateX(${80 + (absOffset * 30)}px) 
                            translateY(${30 + (absOffset * 5)}px) 
                            rotate(${absOffset * 5}deg)
                            scale(1)
                        `,
                        zIndex, 
                        opacity: 1,
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        transformOrigin: '50% 120%'
                    };
                 } else {
                     // Discard Pile
                     const stackOffset = Math.min(absOffset - 4, 10);
                     return {
                        transform: `
                            translateX(${200 + (stackOffset * 2)}px) 
                            translateY(${50 + (stackOffset * 0.5)}px) 
                            rotate(${20 + (stackOffset * 1)}deg)
                        `,
                        zIndex,
                        opacity: 1 - (stackOffset * 0.1), // Fade out old cards slightly
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        transformOrigin: '50% 120%'
                     }
                 }
            }
        }
        
        // REVEAL ANIMATION
        if (phase === 'reveal') {
            if (index === activeIndex) {
                 return {
                    transform: `translate(0, -100px) scale(1.2) rotateY(180deg)`,
                    zIndex: 4000, // Explicitly high for the reveal moment ONLY
                    opacity: 1,
                    transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transformOrigin: 'center center'
                };
            } else {
                 return {
                    transform: `translate(${ (index - activeIndex) * 100 }px, 800px) rotate(${ (index - activeIndex) * 20 }deg)`,
                    opacity: 0,
                    transition: 'all 0.6s ease-in',
                    transformOrigin: 'center center'
                };
            }
        }
        return {};
    };

    const activeCard = deck[activeIndex];

    return (
        <div 
            className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-midnight select-none"
            ref={containerRef}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            
            {/* --- PHASE 1: SHUFFLE UI --- */}
            {phase === 'shuffle' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none">
                    <div className="text-gold font-mystic text-3xl mb-8 animate-pulse tracking-[0.3em]">THE SHUFFLE</div>
                    <div className="absolute bottom-24 pointer-events-auto">
                        <button 
                            onClick={handleShuffle}
                            disabled={isShuffling}
                            className={`
                                w-24 h-24 rounded-full border border-gold/50 text-gold flex items-center justify-center
                                shadow-[0_0_30px_rgba(197,160,89,0.2)] bg-midnight/80 backdrop-blur-sm
                                transition-all active:scale-95 hover:bg-gold/10 hover:shadow-[0_0_50px_rgba(197,160,89,0.4)]
                                ${isShuffling ? 'animate-[spin_1s_linear_infinite] border-t-transparent opacity-80' : 'animate-bounce'}
                            `}
                        >
                            <span className="text-4xl filter drop-shadow-lg">{isShuffling ? '✨' : '✋'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* --- PHASE 2: SPREAD HEADER --- */}
            {phase === 'spread' && (
                <div className="absolute top-16 text-center z-10 animate-fade-in pointer-events-none">
                    <h2 className="text-gold font-mystic text-xl tracking-widest mb-1 text-glow">Destiny Awaits</h2>
                    <p className="text-white/30 font-serif text-xs italic">
                        {deck.length - activeIndex} cards remaining
                    </p>
                </div>
            )}

            {/* --- CARD CONTAINER --- */}
            <div className="relative w-full h-[600px] flex items-center justify-center perspective-1000 translate-y-28">
                {deck.map((card, i) => (
                    <div
                        key={i}
                        onClick={() => phase === 'spread' && handleCardClick(i)}
                        style={getCardStyle(i)}
                        className={`
                            absolute w-44 h-80 rounded-lg border border-gold/40 shadow-[-5px_0_10px_rgba(0,0,0,0.5)] cursor-pointer preserve-3d
                            will-change-transform
                            ${isShuffling ? 'animate-[shake_0.2s_infinite]' : ''}
                        `}
                    >
                        {/* CARD BACK */}
                        <div className="absolute inset-0 backface-hidden bg-obsidian rounded-lg border border-gold/60 flex items-center justify-center overflow-hidden">
                             {/* Elaborate Back Pattern */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.15)_1.5px,transparent_1.5px)] bg-[size:10px_10px] opacity-40"></div>
                            
                            {/* Inner Frame */}
                            <div className="absolute inset-2 border border-gold/30 rounded opacity-60"></div>
                            <div className="absolute inset-4 border border-gold/10 rounded opacity-40"></div>
                            
                            {/* Mystic Symbol on Back */}
                            <div className="w-20 h-20 border border-gold/40 rounded-full flex items-center justify-center relative rotate-45">
                                <div className="absolute w-14 h-14 border border-gold/30"></div>
                                <div className="text-xl opacity-30 -rotate-45">✦</div>
                            </div>
                        </div>

                        {/* CARD FRONT */}
                        <div 
                            className="absolute inset-0 backface-hidden rotate-y-180 bg-midnight rounded-lg border flex flex-col items-center justify-center text-center p-4 shadow-[0_0_50px_rgba(0,0,0,1)]"
                            style={{ borderColor: card.theme_color }}
                        >
                            <div className="flex-1 flex flex-col justify-center w-full relative">
                                <div className="absolute top-2 left-2 text-xs opacity-50 font-mystic" style={{ color: card.theme_color }}>
                                    {['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][i % 11] || '∞'}
                                </div>
                                <div className="absolute top-2 right-2 text-xs opacity-30">✦</div>
                                
                                <div className="text-7xl mb-6 animate-float filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{card.icon}</div>
                                
                                <h3 className="font-mystic text-xl text-white uppercase tracking-widest mb-2">{card.name}</h3>
                                <div className="w-6 h-[1px] bg-white/20 mx-auto my-2"></div>
                                <div className="text-xs font-serif italic opacity-70" style={{ color: card.theme_color }}>{card.name_cn}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- PHASE 3: REVEAL DETAILS --- */}
            {phase === 'reveal' && activeCard && (
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-midnight via-midnight/98 to-transparent z-40 flex flex-col items-center animate-slide-up pb-12">
                    
                    {/* Fortune Text */}
                    <div className="text-center mb-8 max-w-xs">
                        <p className="font-serif italic text-parchment text-sm leading-loose tracking-wide">
                            "{activeCard.fortune_text}"
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-6 w-full max-w-xs mb-8 border-t border-b border-white/10 py-6">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[10px] uppercase tracking-widest text-white/40">Memory</span>
                            <div className="flex text-[10px] text-gold gap-0.5">{'★'.repeat(activeCard.stats.memory)}</div>
                        </div>
                        <div className="flex flex-col items-center gap-2 border-l border-r border-white/10 px-4">
                            <span className="text-[10px] uppercase tracking-widest text-white/40">Focus</span>
                            <div className="flex text-[10px] text-red-400 gap-0.5">{'★'.repeat(activeCard.stats.focus)}</div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[10px] uppercase tracking-widest text-white/40">Insight</span>
                            <div className="flex text-[10px] text-blue-400 gap-0.5">{'★'.repeat(activeCard.stats.insight)}</div>
                        </div>
                    </div>

                    <button 
                        onClick={handleAcceptFate}
                        className="w-full max-w-xs h-14 bg-gold text-midnight font-bold font-mystic text-lg uppercase tracking-[0.2em] rounded-sm shadow-[0_0_30px_rgba(197,160,89,0.3)] hover:bg-[#D4AF6A] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group"
                    >
                        <span>Accept Task</span>
                        <span className="group-hover:translate-x-1 transition-transform">➔</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default TarotTable;