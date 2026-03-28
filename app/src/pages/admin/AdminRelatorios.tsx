import { useState, useMemo } from 'react';
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
  Filter,
  FileSpreadsheet,
  Gift,
  Headset,
  QrCode
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { exportToCSV } from '@/utils/csv';
import {
  useRegistrations,
  useMentors,
  useMentoringSessions,
  useStartups,
  useSponsors,
  useTransactions,
  usePitchScores,
  useCheckInsAtividades,
  useSessions,
  useRaffles,
  useSupportTickets,
  useStandCheckIns,
  useStands,
  useSupportQualityStats
} from '@/hooks/useData';
import { toast } from 'sonner';
import { useProject } from '@/contexts/ProjectContext';
import { logger } from '@/lib/logger';
import {
  generateInscricoesReport,
  generateFinanceiroReport,
  generateMentoriasReport,
  generateStartupsReport,
  generatePatrocinadoresReport,
  generatePresencaReport,
  generateSupportReport,
  generateRafflesReport,
  generateStandsReport
} from '@/lib/reports';

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
  {
    id: 'sorteios',
    name: 'Relatório de Sorteios',
    description: 'Histórico de ganhadores e engajamento em tempo-real',
    icon: Gift,
    color: 'orange',
  },
  {
    id: 'suporte',
    name: 'Relatório de Suporte',
    description: 'Tempo médio de resposta e tickets resolvidos',
    icon: Headset,
    color: 'teal',
  },
  {
    id: 'stands',
    name: 'Relatório de Stands',
    description: 'Engajamento no circuito e leads gerados por stand',
    icon: QrCode,
    color: 'blue',
  },
];

export function AdminRelatorios() {
  const { selectedProject } = useProject();
  const [generating, setGenerating] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const { data: registrations } = useRegistrations();
  const { data: mentors } = useMentors();
  const { data: sessions } = useMentoringSessions();
  const { data: startups } = useStartups();
  const { data: sponsors } = useSponsors();
  const { data: transactions } = useTransactions();
  const { data: pitchScores } = usePitchScores();
  const { data: attendance } = useCheckInsAtividades();
  const { data: activitySessions } = useSessions();
  const { data: raffles } = useRaffles();
  const { data: tickets } = useSupportTickets();
  const { data: standCheckIns } = useStandCheckIns();
  const { data: stands } = useStands();
  const qualityStats = useSupportQualityStats();

  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      const dateMatch = (!dateRange.start || r.createdAt >= dateRange.start) && 
                       (!dateRange.end || r.createdAt <= dateRange.end);
      const currentStatus = (r as any).status || (r as any).status_pagamento;
      const statusMatch = statusFilter === 'all' || currentStatus === statusFilter;
      return dateMatch && statusMatch;
    });
  }, [registrations, dateRange, statusFilter]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const dateMatch = (!dateRange.start || t.date >= dateRange.start) && 
                       (!dateRange.end || t.date <= dateRange.end);
      return dateMatch;
    });
  }, [transactions, dateRange]);

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const dateMatch = (!dateRange.start || s.scheduledAt >= dateRange.start) && 
                       (!dateRange.end || s.scheduledAt <= dateRange.end);
      return dateMatch;
    });
  }, [sessions, dateRange]);

  const handleGenerate = async (reportId: string, format: 'pdf' | 'csv' = 'pdf') => {
    setGenerating(`${reportId}-${format}`);

    try {
      const projectName = selectedProject?.name || 'Growth Experience';
      await new Promise(resolve => setTimeout(resolve, 600));

      if (format === 'csv') {
        let exportData: Record<string, unknown>[] = [];
        switch (reportId) {
          case 'inscricoes': exportData = filteredRegistrations as unknown as Record<string, unknown>[]; break;
          case 'financeiro': exportData = filteredTransactions as unknown as Record<string, unknown>[]; break;
          case 'mentorias': exportData = filteredSessions as unknown as Record<string, unknown>[]; break;
          case 'startups': exportData = startups as unknown as Record<string, unknown>[]; break;
          case 'patrocinadores': exportData = sponsors as unknown as Record<string, unknown>[]; break;
          case 'presenca': exportData = attendance as unknown as Record<string, unknown>[]; break;
          case 'sorteios': exportData = (raffles || []) as unknown as Record<string, unknown>[]; break;
          case 'suporte': exportData = (tickets || []) as unknown as Record<string, unknown>[]; break;
          case 'stands': exportData = (standCheckIns || []) as unknown as Record<string, unknown>[]; break;
        }
        exportToCSV(exportData, `relatorio-${reportId}`);
        toast.success(`CSV de ${reportId} exportado!`);
        return;
      }

      switch (reportId) {
        case 'inscricoes':
          generateInscricoesReport(filteredRegistrations, projectName);
          break;
        case 'financeiro':
          generateFinanceiroReport(filteredTransactions, projectName);
          break;
        case 'mentorias':
          generateMentoriasReport(filteredSessions, projectName);
          break;
        case 'startups':
          generateStartupsReport(startups, pitchScores, projectName);
          break;
        case 'patrocinadores':
          generatePatrocinadoresReport(sponsors, projectName);
          break;
        case 'presenca':
          generatePresencaReport(activitySessions, attendance, projectName);
          break;
        case 'suporte':
          generateSupportReport(tickets, qualityStats, projectName);
          break;
        case 'sorteios':
          generateRafflesReport(raffles, projectName);
          break;
        case 'stands':
          generateStandsReport(stands, standCheckIns, projectName);
          break;
        default:
          toast.info(`O relatório de ${reportId} está disponível apenas em CSV na v3.0`);
          return;
      }

      toast.success(`PDF de ${reportId} gerado!`);
    } catch (error) {
      logger.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório.');
    } finally {
      setGenerating(null);
    }
  };

  const stats = {
    totalInscricoes: filteredRegistrations.length,
    totalMentores: mentors.length,
    totalMentorias: filteredSessions.length,
    totalStartups: startups.length,
    totalPatrocinadores: sponsors.length,
    totalReceita: filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    totalTickets: (tickets || []).length,
    totalSorteios: (raffles || []).length,
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
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-2">Status Pagamento</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white"
            >
              <option value="all">Todos</option>
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <Button variant="outline" className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10" onClick={() => toast.success('Filtros aplicados')}>
            <Filter className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </Button>
        </div>
      </div>
      
      {/* Quick Stats Updated */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-gray-400 text-sm">Inscrições</p>
          <p className="text-2xl font-bold text-white">{stats.totalInscricoes}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-gray-400 text-sm">Tickets Suporte</p>
          <p className="text-2xl font-bold text-teal-400">{stats.totalTickets}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-gray-400 text-sm">Sorteios Realizados</p>
          <p className="text-2xl font-bold text-orange-400">{stats.totalSorteios}</p>
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

              <div className="flex gap-2">
                <Button
                  className={`flex-1 bg-${report.color}-500 hover:bg-${report.color}-600 text-white`}
                  onClick={() => handleGenerate(report.id, 'pdf')}
                  disabled={!!generating}
                >
                  {generating === `${report.id}-pdf` ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className={`border-${report.color}-500/50 text-${report.color}-400`}
                  onClick={() => handleGenerate(report.id, 'csv')}
                  disabled={!!generating}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>
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
                <Button size="sm" variant="ghost" className="text-teal-400" onClick={() => handleGenerate('inscricoes', 'pdf')}>
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
        <Button className="bg-teal-500 hover:bg-teal-600 text-white" onClick={() => handleGenerate('inscricoes', 'pdf')}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Gerar Relatório Consolidado
        </Button>
      </div>
    </div>
  );
}
