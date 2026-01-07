import React from 'react';
import { Grimoire, TarotArcana } from '../types';

interface ProfileProps {
    currentBook: Grimoire | null;
    collectedCards: TarotArcana[]; // Cards found in word sessions
    onChangeBook: () => void;
}

const Profile: React.FC<ProfileProps> = ({ currentBook, collectedCards, onChangeBook }) => {
    
    // Placeholder stats
    const totalWords = 128;
    const daysStreak = 5;

    return (
        <div className="w-full h-full flex flex-col p-6 animate-fade-in overflow-y-auto pb-32 custom-scrollbar">
            
            {/* HEADER */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 rounded-full border-2 border-gold/50 p-1 mb-3 relative">
                    <div className="w-full h-full rounded-full bg-cover bg-center grayscale contrast-125" style={{ backgroundImage: 'url(https://api.dicebear.com/7.x/micah/svg?seed=LogosMage&backgroundColor=transparent)' }}></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-gold text-midnight rounded-full flex items-center justify-center text-xs font-bold border border-midnight">
                        Lv.4
                    </div>
                </div>
                <h2 className="font-mystic text-xl text-gold tracking-widest">Seeker</h2>
                <div className="flex gap-4 mt-4 text-xs font-serif text-parchment/60">
                    <div className="flex flex-col items-center">
                        <span className="text-white text-lg">{daysStreak}</span>
                        <span>Day Streak</span>
                    </div>
                    <div className="w-[1px] bg-white/10"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-white text-lg">{totalWords}</span>
                        <span>Words Sealed</span>
                    </div>
                </div>
            </div>

            {/* SECTION: THE PACT (Current Book) */}
            <div className="mb-10">
                <h3 className="font-mystic text-gold/60 text-xs tracking-[0.3em] uppercase mb-4 border-b border-white/5 pb-2">Current Pact</h3>
                
                {currentBook ? (
                    <div className="relative w-full h-32 bg-gradient-to-r from-[#1a1412] to-[#0F111A] rounded-lg border border-white/10 flex items-center p-4 overflow-hidden group">
                        {/* Book Icon */}
                        <div 
                            className="w-16 h-20 rounded bg-black border flex items-center justify-center text-3xl shadow-lg relative z-10 group-hover:scale-105 transition-transform"
                            style={{ borderColor: currentBook.theme_color, color: currentBook.theme_color }}
                        >
                            {currentBook.icon}
                        </div>

                        {/* Info */}
                        <div className="ml-4 flex-1 z-10">
                            <h4 className="font-serif text-lg text-white font-bold">{currentBook.title}</h4>
                            <p className="text-[10px] text-white/50 uppercase tracking-wider mb-2">{currentBook.sub_title}</p>
                            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                <div className="bg-gold h-full w-[25%]"></div>
                            </div>
                            <div className="flex justify-between text-[9px] text-gold/80 mt-1">
                                <span>Progress</span>
                                <span>25%</span>
                            </div>
                        </div>

                        {/* Change Button */}
                        <button 
                            onClick={onChangeBook}
                            className="absolute top-2 right-2 p-2 text-white/20 hover:text-white transition-colors z-20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-8 border border-dashed border-white/10 rounded-lg text-white/30 text-xs">
                        No Pact Sealed
                    </div>
                )}
            </div>

            {/* SECTION: ARTIFACTS (Collected Cards) */}
            <div className="mb-8">
                <h3 className="font-mystic text-gold/60 text-xs tracking-[0.3em] uppercase mb-4 border-b border-white/5 pb-2">Artifacts</h3>
                
                <div className="grid grid-cols-3 gap-3">
                    {/* Placeholder Grid */}
                    {Array.from({ length: 9 }).map((_, i) => {
                        const collected = collectedCards[i];
                        return (
                            <div 
                                key={i}
                                className={`
                                    aspect-[2/3] rounded border flex items-center justify-center relative overflow-hidden transition-all
                                    ${collected 
                                        ? 'bg-midnight border-gold/50 shadow-[0_0_10px_rgba(197,160,89,0.1)]' 
                                        : 'bg-white/5 border-white/5 opacity-50'
                                    }
                                `}
                            >
                                {collected ? (
                                    <>
                                        <div className="text-2xl">{collected.icon}</div>
                                        <div className="absolute bottom-1 text-[8px] text-gold/80 font-mystic">{collected.name_cn}</div>
                                    </>
                                ) : (
                                    <div className="text-white/10 text-xl">?</div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

        </div>
    );
};

export default Profile;