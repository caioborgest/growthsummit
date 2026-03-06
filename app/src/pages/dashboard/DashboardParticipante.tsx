import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  QrCode,
  User,
  Calendar,
  Users,
  MessageCircle,
  FileText,
  HelpCircle,
  Download,
  MapPin,
  LogOut,
  Sparkles,
  Award,
  Loader2,
  FolderOpen,
  CheckCircle2,
  CreditCard,
  Tag,
  BookOpen,
  Sun,
  Moon,
  XCircle,
  ChevronRight,
  ScanLine,
  Lock,
  Copy,
  CheckCircle,
  AlertCircle,
  Bell,
  BellRing,
  X,
  Star
} from 'lucide-react';
import { MentorRatingModal } from '@/components/mentoring/MentorRatingModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import QRCode from 'react-qr-code';
import { useAuth } from '@/contexts/AuthContext';
import { useSessions, useMentors, useMentoringSessions } from '@/hooks/useData';
import { useMyRegistration, MyRegistration } from '@/hooks/useMyRegistration';
import { useNavigate } from 'react-router-dom';
import { ProfileForm } from './components/ProfileForm';
import { useProject } from '@/contexts/ProjectContext';
import { EVENT_CONFIG } from '@/config/eventConfig';
import { generateTicketPDF } from '@/lib/reports';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { SelfCheckInModal } from './components/SelfCheckInModal';

