import React, { useState } from 'react';
import { Grimoire, ProphecyRecord } from '../types';
import { LIBRARY_ARCHIVE } from '../data/books';

interface ProfileProps {
    currentBook: Grimoire | null;
    prophecyHistory: ProphecyRecord[]; 
    onChangeBook: () => void; 
}

// --- HELPER: MINI 3D BOOK COMPONENT ---
// This is a scaled-down version of the book in Bookshelf.tsx
const Mini3DBook: React.FC<{ book: Grimoire; isSelected: boolean; onClick: () => void }> = ({ book, isSelected, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className={`
                relative flex items-center transition-all duration-500 ease-out flex-shrink-0 cursor-pointer h-32
                ${isSelected ? 'w-64 bg-white/5 rounded-lg border border-gold/20 pr-4' : 'w-20'}
            `}
        >
            {/* THE 3D BOOK (Scaled Container) */}
            <div className="relative w-20 h-full flex-shrink-0 perspective-1000 z-10 group">
                 <div 
                    className={`
                        w-16 h-24 absolute top-4 left-2 transition-transform duration-500 preserve-3d
                        ${isSelected ? 'rotate-y-[-15deg] translate-x-1' : 'rotate-y-[0deg] group-hover:-translate-y-2'}
                    `}
                 >
                     {/* Cover */}
                     <div 
                        className="absolute inset-0 rounded-r-sm flex flex-col items-center p-2 text-center justify-between"
                        style={{
                            backgroundColor: '#1a1412',
                            transform: 'translateZ(4px)',
                            boxShadow: 'inset 2px 0 5px rgba(0,0,0,0.8), 5px 5px 10px rgba(0,0,0,0.5)'
                        }}
                     >
                        {/* Texture */}
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-50 mix-blend-multiply rounded-r-sm"></div>
                         
                         {/* Border */}
                         <div className="absolute inset-1 border border-gold/30 rounded-sm pointer-events-none"></div>

                         {/* Icon */}
                         <div className="relative z-10 text-xl" style={{ color: book.theme_color }}>
                             {book.icon}
                         </div>

                         {/* Seal */}
                         <div className="w-8 h-8 rounded-full border border-gold/20 flex items-center justify-center relative z-10">
                             <div className="w-4 h-4 rounded-full opacity-50" style={{ backgroundColor: book.theme_color }}></div>
                         </div>
                     </div>

                     {/* Spine */}
                     <div 
                        className="absolute top-0 bottom-0 left-0 w-3 bg-[#120e0d] transform origin-left rotate-y-[-90deg] border-l border-white/5 flex flex-col items-center justify-center"
                     >
                         <div className="w-[1px] h-full bg-gold/30"></div>
                     </div>

                     {/* Pages */}
                     <div 
                        className="absolute top-0.5 bottom-0.5 right-0 w-2.5 bg-[#e3dac9] transform origin-right rotate-y-[-90deg] translate-z-[-4px]"
                        style={{ backgroundImage: "linear-gradient(to right, #dcd1b4 1px, transparent 1px)", backgroundSize: "1px 100%" }}
                     ></div>
                     
                     {/* Back */}
                     <div className="absolute inset-0 bg-[#1a1412] rounded-l-sm transform translate-z-[-4px]"></div>
                 </div>
            </div>

            {/* EXPANDED MEMORY INFO (The "Horizontal Expansion") */}
            <div 
                className={`
                    flex-1 flex flex-col justify-center overflow-hidden transition-all duration-500
                    ${isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}
                `}
            >
                <h4 className="font-serif text-sm text-parchment font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                    {book.title}
                </h4>
                <div className="flex items-center gap-2 text-[9px] text-gold/60 uppercase tracking-wider mb-2">
                    <span>Lv.{book.difficulty_level}</span>
                    <span>{book.word_count} Words</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/5">
                     <div className="bg-gold h-full w-[25%] shadow-[0_0_5px_currentColor]"></div>
                </div>
                <div className="text-[9px] text-right text-gold/80 mt-1">25% Sealed</div>
            </div>
        </div>
    );
}

