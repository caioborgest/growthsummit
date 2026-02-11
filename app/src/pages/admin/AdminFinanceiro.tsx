import { useState } from 'react';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/hooks/useData';

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
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [activeView, setActiveView] = useState<'overview' | 'transactions'>('overview');

  const filteredTransactions = transactions.filter(t => {
    return typeFilter === 'all' || t.type === typeFilter;
  });

  const income = transactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  const incomeByCategory = transactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-dark-300">
        <button
          onClick={() => setActiveView('overview')}
          className={`pb-4 text-sm font-medium transition-colors ${
            activeView === 'overview' 
              ? 'text-teal-400 border-b-2 border-teal-400' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Visão Geral
        </button>
        <button
          onClick={() => setActiveView('transactions')}
          className={`pb-4 text-sm font-medium transition-colors ${
            activeView === 'transactions' 
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
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <Badge className="bg-green-500/20 text-green-400">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  Receita
                </Badge>
              </div>
              <p className="text-3xl font-bold text-white">R$ {income.toLocaleString()}</p>
              <p className="text-gray-400 text-sm mt-1">Total recebido</p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-400" />
                </div>
                <Badge className="bg-red-500/20 text-red-400">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  Despesas
                </Badge>
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
                          style={{ width: `${(amount / income) * 100}%` }}
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
            <h2 className="text-lg font-semibold text-white mb-4">Metas Financeiras</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 text-sm">Receita</span>
                  <span className="text-teal-400 text-sm">{Math.round((income / 616000) * 100)}%</span>
                </div>
                <div className="w-full bg-dark-300 rounded-full h-3">
                  <div 
                    className="bg-teal-500 h-3 rounded-full"
                    style={{ width: `${Math.min((income / 616000) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">R$ {income.toLocaleString()} / R$ 616.000</p>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 text-sm">Patrocínio</span>
                  <span className="text-blue-400 text-sm">{Math.round((incomeByCategory['Patrocínio'] || 0) / 200000 * 100)}%</span>
                </div>
                <div className="w-full bg-dark-300 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full"
                    style={{ width: `${Math.min(((incomeByCategory['Patrocínio'] || 0) / 200000) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">R$ {(incomeByCategory['Patrocínio'] || 0).toLocaleString()} / R$ 200.000</p>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 text-sm">Inscrições</span>
                  <span className="text-green-400 text-sm">{Math.round((incomeByCategory['Inscrições'] || 0) / 300000 * 100)}%</span>
                </div>
                <div className="w-full bg-dark-300 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: `${Math.min(((incomeByCategory['Inscrições'] || 0) / 300000) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">R$ {(incomeByCategory['Inscrições'] || 0).toLocaleString()} / R$ 300.000</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Transactions */}
      {activeView === 'transactions' && (
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
            <Button variant="outline" className="border-dark-300 text-gray-300">
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
                      <td className={`p-4 font-medium ${
                        transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
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
      )}
    </div>
  );
}
