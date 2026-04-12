import React, { useMemo } from 'react';
import {
  Users,
  DollarSign,
  Calendar,
  Handshake,
  Rocket,
  Gem,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  QrCode,
  Mail,
  Download,
  FolderOpen,
  Headset,
  Gift,
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
  useSessions,
  useCoupons,
  useRegistrationBatches,
  usePartnerTeam
} from '@/hooks/useData';
import { SetupWizard } from '@/components/admin/SetupWizard';
import type { Mentor, Startup } from '@/types';
import { toast } from 'sonner';

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

const StatCard = ({ title, value, target, progress, icon: Icon, trend, trendValue, color }: StatCardProps) => {
  const colorClasses: Record<string, any> = {
    teal: { 
      text: 'text-teal-400', 
      bar: 'bg-teal-500', 
      bgOpacity: 'bg-teal-500/10',
      shadow: 'shadow-glow-teal/20',
      border: 'border-white/5',
      accent: 'teal-500'
    },
    orange: { 
      text: 'text-brand-orange-coral', 
      bar: 'bg-brand-orange-coral', 
      bgOpacity: 'bg-brand-orange-coral/10',
      shadow: 'shadow-glow-orange/20',
      border: 'border-white/5',
      accent: 'brand-orange-coral'
    },
    green: { 
      text: 'text-emerald-400', 
      bar: 'bg-emerald-500', 
      bgOpacity: 'bg-emerald-500/10',
      shadow: 'shadow-emerald-500/20',
      border: 'border-white/5',
      accent: 'emerald-500'
    },
    blue: { 
      text: 'text-blue-400', 
      bar: 'bg-blue-500', 
      bgOpacity: 'bg-blue-500/10',
      shadow: 'shadow-blue-500/20',
      border: 'border-white/5',
      accent: 'blue-500'
    },
    purple: { 
      text: 'text-purple-400', 
      bar: 'bg-purple-500', 
      bgOpacity: 'bg-purple-500/10',
      shadow: 'shadow-purple-500/20',
      border: 'border-white/5',
      accent: 'purple-500'
    }
  };

  const current = colorClasses[color] || colorClasses.teal;

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-card hover-card p-4 sm:p-6 border-white/5 rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden group"
    >
      <div className={`absolute -right-4 -top-4 p-6 sm:p-8 opacity-5 group-hover:scale-110 transition-transform duration-700`}>
         <Icon className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
      </div>
      
      <div className="flex items-start justify-between mb-3 sm:mb-4 relative z-10">
        <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${current.bgOpacity} border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
          <Icon className={`h-5 w-5 sm:h-7 sm:w-7 ${current.text}`} />
        </div>
        {trend && (
          <div className={`flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${
            trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> : <ArrowDownRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />}
            {trendValue}
          </div>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-gray-500 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.25em] mb-1 italic">{title}</h3>
        <p className="text-xl sm:text-4xl font-black text-white mb-4 sm:mb-6 tracking-tighter tabular-nums italic">{value}</p>
        
        <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-black uppercase mb-1.5 sm:mb-2 tracking-widest">
          <span className="text-gray-700 truncate mr-2">Meta: {target}</span>
          <span className={current.text}>{progress}%</span>
        </div>
        
        <div className="w-full bg-white/[0.03] border border-white/5 rounded-full h-1 sm:h-1.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`${current.bar} h-full rounded-full shadow-glow-${current.accent === 'teal-500' ? 'teal' : 'orange'}`}
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
  const { filter: filterMentors } = useMentors();
  const { data: sessions = [] } = useMentoringSessions();
  const { data: b2bMeetings = [] } = useB2BMeetings();
  const { data: startups = [], filter: filterStartups } = useStartups();
  const { data: _sponsors = [] } = useSponsors();
  const { data: transactions = [] } = useTransactions();
  const { data: checkIns = [] } = useCheckIns();
  const { data: tickets = [] } = useSupportTickets();
  const { data: raffles = [] } = useRaffles();
  const { data: allSessions = [] } = useSessions();
  const { data: allCoupons = [] } = useCoupons();
  const { data: batches = [] } = useRegistrationBatches();
  const { data: partnerTeam = [] } = usePartnerTeam();
  // I will check imports.


  const isInitialSetup = useMemo(() => {
    return (
      (selectedProject?.status === 'draft') || 
      (registrations.length === 0 && allSessions.length === 0)
    );
  }, [selectedProject, registrations.length, allSessions.length]);



  const stats = useMemo(() => {
    // Para Growth Experience, priorizamos a receita líquida das inscrições
    const isGE = selectedProject?.type === 'growth_experience';

    const totalRevenue = isGE
      ? (registrations
        .filter(r => 
          r.status === 'active' || 
          r.status === 'paid' || 
          (r as any).payment_status === 'paid'
        )
        .reduce((sum, r) => sum + (r.amount || 0), 0) +
        (batches || [])
          .filter(b => b.paymentStatus === 'paid')
          .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0))
      : transactions
        .filter(t => t.type === 'income' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);


    const targets = {
      registrations: selectedProject?.settings?.goalRegistrations || selectedProject?.settings?.maxRegistrations || 1500,
      revenue: selectedProject?.settings?.goalRevenue || (selectedProject?.settings?.ticketPrices?.vip || 0) * 10 || 616000,
      sponsorship: selectedProject?.settings?.goalSponsorship || 250000,
      mentorias: selectedProject?.settings?.maxMentors ? selectedProject.settings.maxMentors * 5 : 100,
      b2b: selectedProject?.settings?.maxCompanies ? selectedProject.settings.maxCompanies * 2 : 120,
    };

    const publicRegistrations = registrations.filter(r => (r as any).indicacaoTipo !== 'parceiro' && (r as any).referral_type !== 'parceiro');
    // Simplificando: Pega todos de partner_team_members que estão cadastrados
    const totalStaff = partnerTeam.length;

    return {
      registrations: {
        value: publicRegistrations.length,
        target: targets.registrations,
        progress: targets.registrations > 0 ? Math.round((publicRegistrations.length / targets.registrations) * 100) : 0
      },
      workTeam: {
        value: totalStaff,
        target: 200, // Meta arbitrária para equipe
        progress: totalStaff > 0 ? Math.round((totalStaff / 200) * 100) : 0
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
  }, [registrations, transactions, sessions, b2bMeetings, selectedProject, batches, partnerTeam]);

  const pendingMentors = filterMentors((m: Mentor) => m.status === 'pending');
  const pendingStartups = filterStartups((s: Startup) => s.status === 'pending');

  // Gerar Atividade Recente dinamicamente (Live Feed)
  const recentActivity = useMemo(() => {
    const list = [
      ...registrations.slice(0, 10).map(r => ({
        timestamp: new Date(r.createdAt).getTime(),
        action: 'Nova Inscrição',
        detail: `${r.name || 'Participante'} - ${r.ticketNumber || 'N/A'}`,
        type: 'success' as const
      })),
      ...checkIns.slice(0, 5).map(c => ({
        timestamp: new Date(c.timestamp).getTime(),
        action: 'Check-in Realizado',
        detail: `Participante credenciado na portaria: ${c.location || 'Central'}`,
        type: 'info' as const
      })),
      ...transactions.filter(t => t.type === 'income').slice(0, 5).map(t => ({
        timestamp: new Date(t.date).getTime(),
        action: 'Receita Confirmada',
        detail: `${t.description} - R$ ${t.amount.toLocaleString('pt-BR')}`,
        type: 'premium' as const
      }))
    ];

    return list
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 8)
      .map(item => ({
        ...item,
        time: new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }));
  }, [registrations, checkIns, transactions]);

  // Show project selection prompt if no project is selected
  if (!isProjectSelected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="bg-card border-border-theme max-w-lg w-full shadow-premium">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
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

  const exportLeads = () => {
    const headers = ['ID', 'Nome', 'Email', 'Empresa', 'Tipo', 'Status'];
    const csvContent = [
      headers.join(','),
      ...registrations.map(r => [
        r.id,
        `"${r.name || r.nome || ''}"`,
        r.email,
        `"${r.empresa || ''}"`,
        r.ticketType || 'padrão',
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
  };

  return (
    <div className="space-y-10 py-6 animate-in fade-in duration-700">
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

      {/* Premium Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tighter italic mb-1 uppercase">
            PAINEL DE <span className="text-brand-orange-coral">CONTROLE</span>
          </h1>
          <p className="text-gray-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">
            Gerenciando o ecossistema <span className="text-white">{selectedProject?.name}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 p-1 bg-dark-200/50 border border-white/5 rounded-2xl sm:rounded-[2rem] backdrop-blur-xl h-11 sm:h-14 pr-4 sm:pr-6">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0 ml-1">
            <Zap className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-400 fill-emerald-400/20" />
          </div>
          <div>
            <p className="text-[8px] sm:text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mb-0.5 sm:mb-1">Status Global</p>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-white font-black text-[10px] sm:text-xs italic uppercase">Ativo</span>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald" />
            </div>
          </div>
          <div className="h-6 sm:h-8 w-px bg-white/5 mx-1.5 sm:mx-2" />
          <Link to={selectedProject?.id ? `/admin/projetos?edit=${selectedProject.id}` : "/admin/projetos"}>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-white hover:bg-white/5 rounded-xl font-black text-[8px] sm:text-[9px] uppercase tracking-widest px-2 sm:px-4 h-8 sm:h-auto"
            >
              CONFIG
            </Button>
          </Link>
        </div>
      </div>

      {/* Strategic Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Sorteios', val: `${raffles.filter(r => r.status === 'open').length} ATIVOS`, icon: Gift, color: 'text-brand-orange-coral', bg: 'bg-brand-orange-coral/10', path: '/admin/sorteio' },
          { label: 'Suporte', val: `${tickets.filter(t => t.status === 'open').length} TICKETS`, icon: Headset, color: 'text-teal-400', bg: 'bg-teal-500/10', path: '/admin/suporte' },
          { label: 'E-mail MKT', val: 'CAMPANHAS', icon: Mail, color: 'text-purple-400', bg: 'bg-purple-500/10', path: '/admin/comunicacao' },
          { label: 'Exportar', val: `${registrations.length} CONTATOS`, icon: Download, color: 'text-blue-400', bg: 'bg-blue-500/10', action: 'export' },
        ].map((item, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -4 }}
            onClick={() => item.action === 'export' ? exportLeads() : navigate(item.path!)}
            className="glass-card hover-card p-4 sm:p-5 border-white/5 flex items-center justify-between group cursor-pointer rounded-[1.5rem]"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${item.bg} flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform`}>
                <item.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${item.color}`} />
              </div>
              <div className="text-left">
                <p className="text-white font-black text-sm italic uppercase leading-none mb-1">{item.label}</p>
                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{item.val}</p>
              </div>
            </div>
            <ArrowUpRight className={`h-4 w-4 text-gray-700 group-hover:${item.color} transition-colors`} />
          </motion.div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard
          title="Inscrições Público"
          value={stats.registrations.value.toLocaleString()}
          target={stats.registrations.target.toLocaleString()}
          progress={stats.registrations.progress}
          icon={Users}
          trend="up"
          trendValue="+14% este mês"
          color="teal"
        />
        <StatCard
          title="Equipe de Trabalho"
          value={stats.workTeam.value.toString()}
          target={stats.workTeam.target.toString()}
          progress={stats.workTeam.progress}
          icon={Handshake}
          color="orange"
        />
        <StatCard
          title="Receita Realizada"
          value={`R$ ${(stats.revenue.value / 1000).toFixed(0)}k`}
          target={`R$ ${(stats.revenue.target / 1000).toFixed(0)}k`}
          progress={stats.revenue.progress}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Agenda Mentorias"
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
        <h2 className="text-sm font-black text-gray-700 uppercase tracking-[0.25em] mb-6 flex items-center italic">
          OPERAÇÃO DO EVENTO
          <div className="h-px bg-white/5 flex-1 ml-6" />
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Startups', val: startups.length, icon: Rocket, color: 'text-brand-orange-coral', bg: 'orange-500/10', path: '/admin/startups' },
            { label: 'Patrocinadores', val: _sponsors.length, icon: Gem, color: 'text-yellow-400', bg: 'yellow-500/10', path: '/admin/patrocinadores' },
            { label: 'Check-ins Hoje', val: checkIns.length, icon: QrCode, color: 'text-teal-400', bg: 'teal-500/10', path: '/admin/check-in' },
            { label: 'Pendências', val: (tickets.filter(t => t.status === 'open').length + pendingMentors.length + pendingStartups.length), icon: AlertCircle, color: 'text-red-400', bg: 'red-500/10', path: '/admin/suporte' },
          ].map((op, i) => (
            <div 
              key={i} 
              className="glass-card hover-card p-6 group transition-all cursor-pointer border-white/5 rounded-[2rem]" 
              onClick={() => op.path && navigate(op.path)}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all`}>
                  <op.icon className={`h-6 w-6 ${op.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-black text-white tracking-tighter italic">{op.val}</p>
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{op.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity & Approvals */}
      <div className="grid lg:grid-cols-2 gap-10">
        <div className="glass-card p-10 border-white/5 rounded-[2.5rem] relative overflow-hidden">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Atividade Recente</h2>
              <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">LIVE FEED • GROWTH EXPERIENCE</p>
            </div>
            <Button variant="ghost" size="sm" className="text-brand-orange-coral hover:bg-brand-orange-coral/10 rounded-xl font-black text-[10px] uppercase tracking-widest px-4">
              Ver Logs
            </Button>
          </div>
          <div className="space-y-8 relative z-10">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start group">
                <div className="relative mr-5">
                  <div className={`w-3.5 h-3.5 rounded-full mt-1 ${
                    activity.type === 'success' ? 'bg-emerald-500 shadow-glow-emerald' : 'bg-blue-500 shadow-glow-blue'
                  } z-10 relative border-2 border-dark-200`} />
                  {i !== recentActivity.length - 1 && (
                    <div className="absolute top-5 left-1/2 w-px h-[calc(100%+32px)] bg-white/5 -translate-x-1/2" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white text-sm font-black italic uppercase tracking-tight group-hover:text-brand-orange-coral transition-colors">{activity.action}</p>
                    <span className="text-gray-700 font-black text-[10px] uppercase tracking-widest">{activity.time}</span>
                  </div>
                  <p className="text-gray-500 text-xs font-bold leading-relaxed truncate">{activity.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-10 border-white/5 rounded-[2.5rem] relative overflow-hidden">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Aprovação pendente</h2>
              <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">PONTOS DE ATENÇÃO OPERACIONAL</p>
            </div>
            <Badge className="bg-brand-orange-coral/10 text-brand-orange-coral border-none px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest">
              {pendingMentors.length + pendingStartups.length} PENDENTES
            </Badge>
          </div>

          <div className="space-y-4 relative z-10">
            {pendingMentors.slice(0, 3).map((mentor) => (
              <div key={mentor.id} className="p-5 bg-white/[0.02] border border-white/5 rounded-[1.5rem] flex items-center justify-between hover:bg-white/[0.04] transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-black italic uppercase italic leading-none mb-1">{mentor.name}</p>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest line-clamp-1 truncate max-w-[150px]">Mentor • {mentor.specialties.join(', ')}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" className="h-10 w-10 text-emerald-400 hover:text-white hover:bg-emerald-500/20 rounded-xl border border-white/5">
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-10 w-10 text-brand-orange-coral hover:text-white hover:bg-brand-orange-coral/20 rounded-xl border border-white/5">
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {pendingStartups.slice(0, 2).map((startup) => (
              <div key={startup.id} className="p-5 bg-white/[0.02] border border-white/5 rounded-[1.5rem] flex items-center justify-between hover:bg-white/[0.04] transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-orange-coral/10 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                    <Rocket className="h-5 w-5 text-brand-orange-coral" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-black italic uppercase italic leading-none mb-1">{startup.name}</p>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest line-clamp-1 truncate max-w-[150px]">Startup • {startup.sector}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                   <Button size="icon" variant="ghost" className="h-10 w-10 text-emerald-400 hover:text-white hover:bg-emerald-500/20 rounded-xl border border-white/5">
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-10 w-10 text-brand-orange-coral hover:text-white hover:bg-brand-orange-coral/20 rounded-xl border border-white/5">
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {(pendingMentors.length === 0 && pendingStartups.length === 0) && (
              <div className="py-20 text-center opacity-30">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Procedimentos operacionais em dia</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="glass-card p-8 border-border-theme relative overflow-hidden shadow-premium">
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight">Próximas Mentorias</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">AGENDA EM TEMPO REAL</p>
          </div>
          <Button variant="ghost" size="sm" className="text-teal-400 hover:bg-teal-500/10 rounded-xl font-bold text-xs" onClick={() => toast.info('Gestão completa em breve')}>
            Ver agenda completa
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {sessions.slice(0, 3).map((session) => (
            <div key={session.id} className="p-5 bg-accent/30 border border-border-theme rounded-2xl group hover:bg-accent transition-all shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <Badge className={
                  session.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    session.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                }>
                  <p className="text-[10px] font-black tracking-widest">
                    {session.status === 'scheduled' ? 'AGENDADO' : 
                     session.status === 'completed' ? 'CONCLUÍDO' : 
                     session.status.toUpperCase()}
                  </p>
                </Badge>
                <div className="flex items-center text-teal-400 text-xs font-bold">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  {new Date(session.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <p className="text-foreground font-black text-lg tracking-tight mb-1 group-hover:text-teal-400 transition-colors">{session.mentorName}</p>
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-3">{session.menteeName}</p>
              {session.topicOfInterest && (
                <p className="text-muted-foreground text-[11px] leading-relaxed italic border-l-2 border-teal-500/30 pl-3">{session.topicOfInterest}</p>
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
