import React, { useEffect, useRef } from 'react';

interface RitualCanvasProps {
    source: { x: number, y: number } | null; // Normalized 0-1 (The Orb position)
    target: { x: number, y: number }; // Normalized 0-1 (The Center/Array)
    color: string;
    mode: 'idle' | 'stream';
}

interface Particle {
    x: number;
    y: number;
    size: number;
    speed: number;
    life: number;
    maxLife: number;
    
    // Stream logic
    vx: number;
    vy: number;
    
    // Orbit logic
    angle: number;
    radius: number;
}

const RitualCanvas: React.FC<RitualCanvasProps> = ({ source, target, color, mode }) => {
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
            
            // Clear with heavy trail effect for the stream
            ctx.fillStyle = 'rgba(5, 5, 8, 0.2)'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'lighter';

            const rgb = hexToRgb(color);
            const centerX = target.x * canvas.width;
            const centerY = target.y * canvas.height;

            // --- SPAWN LOGIC ---
            if (mode === 'idle') {
                // Spawn particles on the RING
                if (particles.current.length < 200) {
                    const angle = Math.random() * Math.PI * 2;
                    // Radius roughly matches the magic circle size (approx 150px-250px)
                    const radius = 150 + Math.random() * 50; 
                    particles.current.push({
                        x: centerX + Math.cos(angle) * radius,
                        y: centerY + Math.sin(angle) * radius,
                        size: Math.random() * 1.5 + 0.5,
                        speed: (Math.random() - 0.5) * 0.01,
                        life: 0,
                        maxLife: 100 + Math.random() * 100,
                        vx: 0, vy: 0,
                        angle: angle,
                        radius: radius
                    });
                }
            } else if (mode === 'stream' && source) {
                // Spawn high density particles at SOURCE Orb
                const sourceX = source.x * canvas.width;
                const sourceY = source.y * canvas.height;
                
                // Emit 5 particles per frame for density
                for(let i=0; i<5; i++) {
                    particles.current.push({
                        x: sourceX + (Math.random() - 0.5) * 40, // Source width jitter
                        y: sourceY + (Math.random() - 0.5) * 40,
                        size: Math.random() * 2 + 1,
                        speed: Math.random() * 0.05 + 0.02, // Travel speed
                        life: 0,
                        maxLife: 60, // Short life, fast travel
                        vx: 0, vy: 0,
                        angle: 0, radius: 0
                    });
                }
            }

            // --- UPDATE & DRAW ---
            for (let i = particles.current.length - 1; i >= 0; i--) {
                const p = particles.current[i];
                
                if (mode === 'idle') {
                    // Orbit Logic
                    p.angle += 0.005; // Slow rotation
                    p.x = centerX + Math.cos(p.angle) * p.radius;
                    p.y = centerY + Math.sin(p.angle) * p.radius;
                    
                    // Simple shimmer
                    p.life++;
                    const alpha = (Math.sin(p.life * 0.05) + 1) / 2 * 0.5;
                    
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(197, 160, 89, ${alpha})`; // Always gold in idle
                    ctx.fill();

                } else if (mode === 'stream') {
                    // Flow Logic: Source -> Center
                    // We calculate vector to center
                    const dx = centerX - p.x;
                    const dy = centerY - p.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    
                    if (dist < 10) {
                        // Reached center - Die
                        particles.current.splice(i, 1);
                        continue;
                    }

                    // Move towards center with acceleration
                    p.x += dx * 0.08; 
                    p.y += dy * 0.08;
                    
                    // Add sine wave wiggle perpendicular to path
                    const perpX = -dy / dist;
                    const perpY = dx / dist;
                    const wave = Math.sin(p.life * 0.5) * 5;
                    p.x += perpX * wave;
                    p.y += perpY * wave;

                    p.life++;
                    
                    // Draw Stream
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`;
                    ctx.fill();
                    
                    // Trail line
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x - dx * 0.05, p.y - dy * 0.05);
                    ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
                    ctx.stroke();
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
    }, [source, target, color, mode]);

    return (
        <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />
    );
};

export default RitualCanvas;