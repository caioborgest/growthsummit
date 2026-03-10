import { Header } from './Header';
import { Footer } from './Footer';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function Layout() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/' || 
                        location.pathname.includes('growth-experience-triunfo') || 
                        location.pathname.includes('growth-experience-petrolina') ||
                        location.pathname.includes('sobre');

  return (
    <div className="min-h-screen bg-dark text-white overflow-x-hidden">
      <Header />
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
    </div>
  );
}
