import { useMemo } from 'react';
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

const GE_TRIUNFO_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const GE_PETROLINA_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

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
  const colorClasses: Record<string, { bg: string, text: string, bar: string, bgOpacity: string }> = {
    teal: { bg: 'bg-teal-500', text: 'text-teal-400', bar: 'bg-teal-500', bgOpacity: 'bg-teal-500/20' },
    green: { bg: 'bg-green-500', text: 'text-green-400', bar: 'bg-green-500', bgOpacity: 'bg-green-500/20' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-400', bar: 'bg-blue-500', bgOpacity: 'bg-blue-500/20' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-400', bar: 'bg-purple-500', bgOpacity: 'bg-purple-500/20' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-400', bar: 'bg-orange-500', bgOpacity: 'bg-orange-500/20' },
  };

  const style = colorClasses[color] || colorClasses.teal;

  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${style.bgOpacity} flex items-center justify-center`}>
          <Icon className={`h-6 w-6 ${style.text}`} />
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
          className={`${style.bar} h-2 rounded-full transition-all`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { selectedProject, isProjectSelected } = useProject();
  const navigate = useNavigate();
  const { data: registrations } = useRegistrations();
  const { filter: filterMentors } = useMentors();
  const { data: sessions } = useMentoringSessions();
  const { data: b2bMeetings } = useB2BMeetings();
  const { data: startups, filter: filterStartups } = useStartups();
  const { data: _sponsors } = useSponsors();
  const { data: transactions } = useTransactions();
  const { data: checkIns } = useCheckIns();

  const quickActions = [
    { name: 'Aprovar Mentor', icon: CheckCircle, color: 'green', path: '/admin/mentores' },
    {
      name: 'Exportar Inscritos',
      icon: Download,
      color: 'blue',
      action: () => {
        if (registrations.length === 0) {
          toast.error('Nenhum inscrito para exportar');
          return;
        }
        const headers = ['ID', 'Nome', 'Email', 'Empresa', 'Tipo', 'Status'];
        const csvContent = [
          headers.join(','),
          ...registrations.map(r => [
            r.id,
            `"${r.nome}"`,
            r.email,
            `"${r.empresa || ''}"`,
            r.tipoInscricao || 'padrão',
            r.status
          ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `inscritos_${selectedProject?.slug || 'evento'}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Exportação iniciada');
      }
    },
    { name: 'Enviar Email', icon: Mail, color: 'purple', path: '/admin/comunicacao' },
    { name: 'Ver Check-ins', icon: QrCode, color: 'teal', path: '/admin/check-in' },
    { name: 'Matching B2B', icon: Users2, color: 'orange', path: '/admin/rodada-negocios' },
  ];


  const stats = useMemo(() => {
    // Para Growth Experience, priorizamos a receita líquida das inscrições
    const isGE = selectedProject?.id?.startsWith('ge-') || selectedProject?.id === GE_TRIUNFO_ID;

    const registrationRevenue = isGE
      ? registrations
        .filter(r => r.status === 'ativo' || r.status === 'pago')
        .reduce((sum, r) => sum + (r.amount || 0), 0)
      : 0;

    const totalRevenue = isGE
      ? registrationRevenue
      : transactions
        .filter(t => t.type === 'income' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

    const targets = {
      registrations: selectedProject?.settings?.goalRegistrations || selectedProject?.settings?.maxRegistrations || 1500,
      revenue: (selectedProject?.settings?.ticketPrices?.vip || 0) * 10 || 616000,
      mentorias: selectedProject?.settings?.maxMentors ? selectedProject.settings.maxMentors * 5 : 100,
      b2b: selectedProject?.settings?.maxCompanies ? selectedProject.settings.maxCompanies * 2 : 120,
    };

    return {
      registrations: {
        value: registrations.length,
        target: targets.registrations,
        progress: targets.registrations > 0 ? Math.round((registrations.length / targets.registrations) * 100) : 0
      },
      revenue: {
        value: totalRevenue,
        target: targets.revenue,
        progress: targets.revenue > 0 ? Math.round((totalRevenue / targets.revenue) * 100) : 0
      },
      mentorias: {
        value: sessions.length,
        target: targets.mentorias,
        progress: targets.mentorias > 0 ? Math.round((sessions.length / targets.mentorias) * 100) : 0
      },
      b2b: {
        value: b2bMeetings.length,
        target: targets.b2b,
        progress: targets.b2b > 0 ? Math.round((b2bMeetings.length / targets.b2b) * 100) : 0
      },
    };
  }, [registrations, transactions, sessions, b2bMeetings, selectedProject]);

  const pendingMentors = filterMentors((m: Mentor) => m.status === 'pending');
  const pendingStartups = filterStartups((s: Startup) => s.status === 'pending');

  // Gerar Atividade Recente dinamicamente
  const recentActivity = [
    ...registrations.slice(0, 3).map(r => ({
      action: 'Nova inscrição',
      detail: `${r.nome || 'Usuário'} - ${r.ticketType === 'vip' ? 'VIP' : r.ticketType === 'pro' ? 'Pro' : 'Standard'}`,
      time: new Date(r.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: 'success' as const
    })),
    ...sessions.slice(0, 2).map(s => ({
      action: 'Mentoria agendada',
      detail: `${s.menteeName} + ${s.mentorName}`,
      time: new Date(s.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: 'info' as const
    }))
  ].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5);

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
              onClick={() => {
                if ('path' in action && action.path) navigate(action.path);
                if ('action' in action && action.action) action.action();
              }}
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
            <Button variant="ghost" size="sm" className="text-teal-400" onClick={() => toast.info('Dashboard detalhado pendente')}>
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
                  <Button size="sm" variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10" onClick={() => toast.success('Presença simulada')}>
                    Aprovar
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10" onClick={() => toast.info('Ação revogada simulada')}>
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
                  <Button size="sm" variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10" onClick={() => toast.success('Ação rápida simulada')}>
                    Aprovar
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10" onClick={() => toast.info('Cancelamento simulado')}>
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
          <Button variant="ghost" size="sm" className="text-teal-400" onClick={() => toast.info('Gestão de equipe em desenvolvimento')}>
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
