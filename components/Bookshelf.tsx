import React, { useState, useEffect, useRef } from 'react';
import { LIBRARY_ARCHIVE } from '../data/books';
import { Grimoire } from '../types';

interface BookshelfProps {
    onBookSelected: (book: Grimoire) => void;
}

interface BookSpineProps {
    book: Grimoire;
    onClick: (e: React.MouseEvent, book: Grimoire) => void;
    isHidden: boolean; // Visual hide when the book is "out"
}

// Helper to get random but deterministic height
const getBookHeight = (book: Grimoire) => (book.word_count % 30) + 180;

const BookSpine: React.FC<BookSpineProps> = ({ book, onClick, isHidden }) => {
    const heightVar = getBookHeight(book);
    
    return (
        <div 
            onClick={(e) => onClick(e, book)}
            className={`relative group cursor-pointer transition-transform duration-300 mx-[2px] ${isHidden ? 'opacity-0 pointer-events-none' : 'hover:-translate-y-4 hover:z-10'}`}
            style={{ height: `${heightVar}px`, width: '40px' }}
        >
            {/* The Spine Object */}
            <div 
                className="absolute inset-0 rounded-sm border-l border-white/5 flex flex-col items-center justify-between py-4 overflow-hidden shadow-lg w-full h-full"
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
    const [sourceRect, setSourceRect] = useState<DOMRect | null>(null);
    const [animState, setAnimState] = useState<'opening' | 'open' | 'closing'>('opening');
    const [isBinding, setIsBinding] = useState(false);

    // Group books for the shelves (chunks of 4)
    const shelves: Grimoire[][] = [];
    for (let i = 0; i < LIBRARY_ARCHIVE.length; i += 4) {
        shelves.push(LIBRARY_ARCHIVE.slice(i, i + 4));
    }

    const handleSpineClick = (e: React.MouseEvent, book: Grimoire) => {
        // 1. Capture the EXACT position of the spine before it moves
        const rect = e.currentTarget.getBoundingClientRect();
        setSourceRect(rect);
        
        // 2. Set state to mount the modal
        setSelectedBook(book);
        setAnimState('opening');

        // 3. Trigger the animation to the center next frame
        requestAnimationFrame(() => {
            // Force reflow
            void document.body.offsetHeight;
            setAnimState('open');
        });
    };

    const handleClose = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (animState !== 'open') return;

        // 1. Trigger closing animation (Move back to sourceRect)
        setAnimState('closing');

        // 2. Wait for transition to finish, then unmount
        setTimeout(() => {
            setSelectedBook(null);
            setSourceRect(null);
        }, 800); // Matches CSS transition duration
    };

    const handleBind = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!selectedBook) return;
        setIsBinding(true);
        setTimeout(() => {
            onBookSelected(selectedBook);
        }, 1500);
    };

    // Calculate dynamic styles for the flying book
    const getFlyingStyle = () => {
        if (!sourceRect) return {};

        const isOpeningOrClosing = animState === 'opening' || animState === 'closing';
        const targetWidth = 256; // w-64
        const targetHeight = 384; // h-96

        // Center position calculation
        // Note: Using window dimensions can be slightly risky with resize, but fine for this animation
        const centerLeft = (window.innerWidth - targetWidth) / 2;
        const centerTop = (window.innerHeight - targetHeight) / 2;

        if (isOpeningOrClosing) {
            // State: AT THE SHELF
            // We set width to FULL TARGET WIDTH (256px) but rotate it 90deg so we only see the spine.
            // Positioning: The Spine (Left Edge) must align with sourceRect.left
            return {
                top: `${sourceRect.top}px`,
                left: `${sourceRect.left}px`,
                width: `${targetWidth}px`, 
                height: `${sourceRect.height}px`, // Interpolate height from spine height
                transform: 'translate3d(0,0,0) rotateY(90deg)', // Face the spine to viewer
                transformOrigin: '0% 50%', // Pivot on left edge
                zIndex: 60
            };
        } else {
            // State: CENTERED
            return {
                top: `${centerTop}px`,
                left: `${centerLeft}px`,
                width: `${targetWidth}px`,
                height: `${targetHeight}px`,
                transform: 'translate3d(0,0,0) rotateY(0deg)', // Face front
                transformOrigin: '0% 50%',
                zIndex: 60
            };
        }
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
                                    <BookSpine 
                                        key={book.id} 
                                        book={book} 
                                        onClick={handleSpineClick} 
                                        // Hide the original spine if this book is currently selected (it's "flying")
                                        isHidden={selectedBook?.id === book.id} 
                                    />
                                ))}
                            </div>

                            {/* The Shelf Plank */}
                            <div className="absolute bottom-0 left-0 right-0 h-4 bg-[#2a1d18] shadow-[0_10px_20px_rgba(0,0,0,0.8)] transform translate-y-full rounded-sm">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-50 mix-blend-multiply"></div>
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/10"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- THE FLYING BOOK LAYER --- */}
            {selectedBook && (
                <div className="fixed inset-0 z-50 pointer-events-none perspective-1000">
                    
                    {/* Backdrop (Fades in/out) */}
                    <div 
                        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-800 ease-in-out pointer-events-auto ${animState === 'open' ? 'opacity-100' : 'opacity-0'}`}
                        onClick={handleClose}
                    ></div>

                    {/* THE MORPHING BOOK OBJECT */}
                    <div 
                        className={`
                            absolute transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] preserve-3d pointer-events-auto
                            ${isBinding ? 'animate-[shake_0.5s_ease-in-out_infinite] scale-105 brightness-125' : ''}
                        `}
                        style={getFlyingStyle()}
                        // Stop propagation so clicking the book doesn't close it
                        onClick={(e) => e.stopPropagation()} 
                    >
                        
                        {/* =======================
                            VISUAL: FRONT COVER
                           ======================= */}
                        <div 
                            className="absolute inset-0 rounded-r-md flex flex-col items-center p-6 text-center justify-between backface-hidden overflow-hidden"
                            style={{
                                backgroundColor: '#1a1412',
                                transform: 'translateZ(20px)', // Thicker Z (was 10)
                                boxShadow: 'inset 5px 0 15px rgba(0,0,0,0.8), 10px 10px 30px rgba(0,0,0,0.8)'
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

                            {/* Content (Fades out when closing to spine) */}
                            <div 
                                className={`relative z-10 flex flex-col h-full items-center justify-between py-4 transition-opacity duration-300 ${animState === 'open' ? 'opacity-100 delay-300' : 'opacity-0'}`}
                            >
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

                                <button 
                                    onClick={handleBind}
                                    className="w-full py-3 mt-4 border border-gold/30 bg-gold/5 text-gold hover:bg-gold hover:text-midnight transition-all font-mystic text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(197,160,89,0.1)] group"
                                >
                                    {isBinding ? 'Unlocking...' : 'Open Grimoire'}
                                </button>
                            </div>
                        </div>

                        {/* =======================
                            VISUAL: SPINE
                           ======================= */}
                        <div 
                            className="absolute top-0 bottom-0 left-0 bg-[#16100e] transform origin-left rotate-y-[-90deg] flex flex-col items-center justify-center border-l border-white/5 overflow-hidden"
                            style={{ width: '40px' }} // Fixed spine width
                        >
                            {/* We keep the spine content visible even during flight so it looks consistent when it lands */}
                            <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundColor: selectedBook.theme_color }}></div>
                            
                            {/* Ribs */}
                            <div className="absolute top-10 left-0 right-0 h-[2px] bg-white/20"></div>
                            <div className="absolute bottom-10 left-0 right-0 h-[2px] bg-white/20"></div>

                            <div className="flex-1 flex items-center justify-center py-2 writing-vertical-rl">
                                <span className="font-mystic text-sm tracking-[0.2em] uppercase truncate rotate-180 transform text-gold">
                                    {selectedBook.title}
                                </span>
                            </div>
                        </div>

                        {/* =======================
                            VISUAL: PAGES (Side)
                           ======================= */}
                        <div 
                            className="absolute top-1 bottom-1 right-0 bg-[#e3dac9] transform origin-right rotate-y-[-90deg] translate-z-[-20px]"
                            style={{
                                width: '38px', // Slightly less than 40 to account for cover overlap
                                backgroundImage: "linear-gradient(to right, #dcd1b4 1px, transparent 1px)",
                                backgroundSize: "2px 100%"
                            }}
                        ></div>

                        {/* =======================
                            VISUAL: BACK COVER
                           ======================= */}
                        <div 
                            className="absolute inset-0 bg-[#1a1412] rounded-l-md transform translate-z-[-20px] rotate-y-180"
                            style={{ boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                        ></div>

                        {/* Close Button (X) - Only visible when open */}
                        <div className={`absolute -top-10 -right-10 pointer-events-auto transition-opacity duration-300 ${animState === 'open' ? 'opacity-100 delay-500' : 'opacity-0'}`}>
                            <button 
                                onClick={handleClose}
                                className="w-10 h-10 rounded-full border border-white/10 text-white/40 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors bg-black/20 backdrop-blur-md"
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