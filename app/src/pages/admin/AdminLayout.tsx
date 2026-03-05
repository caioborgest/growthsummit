import { useState } from 'react';
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
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/contexts/ProjectContext';
import { useProjects } from '@/hooks/useData';
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
      { id: '', name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
      { id: 'relatorios', name: 'Relatórios', icon: BarChart3, path: '/admin/relatorios' },
      { id: 'projetos', name: 'Projetos', icon: FolderOpen, path: '/admin/projetos' },
    ]
  },
  {
    title: 'Evento & Inscrições',
    items: [
      { id: 'inscricoes', name: 'Participantes', icon: Users, path: '/admin/inscricoes' },
      { id: 'empresas-incentivadoras', name: 'Empresas Incentivadoras', icon: Gem, path: '/admin/empresas-incentivadoras' },
      { id: 'check-in', name: 'Check-in (QR)', icon: QrCode, path: '/admin/check-in' },
      { id: 'programacao', name: 'Programação', icon: Calendar, path: '/admin/programacao' },
    ]
  },
  {
    title: 'Experiências 1:1',
    items: [
      { id: 'mentorias', name: 'Gestão de Mentorias', icon: Calendar, path: '/admin/mentorias' },
      { id: 'mentores', name: 'Time de Mentores', icon: UserCircle, path: '/admin/mentores' },
      { id: 'rodada-negocios', name: 'Rodada B2B', icon: Handshake, path: '/admin/rodada-negocios' },
      { id: 'startups', name: 'Arena Pitch', icon: Rocket, path: '/admin/startups' },
    ]
  },
  {
    title: 'Comercial & Marketing',
    items: [
      { id: 'financeiro', name: 'Financeiro', icon: DollarSign, path: '/admin/financeiro' },
      { id: 'patrocinadores', name: 'Patrocinadores', icon: Gem, path: '/admin/patrocinadores' },
      { id: 'cupons', name: 'Vouchers & Cupons', icon: Ticket, path: '/admin/cupons' },
    ]
  },
  {
    title: 'Comunicação',
    items: [
      { id: 'comunicacao', name: 'E-mail & Push', icon: Mail, path: '/admin/comunicacao' },
      { id: 'whatsapp', name: 'Grupos WhatsApp', icon: MessageCircle, path: '/admin/whatsapp' },
    ]
  },
  {
    title: 'Configurações',
    items: [
      { id: 'usuarios', name: 'Usuários Admin', icon: Users, path: '/admin/usuarios' },
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
  const { data: projects } = useProjects();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
    <div className="h-screen bg-[#0c0e12] flex overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 w-72 h-screen bg-[#0c0e12] border-r border-white/5 flex flex-col transition-all duration-500 shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Logo Section */}
        <div className="p-8 relative">
          <Link to="/admin" className="flex items-center justify-center">
            <img
              src="https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/logomarca-GX-fundoescuro.png"
              alt="Growth Experience"
              className="h-9 w-auto hover:scale-105 transition-transform duration-300"
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
                className="w-full justify-between bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 px-4 py-6 rounded-2xl group transition-all duration-300"
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
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
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
            return (
              <div key={group.title} className="space-y-1">
                <h3 className="text-[10px] text-gray-600 uppercase font-black tracking-[0.25em] mb-3 px-2 flex items-center">
                  <span>{group.title}</span>
                  <div className="h-[1px] bg-white/5 flex-1 ml-4" />
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        className={`group flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative ${active
                          ? 'bg-brand-orange-coral text-brand-white shadow-lg shadow-brand-orange-coral/20'
                          : 'text-gray-500 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        <div className="flex items-center relative z-10">
                          <item.icon className={`h-5 w-5 mr-3 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-white' : 'text-gray-500 group-hover:text-brand-orange-coral'}`} />
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
        <div className="p-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 transition-all hover:bg-white/10 hover:border-white/20 group">
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
                onClick={handleLogout}
              >
                <LogOut className="h-3.5 w-3.5 mr-2" />
                Sair
              </Button>
              <Button
                variant="ghost"
                className="w-10 h-10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 rounded-xl flex items-center justify-center p-0"
              >
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0c0e12] relative">
        {/* Glass Header Refined */}
        <header className="sticky top-0 z-30 bg-[#0c0e12]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <Menu className="h-6 w-6" />
              </button>

              <div className="hidden sm:block">
                <div className="flex items-center gap-2 text-xs font-bold text-brand-orange-coral uppercase tracking-widest mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-orange-coral animate-pulse" />
                  Plataforma de Gestão v3.0
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-3">
                  {navigationGroups.flatMap(g => g.items).find(i => isActive(i.path))?.name || 'Dashboard Central'}
                  <span className="text-white/10 text-3xl font-thin hidden lg:inline">/</span>
                  <span className="text-gray-500 text-sm font-medium hidden lg:inline pt-1 leading-none">
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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

              {/* Status Badge */}
              {selectedProject && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-glow-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">{selectedProject.name}</span>
                </div>
              )}

              {/* Profile Shortcut Mobile */}
              <div className="lg:hidden relative">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                  alt={user?.name}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/10"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content with improved spacing and fade effect */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="p-4 sm:p-8 animate-fade-in-up">
            <Outlet />
          </div>

          {/* Footer Copyright inside main content */}
          <footer className="px-8 py-6 border-t border-white/5 text-center sm:text-left">
            <p className="text-[11px] font-bold text-gray-600 uppercase tracking-[0.2em]">
              © 2026 Growth Experience • Advanced Management Ecosystem
            </p>
          </footer>
        </div>

        {/* Dynamic Shadow Gradients for Depth */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange-coral/5 rounded-full blur-[120px] -z-10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] -z-10 translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      </main>
    </div>
  );
}
