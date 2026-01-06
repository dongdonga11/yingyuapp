import React from 'react';
import { DailyProphecy } from '../types';

interface DailyProphecyProps {
    data: DailyProphecy;
    onClose: () => void;
}

const DailyProphecyCard: React.FC<DailyProphecyProps> = ({ data, onClose }) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 animate-fade-in relative">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-md -z-10"></div>
             
             {/* THE ART CARD */}
             <div className="w-full max-w-sm bg-[#E3DAC9] text-midnight rounded-sm overflow-hidden shadow-[0_0_60px_rgba(197,160,89,0.25)] relative border-[6px] border-double border-gold/40">
                
                {/* Header Image Area (Placeholder for Arcana Art) */}
                <div 
                    className="h-48 w-full bg-midnight relative flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: data.arcana.theme_color + '20' }}
                >
                    <div className="text-8xl opacity-80 animate-float">{data.arcana.icon}</div>
                    <div className="absolute bottom-2 left-2 text-white/40 text-[10px] uppercase tracking-widest font-mystic">{data.arcana.name}</div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle,transparent,rgba(0,0,0,0.5))]"></div>
                </div>

                {/* Content Body */}
                <div className="p-6 text-center relative">
                    {/* Paper Texture */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-40 pointer-events-none mix-blend-multiply"></div>

                    {/* Fortune Status */}
                    <div className="flex justify-center items-center gap-3 mb-6">
                        <div className="h-[1px] w-8 bg-midnight/30"></div>
                        <div className="font-mystic text-xl text-alchemist tracking-widest">FORTUNATE</div>
                        <div className="h-[1px] w-8 bg-midnight/30"></div>
                    </div>

                    {/* Lucky Word */}
                    <div className="mb-8 p-4 border border-midnight/10 bg-white/40 rounded shadow-sm">
                        <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Word of the Day</div>
                        <h2 className="font-mystic text-3xl text-midnight mb-1">{data.lucky_word}</h2>
                        <div className="font-serif italic text-gray-600 text-sm">{data.lucky_meaning}</div>
                    </div>

                    {/* Dos & Donts Grid */}
                    <div className="flex w-full text-left text-sm font-serif mb-6">
                        <div className="flex-1 border-r border-midnight/10 pr-4">
                            <span className="text-alchemist font-bold block mb-1">宜 (Do)</span>
                            {data.dos.map(d => <div key={d} className="text-gray-700">{d}</div>)}
                        </div>
                        <div className="flex-1 pl-4">
                            <span className="text-gray-500 font-bold block mb-1">忌 (Don't)</span>
                             {data.donts.map(d => <div key={d} className="text-gray-400">{d}</div>)}
                        </div>
                    </div>

                    {/* Footer Insight */}
                    <div className="relative pt-4 border-t border-midnight/10">
                        <p className="font-serif italic text-midnight/80 text-xs leading-relaxed">
                            "{data.prophecy_text}"
                        </p>
                    </div>

                    {/* Watermark */}
                    <div className="mt-8 text-[8px] uppercase tracking-[0.5em] text-gray-400">
                        LOGOS • TRUTH
                    </div>
                </div>
             </div>

             <button 
                onClick={onClose}
                className="mt-8 px-6 py-2 border border-white/20 rounded-full text-white/50 hover:bg-white/10 hover:text-white uppercase tracking-widest text-xs transition-all"
            >
                Close the Circle
            </button>
        </div>
    );
};

export default DailyProphecyCard;