import React, { useState } from 'react';
import { Grimoire, ProphecyRecord } from '../types';
import { LIBRARY_ARCHIVE } from '../data/books';

interface ProfileProps {
    currentBook: Grimoire | null;
    prophecyHistory: ProphecyRecord[]; // Historical records of completed sessions
    onChangeBook: () => void; // Navigates to Library Tab
}

const Profile: React.FC<ProfileProps> = ({ currentBook, prophecyHistory, onChangeBook }) => {
    
    // Default to showing the current book as active/expanded
    const [expandedBookId, setExpandedBookId] = useState<string | null>(currentBook?.id || null);

    // Placeholder user stats
    const totalWords = prophecyHistory.reduce((acc, curr) => acc + curr.words_sealed, 128); // 128 is base
    const daysStreak = 5;

    // Simulate "My Books" - In a real app, this would be user's saved books.
    // We'll take the first 3 from archive + the current one to simulate a collection.
    const myBooks = Array.from(new Set([currentBook, ...LIBRARY_ARCHIVE.slice(0, 3)].filter(Boolean))) as Grimoire[];

    const handleBookClick = (bookId: string) => {
        if (expandedBookId === bookId) {
            // Optional: Toggle off? keeping one always open looks better for "Pact" concept
            // setExpandedBookId(null); 
        } else {
            setExpandedBookId(bookId);
        }
    };

    return (
        <div className="w-full h-full flex flex-col p-6 animate-fade-in overflow-y-auto pb-24 custom-scrollbar">
            
            {/* --- HEADER: THE SEEKER --- */}
            <div className="flex flex-col items-center mb-10">
                <div className="w-20 h-20 rounded-full border-2 border-gold/50 p-1 mb-3 relative group cursor-pointer">
                    <div className="w-full h-full rounded-full bg-cover bg-center grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500" style={{ backgroundImage: 'url(https://api.dicebear.com/7.x/micah/svg?seed=LogosMage&backgroundColor=transparent)' }}></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-gold text-midnight rounded-full flex items-center justify-center text-xs font-bold border border-midnight shadow-lg">
                        Lv.4
                    </div>
                </div>
                <h2 className="font-mystic text-xl text-gold tracking-widest text-glow">Seeker</h2>
                <div className="flex gap-6 mt-4 text-xs font-serif text-parchment/60">
                    <div className="flex flex-col items-center">
                        <span className="text-white text-lg font-mystic">{daysStreak}</span>
                        <span className="uppercase tracking-wider text-[9px]">Days Streak</span>
                    </div>
                    <div className="w-[1px] bg-white/10 h-8"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-white text-lg font-mystic">{totalWords}</span>
                        <span className="uppercase tracking-wider text-[9px]">Words Sealed</span>
                    </div>
                </div>
            </div>

            {/* --- SECTION 1: MY GRIMOIRES --- */}
            <div className="mb-12">
                <div className="flex justify-between items-end mb-4 border-b border-white/5 pb-2">
                    <h3 className="font-mystic text-gold/60 text-xs tracking-[0.3em] uppercase">My Pacts</h3>
                    <button 
                        onClick={onChangeBook}
                        className="text-gold/50 hover:text-gold transition-colors text-xl leading-none px-2"
                        aria-label="Add Book"
                    >
                        +
                    </button>
                </div>
                
                <div className="flex flex-col gap-3">
                    {myBooks.map((book) => {
                        const isExpanded = expandedBookId === book.id;
                        
                        return (
                            <div 
                                key={book.id}
                                onClick={() => handleBookClick(book.id)}
                                className={`
                                    relative rounded-lg border transition-all duration-500 overflow-hidden cursor-pointer
                                    ${isExpanded 
                                        ? 'bg-[#1a1412] border-gold/40 shadow-[0_0_20px_rgba(197,160,89,0.15)]' 
                                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                                    }
                                `}
                            >
                                {/* Background Textures */}
                                {isExpanded && (
                                    <>
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20 mix-blend-multiply"></div>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full pointer-events-none"></div>
                                    </>
                                )}

                                <div className="p-4 relative z-10">
                                    <div className="flex items-center gap-4">
                                        {/* Icon Box */}
                                        <div 
                                            className={`
                                                w-12 h-16 rounded flex items-center justify-center text-2xl border transition-all duration-500
                                                ${isExpanded 
                                                    ? 'bg-black border-gold/50 scale-110 shadow-lg' 
                                                    : 'bg-black/40 border-white/10 grayscale'
                                                }
                                            `}
                                            style={{ color: isExpanded ? book.theme_color : undefined }}
                                        >
                                            {book.icon}
                                        </div>

                                        {/* Title Area */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className={`font-serif font-bold transition-colors ${isExpanded ? 'text-parchment text-lg' : 'text-white/60'}`}>
                                                    {book.title}
                                                </h4>
                                                {/* Active Badge */}
                                                {book.id === currentBook?.id && (
                                                    <span className="text-[9px] bg-gold/20 text-gold px-2 py-0.5 rounded border border-gold/20">
                                                        ACTIVE
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {/* Subtitle (Only active or squeezed?) */}
                                            <p className={`text-[10px] uppercase tracking-wider transition-colors ${isExpanded ? 'text-gold/60' : 'text-white/30'}`}>
                                                {book.sub_title}
                                            </p>
                                        </div>
                                    </div>

                                    {/* EXPANDED INFO BOX (The "Side" content appearing below for mobile) */}
                                    <div 
                                        className={`
                                            grid transition-all duration-500 ease-in-out
                                            ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4 pt-4 border-t border-white/5' : 'grid-rows-[0fr] opacity-0 h-0 overflow-hidden'}
                                        `}
                                    >
                                        <div className="overflow-hidden">
                                            <div className="flex justify-between text-[10px] text-gold/80 mb-1">
                                                <span>Mastery</span>
                                                <span>25%</span>
                                            </div>
                                            <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden mb-4 border border-white/5">
                                                <div className="bg-gold h-full w-[25%] shadow-[0_0_10px_currentColor]"></div>
                                            </div>

                                            <p className="text-xs text-white/50 italic font-serif leading-relaxed mb-4">
                                                "{book.description}"
                                            </p>

                                            {book.id !== currentBook?.id && (
                                                <button className="w-full py-2 border border-gold/30 text-gold text-xs uppercase tracking-widest hover:bg-gold hover:text-midnight transition-colors">
                                                    Seal Pact (Switch)
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- SECTION 2: FATE COLLECTION (Prophecy History) --- */}
            <div>
                <h3 className="font-mystic text-gold/60 text-xs tracking-[0.3em] uppercase mb-6 border-b border-white/5 pb-2">Fate Collection</h3>
                
                <div className="flex flex-col gap-4">
                    {/* Placeholder Logic if empty */}
                    {prophecyHistory.length === 0 && (
                        <div className="text-center py-8 text-white/20 text-xs italic border border-dashed border-white/10 rounded">
                            The threads of fate have yet to be woven.
                        </div>
                    )}

                    {prophecyHistory.map((record) => (
                        <div 
                            key={record.id}
                            className="bg-midnight border border-white/10 rounded-lg p-4 flex gap-4 relative overflow-hidden group hover:border-gold/30 transition-colors"
                        >
                            {/* Left: Card Visual */}
                            <div className="flex-none w-16 h-24 rounded border border-white/10 bg-[#0F111A] flex flex-col items-center justify-center relative shadow-inner z-10 group-hover:scale-105 transition-transform duration-500">
                                <div className="text-2xl mb-1">{record.card.icon}</div>
                                <div className="text-[8px] font-mystic text-center leading-none opacity-60" style={{ color: record.card.theme_color }}>
                                    {record.card.name_cn}
                                </div>
                                {/* Card Frame */}
                                <div className="absolute inset-1 border border-white/5 rounded-sm"></div>
                            </div>

                            {/* Right: Info */}
                            <div className="flex-1 z-10 flex flex-col justify-center">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[9px] text-white/30 uppercase tracking-widest">{record.date}</span>
                                    <div className="flex items-center gap-1 text-[9px] text-gold/80 border border-gold/20 px-2 py-0.5 rounded-full bg-gold/5">
                                        <span>+ {record.words_sealed}</span>
                                        <span>Words</span>
                                    </div>
                                </div>

                                <p className="font-serif text-sm text-parchment/90 italic leading-snug border-l-2 border-gold/20 pl-3">
                                    "{record.prophecy_text}"
                                </p>
                            </div>

                            {/* Decorative Background Fade */}
                            <div 
                                className="absolute right-0 top-0 bottom-0 w-2/3 bg-gradient-to-l from-current to-transparent opacity-[0.03] pointer-events-none"
                                style={{ color: record.card.theme_color }}
                            ></div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default Profile;