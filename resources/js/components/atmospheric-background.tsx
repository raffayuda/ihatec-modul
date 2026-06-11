import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// Type Definitions
// ============================================================

interface CloudDef {
    id: number;
    x: number; // left %
    y: number; // top %
    scale: number;
    opacity: number;
    speed: number; // seconds per cycle
    delay: number;
    reverse: boolean;
}

interface StarDef {
    id: number;
    x: number;
    y: number;
    size: number; // px
    opacity: number;
    duration: number; // twinkle cycle (seconds)
    delay: number;
}

interface ShootingStarDef {
    id: number;
    startX: number; // left %
    startY: number; // top %
    angle: number; // degrees
    length: number; // px
    duration: number; // seconds
    interval: number; // seconds between repeats
    initialDelay: number;
}

// ============================================================
// Cloud Definitions (Light Mode)
// ============================================================

const cloudDefs: CloudDef[] = [
    { id: 1, x: 5, y: 6, scale: 1.3, opacity: 0.55, speed: 28, delay: 0, reverse: false },
    { id: 2, x: 48, y: 2, scale: 1.05, opacity: 0.45, speed: 32, delay: 3.5, reverse: true },
    { id: 3, x: 75, y: 12, scale: 0.7, opacity: 0.35, speed: 22, delay: 1.2, reverse: false },
    { id: 4, x: 18, y: 18, scale: 0.85, opacity: 0.4, speed: 26, delay: 5, reverse: true },
    { id: 5, x: 38, y: 8, scale: 1.15, opacity: 0.5, speed: 24, delay: 2, reverse: false },
    { id: 6, x: 82, y: 4, scale: 0.55, opacity: 0.3, speed: 19, delay: 4, reverse: true },
    { id: 7, x: 62, y: 16, scale: 0.75, opacity: 0.38, speed: 21, delay: 1.8, reverse: false },
];

// ============================================================
// Shooting Star Definitions (Dark Mode)
// ============================================================

const shootingStarDefs: ShootingStarDef[] = [
    { id: 1, startX: 70, startY: 3, angle: 38, length: 140, duration: 1.4, interval: 9, initialDelay: 2 },
    { id: 2, startX: 85, startY: 8, angle: 50, length: 110, duration: 1.1, interval: 13, initialDelay: 6 },
    { id: 3, startX: 35, startY: 1, angle: 32, length: 160, duration: 1.7, interval: 11, initialDelay: 9 },
];

// ============================================================
// Sub-Components
// ============================================================

/**
 * A single fluffy cloud built from overlapping blurred circles.
 * Drifts horizontally with a smooth framer-motion animation.
 */
function Cloud({ x, y, scale, opacity, speed, delay, reverse }: CloudDef) {
    const startX = reverse ? '12%' : '-12%';
    const endX = reverse ? '-12%' : '12%';

    return (
        <motion.div
            className="pointer-events-none absolute select-none"
            style={{ left: `${x}%`, top: `${y}%` }}
            initial={{ x: startX }}
            animate={{ x: endX }}
            transition={{
                duration: speed,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
                delay,
            }}
        >
            <div className="relative" style={{ opacity, transform: `scale(${scale})` }}>
                {/* Core cloud body */}
                <div className="absolute h-28 w-44 -translate-x-1/2 -translate-y-1/2 rounded-[45%] bg-gradient-to-b from-white/75 to-white/15 blur-2xl" />
                {/* Left bump */}
                <div className="absolute h-20 w-28 -translate-x-[80%] -translate-y-[60%] rounded-[50%] bg-white/55 blur-xl" />
                {/* Right bump */}
                <div className="absolute h-24 w-32 translate-x-[30%] -translate-y-[70%] rounded-[48%] bg-white/50 blur-xl" />
                {/* Top center bump */}
                <div className="absolute h-16 w-24 -translate-x-[10%] -translate-y-[105%] rounded-[52%] bg-white/60 blur-lg" />
            </div>
        </motion.div>
    );
}

/**
 * A single twinkling star using CSS animation for performance (no framer-motion overhead).
 */
function Star({ x, y, size, opacity, duration, delay }: StarDef) {
    return (
        <div
            className="pointer-events-none absolute rounded-full bg-white"
            style={{
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size,
                opacity,
                animation: `twinkle ${duration}s ease-in-out ${delay}s infinite`,
                boxShadow: size > 2 ? `0 0 ${size * 2}px rgba(200,220,255,0.4)` : 'none',
            }}
        />
    );
}

/**
 * A shooting star that periodically streaks across the sky.
 */
function ShootingStar({ startX, startY, angle, length, duration, interval, initialDelay }: ShootingStarDef) {
    return (
        <motion.div
            className="pointer-events-none absolute"
            style={{
                left: `${startX}%`,
                top: `${startY}%`,
                width: length,
                height: 2,
                transform: `rotate(${angle}deg)`,
                transformOrigin: '0 0',
            }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{
                opacity: [0, 1, 1, 0],
                scaleX: [0, 1, 1, 0],
            }}
            transition={{
                duration,
                repeat: Infinity,
                repeatDelay: interval,
                delay: initialDelay,
                ease: 'easeInOut',
                times: [0, 0.15, 0.7, 1],
            }}
        >
            <div
                className="h-full w-full rounded-full"
                style={{
                    background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.9) 40%, rgba(220,230,255,0.6) 100%)',
                }}
            />
        </motion.div>
    );
}

/**
 * Warm sun glow positioned in the top-right during light mode.
 */
