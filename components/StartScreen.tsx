import React from 'react';
import { Grimoire } from '../types';

interface StartScreenProps {
    book: Grimoire;
    onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ book, onStart }) => {
    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center animate-fade-in overflow-hidden">
            
            {/* --- BACKGROUND ATMOSPHERE --- */}
            <div className="absolute inset-0 bg-midnight"></div>
            {/* Rotating Star Map / Magic Circle Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-gold/20 rounded-full animate-[spin_60s_linear_infinite]"></div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-gold/10 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
            </div>
            
            {/* --- MAIN CONTENT --- */}
            <div className="relative z-10 flex flex-col items-center text-center p-8">
                
                {/* Book Icon / Avatar */}
                <div className="mb-10 relative">
                    <div className="w-32 h-32 rounded-full border-2 border-gold/30 flex items-center justify-center bg-white/5 backdrop-blur-sm shadow-[0_0_30px_rgba(197,160,89,0.2)] animate-float">
                        <span className="text-6xl filter drop-shadow-lg">{book.icon}</span>
                    </div>
                    {/* Orbiting particles */}
                    <div className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-gold rounded-full shadow-[0_0_5px_gold]"></div>
                    </div>
                </div>

                <h1 className="font-mystic text-3xl text-gold mb-2 tracking-[0.3em] text-glow">
                    Daily Oracle
                </h1>
                <p className="font-serif text-white/40 text-xs italic mb-16 max-w-[200px] leading-relaxed">
                    "The stars align for those who seek knowledge."
                </p>

                {/* --- START BUTTON --- */}
                <button 
                    onClick={onStart}
                    className="group relative w-24 h-24 flex items-center justify-center"
                >
                    {/* Button Glow Rings */}
                    <div className="absolute inset-0 rounded-full border border-gold/50 opacity-50 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                    <div className="absolute inset-2 rounded-full border border-gold/30 opacity-80 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '0.5s' }}></div>
                    
                    {/* Main Button Body */}
                    <div className="absolute inset-4 rounded-full bg-gold/10 border border-gold/60 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(197,160,89,0.4)] group-hover:scale-110 group-hover:bg-gold/20 group-hover:shadow-[0_0_40px_rgba(197,160,89,0.6)] transition-all duration-500 cursor-pointer">
                        <div className="w-0 h-0 border-l-[12px] border-l-gold border-y-[8px] border-y-transparent ml-1"></div>
                    </div>
                </button>

                <div className="mt-6 text-[9px] uppercase tracking-[0.4em] text-gold/40 animate-pulse">
                    Begin Ritual
                </div>

            </div>
            
            {/* Bottom Mist */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-midnight to-transparent pointer-events-none"></div>
        </div>
    );
};

export default StartScreen;