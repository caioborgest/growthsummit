import { useState, useMemo } from 'react';
import { 
  Headset, 
  Search, 
  Clock, 
  AlertTriangle, 
  MessageSquare, 
  User, 
  Send,
  Circle,
  ShieldCheck,
  Tag,
  ArrowLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  useSupportTickets, 
  useSupportMessages 
} from '@/hooks/useData';
import { supportService } from '@/services/supportService';
import { notificationService } from '@/services/notificationService';
import { useProject } from '@/contexts/ProjectContext';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export default function AdminSupport() {
  const { selectedProject } = useProject();
  const { data: tickets, isLoading: loadingTickets, refetch: refetchTickets } = useSupportTickets();
  
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const selectedTicket = useMemo(() => 
    tickets.find(t => t.id === selectedTicketId), 
  [tickets, selectedTicketId]);

  const { data: messages, isLoading: loadingMessages, refetch: refetchMessages } = useSupportMessages(selectedTicketId || undefined);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = 
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [tickets, searchTerm, statusFilter, categoryFilter]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !replyMessage.trim() || !selectedTicket) return;

    setIsSending(true);
    try {
      await supportService.addMessage({
        ticket_id: selectedTicketId,
        message: replyMessage,
        is_admin: true
      });

      // Notificar o participante
      if (selectedTicket.userId && selectedProject?.id) {
        await notificationService.send(selectedTicket.userId, {
          title: 'Suporte Respondeu',
          message: `Sua solicitação "${selectedTicket.subject}" recebeu uma nova resposta da nossa equipe.`,
          type: 'info',
          actionUrl: '/minha-area?tab=suporte'
        }, selectedProject.id).catch(err => logger.error('Erro ao notificar usuário:', err));
      }

      setReplyMessage('');
      await refetchMessages();
      await refetchTickets(); // Update status to in_progress if it was open
      toast.success('Resposta enviada!');
    } catch (err) {
      logger.error('Erro ao responder ticket:', err);
      toast.error('Falha ao enviar resposta.');
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicketId) return;
    try {
      await supportService.updateTicket(selectedTicketId, { status: status as 'open' | 'in_progress' | 'resolved' | 'closed' });
      await refetchTickets();
      toast.success(`Ticket atualizado para ${status}`);
    } catch {
      toast.error('Erro ao atualizar ticket.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-2 py-0.5 text-[9px] font-black uppercase">Aberto</Badge>;
      case 'in_progress': return <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 px-2 py-0.5 text-[9px] font-black uppercase">Em Progresso</Badge>;
      case 'resolved': return <Badge className="bg-green-500/10 text-green-400 border-green-500/20 px-2 py-0.5 text-[9px] font-black uppercase">Resolvido</Badge>;
      case 'closed': return <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20 px-2 py-0.5 text-[9px] font-black uppercase">Fechado</Badge>;
      default: return null;
    }
  };

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'urgent': return { color: 'text-red-500', icon: AlertTriangle, label: 'URGENTE' };
      case 'high': return { color: 'text-orange-500', icon: AlertTriangle, label: 'ALTA' };
      case 'medium': return { color: 'text-blue-500', icon: Circle, label: 'MÉDIA' };
      case 'low': return { color: 'text-gray-500', icon: Circle, label: 'BAIXA' };
      default: return { color: 'text-gray-500', icon: Circle, label: 'BAIXA' };
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-180px)] overflow-hidden flex flex-col">
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 glass-card border-white/5 mx-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-400">
            <Headset className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white italic tracking-tighter uppercase leading-none">Central de Atendimento</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Gestão de Suporte e Satisfação</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-2xl px-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por usuário, e-mail ou assunto..."
              className="pl-10 h-10 bg-white/5 border-white/10 rounded-xl text-sm"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-10 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-black text-gray-400"
          >
            <option value="all">TODOS STATUS</option>
            <option value="open">ABERTOS</option>
            <option value="in_progress">EM PROGRESSO</option>
            <option value="resolved">RESOLVIDOS</option>
            <option value="closed">FECHADOS</option>
          </select>
          <select 
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="h-10 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-black text-gray-400"
          >
            <option value="all">TODAS CATEGORIAS</option>
            <option value="technical">TÉCNICO</option>
            <option value="finance">FINANCEIRO</option>
            <option value="registration">INSCRIÇÃO</option>
            <option value="general">GERAL</option>
          </select>
        </div>
      </div>

      <div className="flex gap-6 flex-1 px-2 overflow-hidden">
        {/* Tickets List */}
        <div className={`w-full lg:w-[400px] flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar ${selectedTicketId ? 'hidden lg:flex' : 'flex'}`}>
          {loadingTickets ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-28 bg-white/5 rounded-3xl animate-pulse" />
            ))
          ) : filteredTickets.length > 0 ? (
            filteredTickets.map(ticket => {
              const priority = getPriorityInfo(ticket.priority);
              const isActive = selectedTicketId === ticket.id;
              
              return (
                <div 
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden ${
                    isActive 
                      ? 'bg-teal-500/10 border-teal-500/30' 
                      : 'bg-dark-200 border-white/5 hover:border-white/10'
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]" />}
                  
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <priority.icon className={`h-3 w-3 ${priority.color}`} />
                      <span className={`text-[9px] font-black uppercase tracking-widest ${priority.color}`}>{priority.label}</span>
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>

                  <h3 className={`text-sm font-black italic uppercase leading-tight mb-2 truncate ${isActive ? 'text-teal-400' : 'text-white'}`}>
                    {ticket.subject}
                  </h3>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-teal-400 transition-colors">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-gray-300 uppercase leading-none">{ticket.name || 'Participante'}</p>
                      <p className="text-[10px] text-gray-500 font-bold lowercase mt-1">{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-30">
              <Headset className="h-10 w-10 mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">Nenhum chamado encontrado</p>
            </div>
          )}
        </div>

        {/* Conversation Area */}
        <div className={`flex-1 flex flex-col glass-card border-white/5 overflow-hidden animate-fade-in ${!selectedTicketId ? 'hidden lg:flex' : 'flex'}`}>
          {selectedTicket && selectedTicketId ? (
            <>
              {/* Header Context */}
              <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSelectedTicketId(null)}
                    className="lg:hidden text-gray-500"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-lg font-black text-white italic uppercase">{selectedTicket.subject}</h2>
                      {getStatusBadge(selectedTicket.status)}
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1.5">
                         <User className="h-3 w-3" /> {selectedTicket.name} ({selectedTicket.email})
                       </span>
                       <span className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1.5">
                         <Tag className="h-3 w-3" /> {selectedTicket.category}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus('resolved')}
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10 text-[10px] font-black uppercase h-8"
                  >
                    Marcar Resolvido
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus('closed')}
                    className="border-gray-500/30 text-gray-400 hover:bg-white/5 text-[10px] font-black uppercase h-8"
                  >
                    Fechar
                  </Button>
                </div>
              </div>

              {/* Chat Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                {/* User's Original Issue */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1 max-w-[80%]">
                    <div className="bg-dark-100 border border-white/5 rounded-3xl rounded-tl-none p-5 shadow-xl">
                       <p className="text-[9px] font-black text-teal-400 uppercase tracking-widest mb-2 italic">Solicitação Inicial • ID #{selectedTicketId.slice(-6)}</p>
                       <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{selectedTicket.message}</p>
                    </div>
                    <span className="text-[10px] text-gray-600 font-bold uppercase mt-2 block ml-2">{selectedTicket.name} • {new Date(selectedTicket.createdAt).toLocaleString('pt-BR')}</span>
                  </div>
                </div>

                {loadingMessages ? (
                   <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20">
                     <Clock className="h-8 w-8 animate-spin" />
                     <p className="text-[10px] font-black uppercase tracking-[0.2em]">Carregando histórico...</p>
                   </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`flex gap-4 ${msg.isAdmin ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${msg.isAdmin ? 'bg-teal-500/20 border border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.2)]' : 'bg-white/5 border border-white/10'}`}>
                        {msg.isAdmin ? <ShieldCheck className="h-5 w-5 text-teal-400" /> : <User className="h-5 w-5 text-gray-400" />}
                      </div>
                      <div className={`flex-1 max-w-[80%] ${msg.isAdmin ? 'text-right' : ''}`}>
                        <div className={`p-5 rounded-3xl ${msg.isAdmin ? 'bg-teal-500/10 border border-teal-500/30 rounded-tr-none text-white' : 'bg-dark-100 border border-white/5 rounded-tl-none text-gray-300 shadow-xl'}`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        <span className="text-[10px] text-gray-600 font-bold uppercase mt-2 block mx-2">
                          {msg.isAdmin ? 'Time Growth' : selectedTicket.name} • {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Reply Area */}
              {selectedTicket.status !== 'closed' ? (
                <form onSubmit={handleReply} className="p-6 bg-dark-200 border-t border-white/5">
                  <div className="relative group">
                    <textarea 
                      required
                      value={replyMessage}
                      onChange={e => setReplyMessage(e.target.value)}
                      placeholder="Responda ao participante com clareza e empatia..."
                      className="w-full bg-dark-100 border border-white/10 rounded-[2rem] p-5 pr-16 text-white text-sm focus:border-teal-400 transition-all outline-none min-h-[120px] resize-none scrollbar-none"
                    />
                    <Button 
                      type="submit"
                      disabled={isSending || !replyMessage.trim()}
                      className="absolute right-3 bottom-3 w-12 h-12 bg-teal-500 hover:bg-teal-600 rounded-2xl shadow-xl shadow-teal-500/20 active:scale-90 transition-all flex items-center justify-center"
                    >
                      <Send className="h-5 w-5 text-white" />
                    </Button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter italic">O envio atualizará o status para Em Atendimento</p>
                    <div className="flex gap-4">
                       <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-black uppercase tracking-widest"><ShieldCheck className="h-3.5 w-3.5 text-teal-400" /> Atendimento Oficial</span>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="p-10 text-center bg-dark-300/50">
                   <p className="text-xs font-black text-gray-600 uppercase tracking-widest">Este chamado foi encerrado e não aceita mais respostas.</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-teal-500/[0.02] to-transparent pointer-events-none" />
               <div className="relative z-10">
                 <div className="w-24 h-24 bg-teal-500/10 rounded-[2rem] flex items-center justify-center text-teal-500/20 mb-8 border border-teal-500/10 rotate-3">
                   <MessageSquare className="h-10 w-10 -rotate-3" />
                 </div>
                 <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">Aguardando Seleção</h2>
                 <p className="text-gray-500 text-xs font-bold max-w-sm mx-auto uppercase leading-relaxed tracking-widest">
                   Escolha um atendimento na lista lateral para visualizar e interagir com o participante. Priorize os chamados abertos e urgentes.
                 </p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
