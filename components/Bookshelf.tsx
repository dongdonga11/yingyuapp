import React, { useState, useEffect, useRef } from 'react';
import { LIBRARY_ARCHIVE } from '../data/books';
import { Grimoire, RealmType } from '../types';

interface BookshelfProps {
    onBookSelected: (book: Grimoire) => void;
}

interface BookSpineProps {
    book: Grimoire;
    onClick: (e: React.MouseEvent, book: Grimoire) => void;
    isHidden: boolean;
}

// --- CONFIG: THE MAGIC REALMS ---
const REALM_CONFIG: Record<RealmType, { label: string; subLabel: string; icon: string; color: string }> = {
    apprentice: { label: 'Initiate', subLabel: 'K12 / Basis', icon: '🌱', color: '#4ADE80' },
    adept: { label: 'Adept', subLabel: 'University', icon: '🧿', color: '#60A5FA' },
    archmage: { label: 'Archmage', subLabel: 'Masters / Abroad', icon: '🔥', color: '#F43F5E' },
    guild: { label: 'Guild', subLabel: 'Profession', icon: '⚙️', color: '#F59E0B' },
};

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
    // Data State
    const [activeRealm, setActiveRealm] = useState<RealmType>('adept');
    const [filteredBooks, setFilteredBooks] = useState<Grimoire[]>([]);

    // Animation & Logic State
    const [selectedBook, setSelectedBook] = useState<Grimoire | null>(null);
    const [sourceRect, setSourceRect] = useState<DOMRect | null>(null);
    const [animState, setAnimState] = useState<'opening' | 'open' | 'closing'>('opening');
    
    // Interaction States
    const [isBookOpen, setIsBookOpen] = useState(false); // The final "Spread" state
    const [isZooming, setIsZooming] = useState(false);   // The "Pop" state (Z-axis approach)
    const [isBinding, setIsBinding] = useState(false);   // Enter World state

    // Navigation State
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [shelfTransition, setShelfTransition] = useState<'in' | 'out'>('in');

    // Filter Books on Realm Change
    useEffect(() => {
        const books = LIBRARY_ARCHIVE.filter(b => b.realm === activeRealm);
        setFilteredBooks(books);
    }, [activeRealm]);

    // Group books for the shelves (chunks of 4)
    const shelves: Grimoire[][] = [];
    for (let i = 0; i < filteredBooks.length; i += 4) {
        shelves.push(filteredBooks.slice(i, i + 4));
    }

    // --- HANDLERS ---

    const handleRealmChange = (realm: RealmType) => {
        if (realm === activeRealm) {
            setIsNavOpen(false);
            return;
        }

        // 1. Exit Animation
        setShelfTransition('out');
        setIsNavOpen(false);

        // 2. Switch Data & Enter Animation
        setTimeout(() => {
            setActiveRealm(realm);
            // Small delay to allow DOM to clear before fading in
            setTimeout(() => {
                setShelfTransition('in');
            }, 50);
        }, 500);
    };

    const handleSpineClick = (e: React.MouseEvent, book: Grimoire) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setSourceRect(rect);
        setSelectedBook(book);
        setAnimState('opening');
        setIsBookOpen(false); 
        setIsZooming(false);

        requestAnimationFrame(() => {
            void document.body.offsetHeight;
            setAnimState('open');
        });
    };

    const handleClose = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        
        if (isBookOpen) {
            setIsBookOpen(false);
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
            setIsZooming(true);
            setTimeout(() => {
                setIsZooming(false);
                setIsBookOpen(true);
            }, 400); 
        } else {
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
        const targetWidth = 256; 
        const targetHeight = 384; 

        const centerLeft = (window.innerWidth - targetWidth) / 2;
        const centerTop = (window.innerHeight - targetHeight) / 2;

        if (isOpeningOrClosing) {
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
            const offsetForOpen = isBookOpen ? (targetWidth / 2) : 0;
            let rotation = 'rotateY(-15deg)';
            let translateZ = 'translateZ(0px)';
            let scale = 'scale(1)';

            if (isZooming) {
                rotation = 'rotateY(0deg)';
                translateZ = 'translateZ(100px)';
                scale = 'scale(1.1)';
            } else if (isBookOpen) {
                rotation = 'rotateY(0deg)';
                translateZ = 'translateZ(0px)';
                scale = 'scale(1)';
            }

            return {
                top: `${centerTop}px`,
                left: `${centerLeft}px`,
                width: `${targetWidth}px`,
                height: `${targetHeight}px`,
                transform: `translate3d(${offsetForOpen}px, 0, 0) ${translateZ} ${rotation} ${scale}`,
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

            {/* --- SHELVES CONTAINER (The Realm Gate) --- */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-40 relative z-10 perspective-1000">
                <div 
                    className={`
                        max-w-md mx-auto space-y-16 mt-8 transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)]
                        ${shelfTransition === 'in' 
                            ? 'opacity-100 translate-z-0 blur-0' 
                            : 'opacity-0 translate-z-[-100px] blur-sm scale-95'}
                    `}
                >
                    {shelves.length === 0 ? (
                         <div className="flex flex-col items-center justify-center h-64 text-white/20">
                             <div className="text-4xl mb-2">🕸️</div>
                             <div className="font-mystic text-xs tracking-widest">This Realm is Empty</div>
                         </div>
                    ) : (
                        shelves.map((shelfBooks, i) => (
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
                        ))
                    )}
                </div>
            </div>

            {/* --- THE ASTRAL COMPASS (Navigation) --- */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-40 pointer-events-none">
                 <div className="relative pointer-events-auto">
                     
                     {/* The Radial Menu (Expands Upwards) */}
                     <div 
                        className={`
                            absolute bottom-1/2 left-1/2 -translate-x-1/2 w-64 h-32 origin-bottom transition-all duration-500 ease-out overflow-hidden
                            ${isNavOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}
                        `}
                     >
                         {/* Golden Arc Border */}
                         <div className="absolute bottom-0 left-0 right-0 h-[200%] border border-gold/40 rounded-full shadow-[0_0_20px_rgba(197,160,89,0.2)]"></div>
                         
                         {/* Menu Items */}
                         {Object.entries(REALM_CONFIG).map(([key, config], idx, arr) => {
                             // Position along arc (180 deg)
                             const total = arr.length;
                             const step = 180 / (total + 1);
                             const angle = (idx + 1) * step; // e.g. 36, 72, 108, 144
                             const rad = (angle * Math.PI) / 180;
                             
                             // Radius of item placement
                             const r = 100; // px
                             const x = 128 - (r * Math.cos(rad)); // 128 is center (w-64/2)
                             const y = 128 - (r * Math.sin(rad)); // 128 is bottom

                             const isActive = key === activeRealm;

                             return (
                                <button
                                    key={key}
                                    onClick={() => handleRealmChange(key as RealmType)}
                                    className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 group"
                                    style={{ left: `${x}px`, top: `${y}px` }}
                                >
                                    <div 
                                        className={`
                                            w-10 h-10 rounded-full border flex items-center justify-center bg-midnight shadow-lg
                                            ${isActive ? 'border-gold text-gold scale-110' : 'border-gold/30 text-gold/40 hover:text-gold hover:border-gold'}
                                        `}
                                    >
                                        <span className="text-lg">{config.icon}</span>
                                    </div>
                                    <div className={`
                                        absolute -bottom-4 text-[8px] uppercase tracking-wider font-mystic whitespace-nowrap bg-midnight/80 px-2 py-0.5 rounded
                                        ${isActive ? 'text-gold opacity-100' : 'text-gold/50 opacity-0 group-hover:opacity-100'}
                                    `}>
                                        {config.label}
                                    </div>
                                </button>
                             );
                         })}

                     </div>

                     {/* The Hexagram Control (Spinner) */}
                     <button
                        onClick={() => setIsNavOpen(!isNavOpen)}
                        className={`
                            relative w-20 h-20 flex items-center justify-center transition-transform duration-500
                            ${isNavOpen ? 'scale-90' : 'scale-100 hover:scale-105'}
                        `}
                     >
                         {/* Spinning Outer Ring */}
                         <div className="absolute inset-0 rounded-full border border-gold/30 border-dashed animate-[spin_20s_linear_infinite]"></div>
                         
                         {/* The Hexagram (Two Triangles) */}
                         <div className={`absolute inset-2 transition-transform duration-1000 ${isNavOpen ? 'rotate-180' : 'animate-[spin_10s_linear_infinite]'}`}>
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="w-16 h-16 border border-gold/40 rotate-0 absolute"></div> {/* Box logic simplified for cleaner hexagram feel */}
                                 <div className="w-16 h-16 border border-gold/40 rotate-60 absolute"></div>
                                 <div className="w-16 h-16 border border-gold/40 -rotate-60 absolute"></div>
                             </div>
                         </div>

                         {/* Center Core */}
                         <div className="relative z-10 w-12 h-12 bg-midnight rounded-full border border-gold shadow-[0_0_15px_rgba(197,160,89,0.5)] flex items-center justify-center">
                              {isNavOpen ? (
                                  <span className="text-gold text-xs">✕</span>
                              ) : (
                                  <span className="text-xl animate-pulse">{REALM_CONFIG[activeRealm].icon}</span>
                              )}
                         </div>

                     </button>
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
                            absolute transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] preserve-3d pointer-events-auto
                            ${isBinding ? 'animate-[shake_0.5s_ease-in-out_infinite] scale-105 brightness-125' : ''}
                        `}
                        style={getFlyingStyle()}
                        // Clicking the container toggles open/closed (unless entering)
                        onClick={handleToggleBook} 
                    >
                        
                        {/* 
                           ========================================================================
                           COMPONENT A: THE FLIPPER (Front Cover + Inner Left Page)
                           ========================================================================
                        */}
                        <div 
                            className={`
                                absolute inset-0 preserve-3d origin-left transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
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
                                    transform: 'translateZ(10px)', // Front Face thickness
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
                                    transform: 'translateZ(10px) rotateY(180deg)', // Back of the front cover
                                    boxShadow: 'inset -10px 0 30px rgba(0,0,0,0.1), 5px 0 15px rgba(0,0,0,0.1)' 
                                }}
                            >
                                {/* 3D PAGE THICKNESS (Right Edge of Left Page) - The "Gutter" */}
                                <div 
                                    className="absolute right-0 top-1 bottom-1 w-[6px] origin-right"
                                    style={{ 
                                        transform: 'rotateY(-90deg)',
                                        background: 'linear-gradient(to right, #ccc 0%, #e3dac9 40%, #c5bba8 100%)', // Rounded thickness effect
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
                                        {REALM_CONFIG[selectedBook.realm].label}
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* 
                           ========================================================================
                           COMPONENT B: THE BASE (Spine + Back Cover + Right Page)
                           ========================================================================
                        */}

                        {/* --- SPINE (Left Edge) --- */}
                        <div 
                            className="absolute top-0 bottom-0 left-0 bg-[#16100e] flex flex-col items-center justify-center border-l border-white/5 overflow-hidden"
                            style={{ 
                                width: '40px',
                                transform: 'translateZ(10px) rotateY(-90deg)', 
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
                                transform: 'translateZ(8px)', // Slightly Recessed from the Z10 plane
                                zIndex: 5,
                                background: '#e3dac9'
                            }}
                        >
                            {/* 3D PAGE THICKNESS (Left Edge of Right Page) - The "Gutter" */}
                            <div 
                                className="absolute left-0 top-1 bottom-1 w-[6px] origin-left"
                                style={{ 
                                    transform: 'rotateY(90deg)',
                                    background: 'linear-gradient(to left, #ccc 0%, #e3dac9 40%, #c5bba8 100%)',
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

                        {/* --- PAGES BLOCK (Side View / Thickness) --- */}
                        <div 
                            className="absolute top-1 bottom-1 right-0 bg-[#e3dac9]"
                            style={{
                                width: '36px', 
                                transform: 'translateZ(10px) rotateY(90deg)',
                                transformOrigin: 'right center',
                                backgroundImage: "linear-gradient(to right, #dcd1b4 1px, transparent 1px)",
                                backgroundSize: "2px 100%"
                            }}
                        ></div>

                        {/* --- BACK COVER --- */}
                        <div 
                            className="absolute inset-0 bg-[#1a1412] rounded-l-md"
                            style={{ 
                                transform: 'translateZ(-10px) rotateY(180deg)',
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