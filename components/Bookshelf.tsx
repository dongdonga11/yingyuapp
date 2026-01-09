
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
const REALM_ORDER: RealmType[] = ['apprentice', 'adept', 'archmage', 'guild'];

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
                <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundColor: book.theme_color }}></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-30 mix-blend-multiply"></div>
                <div className="absolute top-10 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/30 to-transparent shadow-sm"></div>
                <div className="absolute bottom-10 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/30 to-transparent shadow-sm"></div>
                <div className="relative z-10 text-[10px] grayscale opacity-50">{book.icon}</div>
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
                <div className="relative z-10 font-serif text-[8px] text-gold/40">
                    {book.difficulty_level}
                </div>
            </div>
        </div>
    );
};

// --- SPARK SYSTEM ---
interface Spark {
    id: number;
    x: number;
    y: number;
    angle: number; // Direction of flight
    speed: number;
    life: number;
    color: string;
}

// --- COMPONENT: THE ELDRITCH MANDALA ---
const EldritchMandala = ({ 
    activeRealm, 
    isOpen, 
    onRealmChange,
    onClose
}: { 
    activeRealm: RealmType, 
    isOpen: boolean, 
    onRealmChange: (r: RealmType) => void,
    onClose: () => void
}) => {
    // Physics State
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    
    // Spark State
    const [sparks, setSparks] = useState<Spark[]>([]);
    
    // Refs for Loop
    const dragStartX = useRef<number | null>(null);
    const startRotation = useRef(0);
    const velocity = useRef(0);
    const lastX = useRef(0);
    const lastTime = useRef(0);
    const reqRef = useRef<number>();
    
    // Constants
    const ITEM_ANGLE = 90; // 4 items = 90 degrees apart
    const WHEEL_SIZE = 340; // Smaller, tighter
    
    // Init Rotation
    useEffect(() => {
        const index = REALM_ORDER.indexOf(activeRealm);
        if (index !== -1) setRotation(-index * ITEM_ANGLE);
    }, []); 

    // --- PHYSICS & SPARK LOOP ---
    useEffect(() => {
        const updatePhysics = () => {
            // 1. Apply Velocity to Rotation
            if (!isDragging && Math.abs(velocity.current) > 0.1) {
                velocity.current *= 0.94; // Friction
                setRotation(prev => prev + velocity.current);
            } else if (!isDragging && Math.abs(velocity.current) <= 0.1) {
                // Snap Logic
                const currentIdx = Math.round(-rotation / ITEM_ANGLE);
                const targetRotation = -currentIdx * ITEM_ANGLE;
                const diff = targetRotation - rotation;
                if (Math.abs(diff) > 0.1) {
                    setRotation(prev => prev + diff * 0.15); // Snap speed
                    
                    // Finalize Selection
                    const clampedIdx = (currentIdx % 4 + 4) % 4; // Wrap around math
                    // Note: Since our logic limits rotation, we map purely by index order
                    // Actually, let's keep it bounded for simplicity or handle wrapping visual only
                }
            }

            // 2. Generate Sparks on High Friction
            if (isDragging && Math.abs(velocity.current) > 0.5) {
                const newSpark: Spark = {
                    id: Math.random(),
                    x: WHEEL_SIZE / 2 + (Math.random() - 0.5) * 20, // Emit from edge-ish
                    y: 20, // Top of the arc (relative to container)
                    angle: velocity.current > 0 ? -Math.PI / 4 : -Math.PI * 0.75, // Tangential flight
                    speed: Math.abs(velocity.current) * 1.5 + Math.random() * 2,
                    life: 1.0,
                    color: Math.random() > 0.5 ? '#FCD34D' : '#F97316' // Amber/Orange
                };
                setSparks(prev => [...prev.slice(-15), newSpark]); // Limit max sparks
            }

            // 3. Update Sparks
            setSparks(prev => prev.map(s => ({
                ...s,
                x: s.x + Math.cos(s.angle) * s.speed,
                y: s.y + Math.sin(s.angle) * s.speed + (1 - s.life) * 2, // Gravity
                life: s.life - 0.05
            })).filter(s => s.life > 0));

            reqRef.current = requestAnimationFrame(updatePhysics);
        };
        
        reqRef.current = requestAnimationFrame(updatePhysics);
        return () => cancelAnimationFrame(reqRef.current!);
    }, [isDragging, rotation]);

    // --- GESTURE HANDLERS ---
    const handleStart = (clientX: number) => {
        setIsDragging(true);
        dragStartX.current = clientX;
        lastX.current = clientX;
        lastTime.current = Date.now();
        startRotation.current = rotation;
        velocity.current = 0;
    };

    const handleMove = (clientX: number) => {
        if (!isDragging || dragStartX.current === null) return;
        
        const dx = clientX - dragStartX.current;
        const now = Date.now();
        const dt = now - lastTime.current;
        
        if (dt > 0) {
            const moveX = clientX - lastX.current;
            velocity.current = (moveX / dt) * 12; // High sensitivity for "Flick" feel
        }
        
        // No rubber banding, infinite scroll feel locally (clamped at end)
        const newRot = startRotation.current + (dx * 0.5);
        setRotation(newRot);

        lastX.current = clientX;
        lastTime.current = now;
    };

    const handleEnd = () => {
        setIsDragging(false);
        dragStartX.current = null;
        
        // Predict landing
        const projectedRot = rotation + velocity.current * 20;
        let targetIdx = Math.round(-projectedRot / ITEM_ANGLE);
        
        // Clamp index to array bounds
        targetIdx = Math.max(0, Math.min(REALM_ORDER.length - 1, targetIdx));
        
        if (REALM_ORDER[targetIdx] !== activeRealm) {
            onRealmChange(REALM_ORDER[targetIdx]);
        }
    };

    return (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center z-40 pointer-events-none">
            <div className="relative pointer-events-auto w-full h-full flex justify-center">

                 {/* --- MANDALA CONTAINER --- */}
                 <div 
                    className={`
                        absolute bottom-[-170px] transition-all duration-500 ease-out
                        ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}
                    `}
                    style={{ width: `${WHEEL_SIZE}px`, height: `${WHEEL_SIZE}px` }}
                    onTouchStart={(e) => handleStart(e.touches[0].clientX)}
                    onTouchMove={(e) => handleMove(e.touches[0].clientX)}
                    onTouchEnd={handleEnd}
                    onMouseDown={(e) => handleStart(e.clientX)}
                    onMouseMove={(e) => handleMove(e.clientX)}
                    onMouseUp={handleEnd}
                    onMouseLeave={handleEnd}
                 >
                     {/* 
                        === GEOMETRY LAYERS (The Doctor Strange Effect) === 
                        Uses mix-blend-mode: screen/plus-lighter to make overlapping lines glow hotter
                     */}
                     
                     {/* Layer 1: The Runes Ring (Counter Rotates) */}
                     <div 
                        className="absolute inset-[10%] rounded-full border border-orange-500/30 border-dashed"
                        style={{ transform: `rotate(${rotation * -0.2}deg)` }}
                     >
                        <div className="absolute inset-0 flex items-center justify-center opacity-30 animate-[spin_60s_linear_infinite]">
                             {/* SVG Path Text could go here, simplified as dashed lines */}
                             <div className="w-[110%] h-[110%] border border-orange-400/20 rounded-full border-dotted"></div>
                        </div>
                     </div>

                     {/* Layer 2: The Squares (Octagram Construction) */}
                     <div className="absolute inset-[15%] flex items-center justify-center transition-transform duration-75" style={{ transform: `rotate(${rotation}deg)` }}>
                         {/* Square 1 */}
                         <div className="absolute w-full h-full border border-orange-500/60 shadow-[0_0_15px_rgba(249,115,22,0.4)]"></div>
                         {/* Square 2 (Rotated 45) */}
                         <div className="absolute w-full h-full border border-orange-500/60 shadow-[0_0_15px_rgba(249,115,22,0.4)] rotate-45"></div>
                         
                         {/* Inner Circle Glow */}
                         <div className="absolute w-[70%] h-[70%] rounded-full border-2 border-amber-300/50 shadow-[0_0_20px_rgba(251,191,36,0.6)]"></div>
                     </div>

                     {/* Layer 3: The Items (Stationary relative to wheel) */}
                     <div 
                        className="absolute inset-0 rounded-full"
                        style={{ transform: `rotate(${rotation}deg)` }}
                     >
                         {REALM_ORDER.map((realmId, idx) => {
                             const angle = idx * ITEM_ANGLE; // 0, 90, 180, 270
                             const isActive = activeRealm === realmId;
                             
                             return (
                                 <div
                                    key={realmId}
                                    className="absolute top-0 left-1/2 w-12 h-12 -ml-6 -mt-6 flex flex-col items-center justify-center transform origin-center transition-all duration-300"
                                    style={{ 
                                        transformOrigin: `50% ${WHEEL_SIZE/2}px`, 
                                        transform: `rotate(${angle}deg)` 
                                    }}
                                 >
                                     {/* Icon Node */}
                                     <div 
                                        className={`
                                            w-12 h-12 rounded-full border-2 flex items-center justify-center bg-[#0f0a05] shadow-[0_0_15px_rgba(249,115,22,0.2)] transition-all duration-300
                                            ${isActive ? 'border-amber-400 text-amber-400 scale-125 shadow-[0_0_25px_rgba(251,191,36,0.6)]' : 'border-orange-800/50 text-orange-700 scale-90 opacity-60'}
                                        `}
                                        style={{ transform: `rotate(${-angle - rotation}deg)` }} // Keep icon upright
                                     >
                                         <span className="text-xl drop-shadow-md">{REALM_CONFIG[realmId].icon}</span>
                                     </div>

                                     {/* Floating Label */}
                                     <div 
                                        className={`
                                            absolute top-14 text-center w-40 transition-all duration-300 pointer-events-none
                                            ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
                                        `}
                                        style={{ transform: `rotate(${-angle - rotation}deg)` }}
                                     >
                                         <div className="font-mystic text-amber-400 text-sm tracking-[0.2em] uppercase text-shadow glow-orange">{REALM_CONFIG[realmId].label}</div>
                                         <div className="font-serif text-[9px] text-orange-200/60 tracking-wider">{REALM_CONFIG[realmId].subLabel}</div>
                                     </div>
                                 </div>
                             );
                         })}
                     </div>
                     
                     {/* Layer 4: Sparks Canvas (HTML Overlay) */}
                     <div className="absolute inset-0 pointer-events-none overflow-visible">
                         {sparks.map(s => (
                             <div 
                                key={s.id}
                                className="absolute rounded-full"
                                style={{
                                    left: '50%',
                                    top: '0%', // Emit from top arc
                                    width: `${Math.random() * 2 + 1}px`,
                                    height: `${Math.random() * 2 + 1}px`,
                                    backgroundColor: s.color,
                                    transform: `translate(${s.x - WHEEL_SIZE/2}px, ${s.y}px)`,
                                    opacity: s.life,
                                    boxShadow: `0 0 6px ${s.color}`
                                }}
                             />
                         ))}
                     </div>

                 </div>

                 {/* --- CENTER TRIGGER (Eye of Agamotto style) --- */}
                 <button
                    onClick={onClose} 
                    className={`
                        absolute bottom-6 w-16 h-16 flex items-center justify-center transition-all duration-500 z-50
                        ${isOpen ? 'scale-100' : 'scale-100 hover:scale-110'}
                    `}
                 >
                     {/* Eye Lid Shape */}
                     <div className={`absolute inset-0 bg-midnight border-2 border-amber-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.4)] ${isOpen ? 'rotate-90' : 'rotate-0'} transition-transform duration-500`}>
                         <div className="w-[70%] h-[40%] border border-amber-400 rounded-[100%] absolute border-t-2 border-b-2"></div>
                         
                         {/* Pupil / Icon */}
                         <div className="relative z-10 text-amber-500 font-bold text-lg">
                             {isOpen ? '✕' : '✦'}
                         </div>
                     </div>
                 </button>

            </div>
            
            {/* Styles for Eldritch Glow */}
            <style>{`
                .glow-orange {
                    text-shadow: 0 0 5px rgba(251, 191, 36, 0.5), 0 0 10px rgba(249, 115, 22, 0.3);
                }
            `}</style>
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
        if (realm === activeRealm) return;

        // 1. Exit Animation
        setShelfTransition('out');
        
        // 2. Switch Data & Enter Animation
        setTimeout(() => {
            setActiveRealm(realm);
            // Small delay to allow DOM to clear before fading in
            setTimeout(() => {
                setShelfTransition('in');
            }, 50);
        }, 300); // Faster transition for wheel
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

            {/* --- NEW: THE ELDRITCH MANDALA --- */}
            <EldritchMandala 
                isOpen={isNavOpen}
                activeRealm={activeRealm} 
                onRealmChange={handleRealmChange}
                onClose={() => setIsNavOpen(!isNavOpen)}
            />

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
                        onClick={handleToggleBook} 
                    >
                        {/* Book Flipper Logic (Unchanged) */}
                         <div 
                            className={`
                                absolute inset-0 preserve-3d origin-left transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
                            `}
                            style={{ 
                                transform: isBookOpen ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                                zIndex: 20 
                            }}
                        >
                            {/* Front Cover */}
                            <div 
                                className="absolute inset-0 rounded-r-md flex flex-col items-center p-6 text-center justify-between backface-hidden overflow-hidden"
                                style={{
                                    backgroundColor: '#1a1412',
                                    transform: 'translateZ(10px)',
                                    boxShadow: 'inset 5px 0 15px rgba(0,0,0,0.8), 10px 10px 30px rgba(0,0,0,0.8)'
                                }}
                            >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-60 mix-blend-multiply rounded-r-md"></div>
                                <div className="absolute inset-3 border border-gold/40 rounded-sm pointer-events-none"></div>
                                <div className="relative z-10 flex flex-col h-full items-center justify-center py-4 transition-opacity duration-300">
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

                            {/* Inner Left Page */}
                            <div 
                                className="absolute inset-0 bg-[#e3dac9] rounded-l-md backface-hidden flex flex-col p-6 overflow-hidden preserve-3d"
                                style={{
                                    transform: 'translateZ(10px) rotateY(180deg)',
                                    boxShadow: 'inset -10px 0 30px rgba(0,0,0,0.1), 5px 0 15px rgba(0,0,0,0.1)' 
                                }}
                            >
                                <div 
                                    className="absolute right-0 top-1 bottom-1 w-[6px] origin-right"
                                    style={{ 
                                        transform: 'rotateY(-90deg)',
                                        background: 'linear-gradient(to right, #ccc 0%, #e3dac9 40%, #c5bba8 100%)',
                                    }}
                                ></div>
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-30 mix-blend-multiply"></div>
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

                        {/* Spine */}
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

                        {/* Inner Right Page */}
                        <div 
                            className="absolute top-1 bottom-1 left-0 right-1 bg-[#e3dac9] rounded-r-sm shadow-inner preserve-3d"
                            style={{
                                transform: 'translateZ(8px)',
                                zIndex: 5,
                                background: '#e3dac9'
                            }}
                        >
                            <div 
                                className="absolute left-0 top-1 bottom-1 w-[6px] origin-left"
                                style={{ 
                                    transform: 'rotateY(90deg)',
                                    background: 'linear-gradient(to left, #ccc 0%, #e3dac9 40%, #c5bba8 100%)',
                                }}
                            ></div>
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-30 mix-blend-multiply"></div>
                            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 to-transparent pointer-events-none"></div>

                            <div className="relative z-10 h-full flex flex-col items-center p-6 text-[#3e342a]">
                                <div className="w-full flex justify-between items-center border-b border-[#3e342a]/20 pb-2 mb-6">
                                    <span className="text-[9px] uppercase tracking-widest text-[#8A2323] opacity-60">Chapter I</span>
                                    <span className="text-[9px] font-mono opacity-40">Pg. 1</span>
                                </div>
                                <h2 className="font-serif text-2xl font-bold mb-4 text-center mt-4">The Beginning</h2>
                                <p className="font-serif text-xs leading-relaxed opacity-70 mb-8 text-justify indent-4">
                                    Within these pages lie {selectedBook.word_count} ancient runes awaiting your command. Only those with a clear mind and steady will can decipher the logic hidden within.
                                </p>
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

                        {/* Pages Thickness */}
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

                        {/* Back Cover */}
                        <div 
                            className="absolute inset-0 bg-[#1a1412] rounded-l-md"
                            style={{ 
                                transform: 'translateZ(-10px) rotateY(180deg)',
                                boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                            }}
                        ></div>

                        {/* Close Button */}
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
