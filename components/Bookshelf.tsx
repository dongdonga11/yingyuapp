import React, { useState } from 'react';
import { LIBRARY_ARCHIVE } from '../data/books';
import { Grimoire } from '../types';

interface BookshelfProps {
    onBookSelected: (book: Grimoire) => void;
}

interface BookSpineProps {
    book: Grimoire;
    onClick: (book: Grimoire) => void;
}

const BookSpine: React.FC<BookSpineProps> = ({ book, onClick }) => {
    // Generate a deterministic but varied height for realism
    const heightVar = (book.word_count % 30) + 180; // 180px - 210px
    
    return (
        <div 
            onClick={() => onClick(book)}
            className="relative group cursor-pointer transition-transform duration-300 hover:-translate-y-4 hover:z-10 mx-[2px]"
            style={{ height: `${heightVar}px`, width: '40px' }}
        >
            {/* The Spine Object */}
            <div 
                className="absolute inset-0 rounded-sm border-l border-white/5 flex flex-col items-center justify-between py-4 overflow-hidden shadow-lg"
                style={{ 
                    backgroundColor: '#1a1412', // Dark leather base
                    boxShadow: 'inset 4px 0 10px rgba(0,0,0,0.8), inset -2px 0 5px rgba(255,255,255,0.05), 5px 0 10px rgba(0,0,0,0.5)'
                }}
            >
                {/* Spine Tint (Theme Color) - Subtle */}
                <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundColor: book.theme_color }}></div>
                
                {/* Leather Texture */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-30 mix-blend-multiply"></div>

                {/* Ribs (The bumps on a spine) */}
                <div className="absolute top-10 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/30 to-transparent shadow-sm"></div>
                <div className="absolute bottom-10 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/30 to-transparent shadow-sm"></div>

                {/* Top Icon */}
                <div className="relative z-10 text-[10px] grayscale opacity-50">{book.icon}</div>

                {/* Vertical Text (Hot Stamped Gold) */}
                <div className="flex-1 flex items-center justify-center py-2 writing-vertical-rl">
                     <span 
                        className="font-mystic text-sm tracking-[0.2em] uppercase truncate max-h-full rotate-180 transform"
                        style={{
                            background: 'linear-gradient(to bottom, #FCD34D 0%, #B45309 50%, #78350F 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.8))'
                        } as React.CSSProperties}
                     >
                         {book.title}
                     </span>
                </div>

                {/* Level Number */}
                <div className="relative z-10 font-serif text-[8px] text-gold/40">
                    {book.difficulty_level}
                </div>
            </div>
        </div>
    );
};