const Profile: React.FC<ProfileProps> = ({ currentBook, prophecyHistory, onChangeBook }) => {
    
    // Default to current book, or null
    const [selectedBookId, setSelectedBookId] = useState<string | null>(currentBook?.id || null);

    // Placeholder stats
    const totalWords = prophecyHistory.reduce((acc, curr) => acc + curr.words_sealed, 128); 
    const daysStreak = 5;

    // Simulate "My Books" list
    const myBooks = Array.from(new Set([currentBook, ...LIBRARY_ARCHIVE.slice(0, 4)].filter(Boolean))) as Grimoire[];

    const handleBookClick = (bookId: string) => {
        if (selectedBookId === bookId) {
            // Optional: Toggle off? keeping it selected feels better for context
            // setSelectedBookId(null);
        } else {
            setSelectedBookId(bookId);
        }
    };

    return (
        <div className="w-full h-full flex flex-col p-6 animate-fade-in overflow-y-auto pb-24 custom-scrollbar">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 rounded-full border-2 border-gold/50 p-1 mb-2 relative group cursor-pointer">
                    <div className="w-full h-full rounded-full bg-cover bg-center grayscale contrast-125" style={{ backgroundImage: 'url(https://api.dicebear.com/7.x/micah/svg?seed=LogosMage&backgroundColor=transparent)' }}></div>
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-gold text-midnight rounded-full flex items-center justify-center text-[10px] font-bold border border-midnight shadow-lg">
                        4
                    </div>
                </div>
                <h2 className="font-mystic text-lg text-gold tracking-widest text-glow">Seeker</h2>
                <div className="flex gap-4 mt-2 text-xs font-serif text-parchment/60">
                     <span>{daysStreak} Days Streak</span>
                     <span className="text-gold/30">•</span>
                     <span>{totalWords} Words Sealed</span>
                </div>
            </div>

            {/* --- SECTION 1: MY PACTS (Horizontal Scroll) --- */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-2 px-1">
                    <h3 className="font-mystic text-gold/60 text-xs tracking-[0.3em] uppercase">My Pacts</h3>
                    <button onClick={onChangeBook} className="text-gold hover:text-white transition-colors text-xl leading-none" aria-label="Add Book">+</button>
                </div>

                {/* SCROLL CONTAINER */}
                <div className="w-full overflow-x-auto pb-4 -mx-6 px-6 flex gap-4 no-scrollbar items-center min-h-[140px]">
                    {myBooks.map((book) => (
                        <Mini3DBook 
                            key={book.id} 
                            book={book} 
                            isSelected={selectedBookId === book.id} 
                            onClick={() => handleBookClick(book.id)} 
                        />
                    ))}
                    {/* Add Placeholder (Visual cue to scroll/add) */}
                    <button onClick={onChangeBook} className="w-16 h-24 rounded border border-dashed border-white/10 flex items-center justify-center text-white/20 hover:text-gold hover:border-gold/30 transition-all flex-shrink-0">
                        +
                    </button>
                </div>
            </div>

            {/* --- SECTION 2: FATE COLLECTION (3-Column Grid) --- */}
            <div className="flex-1">
                <h3 className="font-mystic text-gold/60 text-xs tracking-[0.3em] uppercase mb-4 px-1 border-b border-white/5 pb-2">Fate Collection</h3>
                
                {prophecyHistory.length === 0 ? (
                    <div className="text-center py-8 text-white/20 text-xs italic border border-dashed border-white/10 rounded">
                        No prophecies revealed yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-3">
                        {prophecyHistory.map((record) => (
                            <div 
                                key={record.id}
                                className="aspect-[3/4] rounded-lg border bg-midnight relative overflow-hidden flex flex-col items-center justify-between p-2 cursor-pointer group hover:scale-105 transition-transform duration-300"
                                style={{ 
                                    borderColor: `${record.card.theme_color}40`,
                                    boxShadow: `0 0 10px ${record.card.theme_color}10`
                                }}
                            >
                                {/* Background Tint */}
                                <div className="absolute inset-0 opacity-10" style={{ backgroundColor: record.card.theme_color }}></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>

                                {/* Top: Date */}
                                <div className="text-[9px] font-sans text-white/40 uppercase tracking-tighter relative z-10 w-full text-center border-b border-white/5 pb-1">
                                    {record.date.split(',')[0]} {/* Simple Date */}
                                </div>

                                {/* Center: Icon */}
                                <div className="text-3xl relative z-10 filter drop-shadow-lg group-hover:-translate-y-1 transition-transform">
                                    {record.card.icon}
                                </div>

                                {/* Bottom: Info */}
                                <div className="relative z-10 w-full text-center">
                                    <div className="font-mystic text-[8px] text-gold/80 truncate px-1">
                                        {record.card.name}
                                    </div>
                                    <div 
                                        className="mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-block backdrop-blur-sm border border-white/10"
                                        style={{ color: record.card.theme_color, backgroundColor: `${record.card.theme_color}10` }}
                                    >
                                        +{record.words_sealed}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {/* Fillers to keep grid look if needed, or leave empty */}
                        {Array.from({ length: Math.max(0, 6 - prophecyHistory.length) }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-[3/4] rounded-lg border border-white/5 bg-white/5 flex items-center justify-center opacity-30">
                                <span className="text-xl text-white/10">?</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default Profile;