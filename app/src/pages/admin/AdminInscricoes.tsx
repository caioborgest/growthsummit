import { useState } from 'react';
import { 
  Search, 
  Download, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  QrCode,
  Mail,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRegistrations } from '@/hooks/useData';

const statusColors: Record<string, string> = {
  paid: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  cancelled: 'bg-red-500/20 text-red-400',
  refunded: 'bg-gray-500/20 text-gray-400',
};

const ticketTypeLabels: Record<string, string> = {
  standard: 'Standard',
  pro: 'Pro',
  vip: 'VIP',
};

export function AdminInscricoes() {
  const { data: registrations } = useRegistrations();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = 
      reg.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.userId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
    const matchesType = typeFilter === 'all' || reg.ticketType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const toggleSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === filteredRegistrations.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredRegistrations.map(r => r.id));
    }
  };

  const handleExport = () => {
    alert('Exportando ' + filteredRegistrations.length + ' registros...');
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar inscrição..."
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
            <option value="paid">Pago</option>
            <option value="pending">Pendente</option>
            <option value="cancelled">Cancelado</option>
            <option value="refunded">Reembolsado</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white text-sm"
          >
            <option value="all">Todos os tipos</option>
            <option value="standard">Standard</option>
            <option value="pro">Pro</option>
            <option value="vip">VIP</option>
          </select>
        </div>
        <div className="flex gap-3">
          {selectedItems.length > 0 && (
            <Button variant="outline" className="border-dark-300 text-gray-300">
              Ações em massa ({selectedItems.length})
            </Button>
          )}
          <Button 
            variant="outline" 
            className="border-dark-300 text-gray-300"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{registrations.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Pagos</p>
          <p className="text-2xl font-bold text-green-400">
            {registrations.filter(r => r.status === 'paid').length}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-400">
            {registrations.filter(r => r.status === 'pending').length}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Check-ins</p>
          <p className="text-2xl font-bold text-teal-400">
            {registrations.filter(r => r.checkedIn).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-300">
                <th className="p-4 text-left">
                  <input 
                    type="checkbox" 
                    className="rounded bg-dark-100 border-dark-300"
                    checked={selectedItems.length === filteredRegistrations.length && filteredRegistrations.length > 0}
                    onChange={selectAll}
                  />
                </th>
                <th className="p-4 text-left text-gray-400 font-medium">Inscrição</th>
                <th className="p-4 text-left text-gray-400 font-medium">Tipo</th>
                <th className="p-4 text-left text-gray-400 font-medium">Status</th>
                <th className="p-4 text-left text-gray-400 font-medium">Valor</th>
                <th className="p-4 text-left text-gray-400 font-medium">Pagamento</th>
                <th className="p-4 text-left text-gray-400 font-medium">Check-in</th>
                <th className="p-4 text-left text-gray-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((reg) => (
                <tr key={reg.id} className="border-b border-dark-300 hover:bg-dark-100/50">
                  <td className="p-4">
                    <input 
                      type="checkbox" 
                      className="rounded bg-dark-100 border-dark-300"
                      checked={selectedItems.includes(reg.id)}
                      onChange={() => toggleSelection(reg.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-white font-medium">{reg.ticketNumber}</p>
                      <p className="text-gray-500 text-sm">{new Date(reg.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className={
                      reg.ticketType === 'vip' ? 'bg-orange-500/20 text-orange-400' :
                      reg.ticketType === 'pro' ? 'bg-teal-500/20 text-teal-400' :
                      'bg-gray-500/20 text-gray-400'
                    }>
                      {ticketTypeLabels[reg.ticketType]}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge className={statusColors[reg.status]}>
                      {reg.status === 'paid' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {reg.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {reg.status === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                      {reg.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-white">
                    R$ {reg.amount.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-gray-300 text-sm">{reg.paymentMethod || '-'}</p>
                      {reg.paymentDate && (
                        <p className="text-gray-500 text-xs">{new Date(reg.paymentDate).toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {reg.checkedIn ? (
                      <Badge className="bg-green-500/20 text-green-400">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Sim
                      </Badge>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-dark-300 flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            Mostrando {filteredRegistrations.length} de {registrations.length} registros
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="border-dark-300 text-gray-400">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="border-dark-300 text-gray-400">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
