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
  Clock,
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
  Edit3,
  RefreshCw,
  Lock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QRCode from 'react-qr-code';
import { useAuth } from '@/contexts/AuthContext';
import { useSessions } from '@/hooks/useData';
import { useMyRegistration } from '@/hooks/useMyRegistration';
import { useNavigate } from 'react-router-dom';
import { ProfileForm } from './components/ProfileForm';
import { useProject } from '@/contexts/ProjectContext';
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

  const PRECO_BASE = 179.90;
  const precoFinal = cupomValido
    ? PRECO_BASE * (1 - cupomValido.desconto / 100)
    : PRECO_BASE;

  const validarCupom = async () => {
    if (!cupom.trim()) return;
    setLoadingCupom(true);
    try {
      const { data, error } = await (supabase.from('cupons_parceria_social') as any)
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
      // Atualizar inscrição com acesso noturno
      const { error } = await (supabase.from('inscricoes_growth_experience') as any)
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
        await (supabase.from('cupons_parceria_social') as any)
          .rpc('increment_uso_cupom', { p_codigo: cupom.trim().toUpperCase() })
          .catch(() => { }); // silently fail
      }

      toast.success('🎉 Acesso Pro ativado! Bem-vindo às palestras noturnas!');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoadingPagamento(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-dark-200 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
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

        <div className="p-6 space-y-5">
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

          {/* Pagamento */}
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-6 h-auto rounded-2xl text-base shadow-lg shadow-orange-500/30 flex items-center gap-3"
            onClick={handlePagamento}
            disabled={loadingPagamento}
          >
            {loadingPagamento ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Processando...</>
            ) : (
              <><CreditCard className="h-5 w-5" /> GARANTIR ACESSO PRO</>
            )}
          </Button>
          <p className="text-center text-gray-600 text-xs">Pagamento simulado para demonstração</p>
        </div>
      </div>
    </div>
  );
}

