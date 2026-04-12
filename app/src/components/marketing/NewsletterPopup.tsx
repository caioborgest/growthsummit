import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ArrowRight, CheckCircle2, Loader2, Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { newsletterService } from '@/lib/newsletterService';
import { toast } from 'sonner';

interface NewsletterPopupProps {
  config: {
    title: string;
    description: string;
    type: 'newsletter' | 'offer' | 'info';
    cta_text?: string;
    cta_link?: string;
    image_url?: string;
    project_id: string;
  };
  onClose: () => void;
}

export function NewsletterPopup({ config, onClose }: NewsletterPopupProps) {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !nome) {
      toast.error('Preencha seu nome e e-mail');
      return;
    }

    setIsSubmitting(true);
    try {
      await newsletterService.subscribe({
        nome,
        email,
        project_id: config.project_id,
        source: 'popup_marketing'
      });
      setIsSuccess(true);
      setTimeout(() => onClose(), 3000);
    } catch (error) {
      toast.error('Ocorreu um erro na inscrição. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCtaClick = () => {
    if (config.cta_link) {
      window.open(config.cta_link, '_blank');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-24 md:pb-6">
        {/* Overlay com Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Premium */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-dark-200 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Botão Fechar */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-2xl bg-black/40 text-gray-400 hover:text-white transition-all hover:scale-110"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col md:flex-row">
            {/* Esquerda: Visual Decoração */}
            <div className={`hidden md:flex w-1/3 flex-col items-center justify-center p-8 bg-gradient-to-b ${
                config.type === 'newsletter' ? 'from-teal-500/20 to-teal-900/40' : 
                config.type === 'offer' ? 'from-brand-orange-coral/20 to-brand-orange-intense/40' : 'from-blue-500/20 to-blue-900/40'
              }`}>
                {config.type === 'newsletter' ? (
                  <Mail className="h-16 w-16 text-teal-400 mb-4 animate-bounce" />
                ) : config.type === 'offer' ? (
                  <Gift className="h-16 w-16 text-brand-orange-coral mb-4 animate-bounce" />
                ) : (
                  <Sparkles className="h-16 w-16 text-blue-400 mb-4 animate-bounce" />
                )}
            </div>

            {/* Direita: Conteúdo Form */}
            <div className="flex-1 p-8 sm:p-12 space-y-6">
              {!isSuccess ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-brand-orange-coral">
                       <Sparkles className="h-4 w-4" />
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] pt-1">Oportunidade Geek</span>
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tighter leading-none">
                      {config.title || "Participe da Growth!"}
                    </h3>
                    <p className="text-gray-400 font-medium leading-relaxed">
                      {config.description || "Inscreva-se para receber atualizações exclusivas do evento."}
                    </p>
                  </div>

                  {config.type === 'newsletter' ? (
                    <form onSubmit={handleSubmit} className="space-y-4 custom-scrollbar">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          placeholder="Seu nome"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          className="bg-dark-100 border-none h-14 rounded-2xl px-6 text-white font-bold"
                        />
                        <Input
                          type="email"
                          placeholder="Seu melhor e-mail"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-dark-100 border-none h-14 rounded-2xl px-6 text-white font-bold"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black text-lg rounded-2xl shadow-xl shadow-brand-orange-coral/20 transition-all hover:scale-[1.02] active:scale-95"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <>
                            {config.cta_text || "ASSINAR NEWSLETTER"}
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="pt-4">
                      <Button
                        onClick={handleCtaClick}
                        className="w-full h-16 bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black text-xl rounded-2xl shadow-2xl shadow-brand-orange-coral/20 group"
                      >
                        {config.cta_text || "APROVEITAR AGORA"}
                        <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                      </Button>
                    </div>
                  )}

                  <p className="text-[10px] text-gray-500 font-medium text-center italic">
                    Ao continuar, você aceita nossa política de privacidade e termos de uso.
                  </p>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-10 space-y-4"
                >
                  <div className="w-20 h-20 rounded-full bg-teal-500/20 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-10 w-10 text-teal-400" />
                  </div>
                  <h3 className="text-3xl font-black text-white">Excelente escolha!</h3>
                  <p className="text-gray-400 text-lg">Sua inscrição foi confirmada. Verifique sua caixa de entrada em breve.</p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
