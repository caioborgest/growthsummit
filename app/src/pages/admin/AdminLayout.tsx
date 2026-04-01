import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Calendar,
  Handshake,
  Rocket,
  Gem,
  DollarSign,
  QrCode,
  Mail,
  BarChart3,
  LogOut,
  Menu,
  Ticket,
  FolderOpen,
  MessageCircle,
  AlertCircle,
  BookOpen,
  ChevronDown,
  Settings,
  Award,
  Store,
  Gift,
  Bell,
  Headset,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/contexts/ProjectContext';
import { useProjects, useNotifications } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SidebarItem {
  id: string;
  name: string;
  icon: React.ElementType;
  path: string;
  badge?: string;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

const navigationGroups: SidebarGroup[] = [
  {
    title: 'Visão Geral',
    items: [
      { id: 'dashboard', name: 'Dashboard Central', icon: LayoutDashboard, path: '/admin' },
    ]
  },
  {
    title: 'Planejamento e Estrutura',
    items: [
      { id: 'projetos', name: 'Gestão de Projetos', icon: FolderOpen, path: '/admin/projetos' },
      { id: 'programacao', name: 'Grade de Programação', icon: Calendar, path: '/admin/programacao' },
      { id: 'patrocinadores', name: 'Patrocinadores & Cotas', icon: Gem, path: '/admin/patrocinadores' },
      { id: 'stands', name: 'Circuito de Stands', icon: Store, path: '/admin/stands' },
    ]
  },
  {
    title: 'Experiências e Conteúdo',
    items: [
      { id: 'mentores', name: 'Time de Mentores', icon: UserCircle, path: '/admin/mentores' },
      { id: 'mentorias', name: 'Agenda de Mentorias', icon: Calendar, path: '/admin/mentorias' },
      { id: 'rodada-negocios', name: 'Rodada B2B', icon: Handshake, path: '/admin/rodada-negocios' },
      { id: 'startups', name: 'Arena Pitch (Startups)', icon: Rocket, path: '/admin/startups' },
    ]
  },
  {
    title: 'Participantes e Vendas',
    items: [
      { id: 'inscricoes', name: 'Base de Participantes', icon: Users, path: '/admin/inscricoes' },
      { id: 'lotes-equipes', name: 'Inscrições em Lote', icon: Ticket, path: '/admin/lotes-equipes' },
      { id: 'cupons', name: 'Cupons e Vouchers', icon: Ticket, path: '/admin/cupons' },
      { id: 'financeiro', name: 'Financeiro e Vendas', icon: DollarSign, path: '/admin/financeiro' },
    ]
  },
  {
    title: 'Operação e Pós-Evento',
    items: [
      { id: 'check-in', name: 'Check-in Digital (QR)', icon: QrCode, path: '/admin/check-in' },
      { id: 'sorteio', name: 'Central de Sorteios', icon: Gift, path: '/admin/sorteio' },
      { id: 'certificados', name: 'Certificados Digitais', icon: Award, path: '/admin/certificados' },
      { id: 'relatorios', name: 'Relatórios de ROI', icon: BarChart3, path: '/admin/relatorios' },
    ]
  },
  {
    title: 'Comunicação',
    items: [
      { id: 'comunicacao', name: 'E-mail & Push', icon: Mail, path: '/admin/comunicacao' },
      { id: 'suporte', name: 'Atendimento Suporte', icon: Headset, path: '/admin/suporte', badge: 'NEW' },
    ]
  },
  {
    title: 'Configurações',
    items: [
      { id: 'usuarios', name: 'Usuários Admin', icon: Users, path: '/admin/usuarios' },
      { id: 'integracoes', name: 'Integrações Externas', icon: Share2, path: '/admin/integracoes', badge: 'NEW' },
      { id: 'seguranca', name: 'Segurança & Logs', icon: AlertCircle, path: '/admin/seguranca' },
      { id: 'guia', name: 'Manual do Sistema', icon: BookOpen, path: '/guia' },
    ]
  },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { selectedProject, setSelectedProject } = useProject();
  
  // Lista de rotas restritas apenas para ROLE: 'admin' (impede 'staff')
  const ADMIN_ONLY_PATHS = ['/admin/financeiro', '/admin/usuarios', '/admin/seguranca', '/admin/integracoes', '/admin/projetos'];
  const isStaff = user?.role === 'staff';

  // Proteção de Rota (Redirect se acesso direto via URL)
  useEffect(() => {
    if (isStaff && ADMIN_ONLY_PATHS.some(path => location.pathname.startsWith(path))) {
      console.warn(`[AdminAccessControl] Acesso negado para STAFF a: ${location.pathname}`);
      toast.error('Você não tem permissão para acessar esta área financeira ou configuração crítica.');
      navigate('/admin');
    }
  }, [location.pathname, isStaff, navigate]);

  const { data: projects } = useProjects();
  const { data: notifications } = useNotifications();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Limpa rascunhos de formulários de participantes quando admin acessa o painel
  // Previne que dados obsoletos (de quando projetos@cbxgrowth.com.br tinha role 'company')
  // causem redirects inesperados para /empresa-area ou /startup-area
  useEffect(() => {
    localStorage.removeItem('b2b_form_draft');
    localStorage.removeItem('startup_form_draft');
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const activeProjects = projects.filter(p => p.status === 'active');

  return (
    <div className="h-screen bg-background flex overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 w-72 h-screen bg-sidebar border-r border-border-theme flex flex-col transition-all duration-500 shadow-premium ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Logo Section */}
        <div className="p-8 relative">
          <Link to="/admin" className="flex items-center justify-center">
            <img
              src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/favicon.png"
              alt="Logo"
              className="h-10 w-auto hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Project Selector Refined */}
        <div className="px-6 py-6">
          <label className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mb-3 block px-2">
            PROJETO ATIVO
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between bg-white/5 border border-border-theme text-foreground hover:bg-white/10 hover:border-white/20 px-4 py-6 rounded-2xl group transition-all duration-300 shadow-sm"
              >
                <div className="flex items-center gap-3 overflow-hidden text-left">
                  <div className="w-8 h-8 rounded-lg bg-brand-orange-coral/20 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-orange-coral/30 transition-colors">
                    <FolderOpen className="h-4 w-4 text-brand-orange-coral" />
                  </div>
                  <span className="truncate font-bold text-sm tracking-tight text-gray-200 group-hover:text-white transition-colors">
                    {selectedProject ? selectedProject.name : 'Selecione um projeto'}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 ml-2 text-gray-500 group-hover:text-white transition-colors" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-[#161920] border-white/10 p-2 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Seus Projetos</div>
              {activeProjects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 mt-1 cursor-pointer transition-all duration-200 ${selectedProject?.id === project.id
                    ? 'bg-brand-orange-coral/10 text-brand-orange-coral border border-brand-orange-coral/20'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedProject?.id === project.id ? 'bg-brand-orange-coral/20' : 'bg-gray-800'}`}>
                    <Rocket className={`h-4 w-4 ${selectedProject?.id === project.id ? 'text-brand-orange-coral' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm truncate">{project.name}</span>
                    <span className="text-[10px] opacity-60 truncate">{project.city}, {project.state}</span>
                  </div>
                </DropdownMenuItem>
              ))}
              <div className="mt-2 pt-2 border-t border-white/5">
                <DropdownMenuItem
                  onClick={() => navigate('/admin/projetos')}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-brand-orange-coral hover:bg-brand-orange-coral/10 cursor-pointer transition-all font-bold text-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-orange-coral/20 flex items-center justify-center">
                    <LayoutDashboard className="h-4 w-4" />
                  </div>
                  Painel de Projetos
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          {!selectedProject && (
            <div className="flex items-center gap-2 mt-3 px-2 text-[11px] text-orange-400/80 animate-pulse bg-orange-500/5 py-2 rounded-lg border border-orange-500/10">
              <AlertCircle className="h-3.5 w-3.5" />
              <span className="font-medium">Selecione um projeto para gerenciar</span>
            </div>
          )}
        </div>

        {/* Navigation Groups Refined */}
        <nav className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar space-y-6">
          {navigationGroups.map((group) => {
            // Filtrar itens do grupo baseado nas configurações do projeto selecionado
            const filteredItems = group.items.filter(item => {
              if (!selectedProject) return true; // Se não tem projeto selecionado, mostra tudo (ou Core)
              
              const settings = selectedProject.settings || {};
              
              // Regras de visibilidade por ID de navegação
              if (item.id === 'rodada-negocios' && settings.enableB2B === false) return false;
              if (item.id === 'mentorias' && settings.enableMentoring === false) return false;
              if (item.id === 'mentores' && settings.enableMentoring === false) return false;
              if (item.id === 'startups' && settings.enableStartups === false) return false;
              if (item.id === 'check-in' && settings.enableCheckIn === false) return false;
              
              // Se o usuário for STAFF, esconder módulos sensíveis
              if (user?.role === 'staff') {
                const staffBlacklist = ['financeiro', 'usuarios', 'seguranca', 'integracoes', 'projetos'];
                if (staffBlacklist.includes(item.id)) return false;
              }
              
              // Se o projeto for Triunfo, esconder módulos que não se aplicam (ex: Stands, Mentorias)


              return true;
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                <h3 className="text-[10px] text-gray-600 uppercase font-black tracking-[0.25em] mb-3 px-2 flex items-center">
                  <span>{group.title}</span>
                  <div className="h-[1px] bg-white/5 flex-1 ml-4" />
                </h3>
                <div className="space-y-1">
                  {filteredItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        className={`group flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative ${active
                          ? 'bg-brand-orange-coral text-white shadow-premium shadow-brand-orange-coral/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                          }`}
                      >
                        <div className="flex items-center relative z-10">
                          <item.icon className={`h-5 w-5 mr-3 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-white' : 'text-muted-foreground group-hover:text-brand-orange-coral'}`} />
                          <span className="tracking-tight">{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black z-10 ${active
                            ? 'bg-white/20 text-white'
                            : 'bg-brand-orange-coral/10 text-brand-orange-coral group-hover:bg-brand-orange-coral group-hover:text-white transition-all'
                            }`}>
                            {item.badge}
                          </span>
                        )}
                        {active && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-l-full" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Profile Section Premium */}
        <div className="p-4 lg:p-6 mt-auto border-t border-border-theme bg-muted/20">
          <div
            onClick={() => setIsProfileOpen(true)}
            className="bg-accent/50 border border-border-theme rounded-2xl lg:rounded-3xl p-3 lg:p-4 transition-all hover:bg-accent hover:border-white/20 group cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                  alt={user?.name}
                  className="w-10 h-10 rounded-2xl object-cover ring-2 ring-white/10 group-hover:ring-brand-orange-coral/30 transition-all"
                />
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-[#0c0e12] rounded-full" />
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-white text-sm font-black truncate">{user?.name || 'Admin User'}</p>
                <p className="text-gray-500 text-[11px] truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="flex-1 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-white/5 rounded-xl h-10 px-2 text-xs font-bold transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
              >
                <LogOut className="h-3.5 w-3.5 mr-2" />
                Sair
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsProfileOpen(true)}
                className="w-10 h-10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 rounded-xl flex items-center justify-center p-0"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative transition-colors duration-300">
        {/* Glass Header Refined */}
        <header className="sticky top-0 z-30 bg-header backdrop-blur-xl border-b border-border-theme px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <Menu className="h-6 w-6" />
              </button>

              <div className="hidden sm:block">
                <div className="flex items-center gap-2 text-[10px] font-black text-brand-orange-coral uppercase tracking-[0.25em] mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-orange-coral animate-pulse" />
                  Management Platform v3.0
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter flex items-center gap-3">
                  {navigationGroups.flatMap(g => g.items).find(i => isActive(i.path))?.name || 'Dashboard Central'}
                  <span className="text-white/5 text-4xl font-thin hidden lg:inline">/</span>
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-widest hidden lg:inline pt-1">
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {/* Quick Actions / Ver Site */}
              <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-2xl p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="rounded-xl px-4 text-xs font-bold text-gray-400 hover:text-white transition-all h-9"
                >
                  <Link to="/">
                    <Rocket className="h-3.5 w-3.5 mr-2" />
                    Site Público
                  </Link>
                </Button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl px-4 text-xs font-bold text-gray-400 hover:text-white transition-all h-9"
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-2" />
                  Suporte
                </Button>
              </div>

              {/* Bell Notification */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="relative bg-muted/50 hover:bg-accent text-muted-foreground h-10 w-10 flex items-center justify-center rounded-2xl transition-all border border-border-theme group shadow-sm">
                    <Bell className="h-5 w-5 group-hover:text-brand-orange-coral transition-colors" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-brand-orange-coral rounded-full border-2 border-background animate-pulse"></span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-80 bg-[#161920] border-white/10 p-0 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden" 
                  align="end"
                >
                  <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <h3 className="text-white font-bold text-sm tracking-tight">Notificações</h3>
                    <Badge className="bg-brand-orange-coral/10 text-brand-orange-coral text-[10px] font-black border-none px-2 h-5">
                      {notifications.filter(n => !n.read).length} NOVAS
                    </Badge>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                    {notifications && notifications.length > 0 ? (
                      <div className="divide-y divide-white/5">
                        {notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            onClick={async () => {
                              await (supabase.from('notifications') as any).update({ 
                                read: true, 
                                read_at: new Date().toISOString() 
                              }).eq('id', n.id);
                              if (n.actionUrl) navigate(n.actionUrl);
                            }}
                            className={`p-4 transition-all cursor-pointer hover:bg-white/5 ${!n.read ? 'bg-brand-orange-coral/5' : ''}`}
                          >
                            <div className="flex justify-between items-start gap-3 mb-1">
                              <p className={`text-[11px] font-bold leading-tight ${!n.read ? 'text-white' : 'text-gray-400'}`}>
                                {n.title}
                              </p>
                              <span className="text-[9px] text-gray-600 font-bold whitespace-nowrap">
                                {new Date(n.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-gray-500 text-[10px] leading-relaxed line-clamp-2">
                              {n.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center">
                        <Bell className="h-8 w-8 text-gray-800 mx-auto mb-3 opacity-20" />
                        <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest leading-none">Vazio por aqui</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-white/[0.02] border-t border-white/5 text-center">
                    <Button 
                      variant="ghost" 
                      className="w-full h-8 text-[10px] font-black uppercase text-gray-500 hover:text-white"
                      onClick={() => navigate('/admin/comunicacao')}
                    >
                      Ver Todas Corretamente
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Project Status Badge — Enhanced Dual Contrast */}
              {selectedProject && (
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#14B8A6]/10 border border-[#14B8A6]/20 text-[#14B8A6] shadow-lg shadow-[#14B8A6]/5">
                  <div className="w-2 h-2 rounded-full bg-[#14B8A6] animate-glow-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.15em]">{selectedProject.name}</span>
                </div>
              )}

              {/* Profile Shortcut Mobile */}
              <div className="flex items-center gap-3 lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="w-10 h-10 bg-brand-orange-coral/10 text-brand-orange-coral border border-brand-orange-coral/20 rounded-xl"
                >
                  <Link to="/admin/check-in?scan=true">
                    <QrCode className="h-5 w-5" />
                  </Link>
                </Button>
                <div className="relative">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                    alt={user?.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/10"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content with improved spacing and fade effect */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-background/50">
          <div className="min-h-full flex flex-col">
            <div className="p-4 sm:p-8 animate-fade-in-up flex-1 pb-32 md:pb-20">
              <Outlet />
            </div>

            <footer className="px-8 py-8 border-t border-border-theme text-center sm:text-left bg-black/40 backdrop-blur-sm">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.3em] font-sans">
                © 2026 Growth Experience • Advanced Management Ecosystem
              </p>
            </footer>
          </div>
        </div>

        {/* Dynamic Shadow Gradients for Depth — Improved Duo Intensity */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FF7043]/5 rounded-full blur-[140px] -z-10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#14B8A6]/5 rounded-full blur-[140px] -z-10 translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      </main>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}
