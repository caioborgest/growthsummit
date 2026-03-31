import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Download,
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
  AlertCircle,
  CreditCard,
  Calendar,
  Ticket,
  Filter,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getStatusConfig } from '@/lib/ui-constants';
import { useRegistrations, useTransactions, useData, useCheckIns, useSessions } from '@/hooks/useData';
import { toast } from 'sonner';
import type { Registration } from '@/types';
import { InscricaoMultiStepModal } from '@/components/forms/InscricaoMultiStepModal';
import { AccreditationChecklistModal } from '@/components/admin/AccreditationChecklistModal';

const PAGE_SIZE = 20;

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
  onUpdateStatus: (id: string, status: string | any) => Promise<void>;
  onToggleCheckIn: (id: string, current: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-card max-w-2xl w-full max-h-[90vh] overflow-hidden rounded-[2.5rem] border-white/5 relative flex flex-col"
        >
          {/* Header Decorator */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-orange-coral/20 to-transparent pointer-events-none" />
          
          <div className="p-8 pb-4 relative z-10 flex items-center justify-between">
             <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-3xl bg-brand-orange-coral/10 flex items-center justify-center border border-brand-orange-coral/20">
                  <User className="h-10 w-10 text-brand-orange-coral" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">{reg.name || 'Participante'}</h3>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-white/5 text-gray-400 border-none font-black text-[9px] uppercase tracking-widest">{reg.ticketNumber}</Badge>
                    <div className="w-1 h-1 rounded-full bg-gray-700" />
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{reg.email}</p>
                  </div>
                </div>
             </div>
             <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-12 w-12 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5"
              >
                <X className="h-6 w-6" />
              </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar space-y-8 relative z-10">
            {/* Quick Status Bar */}
            <div className="flex items-center gap-3">
              {(() => {
                const config = getStatusConfig(reg.status_pagamento || reg.status);
                const Icon = config.icon || CheckCircle2;
                return (
                  <Badge className={`${config.color} border-none px-4 py-2 font-black text-[10px] uppercase tracking-widest italic rounded-xl shadow-glow-sm`}>
                    <Icon className="h-3.5 w-3.5 mr-2" />
                    {config.label}
                  </Badge>
                );
              })()}
              {reg.palestrasNoturnas && (
                <Badge className="bg-[#FF7043]/10 text-[#FF7043] border-none px-4 py-2 font-black text-[10px] uppercase tracking-widest italic rounded-xl">
                  <Moon className="h-3.5 w-3.5 mr-2" />
                  NIGHT EXPERIENCE
                </Badge>
              )}
              {reg.checkedIn && (
                <Badge className="bg-teal-500/10 text-teal-400 border-none px-4 py-2 font-black text-[10px] uppercase tracking-widest italic rounded-xl">
                  <QrCode className="h-3.5 w-3.5 mr-2" />
                  ACREDITADO
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Valor Bruto', value: reg.palestrasNoturnas ? 'R$ 179,90' : 'R$ 0,00', icon: Ticket },
                { label: 'Desconto', value: reg.discountAmount ? `R$ ${reg.discountAmount.toLocaleString('pt-BR')}` : '—', icon: Star, highlight: !!reg.discountAmount },
                { label: 'Valor Líquido', value: `R$ ${(reg.amount || 0).toLocaleString('pt-BR')}`, icon: CreditCard, primary: true },
                { label: 'Documento', value: (reg as any).cpf || 'Não informado', icon: Contact },
                { label: 'Cupom', value: reg.couponCode || 'Nenhum', icon: Ticket },
                { label: 'Data Registro', value: new Date(reg.createdAt).toLocaleDateString('pt-BR'), icon: Calendar },
              ].map(({ label, value, icon: Icon, highlight, primary }) => (
                <div key={label} className={`p-5 rounded-[1.5rem] border border-white/5 transition-all ${primary ? 'bg-teal-500/5 border-teal-500/20' : highlight ? 'bg-brand-orange-coral/5 border-brand-orange-coral/20' : 'bg-white/[0.02]'}`}>
                  <div className="flex items-center gap-2 mb-2 opacity-40">
                    <Icon className={`h-3 w-3 ${primary ? 'text-teal-400' : 'text-gray-400'}`} />
                    <p className="text-[9px] uppercase font-black tracking-widest">{label}</p>
                  </div>
                  <p className={`text-sm font-black italic uppercase ${primary ? 'text-teal-400' : 'text-white'}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Activities Section */}
            <div className="glass-card p-6 border-white/5 rounded-[2rem] bg-white/[0.01]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-sm font-black text-white italic uppercase tracking-tight">Atividades e Sessões</h4>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">PROGRAMAÇÃO PERSONALIZADA</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[9px] text-teal-400 hover:text-white hover:bg-teal-500/10 font-bold px-4 uppercase rounded-xl"
                  onClick={() => {
                    const novo = prompt('Insira os nomes das sessões (separados por vírgula):', reg.cursosSelecionados?.join(', ') || '');
                    if (novo !== null) {
                      onUpdateStatus(reg.id, { cursosSelecionados: novo.split(',').map(s => s.trim()).filter(Boolean) });
                    }
                  }}
                >
                  EDITAR GRADE
                </Button>
              </div>
              
              {reg.cursosSelecionados && reg.cursosSelecionados.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {reg.cursosSelecionados.map((c, i) => (
                    <Badge key={i} className="bg-teal-500/10 text-teal-400 border-none px-3 py-1.5 font-black text-[10px] rounded-lg">
                      {c.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="py-4 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center">
                  <p className="text-gray-700 text-[10px] font-black uppercase tracking-widest italic">Nenhuma atividade selecionada</p>
                </div>
              )}
            </div>

            {/* Actions Grid */}
            <div className="space-y-4">
               <h4 className="text-[10px] text-gray-700 font-black uppercase tracking-[0.2em] px-2">Ações Estratégicas</h4>
               <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => {
                      onClose();
                      (window as any).dispatchAccreditation(reg);
                    }}
                    className="col-span-2 bg-teal-500 hover:bg-teal-600 text-white font-black py-8 h-auto rounded-[1.5rem] flex flex-col items-center justify-center gap-2 shadow-glow-teal border-none transition-all hover:scale-[1.01]"
                  >
                    <QrCode className="h-6 w-6" />
                    <span className="text-[10px] uppercase tracking-widest">REALIZAR CREDENCIAMENTO PREMIUM</span>
                  </Button>

                  <Button
                    onClick={() => onUpdateStatus(reg.id, 'paid')}
                    disabled={reg.status === 'pago' || reg.status === 'paid'}
                    className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 font-black h-14 rounded-2xl text-[9px] uppercase tracking-widest transition-all"
                  >
                    CONFIRMAR PAGO
                  </Button>

                  <Button
                    onClick={() => onUpdateStatus(reg.id, 'cancelled')}
                    variant="ghost"
                    className="bg-red-500/5 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/10 font-black h-14 rounded-2xl text-[9px] uppercase tracking-widest transition-all"
                  >
                    CANCELAR ACESSO
                  </Button>
               </div>
            </div>

            <div className="pt-4 flex justify-center">
              <Button
                onClick={() => onDelete(reg.id)}
                variant="ghost"
                className="text-red-500/30 hover:text-red-500 hover:bg-red-500/10 font-black text-[9px] uppercase tracking-widest px-8"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                DANGER: EXCLUIR PERMANENTEMENTE
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ── Componente Principal ──────────────────────────────────────
export default function AdminInscricoes() {
  const checkInHookReference = useCheckIns();
  (window as any).checkInsHook = checkInHookReference;

  const { data: registrations, update, remove } = useRegistrations();
  const { data: checkIns } = useCheckIns();
  const { data: transactions, create: createTransaction, update: updateTransaction } = useTransactions();
  const { data: allSessions } = useSessions();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [nightFilter, setNightFilter] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [detalhes, setDetalhes] = useState<Registration | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);

  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  const checkInsByRegId = useMemo(() => {
    const map = new Map<string, any[]>();
    checkIns.forEach(c => {
      if (c.registrationId) {
        if (!map.has(c.registrationId)) map.set(c.registrationId, []);
        map.get(c.registrationId)?.push(c);
      }
    });
    return map;
  }, [checkIns]);

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

      if (status === 'paid' || status === 'pago' || status === 'free') {
        updates.status_pagamento = 'pago';
        updates.paymentStatus = 'pago';
        updates.status = 'ativo';
      }

      if (status === 'free') {
        updates.amount = 0;
        updates.valor_pago = 0;
        updates.palestrasNoturnas = false;
      }

      await update(id, updates);

      if (status === 'cancelled' && oldStatus !== 'cancelled') {
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

        const relatedTransaction = transactions.find(t => t.relatedId === id);
        if (relatedTransaction && relatedTransaction.status !== 'cancelled') {
          await updateTransaction(relatedTransaction.id, { status: 'cancelled' });
          toast.info('Lançamento financeiro cancelado.');
        }
      }

      if ((status === 'paid' || status === 'free' || status === 'pago')) {
        try {
          let finalAmount = registration.amount || 0;
          if ((status === 'paid' || status === 'pago') && finalAmount === 0 && registration.palestrasNoturnas) {
            finalAmount = 179.90;
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
      if (registration.status !== 'cancelled' && registration.cursosSelecionados && registration.cursosSelecionados.length > 0) {
        const { supabase } = await import('@/lib/supabase');
        for (const sessionId of registration.cursosSelecionados) {
          await supabase.rpc('decrement_session_count', { session_id: sessionId });
        }
      }

      const relatedTransactions = transactions.filter(t => t.relatedId === id);
      const { supabase } = await import('@/lib/supabase');
      for (const t of relatedTransactions) {
        await supabase.from('transactions').delete().eq('id', t.id);
      }

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

  const totalPages = Math.max(1, Math.ceil(filteredRegistrations.length / PAGE_SIZE));
  const paginatedRegistrations = filteredRegistrations.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

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
        getStatusConfig(r.status).label,
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

  const handleCopyEmails = useCallback(() => {
    const list = selectedItems.length > 0
      ? filteredRegistrations.filter(r => selectedItems.includes(r.id))
      : filteredRegistrations;
    const emails = list.map(r => r.email).filter(Boolean).join(', ');
    navigator.clipboard.writeText(emails);
    toast.success(`${list.length} e-mails copiados!`);
  }, [filteredRegistrations, selectedItems]);

  return (
    <div className="space-y-10 py-6 animate-in fade-in duration-700">
      {detalhes && (
        <DetalhesModal
          reg={detalhes}
          onClose={() => setDetalhes(null)}
          onUpdateStatus={handleUpdateStatus}
          onToggleCheckIn={() => {}}
          onDelete={handleDeleteParticipant}
        />
      )}

      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic mb-1 uppercase">
            BASE DE <span className="text-brand-orange-coral">INSCRITOS</span>
          </h1>
          <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">
            Gerenciamento Estratégico de Participantes ({registrations.length})
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white font-black h-14 px-8 rounded-2xl text-[10px] uppercase tracking-widest shadow-glow-orange flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            NOVA INSCRIÇÃO
          </Button>

          <Button
            variant="ghost"
            onClick={handleExport}
            disabled={exportingCSV}
            className="h-14 w-14 rounded-2xl bg-white/5 text-gray-400 hover:text-white border border-white/5 flex items-center justify-center p-0"
          >
             {exportingCSV ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Stats Grid Premium */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Geral', value: registrations.length, icon: User, color: 'text-white' },
          { label: 'Confirmados', value: registrations.filter(r => ['pago', 'paid'].includes(r.status)).length, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Night Exp.', value: registrations.filter(r => r.palestrasNoturnas).length, icon: Moon, color: 'text-[#FF7043]' },
          { label: 'Acreditados', value: registrations.filter(r => r.checkedIn).length, icon: QrCode, color: 'text-teal-400' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card hover-card p-6 border-white/5 rounded-[2.5rem] relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-all">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.25em] mb-1 italic">{stat.label}</p>
              <p className={`text-4xl font-black ${stat.color} tracking-tighter tabular-nums italic`}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Smart Filters Panel */}
      <div className="glass-card p-4 border-white/5 rounded-[2rem] bg-white/[0.02] flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-teal-500" />
          <Input
            type="text"
            placeholder="BUSCAR PELO NOME, E-MAIL OU Nº DO TICKET..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full h-14 pl-16 bg-black/20 border-white/5 rounded-xl text-white font-black italic focus:border-teal-500 transition-all placeholder:text-gray-700 placeholder:text-[10px]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 h-14 px-6 bg-black/20 border border-white/5 rounded-xl">
             <Filter className="h-4 w-4 text-teal-400" />
             <select
               value={statusFilter}
               onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
               className="bg-transparent text-[10px] font-black text-teal-400 uppercase tracking-widest focus:outline-none appearance-none cursor-pointer"
             >
               <option value="all">TODOS STATUS</option>
               <option value="pago">CONFIRMADO</option>
               <option value="pendente">PENDENTE</option>
               <option value="cancelled">CANCELADO</option>
             </select>
          </div>

          <div className="flex items-center gap-2 h-14 px-6 bg-black/20 border border-white/5 rounded-xl">
             <Moon className="h-4 w-4 text-[#FF7043]" />
             <select
               value={nightFilter}
               onChange={e => { setNightFilter(e.target.value); setCurrentPage(1); }}
               className="bg-transparent text-[10px] font-black text-[#FF7043] uppercase tracking-widest focus:outline-none appearance-none cursor-pointer"
             >
               <option value="all">TODOS ACESSOS</option>
               <option value="sim">NIGHT EXP. ✓</option>
               <option value="nao">SEM NIGHT</option>
             </select>
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
             <Button
                variant="outline"
                onClick={handleCopyEmails}
                className="h-14 border-teal-500/20 text-teal-400 hover:bg-teal-500/10 font-black text-[9px] uppercase tracking-widest px-6"
              >
                <Mail className="h-4 w-4 mr-2" />
                EMAILS ({selectedItems.length})
              </Button>
              <Button
                variant="ghost"
                onClick={() => setSelectedItems([])}
                className="h-14 text-red-500/50 hover:text-red-400 font-black text-[9px] uppercase"
              >
                LIMPAR
              </Button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="glass-card border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto overflow-y-hidden custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="p-6">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded-md bg-white/5 border-white/10 checked:bg-teal-500"
                    checked={selectedItems.length === paginatedRegistrations.length && paginatedRegistrations.length > 0}
                    onChange={selectAll}
                  />
                </th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest italic">Ticket / Data</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest italic">Participante</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest italic text-center">Acreditação</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest italic">Financeiro</th>
                <th className="p-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <p className="text-gray-700 text-[10px] font-black uppercase tracking-widest italic opacity-20">Nenhum registro encontrado para estes filtros</p>
                  </td>
                </tr>
              ) : (
                paginatedRegistrations.map((reg, idx) => (
                  <motion.tr 
                    key={reg.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-6">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded-md bg-white/5 border-white/10 checked:bg-teal-500"
                        checked={selectedItems.includes(reg.id)}
                        onChange={() => toggleSelection(reg.id)}
                      />
                    </td>
                    <td className="p-6">
                      <p className="text-white font-mono text-xs font-black tracking-tight mb-1 group-hover:text-brand-orange-coral transition-colors">{reg.ticketNumber}</p>
                      <p className="text-gray-700 text-[9px] font-black uppercase tracking-widest">{new Date(reg.createdAt).toLocaleDateString('pt-BR')}</p>
                    </td>
                    <td className="p-6">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-black italic uppercase leading-none mb-1">{reg.name || '---'}</p>
                            <p className="text-gray-700 text-[9px] font-black uppercase tracking-widest leading-none truncate max-w-[150px]">{reg.email}</p>
                          </div>
                       </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-center gap-2">
                        {(() => {
                           const regCheckIns = checkInsByRegId.get(reg.id) || [];
                           const eventCheckIn = regCheckIns.some(c => c.method === 'manual' || c.method === 'scanner');
                           return (
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${eventCheckIn ? 'bg-teal-500/10 border-teal-500/30 text-teal-400 shadow-glow-sm' : 'bg-white/5 border-white/10 text-gray-700'}`}>
                               <CheckCircle2 className="h-4 w-4" />
                             </div>
                           )
                        })()}
                        {reg.palestrasNoturnas && (
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center border bg-[#FF7043]/10 border-[#FF7043]/30 text-[#FF7043]`}>
                             <Moon className="h-4 w-4" />
                           </div>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                       <div className="flex flex-col gap-1.5">
                          {(() => {
                            const config = getStatusConfig(reg.status_pagamento || reg.status);
                            return (
                              <Badge className={`${config.color} border-none text-[8px] font-black uppercase tracking-widest italic h-5 flex items-center`}>
                                {config.label}
                              </Badge>
                            );
                          })()}
                          <p className="text-white text-xs font-black italic tabular-nums">
                            R$ {(reg.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                       </div>
                    </td>
                    <td className="p-6 text-right">
                       <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDetalhes(reg)}
                          className="h-10 w-10 p-0 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-teal-500/20 hover:border-teal-500/20 border border-transparent transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Premium */}
        <div className="p-8 border-t border-white/5 flex items-center justify-between gap-6 bg-white/[0.01]">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                <Ticket className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-gray-700 text-[10px] font-black uppercase tracking-widest italic">Página {currentPage} de {totalPages}</p>
                <p className="text-white text-xs font-black italic uppercase tracking-tight">Mostrando base de registros ({paginatedRegistrations.length})</p>
              </div>
           </div>

           <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-12 w-12 bg-white/5 rounded-xl border border-white/5 text-gray-500 hover:text-white disabled:opacity-20"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <div className="flex gap-1">
                 {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
                   <button
                     key={i}
                     onClick={() => setCurrentPage(i + 1)}
                     className={`w-12 h-12 rounded-xl text-[10px] font-black italic transition-all ${currentPage === i + 1 ? 'bg-teal-500 text-white shadow-glow-teal' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                   >
                     {i + 1}
                   </button>
                 ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-12 w-12 bg-white/5 rounded-xl border border-white/5 text-gray-500 hover:text-white disabled:opacity-20"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
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
          onSuccess={async () => {
            if (selectedReg) {
              await update(selectedReg.id, {
                checkedIn: true,
                checkInTime: new Date().toISOString()
              } as any);
              toast.success('Inscrição marcada como concluída no sistema.');
            }
          }}
        />
      )}
    </div>
  );
}
