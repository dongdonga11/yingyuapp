import React from 'react';
import { DailyProphecy } from '../types';

interface DailyProphecyProps {
    data: DailyProphecy;
    onClose: () => void;
}

const DailyProphecyCard: React.FC<DailyProphecyProps> = ({ data, onClose }) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 animate-fade-in relative z-50">
             {/* Dark Overlay */}
             <div className="absolute inset-0 bg-black/80 backdrop-blur-md -z-10 animate-[fade-in_0.5s]"></div>
             
             {/* THE SHEEPSKIN SCROLL */}
             <div className="w-full max-w-sm relative animate-[unroll_0.8s_cubic-bezier(0.2,0.8,0.2,1)_forwards] origin-top opacity-0" style={{ animationFillMode: 'forwards' }}>
                
                {/* Scroll Top Roll (Visual) */}
                <div className="h-4 bg-[#C2B280] rounded-t-full shadow-inner border-b border-[#A09060]"></div>

                {/* Main Parchment Body */}
                <div className="bg-[#E6DCC3] text-[#3E342A] shadow-[0_0_60px_rgba(197,160,89,0.25)] relative overflow-hidden">
                    
                    {/* Paper Texture & Grain */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>
                    <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(62,52,42,0.2)] pointer-events-none"></div>

                    {/* Decorative Border */}
                    <div className="absolute inset-3 border-2 border-double border-[#8A7854] opacity-60 pointer-events-none"></div>
                    <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#8A7854]"></div>
                    <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#8A7854]"></div>
                    <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#8A7854]"></div>
                    <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#8A7854]"></div>

                    {/* CONTENT */}
                    <div className="p-8 text-center relative flex flex-col items-center">
                        
                        {/* Header: Mystic Quest */}
                        <div className="mb-4">
                            <span className="text-[#8A2323] text-xs font-bold uppercase tracking-[0.4em] block mb-2">Quest Log</span>
                            <div className="w-full h-[1px] bg-[#8A2323]/30 mx-auto"></div>
                        </div>

                        {/* Intro Text */}
                        <p className="font-serif italic text-[#5C5042] text-sm leading-relaxed mb-6">
                            "{data.intro_text}"
                        </p>

                        {/* Main Icon (Ink Style) */}
                        <div className="mb-6 relative">
                            <div className="text-6xl filter sepia-[0.5] drop-shadow-sm opacity-90 animate-float">{data.arcana.icon}</div>
                            {/* Ink splatter effect (CSS radial) */}
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-black/5 rounded-full blur-xl -z-10"></div>
                        </div>

                        {/* MISSION BOX */}
                        <div className="w-full bg-[#DCD1B4]/50 border border-[#B0A078] p-4 mb-4 relative group">
                            <div className="absolute -left-1 -top-1 text-[#8A2323] text-xl">❝</div>
                            
                            <h2 className="font-mystic text-xl text-[#2C241B] font-bold mb-2 uppercase tracking-wide">
                                {data.mission_title}
                            </h2>
                            <p className="font-serif text-sm text-[#4A4036]">
                                {data.mission_desc}
                            </p>
                            
                            <div className="absolute -right-1 -bottom-1 text-[#8A2323] text-xl rotate-180">❝</div>
                        </div>

                        {/* REWARD BOX */}
                        <div className="w-full flex items-center justify-center gap-3 py-3 border-t border-b border-[#8A7854]/20 mb-6">
                            <span className="text-2xl">🎁</span>
                            <span className="font-bold text-[#8A2323] text-sm tracking-wider">
                                {data.reward_text}
                            </span>
                        </div>

                        {/* Flavor Text Footer */}
                        <p className="font-serif text-[10px] text-[#8A7854] opacity-80 leading-relaxed max-w-[80%] mx-auto">
                            {data.prophecy_text}
                        </p>

                    </div>
                </div>

                {/* Scroll Bottom Roll */}
                <div className="h-5 bg-[#C2B280] rounded-b-full shadow-lg border-t border-[#A09060] relative flex items-center justify-center">
                     {/* Wax Seal */}
                     <div className="absolute -top-3 w-12 h-12 bg-[#8A2323] rounded-full shadow-md flex items-center justify-center border-4 border-[#6D1B1B] text-[#D8A6A6] text-xs font-mystic">
                        Logos
                     </div>
                </div>

                {/* Action Button (Hanging below scroll) */}
                <div className="absolute -bottom-20 left-0 right-0 flex justify-center">
                    <button 
                        onClick={onClose}
                        className="group relative px-8 py-3 bg-[#2C241B] text-[#E6DCC3] font-mystic text-lg uppercase tracking-[0.2em] shadow-xl hover:bg-[#4A4036] hover:scale-105 transition-all"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                             Begin Journey <span className="text-xs group-hover:translate-x-1 transition-transform">➔</span>
                        </span>
                        {/* Button Borders */}
                        <div className="absolute inset-1 border border-[#E6DCC3]/30"></div>
                    </button>
                </div>
             </div>
        </div>
    );
};

export default DailyProphecyCard;