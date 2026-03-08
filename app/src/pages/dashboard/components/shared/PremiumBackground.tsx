import React from 'react';

export function PremiumBackground() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
            {/* Glow background effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 blur-[120px] rounded-full -mr-64 -mt-64"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/10 blur-[120px] rounded-full -ml-64 -mb-64"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-orange-coral/[0.03] blur-[150px] rounded-full"></div>
        </div>
    );
}
