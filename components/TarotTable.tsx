import React, { useState, useEffect, useRef } from 'react';
import { TAROT_DECK } from '../data/tarot';
import { TarotArcana } from '../types';

interface TarotTableProps {
    onReadingComplete: (cards: TarotArcana[]) => void;
}

type Phase = 'shuffle' | 'spread' | 'completing';

const TarotTable: React.FC<TarotTableProps> = ({ onReadingComplete }) => {
    const [phase, setPhase] = useState<Phase>('shuffle');
    const [deck, setDeck] = useState<TarotArcana[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isShuffling, setIsShuffling] = useState(false);
    
    // Selection State
    const [selectedCards, setSelectedCards] = useState<TarotArcana[]>([]);
    const [hiddenIndices, setHiddenIndices] = useState<Set<number>>(new Set());

    // Touch handling state
    const touchStartX = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize deck
    useEffect(() => {
        // 4x Deck for thickness
        const fullDeck = [...TAROT_DECK, ...TAROT_DECK, ...TAROT_DECK, ...TAROT_DECK];
        setDeck(fullDeck.sort(() => Math.random() - 0.5));
        setActiveIndex(5);
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
            let newIndex = activeIndex + direction;
            
            // Skip hidden cards (cards already selected)
            while (hiddenIndices.has(newIndex) && newIndex >= 0 && newIndex < deck.length) {
                newIndex += direction;
            }

            newIndex = Math.min(Math.max(0, newIndex), deck.length - 1);
            if (!hiddenIndices.has(newIndex)) {
                setActiveIndex(newIndex);
            }
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
            let newIndex = activeIndex + direction;

            // Skip hidden cards
            while (hiddenIndices.has(newIndex) && newIndex >= 0 && newIndex < deck.length) {
                newIndex += direction;
            }

            newIndex = Math.min(Math.max(0, newIndex), deck.length - 1);
             if (!hiddenIndices.has(newIndex)) {
                setActiveIndex(newIndex);
                touchStartX.current = currentX; 
            }
        }
    };

    const handleTouchEnd = () => {
        touchStartX.current = null;
    };

    // --- SELECTION LOGIC ---
    const handleCardClick = (index: number) => {
        if (phase !== 'spread') return;
        
        if (index === activeIndex) {
            // Select the card
            if (selectedCards.length < 3) {
                const card = deck[index];
                const newSelected = [...selectedCards, card];
                setSelectedCards(newSelected);
                
                // Hide from deck visually
                setHiddenIndices(prev => new Set(prev).add(index));

                // Find next available active index
                let nextIndex = index + 1;
                if (nextIndex >= deck.length) nextIndex = index - 1;
                while (hiddenIndices.has(nextIndex) || nextIndex === index) {
                    nextIndex++;
                    if (nextIndex >= deck.length) {
                        nextIndex = 0; // Wrap or break
                        break; 
                    }
                }
                setActiveIndex(nextIndex);

                // Check completion
                if (newSelected.length === 3) {
                    setPhase('completing');
                    setTimeout(() => {
                        onReadingComplete(newSelected);
                    }, 1000);
                }
            }
        } else {
            setActiveIndex(index);
        }
    };

    // --- THE HAND FAN LOGIC ---
    const getCardStyle = (index: number) => {
        // If card is selected (hidden from fan), we don't render it in the fan
        if (hiddenIndices.has(index)) {
             return { display: 'none' };
        }

        const zIndex = index;

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

        // SPREAD (FAN) ANIMATION
        if (phase === 'spread' || phase === 'completing') {
            const offset = index - activeIndex;
            const absOffset = Math.abs(offset);
            
            // Standard Fan Config
            const VISIBLE_RADIUS = 6; 
            const MAX_ROTATION = 75; 
            const transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';

            // 1. RIGHT STACK
            if (offset > VISIBLE_RADIUS) {
                const stackDepth = offset - VISIBLE_RADIUS; 
                const visualStackOffset = Math.min(stackDepth, 8); 
                return {
                    transform: `
                        translateX(${140 + (visualStackOffset * 1.5)}px) 
                        translateY(${120 + (visualStackOffset * 0.5)}px) 
                        rotate(${MAX_ROTATION}deg)
                    `,
                    zIndex, 
                    opacity: 1,
                    transition,
                    transformOrigin: '50% 120%' 
                };
            }

            // 2. LEFT STACK
            if (offset < -VISIBLE_RADIUS) {
                const stackDepth = Math.abs(offset) - VISIBLE_RADIUS;
                const visualStackOffset = Math.min(stackDepth, 8);
                return {
                    transform: `
                        translateX(${-140 - (visualStackOffset * 1.5)}px) 
                        translateY(${120 + (visualStackOffset * 0.5)}px) 
                        rotate(${-MAX_ROTATION}deg)
                    `,
                    zIndex, 
                    opacity: 1,
                    transition,
                    transformOrigin: '50% 120%'
                };
            }

            // 3. THE ACTIVE FAN
            const sign = offset > 0 ? 1 : -1;
            const rotate = sign * Math.pow(absOffset, 1.2) * 6; 
            const xTranslate = offset * 18; 
            let yTranslate = 0;
            let scale = 0.95;

            if (index === activeIndex) {
                yTranslate = -70; 
                scale = 1.15;
            } else {
                yTranslate = 20; 
            }

            // If we are completing, fade out the remaining deck
            const opacity = phase === 'completing' ? 0 : 1;
            const finalScale = phase === 'completing' ? 0.8 : scale;

            return {
                transform: `translateX(${xTranslate}px) translateY(${yTranslate}px) rotate(${rotate}deg) scale(${finalScale})`,
                zIndex, 
                opacity,
                transition: 'all 0.6s ease-out',
                transformOrigin: '50% 120%' 
            };
        }
        return {};
    };

    return (
        <div 
            className="w-full h-full flex flex-col items-center relative overflow-hidden bg-midnight select-none"
            ref={containerRef}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            
            {/* --- TOP SLOTS (THE ALTAR) --- */}
            <div className="absolute top-8 left-0 right-0 z-20 flex justify-center gap-4 transition-all duration-500">
                {[0, 1, 2].map((slotIndex) => {
                    const card = selectedCards[slotIndex];
                    return (
                        <div 
                            key={slotIndex}
                            className={`
                                w-20 h-32 rounded border-2 flex items-center justify-center transition-all duration-500
                                ${card 
                                    ? 'border-gold bg-midnight shadow-[0_0_15px_rgba(197,160,89,0.5)] scale-100' 
                                    : 'border-white/10 bg-white/5 scale-95'
                                }
                            `}
                        >
                            {card ? (
                                <div className="text-center animate-[pop-in_0.3s_ease-out]">
                                    <div className="text-2xl mb-1">{card.icon}</div>
                                    <div className="text-[8px] uppercase tracking-widest text-gold">{card.name_cn}</div>
                                </div>
                            ) : (
                                <div className="text-white/10 text-xl">
                                    {slotIndex === 0 ? 'Ⅰ' : slotIndex === 1 ? 'Ⅱ' : 'Ⅲ'}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

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

            {/* --- PHASE 2: INSTRUCTIONS --- */}
            {phase === 'spread' && (
                <div className="absolute top-44 text-center z-10 animate-fade-in pointer-events-none">
                    <h2 className="text-gold font-mystic text-sm tracking-widest mb-1 text-glow">
                        Select {3 - selectedCards.length} Cards
                    </h2>
                </div>
            )}

            {/* --- CARD CONTAINER --- */}
            <div className="flex-1 w-full relative flex items-center justify-center perspective-1000 translate-y-16">
                {deck.map((card, i) => (
                    <div
                        key={i}
                        onClick={() => handleCardClick(i)}
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
                                <div className="text-7xl mb-6">{card.icon}</div>
                                <h3 className="font-mystic text-xl text-white uppercase tracking-widest mb-2">{card.name}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TarotTable;