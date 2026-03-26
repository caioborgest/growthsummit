import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  BarChart3,
  PieChart,
  Building2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTransactions, useRegistrations, useProjects, useEmpresasIncentivadoras } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import { toast } from 'sonner';
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

const statusColors: Record<string, string> = {
  completed: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

export function AdminFinanceiro() {
  const { data: transactions } = useTransactions();
  const { data: registrations } = useRegistrations();
  const { update: updateProject } = useProjects();
  const { data: companies } = useEmpresasIncentivadoras();
  const { selectedProject } = useProject();
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
      await updateProject(selectedProject.id, {
        settings: {
          ...selectedProject.settings,
          goalRevenue: tempGoals.revenue,
          goalSponsorship: tempGoals.sponsorship,
          goalRegistrations: tempGoals.registrations
        }
      });
      toast.success('Metas atualizadas com sucesso!');
      setShowGoalModal(false);
    } catch {
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
    (r.status === 'pago' && !r.status_pagamento) // Fallback para registros legados
  );
  const paidRegistrationsCount = paidRegistrations.length;
  const registrationRevenue = paidRegistrations.reduce((sum, r) => sum + (r.valor_pago || r.amount || 0), 0);

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
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-dark-300">
        <button
          onClick={() => setActiveView('overview')}
          className={`pb-4 text-sm font-medium transition-colors ${activeView === 'overview'
            ? 'text-teal-400 border-b-2 border-teal-400'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          Visão Geral
        </button>
        <button
          onClick={() => setActiveView('transactions')}
          className={`pb-4 text-sm font-medium transition-colors ${activeView === 'transactions'
            ? 'text-teal-400 border-b-2 border-teal-400'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          Transações
        </button>
      </div>

      {/* Overview */}
      {activeView === 'overview' && (
        <>
          {/* Main Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <Badge className="bg-green-500/20 text-green-400">Receita</Badge>
              </div>
              <p className="text-3xl font-bold text-white">R$ {totalIncome.toLocaleString()}</p>
              <p className="text-gray-400 text-sm mt-1">Total recebido</p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-400" />
                </div>
                <Badge className="bg-red-500/20 text-red-400">Despesas</Badge>
              </div>
              <p className="text-3xl font-bold text-white">R$ {expenses.toLocaleString()}</p>
              <p className="text-gray-400 text-sm mt-1">Total gasto</p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-teal-400" />
                </div>
                <Badge className={balance >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                  Saldo
                </Badge>
              </div>
              <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                R$ {balance.toLocaleString()}
              </p>
              <p className="text-gray-400 text-sm mt-1">Balanço atual</p>
            </div>

            <div className="glass-card p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-orange-400" />
                </div>
                <Badge className="bg-orange-500/20 text-orange-400">Resumo Inscrições</Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Bruto:</span>
                  <span className="text-white">R$ {(registrationRevenue + registrationDiscounts).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Cupons:</span>
                  <span className="text-red-400">- R$ {registrationDiscounts.toLocaleString('pt-BR')}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-[11px]">
                  <span className="text-white">Líquido:</span>
                  <span className="text-green-400">R$ {registrationRevenue.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 border-l-4 border-teal-500">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-teal-400" />
                </div>
                <Badge className="bg-teal-500/20 text-teal-400">Empresas Incentivadoras</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">R$ {incentiveCompanyRevenue.toLocaleString('pt-BR')}</p>
                <p className="text-gray-400 text-sm mt-1">Total investido (Aprovadas)</p>
              </div>
            </div>
          </div>

          {/* Charts Placeholder */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Receitas por Categoria</h2>
                <PieChart className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {Object.entries(incomeByCategory).map(([category, amount]) => (
                  <div key={category} className="flex items-center">
                    <span className="text-gray-400 text-sm w-32">{category}</span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-dark-300 rounded-full h-2">
                        <div
                          className="bg-teal-500 h-2 rounded-full"
                          style={{ width: `${(amount / totalIncome) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-white text-sm">R$ {amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Despesas por Categoria</h2>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {Object.entries(expensesByCategory).map(([category, amount]) => (
                  <div key={category} className="flex items-center">
                    <span className="text-gray-400 text-sm w-32">{category}</span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-dark-300 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${(amount / expenses) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-white text-sm">R$ {amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Financial Goals */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Metas Financeiras</h2>
              <Button
                variant="outline"
                size="sm"
                className="border-dark-300 text-gray-300 hover:text-white"
                onClick={() => {
                  setTempGoals(goals);
                  setShowGoalModal(true);
                }}
              >
                Editar Metas
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 text-sm">Receita</span>
                  <span className="text-teal-400 text-sm">{Math.round((totalIncome / goals.revenue) * 100)}%</span>
                </div>
                <div className="w-full bg-dark-300 rounded-full h-3">
                  <div
                    className="bg-teal-500 h-3 rounded-full"
                    style={{ width: `${Math.min((totalIncome / goals.revenue) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">R$ {totalIncome.toLocaleString()} / R$ {goals.revenue.toLocaleString()}</p>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 text-sm">Patrocínio</span>
                  <span className="text-blue-400 text-sm">{Math.round((incomeByCategory['Patrocínio'] || 0) / goals.sponsorship * 100)}%</span>
                </div>
                <div className="w-full bg-dark-300 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{ width: `${Math.min(((incomeByCategory['Patrocínio'] || 0) / goals.sponsorship) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">R$ {(incomeByCategory['Patrocínio'] || 0).toLocaleString()} / R$ {goals.sponsorship.toLocaleString()}</p>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 text-sm">Inscrições (Qtd)</span>
                  <span className="text-green-400 text-sm">{Math.round((paidRegistrationsCount / goals.registrations) * 100)}%</span>
                </div>
                <div className="w-full bg-dark-300 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: `${Math.min((paidRegistrationsCount / goals.registrations) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">{paidRegistrationsCount} / {goals.registrations} inscritos</p>
              </div>
            </div>
          </div>

          {/* Edit Goals Modal */}
          {showGoalModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="glass-card max-w-md w-full p-6 rounded-2xl space-y-4 relative">
                <h3 className="text-xl font-bold text-white mb-4">Editar Metas Financeiras</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Meta de Receita Total (R$)
                    </label>
                    <input
                      type="number"
                      value={tempGoals.revenue}
                      onChange={(e) => setTempGoals({ ...tempGoals, revenue: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Meta de Patrocínio (R$)
                    </label>
                    <input
                      type="number"
                      value={tempGoals.sponsorship}
                      onChange={(e) => setTempGoals({ ...tempGoals, sponsorship: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Meta de Inscrições (Unidades)
                    </label>
                    <input
                      type="number"
                      value={tempGoals.registrations}
                      onChange={(e) => setTempGoals({ ...tempGoals, registrations: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white focus:outline-none focus:border-green-500"
                    />
                  </div>

                  <div className="p-4 bg-dark-400/50 rounded-xl border border-white/5 space-y-3">
                    <p className="text-xs font-bold text-teal-400 uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" /> Calculadora de Receita
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 uppercase">Qtd</label>
                        <input
                          type="number"
                          placeholder="Ex: 300"
                          value={calcQty === 0 ? '' : calcQty}
                          onChange={(e) => setCalcQty(Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-dark-200 border border-dark-300 rounded text-sm text-white focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 uppercase">Preço Unitário (R$)</label>
                        <input
                          type="number"
                          placeholder="Ex: 497"
                          value={calcPrice === 0 ? '' : calcPrice}
                          onChange={(e) => setCalcPrice(Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-dark-200 border border-dark-300 rounded text-sm text-white focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                      <span className="text-xs text-gray-400">Total Estimado:</span>
                      <span className="text-sm font-bold text-white">R$ {calcTotal.toLocaleString('pt-BR')}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-[10px] text-teal-400 hover:bg-teal-500/10 h-7"
                      onClick={() => {
                        setTempGoals({ ...tempGoals, revenue: calcTotal, registrations: calcQty });
                        toast.info('Valores aplicados às metas acima');
                      }}
                    >
                      APLICAR ÀS METAS
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1 border-dark-300 text-gray-400 hover:text-white"
                    onClick={() => setShowGoalModal(false)}
                    disabled={isUpdatingGoals}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={handleUpdateGoals}
                    disabled={isUpdatingGoals}
                  >
                    {isUpdatingGoals ? 'Salvando...' : 'Salvar Metas'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )
      }

      {/* Transactions */}
      {
        activeView === 'transactions' && (
          <>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white text-sm"
              >
                <option value="all">Todos os tipos</option>
                <option value="income">Receita</option>
                <option value="expense">Despesa</option>
              </select>
              <Button variant="outline" className="border-dark-300 text-gray-300" onClick={() => toast.info('Exportação do relatório financeiro em desenvolvimento')}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-300">
                      <th className="p-4 text-left text-gray-400 font-medium">Data</th>
                      <th className="p-4 text-left text-gray-400 font-medium">Descrição</th>
                      <th className="p-4 text-left text-gray-400 font-medium">Categoria</th>
                      <th className="p-4 text-left text-gray-400 font-medium">Tipo</th>
                      <th className="p-4 text-left text-gray-400 font-medium">Valor</th>
                      <th className="p-4 text-left text-gray-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-dark-300 hover:bg-dark-100/50">
                        <td className="p-4 text-gray-300">
                          {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-4 text-white">{transaction.description}</td>
                        <td className="p-4">
                          <Badge className={categoryColors[transaction.category] || 'bg-gray-500/20 text-gray-400'}>
                            {transaction.category}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={
                            transaction.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }>
                            {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                          </Badge>
                        </td>
                        <td className={`p-4 font-medium ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                          }`}>
                          {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toLocaleString()}
                        </td>
                        <td className="p-4">
                          <Badge className={statusColors[transaction.status]}>
                            {transaction.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )
      }
    </div >
  );
}
