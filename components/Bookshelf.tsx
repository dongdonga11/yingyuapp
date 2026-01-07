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
        // Play sound effect logic here ideally
        setTimeout(() => {
            onBookSelected(currentBook);
        }, 1500); // Wait for animation
    };

    // Realm Config
    const realms: {id: RealmType, label: string, icon: string, color: string}[] = [
        { id: 'apprentice', label: 'Apprentice', icon: '🌱', color: '#10B981' },
        { id: 'adept', label: 'Adept', icon: '✨', color: '#3B82F6' },
        { id: 'archmage', label: 'Archmage', icon: '🔥', color: '#9F1239' },
        { id: 'guild', label: 'Guild', icon: '⚙️', color: '#F59E0B' },
    ];

    return (
        <div className="w-full h-full flex flex-col items-center relative overflow-hidden bg-[#0a0c10] animate-fade-in">
            
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] opacity-30"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90"></div>
            
            {/* Floating Dust Particles (CSS) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute w-1 h-1 bg-white/20 rounded-full animate-[float_10s_linear_infinite]"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDuration: `${5 + Math.random() * 10}s`,
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
            <div className="z-20 flex gap-4 mb-8 overflow-x-auto max-w-full px-6 no-scrollbar snap-x">
                {realms.map(realm => (
                    <button
                        key={realm.id}
                        onClick={() => setActiveRealm(realm.id)}
                        className={`
                            flex flex-col items-center gap-1 min-w-[60px] snap-center transition-all duration-300
                            ${activeRealm === realm.id ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-70'}
                        `}
                    >
                        <div 
                            className={`w-10 h-10 rounded-full border border-current flex items-center justify-center text-lg bg-black/50 backdrop-blur-sm`}
                            style={{ color: realm.color, borderColor: activeRealm === realm.id ? realm.color : 'rgba(255,255,255,0.2)' }}
                        >
                            {realm.icon}
                        </div>
                        <span className="text-[9px] uppercase tracking-wider text-parchment/80">{realm.label}</span>
                    </button>
                ))}
            </div>

            {/* BOOKSHELF DISPLAY AREA */}
            <div className="flex-1 w-full relative flex flex-col items-center justify-center z-10 perspective-1000">
                
                {/* The Floating Book */}
                <div 
                    className={`
                        relative w-48 h-64 transition-all duration-700 preserve-3d cursor-pointer
                        ${isBinding ? 'animate-[shake_0.5s_ease-in-out_infinite] scale-90 opacity-0' : 'animate-[float_6s_ease-in-out_infinite]'}
                    `}
                    style={{
                        animationDuration: isBinding ? '0.5s' : '6s',
                        transform: isBinding ? 'translateY(100px) scale(0)' : 'translateY(0)',
                    }}
                >
                     {/* BINDING EFFECT PARTICLES */}
                     {isBinding && (
                         <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-[200%] h-[200%] rounded-full border border-gold/50 animate-[ping_1s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                             <div className="w-full h-full bg-white rounded-full blur-3xl animate-[pulse_0.5s_ease-in-out_infinite]"></div>
                         </div>
                     )}

                    {/* BOOK COVER */}
                    <div 
                        className="absolute inset-0 bg-[#1a1a1a] rounded-r-lg shadow-[10px_10px_30px_rgba(0,0,0,0.8)] border-l-4 border-l-white/10 flex flex-col items-center p-4 text-center justify-between"
                        style={{
                            borderTop: `2px solid ${currentBook.theme_color}`,
                            borderBottom: `2px solid ${currentBook.theme_color}`,
                            borderRight: `2px solid ${currentBook.theme_color}`,
                            background: `linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)`,
                            boxShadow: `0 0 30px ${currentBook.theme_color}20`
                        }}
                    >
                        {/* Cover Texture */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-40 mix-blend-overlay"></div>
                        
                        {/* Corners */}
                        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r" style={{ borderColor: currentBook.theme_color }}></div>
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r" style={{ borderColor: currentBook.theme_color }}></div>

                        {/* Title Section */}
                        <div className="relative z-10 mt-4">
                            <div className="font-mystic text-[10px] opacity-60 uppercase tracking-widest mb-1" style={{ color: currentBook.theme_color }}>
                                {currentBook.sub_title}
                            </div>
                            <h2 className="font-serif text-2xl font-bold text-parchment tracking-wide mb-2">
                                {currentBook.title}
                            </h2>
                            <div className="w-full h-[1px] opacity-30 mx-auto w-16" style={{ backgroundColor: currentBook.theme_color }}></div>
                        </div>

                        {/* Icon */}
                        <div className="relative z-10 text-5xl filter drop-shadow-md my-4">
                            {currentBook.icon}
                        </div>

                        {/* Footer Stats */}
                        <div className="relative z-10 w-full flex justify-between items-center text-[9px] text-white/40 uppercase tracking-widest border-t border-white/5 pt-2">
                            <span>Lv.{currentBook.difficulty_level}</span>
                            <span style={{ color: currentBook.theme_color }}>{currentBook.word_count} Words</span>
                        </div>
                    </div>

                    {/* BOOK SPINE (3D Effect) */}
                    <div 
                        className="absolute top-0 bottom-0 -left-3 w-4 bg-[#111] rounded-l-sm transform origin-right rotate-y-[-90deg] flex flex-col items-center justify-center border-l border-white/5"
                        style={{ backgroundColor: currentBook.theme_color, filter: 'brightness(0.5)' }}
                    >
                         <div className="w-[1px] h-full bg-white/20"></div>
                    </div>

                    {/* BOOK PAGES (3D Effect) */}
                    <div className="absolute top-1 bottom-1 right-0 w-3 bg-[#e3dac9] transform origin-left rotate-y-[90deg] rounded-sm bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')] bg-[length:4px_4px]"></div>
                </div>

                {/* BOOK DESCRIPTION */}
                <div className="w-full max-w-xs mt-10 p-4 bg-black/40 backdrop-blur-sm border border-white/5 rounded-lg text-center animate-fade-in min-h-[100px] flex items-center justify-center">
                    <p className="font-serif text-sm text-parchment/80 italic leading-relaxed">
                        "{currentBook.description}"
                    </p>
                </div>

            </div>

            {/* SELECTION CAROUSEL (Mini-Nav) */}
            <div className="z-20 w-full flex justify-center gap-2 mb-4">
                {activeBooks.map((book) => (
                    <button 
                        key={book.id}
                        onClick={() => setSelectedBookId(book.id)}
                        className={`w-2 h-2 rounded-full transition-all ${selectedBookId === book.id ? 'bg-gold w-4' : 'bg-white/20'}`}
                    />
                ))}
            </div>

            {/* BIND BUTTON */}
            <div className="z-20 w-full px-8 pb-10">
                <button
                    onClick={handleBind}
                    disabled={isBinding}
                    className="w-full group relative py-4 bg-transparent border border-gold/30 rounded-lg overflow-hidden transition-all hover:border-gold hover:shadow-[0_0_20px_rgba(197,160,89,0.3)] active:scale-95"
                >
                    <div className="absolute inset-0 bg-gold/5 group-hover:bg-gold/10 transition-colors"></div>
                    
                    {/* Magical Circle SVG behind text */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-20 transition-opacity duration-700">
                        <div className="w-24 h-24 border border-gold rounded-full animate-[spin_4s_linear_infinite]"></div>
                    </div>

                    <span className="relative z-10 font-mystic text-gold text-lg uppercase tracking-[0.3em] group-hover:text-white transition-colors">
                        {isBinding ? 'Sealing Pact...' : 'Bind Soul'}
                    </span>
                </button>
            </div>

        </div>
    );
};

export default Bookshelf;