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
    
    // Initialize a larger deck for the visual effect (duplicate some cards to make it look full)
    useEffect(() => {
        const fullDeck = [...TAROT_DECK, ...TAROT_DECK, ...TAROT_DECK].slice(0, 22);
        setDeck(fullDeck.sort(() => Math.random() - 0.5));
        setActiveIndex(Math.floor(fullDeck.length / 2));
    }, []);

    // --- PHASE 1: SHUFFLE ---
    const handleShuffle = () => {
        setIsShuffling(true);
        // Simulate shuffle animation duration
        setTimeout(() => {
            setIsShuffling(false);
            setPhase('spread');
        }, 1500);
    };

    // --- PHASE 2: SPREAD (Carousel Logic) ---
    const handleCardClick = (index: number) => {
        if (index === activeIndex) {
            // Pick this card!
            setPhase('reveal');
        } else {
            // Scroll to this card
            setActiveIndex(index);
        }
    };

    const handleAcceptFate = () => {
        onDraw(deck[activeIndex]);
    };

    // Helper to calculate style for the fan effect
    const getCardStyle = (index: number) => {
        if (phase === 'shuffle') {
            // Jitter effect
            const randomRot = Math.random() * 10 - 5;
            const randomX = Math.random() * 4 - 2;
            const randomY = Math.random() * 4 - 2;
            return {
                transform: `translate(${randomX}px, ${randomY}px) rotate(${randomRot}deg)`,
                opacity: 1,
                zIndex: index
            };
        }

        if (phase === 'spread') {
            const offset = index - activeIndex;
            // Config for the fan
            const xOffset = 40; // px per card
            const yCurve = 4; // px drop per step away from center
            const rotAngle = 5; // degrees per step
            
            const x = offset * xOffset;
            const y = Math.abs(offset) * yCurve + (Math.abs(offset) > 0 ? 10 : 0);
            const r = offset * rotAngle;
            const scale = index === activeIndex ? 1.1 : 0.9 - (Math.abs(offset) * 0.05);
            const z = 100 - Math.abs(offset);
            const opacity = 1 - (Math.abs(offset) * 0.15);

            // Limit opacity to not hide too much
            const finalOpacity = Math.max(opacity, 0.2);

            return {
                transform: `translateX(${x}px) translateY(${y}px) rotate(${r}deg) scale(${scale})`,
                zIndex: z,
                opacity: finalOpacity,
                transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'
            };
        }
        
        // Reveal Phase: Move selected to center, others fly away
        if (phase === 'reveal') {
            if (index === activeIndex) {
                 return {
                    transform: `translate(0, 0) scale(1) rotateY(180deg)`,
                    zIndex: 200,
                    opacity: 1,
                    transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                };
            } else {
                 return {
                    transform: `translate(${ (index - activeIndex) * 100 }px, 200px) rotate(${ (index - activeIndex) * 20 }deg)`,
                    opacity: 0,
                    transition: 'all 0.5s ease-out'
                };
            }
        }
        return {};
    };

    const activeCard = deck[activeIndex];

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-midnight">
            
            {/* --- PHASE 1: SHUFFLE UI --- */}
            {phase === 'shuffle' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none">
                    <div className="text-gold font-mystic text-3xl mb-8 animate-pulse tracking-[0.3em]">THE SHUFFLE</div>
                    <div className="absolute bottom-20 pointer-events-auto">
                        <button 
                            onClick={handleShuffle}
                            disabled={isShuffling}
                            className={`
                                w-20 h-20 rounded-full border-2 border-gold text-gold flex items-center justify-center
                                shadow-[0_0_20px_rgba(197,160,89,0.3)] bg-midnight
                                transition-all active:scale-90 hover:bg-gold/10
                                ${isShuffling ? 'animate-spin border-t-transparent' : ''}
                            `}
                        >
                            {isShuffling ? '' : '✋'}
                        </button>
                    </div>
                </div>
            )}

            {/* --- PHASE 2: SPREAD HEADER --- */}
            {phase === 'spread' && (
                <div className="absolute top-12 text-center z-10 animate-fade-in">
                    <h2 className="text-gold font-mystic text-xl tracking-widest mb-1">Pick Your Path</h2>
                    <p className="text-white/30 font-serif text-xs italic">Swipe & tap the center card</p>
                </div>
            )}

            {/* --- CARD CONTAINER (THE FAN) --- */}
            <div className="relative w-full h-80 flex items-center justify-center perspective-1000">
                {deck.map((card, i) => (
                    <div
                        key={i}
                        onClick={() => phase === 'spread' && handleCardClick(i)}
                        style={getCardStyle(i)}
                        className={`
                            absolute w-40 h-64 rounded-xl border border-gold/40 shadow-2xl cursor-pointer preserve-3d
                            ${isShuffling ? 'animate-[shake_0.5s_infinite]' : ''}
                        `}
                    >
                        {/* CARD BACK */}
                        <div className="absolute inset-0 backface-hidden bg-obsidian rounded-xl border-2 border-gold/60 flex items-center justify-center overflow-hidden">
                             {/* Elaborate Back Pattern */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.2)_2px,transparent_2px)] bg-[size:16px_16px] opacity-30"></div>
                            <div className="w-24 h-24 border border-gold/30 rounded-full flex items-center justify-center">
                                <div className="w-16 h-16 border border-gold/30 rotate-45"></div>
                            </div>
                        </div>

                        {/* CARD FRONT (Only visible in Reveal phase due to rotateY) */}
                        <div 
                            className="absolute inset-0 backface-hidden rotate-y-180 bg-midnight rounded-xl border-2 flex flex-col items-center justify-center text-center p-4 shadow-[0_0_30px_rgba(0,0,0,1)]"
                            style={{ borderColor: card.theme_color }}
                        >
                            <div className="text-5xl mb-4 animate-bounce">{card.icon}</div>
                            <h3 className="font-mystic text-xl text-white uppercase mb-1">{card.name}</h3>
                            <div className="text-xs font-serif opacity-70 mb-4" style={{ color: card.theme_color }}>{card.name_cn}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- PHASE 3: REVEAL DETAILS --- */}
            {phase === 'reveal' && activeCard && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-midnight via-midnight to-transparent z-40 flex flex-col items-center animate-slide-up">
                    
                    {/* Fortune Text */}
                    <div className="text-center mb-6 max-w-xs">
                        <p className="font-serif italic text-parchment/90 text-sm leading-relaxed">"{activeCard.fortune_text}"</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 w-full max-w-xs mb-6 border-t border-b border-white/10 py-4">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Memory</span>
                            <div className="flex text-xs text-gold">{'★'.repeat(activeCard.stats.memory)}</div>
                        </div>
                        <div className="flex flex-col items-center border-l border-r border-white/10">
                            <span className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Focus</span>
                            <div className="flex text-xs text-red-400">{'★'.repeat(activeCard.stats.focus)}</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Insight</span>
                            <div className="flex text-xs text-blue-400">{'★'.repeat(activeCard.stats.insight)}</div>
                        </div>
                    </div>

                    {/* The Quest */}
                    <div className="w-full max-w-xs bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                             <div className="text-xs text-gold uppercase tracking-widest font-bold">{activeCard.task_title}</div>
                             <div className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded-full">{activeCard.task_count} Cards</div>
                        </div>
                        <p className="text-xs text-white/60 font-serif">{activeCard.task_desc}</p>
                    </div>

                    <button 
                        onClick={handleAcceptFate}
                        className="w-full max-w-xs py-4 bg-gold text-midnight font-bold font-mystic uppercase tracking-widest rounded shadow-[0_0_20px_rgba(197,160,89,0.4)] hover:scale-105 transition-transform"
                    >
                        Begin The Ritual
                    </button>
                </div>
            )}

            {/* --- TOUCH CONTROLS (INVISIBLE) --- */}
            {phase === 'spread' && (
                <div className="absolute inset-0 flex z-30 pointer-events-none">
                    <div 
                        className="w-1/3 h-full pointer-events-auto"
                        onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                    ></div>
                     <div className="w-1/3 h-full pointer-events-none"></div>
                    <div 
                        className="w-1/3 h-full pointer-events-auto"
                        onClick={() => setActiveIndex(Math.min(deck.length - 1, activeIndex + 1))}
                    ></div>
                </div>
            )}
        </div>
    );
};

export default TarotTable;