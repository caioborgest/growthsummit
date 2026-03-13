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
    X,
    Plus,
    Trash2,
    Star,
    CheckCircle2,
    Package,
    Contact,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRegistrations, useTransactions, useData } from '@/hooks/useData';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import type { Registration } from '@/types';
import { InscricaoMultiStepModal } from '@/components/forms/InscricaoMultiStepModal';
import { AccreditationChecklistModal } from '@/components/admin/AccreditationChecklistModal';
import { useCheckIns } from '@/hooks/useData';

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
function DetalhesModal({
  reg,
  onClose,
  onUpdateStatus,
  onToggleCheckIn,
  onDelete
}: {
  reg: Registration;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  onToggleCheckIn: (id: string, current: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-card max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 rounded-2xl space-y-4 relative scrollbar-hide">
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
          {reg.cursosSelecionados && reg.cursosSelecionados.length > 0 && (
            <div className="col-span-2 space-y-2 pt-2 border-t border-white/5">
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Programação Escolhida</p>
              <div className="flex flex-wrap gap-2">
                {reg.cursosSelecionados.map((c, i) => (
                  <Badge key={i} variant="outline" className="text-xs border-teal-500/30 text-teal-400 bg-teal-500/5">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
          {[
            { label: 'Nº Inscrição', value: reg.ticketNumber },
            {
              label: 'Status',
              value: (reg.amount === 0 && ['pago', 'paid'].includes(reg.status)) ? 'Grátis/Cortesia' : (statusLabels[reg.status] || reg.status)
            },
            { label: 'Valor Bruto', value: reg.palestrasNoturnas ? 'R$ 179,90' : 'R$ 0,00' },
            {
              label: 'Desconto',
              value: reg.discountAmount ? `R$ ${reg.discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—',
              highlight: reg.discountAmount && reg.discountAmount > 0
            },
            {
              label: 'Valor Líquido',
              value: `R$ ${(reg.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
              highlight: (reg.amount || 0) === 0 && reg.palestrasNoturnas && reg.discountAmount && reg.discountAmount > 0
            },
            {
              label: 'Cupom Utilizado',
              value: reg.couponCode ? `🎟️ ${reg.couponCode}` : '—',
              highlight: !!reg.couponCode
            },
            { label: 'Passaporte Night', value: reg.palestrasNoturnas ? '✅ Sim' : '—' },
            { label: 'Data Registro', value: new Date(reg.createdAt).toLocaleDateString('pt-BR') },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={`p-3 rounded-xl border transition-all ${highlight ? 'bg-orange-500/10 border-orange-500/20' : 'bg-white/5 border-transparent'}`}>
              <p className="text-gray-500 text-[10px] uppercase font-black mb-1 tracking-wider">{label}</p>
              <p className={`font-bold ${highlight ? 'text-orange-400' : 'text-white'}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Atividades Selecionadas</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] text-brand-orange-coral hover:text-white hover:bg-brand-orange-coral/20 font-black px-2 uppercase"
              onClick={() => {
                const novo = prompt('Insira os nomes das atividades separados por vírgula:', reg.cursosSelecionados?.join(', ') || '');
                if (novo !== null) {
                  onUpdateStatus(reg.id, { cursosSelecionados: novo.split(',').map(s => s.trim()).filter(Boolean) } as any);
                }
              }}
            >
              Editar
            </Button>
          </div>
          {reg.cursosSelecionados && reg.cursosSelecionados.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {reg.cursosSelecionados.map((c, i) => (
                <Badge key={i} variant="outline" className="bg-dark-300 text-white border-white/10 text-[10px] py-0.5">
                  {c}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-[10px] italic">Nenhuma atividade selecionada</p>
          )}
        </div>

        <div className="pt-6 border-t border-white/10">
          <p className="text-xs text-gray-500 uppercase font-black mb-4 tracking-widest text-center">Ações de Credenciamento</p>
          <Button
            onClick={() => {
              onClose(); // Close details modal first
              // We'll need a way to trigger the checklist modal from parent
              (window as any).dispatchAccreditation(reg);
            }}
            className="w-full font-black py-6 h-auto rounded-xl transition-all flex items-center justify-center gap-2 mb-6 bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/20"
          >
            REALIZAR CREDENCIAMENTO COMPLETO
          </Button>

          <p className="text-xs text-gray-500 uppercase font-black mb-4 tracking-widest text-center">Gerenciar Status de Pagamento</p>
          <div className="flex flex-col gap-2">
            {((!['pago', 'paid'].includes(reg.status)) || (reg.amount === 0 && reg.palestrasNoturnas)) && (
              <Button
                onClick={() => onUpdateStatus(reg.id, 'paid')}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmar Pagamento
              </Button>
            )}

            {(reg.status !== 'pago' && reg.amount > 0) && (
              <Button
                onClick={() => onUpdateStatus(reg.id, 'free')}
                variant="outline"
                className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10 font-bold"
              >
                <Star className="h-4 w-4 mr-2" />
                Converter para Grátis
              </Button>
            )}
            {(!['pendente', 'pending'].includes(reg.status)) && (
              <Button
                onClick={() => onUpdateStatus(reg.id, 'pending')}
                variant="outline"
                className="w-full border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 font-bold"
              >
                <Clock className="h-4 w-4 mr-2" />
                Marcar como Pendente
              </Button>
            )}
            {reg.status !== 'cancelled' && (
              <Button
                onClick={() => onUpdateStatus(reg.id, 'cancelled')}
                variant="ghost"
                className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 font-bold"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar Inscrição
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full mt-2 border-dark-300 text-gray-400 font-bold"
            >
              Fechar Visualização
            </Button>

            <div className="pt-4 mt-4 border-t border-red-500/10">
              <Button
                onClick={() => onDelete(reg.id)}
                variant="ghost"
                className="w-full text-red-500/50 hover:text-red-500 hover:bg-red-500/10 font-bold text-xs"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                EXCLUIR PERMANENTEMENTE
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────────
export default function AdminInscricoes() {
  const { data: registrations, update, remove } = useRegistrations();
  const { data: checkIns } = useCheckIns();
  const { data: transactions, create: createTransaction, update: updateTransaction } = useTransactions();
  const { data: allSessions } = useData<any>([], 'programacao_evento');
  const { update: updateSession } = useData([], 'sessions');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [nightFilter, setNightFilter] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [detalhes, setDetalhes] = useState<Registration | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);

  // Robust Accreditation States
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  // Global trigger for DetalhesModal to open checklist
  useState(() => {
    (window as any).dispatchAccreditation = (reg: Registration) => {
      setSelectedReg(reg);
      setIsChecklistOpen(true);
    };
  });

  const handleUpdateStatus = async (id: string, status: any) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const registration = registrations.find(r => r.id === id);
      if (!registration) return;

      const oldStatus = registration.status;
      const updates: any = typeof status === 'object' ? status : { status };

      // Se mudar para Grátis, zerar o valor e desativar palestras noturnas (tier Free Morning)
      if (updates.status === 'free') {
        updates.amount = 0;
        updates.status = 'pago'; // Financeiramente resolvido
        updates.palestrasNoturnas = false; // Grátis = Free Morning
        updates.statusPagamento = 'pago';
      }

      await update(id, updates);

      // 1. Sincronização de Cancelamento
      if (status === 'cancelled' && oldStatus !== 'cancelled') {
        // ... (lógica existente de liberar vagas)
        if (registration.cursosSelecionados && registration.cursosSelecionados.length > 0) {
          const { supabase } = await import('@/lib/supabase');
          for (const sessionId of registration.cursosSelecionados) {
            try {
              await supabase.rpc('decrement_session_count', { session_id: sessionId });
            } catch (err) {
              console.error(`Erro ao decrementar sessão ${sessionId}:`, err);
            }
          }
        }

        // Cancelar transação financeira
        const relatedTransaction = transactions.find(t => t.relatedId === id);
        if (relatedTransaction && relatedTransaction.status !== 'cancelled') {
          await updateTransaction(relatedTransaction.id, { status: 'cancelled' });
          toast.info('Lançamento financeiro cancelado.');
        }
      }

      // 2. Sincronização de Pagamento (Criar Lançamento ou Atualizar Existente)
      if ((status === 'paid' || status === 'free' || status === 'pago')) {
        try {
          // Se for uma confirmação de pagamento manual e o valor for 0 mas tiver Night, assume o valor padrão
          let finalAmount = registration.amount || 0;
          if ((status === 'paid' || status === 'pago') && finalAmount === 0 && registration.palestrasNoturnas) {
            finalAmount = 179.90;
            // Atualiza a inscrição também
            await update(id, { amount: finalAmount } as any);
            updates.amount = finalAmount;
          }

          const amount = status === 'free' ? 0 : finalAmount;
          const description = `Inscrição (${status === 'free' ? 'Cortesia' : 'Manual'}): ${registration.name}${registration.palestrasNoturnas ? ' + Night Experience' : ''}`;

          const existingTransaction = transactions.find(t => t.relatedId === id);

          if (existingTransaction) {
            await updateTransaction(existingTransaction.id, {
              amount: amount,
              status: 'completed',
              description: description,
              date: new Date().toISOString()
            } as any);
            toast.success('Lançamento financeiro atualizado');
          } else if (!['pago', 'paid'].includes(oldStatus)) {
            // Só cria se for novo pagamento (não transição de pago -> pago)
            await createTransaction({
              projectId: registration.projectId || '',
              type: 'income',
              category: 'Inscrições',
              description: description,
              amount: amount,
              date: new Date().toISOString(),
              status: 'completed',
              relatedId: id,
              relatedType: 'registration'
            } as any);
            toast.success('Lançamento registrado no financeiro');
          }
        } catch (finErr) {
          console.error('Erro ao processar financeiro:', finErr);
        }
      }

      toast.success(`Status atualizado com sucesso!`);
      if (detalhes && detalhes.id === id) {
        setDetalhes(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status de pagamento.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteParticipant = async (id: string) => {
    const registration = registrations.find(r => r.id === id);
    if (!registration) return;

    if (!confirm(`TEM CERTEZA? Isso excluirá ${registration.name} permanentemente e removerá os lançamentos financeiros vinculados.`)) {
      return;
    }

    setIsUpdating(true);
    try {
      // 1. Liberar vagas na programação se ainda não estiver cancelado
      if (registration.status !== 'cancelled' && registration.cursosSelecionados && registration.cursosSelecionados.length > 0) {
        const { supabase } = await import('@/lib/supabase');
        for (const sessionId of registration.cursosSelecionados) {
          await supabase.rpc('decrement_session_count', { session_id: sessionId });
        }
      }

      // 2. Excluir transações financeiras relacionadas
      const relatedTransactions = transactions.filter(t => t.relatedId === id);
      for (const t of relatedTransactions) {
        // Usando a API de transações se disponível, ou fallback para manual se necessário
        // Aqui usamos hooks de dados genéricos
        const { supabase } = await import('@/lib/supabase');
        await supabase.from('transactions').delete().eq('id', t.id);
      }

      // 3. Excluir a inscrição
      await remove(id);

      toast.success('Participante e dados vinculados removidos com sucesso.');
      setDetalhes(null);
    } catch (error) {
      console.error('Erro ao excluir participante:', error);
      toast.error('Erro ao realizar exclusão completa.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleCheckIn = async (id: string, currentStatus: boolean) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await update(id, {
        checkedIn: !currentStatus,
        checkInTime: !currentStatus ? new Date().toISOString() : null
      } as any);

      toast.success(currentStatus ? 'Credenciamento removido.' : 'Credenciamento realizado com sucesso!');

      if (detalhes && detalhes.id === id) {
        setDetalhes(prev => prev ? {
          ...prev,
          checkedIn: !currentStatus,
          checkInTime: !currentStatus ? new Date().toISOString() : null
        } : null);
      }
    } catch (error) {
      console.error('Erro ao atualizar check-in:', error);
      toast.error('Erro ao processar credenciamento.');
    } finally {
      setIsUpdating(false);
    }
  };

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
      {detalhes && (
        <DetalhesModal
          reg={detalhes}
          onClose={() => setDetalhes(null)}
          onUpdateStatus={handleUpdateStatus}
          onToggleCheckIn={handleToggleCheckIn}
          onDelete={handleDeleteParticipant}
        />
      )}

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
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-bold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Inscrição
            </Button>
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
              {registrations.filter(r => ['pago', 'paid'].includes(r.status)).length}
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
                  <th className="p-4 text-left text-gray-400 font-medium text-sm">Acreditação</th>
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
                        {reg.loteId && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] py-0 px-1.5">
                              EQUIPE
                            </Badge>
                            {reg.voucherEmpresa && (
                              <span className="text-[10px] text-gray-500 font-mono">{reg.voucherEmpresa}</span>
                            )}
                          </div>
                        )}
                        {reg.cursosSelecionados && reg.cursosSelecionados.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {reg.cursosSelecionados.map((id, i) => {
                              const session = allSessions?.find(s => s.id === id);
                              return (
                                <Badge key={i} variant="outline" className="text-[9px] py-0 px-1 border-teal-500/20 text-teal-400 bg-teal-500/5">
                                  {session?.title || session?.titulo || id}
                                </Badge>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge className={statusColors[reg.status] || 'bg-gray-500/20 text-gray-400'}>
                          {['pago', 'paid'].includes(reg.status)
                            ? <CheckCircle className="h-3 w-3 mr-1" />
                            : ['pendente', 'pending'].includes(reg.status)
                              ? <Clock className="h-3 w-3 mr-1" />
                              : <XCircle className="h-3 w-3 mr-1" />}
                          {(reg.amount === 0 && ['pago', 'paid'].includes(reg.status)) ? 'Cortesia' : (statusLabels[reg.status] || reg.status)}
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
                        <div className="flex items-center gap-1.5">
                          {(() => {
                            const regCheckIns = checkIns.filter(c => c.registrationId === reg.id && c.checkInType === 'event');
                            const entrance = regCheckIns.length > 0;
                            const kit = regCheckIns.some(c => {
                              try { return JSON.parse(c.notes || '{}').kit === true; } catch { return false; }
                            });
                            const badge = regCheckIns.some(c => {
                              try { return JSON.parse(c.notes || '{}').badge === true; } catch { return false; }
                            });

                            return (
                              <>
                                <div title="Entrada" className={`w-6 h-6 rounded-md flex items-center justify-center border ${entrance ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-white/5 border-white/10 text-gray-700'}`}>
                                  <CheckCircle2 className="h-3 w-3" />
                                </div>
                                <div title="Crachá" className={`w-6 h-6 rounded-md flex items-center justify-center border ${badge ? 'bg-brand-orange-coral/10 border-brand-orange-coral/30 text-brand-orange-coral' : 'bg-white/5 border-white/10 text-gray-700'}`}>
                                  <Contact className="h-3 w-3" />
                                </div>
                                <div title="Kit" className={`w-6 h-6 rounded-md flex items-center justify-center border ${kit ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' : 'bg-white/5 border-white/10 text-gray-700'}`}>
                                  <Package className="h-3 w-3" />
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`h-8 w-8 p-0 ${reg.checkedIn ? 'text-orange-400 hover:bg-orange-400/10' : 'text-teal-400 hover:bg-teal-400/10'}`}
                            title={reg.checkedIn ? 'Remover check-in' : 'Realizar check-in'}
                            onClick={() => handleToggleCheckIn(reg.id, !!reg.checkedIn)}
                          >
                            {reg.checkedIn ? <XCircle className="h-4 w-4" /> : <QrCode className="h-4 w-4" />}
                          </Button>
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
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-red-500 h-8 w-8 p-0"
                            title="Excluir participante"
                            onClick={() => handleDeleteParticipant(reg.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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

      <InscricaoMultiStepModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {isChecklistOpen && (
        <AccreditationChecklistModal
          isOpen={isChecklistOpen}
          onClose={() => {
            setIsChecklistOpen(false);
            setSelectedReg(null);
          }}
          entity={selectedReg}
          role="participant"
          onSuccess={() => {}}
        />
      )}
    </>
  );
}