// ── Modal: QR Check-in (mostra QR para o staff escanear) ─────────────────────
function CheckInModal({ registration, onClose }: { registration: any; onClose: () => void }) {
  const qrValue = `GE - CHECKIN | ${registration.id}| ${registration.email || ''}| ${Date.now()} `;

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
  const { registration: myRegistration, refetch: refetchRegistration, updateCursos, checkInEntrada } = useMyRegistration();
  const { data: sessions } = useSessions();
  const [activeTab, setActiveTab] = useState('ingresso');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showSelfCheckIn, setShowSelfCheckIn] = useState(false);
  const [showEditCursos, setShowEditCursos] = useState(false);

  // ── STATUS FINANCEIRO ──────────────────────────────────────────────────────
  // FREE MORNING (grátis): status = "Em aberto" (não há cobrança)
  // Experience Pro pago: status = "Confirmado"
  // Experience Pro não pago: status = "Pendente"
  const statusFinanceiro = useMemo(() => {
    if (!myRegistration?.palestrasNoturnas) {
      return { label: 'Em Aberto', color: 'bg-gray-500/20 text-gray-400 border-none', info: 'Inscrição gratuita — grátis' };
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

  // Todos os cursos/workshops/oficinas disponíveis para troca
  const cursosDisponiveis = useMemo(() => {
    return sessions.filter(s =>
      ['workshop', 'circuito', 'oficina', 'treinamento', 'curso'].includes((s.type as string))
    );
  }, [sessions]);

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
    <div className="min-h-screen bg-dark-400 pb-20">
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
                    <User className="h-8 w-8 text-orange-400" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-dark-300 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  {myRegistration?.nome || user?.name || 'Bem-vindo'}
                  <Sparkles className="h-5 w-5 text-orange-400" />
                </h1>
                <p className="text-gray-400 font-medium">{selectedProject?.name || 'Growth Experience'}</p>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/20 px-3 py-1 font-bold flex items-center gap-1.5">
                    <Sun className="h-3 w-3" />
                    {myRegistration?.palestrasNoturnas ? 'Experience Pro' : 'Free Morning'}
                  </Badge>
                  <button
                    onClick={() => navigate('/ge-triunfo')}
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
          <TabsList className="flex flex-wrap h-auto md:grid w-full md:grid-cols-6 bg-dark-200 mb-8 p-1 rounded-2xl shadow-inner shadow-black/20">
            <TabsTrigger value="ingresso" className="flex-1 min-w-[30%] py-3 md:py-4 data-[state=active]:bg-teal-500 data-[state=active]:text-white rounded-xl transition-all duration-300">
              <QrCode className="h-4 w-4 md:mr-2" /> <span className="hidden sm:inline">Ingresso</span>
            </TabsTrigger>
            <TabsTrigger value="agenda" className="flex-1 min-w-[30%] py-3 md:py-4 data-[state=active]:bg-teal-500 data-[state=active]:text-white rounded-xl transition-all duration-300">
              <Calendar className="h-4 w-4 md:mr-2" /> <span className="hidden sm:inline">Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="documentos" className="flex-1 min-w-[30%] py-3 md:py-4 data-[state=active]:bg-teal-500 data-[state=active]:text-white rounded-xl transition-all duration-300">
              <FileText className="h-4 w-4 md:mr-2" /> <span className="hidden sm:inline">Docs</span>
            </TabsTrigger>
            <TabsTrigger value="dados" className="flex-1 min-w-[30%] py-3 md:py-4 data-[state=active]:bg-teal-500 data-[state=active]:text-white rounded-xl transition-all duration-300">
              <User className="h-4 w-4 md:mr-2" /> <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="certificados" className="flex-1 min-w-[30%] py-3 md:py-4 data-[state=active]:bg-teal-500 data-[state=active]:text-white rounded-xl transition-all duration-300">
              <Award className="h-4 w-4 md:mr-2" /> <span className="hidden sm:inline">Certs</span>
            </TabsTrigger>
            <TabsTrigger value="suporte" className="flex-1 min-w-[30%] py-3 md:py-4 data-[state=active]:bg-teal-500 data-[state=active]:text-white rounded-xl transition-all duration-300">
              <HelpCircle className="h-4 w-4 md:mr-2" /> <span className="hidden sm:inline">Ajuda</span>
            </TabsTrigger>
          </TabsList>

          {/* ── INGRESSO TAB ── */}
          <TabsContent value="ingresso">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* QR Code */}
              <div className="glass-card p-8 md:p-12 text-center flex flex-col items-center border-teal-500/20 relative overflow-hidden group">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500/50 to-transparent"></div>

                <h2 className="text-2xl font-black text-white mb-2 italic">Seu Acesso</h2>
                <p className="text-gray-500 text-xs uppercase tracking-[0.2em] font-bold mb-8">Growth Experience 2026</p>

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
                    className="bg-teal-500 hover:bg-teal-600 text-white font-black rounded-xl px-8 flex-1"
                    onClick={() => {
                      if (!myRegistration) {
                        toast.error('Nenhuma inscrição encontrada.');
                        return;
                      }
                      setShowCheckInModal(true);
                    }}
                  >
                    <QrCode className="h-4 w-4 mr-2" /> VALIDAR
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
                  <div className="glass-card p-8 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Moon className="h-5 w-5 text-orange-400" />
                      <h3 className="text-lg font-bold text-white">Upgrade para Pro</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      Assista às <strong className="text-white">palestras noturnas</strong> com Leandro Batista e Vanylton Matias + mentorias exclusivas.
                    </p>
                    <p className="text-orange-400 font-black text-2xl mb-5">R$ 179,90</p>
                    <Button
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
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

          {/* ── AGENDA TAB ── */}
          <TabsContent value="agenda">
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-white">Minha Agenda</h2>
                  <p className="text-gray-400 text-sm mt-1">Atividades {myRegistration?.palestrasNoturnas ? 'diurnas e noturnas' : 'diurnas (gratuitas)'}</p>
                </div>
                <Button size="sm" variant="outline" className="border-dark-300 text-teal-400 hover:bg-teal-500/10" onClick={() => navigate('/ge-triunfo')}>
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
                    <Button variant="link" className="text-teal-400 mt-2 font-bold text-sm" onClick={() => navigate('/ge-triunfo')}>
                      Escolher atividades →
                    </Button>
                  </div>
                )}
              </div>

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
                          } catch (err) {
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
                    { icon: Calendar, label: 'Programação Completa', desc: 'Grade e horários do evento', color: 'teal', route: '/ge-triunfo' },
                    { icon: MapPin, label: 'Mapa do Evento', desc: 'Localização das salas', color: 'blue', route: '/guia' },
                    { icon: HelpCircle, label: 'Guia do Participante', desc: 'Como aproveitar ao máximo', color: 'purple', route: '/guia' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => navigate(item.route)}
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
    </div>
  );
}
