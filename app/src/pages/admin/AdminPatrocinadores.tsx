import { useState } from 'react';
import { 
  Search, 
  Gem,
  CheckCircle,
  ExternalLink,
  Plus,
  MoreHorizontal,
  TrendingUp,
  Target
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSponsors } from '@/hooks/useData';

const statusColors: Record<string, string> = {
  closed: 'bg-green-500/20 text-green-400',
  negotiation: 'bg-yellow-500/20 text-yellow-400',
  prospect: 'bg-blue-500/20 text-blue-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const levelColors: Record<string, string> = {
  diamond: 'from-blue-400 to-blue-600',
  gold: 'from-yellow-400 to-yellow-600',
  silver: 'from-gray-300 to-gray-500',
  bronze: 'from-orange-400 to-orange-600',
};

const levelLabels: Record<string, string> = {
  diamond: 'Diamante',
  gold: 'Ouro',
  silver: 'Prata',
  bronze: 'Bronze',
};

export function AdminPatrocinadores() {
  const { data: sponsors, update } = useSponsors();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [_selectedSponsor, _setSelectedSponsor] = useState<string | null>(null);

  const filteredSponsors = sponsors.filter(sponsor => {
    const matchesSearch = 
      sponsor.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sponsor.contactName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sponsor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvestment = sponsors
    .filter(s => s.status === 'closed')
    .reduce((sum, s) => sum + s.investment, 0);

  const closedCount = sponsors.filter(s => s.status === 'closed').length;
  const negotiationCount = sponsors.filter(s => s.status === 'negotiation').length;

  const handleStatusChange = async (id: string, status: 'prospect' | 'negotiation' | 'closed' | 'cancelled') => {
    await update(id, { status });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar patrocinador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 w-full sm:w-80 bg-dark-100 border-dark-300 text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white text-sm"
          >
            <option value="all">Todos os status</option>
            <option value="closed">Fechado</option>
            <option value="negotiation">Negociação</option>
            <option value="prospect">Prospect</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
        <Button className="bg-teal-500 hover:bg-teal-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Novo Patrocinador
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{sponsors.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Fechados</p>
          <p className="text-2xl font-bold text-green-400">{closedCount}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Em Negociação</p>
          <p className="text-2xl font-bold text-yellow-400">{negotiationCount}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Investimento Total</p>
          <p className="text-2xl font-bold text-teal-400">R$ {(totalInvestment / 1000).toFixed(0)}k</p>
        </div>
      </div>

      {/* Pipeline Progress */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Pipeline de Patrocínio</h2>
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Meta: R$ 200k</span>
            <span className="text-teal-400 text-sm">{Math.round((totalInvestment / 200000) * 100)}%</span>
          </div>
          <div className="w-full bg-dark-300 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-teal-500 to-teal-400 h-3 rounded-full transition-all"
              style={{ width: `${Math.min((totalInvestment / 200000) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-4">
            {['Prospect', 'Negociação', 'Fechado'].map((stage, i) => (
              <div key={stage} className="text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1 ${
                  i === 0 ? 'bg-blue-500/20' : i === 1 ? 'bg-yellow-500/20' : 'bg-green-500/20'
                }`}>
                  <Target className={`h-5 w-5 ${
                    i === 0 ? 'text-blue-400' : i === 1 ? 'text-yellow-400' : 'text-green-400'
                  }`} />
                </div>
                <p className="text-gray-400 text-xs">{stage}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sponsors Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSponsors.map((sponsor) => (
          <div key={sponsor.id} className="glass-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${levelColors[sponsor.level]} flex items-center justify-center`}>
                <Gem className="h-7 w-7 text-white" />
              </div>
              <Badge className={statusColors[sponsor.status]}>
                {sponsor.status}
              </Badge>
            </div>

            <h3 className="text-lg font-semibold text-white mb-1">{sponsor.companyName}</h3>
            <p className="text-teal-400 text-sm mb-1">{levelLabels[sponsor.level]}</p>
            <p className="text-gray-400 text-sm mb-4">{sponsor.contactName}</p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Investimento:</span>
                <span className="text-white font-medium">R$ {sponsor.investment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Email:</span>
                <span className="text-gray-300">{sponsor.contactEmail}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Telefone:</span>
                <span className="text-gray-300">{sponsor.contactPhone}</span>
              </div>
            </div>

            {/* Deliverables */}
            {sponsor.deliverables.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Entregáveis:</p>
                <div className="space-y-1">
                  {sponsor.deliverables.slice(0, 3).map((del) => (
                    <div key={del.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{del.item}</span>
                      <Badge className={
                        del.status === 'completed' ? 'bg-green-500/20 text-green-400 text-xs' :
                        del.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400 text-xs' :
                        'bg-gray-500/20 text-gray-400 text-xs'
                      }>
                        {del.status}
                      </Badge>
                    </div>
                  ))}
                  {sponsor.deliverables.length > 3 && (
                    <p className="text-gray-500 text-xs">+{sponsor.deliverables.length - 3} mais</p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              {sponsor.status === 'prospect' && (
                <Button 
                  size="sm" 
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={() => handleStatusChange(sponsor.id, 'negotiation')}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Negociar
                </Button>
              )}
              {sponsor.status === 'negotiation' && (
                <Button 
                  size="sm" 
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => handleStatusChange(sponsor.id, 'closed')}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Fechar
                </Button>
              )}
              <Button size="sm" variant="outline" className="border-dark-300 text-gray-300">
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-gray-400">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
