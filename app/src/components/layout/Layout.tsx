import { Header } from './Header';
import { Footer } from './Footer';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { MobileQuickActions } from './MobileQuickActions';
import { colors } from '@/styles/designSystem';

export function Layout() {
  const location = useLocation();
  const online = useNetworkStatus();
  const isLandingPage = location.pathname === '/' || 
                        location.pathname.includes('growth-experience-triunfo') || 
                        location.pathname.includes('growth-experience-petrolina') ||
                        location.pathname.includes('sobre');

  return (
    <div className="min-h-screen bg-dark text-white overflow-x-hidden">
      <Header />
      {/* offline indicator */}
      {!online && (
        <div
          className="fixed top-16 inset-x-0 text-white text-center py-1 z-50"
          style={{ background: colors.error }}
        >
          Você está offline. Algumas funcionalidades podem ficar indisponíveis.
        </div>
      )}
      <main className={isLandingPage ? "" : "pt-18 lg:pt-20"}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <MobileQuickActions />
    </div>
  );
}
