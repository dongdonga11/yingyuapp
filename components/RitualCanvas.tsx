import React, { useEffect, useRef } from 'react';

interface RitualCanvasProps {
    target: { x: number, y: number } | null; // Normalized 0-1 coordinates
    // We ignore the 'color' prop now to enforce the Golden Stardust aesthetic as requested.
    mode: 'idle' | 'congregate'; // Behavior state
}

interface Particle {
    x: number;
    y: number;
    z: number; // Depth
    
    // Physics State
    baseX: number; // Original position for noise calc
    baseY: number;
    driftSpeed: number;
    driftAngle: number;
    
    // Appearance
    color: { r: number, g: number, b: number };
    baseSize: number;
    alphaBase: number; // Base brightness
    pulseOffset: number;
    pulseSpeed: number;
    
    // Vortex State
    angle: number;
    radius: number;
    angularVelocity: number;
}

const GOLD_PALETTE = [
    { r: 255, g: 255, b: 255 }, // White Gold (Sparkle)
    { r: 252, g: 211, b: 77 },  // Light Amber
    { r: 245, g: 158, b: 11 },  // Deep Amber
    { r: 197, g: 160, b: 89 },  // Classic Parchment Gold
    { r: 255, g: 215, b: 0 },   // Pure Gold
];

const RitualCanvas: React.FC<RitualCanvasProps> = ({ target, mode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const requestRef = useRef<number>();
    const timeRef = useRef(0);

    const initParticles = (width: number, height: number) => {
        const p: Particle[] = [];
        // Increase count for a denser "dust" feel
        const count = width < 768 ? 600 : 1200; 
        
        for (let i = 0; i < count; i++) {
            // Pick a random gold color
            const color = GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)];
            
            p.push({
                x: (Math.random() - 0.5) * width * 1.5,
                y: (Math.random() - 0.5) * height * 1.5,
                z: Math.random() * 2000, // Deep depth field
                
                baseX: (Math.random() - 0.5) * width * 1.5,
                baseY: (Math.random() - 0.5) * height * 1.5,
                driftSpeed: Math.random() * 0.5 + 0.1,
                driftAngle: Math.random() * Math.PI * 2,
                
                // Varied sizes: Lots of tiny dust, few large bokeh flares
                baseSize: Math.random() > 0.9 ? Math.random() * 3 + 2 : Math.random() * 1.5 + 0.5,
                
                color: color,
                alphaBase: Math.random() * 0.8 + 0.2,
                pulseOffset: Math.random() * Math.PI * 2,
                pulseSpeed: 0.02 + Math.random() * 0.03,
                
                angle: 0,
                radius: 0,
                angularVelocity: 0
            });
        }
        return p;
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

        if (particles.current.length === 0) {
            particles.current = initParticles(canvas.width, canvas.height);
        }

        const animate = () => {
            if (!canvas || !ctx) return;
            timeRef.current += 0.01;

            // Deep space background clear
            ctx.fillStyle = '#050508'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Magical Glow Blend Mode
            ctx.globalCompositeOperation = 'lighter';

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const focalLength = 800;
            const targetX = target ? (target.x * canvas.width) - centerX : 0;
            const targetY = target ? (target.y * canvas.height) - centerY : 0;

            particles.current.forEach(p => {
                
                if (mode === 'idle') {
                    // --- IDLE: ORGANIC TURBULENCE ---
                    // Simulate floating dust using Perlin-like noise (Sum of Sines)
                    
                    // Complex wave motion
                    const noiseX = Math.sin(timeRef.current * p.driftSpeed + p.baseY * 0.005);
                    const noiseY = Math.cos(timeRef.current * p.driftSpeed * 0.8 + p.baseX * 0.005);
                    
                    p.x += noiseX * 0.5;
                    p.y += noiseY * 0.5 - 0.2; // Slight upward drift (heat rises)
                    
                    // Gentle Z drift
                    p.z -= 0.5; 
                    if (p.z < -500) p.z = 2000; // Loop z-axis

                    // Wrap X/Y if they drift too far
                    if (p.x > canvas.width) p.x = -canvas.width;
                    if (p.x < -canvas.width) p.x = canvas.width;
                    if (p.y > canvas.height) p.y = -canvas.height;
                    if (p.y < -canvas.height) p.y = canvas.height;

                } else if (mode === 'congregate') {
                    // --- CONGREGATE: VIOLENT VORTEX ---
                    
                    if (p.radius === 0) {
                        // Init vortex
                        const dx = p.x - targetX;
                        const dy = p.y - targetY;
                        p.radius = Math.sqrt(dx*dx + dy*dy);
                        p.angle = Math.atan2(dy, dx);
                        // Random speed for chaos
                        p.angularVelocity = 0.05 + (Math.random() * 0.08); 
                    }

                    // Physics
                    p.angularVelocity *= 1.03; // Accelerate
                    p.angle += p.angularVelocity;
                    p.radius *= 0.92; // Tighten spiral
                    
                    // Spiral calculation
                    const jitter = (Math.random() - 0.5) * (p.radius * 0.1); // Add chaos
                    p.x = targetX + Math.cos(p.angle) * (p.radius + jitter);
                    p.y = targetY + Math.sin(p.angle) * (p.radius + jitter);
                    
                    // Suck into screen plane
                    p.z = p.z * 0.9;
                } else {
                    p.radius = 0;
                }

                // --- RENDER ---
                const scale = focalLength / (focalLength + p.z);
                const screenX = centerX + p.x * scale;
                const screenY = centerY + p.y * scale;

                // Cull out of bounds
                if (p.z > -focalLength && screenX > -50 && screenX < canvas.width + 50 && screenY > -50 && screenY < canvas.height + 50) {
                    
                    // Twinkle logic
                    const pulse = Math.sin(timeRef.current * 2 + p.pulseOffset);
                    // Depth cue: Far particles are dimmer
                    const depthAlpha = Math.min(1, Math.max(0.1, scale * 1.5)); 
                    const alpha = p.alphaBase * depthAlpha * (0.8 + pulse * 0.2);

                    const size = p.baseSize * scale;

                    ctx.beginPath();
                    ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
                    ctx.fill();

                    // Optional: Blur/Glow for large, close particles (Bokeh)
                    if (size > 3) {
                         ctx.shadowBlur = 10;
                         ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.5)`;
                         ctx.fill();
                         ctx.shadowBlur = 0;
                    }
                }
            });

            ctx.globalCompositeOperation = 'source-over';
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [target, mode]);

    return (
        <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />
    );
};

export default RitualCanvas;