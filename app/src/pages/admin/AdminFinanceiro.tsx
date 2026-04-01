import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  BarChart3,
  PieChart,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTransactions, useRegistrations, useProjects, useEmpresasIncentivadoras, useRegistrationBatches } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import { toast } from 'sonner';
import { getStatusConfig } from '@/lib/ui-constants';
import type { EmpresaIncentivadora } from '@/types';

const categoryColors: Record<string, string> = {
  'Inscrições': 'bg-teal-500/20 text-teal-400',
  'Patrocínio': 'bg-blue-500/20 text-blue-400',
  'Startups': 'bg-orange-500/20 text-orange-400',
  'Rodada B2B': 'bg-purple-500/20 text-purple-400',
  'Venue': 'bg-red-500/20 text-red-400',
  'Catering': 'bg-yellow-500/20 text-yellow-400',
  'Marketing': 'bg-pink-500/20 text-pink-400',
  'Equipe': 'bg-gray-500/20 text-gray-400',
};


export function AdminFinanceiro() {
  const { data: transactions } = useTransactions();
  const { data: registrations } = useRegistrations();
  const { data: batches } = useRegistrationBatches();
  const { update: updateProject } = useProjects();
  const { data: companies } = useEmpresasIncentivadoras();
  const { selectedProject, setSelectedProject } = useProject();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [activeView, setActiveView] = useState<'overview' | 'transactions'>('overview');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [isUpdatingGoals, setIsUpdatingGoals] = useState(false);

  // Get goals from project settings or fallback to defaults
  const goals = {
    revenue: selectedProject?.settings?.goalRevenue || 616000,
    sponsorship: selectedProject?.settings?.goalSponsorship || 200000,
    registrations: selectedProject?.settings?.goalRegistrations || 300
  };

  const [tempGoals, setTempGoals] = useState(goals);

  const handleUpdateGoals = async () => {
    if (!selectedProject?.id) return;
    setIsUpdatingGoals(true);
    try {
      const updatedSettings = {
        ...selectedProject.settings,
        goalRevenue: tempGoals.revenue,
        goalSponsorship: tempGoals.sponsorship,
        goalRegistrations: tempGoals.registrations
      };

      await updateProject(selectedProject.id, {
        settings: updatedSettings
      });

      // Sincronizar o contexto global para que as outras páginas (Dashboard) vejam a mudança
      setSelectedProject({
        ...selectedProject,
        settings: updatedSettings
      });

      toast.success('Metas atualizadas com sucesso!');
      setShowGoalModal(false);
    } catch (err) {
      console.error('Erro ao atualizar metas:', err);
      toast.error('Erro ao atualizar metas');
    } finally {
      setIsUpdatingGoals(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    return typeFilter === 'all' || t.type === typeFilter;
  });

  const baseIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const paidRegistrations = registrations.filter(r => 
    r.status_pagamento === 'pago' || 
    r.status_pagamento === 'paid' || 
    (r as any).paymentStatus === 'pago' ||
    (r as any).paymentStatus === 'paid' ||
    r.status === 'paid' ||
    r.status === 'pago' ||
    r.status === 'ativo'
  );
  const paidRegistrationsCount = paidRegistrations.length;
  
  // Somar receita de inscrições individuais + Lotes Corporativos (Equipes)
  const individualRevenue = paidRegistrations.reduce((sum, r) => sum + (r.valor_pago || r.amount || 0), 0);
  const batchRevenue = (batches || [])
    .filter(b => b.statusPagamento === 'paid' || b.statusPagamento === 'pago')
    .reduce((sum, b) => sum + (Number(b.valorTotal) || 0), 0);
    
  const registrationRevenue = individualRevenue + batchRevenue;

  const registrationDiscounts = registrations
    .reduce((sum, r) => sum + (r.discountAmount || 0), 0);

  const incentiveCompanyRevenue = (companies || [])
    .filter(c => c.status === 'approved' || c.status === 'aprovado')
    .reduce((sum: number, c: EmpresaIncentivadora) => sum + (c.amount || 0), 0);

  const totalIncome = baseIncome + registrationRevenue + incentiveCompanyRevenue;
  const balance = totalIncome - expenses;

  const incomeByCategory = transactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Aggregate external revenue into categories
  if (registrationRevenue > 0) {
    incomeByCategory['Inscrições'] = (incomeByCategory['Inscrições'] || 0) + registrationRevenue;
  }
  if (incentiveCompanyRevenue > 0) {
    const sponsorCategory = 'Patrocínio';
    incomeByCategory[sponsorCategory] = (incomeByCategory[sponsorCategory] || 0) + incentiveCompanyRevenue;
  }

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Calculator state
  const [calcQty, setCalcQty] = useState(0);
  const [calcPrice, setCalcPrice] = useState(0);
  const calcTotal = calcQty * calcPrice;

  return (
    <div className="space-y-10 py-6 animate-in fade-in duration-700">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic mb-1 uppercase">
            GESTAO <span className="text-brand-orange-coral">FINANCEIRA</span>
          </h1>
          <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">
            Monitoramento de Receitas e Fluxo de Caixa do Evento
          </p>
        </div>
        
        <div className="flex items-center gap-4 p-1 bg-dark-200/50 border border-white/5 rounded-[2rem] backdrop-blur-xl h-14 pr-6">
          <div className="w-12 h-12 rounded-[1.5rem] bg-brand-orange-coral/10 flex items-center justify-center border border-brand-orange-coral/20 shrink-0 ml-1">
            <DollarSign className="h-6 w-6 text-brand-orange-coral" />
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Status de Caixa</p>
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-xs italic uppercase">Saldo {balance >= 0 ? 'Positivo' : 'Negativo'}</span>
              <div className={`w-2 h-2 rounded-full ${balance >= 0 ? 'bg-emerald-500 shadow-glow-emerald' : 'bg-red-500 animate-pulse'}`} />
            </div>
          </div>
          <div className="h-8 w-px bg-white/5 mx-2" />
          <Button
            variant="ghost" 
            size="sm"
            onClick={() => toast.info('Relatório detalhado em processamento')}
            className="text-gray-500 hover:text-white hover:bg-white/5 rounded-xl font-black text-[9px] uppercase tracking-widest px-4"
          >
            RELATORIO COMPLETO
          </Button>
        </div>
      </div>

      {/* Tabs System */}
      <div className="flex p-1 bg-dark-200/50 border border-white/5 rounded-[2rem] w-fit mb-10">
        <button
          onClick={() => setActiveView('overview')}
          className={`flex items-center gap-2 px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
            activeView === 'overview'
              ? 'bg-brand-orange-coral text-white shadow-glow-orange'
              : 'text-gray-500 hover:text-white'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Visão Geral
        </button>
        <button
          onClick={() => setActiveView('transactions')}
          className={`flex items-center gap-2 px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
            activeView === 'transactions'
              ? 'bg-brand-orange-coral text-white shadow-glow-orange'
              : 'text-gray-500 hover:text-white'
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          Transações
        </button>
      </div>

      {/* Overview Content */}
      {activeView === 'overview' && (
        <div className="space-y-10">
          {/* Main Financial Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card hover-card p-6 border-white/5 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                 <TrendingUp className="h-16 w-16 text-white" />
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500">
                  <TrendingUp className="h-7 w-7 text-emerald-400" />
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-none font-black text-[9px] tracking-widest uppercase">Receita</Badge>
              </div>
              <div className="relative z-10">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.25em] mb-1 italic">Total Bruto</p>
                <p className="text-4xl font-black text-white tracking-tighter tabular-nums italic">R$ {totalIncome.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-4 text-[9px] font-black text-gray-700 uppercase tracking-widest">
                  <div className="w-1 h-1 rounded-full bg-emerald-500" />
                  Confirmado em Conta
                </div>
              </div>
            </div>

            <div className="glass-card hover-card p-6 border-white/5 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                 <TrendingDown className="h-16 w-16 text-white" />
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500">
                  <TrendingDown className="h-7 w-7 text-red-400" />
                </div>
                <Badge className="bg-red-500/10 text-red-400 border-none font-black text-[9px] tracking-widest uppercase">Despesas</Badge>
              </div>
              <div className="relative z-10">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.25em] mb-1 italic">Saídas Totais</p>
                <p className="text-4xl font-black text-white tracking-tighter tabular-nums italic">R$ {expenses.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-4 text-[9px] font-black text-gray-700 uppercase tracking-widest">
                  <div className="w-1 h-1 rounded-full bg-red-500" />
                  Pagamentos Realizados
                </div>
              </div>
            </div>

            <div className="glass-card hover-card p-6 border-white/5 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                 <DollarSign className="h-16 w-16 text-white" />
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${balance >= 0 ? 'bg-teal-500/10' : 'bg-red-500/10'} flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
                  <DollarSign className={`h-7 w-7 ${balance >= 0 ? 'text-teal-400' : 'text-red-400'}`} />
                </div>
                <Badge className={balance >= 0 ? 'bg-teal-500/10 text-teal-400 border-none px-3 py-1 font-black text-[9px] tracking-widest uppercase' : 'bg-red-500/10 text-red-400 border-none px-3 py-1 font-black text-[9px] tracking-widest uppercase'}>
                  {balance >= 0 ? 'SURPLUS' : 'DÉFICIT'}
                </Badge>
              </div>
              <div className="relative z-10">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.25em] mb-1 italic">Balanço Final</p>
                <p className={`text-4xl font-black tracking-tighter tabular-nums italic ${balance >= 0 ? 'text-white' : 'text-red-400'}`}>
                  R$ {balance.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-4 text-[9px] font-black text-gray-700 uppercase tracking-widest">
                  <div className={`w-1 h-1 rounded-full ${balance >= 0 ? 'bg-teal-500' : 'bg-red-500'}`} />
                  Rentabilidade do Evento
                </div>
              </div>
            </div>

            <div className="glass-card hover-card p-6 border-white/5 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                 <BarChart3 className="h-16 w-16 text-white" />
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-brand-orange-coral/10 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500">
                  <BarChart3 className="h-7 w-7 text-brand-orange-coral" />
                </div>
                <Badge className="bg-brand-orange-coral/10 text-brand-orange-coral border-none font-black text-[9px] tracking-widest uppercase">Inscrições</Badge>
              </div>
              <div className="relative z-10">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.25em] mb-1 italic">Venda de Tickets</p>
                <p className="text-4xl font-black text-white tracking-tighter tabular-nums italic">R$ {registrationRevenue.toLocaleString('pt-BR').split(',')[0]}k</p>
                <div className="flex justify-between items-center mt-4 text-[9px] font-black uppercase tracking-widest">
                  <span className="text-gray-700">Cupons:</span>
                  <span className="text-red-400">- R$ {registrationDiscounts.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts & Analysis */}
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="glass-card p-10 border-white/5 rounded-[2.5rem] relative overflow-hidden">
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Receitas por Categoria</h2>
                  <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">DISTRIBUIÇÃO DE APORTES</p>
                </div>
                <PieChart className="h-6 w-6 text-teal-400 opacity-20" />
              </div>
              <div className="space-y-6 relative z-10">
                {Object.entries(incomeByCategory).map(([category, amount]) => (
                  <div key={category} className="space-y-2 group">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">{category}</span>
                      <span className="text-white text-xs font-black italic tabular-nums">R$ {amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-white/[0.03] border border-white/5 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(amount / totalIncome) * 100}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="bg-teal-500 h-full rounded-full shadow-glow-teal"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-10 border-white/5 rounded-[2.5rem] relative overflow-hidden">
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Despesas por Categoria</h2>
                  <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">FLUXO DE SAÍDA</p>
                </div>
                <BarChart3 className="h-6 w-6 text-brand-orange-coral opacity-20" />
              </div>
              <div className="space-y-6 relative z-10">
                {Object.entries(expensesByCategory).map(([category, amount]) => (
                  <div key={category} className="space-y-2 group">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">{category}</span>
                      <span className="text-white text-xs font-black italic tabular-nums">R$ {amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-white/[0.03] border border-white/5 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(amount / expenses) * 100}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="bg-brand-orange-coral h-full rounded-full shadow-glow-orange"
                      />
                    </div>
                  </div>
                ))}
                {Object.keys(expensesByCategory).length === 0 && (
                  <div className="py-12 text-center opacity-20">
                     <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma despesa registrada</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financial Goals Tracker */}
          <div className="glass-card p-10 border-white/5 rounded-[2.5rem] relative overflow-hidden">
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div>
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Metas Estratégicas</h2>
                <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">PROGRESSO EM TEMPO REAL</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-white/5 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl font-black text-[9px] uppercase tracking-widest px-4"
                onClick={() => {
                  setTempGoals(goals);
                  setShowGoalModal(true);
                }}
              >
                EDITAR METAS
              </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10 relative z-10">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Faturamento</span>
                  <span className="text-teal-400 text-lg font-black italic tabular-nums leading-none">{Math.round((totalIncome / goals.revenue) * 100)}%</span>
                </div>
                <div className="w-full bg-white/[0.03] border border-white/5 rounded-full h-3 p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((totalIncome / goals.revenue) * 100, 100)}%` }}
                    className="bg-teal-500 h-full rounded-full shadow-glow-teal"
                  />
                </div>
                <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">R$ {totalIncome.toLocaleString()} / <span className="text-gray-500">R$ {goals.revenue.toLocaleString()}</span></p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Patrocínios</span>
                  <span className="text-blue-400 text-lg font-black italic tabular-nums leading-none">{Math.round((incomeByCategory['Patrocínio'] || 0) / goals.sponsorship * 100)}%</span>
                </div>
                <div className="w-full bg-white/[0.03] border border-white/5 rounded-full h-3 p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((incomeByCategory['Patrocínio'] || 0) / goals.sponsorship) * 100, 100)}%` }}
                    className="bg-blue-500 h-full rounded-full shadow-glow-blue"
                  />
                </div>
                <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">R$ {(incomeByCategory['Patrocínio'] || 0).toLocaleString()} / <span className="text-gray-500">R$ {goals.sponsorship.toLocaleString()}</span></p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Tickets (Qtd)</span>
                  <span className="text-brand-orange-coral text-lg font-black italic tabular-nums leading-none">{Math.round((paidRegistrationsCount / goals.registrations) * 100)}%</span>
                </div>
                <div className="w-full bg-white/[0.03] border border-white/5 rounded-full h-3 p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((paidRegistrationsCount / goals.registrations) * 100, 100)}%` }}
                    className="bg-brand-orange-coral h-full rounded-full shadow-glow-orange"
                  />
                </div>
                <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">{paidRegistrationsCount} / <span className="text-gray-500">{goals.registrations} INSCRITOS</span></p>
              </div>
            </div>
          </div>

          {/* Edit Goals Modal */}
          {showGoalModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card max-w-md w-full p-10 border-white/10 rounded-[2.5rem] shadow-2xl relative"
              >
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">Ajustar Metas</h3>
                  <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">CONFIGURAÇÃO DE PERFORMANCE</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic ml-1">Meta de Receita (R$)</label>
                    <input
                      type="number"
                      value={tempGoals.revenue}
                      onChange={(e) => setTempGoals({ ...tempGoals, revenue: Number(e.target.value) })}
                      className="w-full px-5 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-white font-black italic focus:outline-none focus:border-teal-500 transition-all tabular-nums"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic ml-1">Meta de Patrocínio (R$)</label>
                    <input
                      type="number"
                      value={tempGoals.sponsorship}
                      onChange={(e) => setTempGoals({ ...tempGoals, sponsorship: Number(e.target.value) })}
                      className="w-full px-5 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-white font-black italic focus:outline-none focus:border-blue-500 transition-all tabular-nums"
                    />
                  </div>

                  {/* Calculator Widget */}
                  <div className="p-6 bg-white/[0.03] rounded-[1.5rem] border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em] italic">Calculadora de Tickets</p>
                      <Zap className="h-3 w-3 text-teal-400 fill-teal-400/20" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Qtd Esperada</label>
                        <input
                          type="number"
                          placeholder="Ex: 300"
                          value={calcQty === 0 ? '' : calcQty}
                          onChange={(e) => setCalcQty(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-dark-400 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500 font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Ticket Avg (R$)</label>
                        <input
                          type="number"
                          placeholder="Ex: 497"
                          value={calcPrice === 0 ? '' : calcPrice}
                          onChange={(e) => setCalcPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-dark-400 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500 font-bold"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                      <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Total Estimado:</span>
                      <span className="text-sm font-black text-white italic">R$ {calcTotal.toLocaleString('pt-BR')}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-[9px] font-black text-teal-400 hover:bg-teal-500/10 h-8 uppercase tracking-widest"
                      onClick={() => {
                        setTempGoals({ ...tempGoals, revenue: calcTotal, registrations: calcQty });
                        toast.info('Valores aplicados com sucesso');
                      }}
                    >
                      APLICAR AO PLANEJAMENTO
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4 mt-10">
                  <Button
                    variant="ghost"
                    className="flex-1 text-gray-500 hover:text-white hover:bg-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                    onClick={() => setShowGoalModal(false)}
                    disabled={isUpdatingGoals}
                  >
                    DESCARTAR
                  </Button>
                  <Button
                    className="flex-1 bg-brand-orange-coral text-white hover:bg-brand-orange-coral/90 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-glow-orange"
                    onClick={handleUpdateGoals}
                    disabled={isUpdatingGoals}
                  >
                    {isUpdatingGoals ? 'SALVANDO...' : 'SALVAR METAS'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}

      {/* Transactions Table Section */}
      {activeView === 'transactions' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex p-1 bg-dark-200/50 border border-white/5 rounded-2xl overflow-hidden">
               {['all', 'income', 'expense'].map((t) => (
                 <button
                   key={t}
                   onClick={() => setTypeFilter(t)}
                   className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                     typeFilter === t ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'
                   }`}
                 >
                   {t === 'all' ? 'Todos' : t === 'income' ? 'Receitas' : 'Despesas'}
                 </button>
               ))}
            </div>
            
            <Button 
              variant="outline" 
              className="border-white/5 text-gray-500 hover:text-white hover:bg-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest px-6"
              onClick={() => toast.info('Exportação iniciada...')}
            >
              <Download className="h-4 w-4 mr-2" />
              DOWNLOAD CSV
            </Button>
          </div>

          <div className="admin-table-container">
            <div className="overflow-x-auto">
              <table className="w-full responsive-table">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="p-5 text-left text-gray-700 font-black uppercase text-[10px] tracking-[0.25em] italic">Data</th>
                    <th className="p-5 text-left text-gray-700 font-black uppercase text-[10px] tracking-[0.25em] italic">Descrição</th>
                    <th className="p-5 text-left text-gray-700 font-black uppercase text-[10px] tracking-[0.25em] italic">Categoria</th>
                    <th className="p-5 text-left text-gray-700 font-black uppercase text-[10px] tracking-[0.25em] italic">Tipo</th>
                    <th className="p-5 text-right text-gray-700 font-black uppercase text-[10px] tracking-[0.25em] italic">Valor</th>
                    <th className="p-5 text-center text-gray-700 font-black uppercase text-[10px] tracking-[0.25em] italic">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-5 text-gray-500 text-xs font-black tabular-nums" data-label="Data">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-5" data-label="Descrição">
                        <p className="text-white text-sm font-black italic uppercase tracking-tight group-hover:text-brand-orange-coral transition-colors">{transaction.description}</p>
                      </td>
                      <td className="p-5" data-label="Categoria">
                        <Badge className={`${categoryColors[transaction.category] || 'bg-gray-500/10 text-gray-500'} border-none px-3 py-1 rounded-full font-black text-[9px] tracking-widest uppercase`}>
                          {transaction.category}
                        </Badge>
                      </td>
                      <td className="p-5" data-label="Tipo">
                        <Badge className={
                          transaction.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }>
                          <p className="text-[9px] font-black tracking-widest uppercase">{transaction.type === 'income' ? 'Receita' : 'Despesa'}</p>
                        </Badge>
                      </td>
                      <td className={`p-5 text-right font-black tabular-nums italic text-sm ${
                        transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                      }`} data-label="Valor">
                        {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-5" data-label="Status">
                        {(() => {
                          const config = getStatusConfig(transaction.status);
                          return (
                            <Badge className={`${config.color} border-none px-3 py-1 rounded-full font-black text-[9px] tracking-widest uppercase flex items-center justify-center gap-1.5 w-fit mx-auto`}>
                              {(config as any).icon && <config.icon className="h-3 w-3" />}
                              {config.label}
                            </Badge>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
