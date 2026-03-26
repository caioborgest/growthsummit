import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogOut, Bell, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { useOutdoorTheme } from '@/hooks/useOutdoorTheme';

const navLinks = [
  { name: 'Início', href: '/' },
  { name: 'Triunfo 2026', href: '/growth-experience-triunfo' },
  { name: 'Petrolina 2026', href: '/growth-experience-petrolina' },
  { name: 'Inscrições', href: '/inscricoes' },
];

const moreLinks = [
  { name: 'FAQ', href: '/faq' },
  { name: 'Contato', href: '/contato' },
];

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isOutdoor, toggle } = useOutdoorTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
          <Link
            to="/"
            className="flex items-center group transition-transform duration-300 hover:scale-105"
          >
            <img
              src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/logomarca-GX-fundoescuro.png"
              alt="Growth Experience"
              className="h-8 sm:h-11 w-auto drop-shadow-[0_0_8px_rgba(255,112,67,0.3)] transition-all group-hover:drop-shadow-[0_0_12px_rgba(255,112,67,0.5)]"
            />
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
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={toggle}
              className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all touch-target ${
                isOutdoor ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-amber-400 hover:border-amber-500/30'
              }`}
              aria-label={isOutdoor ? 'Desativar modo outdoor (alto contraste)' : 'Ativar modo outdoor (melhor leitura ao sol)'}
              title={isOutdoor ? 'Modo outdoor ativado' : 'Modo outdoor - melhor leitura ao sol'}
            >
              <Sun className="h-5 w-5" />
            </button>
            {isAuthenticated ? (
              <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-1 rounded-2xl group">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl px-4 text-xs font-bold text-gray-300 hover:text-white h-10 gap-2"
                    >
                      {user?.avatar ? (
                        <div className="h-6 w-6 rounded-full overflow-hidden border border-white/10 shadow-inner">
                          <img src={user.avatar} className="h-full w-full object-cover" alt="" />
                        </div>
                      ) : (
                        <User className="h-4 w-4 text-brand-orange-coral" />
                      )}
                      <span className="max-w-[100px] truncate leading-none">{user?.name?.split(' ')[0] || 'Meu Painel'}</span>
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-[#161920]/95 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl" align="end">
                    <div className="px-3 py-2 border-b border-white/5 mb-2">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Logado como</p>
                      <p className="text-white text-xs font-bold truncate">{user?.email}</p>
                      <Badge className="mt-2 bg-brand-orange-coral/10 text-brand-orange-coral border-none text-[9px] uppercase font-black">
                        {user?.role === 'admin' ? 'Administrador' :
                          user?.role === 'mentor' ? 'Mentor' :
                            user?.role === 'company' ? 'Empresa' :
                              user?.role === 'startup' ? 'Startup' :
                                user?.role === 'sponsor' ? 'Patrocinador' : 'Participante'}
                      </Badge>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardLink()} className="flex items-center px-3 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer">
                        Ir para o Painel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsProfileOpen(true)}
                      className="flex items-center px-3 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer mt-1"
                    >
                      <User className="h-4 w-4 mr-2 text-brand-orange-coral" />
                      Meu Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={logout}
                      className="flex items-center px-3 py-3 rounded-xl text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer mt-1"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair da Conta
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={toggle}
              className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all touch-target ${
                isOutdoor ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-white/5 border-white/10 text-gray-400'
              }`}
              aria-label={isOutdoor ? 'Desativar modo outdoor' : 'Modo outdoor'}
            >
              <Sun className="h-5 w-5" />
            </button>
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-all">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-brand-orange-coral rounded-full border border-dark"></span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 bg-[#161920]/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl" align="end">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-sm">Notificações</h3>
                    <Badge className="bg-brand-orange-coral/10 text-brand-orange-coral border-none text-[9px] uppercase font-black">1 Nova</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-brand-orange-coral/5 border border-brand-orange-coral/10">
                      <p className="text-white text-xs font-bold font-montserrat">Bem-vindo(a) ao Growth Experience!</p>
                      <p className="text-gray-400 text-[11px] mt-1 leading-tight">Complete seu perfil para aproveitar ao máximo o evento.</p>
                      <span className="text-[9px] text-gray-500 mt-2 block">Agora mesmo</span>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <button
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-all focus:ring-2 focus:ring-brand-orange-coral/50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Refined */}
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-dark/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={`lg:hidden fixed inset-x-0 bottom-0 top-0 z-40 bg-[#0c0e12] transition-all duration-500 ease-in-out transform ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
        <div className="pt-24 pb-10 px-6 space-y-6 h-full overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 gap-2">
            <p className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Navegação Principal</p>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`flex items-center px-4 py-4 rounded-2xl text-lg font-black tracking-tight transition-all ${isActive(link.href)
                  ? 'text-white bg-brand-orange-coral shadow-lg shadow-brand-orange-coral/20'
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-14 border-white/10 bg-white/5 text-white rounded-2xl font-black w-full"
                  asChild
                >
                  <Link to={getDashboardLink()} onClick={() => setIsMobileMenuOpen(false)}>Meu Painel</Link>
                </Button>
                <Button
                  className="h-14 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black w-full"
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
                  className="h-14 border-white/10 bg-white/5 text-white rounded-2xl font-black w-full"
                  asChild
                >
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Fazer Login</Link>
                </Button>
                <Button
                  className="h-14 bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black rounded-2xl shadow-lg shadow-brand-orange-coral/20 w-full"
                  asChild
                >
                  <Link to="/inscricoes" onClick={() => setIsMobileMenuOpen(false)}>Tickets Growth 2026</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </header>
  );
}
