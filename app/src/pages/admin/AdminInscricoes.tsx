import { useState, useCallback } from 'react';
import {
  Search,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  QrCode,
  Mail,
  ChevronLeft,
  ChevronRight,
  Eye,
  Moon,
  User,
  Loader2,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRegistrations } from '@/hooks/useData';
import { toast } from 'sonner';
import type { Registration } from '@/types';

const PAGE_SIZE = 20;

const statusColors: Record<string, string> = {
  pago: 'bg-green-500/20 text-green-400',
  paid: 'bg-green-500/20 text-green-400',
  pendente: 'bg-yellow-500/20 text-yellow-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  cancelled: 'bg-red-500/20 text-red-400',
  cancelado: 'bg-red-500/20 text-red-400',
  refunded: 'bg-gray-500/20 text-gray-400',
};

const statusLabels: Record<string, string> = {
  pago: 'Pago', paid: 'Pago',
  pendente: 'Pendente', pending: 'Pendente',
  cancelled: 'Cancelado', cancelado: 'Cancelado',
  refunded: 'Reembolsado',
};

// ── Modal de Detalhes ─────────────────────────────────────────
function DetalhesModal({ reg, onClose }: { reg: Registration; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-card max-w-lg w-full p-6 rounded-2xl space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-brand-orange-coral/20 flex items-center justify-center">
            <User className="h-6 w-6 text-brand-orange-coral" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{reg.name || 'Participante'}</h3>
            <p className="text-gray-400 text-sm">{reg.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Nº Inscrição', value: reg.ticketNumber },
            { label: 'Status', value: statusLabels[reg.status] || reg.status },
            { label: 'Valor Pago', value: `R$ ${reg.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}` },
            { label: 'Check-in', value: reg.checkedIn ? `✅ ${reg.checkInTime ? new Date(reg.checkInTime).toLocaleTimeString('pt-BR') : 'Feito'}` : '❌ Pendente' },
            { label: 'Passaporte Night', value: reg.palestrasNoturnas ? '✅ Sim' : '—' },
            { label: 'Data', value: new Date(reg.createdAt).toLocaleDateString('pt-BR') },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 bg-white/5 rounded-lg">
              <p className="text-gray-500 text-xs mb-1">{label}</p>
              <p className="text-white font-semibold">{value}</p>
            </div>
          ))}
        </div>

        {(reg.cursosSelecionados && reg.cursosSelecionados.length > 0) && (
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-gray-500 text-xs mb-1">Atividades</p>
            <p className="text-white font-semibold text-xs">{reg.cursosSelecionados.join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────────
export function AdminInscricoes() {
  const { data: registrations } = useRegistrations();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [nightFilter, setNightFilter] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [detalhes, setDetalhes] = useState<Registration | null>(null);
  const [exportingCSV, setExportingCSV] = useState(false);

  // ── Filtros ───────────────────────────────────────────────
  const filteredRegistrations = registrations.filter(reg => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (reg.ticketNumber?.toLowerCase() || '').includes(q) ||
      (reg.name?.toLowerCase() || '').includes(q) ||
      (reg.email?.toLowerCase() || '').includes(q);
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
    const matchesNight =
      nightFilter === 'all' ||
      (nightFilter === 'sim' && reg.palestrasNoturnas) ||
      (nightFilter === 'nao' && !reg.palestrasNoturnas);
    return matchesSearch && matchesStatus && matchesNight;
  });

  // Reset para página 1 ao filtrar
  const handleFilter = (fn: () => void) => { fn(); setCurrentPage(1); };

  // ── Paginação ─────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredRegistrations.length / PAGE_SIZE));
  const paginatedRegistrations = filteredRegistrations.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // ── Seleção ───────────────────────────────────────────────
  const toggleSelection = useCallback((id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    if (selectedItems.length === paginatedRegistrations.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedRegistrations.map(r => r.id));
    }
  }, [selectedItems.length, paginatedRegistrations]);

  // ── Exportação CSV ────────────────────────────────────────
  const handleExport = useCallback(async () => {
    setExportingCSV(true);
    try {
      const list = selectedItems.length > 0
        ? filteredRegistrations.filter(r => selectedItems.includes(r.id))
        : filteredRegistrations;

      const header = ['Nº Inscrição', 'Nome', 'Email', 'Status', 'Valor', 'Passaporte Night', 'Check-in', 'Data'];
      const rows = list.map(r => [
        r.ticketNumber,
        r.name || '',
        r.email || '',
        statusLabels[r.status] || r.status,
        `R$ ${r.amount?.toFixed(2) || '0.00'}`,
        r.palestrasNoturnas ? 'Sim' : 'Não',
        r.checkedIn ? 'Sim' : 'Não',
        new Date(r.createdAt).toLocaleDateString('pt-BR'),
      ]);

      const csvContent = [header, ...rows]
        .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';'))
        .join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inscricoes_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${list.length} registros exportados com sucesso!`);
    } catch {
      toast.error('Erro ao exportar. Tente novamente.');
    } finally {
      setExportingCSV(false);
    }
  }, [filteredRegistrations, selectedItems]);

  // ── Ação em massa: Copiar emails ──────────────────────────
  const handleCopyEmails = useCallback(() => {
    const list = selectedItems.length > 0
      ? filteredRegistrations.filter(r => selectedItems.includes(r.id))
      : filteredRegistrations;
    const emails = list.map(r => r.email).filter(Boolean).join(', ');
    navigator.clipboard.writeText(emails);
    toast.success(`${list.length} e-mails copiados!`);
  }, [filteredRegistrations, selectedItems]);

  return (
    <>
      {detalhes && <DetalhesModal reg={detalhes} onClose={() => setDetalhes(null)} />}

      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input
                type="text"
                placeholder="Buscar por nome, e-mail ou nº..."
                value={searchQuery}
                onChange={e => handleFilter(() => setSearchQuery(e.target.value))}
                className="pl-12 w-full sm:w-80 bg-dark-100 border-dark-300 text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => handleFilter(() => setStatusFilter(e.target.value))}
              className="px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white text-sm"
            >
              <option value="all">Todos os status</option>
              <option value="pago">Pago</option>
              <option value="paid">Pago (legado)</option>
              <option value="pendente">Pendente</option>
              <option value="pending">Pendente (legado)</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <select
              value={nightFilter}
              onChange={e => handleFilter(() => setNightFilter(e.target.value))}
              className="px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white text-sm"
            >
              <option value="all">Todos os tipos</option>
              <option value="sim">Passaporte Night ✓</option>
              <option value="nao">Sem Night</option>
            </select>
          </div>
          <div className="flex gap-2 flex-wrap">
            {selectedItems.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-dark-300 text-gray-300 hover:text-white"
                  onClick={handleCopyEmails}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Copiar e-mails ({selectedItems.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500/30 text-red-400 hover:text-red-300"
                  onClick={() => setSelectedItems([])}
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar seleção
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              className="border-dark-300 text-gray-300 hover:text-white"
              onClick={handleExport}
              disabled={exportingCSV}
            >
              {exportingCSV
                ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                : <Download className="h-4 w-4 mr-2" />}
              {exportingCSV ? 'Exportando...' : 'Exportar CSV'}
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
              {registrations.filter(r => r.status === 'pago' || r.status === 'paid').length}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-gray-400 text-sm">Passaporte Night</p>
            <p className="text-2xl font-bold text-brand-orange-coral">
              {registrations.filter(r => r.palestrasNoturnas).length}
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
                      checked={selectedItems.length === paginatedRegistrations.length && paginatedRegistrations.length > 0}
                      onChange={selectAll}
                      title="Selecionar todos"
                    />
                  </th>
                  <th className="p-4 text-left text-gray-400 font-medium text-sm">Inscrição</th>
                  <th className="p-4 text-left text-gray-400 font-medium text-sm">Participante</th>
                  <th className="p-4 text-left text-gray-400 font-medium text-sm">Status</th>
                  <th className="p-4 text-left text-gray-400 font-medium text-sm">Valor</th>
                  <th className="p-4 text-left text-gray-400 font-medium text-sm">Night</th>
                  <th className="p-4 text-left text-gray-400 font-medium text-sm">Check-in</th>
                  <th className="p-4 text-left text-gray-400 font-medium text-sm">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      Nenhum resultado encontrado.
                    </td>
                  </tr>
                ) : (
                  paginatedRegistrations.map((reg) => (
                    <tr key={reg.id} className="border-b border-dark-300/50 hover:bg-dark-100/40 transition-colors">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          className="rounded bg-dark-100 border-dark-300"
                          checked={selectedItems.includes(reg.id)}
                          onChange={() => toggleSelection(reg.id)}
                        />
                      </td>
                      <td className="p-4">
                        <p className="text-white font-mono text-sm">{reg.ticketNumber}</p>
                        <p className="text-gray-500 text-xs">{new Date(reg.createdAt).toLocaleDateString('pt-BR')}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-white font-medium text-sm">{reg.name || 'Desconhecido'}</p>
                        <p className="text-gray-500 text-xs truncate max-w-[200px]">{reg.email || '-'}</p>
                      </td>
                      <td className="p-4">
                        <Badge className={statusColors[reg.status] || 'bg-gray-500/20 text-gray-400'}>
                          {reg.status === 'pago' || reg.status === 'paid'
                            ? <CheckCircle className="h-3 w-3 mr-1" />
                            : reg.status === 'pendente' || reg.status === 'pending'
                              ? <Clock className="h-3 w-3 mr-1" />
                              : <XCircle className="h-3 w-3 mr-1" />}
                          {statusLabels[reg.status] || reg.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-white text-sm">
                        R$ {reg.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                      </td>
                      <td className="p-4">
                        {reg.palestrasNoturnas
                          ? <Badge className="bg-brand-orange-coral/20 text-brand-orange-coral"><Moon className="h-3 w-3 mr-1" />Night</Badge>
                          : <span className="text-gray-600 text-xs">—</span>
                        }
                      </td>
                      <td className="p-4">
                        {reg.checkedIn ? (
                          <Badge className="bg-green-500/20 text-green-400">
                            <CheckCircle className="h-3 w-3 mr-1" />Feito
                          </Badge>
                        ) : (
                          <span className="text-gray-600 text-xs">Pendente</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-white h-8 w-8 p-0"
                            title="Ver detalhes"
                            onClick={() => setDetalhes(reg)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-teal-400 h-8 w-8 p-0"
                            title="Copiar QR Code ID"
                            onClick={() => { navigator.clipboard.writeText(reg.id); toast.success('ID copiado!'); }}
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-dark-300 flex items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              Mostrando {Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredRegistrations.length)}–{Math.min(currentPage * PAGE_SIZE, filteredRegistrations.length)} de{' '}
              <span className="text-white font-semibold">{filteredRegistrations.length}</span> registros
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-dark-300 text-gray-400 hover:text-white disabled:opacity-30"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-gray-400 text-sm px-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="border-dark-300 text-gray-400 hover:text-white disabled:opacity-30"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
