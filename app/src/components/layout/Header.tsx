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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-dark/95 backdrop-blur-xl border-b border-dark-300'
        : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            {location.pathname === '/growth-experience' || location.pathname === '/growth-experience-triunfo' ? (
              <>
                <div className="w-10 h-10 rounded-lg bg-brand-yellow flex items-center justify-center">
                  <span className="text-dark-100 font-bold text-lg">GS</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-white font-bold text-lg leading-tight">Growth Summit</span>
                  <span className="text-brand-yellow text-xs block font-bold">2026</span>
                </div>
              </>
            ) : (
              <img
                src="https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/growthsummit-fundoescuro.png"
                alt="Growth Summit"
                className="h-10 lg:h-12 w-auto"
              />
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.href)
                  ? 'text-brand-yellow bg-brand-yellow/10'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
              >
                {link.name}
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200">
                  Mais <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-dark-200 border-dark-300"
                align="end"
              >
                {moreLinks.map((link) => (
                  <DropdownMenuItem key={link.name} asChild>
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-white hover:bg-brand-yellow/10 cursor-pointer"
                    >
                      {link.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white"
                  asChild
                >
                  <Link to={getDashboardLink()}>
                    <User className="h-4 w-4 mr-2" />
                    {user?.name?.split(' ')[0]}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white"
                  asChild
                >
                  <Link to="/login">
                    <User className="h-4 w-4 mr-2" />
                    Entrar
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-brand-yellow hover:bg-brand-yellow/90 text-dark-100 font-bold"
                  asChild
                >
                  <Link to="/inscricoes">Inscrever-se</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-dark-200 border-t border-dark-300">
          <div className="px-4 py-4 space-y-2">
            {[...navLinks, ...moreLinks].map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive(link.href)
                  ? 'text-brand-yellow bg-brand-yellow/10'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-dark-300 space-y-2">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full border-dark-300 text-gray-300"
                    asChild
                  >
                    <Link to={getDashboardLink()}>Minha Área</Link>
                  </Button>
                  <Button
                    className="w-full bg-dark-100 hover:bg-dark-300 text-white"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full border-dark-300 text-gray-300"
                    asChild
                  >
                    <Link to="/login">Entrar</Link>
                  </Button>
                  <Button className="w-full bg-brand-yellow hover:bg-brand-yellow/90 text-dark-100 font-bold" asChild>
                    <Link to="/inscricoes">Inscrever-se</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