function SunGlow() {
    return (
        <motion.div
            className="pointer-events-none absolute -top-20 right-0 h-[400px] w-[400px] rounded-full opacity-60"
            style={{
                background: 'radial-gradient(circle, rgba(255,210,120,0.35) 0%, rgba(255,180,60,0.12) 35%, transparent 70%)',
            }}
            animate={{ opacity: [0.5, 0.65, 0.5], scale: [1, 1.04, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
    );
}

/**
 * Crescent moon with a soft glow halo, for dark mode.
 */
function MoonGlow() {
    return (
        <motion.div
            className="pointer-events-none absolute right-[8%] top-[5%]"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
            {/* Soft glow halo */}
            <div className="absolute -inset-8 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute -inset-4 rounded-full bg-blue-200/10 blur-xl" />

            {/* Crescent moon SVG */}
            <svg
                viewBox="0 0 100 100"
                className="relative h-16 w-16 drop-shadow-[0_0_18px_rgba(180,200,255,0.25)]"
            >
                <motion.path
                    d="M 58 10 C 75 12, 90 30, 88 50 C 86 70, 72 88, 55 90 C 62 78, 66 62, 65 50 C 64 38, 60 22, 58 10 Z"
                    fill="rgba(240,245,255,0.9)"
                    animate={{ opacity: [0.8, 0.95, 0.8] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
            </svg>
        </motion.div>
    );
}

// ============================================================
// Main Atmospheric Background Component
// ============================================================

export function AtmosphericBackground() {
    const [isDark, setIsDark] = useState(false);
    const [starField, setStarField] = useState<StarDef[]>([]);

    // ── Detect dark mode via MutationObserver (matches motion-theme-toggle pattern) ──
    useEffect(() => {
        const checkDark = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        checkDark();
        const observer = new MutationObserver(checkDark);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // ── Generate star field once on mount (client-side only, avoids SSR mismatch) ──
    useEffect(() => {
        const stars: StarDef[] = [];
        for (let i = 0; i < 70; i++) {
            stars.push({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 55,
                size: 1 + Math.random() * 2.5,
                opacity: 0.25 + Math.random() * 0.6,
                duration: 1.5 + Math.random() * 3.5,
                delay: Math.random() * 6,
            });
        }
        setStarField(stars);
    }, []);

    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {/* ═══════ LIGHT MODE: Clouds + Sun ═══════ */}
            {!isDark && (
                <>
                    {/* Sun glow */}
                    <SunGlow />

                    {/* Secondary smaller sun highlight */}
                    <div className="pointer-events-none absolute -top-10 left-[65%] h-[250px] w-[250px] rounded-full opacity-30"
                        style={{ background: 'radial-gradient(circle, rgba(255,240,200,0.4) 0%, transparent 70%)' }}
                    />

                    {/* Light rays emanating from top-right */}
                    <div
                        className="pointer-events-none absolute -top-40 right-[5%] h-[500px] w-[600px] opacity-[0.07]"
                        style={{
                            background: `
                                conic-gradient(
                                    from 200deg at 85% 15%,
                                    transparent 0deg,
                                    rgba(255,255,255,0.8) 2deg,
                                    transparent 4deg,
                                    transparent 18deg,
                                    rgba(255,255,255,0.6) 20deg,
                                    transparent 22deg,
                                    transparent 36deg,
                                    rgba(255,255,255,0.7) 38deg,
                                    transparent 40deg,
                                    transparent 54deg,
                                    rgba(255,255,255,0.5) 56deg,
                                    transparent 58deg,
                                    transparent 360deg
                                )
                            `,
                        }}
                    />

                    {/* Clouds */}
                    {cloudDefs.map((cloud) => (
                        <Cloud key={cloud.id} {...cloud} />
                    ))}
                </>
            )}

            {/* ═══════ DARK MODE: Stars + Moon + Shooting Stars ═══════ */}
            {isDark && (
                <>
                    {/* Moon */}
                    <MoonGlow />

                    {/* Nebula-like soft color patches */}
                    <div className="pointer-events-none absolute left-[10%] top-[5%] h-[300px] w-[300px] rounded-full bg-indigo-500/5 blur-3xl" />
                    <div className="pointer-events-none absolute right-[20%] top-[20%] h-[200px] w-[200px] rounded-full bg-purple-600/4 blur-3xl" />

                    {/* Star field */}
                    {starField.map((star) => (
                        <Star key={star.id} {...star} />
                    ))}

                    {/* Shooting stars */}
                    {shootingStarDefs.map((ss) => (
                        <ShootingStar key={ss.id} {...ss} />
                    ))}
                </>
            )}

            {/* ═══════ Shared: subtle floating particles ═══════ */}
            <div
                className={`pointer-events-none absolute inset-0 ${
                    isDark ? 'opacity-[0.06]' : 'opacity-[0.04]'
                }`}
                style={{
                    backgroundImage: `radial-gradient(circle at 25% 35%, ${isDark ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,1)'} 0.5px, transparent 0.5px),
                        radial-gradient(circle at 60% 15%, ${isDark ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,1)'} 0.8px, transparent 0.8px),
                        radial-gradient(circle at 80% 40%, ${isDark ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,1)'} 0.4px, transparent 0.4px),
                        radial-gradient(circle at 15% 60%, ${isDark ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,1)'} 0.6px, transparent 0.6px),
                        radial-gradient(circle at 45% 50%, ${isDark ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,1)'} 0.5px, transparent 0.5px),
                        radial-gradient(circle at 70% 55%, ${isDark ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,1)'} 0.7px, transparent 0.7px)`,
                    backgroundSize: '200px 200px, 180px 180px, 220px 220px, 190px 190px, 210px 210px, 230px 230px',
                    backgroundPosition: '0 0, 50px 30px, 100px 10px, -20px 40px, 70px -10px, 40px 20px',
                }}
            />
        </div>
    );
}