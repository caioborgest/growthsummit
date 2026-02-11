import { Header } from './Header';
import { Footer } from './Footer';
import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="min-h-screen bg-dark text-white">
      <Header />
      <main className="pt-18 lg:pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
