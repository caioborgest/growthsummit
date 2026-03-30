import { motion, AnimatePresence } from 'framer-motion';
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
  return (
    <div className="fixed md:hidden bottom-0 left-0 right-0 z-40 pointer-events-none pb-[env(safe-area-inset-bottom)]">
      <div className="px-4 pb-4 flex justify-center pointer-events-auto">
        <div
          className="flex items-center p-1.5 gap-0.5 rounded-[2rem] overflow-x-auto scrollbar-none snap-x snap-mandatory"
          style={{
            background: 'rgba(10, 12, 18, 0.85)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.04)',
          }}
        >
          {tabs.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="relative flex flex-col items-center justify-center py-2.5 px-3 min-w-[60px] snap-center transition-all duration-300"
                style={{ minHeight: 48 }}
              >
                {/* Active pill background */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-[1.5rem]"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,112,67,0.2), rgba(255,64,53,0.12))',
                        border: '1px solid rgba(255,112,67,0.25)',
                      }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                </AnimatePresence>

                {/* Icon */}
                <motion.div
                  animate={isActive ? { scale: 1.15, y: -1 } : { scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="relative z-10 mb-1"
                >
                  <item.icon
                    className="h-5 w-5 transition-all duration-300"
                    style={{
                      color: isActive ? '#ff7043' : 'rgba(255,255,255,0.35)',
                      filter: isActive ? 'drop-shadow(0 0 8px rgba(255,112,67,0.6))' : 'none',
                    }}
                  />
                </motion.div>

                {/* Label */}
                <motion.span
                  animate={{ opacity: isActive ? 1 : 0.45 }}
                  className="relative z-10 font-black uppercase leading-none"
                  style={{
                    fontSize: '7px',
                    letterSpacing: '0.05em',
                    color: isActive ? '#ff7043' : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {item.label}
                </motion.span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
