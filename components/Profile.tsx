import React, { useState } from 'react';
import { Grimoire, ProphecyRecord } from '../types';
import { LIBRARY_ARCHIVE } from '../data/books';

interface ProfileProps {
    currentBook: Grimoire | null;
    prophecyHistory: ProphecyRecord[]; 
    onChangeBook: () => void; 
}

// --- VISUAL HELPERS (Recreated for Mini Scale) ---

const MiniGoldCorner = ({ className }: { className: string }) => (
    <div className={`absolute w-3 h-3 border-gold/60 pointer-events-none ${className}`}>
        {/* Outer L */}
        <div className="absolute inset-0 border border-gold/80 opacity-80 rounded-[1px]"></div>
        {/* Dot */}
        <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-gold rounded-full shadow-[0_0_2px_gold]"></div>
    </div>
);

const MiniMysticSeal = ({ color }: { color: string }) => (
    <div className="relative w-8 h-8 flex items-center justify-center my-1">
         {/* Outer Circle */}
         <div className="absolute inset-0 rounded-full border border-gold/30 opacity-60"></div>
         
         {/* Hexagram (Two Triangles) */}
         <div className="absolute w-6 h-6 border border-gold/40 opacity-50 flex items-center justify-center">
             <div className="w-full h-full border border-gold/40 rotate-60 absolute"></div>
             <div className="w-full h-full border border-gold/40 -rotate-60 absolute"></div>
         </div>

         {/* Central Gemstone */}
         <div 
            className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor] relative z-10"
            style={{ backgroundColor: color, color: color }}
         ></div>
    </div>
);

// --- MINI 3D BOOK COMPONENT ---

const Mini3DBook: React.FC<{ book: Grimoire; isSelected: boolean; onClick: () => void }> = ({ book, isSelected, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className={`
                relative flex items-center transition-all duration-500 ease-out flex-shrink-0 cursor-pointer h-28
                ${isSelected ? 'w-56 bg-white/5 rounded-lg border border-gold/20 pr-4' : 'w-16'}
            `}
        >
            {/* THE 3D BOOK (Scaled Container) */}
            <div className="relative w-16 h-full flex-shrink-0 perspective-1000 z-10 group">
                 <div 
                    className={`
                        w-14 h-24 absolute top-2 left-1 transition-transform duration-500 preserve-3d
                        ${isSelected ? 'rotate-y-[-15deg] translate-x-1' : 'rotate-y-[0deg] group-hover:-translate-y-1'}
                    `}
                 >
                     {/* === COVER === */}
                     <div 
                        className="absolute inset-0 rounded-r-[2px] flex flex-col items-center py-2 px-1 text-center justify-between"
                        style={{
                            backgroundColor: '#1a1412',
                            transform: 'translateZ(2px)',
                            boxShadow: 'inset 1px 0 3px rgba(0,0,0,0.8), 2px 2px 5px rgba(0,0,0,0.5)'
                        }}
                     >
                        {/* Texture */}
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-50 mix-blend-multiply rounded-r-[2px]"></div>
                         
                         {/* Border Frame */}
                         <div className="absolute inset-[3px] border border-gold/20 rounded-[1px] pointer-events-none"></div>

                         {/* Gold Corners */}
                         <MiniGoldCorner className="top-0 left-0 border-r-0 border-b-0 rounded-tl-[1px]" />
                         <MiniGoldCorner className="top-0 right-0 border-l-0 border-b-0 rounded-tr-[1px]" />
                         <MiniGoldCorner className="bottom-0 left-0 border-r-0 border-t-0 rounded-bl-[1px]" />
                         <MiniGoldCorner className="bottom-0 right-0 border-l-0 border-t-0 rounded-br-[1px]" />

                         {/* TOP TEXT */}
                         <div className="relative z-10 text-[5px] text-gold/40 tracking-[0.2em] font-mystic mt-1">
                             GRIMOIRE
                         </div>

                         {/* SEAL */}
                         <MiniMysticSeal color={book.theme_color} />

                         {/* TITLE */}
                         <div className="relative z-10 w-full mb-1">
                             <div className="font-serif text-[7px] font-bold text-parchment leading-tight scale-90">
                                 {book.title}
                             </div>
                             <div className="text-[4px] text-gold/50 uppercase scale-75">
                                 Lv.{book.difficulty_level}
                             </div>
                         </div>
                     </div>

                     {/* Spine */}
                     <div 
                        className="absolute top-0 bottom-0 left-0 w-2 bg-[#120e0d] transform origin-left rotate-y-[-90deg] border-l border-white/5 flex flex-col items-center justify-center"
                     >
                         <div className="w-[1px] h-full bg-gold/20"></div>
                     </div>

                     {/* Pages */}
                     <div 
                        className="absolute top-[1px] bottom-[1px] right-0 w-1.5 bg-[#e3dac9] transform origin-right rotate-y-[-90deg] translate-z-[-2px]"
                        style={{ backgroundImage: "linear-gradient(to right, #dcd1b4 0.5px, transparent 0.5px)", backgroundSize: "0.5px 100%" }}
                     ></div>
                     
                     {/* Back */}
                     <div className="absolute inset-0 bg-[#1a1412] rounded-l-[2px] transform translate-z-[-2px]"></div>
                 </div>
            </div>

            {/* EXPANDED INFO PANEL (Squeezes others) */}
            <div 
                className={`
                    flex-1 flex flex-col justify-center overflow-hidden transition-all duration-500
                    ${isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}
                `}
            >
                <div className="flex flex-col h-full justify-center pl-2 border-l border-white/5 border-dashed my-2">
                    <h4 className="font-serif text-xs text-parchment font-bold whitespace-nowrap overflow-hidden text-ellipsis mb-1">
                        {book.title}
                    </h4>
                    
                    <div className="flex flex-col gap-1 mb-2">
                         <span className="text-[8px] text-white/40 uppercase tracking-wider">{book.sub_title}</span>
                         <div className="flex items-center gap-2 text-[8px] text-gold/60">
                            <span>{book.word_count} Words</span>
                         </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden border border-white/5">
                         <div className="bg-gold h-full w-[25%] shadow-[0_0_5px_currentColor]"></div>
                    </div>
                    <div className="text-[8px] text-right text-gold/80 mt-1 font-mono">25% Sealed</div>
                </div>
            </div>
        </div>
    );
}

