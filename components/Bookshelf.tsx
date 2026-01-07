import React, { useState, useRef, useEffect } from 'react';
import { LIBRARY_ARCHIVE } from '../data/books';
import { Grimoire, RealmType } from '../types';

interface BookshelfProps {
    onBookSelected: (book: Grimoire) => void;
}

const Bookshelf: React.FC<BookshelfProps> = ({ onBookSelected }) => {
    const [activeRealm, setActiveRealm] = useState<RealmType>('adept');
    const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
    const [isBinding, setIsBinding] = useState(false);

    // Filter books by realm
    const activeBooks = LIBRARY_ARCHIVE.filter(b => b.realm === activeRealm);

    // Default selection when switching realms
    useEffect(() => {
        if (activeBooks.length > 0) {
            setSelectedBookId(activeBooks[0].id);
        }
    }, [activeRealm]);

    const currentBook = LIBRARY_ARCHIVE.find(b => b.id === selectedBookId) || activeBooks[0];

    const handleBind = () => {
        setIsBinding(true);
        setTimeout(() => {
            onBookSelected(currentBook);
        }, 1500); 
    };

    // Realm Config
    const realms: {id: RealmType, label: string, icon: string, color: string}[] = [
        { id: 'apprentice', label: 'Apprentice', icon: '🌱', color: '#10B981' },
        { id: 'adept', label: 'Adept', icon: '✨', color: '#3B82F6' },
        { id: 'archmage', label: 'Archmage', icon: '🔥', color: '#9F1239' },
        { id: 'guild', label: 'Guild', icon: '⚙️', color: '#F59E0B' },
    ];

    // Helper: Corner Ornament Component
    const GoldCorner = ({ className }: { className: string }) => (
        <div className={`absolute w-12 h-12 border-gold pointer-events-none ${className}`}>
            <div className="absolute inset-0 border-2 border-gold opacity-80 rounded-sm"></div>
            {/* Inner Detail */}
            <div className="absolute inset-1 border border-gold/40 rounded-sm"></div>
            {/* The Screw/Rivets */}
            <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-gold shadow-sm"></div>
            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-gold shadow-sm opacity-60"></div>
            {/* Diagonal Slash */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/0 via-gold/20 to-gold/0 opacity-50"></div>
        </div>
    );

    // Helper: The Mystic Seal (Hexagram)
    const MysticSeal = ({ color }: { color: string }) => (
        <div className="relative w-32 h-32 flex items-center justify-center my-4">
             {/* Outer Circle */}
             <div className="absolute inset-0 rounded-full border-2 border-gold/40 animate-[spin_12s_linear_infinite]"></div>
             <div className="absolute inset-2 rounded-full border border-gold/20 border-dashed animate-[spin_20s_linear_infinite_reverse]"></div>
             
             {/* Hexagram (Two Triangles) */}
             <div className="absolute w-24 h-24 border border-gold/30 opacity-60 transform rotate-0 flex items-center justify-center">
                 <div className="w-full h-full border border-gold/30 rotate-60 absolute"></div>
                 <div className="w-full h-full border border-gold/30 -rotate-60 absolute"></div>
             </div>

             {/* Central Gemstone */}
             <div 
                className="w-8 h-8 rounded-full shadow-[0_0_15px_currentColor] relative z-10 animate-pulse"
                style={{ backgroundColor: color, color: color }}
             >
                 <div className="absolute top-1 left-1 w-2 h-2 bg-white/60 rounded-full blur-[1px]"></div>
             </div>
             
             {/* Runes / Icons orbiting */}
             <div className="absolute top-0 text-[10px] text-gold/60 font-serif">Ω</div>
             <div className="absolute bottom-0 text-[10px] text-gold/60 font-serif">Σ</div>
             <div className="absolute left-0 text-[10px] text-gold/60 font-serif">α</div>
             <div className="absolute right-0 text-[10px] text-gold/60 font-serif">ω</div>
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col items-center relative overflow-hidden bg-[#0a0c10] animate-fade-in">
            
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] opacity-40"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-[#0F111A]/80 to-black/95"></div>
            
            {/* Floating Dust Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                {[...Array(15)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute w-0.5 h-0.5 bg-gold rounded-full animate-[float_10s_linear_infinite]"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDuration: `${8 + Math.random() * 15}s`,
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    ></div>
                ))}
            </div>

            {/* HEADER */}
            <div className="z-20 pt-8 pb-4 text-center">
                <h1 className="font-mystic text-gold text-2xl tracking-[0.2em] text-glow mb-1">Archive of Truth</h1>
                <p className="font-serif text-white/40 text-xs italic">Choose the grimoire that calls to you.</p>
            </div>

            {/* REALM COMPASS (Tabs) */}
            <div className="z-20 flex gap-4 mb-8 overflow-x-auto max-w-full px-6 no-scrollbar snap-x items-center h-20">
                {realms.map(realm => (
                    <button
                        key={realm.id}
                        onClick={() => setActiveRealm(realm.id)}
                        className={`
                            flex flex-col items-center gap-1 min-w-[60px] snap-center transition-all duration-500 relative
                            ${activeRealm === realm.id ? 'opacity-100 scale-110' : 'opacity-30 hover:opacity-60 grayscale'}
                        `}
                    >
                        <div 
                            className={`w-10 h-10 rounded-full border border-current flex items-center justify-center text-lg bg-black/50 backdrop-blur-sm shadow-lg`}
                            style={{ color: realm.color, borderColor: activeRealm === realm.id ? realm.color : 'rgba(255,255,255,0.2)' }}
                        >
                            {realm.icon}
                        </div>
                        {activeRealm === realm.id && (
                             <div className="absolute -bottom-6 text-[9px] uppercase tracking-widest text-gold animate-[fade-in_0.5s]">
                                 {realm.label}
                             </div>
                        )}
                    </button>
                ))}
            </div>

            {/* BOOKSHELF DISPLAY AREA */}
            <div className="flex-1 w-full relative flex flex-col items-center justify-center z-10 perspective-1000">
                
                {/* The Floating Book */}
                <div 
                    className={`
                        relative w-56 h-80 transition-all duration-700 preserve-3d cursor-pointer
                        ${isBinding ? 'animate-[shake_0.5s_ease-in-out_infinite] scale-90 opacity-0' : 'animate-[float_6s_ease-in-out_infinite]'}
                    `}
                    style={{
                        animationDuration: isBinding ? '0.5s' : '6s',
                        transform: isBinding ? 'translateY(100px) scale(0)' : 'translateY(0)',
                    }}
                >
                     {/* BINDING EFFECT PARTICLES */}
                     {isBinding && (
                         <div className="absolute inset-0 flex items-center justify-center z-50">
                             <div className="w-[150%] h-[150%] rounded-full border border-gold/50 animate-[ping_1s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                             <div className="w-full h-full bg-white rounded-full blur-3xl animate-[pulse_0.5s_ease-in-out_infinite]"></div>
                         </div>
                     )}

                    {/* === BOOK COVER === */}
                    <div 
                        className="absolute inset-0 rounded-r-md flex flex-col items-center p-5 text-center justify-between"
                        style={{
                            backgroundColor: '#1a1412', // Deep Leather Brown/Black base
                            boxShadow: `
                                inset 3px 0 10px rgba(0,0,0,0.8), 
                                inset -2px 0 5px rgba(255,255,255,0.05),
                                15px 20px 40px rgba(0,0,0,0.6)
                            `,
                            transform: 'translateZ(12px)', // Push front cover out
                        }}
                    >
                        {/* Leather Texture Overlay */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-60 mix-blend-multiply rounded-r-md"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/40 rounded-r-md pointer-events-none"></div>

                        {/* --- ORNAMENTS --- */}
                        {/* Gold Corners */}
                        <GoldCorner className="top-0 left-0 border-r-0 border-b-0 rounded-tl-sm" />
                        <GoldCorner className="top-0 right-0 border-l-0 border-b-0 rounded-tr-md" />
                        <GoldCorner className="bottom-0 left-0 border-r-0 border-t-0 rounded-bl-sm" />
                        <GoldCorner className="bottom-0 right-0 border-l-0 border-t-0 rounded-br-md" />

                        {/* Gold Border Frame (Double Line) */}
                        <div className="absolute inset-3 border-2 border-gold/30 rounded-sm pointer-events-none"></div>
                        <div className="absolute inset-4 border border-gold/10 rounded-sm pointer-events-none"></div>

                        {/* --- CONTENT --- */}
                        <div className="relative z-10 flex flex-col h-full w-full items-center justify-between py-2">
                            
                            {/* Top: Magical English Title */}
                            <div className="flex flex-col items-center w-full border-b border-gold/20 pb-2">
                                <span className="font-mystic text-[10px] text-gold/50 tracking-[0.3em] uppercase">Grimoire of</span>
                                <span className="font-mystic text-lg text-gold text-shadow-sm tracking-widest leading-tight">
                                    {currentBook.sub_title.split(' ').pop()?.toUpperCase() || 'KNOWLEDGE'}
                                </span>
                            </div>

                            {/* Middle: The Seal */}
                            <MysticSeal color={currentBook.theme_color} />

                            {/* Bottom: Chinese Title (The Core) */}
                            <div className="flex flex-col items-center w-full mt-2">
                                <h2 
                                    className="font-serif text-2xl font-bold text-parchment tracking-widest mb-1"
                                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                                >
                                    {currentBook.title}
                                </h2>
                                <div className="flex items-center gap-2 text-[9px] text-gold/60 uppercase tracking-[0.2em] font-sans">
                                    <span>Lv.{currentBook.difficulty_level}</span>
                                    <span>•</span>
                                    <span>{currentBook.word_count} Words</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* === BOOK SPINE (Thick & Ribbed) === */}
                    <div 
                        className="absolute top-0 bottom-0 left-0 w-12 bg-[#120e0d] transform origin-left rotate-y-[-90deg] flex flex-col items-center border-l border-white/5"
                        style={{ 
                            boxShadow: 'inset 5px 0 10px rgba(0,0,0,0.8)'
                        }}
                    >
                         {/* Ribs (Ridges on the spine) */}
                         <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent mt-8 shadow-[0_2px_2px_black]"></div>
                         <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent mt-12 shadow-[0_2px_2px_black]"></div>
                         
                         <div className="flex-1 flex items-center justify-center py-4 overflow-hidden">
                             <span className="font-mystic text-gold/40 text-xs tracking-[0.5em] rotate-90 whitespace-nowrap">
                                 {currentBook.title.toUpperCase()}
                             </span>
                         </div>

                         <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-12 shadow-[0_2px_2px_black]"></div>
                         <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-8 shadow-[0_2px_2px_black]"></div>
                    </div>

                    {/* === BOOK PAGES (Side view) === */}
                    <div 
                        className="absolute top-1 bottom-1 right-0 w-11 bg-[#e3dac9] transform origin-right rotate-y-[-90deg] translate-z-[-12px]"
                        style={{
                            backgroundImage: "linear-gradient(to right, #dcd1b4 1px, transparent 1px)",
                            backgroundSize: "2px 100%",
                            boxShadow: "inset 10px 0 20px rgba(0,0,0,0.3)"
                        }}
                    ></div>
                     
                     {/* Back Cover (for thickness illusion only) */}
                     <div 
                        className="absolute inset-0 bg-[#1a1412] rounded-l-md transform translate-z-[-12px]"
                        style={{ boxShadow: '0 0 20px rgba(0,0,0,0.5)'}}
                     ></div>

                </div>

                {/* BOOK DESCRIPTION */}
                <div className="w-full max-w-xs mt-12 p-4 bg-gradient-to-b from-black/60 to-black/80 backdrop-blur-md border-t border-gold/20 rounded-lg text-center animate-fade-in min-h-[100px] flex flex-col items-center justify-center relative">
                    <div className="absolute -top-1.5 w-3 h-3 bg-gold rotate-45"></div>
                    <p className="font-serif text-sm text-parchment/80 italic leading-relaxed">
                        "{currentBook.description}"
                    </p>
                </div>

            </div>

            {/* SELECTION DOTS */}
            <div className="z-20 w-full flex justify-center gap-3 mb-6">
                {activeBooks.map((book) => (
                    <button 
                        key={book.id}
                        onClick={() => setSelectedBookId(book.id)}
                        className={`transition-all duration-300 ${
                            selectedBookId === book.id 
                            ? 'w-3 h-3 bg-gold rotate-45' 
                            : 'w-2 h-2 bg-white/10 rounded-full hover:bg-white/30'
                        }`}
                    />
                ))}
            </div>

            {/* BIND BUTTON */}
            <div className="z-20 w-full px-8 pb-10">
                <button
                    onClick={handleBind}
                    disabled={isBinding}
                    className="w-full group relative py-4 bg-transparent border-t border-b border-gold/30 overflow-hidden transition-all hover:border-gold hover:bg-gold/5 active:scale-95"
                >
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                    <div className="flex flex-col items-center gap-1">
                        <span className="relative z-10 font-mystic text-gold text-lg uppercase tracking-[0.3em] group-hover:text-white transition-colors">
                            {isBinding ? 'Sealing Pact...' : 'Bind Soul'}
                        </span>
                        <span className="text-[9px] text-gold/40 uppercase tracking-widest group-hover:text-gold/60">
                            Create Link
                        </span>
                    </div>
                </button>
            </div>

        </div>
    );
};

export default Bookshelf;