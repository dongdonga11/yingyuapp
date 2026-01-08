import React from 'react';

interface MagicArrayProps {
    isActive: boolean;
    children?: React.ReactNode; // The Card goes here
}

const MagicArray: React.FC<MagicArrayProps> = ({ isActive, children }) => {
    return (
        <div className={`relative w-[340px] h-[340px] md:w-[600px] md:h-[600px] flex items-center justify-center transition-all duration-1000`}>
            
            {/* 1. Base Glow (Intensifies when active) */}
            <div className={`absolute inset-0 bg-gold/5 rounded-full blur-3xl transition-all duration-1000 ${isActive ? 'opacity-100 scale-125' : 'opacity-20 scale-100'}`}></div>

            {/* 2. Outer Rune Ring */}
            {/* Speed up rotation when active */}
            <div className={`absolute inset-0 transition-[animation-duration] duration-1000 ${isActive ? 'animate-[spin_5s_linear_infinite]' : 'animate-[spin_60s_linear_infinite]'}`}>
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
            <div className={`absolute inset-[15%] transition-[animation-duration] duration-1000 ${isActive ? 'animate-[spin_3s_linear_infinite_reverse]' : 'animate-[spin_40s_linear_infinite_reverse]'}`}>
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-80 drop-shadow-[0_0_5px_rgba(197,160,89,0.5)]">
                    <polygon points="50,5 90,75 10,75" fill="none" stroke="#C5A059" strokeWidth="0.5" />
                    <polygon points="50,95 90,25 10,25" fill="none" stroke="#C5A059" strokeWidth="0.5" />
                    <circle cx="50" cy="50" r="25" fill="none" stroke="#C5A059" strokeWidth="0.3" />
                </svg>
            </div>

            {/* 4. The Center Slot / Card Container */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
                {/* Visual Slot Marker (Only visible when empty) */}
                {!children && (
                    <div className="w-32 h-48 border border-gold/10 bg-white/5 rounded-lg flex items-center justify-center animate-pulse backdrop-blur-sm">
                        <span className="font-mystic text-gold/20 text-4xl">L</span>
                    </div>
                )}
                
                {/* The Inserted Card */}
                {children}
            </div>
        </div>
    );
};

export default MagicArray;