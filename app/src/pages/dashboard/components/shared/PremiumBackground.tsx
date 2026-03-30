import React from 'react';
import { motion } from 'framer-motion';

export function PremiumBackground() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
            {/* Large ambient glows */}
            <div className="hero-glow absolute top-0 right-0 w-96 h-96 bg-brand-orange-coral/12 -mr-48 -mt-48" />
            <div className="hero-glow absolute bottom-0 left-0 w-80 h-80 bg-brand-orange-intense/8 -ml-40 -mb-40" />
            <div className="hero-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-orange-coral/[0.04]" />

            {/* Subtle grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,112,67,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,112,67,0.5) 1px, transparent 1px)',
                    backgroundSize: '48px 48px'
                }}
            />

            {/* Floating particles */}
            {[
                { top: '15%', left: '8%', size: 3, delay: 0 },
                { top: '25%', left: '82%', size: 2, delay: 1 },
                { top: '60%', left: '12%', size: 2, delay: 2 },
                { top: '75%', left: '75%', size: 3, delay: 0.5 },
                { top: '45%', left: '55%', size: 1.5, delay: 1.5 },
                { top: '85%', left: '35%', size: 2, delay: 2.5 },
            ].map((p, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-brand-orange-coral/30"
                    style={{
                        top: p.top,
                        left: p.left,
                        width: `${p.size * 4}px`,
                        height: `${p.size * 4}px`,
                    }}
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.2, 0.6, 0.2],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{
                        duration: 4 + i,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                />
            ))}
        </div>
    );
}
