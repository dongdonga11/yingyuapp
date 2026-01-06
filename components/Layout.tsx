import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  themeColor?: string; // Optional hex override
}

const Layout: React.FC<LayoutProps> = ({ children, themeColor }) => {
  // If no specific theme color, default to Gold (#C5A059)
  const accentColor = themeColor || '#C5A059';

  return (
    <div 
        className="h-[100dvh] bg-midnight text-parchment font-sans flex flex-col items-center overflow-hidden selection:bg-gold selection:text-midnight transition-colors duration-1000"
        style={{ '--theme-accent': accentColor } as React.CSSProperties}
    >
      {/* Top Navbar */}
      <header className="w-full max-w-md px-6 py-4 flex-none flex justify-between items-center z-10 border-b border-white/5 bg-midnight/80 backdrop-blur-sm transition-colors duration-500"
        style={{ borderColor: `${accentColor}20` }}
      >
        <div className="flex items-center gap-3">
             {/* Logo Icon: Ouroboros concept */}
            <div 
                className="w-8 h-8 rounded-full border border-current flex items-center justify-center shadow-[0_0_15px_rgba(var(--theme-accent),0.3)] transition-colors duration-500"
                style={{ color: accentColor, borderColor: `${accentColor}80`, boxShadow: `0 0 15px ${accentColor}40` }}
            >
                <span className="font-mystic text-lg pt-1">L</span>
            </div>
            <h1 
                className="font-mystic text-xl tracking-widest transition-colors duration-500"
                style={{ color: accentColor, textShadow: `0 0 10px ${accentColor}40` }}
            >
                LOGOS
            </h1>
        </div>
        <div 
            className="text-[10px] uppercase tracking-[0.2em] border px-2 py-1 rounded transition-colors duration-500"
            style={{ color: `${accentColor}99`, borderColor: `${accentColor}30` }}
        >
            The Oracle
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-md flex-1 flex flex-col relative overflow-hidden">
        {children}
      </main>
      
      {/* Ambient Noise/Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-noise z-50 mix-blend-overlay"></div>
      
      {/* Mystic Background Glows - Dynamic Color */}
      <div 
        className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none -z-10 transition-colors duration-1000 ease-in-out"
        style={{ backgroundColor: `${accentColor}10` }}
      ></div>
    </div>
  );
};

export default Layout;