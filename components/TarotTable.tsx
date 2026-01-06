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

    // Initialize deck - Create a "Full" feeling deck
    useEffect(() => {
        // Triple the deck to ensure we have a nice thick pile
        const fullDeck = [...TAROT_DECK, ...TAROT_DECK, ...TAROT_DECK];
        // Shuffle it
        setDeck(fullDeck.sort(() => Math.random() - 0.5));
        // Start near the beginning (index 2) so we see a pile on the right
        setActiveIndex(2);
    }, []);

    // --- PHASE 1: SHUFFLE ---
    const handleShuffle = () => {
        setIsShuffling(true);
        // Reduced delay from 1500ms to 600ms for snappier feel
        setTimeout(() => {
            setIsShuffling(false);
            setPhase('spread');
        }, 600); 
    };

    // --- INTERACTION HANDLERS ---
    
    // 1. Wheel / Scroll Support
    const handleWheel = (e: React.WheelEvent) => {
        if (phase !== 'spread') return;
        // Debounce slightly or just move based on direction
        if (Math.abs(e.deltaX) > 10 || Math.abs(e.deltaY) > 10) {
            const direction = e.deltaX > 0 || e.deltaY > 0 ? 1 : -1;
            const newIndex = Math.min(Math.max(0, activeIndex + direction), deck.length - 1);
            setActiveIndex(newIndex);
        }
    };

    // 2. Touch Swipe Support
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (phase !== 'spread' || touchStartX.current === null) return;
        
        const currentX = e.touches[0].clientX;
        const diff = touchStartX.current - currentX;

        // Sensitivity threshold
        if (Math.abs(diff) > 30) {
            const direction = diff > 0 ? 1 : -1; // Drag left = Next card
            const newIndex = Math.min(Math.max(0, activeIndex + direction), deck.length - 1);
            setActiveIndex(newIndex);
            touchStartX.current = currentX; // Reset to allow continuous scrolling
        }
    };

    const handleTouchEnd = () => {
        touchStartX.current = null;
    };

    // 3. Click to Select
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

    // --- FAN CALCULATIONS (The "Compact Fan" Logic) ---
    const getCardStyle = (index: number) => {
        if (phase === 'shuffle') {
            // Tighter jitter for the "deck in hand" feel
            const randomRot = Math.random() * 6 - 3;
            const randomX = Math.random() * 4 - 2;
            const randomY = Math.random() * 4 - 2;
            return {
                transform: `translate(${randomX}px, ${randomY}px) rotate(${randomRot}deg)`,
                opacity: 1,
                zIndex: index,
                transition: 'transform 0.1s'
            };
        }

        if (phase === 'spread') {
            const offset = index - activeIndex;
            
            // --- COMPACT FAN LOGIC ---
            // We want cards near the center to be distinct, but cards far away to pile up.
            
            // X Position:
            // Use a logarithmic-like scale. 
            // Center cards are ~30px apart.
            // Edge cards squeeze to ~5px apart.
            const direction = offset > 0 ? 1 : -1;
            const absOffset = Math.abs(offset);
            
            // How much X space each card takes. 
            // First 3 cards get 35px, subsequent cards get rapidly less.
            let xTranslate = 0;
            if (absOffset <= 3) {
                xTranslate = offset * 35; 
            } else {
                // Base for first 3
                xTranslate = 3 * 35 * direction;
                // Add condensed space for the rest
                xTranslate += (absOffset - 3) * 10 * direction;
            }

            // Y Position (The Arch):
            // Center is high (0), edges drop down.
            // y = x^2 curve
            const yTranslate = Math.pow(absOffset, 1.8) * 2 + (absOffset > 0 ? 20 : 0);

            // Rotation:
            // Fan out like a hand.
            const rotate = offset * 3; // 3 degrees per card

            // Scale & Z-Index
            const scale = index === activeIndex ? 1.1 : Math.max(0.8, 1 - (absOffset * 0.05));
            const z = 100 - absOffset;
            
            // Opacity
            // Fade out the very far edges to keep focus
            const opacity = 1 - (Math.max(0, absOffset - 15) * 0.2);

            return {
                transform: `translateX(${xTranslate}px) translateY(${yTranslate}px) rotate(${rotate}deg) scale(${scale})`,
                zIndex: z,
                opacity: Math.max(0, opacity),
                // Smooth spring-like transition for sliding
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
            };
        }
        
        // Reveal Phase
        if (phase === 'reveal') {
            if (index === activeIndex) {
                 return {
                    transform: `translate(0, -40px) scale(1.15) rotateY(180deg)`,
                    zIndex: 200,
                    opacity: 1,
                    transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                };
            } else {
                // Scatter effect
                const scatterDir = index < activeIndex ? -1 : 1;
                 return {
                    transform: `translate(${ scatterDir * 400 }px, 400px) rotate(${ scatterDir * 45 }deg)`,
                    opacity: 0,
                    transition: 'all 0.6s ease-in'
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
                    <h2 className="text-gold font-mystic text-xl tracking-widest mb-1 text-glow">Choose Your Fate</h2>
                    <p className="text-white/30 font-serif text-xs italic">Scroll or Swipe to reveal</p>
                </div>
            )}

            {/* --- CARD CONTAINER (THE FAN) --- */}
            {/* Container shifted down to allow fan arch */}
            <div className="relative w-full h-[600px] flex items-center justify-center perspective-1000 translate-y-20">
                {deck.map((card, i) => (
                    <div
                        key={i}
                        onClick={() => phase === 'spread' && handleCardClick(i)}
                        style={getCardStyle(i)}
                        className={`
                            absolute w-44 h-80 rounded-lg border border-gold/40 shadow-2xl cursor-pointer preserve-3d
                            will-change-transform
                            ${isShuffling ? 'animate-[shake_0.2s_infinite]' : ''}
                        `}
                    >
                        {/* CARD BACK */}
                        <div className="absolute inset-0 backface-hidden bg-obsidian rounded-lg border border-gold/60 flex items-center justify-center overflow-hidden">
                             {/* Elaborate Back Pattern */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.15)_1.5px,transparent_1.5px)] bg-[size:10px_10px] opacity-40"></div>
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.4)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.4)_50%,rgba(0,0,0,0.4)_75%,transparent_75%,transparent)] bg-[size:20px_20px] opacity-20"></div>
                            
                            {/* Inner Frame */}
                            <div className="absolute inset-3 border border-gold/30 rounded opacity-60"></div>
                            
                            {/* Mystic Symbol on Back */}
                            <div className="w-24 h-24 border border-gold/40 rounded-full flex items-center justify-center relative">
                                <div className="absolute w-16 h-16 border border-gold/30 rotate-45"></div>
                                <div className="text-2xl opacity-40">👁️</div>
                            </div>
                        </div>

                        {/* CARD FRONT (Only visible in Reveal phase due to rotateY) */}
                        <div 
                            className="absolute inset-0 backface-hidden rotate-y-180 bg-midnight rounded-lg border flex flex-col items-center justify-center text-center p-4 shadow-[0_0_50px_rgba(0,0,0,1)]"
                            style={{ borderColor: card.theme_color }}
                        >
                            <div className="flex-1 flex flex-col justify-center w-full relative">
                                <div className="absolute top-0 left-0 text-xs opacity-50 font-mystic" style={{ color: card.theme_color }}>
                                    {['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][i % 11] || '∞'}
                                </div>
                                
                                <div className="text-7xl mb-8 animate-float filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{card.icon}</div>
                                
                                <h3 className="font-mystic text-2xl text-white uppercase tracking-widest mb-2 scale-y-110">{card.name}</h3>
                                <div className="w-8 h-[1px] bg-white/20 mx-auto my-3"></div>
                                <div className="text-sm font-serif italic opacity-80" style={{ color: card.theme_color }}>{card.name_cn}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- PHASE 3: REVEAL DETAILS --- */}
            {phase === 'reveal' && activeCard && (
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-midnight via-midnight/95 to-transparent z-40 flex flex-col items-center animate-slide-up pb-12">
                    
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