import { useState } from 'react';
import { 
  Download,
  FileText,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle,
  Calendar,
  PieChart,
  Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRegistrations, useMentors, useMentoringSessions, useStartups, useSponsors, useTransactions } from '@/hooks/useData';

const reportTypes = [
  {
    id: 'inscricoes',
    name: 'Relatório de Inscrições',
    description: 'Lista completa de inscritos com dados de pagamento e check-in',
    icon: Users,
    color: 'teal',
  },
  {
    id: 'financeiro',
    name: 'Relatório Financeiro',
    description: 'Receitas, despesas e balanço do evento',
    icon: DollarSign,
    color: 'green',
  },
  {
    id: 'mentorias',
    name: 'Relatório de Mentorias',
    description: 'Sessões agendadas, concluídas e avaliações',
    icon: Calendar,
    color: 'blue',
  },
  {
    id: 'startups',
    name: 'Relatório de Startups',
    description: 'Startups participantes e leads capturados',
    icon: TrendingUp,
    color: 'orange',
  },
  {
    id: 'patrocinadores',
    name: 'Relatório de Patrocinadores',
    description: 'Pipeline e entregáveis de patrocinadores',
    icon: PieChart,
    color: 'purple',
  },
  {
    id: 'presenca',
    name: 'Relatório de Presença',
    description: 'Check-ins por horário e taxa de presença',
    icon: CheckCircle,
    color: 'yellow',
  },
];

export function AdminRelatorios() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const { data: registrations } = useRegistrations();
  const { data: mentors } = useMentors();
  const { data: sessions } = useMentoringSessions();
  const { data: startups } = useStartups();
  const { data: sponsors } = useSponsors();
  const { data: transactions } = useTransactions();

  const handleGenerate = async (reportId: string) => {
    setGenerating(reportId);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    setGenerating(null);
    alert(`Relatório ${reportId} gerado com sucesso!`);
  };

  const stats = {
    totalInscricoes: registrations.length,
    totalMentores: mentors.length,
    totalMentorias: sessions.length,
    totalStartups: startups.length,
    totalPatrocinadores: sponsors.length,
    totalReceita: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-2">Data Inicial</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-2">Data Final</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white"
            />
          </div>
          <Button variant="outline" className="border-dark-300 text-gray-300">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-gray-400 text-sm">Inscrições</p>
          <p className="text-2xl font-bold text-white">{stats.totalInscricoes}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-gray-400 text-sm">Mentores</p>
          <p className="text-2xl font-bold text-teal-400">{stats.totalMentores}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-gray-400 text-sm">Mentorias</p>
          <p className="text-2xl font-bold text-blue-400">{stats.totalMentorias}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-gray-400 text-sm">Startups</p>
          <p className="text-2xl font-bold text-orange-400">{stats.totalStartups}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-gray-400 text-sm">Patrocinadores</p>
          <p className="text-2xl font-bold text-purple-400">{stats.totalPatrocinadores}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-gray-400 text-sm">Receita</p>
          <p className="text-2xl font-bold text-green-400">R${(stats.totalReceita / 1000).toFixed(0)}k</p>
        </div>
      </div>

      {/* Reports Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Gerar Relatórios</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => (
            <div key={report.id} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-${report.color}-500/20 flex items-center justify-center`}>
                  <report.icon className={`h-6 w-6 text-${report.color}-400`} />
                </div>
                <Badge className="bg-dark-300 text-gray-300">PDF</Badge>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">{report.name}</h3>
              <p className="text-gray-400 text-sm mb-6">{report.description}</p>

              <Button 
                className={`w-full bg-${report.color}-500 hover:bg-${report.color}-600 text-white`}
                onClick={() => handleGenerate(report.id)}
                disabled={generating === report.id}
              >
                {generating === report.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Gerar Relatório
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Relatórios Gerados Recentemente</h2>
        <div className="space-y-3">
          {[
            { name: 'Relatório de Inscrições', date: '2024-01-20', size: '2.4 MB' },
            { name: 'Relatório Financeiro', date: '2024-01-19', size: '1.8 MB' },
            { name: 'Relatório de Mentorias', date: '2024-01-18', size: '856 KB' },
          ].map((report, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-dark-100 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-teal-400 mr-3" />
                <div>
                  <p className="text-white text-sm">{report.name}</p>
                  <p className="text-gray-500 text-xs">{new Date(report.date).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm">{report.size}</span>
                <Button size="sm" variant="ghost" className="text-teal-400">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Report */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Relatório Personalizado</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Módulos</label>
            <div className="space-y-2">
              {['Inscrições', 'Mentorias', 'Startups', 'Patrocinadores', 'Financeiro'].map((mod) => (
                <label key={mod} className="flex items-center">
                  <input type="checkbox" className="rounded bg-dark-100 border-dark-300 text-teal-500 mr-2" />
                  <span className="text-gray-300 text-sm">{mod}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Formato</label>
            <div className="space-y-2">
              {['PDF', 'Excel', 'CSV'].map((format) => (
                <label key={format} className="flex items-center">
                  <input 
                    type="radio" 
                    name="format" 
                    className="bg-dark-100 border-dark-300 text-teal-500 mr-2" 
                    defaultChecked={format === 'PDF'}
                  />
                  <span className="text-gray-300 text-sm">{format}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <Button className="bg-teal-500 hover:bg-teal-600 text-white">
          <BarChart3 className="h-4 w-4 mr-2" />
          Gerar Relatório Personalizado
        </Button>
      </div>
    </div>
  );
}
