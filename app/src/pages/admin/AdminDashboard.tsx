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
  CheckCircle2,
  Clock,
  AlertCircle,
  QrCode,
  Mail,
  Download,
  Users2,
  FolderOpen,
  Headset,
  Gift,
  MessageCircle,
  MoreVertical,
  Zap,
  XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
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
  useCheckIns,
  useSupportTickets,
  useRaffles,
  useStandCheckIns,
  useSessions,
  useCoupons
} from '@/hooks/useData';
import { SetupWizard } from '@/components/admin/SetupWizard';
import type { Mentor, Startup } from '@/types';
import { toast } from 'sonner';

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
  const colorClasses = {
    teal: { 
      text: 'text-teal-400', 
      bar: 'bg-teal-500', 
      bgOpacity: 'bg-teal-500/10',
      shadow: 'shadow-teal-500/20',
      border: 'border-teal-500/20',
      gradient: 'from-teal-500/5 to-transparent'
    },
    green: { 
      text: 'text-green-400', 
      bar: 'bg-green-500', 
      bgOpacity: 'bg-green-500/10',
      shadow: 'shadow-green-500/20',
      border: 'border-green-500/20',
      gradient: 'from-green-500/5 to-transparent'
    },
    blue: { 
      text: 'text-blue-400', 
      bar: 'bg-blue-500', 
      bgOpacity: 'bg-blue-500/10',
      shadow: 'shadow-blue-500/20',
      border: 'border-blue-500/20',
      gradient: 'from-blue-500/5 to-transparent'
    },
    purple: { 
      text: 'text-purple-400', 
      bar: 'bg-purple-500', 
      bgOpacity: 'bg-purple-500/10',
      shadow: 'shadow-purple-500/20',
      border: 'border-purple-500/20',
      gradient: 'from-purple-500/5 to-transparent'
    },
    orange: { 
      text: 'text-orange-400', 
      bar: 'bg-orange-500', 
      bgOpacity: 'bg-orange-500/10',
      shadow: 'shadow-orange-500/20',
      border: 'border-orange-500/20',
      gradient: 'from-orange-500/5 to-transparent'
    },
  }[color] || { 
    text: 'text-teal-400', 
    bar: 'bg-teal-500', 
    bgOpacity: 'bg-teal-500/10',
    shadow: 'shadow-teal-500/20',
    border: 'border-teal-500/20',
    gradient: 'from-teal-500/5 to-transparent'
  };

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className={`glass-card p-6 relative overflow-hidden group border ${colorClasses.border} hover:${colorClasses.shadow} transition-all duration-300`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses.gradient} blur-3xl rounded-full -mr-16 -mt-16`} />
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={`w-12 h-12 rounded-2xl ${colorClasses.bgOpacity} border ${colorClasses.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`h-6 w-6 ${colorClasses.text}`} />
        </div>
        <div className="flex flex-col items-end">
          {trend && (
            <div className={`flex items-center px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-1 ${
              trend === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
              {trendValue}
            </div>
          )}
          <button className="text-gray-600 hover:text-white transition-colors p-1">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-4xl font-black text-white mb-1 tracking-tighter">{value}</p>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.15em] mb-4">{title}</p>
        
        <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-600 mb-2 tracking-widest">
          <span>Meta: {target}</span>
          <span className={colorClasses.text}>{progress}%</span>
        </div>
        
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`${colorClasses.bar} h-full rounded-full shadow-[0_0_10px_rgba(33,128,141,0.5)]`}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function AdminDashboard() {
  const { selectedProject, isProjectSelected } = useProject();
  const navigate = useNavigate();
  const { data: registrations = [] } = useRegistrations();
  const { filter: filterMentors = () => [] } = useMentors();
  const { data: sessions = [] } = useMentoringSessions();
  const { data: b2bMeetings = [] } = useB2BMeetings();
  const { data: startups = [], filter: filterStartups = () => [] } = useStartups();
  const { data: _sponsors = [] } = useSponsors();
  const { data: transactions = [] } = useTransactions();
  const { data: checkIns = [] } = useCheckIns();
  const { data: tickets = [] } = useSupportTickets();
  const { data: raffles = [] } = useRaffles();
  const { data: standCheckIns = [] } = useStandCheckIns();
  const { data: allSessions = [] } = useSessions();
  const { data: allCoupons = [] } = useCoupons();

  const isInitialSetup = useMemo(() => {
    return (
      (selectedProject?.status === 'draft') || 
      (registrations.length === 0 && allSessions.length === 0)
    );
  }, [selectedProject, registrations.length, allSessions.length]);

  const quickActions = [
    { name: 'Sorteios', icon: Gift, color: 'orange', path: '/admin/sorteio' },
    { name: 'Suporte', icon: Headset, color: 'teal', path: '/admin/suporte' },
    {
      name: 'Entregar Leads',
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
        link.setAttribute('download', `leads_${selectedProject?.slug || 'evento'}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Exportação de leads iniciada');
      }
    },
    { name: 'E-mail Marketing', icon: Mail, color: 'purple', path: '/admin/comunicacao' },
  ];


  const stats = useMemo(() => {
    // Para Growth Experience, priorizamos a receita líquida das inscrições
    const isGE = selectedProject?.type === 'growth_experience';

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
    <div className="space-y-10 py-4 animate-in fade-in duration-700">
      {/* Onboarding / Setup Flow */}
      {isInitialSetup && (
        <div className="mb-4">
          <SetupWizard 
            project={selectedProject!} 
            data={{
              sessionsCount: allSessions.length,
              mentorsCount: filterMentors(() => true).length,
              registrationsCount: registrations.length,
              couponsCount: allCoupons.length
            }} 
          />
        </div>
      )}

      {/* Welcome & Project Info */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
            Olá, Admin <span className="text-brand-orange-coral">👋</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Aqui está o panorama geral do ecossistema <span className="text-white font-bold">{selectedProject?.name}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-2 rounded-2xl group transition-all hover:bg-white/[0.05]">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 shrink-0">
            <Zap className="h-6 w-6 text-teal-400" />
          </div>
          <div className="pr-4">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">Status do Evento</p>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm tracking-tight">Em Execução</span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            </div>
          </div>
          <Link to={selectedProject?.id ? `/admin/projetos?edit=${selectedProject.id}` : "/admin/projetos"}>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-white hover:bg-white/5 rounded-xl h-10 px-4 group-hover:text-teal-400 transition-all font-bold text-xs"
            >
              Configurações
            </Button>
          </Link>
        </div>
      </div>


      {/* Strategic Actions */}
      <div>
        <h2 className="text-sm font-black text-gray-600 uppercase tracking-[0.2em] mb-6 flex items-center">
          Ações Estratégicas
          <div className="h-px bg-white/5 flex-1 ml-6" />
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/admin/sorteio')}
            className="glass-card p-5 border-white/5 flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 group-hover:bg-orange-500/20 transition-all">
                <Gift className="h-6 w-6 text-orange-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-sm tracking-tight leading-none mb-1">Sorteios</p>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{raffles.filter(r => r.status === 'open').length} ATIVOS</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-gray-700 group-hover:text-orange-400 transition-colors" />
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/admin/suporte')}
            className="glass-card p-5 border-white/5 flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 group-hover:bg-teal-500/20 transition-all">
                <Headset className="h-6 w-6 text-teal-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-sm tracking-tight leading-none mb-1">Suporte</p>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{tickets.filter(t => t.status === 'open').length} TICKETS</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-gray-700 group-hover:text-teal-400 transition-colors" />
          </motion.button>

          <motion.button 
             whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
             whileTap={{ scale: 0.98 }}
             onClick={() => navigate('/admin/comunicacao')}
             className="glass-card p-5 border-white/5 flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500/20 transition-all">
                <Mail className="h-6 w-6 text-purple-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-sm tracking-tight leading-none mb-1">E-mail MKT</p>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">CAMPANHAS</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-gray-700 group-hover:text-purple-400 transition-colors" />
          </motion.button>

          <motion.button 
             whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
             whileTap={{ scale: 0.98 }}
             onClick={() => {
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
                link.setAttribute('download', `leads_${selectedProject?.slug || 'evento'}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('Leads exportados com sucesso');
             }}
             className="glass-card p-5 border-white/5 flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-all">
                <Download className="h-6 w-6 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-sm tracking-tight leading-none mb-1">Exportar</p>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{registrations.length} CONTATOS</p>
              </div>
            </div>
            <Download className="h-4 w-4 text-gray-700 group-hover:text-blue-400 transition-colors" />
          </motion.button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Participantes Totais"
          value={stats.registrations.value.toLocaleString()}
          target={stats.registrations.target.toLocaleString()}
          progress={stats.registrations.progress}
          icon={Users}
          trend="up"
          trendValue="+14% este mês"
          color="teal"
        />
        <StatCard
          title="Receita Realizada"
          value={`R$ ${(stats.revenue.value / 1000).toFixed(0)}k`}
          target={`R$ ${(stats.revenue.target / 1000).toFixed(0)}k`}
          progress={stats.revenue.progress}
          icon={DollarSign}
          trend="up"
          trendValue="+8.4%"
          color="green"
        />
        <StatCard
          title="Mentorias Realizadas"
          value={stats.mentorias.value.toString()}
          target={stats.mentorias.target.toString()}
          progress={stats.mentorias.progress}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Oportunidades B2B"
          value={stats.b2b.value.toString()}
          target={stats.b2b.target.toString()}
          progress={stats.b2b.progress}
          icon={Handshake}
          color="purple"
        />
      </div>

      {/* Operational Metrics */}
      <div>
        <h2 className="text-sm font-black text-gray-600 uppercase tracking-[0.2em] mb-6 flex items-center">
          Operação do Evento
          <div className="h-px bg-white/5 flex-1 ml-6" />
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-5 group hover:border-orange-500/20 transition-all cursor-pointer relative overflow-hidden" onClick={() => navigate('/admin/sorteio')}>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-all">
                <Rocket className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-black text-white tracking-tighter">{startups.length}</p>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Startups</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-5 group hover:border-yellow-500/20 transition-all cursor-pointer relative overflow-hidden" onClick={() => navigate('/admin/patrocinadores')}>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-all">
                <Gem className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-black text-white tracking-tighter">{_sponsors.length}</p>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sponsors</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 group hover:border-teal-500/20 transition-all cursor-pointer relative overflow-hidden" onClick={() => navigate('/admin/check-in')}>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500/20 transition-all">
                <QrCode className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <p className="text-2xl font-black text-white tracking-tighter">{checkIns.length}</p>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Check-ins Hoje</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 group hover:border-red-500/20 transition-all cursor-pointer relative overflow-hidden">
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-all">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-black text-white tracking-tighter">{tickets.filter(t => t.status === 'open').length + pendingMentors.length + pendingStartups.length}</p>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pendências</p>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Recent Activity */}
        <div className="glass-card p-8 border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Atividade Recente</h2>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">LIVE FEED</p>
            </div>
            <Button variant="ghost" size="sm" className="text-brand-orange-coral hover:bg-brand-orange-coral/10 rounded-xl font-bold text-xs" onClick={() => toast.info('Log completo em desenvolvimento')}>
              Ver todas
            </Button>
          </div>
          <div className="space-y-6 relative z-10">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start group">
                <div className="relative mr-4">
                  <div className={`w-3 h-3 rounded-full mt-1.5 shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 relative ${
                    activity.type === 'success' ? 'bg-green-500 shadow-green-500/20' : 'bg-blue-500 shadow-blue-500/20'
                  }`} />
                  {i !== recentActivity.length - 1 && (
                    <div className="absolute top-4 left-1.5 w-px h-10 bg-white/5 -translate-x-1/2" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white text-sm font-bold group-hover:text-brand-orange-coral transition-colors">{activity.action}</p>
                    <span className="text-gray-600 font-bold text-[10px] uppercase tracking-widest">{activity.time}</span>
                  </div>
                  <p className="text-gray-500 text-xs font-medium leading-relaxed">{activity.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-orange-coral/5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Pending Approvals */}
        <div className="glass-card p-8 border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Aprovação Necessária</h2>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">PONTOS DE ATENÇÃO</p>
            </div>
            <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full font-black text-[10px] tracking-widest">
              {pendingMentors.length + pendingStartups.length} PENDENTES
            </Badge>
          </div>

          <div className="space-y-4 relative z-10">
            {pendingMentors.slice(0, 2).map((mentor) => (
              <div key={mentor.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/[0.05] transition-all group">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 mr-4 group-hover:rotate-6 transition-transform">
                    <Users className="h-6 w-6 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-black leading-tight mb-1">{mentor.name}</p>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest line-clamp-1">Mentor • {mentor.specialties.join(', ')}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-400 hover:bg-green-500/10 rounded-lg">
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10 rounded-lg">
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {pendingStartups.slice(0, 2).map((startup) => (
              <div key={startup.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/[0.05] transition-all group">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 mr-4 group-hover:rotate-6 transition-transform">
                    <Rocket className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-black leading-tight mb-1">{startup.name}</p>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest line-clamp-1">Startup • {startup.sector}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-400 hover:bg-green-500/10 rounded-lg">
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10 rounded-lg">
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {(pendingMentors.length === 0 && pendingStartups.length === 0) && (
              <div className="py-12 text-center opacity-40">
                <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Tudo em dia!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="glass-card p-8 border-white/5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Próximas Mentorias</h2>
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">AGENDA EM TEMPO REAL</p>
          </div>
          <Button variant="ghost" size="sm" className="text-teal-400 hover:bg-teal-500/10 rounded-xl font-bold text-xs" onClick={() => toast.info('Gestão completa em breve')}>
            Ver agenda completa
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {sessions.slice(0, 3).map((session) => (
            <div key={session.id} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.05] transition-all">
              <div className="flex items-center justify-between mb-4">
                <Badge className={
                  session.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    session.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                }>
                  <p className="text-[10px] font-black tracking-widest">{session.status.toUpperCase()}</p>
                </Badge>
                <div className="flex items-center text-teal-400 text-xs font-bold">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  {new Date(session.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <p className="text-white font-black text-lg tracking-tight mb-1 group-hover:text-teal-400 transition-colors">{session.mentorName}</p>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">{session.menteeName}</p>
              {session.topic && (
                <p className="text-gray-400 text-[11px] leading-relaxed italic border-l-2 border-teal-500/30 pl-3">{session.topic}</p>
              )}
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="col-span-full py-12 text-center opacity-30">
              <Calendar className="h-10 w-10 text-gray-500 mx-auto mb-3" />
              <p className="text-xs font-black uppercase tracking-widest text-gray-600">Nenhuma mentoria agendada para hoje</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
