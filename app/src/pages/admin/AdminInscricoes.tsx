import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Download,
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
  Contact,
  CreditCard,
  Calendar,
  Ticket,
  Filter,
  Users,
  Handshake,
  Building2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getStatusConfig } from '@/lib/ui-constants';
import { useRegistrations, useTransactions, useCheckIns, useSessions } from '@/hooks/useData';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import type { Registration } from '@/types';
import { InscricaoMultiStepModal } from '@/components/forms/InscricaoMultiStepModal';
import { AccreditationChecklistModal } from '@/components/admin/AccreditationChecklistModal';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 20;

// ── Modal de Detalhes ─────────────────────────────────────────
function DetalhesModal({
  reg,
  onClose,
  onUpdateStatus,
  onDelete
}: {
  reg: Registration;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string | any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <Dialog open={!!reg} onOpenChange={onClose}>
      <DialogContent className="admin-modal-content max-w-2xl border-none p-0 shadow-2xl">
        <div className="admin-modal-header p-8 pb-4">
           <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-brand-orange-coral/10 flex items-center justify-center border border-brand-orange-coral/20 group-hover:scale-110 transition-transform">
                <User className="h-8 w-8 text-brand-orange-coral" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">
                  {reg.name || 'Participante'}
                </DialogTitle>
                <DialogDescription className="text-gray-500 text-[9px] font-black uppercase tracking-widest leading-none flex items-center gap-2">
                  <Badge className="bg-white/5 text-gray-500 border-none font-black text-[8px] uppercase tracking-widest">{reg.ticketNumber}</Badge>
                  <div className="w-1 h-1 rounded-full bg-gray-800" />
                  <span>{reg.email}</span>
                </DialogDescription>
              </div>
           </div>
           <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 rounded-xl text-gray-500 hover:text-white hover:bg-white/5"
            >
              <X className="h-6 w-6" />
            </Button>
        </div>

        <div className="admin-modal-body p-8 pt-4 flex-1 overflow-y-auto custom-scrollbar">
          <div className="space-y-8 py-2">
            {/* Quick Status Bar */}
            <div className="flex flex-wrap items-center gap-3">
              {(() => {
                const config = getStatusConfig(reg.payment_status || reg.status);
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

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Valor Bruto', value: (reg.amount && reg.amount > 0) ? `R$ ${reg.amount.toLocaleString('pt-BR')}` : (reg.palestrasNoturnas ? 'R$ 179,90' : 'R$ 0,00'), icon: Ticket },
                { label: 'Desconto', value: reg.discountAmount ? `R$ ${reg.discountAmount.toLocaleString('pt-BR')}` : '—', icon: Star, highlight: !!reg.discountAmount },
                { label: 'Valor Líquido', value: `R$ ${(reg.paidAmount || reg.amount || 0).toLocaleString('pt-BR')}`, icon: CreditCard, primary: true },
                { label: 'Documento', value: (reg as any).cpf || 'Não informado', icon: Contact },
                { label: 'E-mail', value: reg.email || 'Não informado', icon: Star },
                { label: 'Telefone', value: reg.phone || (reg as any).telefone || 'Não informado', icon: Contact },
                { label: 'Empresa', value: reg.empresa || (reg as any).company || 'Não informada', icon: Building2 },
                { 
                  label: 'Cupom / Voucher', 
                  value: reg.couponCode || reg.socialCode || reg.voucherCode || reg.companyVoucher || 'Nenhum', 
                  icon: Ticket,
                  highlight: !!(reg.couponCode || reg.socialCode || reg.voucherCode || reg.companyVoucher)
                },
                { 
                  label: 'Lote / Parceiro', 
                  value: reg.batchInfo?.companyName || reg.batchInfo?.name || 'Individual', 
                  icon: Users,
                  highlight: !!reg.batchInfo 
                },
                { 
                  label: 'Pagamento', 
                  value: reg.paymentMethod ? `${reg.paymentMethod.toUpperCase()}` : (reg.amount === 0 ? 'CORTESIA / BATCH' : 'PENDENTE'), 
                  icon: CreditCard 
                },
                { label: 'Data Registro', value: new Date(reg.createdAt).toLocaleDateString('pt-BR'), icon: Calendar },
              ].map(({ label, value, icon: Icon, highlight, primary }) => (
                <div key={label} className={`p-5 rounded-[1.5rem] border border-white/5 transition-all ${primary ? 'bg-teal-500/5 border-teal-500/20' : highlight ? 'bg-brand-orange-coral/5 border-brand-orange-coral/20' : 'bg-white/[0.02]'}`}>
                  <div className="flex items-center gap-2 mb-2 opacity-40">
                    <Icon className={`h-3 w-3 ${primary ? 'text-teal-400' : 'text-gray-400'}`} />
                    <p className="text-[9px] uppercase font-black tracking-widest text-ellipsis overflow-hidden whitespace-nowrap">{label}</p>
                  </div>
                  <p className={`text-sm font-black italic uppercase ${primary ? 'text-teal-400' : 'text-white'} truncate`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Activities Section */}
            <div className="p-6 border border-white/5 rounded-[2rem] bg-white/[0.01]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-sm font-black text-white italic uppercase tracking-tight">Atividades e Sessões</h4>
                  <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest">PROGRAMAÇÃO PERSONALIZADA</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[9px] text-teal-400 hover:text-white hover:bg-teal-500/10 font-bold px-4 uppercase rounded-xl border border-teal-500/20"
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
                    <Badge key={i} className="bg-white/5 text-gray-500 border-none px-3 py-1.5 font-black text-[10px] rounded-lg lowercase first-letter:uppercase">
                      {c}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="py-6 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center">
                  <p className="text-gray-800 text-[10px] font-black uppercase tracking-widest italic">Nenhuma atividade selecionada</p>
                </div>
              )}
            </div>

            {/* Actions Grid */}
            <div className="space-y-4">
               <h4 className="text-[10px] text-gray-700 font-black uppercase tracking-[0.2em] px-2">Ações Administrativas</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    onClick={() => {
                      onClose();
                      (window as any).dispatchAccreditation(reg);
                    }}
                    className="md:col-span-2 bg-teal-500 hover:bg-teal-600 text-white font-black py-8 h-auto rounded-[1.5rem] flex flex-col items-center justify-center gap-2 shadow-glow-teal border-none transition-all hover:scale-[1.01]"
                  >
                    <QrCode className="h-6 w-6" />
                    <span className="text-[10px] uppercase tracking-widest">REALIZAR CREDENCIAMENTO</span>
                  </Button>

                  <Button
                    onClick={() => {
                      const method = prompt('Informe a forma de pagamento (ex: Dinheiro, Pix, Cartão):', 'Dinheiro');
                      if (method) {
                         onUpdateStatus(reg.id, { 
                           status: 'paid', 
                           paymentMethod: method,
                           paymentDate: new Date().toISOString(),
                           amount: reg.palestrasNoturnas ? 179.90 : (reg.amount || 0)
                         });
                      }
                    }}
                    disabled={['paid', 'active', 'confirmado'].includes((reg.payment_status || reg.status || '').toLowerCase())}
                    className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 font-black h-14 rounded-2xl text-[9px] uppercase tracking-widest transition-all"
                  >
                    {['paid', 'active'].includes((reg.payment_status || reg.status || '').toLowerCase()) ? 'PAGAMENTO CONFIRMADO' : 'CONFIRMAR PAGO'}
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
                EXCLUIR REGISTRO PERMANENTEMENTE
              </Button>
            </div>
          </div>
        </div>

        <div className="admin-modal-footer p-8 pt-0">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-gray-400 hover:text-white font-bold h-12 px-8 rounded-xl border border-white/5 w-full sm:w-auto"
          >
            FECHAR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Componente Principal ──────────────────────────────────────
export default function AdminInscricoes() {
  const checkInHookReference = useCheckIns();
  (window as any).checkInsHook = checkInHookReference;

  const { data: registrations, update, remove, refetch: refetchRegistrations } = useRegistrations();
  const { data: checkIns, refetch: refetchCheckIns } = useCheckIns();
  const { data: transactions, create: createTransaction, update: updateTransaction, refetch: refetchTransactions } = useTransactions();
  const { data: allSessions } = useSessions();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _unused = allSessions;
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
  const [activeListTab, setActiveListTab] = useState('participantes');

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
    logger.info(`Atualizando status de inscrição ${id} para ${status}`);

    try {
      const registration = registrations.find(r => r.id === id);
      if (!registration) {
        logger.error(`Inscrição ${id} não encontrada para atualização.`);
        return;
      }

      const oldStatus = registration.status;
      const updates: any = typeof status === 'object' ? status : { status };
      const statusValue = typeof status === 'string' ? status : (updates.status || updates.paymentStatus);

      // Normalização de status para o padrão Growth Experience (Inglês)
      if (['paid', 'free', 'active'].includes(statusValue)) {
        updates.payment_status = 'paid';
        updates.status = 'active';
      }

      if (statusValue === 'free') {
        updates.amount = 0;
        updates.paid_amount = 0;
        updates.palestrasNoturnas = false;
      }

      await update(id, updates);

      // Sincronização financeira e de sessões em caso de cancelamento
      if (status === 'cancelled' && oldStatus !== 'cancelled') {
        if (registration.cursosSelecionados && registration.cursosSelecionados.length > 0) {
          for (const sessionId of registration.cursosSelecionados) {
            try {
              // Decrementar contador de sessões via RPC
              await (supabase.rpc as any)('decrement_session_count', { session_id: sessionId });
            } catch (err) {
              logger.error(`Erro ao decrementar sessão ${sessionId}:`, err);
            }
          }
        }

        const relatedTransaction = transactions.find(t => t.relatedId === id);
        if (relatedTransaction && relatedTransaction.status !== 'cancelled') {
          await updateTransaction(relatedTransaction.id, { status: 'cancelled' });
          toast.info('Lançamento financeiro cancelado.');
        }
      }

      // Registro financeiro para confirmações de pagamento
      if (['paid', 'free', 'active'].includes(status)) {
        try {
          let finalAmount = registration.amount || 0;
          
          // Caso especial: Night Experience sem valor definido
          if (['paid', 'active'].includes(status) && finalAmount === 0 && registration.palestrasNoturnas) {
            finalAmount = 179.90;
            await update(id, { amount: finalAmount } as any);
            updates.amount = finalAmount;
          }

          const amountValue = status === 'free' ? 0 : finalAmount;
          const description = `Inscrição (${status === 'free' ? 'Cortesia' : 'Manual'}): ${registration.name}${registration.palestrasNoturnas ? ' + Night Experience' : ''}`;

          const existingTransaction = transactions.find(t => t.relatedId === id);

          if (existingTransaction) {
            await updateTransaction(existingTransaction.id, {
              amount: amountValue,
              status: 'completed',
              description: description,
              date: new Date().toISOString()
            } as any);
            toast.success('Lançamento financeiro atualizado');
          } else if (!['paid', 'active'].includes(String(oldStatus).toLowerCase())) {
            await createTransaction({
              projectId: registration.projectId || '',
              type: 'income',
              category: 'Inscrições',
              description: description,
              amount: amountValue,
              date: new Date().toISOString(),
              status: 'completed',
              relatedId: id,
              relatedType: 'registration'
            } as any);
            toast.success('Lançamento registrado no financeiro');
          }
        } catch (finErr) {
          logger.error('Erro ao processar financeiro:', finErr);
        }
      }

      toast.success(`Status ${status.toUpperCase()} confirmado com sucesso!`);
      
      // Atualizar modal de detalhes localmente se estiver aberto
      if (detalhes && detalhes.id === id) {
        setDetalhes(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      logger.error('Erro fatal ao atualizar status:', error);
      toast.error('Ocorreu um erro ao processar a atualização. Verifique os logs.');
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
        for (const sessionId of registration.cursosSelecionados) {
          await supabase.rpc('decrement_session_count', { session_id: sessionId });
        }
      }

      const relatedTransactions = transactions.filter(t => t.relatedId === id);
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
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'paid' && ['paid', 'active', 'pago', 'confirmado'].includes((reg.status || '').toLowerCase())) ||
                         (statusFilter === 'pending' && ['pending', 'waiting', 'pendente', 'aguardando'].includes((reg.status || '').toLowerCase())) ||
                         (reg.status || '').toLowerCase() === statusFilter.toLowerCase();
    const matchesNight =
      nightFilter === 'all' ||
      (nightFilter === 'sim' && Boolean(reg.palestrasNoturnas)) ||
      (nightFilter === 'nao' && !reg.palestrasNoturnas);
    
    const isPartnerTeam = (reg as any).indicacaoTipo === 'parceiro' || (reg as any).referral_type === 'parceiro';
    const matchesTab = activeListTab === 'all' || 
                       (activeListTab === 'participantes' && !isPartnerTeam) ||
                       (activeListTab === 'trabalho' && isPartnerTeam);

    return matchesSearch && matchesStatus && matchesNight && matchesTab;
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
          onDelete={handleDeleteParticipant}
        />
      )}

      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tighter italic mb-1 uppercase">
            BASE DE <span className="text-brand-orange-coral">INSCRITOS</span>
          </h1>
          <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">
            Gerenciamento Estratégico de Participantes ({registrations.length})
          </p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-none bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white font-black h-11 sm:h-14 px-4 sm:px-8 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] uppercase tracking-widest shadow-glow-orange flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            NOVA INSCRIÇÃO
          </button>

          <Button
            variant="ghost"
            onClick={handleExport}
            disabled={exportingCSV}
            className="h-11 w-11 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-white/5 text-gray-400 hover:text-white border border-white/5 flex items-center justify-center p-0 shrink-0"
          >
             {exportingCSV ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <Download className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
        </div>
      </div>

      <Tabs value={activeListTab} onValueChange={setActiveListTab} className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 mb-6 rounded-2xl h-auto min-h-[3.5rem] flex-wrap justify-start sm:justify-center overflow-x-auto custom-scrollbar">
          <TabsTrigger value="participantes" className="flex-1 sm:flex-none h-12 sm:h-full px-4 sm:px-8 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest data-[state=active]:bg-teal-500 data-[state=active]:text-white transition-all whitespace-nowrap">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            PARTICIPANTES ({registrations.filter(r => (r as any).indicacaoTipo !== 'parceiro' && (r as any).referral_type !== 'parceiro').length})
          </TabsTrigger>
          <TabsTrigger value="trabalho" className="flex-1 sm:flex-none h-12 sm:h-full px-4 sm:px-8 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest data-[state=active]:bg-brand-orange-coral data-[state=active]:text-white transition-all whitespace-nowrap">
            <Handshake className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            TRABALHO ({registrations.filter(r => (r as any).indicacaoTipo === 'parceiro' || (r as any).referral_type === 'parceiro').length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex-1 sm:flex-none h-12 sm:h-full px-4 sm:px-8 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all whitespace-nowrap">
            TODOS ({registrations.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stats Grid Premium */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total Geral', value: registrations.length, icon: User, color: 'text-white' },
          { label: 'Confirmados', value: registrations.filter(r => ['paid', 'active'].includes(r.status?.toLowerCase())).length, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Night Exp.', value: registrations.filter(r => r.palestrasNoturnas).length, icon: Moon, color: 'text-[#FF7043]' },
          { label: 'Acreditados', value: registrations.filter(r => r.checkedIn).length, icon: QrCode, color: 'text-teal-400' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group p-5 sm:p-8 border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4 relative z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-all">
                <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-gray-500 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.25em] mb-1 italic">{stat.label}</p>
              <p className={`text-2xl sm:text-4xl font-black ${stat.color} tracking-tighter tabular-nums italic`}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Smart Filters Panel */}
      <div className="glass-card p-3 sm:p-4 border-white/5 rounded-[1.5rem] sm:rounded-[2rem] bg-white/[0.02] flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="relative flex-1 min-w-full lg:min-w-[300px]">
          <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-teal-500" />
          <Input
            type="text"
            placeholder="BUSCAR PELO NOME, E-MAIL OU Nº DO TICKET..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full h-11 sm:h-14 pl-12 sm:pl-16 bg-black/20 border-white/5 rounded-xl text-white font-black italic focus:border-teal-500 transition-all placeholder:text-gray-700 placeholder:text-[9px] sm:placeholder:text-[10px]"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <div className="flex-1 lg:flex-none flex items-center gap-2 h-11 sm:h-14 px-4 sm:px-6 bg-black/20 border border-white/5 rounded-xl">
             <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-400" />
             <select
               value={statusFilter}
               onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
               className="bg-transparent text-[9px] sm:text-[10px] font-black text-teal-400 uppercase tracking-widest focus:outline-none appearance-none cursor-pointer flex-1"
             >
               <option value="all">STATUS</option>
               <option value="paid">CONFIRMADO</option>
               <option value="pending">PENDENTE</option>
               <option value="cancelled">CANCELADO</option>
             </select>
          </div>

          <div className="flex-1 lg:flex-none flex items-center gap-2 h-11 sm:h-14 px-4 sm:px-6 bg-black/20 border border-white/5 rounded-xl">
             <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#FF7043]" />
             <select
               value={nightFilter}
               onChange={e => { setNightFilter(e.target.value); setCurrentPage(1); }}
               className="bg-transparent text-[9px] sm:text-[10px] font-black text-[#FF7043] uppercase tracking-widest focus:outline-none appearance-none cursor-pointer flex-1"
             >
               <option value="all">ACESSOS</option>
               <option value="sim">NIGHT ✓</option>
               <option value="nao">SEM NIGHT</option>
             </select>
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div className="flex items-center gap-2 w-full lg:w-auto lg:ml-auto">
             <Button
                variant="outline"
                onClick={handleCopyEmails}
                className="flex-1 lg:flex-none h-11 sm:h-14 border-teal-500/20 text-teal-400 hover:bg-teal-500/10 font-black text-[9px] uppercase tracking-widest px-4 sm:px-6"
              >
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                EMAILS ({selectedItems.length})
              </Button>
              <Button
                variant="ghost"
                onClick={() => setSelectedItems([])}
                className="h-11 sm:h-14 text-red-500/50 hover:text-red-400 font-black text-[9px] uppercase px-4"
              >
                LIMPAR
              </Button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="admin-table-container overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse responsive-table">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="p-6 hidden sm:table-cell">
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
                <th className="p-6 text-right text-[10px] font-black uppercase text-gray-500 tracking-widest italic pt-6 pr-6">Ações</th>
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
                    <td className="p-6 hidden sm:table-cell">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded-md bg-white/5 border-white/10 checked:bg-teal-500"
                        checked={selectedItems.includes(reg.id)}
                        onChange={() => toggleSelection(reg.id)}
                      />
                    </td>
                    <td className="p-6" data-label="Ticket / Data">
                      <p className="text-white font-mono text-xs font-black tracking-tight mb-1 group-hover:text-brand-orange-coral transition-colors">{reg.ticketNumber}</p>
                      <p className="text-gray-700 text-[9px] font-black uppercase tracking-widest">{new Date(reg.createdAt).toLocaleDateString('pt-BR')}</p>
                    </td>
                    <td className="p-6" data-label="Participante">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform hidden sm:flex">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-white text-sm font-black italic uppercase leading-none">{reg.name || '---'}</p>
                                {((reg as any).indicacaoTipo === 'parceiro' || (reg as any).referral_type === 'parceiro') && (
                                  <Badge className="bg-brand-orange-coral/10 text-brand-orange-coral border-none text-[8px] font-black uppercase px-2 py-0 h-4">EQUIPE</Badge>
                                )}
                              </div>
                              <div className="flex flex-col gap-1">
                                <p className="text-gray-700 text-[9px] font-black uppercase tracking-widest leading-none truncate max-w-[150px]">{reg.email}</p>
                                <p className="text-gray-800 text-[8px] font-black uppercase tracking-wider mt-1">{reg.phone || (reg as any).telefone}</p>
                                
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {reg.empresa && (
                                    <div className="flex items-center gap-1 text-teal-400 text-[8px] font-black uppercase tracking-widest bg-teal-500/5 px-1.5 py-0.5 rounded border border-teal-500/10">
                                      <Building2 className="w-2.5 h-2.5" />
                                      {reg.empresa}
                                    </div>
                                  )}
                                  
                                  {(reg.couponCode || reg.socialCode || reg.voucherCode || reg.companyVoucher) && (
                                    <div className="flex items-center gap-1 text-brand-orange-coral text-[8px] font-black uppercase tracking-widest bg-brand-orange-coral/5 px-1.5 py-0.5 rounded border border-brand-orange-coral/10">
                                      <Ticket className="w-2.5 h-2.5" />
                                      {reg.couponCode || reg.socialCode || reg.voucherCode || reg.companyVoucher}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                       </div>
                    </td>
                    <td className="p-6" data-label="Acreditação">
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
                    <td className="p-6" data-label="Financeiro">
                       <div className="flex flex-col gap-1.5 items-end sm:items-start">
                          {(() => {
                            const config = getStatusConfig(reg.payment_status || reg.status);
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
                          className="h-12 sm:h-10 w-full sm:w-10 rounded-xl bg-brand-orange-coral/10 text-brand-orange-coral sm:bg-white/5 sm:text-gray-400 hover:text-white hover:bg-teal-500/20 hover:border-teal-500/20 border border-brand-orange-coral/20 sm:border-transparent transition-all font-black text-[10px] uppercase sm:normal-case"
                        >
                          <Eye className="h-4 w-4 sm:mr-0 mr-2" />
                          <span className="sm:hidden">VER DETALHES</span>
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
              await Promise.all([
                refetchCheckIns(),
                refetchRegistrations()
              ]);
              toast.success('Inscrição marcada como concluída no sistema.');
            }
          }}
        />
      )}
    </div>
  );
}
