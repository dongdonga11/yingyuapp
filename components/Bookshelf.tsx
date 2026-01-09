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
    
    // Interaction States
    const [isBookOpen, setIsBookOpen] = useState(false); // Is the cover flipped?
    const [isPressing, setIsPressing] = useState(false); // The "Squash" anticipation state
    const [isBinding, setIsBinding] = useState(false);

    // Group books for the shelves (chunks of 4)
    const shelves: Grimoire[][] = [];
    for (let i = 0; i < LIBRARY_ARCHIVE.length; i += 4) {
        shelves.push(LIBRARY_ARCHIVE.slice(i, i + 4));
    }

    const handleSpineClick = (e: React.MouseEvent, book: Grimoire) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setSourceRect(rect);
        setSelectedBook(book);
        setAnimState('opening');
        setIsBookOpen(false); 
        setIsPressing(false);

        requestAnimationFrame(() => {
            void document.body.offsetHeight;
            setAnimState('open');
        });
    };

    const handleClose = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        
        // If book is open (reading mode), close the cover first
        if (isBookOpen) {
            setIsBookOpen(false);
            // Wait for cover close animation (600ms) then fly back
            setTimeout(() => {
                setAnimState('closing');
                setTimeout(() => {
                    setSelectedBook(null);
                    setSourceRect(null);
                }, 800);
            }, 600);
            return;
        }

        if (animState !== 'open') return;

        setAnimState('closing');
        setTimeout(() => {
            setSelectedBook(null);
            setSourceRect(null);
        }, 800);
    };

    const handleToggleBook = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (animState !== 'open') return;

        if (!isBookOpen) {
            // OPENING SEQUENCE:
            // 1. Squash (Anticipation)
            setIsPressing(true);
            
            // 2. Release & Open
            setTimeout(() => {
                setIsPressing(false);
                setIsBookOpen(true);
            }, 200); // 200ms press duration
        } else {
            // Closing is simpler
            setIsBookOpen(false);
        }
    };

    const handleEnterGrimoire = (e: React.MouseEvent) => {
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
        const targetWidth = 256; // w-64 (Cover width)
        const targetHeight = 384; // h-96

        const centerLeft = (window.innerWidth - targetWidth) / 2;
        const centerTop = (window.innerHeight - targetHeight) / 2;

        if (isOpeningOrClosing) {
            // State: AT THE SHELF
            const thicknessOffset = 20; 
            return {
                top: `${sourceRect.top}px`,
                left: `${sourceRect.left - thicknessOffset}px`,
                width: `${targetWidth}px`, 
                height: `${sourceRect.height}px`,
                transform: 'translate3d(0,0,0) rotateY(90deg)', 
                transformOrigin: '0% 50%',
                zIndex: 60
            };
        } else {
            // State: CENTERED
            
            // 1. Expansion: Shift right to center the spine
            const offsetForOpen = isBookOpen ? (targetWidth / 2) : 0;
            
            // 2. Rotation: 
            // - If Pressing: Maintain angle but scale down (Squash)
            // - If Open: Dead flat (0deg)
            // - If Closed (Floating): Angled (-15deg)
            
            let rotation = 'rotateY(-15deg)';
            let scale = 'scale(1)';

            if (isPressing) {
                 scale = 'scale(0.95)'; // The Squash
            } else if (isBookOpen) {
                 rotation = 'rotateY(0deg)'; // The Straighten
            }

            return {
                top: `${centerTop}px`,
                left: `${centerLeft}px`,
                width: `${targetWidth}px`,
                height: `${targetHeight}px`,
                // We use translate3d to animate the position
                transform: `translate3d(${offsetForOpen}px,0,0) ${rotation} ${scale}`,
                transformOrigin: '0% 50%', // Important: Pivot from the Spine (Left edge)
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
                <div className="fixed inset-0 z-50 pointer-events-none perspective-2000">
                    
                    {/* Backdrop */}
                    <div 
                        className={`absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-800 ease-in-out pointer-events-auto ${animState === 'open' ? 'opacity-100' : 'opacity-0'}`}
                        onClick={handleClose}
                    ></div>

                    {/* THE BOOK RIG */}
                    <div 
                        className={`
                            absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] preserve-3d pointer-events-auto
                            ${isBinding ? 'animate-[shake_0.5s_ease-in-out_infinite] scale-105 brightness-125' : ''}
                        `}
                        style={getFlyingStyle()}
                        // Clicking the container toggles open/closed (unless entering)
                        onClick={handleToggleBook} 
                    >
                        
                        {/* 
                           ========================================================================
                           COMPONENT A: THE FLIPPER (Front Cover + Inner Left Page)
                           This group rotates -180deg when opening.
                           Anchor point: Left Edge
                           
                           ANIMATION NOTE: We add 'delay-100' so the book straightens FIRST,
                           then the cover flips open.
                           ========================================================================
                        */}
                        <div 
                            className={`
                                absolute inset-0 preserve-3d origin-left transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]
                                ${isBookOpen ? 'delay-100' : ''}
                            `}
                            style={{ 
                                transform: isBookOpen ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                                zIndex: 20 
                            }}
                        >
                            {/* --- FRONT COVER (Outer Face) --- */}
                            <div 
                                className="absolute inset-0 rounded-r-md flex flex-col items-center p-6 text-center justify-between backface-hidden overflow-hidden"
                                style={{
                                    backgroundColor: '#1a1412',
                                    transform: 'translateZ(20px)', // Front Face
                                    boxShadow: 'inset 5px 0 15px rgba(0,0,0,0.8), 10px 10px 30px rgba(0,0,0,0.8)'
                                }}
                            >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-60 mix-blend-multiply rounded-r-md"></div>
                                <div className="absolute inset-3 border border-gold/40 rounded-sm pointer-events-none"></div>
                                {/* Corner Decorations */}
                                <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-gold/60"></div>
                                <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-gold/60"></div>
                                <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-gold/60"></div>
                                <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-gold/60"></div>

                                {/* COVER CONTENT */}
                                <div className={`relative z-10 flex flex-col h-full items-center justify-center py-4 transition-opacity duration-300`}>
                                    <div className="text-gold/60 text-[10px] tracking-[0.3em] font-mystic mb-4">GRIMOIRE</div>
                                    <div className="w-32 h-32 rounded-full border border-gold/20 flex items-center justify-center relative mb-4">
                                        <div className="absolute inset-0 bg-gold/5 rounded-full blur-xl"></div>
                                        <div className="text-6xl filter drop-shadow-[0_0_10px_rgba(197,160,89,0.5)]">{selectedBook.icon}</div>
                                    </div>
                                    <h2 className="font-serif text-3xl text-parchment font-bold mb-2 text-shadow" style={{ color: selectedBook.theme_color }}>
                                        {selectedBook.title}
                                    </h2>
                                    <div className="text-[10px] text-gold/40 uppercase tracking-widest mt-8 animate-pulse">
                                        Tap to Open
                                    </div>
                                </div>
                            </div>

                            {/* --- INNER LEFT PAGE (Inner Face) --- */}
                            <div 
                                className="absolute inset-0 bg-[#e3dac9] rounded-l-md backface-hidden flex flex-col p-6 overflow-hidden preserve-3d"
                                style={{
                                    transform: 'translateZ(20px) rotateY(180deg)', // Back of the front cover
                                    boxShadow: 'inset -10px 0 30px rgba(0,0,0,0.1), 5px 0 15px rgba(0,0,0,0.1)' 
                                }}
                            >
                                {/* 3D PAGE THICKNESS (Right Edge of Left Page) - The "Gutter" */}
                                <div 
                                    className="absolute right-0 top-1 bottom-1 w-[4px] origin-right"
                                    style={{ 
                                        transform: 'rotateY(-90deg)',
                                        background: 'linear-gradient(to right, #ccc 0%, #e3dac9 100%)',
                                        backgroundSize: '1px 100%'
                                    }}
                                ></div>

                                {/* Paper Texture */}
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-30 mix-blend-multiply"></div>
                                
                                {/* Content - Layout optimized for Left Side */}
                                <div className="relative z-10 h-full flex flex-col items-center justify-center text-[#3e342a] border border-[#3e342a]/10 p-4">
                                    <div className="text-4xl text-[#8A2323] mb-4 opacity-80">❦</div>
                                    
                                    <h3 className="font-mystic text-lg text-[#8A2323] mb-2 tracking-widest text-center">Prologue</h3>
                                    <div className="w-12 h-[1px] bg-[#8A2323] mb-6"></div>
                                    
                                    <p className="font-serif text-xs leading-loose italic opacity-80 text-center px-2">
                                        "{selectedBook.description}"
                                    </p>
                                    
                                    <div className="mt-8 text-[9px] uppercase tracking-[0.2em] opacity-40">
                                        {selectedBook.realm} Realm
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* 
                           ========================================================================
                           COMPONENT B: THE BASE (Spine + Back Cover + Right Page)
                           This group stays static (relative to container).
                           ========================================================================
                        */}

                        {/* --- SPINE (Left Edge) --- */}
                        <div 
                            className="absolute top-0 bottom-0 left-0 bg-[#16100e] flex flex-col items-center justify-center border-l border-white/5 overflow-hidden"
                            style={{ 
                                width: '40px',
                                transform: 'translateZ(20px) rotateY(-90deg)', 
                                transformOrigin: 'left center',
                                zIndex: 10
                            }} 
                        >
                            <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundColor: selectedBook.theme_color }}></div>
                            <div className="absolute top-10 left-0 right-0 h-[2px] bg-white/20"></div>
                            <div className="absolute bottom-10 left-0 right-0 h-[2px] bg-white/20"></div>
                            <div className="flex-1 flex items-center justify-center py-2 writing-vertical-rl">
                                <span className="font-mystic text-sm tracking-[0.2em] uppercase truncate rotate-180 transform text-gold">
                                    {selectedBook.title}
                                </span>
                            </div>
                        </div>

                        {/* --- INNER RIGHT PAGE (Sits on top of Back Cover) --- */}
                        <div 
                            className="absolute top-1 bottom-1 left-0 right-1 bg-[#e3dac9] rounded-r-sm shadow-inner preserve-3d"
                            style={{
                                transform: 'translateZ(18px)', // Slightly Recessed from the Z20 plane
                                zIndex: 5,
                                background: '#e3dac9'
                            }}
                        >
                            {/* 3D PAGE THICKNESS (Left Edge of Right Page) - The "Gutter" */}
                            <div 
                                className="absolute left-0 top-1 bottom-1 w-[4px] origin-left"
                                style={{ 
                                    transform: 'rotateY(90deg)',
                                    background: 'linear-gradient(to left, #ccc 0%, #e3dac9 100%)',
                                    backgroundSize: '1px 100%'
                                }}
                            ></div>

                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-30 mix-blend-multiply"></div>
                             {/* Shadow near spine */}
                            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 to-transparent pointer-events-none"></div>

                            {/* Content - Layout optimized for Right Side */}
                            <div className="relative z-10 h-full flex flex-col items-center p-6 text-[#3e342a]">
                                <div className="w-full flex justify-between items-center border-b border-[#3e342a]/20 pb-2 mb-6">
                                    <span className="text-[9px] uppercase tracking-widest text-[#8A2323] opacity-60">Chapter I</span>
                                    <span className="text-[9px] font-mono opacity-40">Pg. 1</span>
                                </div>
                                
                                <h2 className="font-serif text-2xl font-bold mb-4 text-center mt-4">The Beginning</h2>
                                <p className="font-serif text-xs leading-relaxed opacity-70 mb-8 text-justify indent-4">
                                    Within these pages lie {selectedBook.word_count} ancient runes awaiting your command. Only those with a clear mind and steady will can decipher the logic hidden within.
                                </p>

                                {/* ENTER BUTTON */}
                                <button 
                                    onClick={handleEnterGrimoire}
                                    className="mt-auto mb-8 group relative px-8 py-3 bg-[#2C241B] text-[#E6DCC3] font-mystic text-sm uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                         {isBinding ? 'Unsealing...' : 'Enter World'} 
                                         {!isBinding && <span className="text-xs group-hover:translate-x-1 transition-transform">➔</span>}
                                    </span>
                                    <div className="absolute inset-1 border border-[#E6DCC3]/30"></div>
                                </button>
                            </div>
                        </div>

                        {/* --- PAGES (Side View / Thickness) --- */}
                        <div 
                            className="absolute top-1 bottom-1 right-0 bg-[#e3dac9]"
                            style={{
                                width: '36px', 
                                transform: 'translateZ(20px) rotateY(90deg)',
                                transformOrigin: 'right center',
                                backgroundImage: "linear-gradient(to right, #dcd1b4 1px, transparent 1px)",
                                backgroundSize: "2px 100%"
                            }}
                        ></div>

                        {/* --- BACK COVER --- */}
                        <div 
                            className="absolute inset-0 bg-[#1a1412] rounded-l-md"
                            style={{ 
                                transform: 'translateZ(-20px) rotateY(180deg)',
                                boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                            }}
                        ></div>

                        {/* Close Button (X) - Floating outside */}
                        <div className={`absolute -top-12 -right-12 pointer-events-auto transition-opacity duration-300 ${animState === 'open' ? 'opacity-100 delay-500' : 'opacity-0'}`}>
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