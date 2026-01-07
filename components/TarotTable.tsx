import React, { useState, useEffect, useRef } from 'react';
import { TAROT_DECK } from '../data/tarot';
import { TarotArcana } from '../types';

interface TarotTableProps {
    onReadingComplete: (cards: TarotArcana[]) => void;
}

type Phase = 'shuffle' | 'spread' | 'completing';

// Track the card currently animating to the slot
interface FlyingCardState {
    deckIndex: number;
    slotIndex: number;
}

const TarotTable: React.FC<TarotTableProps> = ({ onReadingComplete }) => {
    const [phase, setPhase] = useState<Phase>('shuffle');
    const [deck, setDeck] = useState<TarotArcana[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isShuffling, setIsShuffling] = useState(false);
    
    // Selection & Animation State
    const [selectedCards, setSelectedCards] = useState<TarotArcana[]>([]);
    const [hiddenIndices, setHiddenIndices] = useState<Set<number>>(new Set());
    const [flyingCard, setFlyingCard] = useState<FlyingCardState | null>(null);

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
        if (phase !== 'spread' || flyingCard) return; // Lock during animation
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        
        if (Math.abs(delta) > 5) {
            const direction = delta > 0 ? 1 : -1;
            let newIndex = activeIndex + direction;
            
            // Skip hidden cards
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
        if (phase !== 'spread' || touchStartX.current === null || flyingCard) return;
        
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
        if (flyingCard) return; // Prevent double clicks
        
        if (index === activeIndex) {
            // 1. Start Flying Animation
            if (selectedCards.length < 3) {
                const targetSlotIndex = selectedCards.length;
                setFlyingCard({ deckIndex: index, slotIndex: targetSlotIndex });

                // 2. After animation, update state
                setTimeout(() => {
                    const card = deck[index];
                    const newSelected = [...selectedCards, card];
                    
                    setSelectedCards(newSelected);
                    setHiddenIndices(prev => new Set(prev).add(index));
                    setFlyingCard(null);

                    // Find next available active index
                    let nextIndex = index + 1;
                    // Try to find nearest available neighbor
                    if (nextIndex >= deck.length || hiddenIndices.has(nextIndex)) {
                        // Look backwards if forwards is blocked or end of deck
                        let backIndex = index - 1;
                        while(backIndex >= 0 && hiddenIndices.has(backIndex)) backIndex--;
                        
                        if (backIndex >= 0) {
                            nextIndex = backIndex;
                        } else {
                            // Look forwards again harder
                            while(nextIndex < deck.length && hiddenIndices.has(nextIndex)) nextIndex++;
                        }
                    }
                    
                    if (nextIndex < deck.length && nextIndex >= 0) {
                        setActiveIndex(nextIndex);
                    }

                    // Check completion
                    if (newSelected.length === 3) {
                        setPhase('completing');
                        setTimeout(() => {
                            onReadingComplete(newSelected);
                        }, 800);
                    }
                }, 600); // Animation duration match
            }
        } else {
            setActiveIndex(index);
        }
    };

    // --- THE HAND FAN LOGIC ---
    const getCardStyle = (index: number) => {
        // If card is already in slot (hidden), don't render in fan
        if (hiddenIndices.has(index)) {
             return { display: 'none' };
        }

        const zIndex = index;

        // ANIMATION: FLYING TO SLOT
        if (flyingCard && flyingCard.deckIndex === index) {
            // Calculate target position relative to the container center
            // Container center is roughly screen center. 
            // Slots are at top: ~30px from top.
            // Fan center is roughly ~500px from top (translate-y-16 pushed it down).
            
            // X Offsets: 
            // Slot 0 (Left): -96px (approx)
            // Slot 1 (Center): 0px
            // Slot 2 (Right): 96px
            const slotX = (flyingCard.slotIndex - 1) * 100; 
            
            // Y Offset: Needs to go UP significantly. 
            // The fan is at `translate-y-16` (approx +64px). 
            // The slot is at `top-8` (32px). 
            // We need to move UP about 300-400px depending on screen.
            const moveUp = -350; 

            return {
                transform: `translateX(${slotX}px) translateY(${moveUp}px) rotate(0deg) scale(0.45)`,
                zIndex: 1000, // Top of everything
                opacity: 1,
                transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            };
        }

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

    // Helper Component for the Card Back Visuals (Reused in Deck and Slots)
    const CardBackVisual = () => (
        <div className="absolute inset-0 bg-obsidian rounded-lg border border-gold/60 flex items-center justify-center overflow-hidden">
            {/* Elaborate Back Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.15)_1.5px,transparent_1.5px)] bg-[size:10px_10px] opacity-40"></div>
            
            {/* Inner Frame */}
            <div className="absolute inset-2 border border-gold/30 rounded opacity-60"></div>
            <div className="absolute inset-4 border border-gold/10 rounded opacity-40"></div>
            
            {/* Mystic Symbol on Back */}
            <div className="w-full h-full flex items-center justify-center">
                 <div className="w-[40%] aspect-square border border-gold/40 rounded-full flex items-center justify-center relative rotate-45">
                    <div className="absolute w-[70%] h-[70%] border border-gold/30"></div>
                    <div className="text-xl opacity-30 -rotate-45">✦</div>
                </div>
            </div>
        </div>
    );

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
                    // Calculate if this slot is the target of the current flying card
                    const isTargetOfFlying = flyingCard?.slotIndex === slotIndex;

                    return (
                        <div 
                            key={slotIndex}
                            className={`
                                w-20 h-32 rounded flex items-center justify-center transition-all duration-500 relative
                                ${card 
                                    ? 'shadow-[0_0_20px_rgba(197,160,89,0.3)] scale-100' 
                                    : 'border-2 border-white/10 bg-white/5 scale-95 border-dashed'
                                }
                            `}
                        >
                            {card ? (
                                // Show Card Back when settled in slot
                                <div className="w-full h-full animate-[pop-in_0.3s_ease-out]">
                                    <div className="w-full h-full relative rounded-lg overflow-hidden transform scale-100">
                                         <CardBackVisual />
                                    </div>
                                </div>
                            ) : (
                                // Empty Slot Marker
                                !isTargetOfFlying && (
                                    <div className="text-white/10 text-xl font-serif">
                                        {slotIndex === 0 ? 'Ⅰ' : slotIndex === 1 ? 'Ⅱ' : 'Ⅲ'}
                                    </div>
                                )
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
                        {/* CARD BACK (Always visible initially) */}
                        <div className="absolute inset-0 backface-hidden bg-obsidian rounded-lg border border-gold/60 flex items-center justify-center overflow-hidden">
                             <CardBackVisual />
                        </div>

                        {/* CARD FRONT (Rotated 180, hidden until flipped in other views) */}
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