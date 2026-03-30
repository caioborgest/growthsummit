import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

interface BottomNavigationProps {
  tabs: NavItem[];
  activeTab: string;
  setActiveTab: (id: string) => void;
  variant?: 'teal' | 'orange';
}

export function BottomNavigation({ tabs, activeTab, setActiveTab, variant = 'orange' }: BottomNavigationProps) {
  const activeColor = variant === 'teal' ? 'text-teal-400' : 'text-orange-500';
  const activeBg = variant === 'teal' ? 'bg-teal-500/10' : 'bg-orange-500/10';
  const activeGlow = variant === 'teal' ? 'drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]' : 'drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]';

  return (
    <div className="fixed md:hidden bottom-0 left-0 right-0 z-40 px-4 pb-8 pointer-events-none">
      <div className="mx-auto pointer-events-auto w-full max-w-lg">
        <div className="bg-dark-200/90 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex items-center p-1.5 relative overflow-x-auto scrollbar-none snap-x snap-mandatory">
          <div className="flex items-center justify-between w-full min-w-max px-2">
            {tabs.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex flex-col items-center justify-center py-2 px-1 min-w-[56px] transition-all duration-500 snap-center ${isActive ? activeColor : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId={`nav-active-pill-${variant}`}
                      className={`absolute inset-0 ${activeBg} rounded-2xl -z-10`}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <item.icon className={`h-5 w-5 mb-1 ${isActive ? `scale-110 ${activeGlow}` : 'scale-100'}`} />
                  <span className={`text-[7px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
