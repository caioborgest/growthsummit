import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  Award, 
  Calendar, 
  User, 
  Hash, 
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Download,
  Share2,
  Linkedin,
  Twitter,
  MessageCircle
} from 'lucide-react';
import { generateCertificatePDF } from '@/lib/certificateGenerator';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function ValidarCertificado() {
  const { code: urlCode } = useParams<{ code?: string }>();
  const [code, setCode] = useState(urlCode || '');
  const [isValidating, setIsValidating] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (urlCode) {
      handleValidate(urlCode);
    }
  }, [urlCode]);

  const handleValidate = async (searchCode: string) => {
    if (!searchCode || searchCode.length < 4) {
      toast.error('Informe um código de validação válido.');
      return;
    }

    setIsValidating(true);
    setError(null);
    setCertificate(null);

    try {
      const { data, error: fetchError } = await (supabase
        .from('certificates' as any) as any)
        .select(`
          *,
          registration:growth_experience_registrations (nome, email),
          project:projects (name, metadata, city)
        `)
        .eq('code', searchCode.toUpperCase())
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError('Certificado não encontrado ou código inválido.');
        toast.error('Certificado não localizado.');
      } else {
        setCertificate(data);
        toast.success('Certificado validado com sucesso!');
      }
    } catch (err) {
      console.error('Erro na validação:', err);
      setError('Ocorreu um erro ao validar o certificado. Tente novamente mais tarde.');
    } finally {
      setIsValidating(false);
    }
  };
  const handleDownload = async () => {
    if (!certificate) return;
    try {
      toast.loading('Gerando cópia oficial...', { id: 'download-val' });
      
      const template = certificate.project?.metadata?.certificate_template;
      const manualOverrides = certificate.metadata?.overrides || {};

      await generateCertificatePDF({
        userName: certificate.registration?.nome || 'Participante',
        eventName: template?.subtitle || certificate.project?.name || 'Growth Experience',
        eventCity: certificate.project?.city || 'Brasil',
        sessionTitle: certificate.activity_name || 'Participação Geral',
        date: new Date(certificate.issue_date).toLocaleDateString('pt-BR'),
        certificateCode: certificate.code,
        type: certificate.type as any,
        totalHours: certificate.metadata?.total_hours || 8,
        logoBase64: template?.logo_url,
        signatureBase64: template?.signature_url,
        partnerLogosBase64: template?.partner_logos || [],
        templateOverrides: {
          title: manualOverrides.title || template?.title,
          description: manualOverrides.description || template?.description,
          ceoName: template?.ceo_name,
          ceoRole: template?.ceo_role,
          primaryColor: template?.primary_color,
          secondaryColor: template?.secondary_color,
          accentColor: template?.accent_color,
          showBackgroundPattern: template?.show_pattern !== undefined ? template.show_pattern : true,
          customBackgroundBase64: template?.background_url
        }
      });

      toast.success('Download iniciado!', { id: 'download-val' });
    } catch (err) {
      console.error('Erro no download:', err);
      toast.error('Erro ao gerar PDF.', { id: 'download-val' });
    }
  };

  const handleAddToLinkedIn = () => {
    if (!certificate) return;
    
    const issueDate = new Date(certificate.issue_date);
    const params = new URLSearchParams({
      startTask: 'CERTIFICATION_NAME',
      name: certificate.activity_name || 'Growth Experience Participation',
      organizationName: 'Growth Experience', // Placeholder for org name
      issueYear: issueDate.getFullYear().toString(),
      issueMonth: (issueDate.getMonth() + 1).toString(),
      certUrl: window.location.href,
      certId: certificate.code
    });

    window.open(`https://www.linkedin.com/profile/add?${params.toString()}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = `Tenho o prazer de anunciar que recebi minha certificação em "${certificate.activity_name}" no #GrowthExperience2026! 🚀 Confira a validação oficial:`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = `Confira minha certificação oficial do Growth Experience 2026: ${certificate.activity_name}. Validação: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0c0e12] relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-brand-orange-coral/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-teal-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-2xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-sm font-bold uppercase tracking-widest group">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Voltar para Home
          </Link>
          
          <div className="w-20 h-20 bg-brand-orange-coral/10 rounded-3xl flex items-center justify-center border border-brand-orange-coral/20 mx-auto mb-6 rotate-3">
             <ShieldCheck className="h-10 w-10 text-brand-orange-coral" />
          </div>
          
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-3">
            Validação de <span className="text-brand-orange-coral">Autenticidade</span>
          </h1>
          <p className="text-gray-400 max-w-md mx-auto">
            Verifique a validade de certificados emitidos durante o ecossistema Growth Experience.
          </p>
        </div>

        {/* Search Box */}
        <div className="glass-card p-2 rounded-[2.5rem] mb-8 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Hash className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                placeholder="Ex: GX-7R2K9"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full h-16 bg-white/[0.02] border-none rounded-[2rem] pl-16 pr-6 text-white font-black text-xl tracking-widest focus:ring-2 focus:ring-brand-orange-coral/50 transition-all placeholder:text-gray-700"
                onKeyDown={(e) => e.key === 'Enter' && handleValidate(code)}
              />
            </div>
            <Button
              onClick={() => handleValidate(code)}
              disabled={isValidating || !code}
              className="h-16 px-10 rounded-[2rem] bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black text-lg transition-all shadow-xl shadow-brand-orange-coral/20 active:scale-95"
            >
              {isValidating ? <Loader2 className="animate-spin h-6 w-6" /> : (
                <span className="flex items-center gap-2">
                  VALIDAR <Search className="h-5 w-5" />
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        {error && (
          <div className="glass-card p-8 border-red-500/20 bg-red-500/5 text-center rounded-[2.5rem] animate-fade-in">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Ops! Ocorreu um problema</h3>
            <p className="text-gray-400">{error}</p>
          </div>
        )}

        {certificate && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card p-10 border-brand-orange-coral/20 bg-brand-orange-coral/5 rounded-[3rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8">
                 <div className="w-16 h-16 bg-brand-orange-coral/10 rounded-2xl flex items-center justify-center border border-brand-orange-coral/20 animate-glow-pulse">
                    <CheckCircle2 className="h-8 w-8 text-brand-orange-coral" />
                 </div>
              </div>
              
              <div className="mb-8">
                <span className="text-[10px] text-brand-orange-coral font-black uppercase tracking-[0.3em] mb-2 block">Documento Autêntico</span>
                <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-tight italic">
                  {certificate.activity_name || 'Participação Geral'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-y border-white/5 py-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Portador</p>
                    <p className="text-white font-bold text-lg">{certificate.registration?.nome || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Emissão</p>
                    <p className="text-white font-bold text-lg">
                      {new Date(certificate.issue_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <Award className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Tipo / Carga</p>
                    <p className="text-white font-bold text-lg uppercase">
                      {certificate.type} • {certificate.metadata?.total_hours || 8}h
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Status</p>
                    <p className="text-emerald-400 font-bold text-lg uppercase flex items-center gap-2">
                       VERIFICADO <CheckCircle2 className="h-4 w-4" />
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-8 pt-8 border-t border-white/5">
                <div className="p-4 bg-dark-300/50 rounded-2xl border border-white/5 flex-1">
                  <p className="text-sm text-gray-500 leading-relaxed italic">
                    "Este certificado confirma a participação e conclusão das atividades especificadas acima durante o evento 
                    <strong className="text-white font-black"> {certificate.project?.name || 'Growth Experience'}</strong>. 
                    A integridade deste documento é garantida pela nossa plataforma de tecnologia."
                  </p>
                </div>
                
                <Button 
                  onClick={handleDownload}
                  className="w-full sm:w-auto h-16 px-10 bg-white text-black hover:bg-brand-orange-coral hover:text-white font-black rounded-2xl transition-all shadow-xl flex items-center gap-3 active:scale-95 shrink-0"
                >
                  <Download className="h-5 w-5" />
                  BAIXAR CÓPIA PDF
                </Button>
              </div>
            </div>

            {/* Social Sharing Section */}
            <div className="glass-card p-10 border-white/5 rounded-[3rem] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h3 className="text-xl font-black text-white flex items-center gap-3 mb-2">
                             <Share2 className="h-5 w-5 text-brand-orange-coral" />
                             COMPARTILHE SUA CONQUISTA
                        </h3>
                        <p className="text-gray-500 text-sm">Mostre sua nova certificação para sua rede profissional.</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Button 
                            onClick={handleAddToLinkedIn}
                            className="bg-[#0077b5] hover:bg-[#005c8d] text-white font-bold h-14 px-6 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center gap-3"
                        >
                            <Linkedin className="h-5 w-5" />
                            LINKEDIN
                        </Button>
                        
                        <Button 
                            onClick={handleShareTwitter}
                            className="bg-black hover:bg-white/10 text-white font-bold h-14 px-6 rounded-2xl border border-white/10 shadow-lg flex items-center gap-3"
                        >
                            <Twitter className="h-5 w-5" />
                            X / TWITTER
                        </Button>

                        <Button 
                            onClick={handleShareWhatsApp}
                            className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold h-14 w-14 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center"
                        >
                            <MessageCircle className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="text-center">
               <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-4">Emissão Oficial • Growth Experience 2026</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
