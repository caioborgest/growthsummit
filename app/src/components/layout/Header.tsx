import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Sobre', href: '/sobre' },
  { name: 'Programação', href: '/programacao' },
  { name: 'Palestrantes', href: '/palestrantes' },
  { name: 'Inscrições', href: '/inscricoes' },
];

const moreLinks = [
  { name: 'Mentorias', href: '/mentorias' },
  { name: 'Rodada B2B', href: '/rodada-negocios' },
  { name: 'Startups', href: '/startups' },
  { name: 'Seja Patrocinador', href: '/seja-patrocinador' },
  { name: 'Growth Experience (Geral)', href: '/growth-experience' },
  { name: 'Growth Experience Triunfo-PE', href: '/growth-experience-triunfo' },
  { name: 'Growth Experience Petrolina-PE', href: '/growth-experience-petrolina' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Contato', href: '/contato' },
];

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'mentor': return '/mentor-area';
      case 'company': return '/empresa-area';
      case 'startup': return '/startup-area';
      case 'sponsor': return '/patrocinador-area';
      default: return '/minha-area';
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-dark/80 backdrop-blur-2xl border-b border-white/5 py-2'
        : 'bg-transparent py-4'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo Section */}
          <Link to="/" className="flex items-center group transition-transform duration-300 hover:scale-105">
            {location.pathname === '/growth-experience' || location.pathname === '/growth-experience-triunfo' ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-orange-coral flex items-center justify-center shadow-lg shadow-brand-orange-coral/20">
                  <span className="text-white font-black text-lg tracking-tighter">GX</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-white font-black text-lg leading-none block tracking-tight">Growth Experience</span>
                  <span className="text-brand-orange-coral text-[10px] block font-black uppercase tracking-[0.2em] mt-0.5">Triunfo 2026</span>
                </div>
              </div>
            ) : (
              <img
                src="https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/growthsummit-fundoescuro.png"
                alt="Growth Summit"
                className="h-9 lg:h-11 w-auto drop-shadow-[0_0_8px_rgba(255,112,67,0.2)]"
              />
            )}
          </Link>

          {/* Desktop Navigation Refined */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/5 rounded-2xl p-1 backdrop-blur-md">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${active
                    ? 'text-white bg-brand-orange-coral shadow-lg shadow-brand-orange-coral/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300">
                  Explorar <ChevronDown className="ml-1.5 h-3.5 w-3.5 text-brand-orange-coral" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 bg-[#161920]/95 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                align="end"
              >
                <div className="px-3 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Ecosystem</div>
                {moreLinks.map((link) => (
                  <DropdownMenuItem key={link.name} asChild>
                    <Link
                      to={link.href}
                      className="flex items-center px-3 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-brand-orange-coral/10 cursor-pointer transition-all gap-3"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-orange-coral opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* CTA Buttons Premium */}
          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-1 rounded-2xl">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl px-4 text-xs font-bold text-gray-300 hover:text-white h-10"
                  asChild
                >
                  <Link to={getDashboardLink()}>
                    <User className="h-4 w-4 mr-2 text-brand-orange-coral" />
                    {user?.name?.split(' ')[0] || 'Meu Painel'}
                  </Link>
                </Button>
                <div className="w-px h-4 bg-white/10" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl w-10 h-10 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white font-bold text-sm tracking-tight px-6"
                  asChild
                >
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black text-sm px-8 h-12 rounded-2xl shadow-lg shadow-brand-orange-coral/20 transition-all hover:scale-105"
                  asChild
                >
                  <Link to="/inscricoes">Garantir Ingresso</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button Premium */}
          <button
            className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-all"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Refined */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-full bg-dark/95 backdrop-blur-3xl border-t border-white/5 shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 gap-2">
              <p className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Navegação Principal</p>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`flex items-center px-4 py-4 rounded-2xl text-lg font-black tracking-tight transition-all ${isActive(link.href)
                    ? 'text-white bg-brand-orange-coral/20 border border-brand-orange-coral/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2 pt-6 border-t border-white/5">
              <p className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Ecosistema GS</p>
              {moreLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="flex items-center px-4 py-3 rounded-2xl text-base font-bold text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="pt-8 space-y-3">
              {isAuthenticated ? (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-14 border-white/10 bg-white/5 text-white rounded-2xl font-black"
                    asChild
                  >
                    <Link to={getDashboardLink()} onClick={() => setIsMobileMenuOpen(false)}>Meu Painel</Link>
                  </Button>
                  <Button
                    className="h-14 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Sair
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="outline"
                    className="h-14 border-white/10 bg-white/5 text-white rounded-2xl font-black"
                    asChild
                  >
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Fazer Login</Link>
                  </Button>
                  <Button
                    className="h-14 bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black rounded-2xl shadow-lg shadow-brand-orange-coral/20"
                    asChild
                  >
                    <Link to="/inscricoes" onClick={() => setIsMobileMenuOpen(false)}>Tickets Growth 2026</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
