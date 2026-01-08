import React, { useEffect, useRef } from 'react';

interface RitualCanvasProps {
    target: { x: number, y: number }; // Normalized center (usually 0.5, 0.5)
    color: string;
    mode: 'idle' | 'implode'; // 'implode' sucks particles INTO the center
}

interface Particle {
    x: number;
    y: number;
    size: number;
    char: string; // Rune character
    
    // Physics
    angle: number;
    radius: number;
    speed: number;
    rotation: number;
    
    // Appearance
    alpha: number;
}

const RUNES = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ";

const RitualCanvas: React.FC<RitualCanvasProps> = ({ target, color, mode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const requestRef = useRef<number>();
    
    // Hex to RGB helper
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 197, g: 160, b: 89 };
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const animate = () => {
            if (!canvas || !ctx) return;
            
            // Clear
            ctx.fillStyle = 'rgba(5, 5, 8, 0.25)'; // Clear trails
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'lighter'; // Glow effect

            const rgb = hexToRgb(color);
            const centerX = target.x * canvas.width;
            const centerY = target.y * canvas.height;
            const maxRadius = Math.max(canvas.width, canvas.height) / 1.5;

            // --- SPAWN LOGIC ---
            if (mode === 'idle') {
                // Gentle floating dust around the ring
                if (particles.current.length < 150) {
                    const angle = Math.random() * Math.PI * 2;
                    const r = 180 + Math.random() * 100; // Ring orbit
                    particles.current.push({
                        x: centerX + Math.cos(angle) * r,
                        y: centerY + Math.sin(angle) * r,
                        angle,
                        radius: r,
                        size: Math.random() * 10 + 10,
                        char: '.', // Just dots in idle
                        speed: 0.002,
                        rotation: 0,
                        alpha: 0
                    });
                }
            } else if (mode === 'implode') {
                // High speed RUNES sucking in
                for(let i=0; i<4; i++) { // Spawn rate
                    const angle = Math.random() * Math.PI * 2;
                    const r = maxRadius; // Start at edge
                    particles.current.push({
                        x: centerX + Math.cos(angle) * r,
                        y: centerY + Math.sin(angle) * r,
                        angle,
                        radius: r,
                        size: Math.random() * 15 + 10,
                        char: RUNES.charAt(Math.floor(Math.random() * RUNES.length)),
                        speed: 0.03 + Math.random() * 0.02, // Initial speed
                        rotation: Math.random() * Math.PI * 2,
                        alpha: 0
                    });
                }
            }

            // --- UPDATE & DRAW ---
            for (let i = particles.current.length - 1; i >= 0; i--) {
                const p = particles.current[i];
                
                if (mode === 'idle') {
                    // Slow Orbit
                    p.angle += p.speed;
                    p.alpha = Math.min(p.alpha + 0.02, 0.5); // Fade in
                    p.radius += Math.sin(p.angle * 5) * 0.5; // Wobble

                    p.x = centerX + Math.cos(p.angle) * p.radius;
                    p.y = centerY + Math.sin(p.angle) * p.radius;
                    
                    // Render Dot
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 1, 0, Math.PI*2);
                    ctx.fillStyle = `rgba(197, 160, 89, ${p.alpha})`;
                    ctx.fill();
                    
                    if (Math.random() > 0.99) particles.current.splice(i, 1); // Recycle

                } else if (mode === 'implode') {
                    // Spiral Inwards with Acceleration
                    p.angle += 0.05; // Spiral spin
                    p.speed *= 1.05; // Accelerate as it gets closer
                    p.radius -= (p.radius * p.speed); // Move in
                    p.rotation += 0.1; // Self rotate
                    
                    p.alpha = Math.min(p.alpha + 0.1, 1);
                    
                    p.x = centerX + Math.cos(p.angle) * p.radius;
                    p.y = centerY + Math.sin(p.angle) * p.radius;

                    // Render Rune
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation);
                    ctx.font = `${p.size}px serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.alpha})`;
                    ctx.fillText(p.char, 0, 0);
                    ctx.restore();
                    
                    // Kill when close to center (absorbed)
                    if (p.radius < 40) {
                        particles.current.splice(i, 1);
                    }
                }
            }

            ctx.globalCompositeOperation = 'source-over';
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [target, color, mode]);

    return (
        <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />
    );
};

export default RitualCanvas;