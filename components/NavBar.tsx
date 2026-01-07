import React from 'react';
import { AppState } from '../types';

interface NavBarProps {
    currentTab: 'oracle' | 'grimoire' | 'profile';
    onChange: (tab: 'oracle' | 'grimoire' | 'profile') => void;
}

const NavBar: React.FC<NavBarProps> = ({ currentTab, onChange }) => {
    
    const tabs = [
        {
            id: 'oracle',
            label: 'Oracle',
            icon: '👁️',
        },
        {
            id: 'grimoire',
            label: 'Grimoire',
            icon: '📖',
        },
        {
            id: 'profile',
            label: 'Soul',
            icon: '🔥',
        }
    ] as const;

    return (
        <div className="absolute bottom-0 left-0 right-0 h-16 z-[90] flex justify-center items-end pb-1 pointer-events-none">
            {/* Background Gradient fade out */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none"></div>

            <div className="flex gap-6 pointer-events-auto relative z-10 px-4 pb-1">
                {tabs.map((tab) => {
                    const isActive = currentTab === tab.id;
                    
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            className={`
                                group relative flex flex-col items-center justify-end w-14 h-16 transition-all duration-500 ease-out
                                ${isActive ? '-translate-y-2' : 'translate-y-1 opacity-60 hover:opacity-100 hover:translate-y-0'}
                            `}
                        >
                            {/* The "Card" Shape Background */}
                            <div 
                                className={`
                                    absolute inset-x-0 bottom-0 top-1 rounded-t-lg border-t border-x border-gold/30 bg-[#0F111A] transition-all duration-500
                                    ${isActive 
                                        ? 'shadow-[0_-5px_15px_rgba(197,160,89,0.3)] border-gold' 
                                        : 'shadow-none border-transparent bg-transparent'
                                    }
                                `}
                            >
                                {/* Active Indicator Glow inside card */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-b from-gold/10 to-transparent rounded-t-lg animate-pulse"></div>
                                )}
                            </div>

                            {/* Icon Container */}
                            <div 
                                className={`
                                    relative z-10 text-xl mb-1 transition-all duration-500 transform
                                    ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(197,160,89,0.8)]' : 'scale-90 grayscale'}
                                `}
                            >
                                {tab.icon}
                            </div>

                            {/* Label */}
                            <span 
                                className={`
                                    relative z-10 font-mystic text-[8px] tracking-[0.2em] uppercase transition-all duration-300
                                    ${isActive ? 'text-gold opacity-100 mb-2' : 'text-white/40 opacity-0 group-hover:opacity-100 group-hover:mb-1'}
                                `}
                            >
                                {tab.label}
                            </span>
                            
                            {/* Mystic Floating Particle (Active Only) */}
                            {isActive && (
                                <div className="absolute -top-0.5 w-1 h-1 bg-gold rounded-full animate-[ping_2s_infinite]"></div>
                            )}

                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default NavBar;