const Profile: React.FC<ProfileProps> = ({ currentBook, prophecyHistory, onChangeBook }) => {
    
    // Default to NULL (All collapsed) as requested
    const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

    // Placeholder stats
    const totalWords = prophecyHistory.reduce((acc, curr) => acc + curr.words_sealed, 128); 
    const daysStreak = 5;

    // Simulate "My Books" list
    const myBooks = Array.from(new Set([currentBook, ...LIBRARY_ARCHIVE.slice(0, 4)].filter(Boolean))) as Grimoire[];

    const handleBookClick = (bookId: string) => {
        // Toggle Logic: If clicking the open one, close it. Else, open the new one.
        if (selectedBookId === bookId) {
            setSelectedBookId(null);
        } else {
            setSelectedBookId(bookId);
        }
    };

    return (
        <div className="w-full h-full flex flex-col p-6 animate-fade-in overflow-y-auto pb-24 custom-scrollbar">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col items-center mb-6">
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
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2 px-1">
                    <h3 className="font-mystic text-gold/60 text-xs tracking-[0.3em] uppercase">My Pacts</h3>
                    <button onClick={onChangeBook} className="text-gold hover:text-white transition-colors text-xl leading-none" aria-label="Add Book">+</button>
                </div>

                {/* SCROLL CONTAINER (Reduced Height) */}
                <div className="w-full overflow-x-auto pb-2 -mx-6 px-6 flex gap-2 no-scrollbar items-center min-h-[120px]">
                    {myBooks.map((book) => (
                        <Mini3DBook 
                            key={book.id} 
                            book={book} 
                            isSelected={selectedBookId === book.id} 
                            onClick={() => handleBookClick(book.id)} 
                        />
                    ))}
                    {/* Add Placeholder (Smaller) */}
                    <button onClick={onChangeBook} className="w-14 h-24 rounded border border-dashed border-white/10 flex items-center justify-center text-white/20 hover:text-gold hover:border-gold/30 transition-all flex-shrink-0">
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
                    <div className="grid grid-cols-3 gap-2">
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
                                <div className="text-[8px] font-sans text-white/40 uppercase tracking-tighter relative z-10 w-full text-center border-b border-white/5 pb-1">
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
                                        className="mt-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full inline-block backdrop-blur-sm border border-white/10"
                                        style={{ color: record.card.theme_color, backgroundColor: `${record.card.theme_color}10` }}
                                    >
                                        +{record.words_sealed}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {/* Fillers */}
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