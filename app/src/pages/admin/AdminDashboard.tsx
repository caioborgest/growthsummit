import { useEffect, useState } from 'react';
import {
  Users,
  DollarSign,
  Calendar,
  Handshake,
  Rocket,
  Gem,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  AlertCircle,
  QrCode,
  Mail,
  Download,
  Users2,
  FolderOpen
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useProject } from '@/contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';
import {
  useRegistrations,
  useMentors,
  useMentoringSessions,
  useB2BMeetings,
  useStartups,
  useSponsors,
  useTransactions,
  useCheckIns
} from '@/hooks/useData';
import type { Mentor, Startup } from '@/types';

interface StatCardProps {
  title: string;
  value: string;
  target: string;
  progress: number;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  color: string;
}

function StatCard({ title, value, target, progress, icon: Icon, trend, trendValue, color }: StatCardProps) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-${color}-500/20 flex items-center justify-center`}>
          <Icon className={`h-6 w-6 text-${color}-400`} />
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-gray-400 text-sm mb-3">{title}</p>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span>Meta: {target}</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-dark-300 rounded-full h-2">
        <div
          className={`bg-${color}-500 h-2 rounded-full transition-all`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}

const quickActions = [
  { name: 'Aprovar Mentor', icon: CheckCircle, color: 'green', path: '/admin/mentores' },
  { name: 'Exportar Inscritos', icon: Download, color: 'blue', action: () => { } },
  { name: 'Enviar Email', icon: Mail, color: 'purple', path: '/admin/comunicacao' },
  { name: 'Ver Check-ins', icon: QrCode, color: 'teal', path: '/admin/check-in' },
  { name: 'Matching B2B', icon: Users2, color: 'orange', path: '/admin/rodada-negocios' },
];

export function AdminDashboard() {
  const { selectedProject, isProjectSelected } = useProject();
  const navigate = useNavigate();
  const { data: registrations } = useRegistrations();
  const { data: _mentors, filter: filterMentors } = useMentors();
  const { data: sessions } = useMentoringSessions();
  const { data: b2bMeetings } = useB2BMeetings();
  const { data: startups, filter: filterStartups } = useStartups();
  const { data: _sponsors } = useSponsors();
  const { data: transactions } = useTransactions();
  const { data: checkIns } = useCheckIns();

  const [stats, setStats] = useState({
    registrations: { value: 0, target: 1500, progress: 0 },
    revenue: { value: 0, target: 616000, progress: 0 },
    mentorias: { value: 0, target: 100, progress: 0 },
    b2b: { value: 0, target: 120, progress: 0 },
  });

  useEffect(() => {
    const totalRevenue = transactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    // Dynamic targets from project settings or defaults
    const targets = {
      registrations: selectedProject?.settings?.maxRegistrations || 1500,
      revenue: selectedProject?.settings?.ticketPrices?.vip * 10 || 616000, // Heuristic for revenue target if not explicit
      mentorias: selectedProject?.settings?.maxMentors ? selectedProject.settings.maxMentors * 5 : 100,
      b2b: selectedProject?.settings?.maxCompanies ? selectedProject.settings.maxCompanies * 2 : 120,
    };

    setStats({
      registrations: {
        value: registrations.length,
        target: targets.registrations,
        progress: Math.round((registrations.length / targets.registrations) * 100)
      },
      revenue: {
        value: totalRevenue,
        target: targets.revenue,
        progress: Math.round((totalRevenue / targets.revenue) * 100)
      },
      mentorias: {
        value: sessions.length,
        target: targets.mentorias,
        progress: Math.round((sessions.length / targets.mentorias) * 100)
      },
      b2b: {
        value: b2bMeetings.length,
        target: targets.b2b,
        progress: Math.round((b2bMeetings.length / targets.b2b) * 100)
      },
    });
  }, [registrations, transactions, sessions, b2bMeetings, selectedProject]);

  const pendingMentors = filterMentors((m: Mentor) => m.status === 'pending');
  const pendingStartups = filterStartups((s: Startup) => s.status === 'pending');

  const recentActivity = [
    { action: 'Nova inscrição', detail: 'João Silva - Passe Pro', time: '2 min atrás', type: 'success' as const },
    { action: 'Mentoria agendada', detail: 'Ana + Dr. Fernando', time: '5 min atrás', type: 'info' as const },
    { action: 'Pagamento confirmado', detail: 'R$ 2.500 - Growth Experience', time: '12 min atrás', type: 'success' as const },
    { action: 'Startup aprovada', detail: 'TechStart Brasil', time: '25 min atrás', type: 'info' as const },
    { action: 'Patrocinador fechado', detail: 'InnovateLabs - Ouro', time: '1h atrás', type: 'success' as const },
  ];

  // Show project selection prompt if no project is selected
  if (!isProjectSelected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="bg-[#1E293B] border-[#334155] max-w-lg w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-[#21808D]/20 flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-10 h-10 text-[#21808D]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Selecione um Projeto
            </h2>
            <p className="text-[#94A3B8] mb-6">
              Para visualizar o dashboard e gerenciar os dados, você precisa selecionar um projeto primeiro.
              Escolha um projeto no menu lateral ou crie um novo.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => navigate('/admin/projetos')}
                className="bg-gradient-to-r from-[#21808D] to-[#2A9D8F] hover:from-[#1a6a73] hover:to-[#21808D]"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Gerenciar Projetos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Project Info Banner */}
      <div className="glass-card p-4 border-l-4 border-[#21808D]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#94A3B8]">Projeto Atual</p>
            <h2 className="text-xl font-bold text-white">{selectedProject?.name}</h2>
            <p className="text-sm text-[#94A3B8]">
              {selectedProject?.city}, {selectedProject?.state} • {new Date(selectedProject?.startDate || '').toLocaleDateString('pt-BR')} - {new Date(selectedProject?.endDate || '').toLocaleDateString('pt-BR')}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/projetos')}
            className="border-[#334155] text-[#94A3B8]"
          >
            Trocar Projeto
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Inscritos"
          value={stats.registrations.value.toLocaleString()}
          target={stats.registrations.target.toLocaleString()}
          progress={stats.registrations.progress}
          icon={Users}
          trend="up"
          trendValue="+12%"
          color="teal"
        />
        <StatCard
          title="Receita"
          value={`R$ ${(stats.revenue.value / 1000).toFixed(0)}k`}
          target={`R$ ${(stats.revenue.target / 1000).toFixed(0)}k`}
          progress={stats.revenue.progress}
          icon={DollarSign}
          trend="up"
          trendValue="+8%"
          color="green"
        />
        <StatCard
          title="Mentorias"
          value={stats.mentorias.value.toString()}
          target={stats.mentorias.target.toString()}
          progress={stats.mentorias.progress}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Reuniões B2B"
          value={stats.b2b.value.toString()}
          target={stats.b2b.target.toString()}
          progress={stats.b2b.progress}
          icon={Handshake}
          color="purple"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-4 flex items-center">
          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center mr-4">
            <Rocket className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{startups.length}</p>
            <p className="text-gray-400 text-sm">Startups</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center">
          <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center mr-4">
            <Gem className="h-5 w-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{_sponsors.length}</p>
            <p className="text-gray-400 text-sm">Patrocinadores</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center">
          <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center mr-4">
            <TrendingUp className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{checkIns.length}</p>
            <p className="text-gray-400 text-sm">Check-ins Hoje</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center mr-4">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{pendingMentors.length + pendingStartups.length}</p>
            <p className="text-gray-400 text-sm">Pendentes</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickActions.map((action) => (
            <Button
              key={action.name}
              variant="outline"
              className="border-dark-300 text-gray-300 hover:text-white hover:border-teal-500 h-auto py-4 justify-start"
              onClick={action.action}
            >
              <div className={`w-10 h-10 rounded-lg bg-${action.color}-500/20 flex items-center justify-center mr-3`}>
                <action.icon className={`h-5 w-5 text-${action.color}-400`} />
              </div>
              {action.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Atividade Recente</h2>
            <Button variant="ghost" size="sm" className="text-teal-400">
              Ver todas
            </Button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start">
                <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${activity.type === 'success' ? 'bg-green-400' : 'bg-blue-400'
                  }`} />
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.action}</p>
                  <p className="text-gray-400 text-xs">{activity.detail}</p>
                </div>
                <span className="text-gray-500 text-xs">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Pendentes de Aprovação</h2>
            <Badge className="bg-orange-500/20 text-orange-400">
              {pendingMentors.length + pendingStartups.length}
            </Badge>
          </div>

          <div className="space-y-4">
            {pendingMentors.slice(0, 2).map((mentor) => (
              <div key={mentor.id} className="flex items-center justify-between p-3 bg-dark-100 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm">{mentor.name}</p>
                    <p className="text-gray-400 text-xs">Mentor - {mentor.specialties.join(', ')}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10">
                    Aprovar
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                    Rejeitar
                  </Button>
                </div>
              </div>
            ))}

            {pendingStartups.slice(0, 2).map((startup) => (
              <div key={startup.id} className="flex items-center justify-between p-3 bg-dark-100 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mr-3">
                    <Rocket className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm">{startup.name}</p>
                    <p className="text-gray-400 text-xs">Startup - {startup.sector}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10">
                    Aprovar
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                    Rejeitar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Próximas Mentorias</h2>
          <Button variant="ghost" size="sm" className="text-teal-400">
            Ver agenda
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.slice(0, 3).map((session) => (
            <div key={session.id} className="p-4 bg-dark-100 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <Badge className={
                  session.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                    session.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                }>
                  {session.status === 'scheduled' && <Clock className="h-3 w-3 mr-1" />}
                  {session.status}
                </Badge>
                <span className="text-teal-400 text-sm">
                  {new Date(session.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-white font-medium">{session.mentorName}</p>
              <p className="text-gray-400 text-sm">{session.menteeName}</p>
              {session.topic && (
                <p className="text-gray-500 text-xs mt-2">{session.topic}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
