import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  QrCode,
  User,
  Calendar,
  Users,
  MessageCircle,
  FileText,
  Sparkles,
  Award,
  Loader2,
  CheckCircle2,
  BookOpen,
  XCircle,
  CheckCircle,
  Tag,
  Copy,
  AlertCircle,
  MapPin,
  Clock,
  Info,
  ArrowRight,
  ChevronRight,
  Building2,
  Trophy
} from 'lucide-react';
import { MentorRatingModal } from '@/components/mentoring/MentorRatingModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tabs
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import QRCode from 'react-qr-code';
import { useAuth } from '@/contexts/AuthContext';
import { useSessions, useMentors, useMentoringSessions, useCheckInsAtividades, useRegistrationBatches, useStands, useLeads } from '@/hooks/useData';
import { useMyRegistration, type MyRegistration } from '@/hooks/useMyRegistration';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MentorshipSection } from './components/MentorshipSection';
import { AgendaSection } from './components/AgendaSection';
import { TicketSection } from './components/TicketSection';
import { DocsSection } from './components/DocsSection';
import { CertificatesSection } from './components/CertificatesSection';
import { ProfileForm } from './components/ProfileForm';
import { DashboardEquipe } from './components/DashboardEquipe';
import { useProject } from '@/contexts/ProjectContext';
import { EVENT_CONFIG } from '@/config/eventConfig';
import { generateTicketPDF } from '@/lib/reports';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { SelfCheckInModal } from './components/SelfCheckInModal';
import { MentoriaMultiStepModal } from '@/components/forms/MentoriaMultiStepModal';
import { B2BFormModal } from '@/components/forms/B2BFormModal';
import { StartupFormModal } from '@/components/forms/StartupFormModal';
import { PremiumHeader } from './components/shared/PremiumHeader';
import { PremiumBackground } from './components/shared/PremiumBackground';
import { QuickActions } from './components/shared/QuickActions';
import { PwaDashboardHero } from './components/shared/DashboardHero';
import { NextActivityCard } from './components/shared/NextActivityCard';
import { GamificationSection } from './components/GamificationSection';
import { generateCertificateCode, generateCertificatePDF, imageUrlToBase64 } from '@/lib/certificateGenerator';

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
  const { data: allSessions } = useSessions();
  const PRECO_BASE = 179.90;
  const precoFinal = cupomValido
    ? PRECO_BASE * (1 - cupomValido.desconto / 100)
    : PRECO_BASE;

  const nightSpeakers = useMemo(() => {
    const night = allSessions?.filter(s => s.category === 'noturna') || [];
    if (night.length === 0) return 'Leandro Batista + Vanylton Matias';
    const names = night.map(s => s.speakers?.split(',').shift()).filter(Boolean);
    return names.join(' + ');
  }, [sessions]);

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

      // 3. Mark in DB
      const isPaid = precoFinal === 0;
      const { error } = await (supabase.from('inscricoes_growth_experience' as never) as any)
        .update({
          palestras_noturnas: true,
          status_pagamento: isPaid ? 'pago' : 'pendente',
          status: isPaid ? 'ativo' : 'pendente',
          valor_pago: precoFinal,
          paid_at: isPaid ? new Date().toISOString() : null,
          cupom_palestra: cupomValido ? cupom.trim().toUpperCase() : null,
          valor_desconto_palestra: cupomValido ? PRECO_BASE - precoFinal : 0,
        })
        .eq('id', registrationId);

      if (error) throw error;

      // Incrementar uso do cupom se aplicado
      if (cupomValido && cupom) {
        await (supabase.rpc as any)('increment_uso_cupom', { p_codigo: cupom.trim().toUpperCase() })
          .catch(() => { }); // silently fail
      }

      if (precoFinal === 0) {
        toast.success('🎉 Upgrade concluído com sucesso!');
      } else {
        toast.success('🎉 Comprovante enviado! Aguarde a confirmação do admin para liberar as mentorias.');
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
  {[
    `Acesso às ${allSessions?.filter(s => s.category === 'noturna').length || 2} Palestras Noturnas`, 
    nightSpeakers, 
    'Networking exclusivo pós-evento', 
    'Certificado de participação completo'
  ].map((b, i) => (
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { registration: myRegistration, refetch: refetchRegistration, checkInEntrada } = useMyRegistration();
  const { data: allSessions } = useSessions();
  const { data: activityCheckIns } = useCheckInsAtividades();
  const { create: registerStandCheckIn } = useStandCheckIns();
  const { data: batches = [] } = useRegistrationBatches();
  const { data: stands = [] } = useStands();
  const { data: leads = [], create: createLead } = useLeads();

  const nextActivity = useMemo(() => {
    if (!allSessions || !activityCheckIns) return null;
    
    // Sort all sessions by time
    const sorted = [...allSessions].sort((a, b) => {
      const timeA = a.startTime || '00:00';
      const timeB = b.startTime || '00:00';
      return timeA.localeCompare(timeB);
    });

    // Find the first session that doesn't have a check-in or is closest to now
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return sorted.find(s => {
        const isAlreadyCheckedIn = activityCheckIns?.some(c => c.session_id === s.id && c.registration_id === myRegistration?.id);
        return !isAlreadyCheckedIn && (s.startTime || '00:00') >= currentTimeStr;
    }) || sorted[0]; // Fallback to first session if none found
  }, [allSessions, activityCheckIns, myRegistration?.id]);

  // Manual notifications can be added here if needed
  const [extraNotifications] = useState<any[]>([]);
  
  const myBatches = useMemo(() => {
    return batches.filter(b => b.emailResponsavel === user?.email);
  }, [batches, user]);

  const initialTab = searchParams.get('tab') || 'ingresso';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [isSelfCheckInOpen, setIsSelfCheckInOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isB2BModalOpen, setIsB2BModalOpen] = useState(false);
  const [isStartupModalOpen, setIsStartupModalOpen] = useState(false);

  const nightSpeakers = useMemo(() => {
    const night = allSessions?.filter(s => s.category === 'noturna') || [];
    if (night.length === 0) return 'Leandro Batista + Vanylton Matias';
    const names = night.map(s => s.speakers?.split(',').shift()).filter(Boolean);
    return names.join(' + ');
  }, [allSessions]);

  // Auto-refetch registration to keep status in sync with backoffice
  useEffect(() => {
    const interval = setInterval(() => {
      refetchRegistration();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetchRegistration]);
  const [isMentoriaModalOpen, setIsMentoriaModalOpen] = useState(false);
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

  const handleDownloadTicket = () => {
    if (!myRegistration) {
      toast.error('Inscrição não encontrada.');
      return;
    }
    generateTicketPDF(myRegistration, selectedProject?.name || 'Growth Experience');
  };

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
    } catch (err: unknown) {
      console.error('Erro ao enviar avaliação:', err);
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
        menteeEmail: '' as any,
        menteePhone: '' as any,
        topic: 'Disponível para Mentoria' as any,
        notes: 'Slot liberado pelo participante.' as any,
        startupName: '' as any,
        sector: '' as any,
        status: 'scheduled'
      });

      // Notifica o mentor por e-mail sobre o cancelamento
      if (mentor?.email && session) {
        await supabase.functions.invoke('send-email', {
          body: {
            to: [mentor.email],
            subject: `❌ Cancelamento de Mentoria - ${myRegistration?.nome || 'Participante'}`,
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
  const isActuallyPaid = useMemo(() => {
    if (!myRegistration) return false;
    const pgto = myRegistration.status_pagamento || myRegistration.statusPagamento;
    const st = myRegistration.status;

    const hasPaidPgto = pgto === 'pago' || pgto === 'paid';
    const hasPaidStatus = st === 'pago' || st === 'paid' || st === 'ativo' || st === 'Confirmado';

    return hasPaidPgto || hasPaidStatus;
  }, [myRegistration]);

  const statusFinanceiro = useMemo(() => {
    if (!myRegistration?.palestrasNoturnas) {
      return { label: 'Grátis', color: 'bg-gray-500/20 text-gray-400 border-none', info: 'Inscrição diurna gratuita' };
    }

    if (isActuallyPaid) {
      return { label: 'Confirmado', color: 'bg-green-500/20 text-green-400 border-none', info: 'Pagamento recebido' };
    }
    return { label: 'Pendente', color: 'bg-orange-500/20 text-orange-400 border-none', info: 'Aguardando pagamento' };
  }, [myRegistration, isActuallyPaid]);

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
        const certCode = generateCertificateCode(myRegistration.id, sessionId);
        await (supabase.from('certificates' as any) as any).insert({
          project_id: selectedProject?.id,
          registration_id: myRegistration.id,
          user_id: user?.id,
          session_id: sessionId,
          activity_name: sessionTitle,
          status: 'disponivel',
          type: 'lecture', // ou workshop dependendo do contexto, mas lecture é o padrão
          code: certCode,
          issue_date: new Date().toISOString()
        }).catch(() => { });

        toast.success(`Check -in em "${sessionTitle}" confirmado! Certificado gerado.`);
        return;
      }

      // Caso 3: Check-in em Mentorias (GE-MENTORIA|ID|MENTOR)
      if (decodedText.startsWith('GE-MENTORING')) {
        const parts = decodedText.split('|');
        const mentoringId = parts[1];
        const mentorName = parts[2] || 'Mentor';

        const { error } = await supabase.from('mentorias_agendadas').update({
          status: 'completed',
          updated_at: new Date().toISOString()
        }).eq('id', mentoringId);

        if (error) throw error;
        toast.success(`Mentoria com ${mentorName} confirmada!`);
        return;
      }

      // Caso 4: Check-in em Stands (GE-STAND|ID|NAME)
      if (decodedText.startsWith('GE-STAND')) {
        const parts = decodedText.split('|');
        const standId = parts[1];
        const standName = parts[2] || 'Stand';

        // Geração de Lead em Tempo Real
        const stand = stands.find(s => s.id === standId);
        if (stand && stand.ownerId) {
          try {
            // Verifica se já existe lead para este stand e este participante
            const existingLead = leads.find(l => 
              l.registrationId === myRegistration.id && 
              (l.startupId === stand.ownerId || l.companyId === stand.ownerId)
            );

            if (!existingLead) {
              await createLead({
                projectId: selectedProject?.id,
                startupId: stand.ownerType === 'startup' ? stand.ownerId : undefined,
                companyId: stand.ownerType === 'company' ? stand.ownerId : undefined,
                registrationId: myRegistration.id,
                interestLevel: 'high',
                notes: `Check-in realizado no stand: ${standName}`,
                visitorName: myRegistration.nome || user?.name || 'Visitante',
                visitorEmail: myRegistration.email || user?.email,
                visitorPhone: myRegistration.telefone,
                visitorCpf: myRegistration.cpf,
              });
              logger.info(`Lead gerado para o stand ${standName}`);
            }
          } catch (err) {
            logger.error('Erro ao gerar lead no check-in:', err);
          }
        }

        await registerStandCheckIn({
          projectId: selectedProject?.id,
          registrationId: myRegistration.id,
          standId: standId,
        });

        toast.success(`Check-in realizado no stand: ${standName}! 🚀`);
        return;
      }

      throw new Error('QR Code inválido ou não reconhecido por este App');
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  };

  // ── Certificados ──────────────────────────────────────────────────────────
  const [certificados, setCertificados] = useState<any[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(false);

  const fetchCertificados = useCallback(async () => {
    if (!myRegistration?.id) return;
    setLoadingCerts(true);
    try {
      const { data, error } = await supabase
        .from('certificates' as any)
        .select('*')
        .eq('registration_id', myRegistration.id)
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setCertificados(data || []);
    } catch (err) {
      console.error('Erro ao buscar certificados:', err);
    } finally {
      setLoadingCerts(false);
    }
  }, [myRegistration?.id]);

  useEffect(() => {
    if (activeTab === 'certificados') {
      fetchCertificados();
    }
  }, [activeTab, fetchCertificados]);

  const handleDownloadCertificate = async (cert: any) => {
    const toastId = toast.loading('Gerando certificado...');
    try {
      const template = selectedProject?.metadata?.certificate_template || {};
      
      const certData: any = {
        userName: myRegistration?.nome || user?.name || 'Participante',
        eventName: selectedProject?.name || 'Growth Experience',
        date: new Date(cert.issue_date).toLocaleDateString('pt-BR'),
        certificateCode: cert.code,
        type: cert.type || 'lecture',
        sessionTitle: cert.activity_name,
        templateOverrides: {
          title: template.title,
          description: template.description,
          ceoName: template.ceo_name,
          ceoRole: template.ceo_role,
          primaryColor: template.primary_color,
          secondaryColor: template.secondary_color,
          showBackgroundPattern: template.show_pattern
        }
      };

      if (template.logo_url) certData.logoBase64 = await imageUrlToBase64(template.logo_url).catch(() => undefined);
      if (template.signature_url) certData.signatureBase64 = await imageUrlToBase64(template.signature_url).catch(() => undefined);
      if (template.background_url) certData.templateOverrides.customBackgroundBase64 = await imageUrlToBase64(template.background_url).catch(() => undefined);
      if (template.partner_logos?.length > 0) {
        certData.partnerLogosBase64 = await Promise.all(
          template.partner_logos.map((url: string) => imageUrlToBase64(url).catch(() => null))
        ).then((res: (any)[]) => res.filter(Boolean));
      }

      await generateCertificatePDF(certData);
      toast.success('Download iniciado!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Erro ao gerar certificado.', { id: toastId });
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
      {isSelfCheckInOpen && myRegistration && (
        <SelfCheckInModal
          registration={myRegistration}
          onClose={() => setIsSelfCheckInOpen(false)}
          onScanSuccess={handleScanSuccess}
        />
      )}

      {/* Session Details Modal */}
      <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <DialogContent className="max-w-md bg-dark-200 border-white/5 rounded-[2rem] p-0 overflow-hidden">
          {selectedSession && (
            <div className="relative">
              <div className={`h-32 bg-gradient-to-br ${selectedSession.color || 'from-teal-500/20 to-teal-500/5'} flex items-end p-6`}>
                <Badge className="bg-white/10 backdrop-blur-md text-white border-none font-black text-[10px] uppercase tracking-widest px-3 py-1.5">
                  {selectedSession.type || selectedSession.tipo || 'ATIVIDADE'}
                </Badge>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-white italic tracking-tight leading-tight">
                    {selectedSession.title || selectedSession.titulo}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-gray-400">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                      <Clock className="h-3.5 w-3.5 text-teal-400" />
                      {selectedSession.startTime} - {selectedSession.endTime}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                      <MapPin className="h-3.5 w-3.5 text-teal-400" />
                      {selectedSession.room || 'Auditório Principal'}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {selectedSession.description || 'Nenhuma descrição detalhada disponível para esta atividade.'}
                  </p>

                  {selectedSession.speakers && selectedSession.speakers.length > 0 && (
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">PALESTRANTE(S)</p>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(selectedSession.speakers)
                          ? selectedSession.speakers.map((s: string, i: number) => (
                            <Badge key={i} variant="outline" className="border-teal-500/20 text-teal-400 bg-teal-500/5 font-bold">
                              {s}
                            </Badge>
                          ))
                          : <Badge variant="outline" className="border-teal-500/20 text-teal-400 bg-teal-500/5 font-bold">{selectedSession.speakers}</Badge>
                        }
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6">
                  {activityCheckIns?.some((c: any) => c.session_id === selectedSession.id && c.registration_id === myRegistration?.id) ? (
                    <div className="w-full bg-green-500/10 border border-green-500/20 rounded-2xl py-4 flex items-center justify-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <span className="text-green-400 font-black uppercase tracking-widest text-xs">PRESENÇA CONFIRMADA</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setSelectedSession(null);
                        setIsSelfCheckInOpen(true);
                      }}
                      className="w-full bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black py-7 h-auto rounded-3xl text-lg shadow-xl shadow-brand-orange-coral/30 group"
                    >
                      <QrCode className="h-5 w-5 mr-3 group-hover:rotate-12 transition-all" />
                      CONFIRMAR PRESENÇA
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {isB2BModalOpen && (
        <B2BFormModal isOpen={isB2BModalOpen} onClose={() => setIsB2BModalOpen(false)} />
      )}

      {isStartupModalOpen && (
        <StartupFormModal isOpen={isStartupModalOpen} onClose={() => setIsStartupModalOpen(false)} />
      )}

      {/* Header Premium Refined */}
      <div className="bg-dark-300 border-b border-white/5 shadow-xl relative overflow-hidden">
        <PremiumBackground />

        <PremiumHeader
          userName={myRegistration?.nome || user?.name}
          userAvatar={user?.avatar}
          projectName={selectedProject?.name}
          roleLabel="PARTICIPANTE"
          isPro={myRegistration?.palestrasNoturnas}
          isActuallyPaid={isActuallyPaid}
          notifications={notifications}
          onLogout={handleLogout}
          onGuideClick={() => window.open('https://www.growthsummit.site/guia', '_blank')}
          onNotificationRead={(_id) => {
            // handle notification read
          }}
        />

        {/* NEW DASHBOARD HOME VIEW (PREMIUM STYLE) */}
        {activeTab === 'inicio' && (
          <div className="max-w-7xl mx-auto space-y-8 pb-10">
            <PwaDashboardHero 
              eventName={selectedProject?.name || "Growth Experience"}
              location="Triunfo-PE"
              date={selectedProject?.startDate ? new Date(selectedProject.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : "16 ABR 2026"}
              stats={{
                people: "500+",
                content: "12h",
                activities: String(allSessions?.length || 20) + "+"
              }}
            />

            {nextActivity && (
              <NextActivityCard 
                title={nextActivity.title || nextActivity.titulo}
                subtitle={`${nextActivity.speakers || 'Leandro Batista'} • ${nextActivity.room || 'Auditório'}`}
                time={nextActivity.startTime || '19:00'}
                duration="50 min"
                isConfirmed={activityCheckIns?.some((c: any) => c.session_id === nextActivity.id && c.registration_id === myRegistration?.id)}
                onClick={() => setSelectedSession(nextActivity)}
              />
            )}

            <div className="px-6 grid grid-cols-2 gap-4">
               <button 
                  onClick={() => setActiveTab('agenda')}
                  className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col gap-3 hover:bg-white/10 transition-all active:scale-95"
               >
                  <Calendar className="h-6 w-6 text-brand-orange-coral" />
                  <span className="text-white font-black text-sm text-left leading-tight">Minha<br/>Agenda</span>
               </button>
               <button 
                  onClick={() => setActiveTab('networking' as any)}
                  className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col gap-3 hover:bg-white/10 transition-all active:scale-95"
               >
                  <Users className="h-6 w-6 text-brand-orange-coral" />
                  <span className="text-white font-black text-sm text-left leading-tight">Networking</span>
               </button>
               {/* Tab Circuito */}
               <button
                 onClick={() => setActiveTab('circuito')}
                 className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col gap-3 hover:bg-white/10 transition-all active:scale-95"
               >
                 <Trophy className="h-6 w-6 text-brand-orange-coral" />
                 <span className="text-white font-black text-sm text-left leading-tight">Circuito<br/>GE-STAND</span>
               </button>
            </div>

            {/* Quick Actions Grid */}
            <div className="px-6">
               <QuickActions 
                  onStartupClick={() => setIsStartupModalOpen(true)}
                  onB2BClick={() => setIsB2BModalOpen(true)}
                  onMentoriaClick={() => myRegistration?.palestrasNoturnas ? setActiveTab('mentorias' as any) : setShowUpgradeModal(true)}
                  showMentoria={true}
               />
            </div>

            {/* Float Action Button Download */}
            <div className="fixed bottom-24 right-6 z-50">
               <button 
                onClick={() => handleDownloadTicket()}
                className="w-16 h-16 bg-gradient-to-br from-brand-orange-coral to-brand-orange-intense rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-orange-coral/40 active:scale-90 transition-transform"
               >
                  <FileText className="h-7 w-7 text-white" />
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area - Only shown for other tabs */}
      {activeTab !== 'inicio' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 flex flex-col gap-10 z-10 relative">
          {/* Action Buttons for Agenda (Optional) */}
          {activeTab === 'agenda' && (
             <div className="flex flex-col gap-3">
                <Button
                  onClick={() => setIsSelfCheckInOpen(true)}
                  className="w-full bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black py-6 rounded-2xl text-base shadow-xl shadow-brand-orange-coral/20 group transition-all hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center gap-0.5 border-none h-auto"
                >
                  <div className="flex items-center gap-2 uppercase text-[12px] tracking-widest">
                    <QrCode className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                    Confirmar Presença
                  </div>
                  <span className="text-[8px] opacity-70 font-bold uppercase tracking-widest leading-none">Entre na sala e aponte para o QR Code</span>
                </Button>
             </div>
          )}

          {/* Render actual tab content */}
          <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'ingresso' && (
              <TicketSection
                myRegistration={myRegistration}
                user={user}
                selectedProject={selectedProject}
                statusFinanceiro={statusFinanceiro}
                isActuallyPaid={isActuallyPaid}
                generateTicketPDF={generateTicketPDF}
                setShowCheckInModal={setShowCheckInModal}
              />
            )}

            {activeTab === 'agenda' && (
              <AgendaSection
                myRegistration={myRegistration}
                isActuallyPaid={isActuallyPaid}
                onUpgradeClick={() => setShowUpgradeModal(true)}
                cursosSelecionados={cursosSelecionados}
                setIsSelfCheckInOpen={setIsSelfCheckInOpen}
                navigate={navigate}
                activityCheckIns={activityCheckIns}
                onSessionClick={(session) => setSelectedSession(session)}
                allSessions={allSessions || []}
              />
            )}

            {activeTab === 'mentorias' && (
              <MentorshipSection
                myRegistration={myRegistration}
                myMentorships={myMentorships}
                availableSlots={availableSlots}
                handleBookMentoring={handleBookMentoring}
                handleCancelMentoring={handleCancelMentoring}
                setRatingModal={setRatingModal}
                setIsMentoriaModalOpen={setIsMentoriaModalOpen}
                setShowUpgradeModal={setShowUpgradeModal}
              />
            )}

            {activeTab === 'documentos' && (
              <DocsSection documentos={documentos} loadingDocs={loadingDocs} />
            )}

            {activeTab === 'circuito' && myRegistration?.id && (
              <GamificationSection registrationId={myRegistration.id} onScanSuccess={handleScanSuccess} />
            )}

            {activeTab === 'certificados' && (
              <CertificatesSection
                certificados={certificados}
                loadingCerts={loadingCerts}
                fetchCertificados={fetchCertificados}
                onDownload={handleDownloadCertificate}
              />
            )}

            {activeTab === 'equipe' && (
              <DashboardEquipe batches={myBatches} />
            )}

            {activeTab === 'dados' && (
              <ProfileForm />
            )}
          </motion.div>
        </AnimatePresence>

        {/* INSCRIPTION OPTIONS & PREVIEWS (BOTTOM) */}
        <div className="flex flex-col gap-8 pt-10 border-t border-white/5">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Ações e Atalhos</h4>
            <QuickActions
              onB2BClick={() => setIsB2BModalOpen(true)}
              onStartupClick={() => setIsStartupModalOpen(true)}
              onMentoriaClick={() => activeTab !== 'mentorias' ? setActiveTab('mentorias') : setIsMentoriaModalOpen(true)}
              showMentoria={true}
            />
          </div>

          {cursosSelecionados.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Sua Programação do Dia</h4>
              <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                {cursosSelecionados.map((cursoId) => {
                  const s = sessions.find(ss => ss.id === cursoId);
                  if (!s) return null;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSession(s)}
                      className="min-w-[280px] bg-dark-200/50 border border-white/5 rounded-2xl p-4 cursor-pointer hover:bg-dark-100/50 transition-all group"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-teal-400" />
                        </div>
                        <div>
                          <p className="text-white font-black text-sm uppercase italic truncate w-40 leading-none mb-1">{s.title || s.titulo}</p>
                          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{s.startTime} - {s.endTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-gray-600" />
                          <span className="text-[9px] text-gray-500 font-bold uppercase">{s.room || 'Auditório'}</span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-teal-500 transition-colors">
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-white" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
        </div>
      )}

      {/* Modern High-End Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 md:p-6 pb-8 md:pb-10 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <div className="bg-dark-200/90 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex items-center justify-around p-2 relative">
            {[
              { id: 'ingresso', icon: QrCode, label: 'Ticket' },
              { id: 'agenda', icon: Calendar, label: 'Agenda' },
              { id: 'circuito', icon: Trophy, label: 'Circuito' },
              { id: 'mentorias', icon: Users, label: 'Mentor' },
              { id: 'documentos', icon: FileText, label: 'Docs' },
              { id: 'certificados', icon: Award, label: 'Certs' },
              ...(myBatches && myBatches.length > 0 ? [{ id: 'equipe', icon: Building2, label: 'Equipe' }] : []),
              { id: 'dados', icon: User, label: 'Perfil' },
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex flex-col items-center justify-center py-2 px-1 min-w-[50px] transition-all duration-500 ${isActive ? 'text-teal-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 bg-teal-500/10 rounded-2xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {item.id === 'dados' ? (
                    <div className={`h-5 w-5 mb-1 rounded-full overflow-hidden border ${isActive ? 'border-teal-400 scale-110' : 'border-gray-600 grayscale'}`}>
                      {user?.avatar ? (
                        <img src={user.avatar} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-full h-full p-0.5" />
                      )}
                    </div>
                  ) : (
                    <item.icon className={`h-5 w-5 mb-1 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]' : 'scale-100'}`} />
                  )}
                  <span className={`text-[8px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
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

      <MentoriaMultiStepModal
        isOpen={isMentoriaModalOpen}
        onClose={() => setIsMentoriaModalOpen(false)}
      />
    </motion.div>
  );
}