const Bookshelf: React.FC<BookshelfProps> = ({ onBookSelected }) => {
    const [selectedBook, setSelectedBook] = useState<Grimoire | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isBinding, setIsBinding] = useState(false);

    // Group books for the shelves (chunks of 4)
    const shelves: Grimoire[][] = [];
    for (let i = 0; i < LIBRARY_ARCHIVE.length; i += 4) {
        shelves.push(LIBRARY_ARCHIVE.slice(i, i + 4));
    }

    const handleSpineClick = (book: Grimoire) => {
        setIsAnimating(true);
        setSelectedBook(book);
        // Quick entrance animation flag
        setTimeout(() => setIsAnimating(false), 800);
    };

    const handleClose = () => {
        // No exit animation needed for now, just close
        setSelectedBook(null);
    };

    const handleBind = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!selectedBook) return;
        setIsBinding(true);
        setTimeout(() => {
            onBookSelected(selectedBook);
        }, 1500);
    };

    return (
        <div className="w-full h-full flex flex-col relative overflow-hidden bg-[#050302]">
            
            {/* Ambient Room Lighting */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_rgba(30,20,10,0.4)_0%,_#050302_80%)] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>

            {/* Header */}
            <div className="relative z-10 pt-8 pb-4 text-center">
                <h1 className="font-mystic text-gold/80 text-xl tracking-[0.4em] text-glow mb-1 opacity-60">THE ARCHIVE</h1>
            </div>

            {/* --- SHELVES CONTAINER --- */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-20 relative z-10">
                <div className="max-w-md mx-auto space-y-16 mt-8">
                    {shelves.map((shelfBooks, i) => (
                        <div key={i} className="relative group">
                            {/* The Books */}
                            <div className="flex items-end justify-center px-4 relative z-10 perspective-1000">
                                {shelfBooks.map(book => (
                                    <BookSpine key={book.id} book={book} onClick={handleSpineClick} />
                                ))}
                            </div>

                            {/* The Shelf Plank */}
                            <div className="absolute bottom-0 left-0 right-0 h-4 bg-[#2a1d18] shadow-[0_10px_20px_rgba(0,0,0,0.8)] transform translate-y-full rounded-sm">
                                {/* Wood grain top */}
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-50 mix-blend-multiply"></div>
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/10"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- INSPECTION MODAL (Semi-Transparent) --- */}
            {selectedBook && (
                <div 
                    className="absolute inset-0 z-50 flex items-center justify-center animate-fade-in"
                >
                    {/* 1. Translucent Backdrop (Click to close) */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-500"
                        onClick={handleClose}
                    ></div>

                    {/* 2. The Floating Book (No click to close) */}
                    <div 
                        className="relative perspective-1000 z-10 pointer-events-none" // pointer-events-none on container, auto on children
                    >
                        {/* The Flying Book Container */}
                        <div 
                            className={`
                                relative w-64 h-96 transition-all duration-700 ease-out preserve-3d pointer-events-auto
                                ${isBinding ? 'animate-[shake_0.5s_ease-in-out_infinite] scale-110' : ''}
                            `}
                            style={{
                                // Initial state: Rotate from spine view (-90) to front (0)
                                // We simulate the "Pull" effect
                                transform: isAnimating ? 'rotateY(-80deg) translateX(-50px)' : 'rotateY(-10deg)',
                            }}
                        >
                            {/* === FRONT COVER === */}
                            <div 
                                className="absolute inset-0 rounded-r-md flex flex-col items-center p-6 text-center justify-between backface-hidden"
                                style={{
                                    backgroundColor: '#1a1412',
                                    transform: 'translateZ(15px)',
                                    boxShadow: 'inset 5px 0 15px rgba(0,0,0,0.8), 20px 20px 50px rgba(0,0,0,0.8)'
                                }}
                            >
                                {/* Texture & Border */}
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-60 mix-blend-multiply rounded-r-md"></div>
                                <div className="absolute inset-3 border border-gold/40 rounded-sm pointer-events-none"></div>
                                
                                {/* Corner Decorations */}
                                <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-gold/60"></div>
                                <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-gold/60"></div>
                                <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-gold/60"></div>
                                <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-gold/60"></div>

                                {/* Content */}
                                <div className="relative z-10 flex flex-col h-full items-center justify-between py-4">
                                    <div className="text-gold/60 text-[10px] tracking-[0.3em] font-mystic">GRIMOIRE</div>
                                    
                                    {/* Center Art */}
                                    <div className="w-24 h-24 rounded-full border border-gold/20 flex items-center justify-center relative">
                                        <div className="absolute inset-0 animate-[spin_20s_linear_infinite] opacity-30 border border-dashed border-gold/30 rounded-full"></div>
                                        <div className="absolute inset-0 bg-gold/5 rounded-full blur-xl"></div>
                                        <div className="text-5xl filter drop-shadow-[0_0_10px_rgba(197,160,89,0.5)]">{selectedBook.icon}</div>
                                    </div>

                                    <div>
                                        <h2 className="font-serif text-2xl text-parchment font-bold mb-2 text-shadow" style={{ color: selectedBook.theme_color }}>
                                            {selectedBook.title}
                                        </h2>
                                        <div className="w-8 h-[1px] bg-gold/30 mx-auto mb-2"></div>
                                        <p className="font-serif text-[10px] text-white/60 italic px-2 leading-relaxed">
                                            "{selectedBook.description}"
                                        </p>
                                    </div>

                                    {/* Action Button */}
                                    <button 
                                        onClick={handleBind}
                                        className="w-full py-3 mt-4 border border-gold/30 bg-gold/5 text-gold hover:bg-gold hover:text-midnight transition-all font-mystic text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(197,160,89,0.1)] group"
                                    >
                                        {isBinding ? 'Unlocking...' : 'Open Grimoire'}
                                    </button>
                                </div>
                            </div>

                            {/* === SPINE (Visible during rotation) === */}
                            <div 
                                className="absolute top-0 bottom-0 left-0 w-8 bg-[#16100e] transform origin-left rotate-y-[-90deg] flex flex-col items-center justify-center border-l border-white/5"
                            >
                                <div className="rotate-90 text-[8px] text-gold/30 tracking-widest whitespace-nowrap font-mystic">
                                    {selectedBook.title.toUpperCase()}
                                </div>
                            </div>

                            {/* === PAGES (Side) === */}
                            <div 
                                className="absolute top-1 bottom-1 right-0 w-7 bg-[#e3dac9] transform origin-right rotate-y-[-90deg] translate-z-[-15px]"
                                style={{
                                    backgroundImage: "linear-gradient(to right, #dcd1b4 1px, transparent 1px)",
                                    backgroundSize: "2px 100%"
                                }}
                            ></div>

                            {/* === BACK COVER === */}
                            <div 
                                className="absolute inset-0 bg-[#1a1412] rounded-l-md transform translate-z-[-15px] rotate-y-180"
                                style={{ boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                            ></div>

                        </div>
                        
                        {/* Close Button (X) */}
                        <div className="absolute -top-10 right-0 pointer-events-auto">
                            <button 
                                onClick={handleClose}
                                className="w-8 h-8 rounded-full border border-white/10 text-white/40 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Bookshelf;