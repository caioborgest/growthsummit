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
  ChevronRight,
  Bell,
  FolderOpen,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

const sidebarItems: SidebarItem[] = [
  { id: '', name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { id: 'projetos', name: 'Projetos', icon: FolderOpen, path: '/admin/projetos' },
  { id: 'inscricoes', name: 'Inscrições', icon: Users, path: '/admin/inscricoes' },
  { id: 'mentores', name: 'Mentores', icon: UserCircle, path: '/admin/mentores' },
  { id: 'mentorias', name: 'Mentorias', icon: Calendar, path: '/admin/mentorias' },
  { id: 'rodada-negocios', name: 'Rodada B2B', icon: Handshake, path: '/admin/rodada-negocios' },
  { id: 'startups', name: 'Startups', icon: Rocket, path: '/admin/startups' },
  { id: 'patrocinadores', name: 'Patrocinadores', icon: Gem, path: '/admin/patrocinadores' },
  { id: 'financeiro', name: 'Financeiro', icon: DollarSign, path: '/admin/financeiro' },
  { id: 'check-in', name: 'Check-in', icon: QrCode, path: '/admin/check-in' },
  { id: 'comunicacao', name: 'Comunicação', icon: Mail, path: '/admin/comunicacao' },
  { id: 'relatorios', name: 'Relatórios', icon: BarChart3, path: '/admin/relatorios' },
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
    <div className="min-h-screen bg-dark flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-dark-200 border-r border-dark-300 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-dark-300">
          <Link to="/admin" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
              <span className="text-white font-bold">GS</span>
            </div>
            <div>
              <span className="text-white font-bold">Growth Summit</span>
              <span className="text-teal-400 text-xs block">Admin</span>
            </div>
          </Link>
        </div>

        {/* Project Selector */}
        <div className="px-4 py-3 border-b border-dark-300">
          <label className="text-xs text-gray-500 uppercase font-medium mb-2 block">
            Projeto Selecionado
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between border-dark-300 bg-dark-300 text-white hover:bg-dark-400"
              >
                <span className="truncate">
                  {selectedProject ? selectedProject.name : 'Selecione um projeto'}
                </span>
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-dark-200 border-dark-300">
              {activeProjects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`text-white hover:bg-dark-300 cursor-pointer ${selectedProject?.id === project.id ? 'bg-teal-500/20 text-teal-400' : ''
                    }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-xs text-gray-400">{project.city}, {project.state}</span>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onClick={() => navigate('/admin/projetos')}
                className="text-teal-400 hover:bg-dark-300 cursor-pointer border-t border-dark-300 mt-1 pt-2"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Gerenciar Projetos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {!selectedProject && (
            <div className="flex items-center gap-2 mt-2 text-xs text-orange-400">
              <AlertCircle className="h-3 w-3" />
              <span>Selecione um projeto para gerenciar</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive(item.path)
                ? 'bg-teal-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-dark-300'
                }`}
            >
              <div className="flex items-center">
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </div>
              {item.badge && (
                <Badge className={`text-xs ${isActive(item.path) ? 'bg-white/20 text-white' : 'bg-teal-500/20 text-teal-400'
                  }`}>
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-dark-300">
          <div className="flex items-center mb-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="ml-3">
              <p className="text-white text-sm font-medium">{user?.name}</p>
              <p className="text-gray-500 text-xs">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full border-dark-300 text-gray-400 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-dark-200 border-b border-dark-300 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-300 mr-4"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {sidebarItems.find(i => isActive(i.path))?.name || 'Dashboard'}
                </h1>
                <p className="text-gray-400 text-sm">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {selectedProject && (
                <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/50">
                  {selectedProject.name}
                </Badge>
              )}
              <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-300">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
              </button>
              <Link to="/" className="text-gray-400 hover:text-white text-sm">
                Ver site
                <ChevronRight className="inline h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
