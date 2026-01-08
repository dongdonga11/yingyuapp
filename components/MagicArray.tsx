import React from 'react';

const MagicArray: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    return (
        <div className={`relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] flex items-center justify-center transition-all duration-1000 ${isActive ? 'scale-110 brightness-150' : 'scale-100'}`}>
            
            {/* 1. Base Glow */}
            <div className={`absolute inset-0 bg-gold/5 rounded-full blur-3xl transition-opacity duration-1000 ${isActive ? 'opacity-80' : 'opacity-20'}`}></div>

            {/* 2. Outer Rune Ring (Slow Rotate) */}
            <div className="absolute inset-0 animate-[spin_60s_linear_infinite]">
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-60">
                    <path id="curve" d="M 50 50 m -45 0 a 45 45 0 1 1 90 0 a 45 45 0 1 1 -90 0" fill="transparent" />
                    <text width="500">
                        <textPath xlinkHref="#curve" className="text-[4px] fill-gold font-serif uppercase tracking-[0.5em]">
                            • Logos • Veritas • Scientia • Memoria • Fortuna • Astra • Fatuum •
                        </textPath>
                    </text>
                    <circle cx="50" cy="50" r="48" fill="none" stroke="#C5A059" strokeWidth="0.2" strokeDasharray="1 1" />
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#C5A059" strokeWidth="0.5" />
                </svg>
            </div>

            {/* 3. Middle Hexagram (Counter Rotate) */}
            <div className={`absolute inset-[15%] animate-[spin_40s_linear_infinite_reverse] transition-all duration-1000 ${isActive ? 'duration-[2s]' : ''}`}>
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-80 drop-shadow-[0_0_5px_rgba(197,160,89,0.5)]">
                    {/* Triangle 1 */}
                    <polygon points="50,5 90,75 10,75" fill="none" stroke="#C5A059" strokeWidth="0.5" />
                    {/* Triangle 2 (Inverted) */}
                    <polygon points="50,95 90,25 10,25" fill="none" stroke="#C5A059" strokeWidth="0.5" />
                    {/* Inner Circle */}
                    <circle cx="50" cy="50" r="25" fill="none" stroke="#C5A059" strokeWidth="0.3" />
                </svg>
            </div>

            {/* 4. Core Energy (Pulse) */}
            <div className="absolute inset-[35%] flex items-center justify-center">
                <div className={`w-full h-full rounded-full border border-gold/40 flex items-center justify-center ${isActive ? 'animate-ping' : 'animate-pulse'}`}>
                    <div className="w-[60%] h-[60%] bg-gold/10 rounded-full blur-md"></div>
                </div>
            </div>

            {/* 5. Center Symbol */}
            <div className="absolute font-mystic text-gold text-4xl md:text-6xl opacity-80 tracking-widest animate-float">
                L
            </div>
        </div>
    );
};

export default MagicArray;