// ── Modal: Upgrade Pro ────────────────────────────────────────────────────────
function UpgradeProModal({ registrationId, onClose, onSuccess }: {
  registrationId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [cupom, setCupom] = useState('');
  const [cupomValido, setCupomValido] = useState<null | { desconto: number; nome: string }>(null);
  const [loadingCupom, setLoadingCupom] = useState(false);
  const [loadingPagamento, setLoadingPagamento] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const { selectedProject } = useProject();
  const { registration } = useMyRegistration();

  const PRECO_BASE = 179.90;
  const precoFinal = cupomValido
    ? PRECO_BASE * (1 - cupomValido.desconto / 100)
    : PRECO_BASE;

  const validarCupom = async () => {
    if (!cupom.trim()) return;
    setLoadingCupom(true);
    try {
      const { data, error } = await (supabase.from('cupons_parceria_social' as never) as any)
        .select('codigo,porcentagem_desconto,indicacao_nome,ativo,uso_limite,uso_atual,vencimento')
        .eq('codigo', cupom.trim().toUpperCase())
        .eq('ativo', true)
        .maybeSingle();

      if (error || !data) {
        toast.error('Cupom não encontrado ou inativo.');
        setCupomValido(null);
        return;
      }
      if (data.uso_limite && data.uso_atual >= data.uso_limite) {
        toast.error('Cupom esgotado.');
        setCupomValido(null);
        return;
      }
      if (data.vencimento && new Date(data.vencimento) < new Date()) {
        toast.error('Cupom expirado.');
        setCupomValido(null);
        return;
      }

      setCupomValido({ desconto: data.porcentagem_desconto, nome: data.indicacao_nome || cupom });
      toast.success(`Cupom aplicado! ${data.porcentagem_desconto}% de desconto.`);
    } catch {
      toast.error('Erro ao validar cupom.');
    } finally {
      setLoadingCupom(false);
    }
  };

  const handlePagamento = async () => {
    setLoadingPagamento(true);
    try {
      // 1. WhatsApp Message for human confirmation
      // 2. Conditional WhatsApp Message or Immediate Confirmation
      if (precoFinal > 0) {
        const phoneInfo = registration?.telefone ? `\n• *Telefone:* ${registration.telefone}` : '';
        const cupomInfo = cupomValido ? `\n• *Cupom:* ${cupom.trim().toUpperCase()}` : '';

        const mensagem = encodeURIComponent(
          `🚀 *COMPROVANTE DE PAGAMENTO - GROWTH EXPERIENCE*\n\n` +
          `Olá! Acabo de realizar o pagamento do meu upgrade para o *Acesso Pro*.\n\n` +
          `*DADOS DO PARTICIPANTE:*\n` +
          `• *Nome:* ${user?.name || user?.email}${phoneInfo}${cupomInfo}\n` +
          `• *Evento:* ${selectedProject?.name || 'Growth Experience'}\n` +
          `• *Valor Pago:* R$ ${precoFinal.toFixed(2).replace('.', ',')}\n\n` +
          `_Estou enviando o comprovante em anexo abaixo._`
        );
        window.open(`https://wa.me/${EVENT_CONFIG.whatsapp.number}?text=${mensagem}`, '_blank');
      }

      // 3. Mark in DB as "pago" (Marked as paid to unlock features)
      const { error } = await (supabase.from('inscricoes_growth_experience' as never) as any)
        .update({
          palestras_noturnas: true,
          status_pagamento: 'pago',
          status: 'ativo',
          valor_pago: precoFinal,
          paid_at: new Date().toISOString(),
          cupom_palestra: cupomValido ? cupom.trim().toUpperCase() : null,
          valor_desconto_palestra: cupomValido ? PRECO_BASE - precoFinal : 0,
        })
        .eq('id', registrationId);

      if (error) throw error;

      // Incrementar uso do cupom se aplicado
      if (cupomValido && cupom) {
        await supabase.rpc('increment_uso_cupom', { p_codigo: cupom.trim().toUpperCase() })
          .catch(() => { }); // silently fail
      }

      if (precoFinal === 0) {
        toast.success('🎉 Upgrade concluído com sucesso!');
      } else {
        toast.success('🎉 Comprovante enviado! Bem-vindo às palestras noturnas!');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoadingPagamento(false);
    }
  };

  const handleCopyPix = () => {
    if (!EVENT_CONFIG.pix.cnpj) return;
    navigator.clipboard.writeText(EVENT_CONFIG.pix.cnpj);
    setCopied(true);
    toast.success("Chave PIX (CNPJ) copiada!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-dark-200 rounded-3xl border border-white/10 shadow-2xl my-auto relative overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-orange-500/20 to-transparent">
          <div>
            <h2 className="text-white font-black text-xl">Upgrade para Pro</h2>
            <p className="text-gray-400 text-sm mt-1">Palestras Noturnas + Mentorias Exclusivas</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Benefícios */}
          <div className="space-y-2">
            {['Acesso às 2 Palestras Noturnas', 'Leandro Batista + Vanylton Matias', 'Networking exclusivo pós-evento', 'Certificado de participação completo'].map((b, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle2 className="h-4 w-4 text-orange-400 flex-shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>

          {/* Cupom */}
          <div className="space-y-2">
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <Tag className="h-3 w-3" /> Cupom de Desconto (opcional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: GROWTH10"
                value={cupom}
                onChange={e => { setCupom(e.target.value.toUpperCase()); setCupomValido(null); }}
                className="flex-1 bg-dark-300 border border-dark-400 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 uppercase font-mono"
              />
              <Button
                variant="outline"
                className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 px-4 rounded-xl"
                onClick={validarCupom}
                disabled={loadingCupom || !cupom.trim()}
              >
                {loadingCupom ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aplicar'}
              </Button>
            </div>
            {cupomValido && (
              <p className="text-green-400 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> {cupomValido.desconto}% de desconto aplicado!
              </p>
            )}
          </div>

          {/* Preço */}
          <div className="bg-dark-300 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Valor original</span>
              <span className="text-gray-400">R$ {PRECO_BASE.toFixed(2).replace('.', ',')}</span>
            </div>
            {cupomValido && (
              <div className="flex justify-between text-sm">
                <span className="text-green-400">Desconto ({cupomValido.desconto}%)</span>
                <span className="text-green-400">- R$ {(PRECO_BASE - precoFinal).toFixed(2).replace('.', ',')}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-lg border-t border-dark-400 pt-2">
              <span className="text-white">Total</span>
              <span className="text-orange-400">R$ {precoFinal.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          {/* Dados PIX (Ocultar se for 100% de desconto) */}
          {precoFinal > 0 && (
            <div className="bg-dark-300 rounded-2xl p-4 space-y-3 border border-orange-500/10">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <QrCode className="h-3.5 w-3.5 text-orange-400" /> Pagamento via PIX (CNPJ)
                </h4>
                <Badge className="bg-orange-500/10 text-orange-400 border-none text-[10px] px-2">LIBERAÇÃO IMEDIATA</Badge>
              </div>

              <div className="flex items-center gap-3 bg-dark-200 p-3 rounded-xl border border-white/5 relative group transition-all hover:border-orange-500/30">
                <div className="flex-1">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">CUIDADO COM FRAUDES! FAVORECIDO:</p>
                  <p className="text-xs text-white font-bold leading-none">{EVENT_CONFIG.pix.beneficiario}</p>
                  <p className="text-sm font-mono text-white mt-1.5 font-bold">{EVENT_CONFIG.pix.cnpj}</p>
                </div>
                <button
                  onClick={handleCopyPix}
                  className="bg-orange-500 hover:bg-orange-600 p-2.5 rounded-lg text-white shadow-lg transition-all active:scale-95"
                >
                  {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>

              <div className="flex items-start gap-2 bg-orange-500/5 p-3 rounded-xl">
                <AlertCircle className="h-3.5 w-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-400 leading-tight">
                  Após o pagamento, clique no botão botão abaixo para <strong className="text-white">enviar o comprovante pelo WhatsApp</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Pagamento */}
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-6 h-auto rounded-2xl text-base shadow-lg shadow-orange-500/30 flex items-center gap-3"
            onClick={handlePagamento}
            disabled={loadingPagamento}
          >
            {loadingPagamento ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Processando...</>
            ) : precoFinal === 0 ? (
              <><Sparkles className="h-5 w-5" /> Esperamos você em breve!</>
            ) : (
              <><MessageCircle className="h-5 w-5" /> CONFIRMAR E ENVIAR COMPROVANTE</>
            )}
          </Button>
          <div className="flex items-center gap-2 bg-dark-400/50 p-3 rounded-xl border border-white/5">
            <MapPin className="h-3.5 w-3.5 text-orange-400" />
            <p className="text-[10px] text-gray-500 font-medium">Local: Arena Triunfo · Balcão de Credenciamento</p>
          </div>
          <p className="text-center text-gray-600 text-[10px] uppercase font-bold tracking-[0.2em]">Pagamento via PIX • Liberação Imediata</p>
        </div>
      </div>
    </div>
  );
}

// ── Modal: QR Check-in (mostra QR para o staff escanear) ─────────────────────
function CheckInModal({ registration, onClose }: { registration: MyRegistration; onClose: () => void }) {
  const [token] = useState(() => Date.now());
  const qrValue = `GE - CHECKIN | ${registration.id}| ${registration.email || ''}| ${token} `;

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-sm bg-dark-200 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative">
        {/* Abstract background blobs */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full -ml-16 -mb-16"></div>

        <div className="p-8 border-b border-white/5 flex items-center justify-between relative">
          <h2 className="text-white font-black text-2xl tracking-tight">Check-in</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="p-10 flex flex-col items-center text-center gap-8 relative">
          <div className="space-y-2">
            <p className="text-teal-400 font-black uppercase tracking-[0.2em] text-[10px]">Portal de Acesso</p>
            <p className="text-gray-400 text-sm px-4">Apresente este código no balcão de credenciamento.</p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-teal-500/30 transform hover:scale-105 transition-transform duration-500">
            <QRCode value={qrValue} size={180} />
          </div>

          <div className="space-y-1">
            <p className="text-gray-600 text-[10px] uppercase tracking-widest font-black">Identificação Única</p>
            <p className="text-white font-black text-3xl tracking-tighter italic">#{registration.id?.slice(0, 8).toUpperCase()}</p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Badge className="bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs px-6 py-3 rounded-2xl justify-center font-black">
              {registration.palestrasNoturnas ? '🌟 PASSE COMPLETO' : '☀️ FREE MORNING'}
            </Badge>
            <p className="text-gray-500 text-[10px] font-medium leading-relaxed">
              Válido para entrada única.<br />Documento de identidade pode ser solicitado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function DashboardParticipante() {
  const { selectedProject } = useProject();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { registration: myRegistration, refetch: refetchRegistration, checkInEntrada } = useMyRegistration();
  const { data: sessions } = useSessions();
  const [activeTab, setActiveTab] = useState('ingresso');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showSelfCheckIn, setShowSelfCheckIn] = useState(false);
  const { data: mentors } = useMentors();
  const { data: mentoringSessions, update: updateMentoring } = useMentoringSessions();
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    sessionId: string;
    mentorName: string;
    alreadyRated: boolean;
    avaliacao?: number;
    indicacao?: number;
  }>({
    isOpen: false,
    sessionId: '',
    mentorName: '',
    alreadyRated: false
  });

  const handleBookMentoring = async (slotId: string, topic: string) => {
    if (!myRegistration) return;

    const slot = mentoringSessions.find(s => s.id === slotId);
    if (!slot) return;

    const mentor = mentors.find(m => m.id === slot.mentorId);

    try {
      await updateMentoring(slotId, {
        menteeId: myRegistration.id,
        menteeName: myRegistration.nome || '',
        topic: topic || 'Mentoria Geral',
        status: 'scheduled'
      });

      // Envia notificação por e-mail para o mentor
      if (mentor?.email) {
        await supabase.functions.invoke('send-email', {
          body: {
            to: [mentor.email],
            subject: `🚀 Novo Agendamento de Mentoria: ${myRegistration.nome}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h1 style="color: #14b8a6;">Olá, ${mentor.name}!</h1>
                <p>Você tem um novo agendamento de mentoria confirmado na plataforma <strong>Growth Experience</strong>.</p>
                <div style="background: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 25px 0;">
                  <p style="margin: 0 0 10px 0;"><strong>Mentorado:</strong> ${myRegistration.nome}</p>
                  <p style="margin: 0 0 10px 0;"><strong>Data:</strong> ${new Date(slot.scheduledAt).toLocaleDateString('pt-BR')}</p>
                  <p style="margin: 0 0 10px 0;"><strong>Hora:</strong> ${new Date(slot.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p style="margin: 0;"><strong>Assunto/Tópico:</strong> ${topic || 'Mentoria Geral'}</p>
                </div>
                <p>Acesse seu painel para ver mais detalhes e preparar sua mentoria.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 Growth Experience - Petrolina/PE & Triunfo/PE</p>
              </div>
            `
          }
        });
      }

      toast.success('Mentoria agendada! O mentor foi notificado por e-mail.');
    } catch {
      toast.error('Erro ao agendar mentoria.');
    }
  };

  const handleRatingSubmit = async (sessionId: string, avaliacao: number, indicacao: number) => {
    try {
      await updateMentoring(sessionId, {
        status: 'completed',
        feedback: {
          rating: avaliacao, // Manter o rating legado para compatibilidade visual básica
          comment: '',
          avaliacaoMentoria: avaliacao,
          indicacaoMentor: indicacao,
          avaliadoEm: new Date().toISOString()
        }
      });
      toast.success('Avaliação enviada com sucesso!');
    } catch (err: any) {
      logger.error('Erro ao enviar avaliação:', err);
      toast.error('Erro ao salvar avaliação. Tente novamente.');
      throw err;
    }
  };

  const handleCancelMentoring = async (sessionId: string) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta mentoria? O horário ficará disponível para outros participantes.')) return;

    const session = mentoringSessions.find(s => s.id === sessionId);
    const mentor = session ? mentors.find(m => m.id === session.mentorId) : null;

    try {
      // Libera o slot: zera mentorado e marca como disponível novamente
      await updateMentoring(sessionId, {
        menteeId: '' as any,
        menteeName: '' as any,
        topic: undefined as any,
        status: 'scheduled'
      });

      // Notifica o mentor por e-mail sobre o cancelamento
      if (mentor?.email && session) {
        await supabase.functions.invoke('send-email', {
          body: {
            to: [mentor.email],
            subject: `❌ Cancelamento de Mentoria — ${myRegistration?.nome || 'Participante'}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h1 style="color: #ef4444;">Cancelamento de Mentoria</h1>
                <p>Olá, <strong>${mentor.name}</strong>!</p>
                <p>O participante <strong>${myRegistration?.nome || 'Participante'}</strong> cancelou a mentoria agendada.</p>
                <div style="background: #fef2f2; padding: 25px; border-radius: 12px; border: 1px solid #fecaca; margin: 25px 0;">
                  <p style="margin: 0 0 10px 0;"><strong>Data/Hora:</strong> ${new Date(session.scheduledAt).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}</p>
                  <p style="margin: 0;"><strong>Tópico cancelado:</strong> ${session.topic || 'Mentoria Geral'}</p>
                </div>
                <p>O horário voltou a ficar <strong style="color: #16a34a;">disponível</strong> e pode ser agendado por outro participante — inclusive presencialmente.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 Growth Experience - Petrolina/PE & Triunfo/PE</p>
              </div>
            `
          }
        });
      }

      toast.success('Mentoria cancelada. O horário está disponível novamente.');
    } catch {
      toast.error('Erro ao cancelar mentoria. Tente novamente.');
    }
  };

  const myMentorships = mentoringSessions.filter(s => s.menteeId === myRegistration?.id);
  const availableSlots = mentoringSessions.filter(s => !s.menteeId && s.status === 'scheduled');

  // ── Notificações dinâmicas ─────────────────────────────────────────────────
  const notifications = useMemo(() => {
    const items: { id: number; title: string; message: string; time: string; read: boolean; type?: 'info' | 'warning' | 'alert' }[] = [
      { id: 1, title: 'Bem-vindo!', message: 'Acesse o Guia do Participante para ver o mapa e a programação completa.', time: '', read: true, type: 'info' },
    ];

    const now = new Date();

    // Alerta 24h antes do evento
    if (selectedProject?.startDate) {
      const eventStart = new Date(selectedProject.startDate);
      const diffMs = eventStart.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours > 0 && diffHours <= 24) {
        const hoursLeft = Math.round(diffHours);
        items.unshift({
          id: 10,
          title: '🎉 O evento começa amanhã!',
          message: `Faltam aproximadamente ${hoursLeft}h para o ${selectedProject.name || 'Growth Experience'}. Prepare-se!`,
          time: `${hoursLeft}h restantes`,
          read: false,
          type: 'alert'
        });
      }
    }

    // Alertas 60 min antes de cada mentoria agendada
    myMentorships.forEach((session, idx) => {
      if (!session.scheduledAt) return;
      const sessionTime = new Date(session.scheduledAt);
      const diffMs = sessionTime.getTime() - now.getTime();
      const diffMinutes = diffMs / (1000 * 60);
      if (diffMinutes > 0 && diffMinutes <= 60) {
        const minutesLeft = Math.round(diffMinutes);
        items.unshift({
          id: 100 + idx,
          title: '⏰ Mentoria em breve!',
          message: `Sua mentoria com ${session.mentorName} começa em ${minutesLeft} minuto${minutesLeft !== 1 ? 's' : ''}. Prepare-se para a sessão!`,
          time: `${minutesLeft} min`,
          read: false,
          type: 'warning'
        });
      }
    });

    return items;
  }, [selectedProject, myMentorships]);

  // ── STATUS FINANCEIRO ──────────────────────────────────────────────────────
  // FREE MORNING (grátis): status = "Em aberto" (não há cobrança)
  // Experience Pro pago: status = "Confirmado"
  // Experience Pro não pago: status = "Pendente"
  const statusFinanceiro = useMemo(() => {
    if (!myRegistration?.palestrasNoturnas) {
      return { label: 'Grátis', color: 'bg-gray-500/20 text-gray-400 border-none', info: 'Inscrição diurna gratuita' };
    }
    const pgto = myRegistration?.statusPagamento;
    if (pgto === 'pago' || pgto === 'paid') {
      return { label: 'Confirmado', color: 'bg-green-500/20 text-green-400 border-none', info: 'Pagamento recebido' };
    }
    return { label: 'Pendente', color: 'bg-orange-500/20 text-orange-400 border-none', info: 'Aguardando pagamento' };
  }, [myRegistration]);

  // Cursos selecionados (busca nas sessions pelos IDs)
  const cursosSelecionados = useMemo(() => {
    const ids: string[] = myRegistration?.cursosSelecionados || [];
    if (!ids.length) return [];
    return sessions.filter(s => ids.includes(s.id));
  }, [sessions, myRegistration]);



  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ── LOGICA DE SCAN ─────────────────────────────────────────────────────────
  const handleScanSuccess = async (decodedText: string) => {
    try {
      if (!myRegistration) throw new Error('Inscrição não carregada');

      // Caso 1: Check-in de Entrada (GE-CHECKIN-ADMIN|CODE)
      if (decodedText.startsWith('GE-EVENT-ENTRY')) {
        await checkInEntrada();
        toast.success('Check-in de entrada realizado com sucesso!');
        return;
      }

      // Caso 2: Check-in em Atividade (Sessão/Sala)
      // Formato esperado: GE-ACTIVITY|SESSION_ID|TITLE
      if (decodedText.startsWith('GE-ACTIVITY')) {
        const parts = decodedText.split('|');
        const sessionId = parts[1];
        const sessionTitle = parts[2] || 'Atividade';

        // Registrar check-in da atividade
        const { error } = await (supabase.from('check_ins_atividades' as any) as any).insert({
          project_id: selectedProject?.id,
          registration_id: myRegistration.id,
          session_id: sessionId,
          timestamp: new Date().toISOString()
        });

        if (error) throw error;

        // Gerar placeholder de certificado
        await (supabase.from('certificados' as any) as any).insert({
          project_id: selectedProject?.id,
          registration_id: myRegistration.id,
          activity_name: sessionTitle,
          status: 'disponivel',
          issue_date: new Date().toISOString()
        }).catch(() => { });

        toast.success(`Check -in em "${sessionTitle}" confirmado! Certificado gerado.`);
        return;
      }

      throw new Error('QR Code inválido ou não reconhecido por este App');
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  };

  // ── Documentos do Storage ──────────────────────────────────────────────────
  const [documentos, setDocumentos] = useState<Array<{
    name: string; fullPath: string; size: string; updatedAt: string; url: string;
  }>>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const fetchDocumentos = useCallback(async () => {
    if (!selectedProject?.slug) return;
    setLoadingDocs(true);
    try {
      const bucket = 'event-files';
      const folder = selectedProject.slug;
      const { data, error } = await supabase.storage.from(bucket).list(folder, {
        limit: 20,
        sortBy: { column: 'name', order: 'asc' },
      });

      if (error || !data) { setDocumentos([]); return; }

      const files = data.filter(f => f.id && f.name !== '.emptyFolderPlaceholder');
      const withUrls = files.map(f => {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(`${folder}/${f.name}`);
        const sizeMB = f.metadata?.size ? `${(f.metadata.size / 1024 / 1024).toFixed(1)} MB` : '—';
        return {
          name: f.name,
          fullPath: `${folder}/${f.name}`,
          size: sizeMB,
          updatedAt: f.updated_at ? new Date(f.updated_at).toLocaleDateString('pt-BR') : '—',
          url: urlData.publicUrl,
        };
      });
      setDocumentos(withUrls);
    } catch {
      setDocumentos([]);
    } finally {
      setLoadingDocs(false);
    }
  }, [selectedProject?.slug]);

  useEffect(() => { fetchDocumentos(); }, [fetchDocumentos]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-dark-400 pb-20 mesh-gradient"
    >
      {/* Modals */}
      {showUpgradeModal && myRegistration && (
        <UpgradeProModal
          registrationId={myRegistration.id}
          onClose={() => setShowUpgradeModal(false)}
          onSuccess={refetchRegistration}
        />
      )}
      {showCheckInModal && myRegistration && (
        <CheckInModal registration={myRegistration} onClose={() => setShowCheckInModal(false)} />
      )}
      {showSelfCheckIn && myRegistration && (
        <SelfCheckInModal
          registration={myRegistration}
          onClose={() => setShowSelfCheckIn(false)}
          onScanSuccess={handleScanSuccess}
        />
      )}

      {/* Header Premium */}
      <div className="bg-dark-300 border-b border-white/5 shadow-xl relative overflow-hidden">
        {/* Glow background effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[120px] rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 blur-[120px] rounded-full -ml-32 -mb-32"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] bg-gradient-to-br from-orange-500 to-orange-700 p-0.5 shadow-xl shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full bg-dark-300 rounded-[1.4rem] flex items-center justify-center overflow-hidden">
                    {(user?.avatar || (user as any)?.avatarUrl) ? (
                      <img src={user.avatar || (user as any)?.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-orange-400" />
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-dark-300 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  {myRegistration?.nome || user?.name || 'Bem-vindo'}
                  <Sparkles className="h-5 w-5 text-orange-400 animate-pulse" />
                </h1>
                <p className="text-gray-400 font-medium tracking-wide uppercase text-[10px] md:text-xs">{selectedProject?.name || 'Growth Experience 2026'}</p>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className={`px-3 py-1 font-bold flex items-center gap-1.5 border ${myRegistration?.palestrasNoturnas
                    ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    : 'bg-teal-500/20 text-teal-400 border-teal-500/30'
                    }`}>
                    {myRegistration?.palestrasNoturnas ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
                    {myRegistration?.palestrasNoturnas ? 'Experience Pro' : 'Free Morning'}
                  </Badge>
                  <button
                    onClick={() => window.open('https://www.growthsummit.site/guia', '_blank')}
                    className="bg-white/5 hover:bg-white/10 text-gray-400 px-3 py-1 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <HelpCircle className="h-3 w-3" /> Guia
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500/5 hover:bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <LogOut className="h-3 w-3" /> Sair
                  </button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="relative bg-white/5 hover:bg-white/10 text-gray-400 p-1.5 rounded-full transition-colors">
                        <Bell className="h-4 w-4" />
                        {notifications.some(n => !n.read) && (
                          <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full border border-dark-300"></span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-dark-200 border-white/10 p-4 rounded-2xl shadow-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold">Notificações</h3>
                        <button
                          className="text-[10px] text-teal-400 font-bold uppercase tracking-wider opacity-40 cursor-default"
                        >
                          {notifications.filter(n => !n.read).length} nova{notifications.filter(n => !n.read).length !== 1 ? 's' : ''}
                        </button>
                      </div>
                      <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                        {notifications.map(n => (
                          <div key={n.id} className={`p-3 rounded-xl border transition-all ${n.read ? 'bg-white/5 border-transparent' : 'bg-orange-500/5 border-orange-500/20'}`}>
                            <div className="flex justify-between items-start gap-2">
                              <p className="text-white text-xs font-bold">{n.title}</p>
                              <span className="text-[9px] text-gray-500 whitespace-nowrap">{n.time}</span>
                            </div>
                            <p className="text-gray-400 text-[11px] mt-1 leading-tight">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowSelfCheckIn(true)}
                className="bg-teal-500 hover:bg-teal-600 text-white font-black px-6 py-6 h-auto rounded-2xl shadow-lg shadow-teal-500/20 flex items-center gap-3 active:scale-95 transition-all"
              >
                <ScanLine className="h-5 w-5" />
                AUTOCREDENCIAMENTO
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto bg-dark-200 mb-8 p-1 rounded-2xl shadow-inner shadow-black/20 overflow-hidden">
            <TabsTrigger value="ingresso" className="py-3 md:py-4 data-[state=active]:bg-teal-500 data-[state=active]:text-white rounded-xl transition-all duration-300">
              <QrCode className="h-4 w-4 md:mr-2" /> <span className="hidden sm:inline">Ingresso</span>
            </TabsTrigger>
            <TabsTrigger value="agenda" className="py-3 md:py-4 data-[state=active]:bg-teal-500 data-[state=active]:text-white rounded-xl transition-all duration-300">
              <Calendar className="h-4 w-4 md:mr-2" /> <span className="hidden sm:inline">Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="mentorias" className="py-3 md:py-4 data-[state=active]:bg-teal-500 data-[state=active]:text-white rounded-xl transition-all duration-300 text-orange-400">
              <Users className="h-4 w-4 md:mr-2" /> <span className="hidden sm:inline">Mentorias</span>
            </TabsTrigger>
            <TabsTrigger value="documentos" className="py-3 md:py-4 data-[state=active]:bg-teal-500 data-[state=active]:text-white rounded-xl transition-all duration-300">
              <FileText className="h-4 w-4 md:mr-2" /> <span className="hidden sm:inline">Docs</span>
            </TabsTrigger>
            <TabsTrigger value="certificados" className="py-3 md:py-4 data-[state=active]:bg-teal-500 data-[state=active]:text-white rounded-xl transition-all duration-300">
              <Award className="h-4 w-4 md:mr-2" /> <span className="hidden sm:inline">Certs</span>
            </TabsTrigger>
            <TabsTrigger value="dados" className="py-3 md:py-4 data-[state=active]:bg-teal-500 data-[state=active]:text-white rounded-xl transition-all duration-300">
              <User className="h-4 w-4 md:mr-2" /> <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
          </TabsList>

          {/* ── INGRESSO TAB ── */}
          <TabsContent value="ingresso">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* QR Code */}
              <div className="glass-card p-6 md:p-8 text-center flex flex-col items-center border-teal-500/20 relative overflow-hidden group">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500/50 to-transparent"></div>

                <h2 className="text-2xl font-black text-white mb-2 italic">Seu Acesso</h2>
                <div className="h-1 w-12 bg-teal-500 mb-2 rounded-full"></div>
                <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-black mb-8">Growth Experience 2026</p>

                <div className="relative p-2 rounded-[2.5rem] bg-gradient-to-br from-teal-500/20 to-orange-500/20 mb-8 group-hover:scale-[1.02] transition-transform duration-500">
                  <div className="bg-white p-6 rounded-[2rem] shadow-2xl shadow-teal-500/20">
                    <div className="w-44 h-44 md:w-56 md:h-56 bg-white flex items-center justify-center">
                      {myRegistration?.id ? (
                        <QRCode
                          value={`GE-CHECKIN|${myRegistration.id}|${user?.email || ''}|${myRegistration.id}`}
                          size={220}
                          viewBox={`0 0 256 256`}
                          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        />
                      ) : (
                        <QrCode className="h-32 w-32 text-gray-200" />
                      )}
                    </div>
                  </div>
                  {/* Decorative corner markers */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-teal-500 rounded-tl-3xl"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-3xl"></div>
                </div>

                <div className="space-y-1 mb-8">
                  <p className="text-gray-600 text-[10px] uppercase tracking-widest font-black">Protocolo de Acesso</p>
                  <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                    #{myRegistration?.id?.slice(0, 8).toUpperCase() || 'GS2026-X'}
                  </p>
                </div>

                <div className="flex gap-4 w-full">
                  <Button
                    variant="outline"
                    className="border-dark-300 rounded-xl hover:bg-dark-300 transition-all flex-1"
                    onClick={async () => {
                      if (!myRegistration) return;
                      await generateTicketPDF(myRegistration, selectedProject?.name || 'Growth Summit');
                      toast.success('Ingresso PDF gerado!');
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" /> PDF
                  </Button>
                  <Button
                    className="bg-teal-500 hover:bg-teal-600 text-white font-black rounded-xl px-4 md:px-8 flex-1 text-xs md:text-sm"
                    onClick={() => {
                      if (!myRegistration) {
                        toast.error('Nenhuma inscrição encontrada.');
                        return;
                      }
                      setShowCheckInModal(true);
                    }}
                  >
                    <QrCode className="h-4 w-4 mr-1 md:mr-2" /> VALIDAR
                  </Button>
                </div>
                <p className="text-gray-600 text-xs mt-4 max-w-xs">
                  Clique em VALIDAR para exibir seu QR Code de credenciamento. O staff vai escanear na entrada.
                </p>
              </div>

              {/* Status */}
              <div className="space-y-6">
                <div className="glass-card p-8">
                  <h3 className="text-lg font-bold text-white mb-6 border-b border-dark-300 pb-4 flex items-center">
                    <Sparkles className="h-5 w-5 mr-3 text-teal-400" />
                    Status da Inscrição
                  </h3>
                  <div className="space-y-4">
                    {/* Tipo */}
                    <div className="flex justify-between items-center p-3 bg-dark-100 rounded-xl">
                      <div className="flex items-center gap-2 text-gray-400">
                        {myRegistration?.palestrasNoturnas ? <Moon className="h-4 w-4 text-orange-400" /> : <Sun className="h-4 w-4 text-teal-400" />}
                        Tipo de Ingresso
                      </div>
                      <Badge className="bg-teal-500/20 text-teal-400 border-none uppercase text-[10px] font-black">
                        {myRegistration?.palestrasNoturnas ? 'Experience Pro' : 'Free Morning'}
                      </Badge>
                    </div>

                    {/* Status Financeiro */}
                    <div className="flex justify-between items-center p-3 bg-dark-100 rounded-xl">
                      <div className="flex items-center gap-2 text-gray-400">
                        <CreditCard className="h-4 w-4" />
                        Status Financeiro
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <Badge className={statusFinanceiro.color}>
                          {statusFinanceiro.label}
                        </Badge>
                        <span className="text-[10px] text-gray-600">{statusFinanceiro.info}</span>
                      </div>
                    </div>

                    {/* Acesso noturno */}
                    <div className="flex justify-between items-center p-3 bg-dark-100 rounded-xl">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Moon className="h-4 w-4" />
                        Acesso Noturno
                      </div>
                      <span className={myRegistration?.palestrasNoturnas ? "text-green-400 font-bold text-sm" : "text-gray-600 text-sm"}>
                        {myRegistration?.palestrasNoturnas ? '✓ Liberado' : 'Não incluso'}
                      </span>
                    </div>

                    {/* Cursos inscritos */}
                    {cursosSelecionados.length > 0 && (
                      <div className="p-3 bg-dark-100 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-gray-400 mb-3">
                          <BookOpen className="h-4 w-4 text-teal-400" />
                          <span className="text-sm font-semibold">Cursos/Oficinas Inscritos</span>
                        </div>
                        {cursosSelecionados.map((curso, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-white bg-dark-200 rounded-lg p-2">
                            <ChevronRight className="h-3 w-3 text-teal-400 flex-shrink-0" />
                            <span className="truncate">{(curso as any).title || (curso as any).titulo || 'Atividade'}</span>
                            <span className="ml-auto text-gray-500 text-xs flex-shrink-0">{(curso as any).startTime || (curso as any).horario_inicio || ''}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Upgrade Pro */}
                {!myRegistration?.palestrasNoturnas && (
                  <div className="glass-card p-6 md:p-8 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Moon className="h-5 w-5 text-orange-400" />
                      <h3 className="text-lg font-bold text-white">Upgrade para Pro</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                      Assista às <strong className="text-white">palestras noturnas</strong> com experts do mercado + mentorias exclusivas e networking premium.
                    </p>
                    <p className="text-orange-400 font-black text-2xl mb-5">R$ 179,90</p>
                    <Button
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 text-xs md:text-base"
                      onClick={() => setShowUpgradeModal(true)}
                    >
                      <CreditCard className="h-5 w-5" />
                      GARANTIR ACESSO PRO
                    </Button>
                  </div>
                )}

                {/* Check-in confirmado se pro */}
                {myRegistration?.palestrasNoturnas && statusFinanceiro.label === 'Confirmado' && (
                  <div className="glass-card p-6 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20 flex items-center gap-4">
                    <CheckCircle2 className="h-10 w-10 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-white font-bold">Acesso Completo Ativo!</p>
                      <p className="text-gray-400 text-sm">Você tem acesso a todas as atividades do evento.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── MENTORIAS TAB ── */}
          <TabsContent value="mentorias">
            {!myRegistration?.palestrasNoturnas || (myRegistration?.statusPagamento !== 'pago' && myRegistration?.statusPagamento !== 'paid') ? (
              <div className="glass-card p-12 text-center border-orange-500/20">
                <Lock className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Mentorias Exclusivas</h2>
                <p className="text-gray-400 max-w-md mx-auto mb-6">As sessões de mentoria 1-on-1 com os palestrantes e convidados são exclusivas para inscritos no passe <strong className="text-orange-400">Experience Pro</strong> com status <strong className="text-green-400">PAGO</strong>.</p>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white font-black" onClick={() => setShowUpgradeModal(true)}>
                  {(myRegistration?.palestrasNoturnas && (myRegistration?.statusPagamento !== 'pago' && myRegistration?.statusPagamento !== 'paid')) ? 'VERIFICAR PAGAMENTO' : 'FAZER UPGRADE AGORA'}
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Minhas Agendadas */}
                <div className="glass-card p-8 bg-gradient-to-br from-teal-500/5 to-transparent">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-teal-400" /> Minhas Mentorias
                  </h2>
                  <div className="space-y-3">
                    {myMentorships.map(session => (
                      <div key={session.id} className={`flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl border ${session.status === 'completed' ? 'bg-dark-200 border-white/5 opacity-80' : 'bg-dark-100 border-teal-500/20'}`}>
                        <div className="flex-1">
                          <p className="text-white font-black">{session.mentorName}</p>
                          <p className="text-teal-400 text-sm">{session.topic || 'Mentoria Geral'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">{new Date(session.scheduledAt).toLocaleDateString('pt-BR')}</p>
                          <p className="text-gray-400 text-sm">{new Date(session.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.status === 'completed' ? (
                            <div className="flex items-center gap-2">
                              <Badge className="bg-dark-300 text-gray-400">Concluído</Badge>
                              {!session.feedback?.avaliadoEm ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setRatingModal({
                                    isOpen: true,
                                    sessionId: session.id,
                                    mentorName: session.mentorName,
                                    alreadyRated: false
                                  })}
                                  className="h-8 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase px-3 rounded-lg"
                                >
                                  <Star className="h-3 w-3 mr-1.5 fill-current" />
                                  Avaliar
                                </Button>
                              ) : (
                                <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                  <span className="text-white text-xs font-bold">{session.feedback.avaliacaoMentoria}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <>
                              <Badge className="bg-green-500/20 text-green-400">Confirmado</Badge>
                              <button
                                onClick={() => handleCancelMentoring(session.id)}
                                title="Cancelar mentoria"
                                className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {myMentorships.length === 0 && (
                      <p className="text-gray-500 text-sm italic py-4 text-center">Você ainda não agendou nenhuma mentoria.</p>
                    )}
                  </div>
                </div>

                {/* Disponíveis */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-orange-400" /> Horários Disponíveis
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableSlots.map(slot => (
                      <div key={slot.id} className="glass-card p-5 border-white/5 bg-dark-200 flex flex-col justify-between group hover:border-orange-500/30 transition-all">
                        <div>
                          <p className="text-white font-black mb-1">{slot.mentorName}</p>
                          <div className="flex items-center gap-2 mb-4">
                            <Badge variant="outline" className="text-[10px] text-orange-400 border-orange-500/20">
                              {new Date(slot.scheduledAt).toLocaleDateString('pt-BR')}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] text-teal-400 border-teal-500/20">
                              {new Date(slot.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          className="w-full bg-dark-300 hover:bg-orange-500 text-white font-bold transition-all py-2 h-auto"
                          onClick={() => {
                            const topic = prompt('Qual o tema que deseja tratar na mentoria?');
                            if (topic) handleBookMentoring(slot.id, topic);
                          }}
                        >
                          SOLICITAR AGORA
                        </Button>
                      </div>
                    ))}
                    {availableSlots.length === 0 && (
                      <div className="md:col-span-3 py-12 text-center border-2 border-dashed border-dark-300 rounded-3xl">
                        <Users className="h-10 w-10 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-500">Nenhum horário disponível no momento.</p>
                        <p className="text-gray-600 text-xs">Aguarde a abertura oficial dos horários pelos mentores.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── AGENDA TAB ── */}
          <TabsContent value="agenda">
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-white">Minha Agenda</h2>
                  <p className="text-gray-400 text-sm mt-1">Atividades {myRegistration?.palestrasNoturnas ? 'diurnas e noturnas' : 'diurnas (gratuitas)'}</p>
                </div>
                <Button size="sm" variant="outline" className="border-dark-300 text-teal-400 hover:bg-teal-500/10" onClick={() => window.open('https://www.growthsummit.site/guia', '_blank')}>
                  Ver Programação
                </Button>
              </div>

              {/* Bloco Dia (Gratuito) */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sun className="h-5 w-5 text-teal-400" />
                  <h3 className="text-white font-bold">Programação Diurna <span className="text-teal-400 text-sm font-normal ml-1">— Gratuito</span></h3>
                </div>
                {cursosSelecionados.length > 0 ? (
                  <div className="space-y-3">
                    {cursosSelecionados.map((item: any, i) => (
                      <div key={i} className="flex items-center p-4 bg-dark-100 rounded-2xl border border-teal-500/20 hover:border-teal-500/40 transition-all group">
                        <div className="w-20 flex-shrink-0">
                          <p className="text-teal-400 font-black">{item.startTime || item.horario_inicio || '--:--'}</p>
                          <p className="text-gray-600 text-xs">{item.endTime || item.horario_fim || ''}</p>
                        </div>
                        <div className="flex-1 ml-4 border-l border-dark-300 pl-4">
                          <p className="text-white font-bold group-hover:text-teal-400 transition-colors">{item.title || item.titulo}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="outline" className="text-[10px] uppercase font-bold text-gray-500 border-dark-400">{item.type || item.tipo}</Badge>
                            <span className="text-xs text-gray-500 flex items-center"><MapPin className="h-3 w-3 mr-1" />{item.room || item.local || 'Sala'}</span>
                          </div>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-teal-400 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-dark-300 rounded-2xl">
                    <BookOpen className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Você ainda não selecionou cursos/oficinas.</p>
                    <Button variant="link" className="text-teal-400 mt-2 font-bold text-sm" onClick={() => navigate('/growth-experience-triunfo')}>
                      Escolher atividades →
                    </Button>
                  </div>
                )}
              </div>

              {/* Bloco Mentorias */}
              {myRegistration?.palestrasNoturnas && myMentorships.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-orange-400" />
                    <h3 className="text-white font-bold">Minhas Mentorias <span className="text-orange-400 text-sm font-normal ml-1">— 1-on-1</span></h3>
                  </div>
                  <div className="space-y-3">
                    {myMentorships.map((mentor) => (
                      <div key={mentor.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-orange-500/5 rounded-2xl border border-orange-500/20 hover:border-orange-500/40 transition-all group">
                        <div className="w-20 flex-shrink-0">
                          <p className="text-orange-400 font-black">{new Date(mentor.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="text-gray-600 text-xs">{new Date(mentor.scheduledAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="flex-1 md:ml-4 md:border-l md:border-dark-300 md:pl-4">
                          <p className="text-white font-black group-hover:text-orange-400 transition-colors">Mentoria com {mentor.mentorName}</p>
                          <p className="text-teal-400/80 text-sm font-medium">{mentor.topic}</p>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 justify-center h-fit">Confirmado</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bloco Noturno */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Moon className="h-5 w-5 text-orange-400" />
                  <h3 className="text-white font-bold">
                    Programação Noturna
                    <span className={`ml-2 text-sm font-normal ${myRegistration?.palestrasNoturnas ? 'text-orange-400' : 'text-gray-600'}`}>
                      {myRegistration?.palestrasNoturnas ? '— Liberado ✓' : '— Requer Upgrade Pro'}
                    </span>
                  </h3>
                </div>
                <div className="space-y-3">
                  {[
                    { hora: '19:00', titulo: 'Palestra: Crescimento Exponencial em Mercado Competitivo', palestrante: 'Leandro Batista', info: 'CEO, Fitness Exclusive' },
                    { hora: '21:10', titulo: 'Palestra: Inovação Corporativa', palestrante: 'Vanylton Matias', info: 'CEO, Grupo Núcleo' },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center p-4 rounded-2xl border transition-all ${myRegistration?.palestrasNoturnas ? 'bg-dark-100 border-orange-500/20 hover:border-orange-500/40' : 'bg-dark-100/40 border-dark-300 opacity-60'}`}>
                      <div className="w-20 flex-shrink-0">
                        <p className={`font-black ${myRegistration?.palestrasNoturnas ? 'text-orange-400' : 'text-gray-600'}`}>{item.hora}</p>
                      </div>
                      <div className="flex-1 ml-4 border-l border-dark-300 pl-4">
                        <p className="text-white font-bold text-sm">{item.titulo}</p>
                        <p className="text-gray-500 text-xs mt-1">{item.palestrante} · {item.info}</p>
                      </div>
                      {myRegistration?.palestrasNoturnas
                        ? <CheckCircle2 className="h-5 w-5 text-orange-400 flex-shrink-0" />
                        : <CreditCard className="h-5 w-5 text-gray-600 flex-shrink-0" />
                      }
                    </div>
                  ))}
                </div>
                {!myRegistration?.palestrasNoturnas && (
                  <Button
                    className="w-full mt-4 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold rounded-xl py-3"
                    onClick={() => setShowUpgradeModal(true)}
                  >
                    Fazer Upgrade Pro para desbloquer →
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── DOCUMENTOS TAB ── */}
          <TabsContent value="documentos">
            <div className="space-y-6">

              {/* 1. Meus Documentos (PDFs pessoais) */}
              <div className="glass-card p-8">
                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-teal-400" /> Meus Documentos
                </h2>
                <p className="text-gray-400 text-sm mb-5">Downloads personalizados com seus dados de inscrição.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Ingresso PDF */}
                  <div className="flex items-center justify-between p-5 bg-dark-100 rounded-2xl border border-teal-500/20 hover:border-teal-500/40 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                        <QrCode className="h-6 w-6 text-teal-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">Meu Ingresso</p>
                        <p className="text-gray-500 text-xs mt-0.5">PDF com QR Code • #{myRegistration?.id?.slice(0, 8).toUpperCase() || '—'}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost" size="icon"
                      className="text-gray-400 hover:text-teal-400 transition-colors"
                      onClick={async () => {
                        if (!myRegistration) { toast.error('Inscrição não encontrada.'); return; }
                        await generateTicketPDF(myRegistration, selectedProject?.name || 'Growth Experience');
                        toast.success('Ingresso gerado!');
                      }}
                    >
                      <Download className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Certificado PDF */}
                  <div className={`flex items-center justify-between p-5 rounded-2xl border transition-all group ${myRegistration?.checkedIn ? 'bg-dark-100 border-orange-500/20 hover:border-orange-500/40' : 'bg-dark-100/40 border-white/5 opacity-60'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${myRegistration?.checkedIn ? 'bg-orange-500/10' : 'bg-white/5'}`}>
                        <Award className={`h-6 w-6 ${myRegistration?.checkedIn ? 'text-orange-400' : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">Certificado de Participação</p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {myRegistration?.checkedIn ? '✓ Pronto para baixar' : 'Disponível após o check-in'}
                        </p>
                      </div>
                    </div>
                    {myRegistration?.checkedIn ? (
                      <Button
                        variant="ghost" size="icon"
                        className="text-gray-400 hover:text-orange-400 transition-colors"
                        onClick={async () => {
                          try {
                            toast.loading('Gerando certificado...', { id: 'cert-main' });
                            const { generateCertificatePDF } = await import('@/lib/certificateGenerator');
                            await generateCertificatePDF({
                              userName: myRegistration?.nome || user?.name || 'Participante',
                              eventName: selectedProject?.name || 'Growth Experience',
                              eventCity: selectedProject?.city || 'Triunfo',
                              date: new Date().toLocaleDateString('pt-BR'),
                              certificateCode: `EV-${myRegistration?.id.slice(0, 8).toUpperCase()}`,
                              type: 'event'
                            });
                            toast.success('Certificado baixado!', { id: 'cert-main' });
                          } catch {
                            toast.error('Erro ao gerar certificado.', { id: 'cert-main' });
                          }
                        }}
                      >
                        <Download className="h-5 w-5" />
                      </Button>
                    ) : (
                      <Lock className="h-5 w-5 text-gray-700 mr-2" />
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Conteúdo do Evento (in-app) */}
              <div className="glass-card p-8">
                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-teal-400" /> Conteúdo do Evento
                </h2>
                <p className="text-gray-400 text-sm mb-5">
                  Informações atualizadas em tempo real pela organização. Sem PDF — tudo no app.
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { icon: Calendar, label: 'Programação Completa', desc: 'Grade e horários do evento', color: 'teal', route: 'https://www.growthsummit.site/guia' },
                    { icon: MapPin, label: 'Mapa do Evento', desc: 'Localização das salas', color: 'blue', route: 'https://www.growthsummit.site/guia' },
                    { icon: HelpCircle, label: 'Guia do Participante', desc: 'Como aproveitar ao máximo', color: 'purple', route: 'https://www.growthsummit.site/guia' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => item.route.startsWith('http') ? window.open(item.route, '_blank') : navigate(item.route)}
                      className={`flex flex-col items-start p-5 bg-dark-100 rounded-2xl border border-${item.color}-500/20 hover:border-${item.color}-500/40 hover:bg-${item.color}-500/5 transition-all text-left group`}
                    >
                      <div className={`w-11 h-11 rounded-xl bg-${item.color}-500/10 flex items-center justify-center mb-4`}>
                        <item.icon className={`h-6 w-6 text-${item.color}-400`} />
                      </div>
                      <p className="text-white font-bold text-sm group-hover:text-teal-300 transition-colors">{item.label}</p>
                      <p className="text-gray-500 text-xs mt-1">{item.desc}</p>
                      <div className={`mt-3 flex items-center gap-1 text-${item.color}-400 text-xs font-bold`}>
                        Acessar <ChevronRight className="h-3 w-3" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Materiais extras do Storage */}
              {(loadingDocs || documentos.length > 0) && (
                <div className="glass-card p-8">
                  <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-teal-400" /> Materiais Extras
                  </h2>
                  <p className="text-gray-400 text-sm mb-5">Arquivos adicionais enviados pela organização.</p>
                  {loadingDocs ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-7 w-7 text-teal-400 animate-spin" />
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {documentos.map((doc) => (
                        <div key={doc.fullPath} className="flex items-center justify-between p-4 bg-dark-100 rounded-2xl border border-dark-300 hover:border-teal-500/30 transition-all group">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 w-5 text-teal-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-bold text-sm truncate max-w-[160px]">{doc.name}</p>
                              <p className="text-gray-500 text-xs">{doc.size} · {doc.updatedAt}</p>
                            </div>
                          </div>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" download onClick={() => toast.success(`Baixando: ${doc.name}`)} className="ml-2 flex-shrink-0">
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-teal-400 transition-colors">
                              <Download className="h-5 w-5" />
                            </Button>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── PERFIL TAB ── */}
          <TabsContent value="dados">
            <ProfileForm />
          </TabsContent>

          {/* ── CERTIFICADOS TAB ── */}
          <TabsContent value="certificados">
            <div className="glass-card p-12 text-center border-teal-500/20">
              <div className="w-20 h-20 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-6">
                <Award className="h-10 w-10 text-teal-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Suas Conquistas</h2>
              <p className="text-gray-400 max-w-lg mx-auto mb-8">Certificados de participação e cursos disponíveis após o evento.</p>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white font-black px-10 py-6 h-auto rounded-xl" onClick={() => navigate('/meus-certificados')}>
                <Award className="h-5 w-5 mr-2" /> VER CERTIFICADOS
              </Button>
            </div>
          </TabsContent>

          {/* ── SUPORTE TAB ── */}
          <TabsContent value="suporte">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass-card p-8">
                <h2 className="text-xl font-bold text-white mb-8 border-b border-dark-300 pb-4">Canais de Ajuda</h2>
                <div className="space-y-4">
                  <a href="https://wa.me/5588999999999" target="_blank" rel="noopener noreferrer"
                    className="flex items-center p-4 bg-dark-100 rounded-2xl hover:bg-teal-500/5 transition-all cursor-pointer">
                    <MessageCircle className="h-8 w-8 mr-5 text-teal-400" />
                    <div>
                      <p className="text-white font-bold">WhatsApp do Evento</p>
                      <p className="text-gray-500 text-sm">Fale com a equipe de organização</p>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 text-gray-600" />
                  </a>
                  <div className="flex items-center p-4 bg-dark-100 rounded-2xl">
                    <MapPin className="h-8 w-8 mr-5 text-teal-400" />
                    <div>
                      <p className="text-white font-bold">Ponto de Apoio</p>
                      <p className="text-gray-500 text-sm">Arena Triunfo · Balcão de Credenciamento</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="glass-card p-8 bg-teal-500/5 border-teal-500/20">
                <h2 className="text-xl font-bold text-white mb-4">App do Evento</h2>
                <p className="text-gray-400 mb-6 leading-relaxed text-sm">Instale o app para receber notificações sobre sua agenda, matches e palestras em tempo real.</p>
                <Button className="w-full bg-teal-500 text-white font-black py-4 rounded-xl shadow-lg shadow-teal-500/20">
                  INSTALAR APLICATIVO
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {/* Modal de Avaliação */}
      <MentorRatingModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal(p => ({ ...p, isOpen: false }))}
        mentorName={ratingModal.mentorName}
        sessionId={ratingModal.sessionId}
        alreadyRated={ratingModal.alreadyRated}
        existingAvaliacaoMentoria={ratingModal.avaliacao}
        existingIndicacaoMentor={ratingModal.indicacao}
        onSubmit={handleRatingSubmit}
      />
    </motion.div>
  );
}
