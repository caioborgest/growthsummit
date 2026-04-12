import { useState, useEffect } from 'react';
import { X, Gift, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { newsletterService } from '@/lib/newsletterService';
import { toast } from 'sonner';
import { useProject } from '@/contexts/ProjectContext';

export function ExitIntentPopup() {
  const { selectedProject } = useProject();
  const exitIntentEnabled =
    selectedProject?.settings?.publicContent?.exitIntentPopup?.active === true;

  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    if (!exitIntentEnabled) return;

    const shown = sessionStorage.getItem('gx_exit_intent_shown');
    if (shown) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Gatilho: Mouse sai pelo topo (indicando fechamento ou troca de aba)
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem('gx_exit_intent_shown', 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      await newsletterService.subscribe({
        name: 'Lead de Saída',
        email,
        interests: ['geral'],
        source: 'Exit-Intent Popup',
        project_id: selectedProject?.id
      });
      setStatus('success');
      toast.success('Presente enviado para seu e-mail!');
      setTimeout(() => setIsVisible(false), 3000);
    } catch (error) {
      toast.error('Erro ao processar. Tente novamente.');
      setStatus('idle');
    }
  };

  if (!exitIntentEnabled || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-xl rounded-[3rem] border-white/5 relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
        
        {/* Header Decor */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-brand-orange-coral via-brand-orange-intense to-brand-orange-coral" />
        
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all z-20"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8 sm:p-12 text-center relative z-10">
          {status === 'success' ? (
            <div className="space-y-6 py-10 animate-in fade-in zoom-in-50 duration-500">
              <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto border border-white/10">
                <CheckCircle2 className="h-10 w-10 text-teal-400" />
              </div>
              <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">ESTÁ A CAMINHO!</h3>
              <p className="text-gray-400 font-medium">Verifique sua caixa de entrada em instantes.</p>
            </div>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange-coral/10 border border-brand-orange-coral/20 text-brand-orange-coral font-black text-[10px] uppercase tracking-widest mb-8">
                <Sparkles className="h-3.5 w-3.5" />
                ESPERE UM MOMENTO!
              </div>

              <div className="w-24 h-24 bg-brand-orange-coral/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/10 rotate-12 animate-float">
                 <Gift className="h-12 w-12 text-brand-orange-coral -rotate-12" />
              </div>

              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
                NÃO VÁ EMBORA <br />
                <span className="text-brand-orange-coral">SEM SEU PRESENTE!</span>
              </h2>

              <p className="text-gray-400 font-medium mb-10 text-lg">
                Baixe gratuitamente o nosso **Guia de Growth 2026** e hackeie seu faturamento em 12 meses.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto custom-scrollbar">
                <div className="relative group">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2">
                      <Send className="h-4 w-4 text-gray-500 group-focus-within:text-brand-orange-coral transition-colors" />
                   </div>
                   <Input 
                      placeholder="seu@email.com"
                      required
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="h-14 pl-14 bg-white/5 border-white/10 focus:border-brand-orange-coral/50 rounded-2xl text-white font-bold"
                   />
                </div>
                
                <Button 
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full h-14 bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black rounded-2xl shadow-glow-orange transition-all hover:scale-[1.02] active:scale-95"
                >
                  {status === 'loading' ? 'ENVIANDO...' : 'QUERO MEU GUIA AGORA'}
                </Button>
                
                <button 
                   type="button"
                   onClick={() => setIsVisible(false)}
                   className="text-[10px] text-gray-700 font-black uppercase tracking-widest hover:text-gray-500 transition-colors"
                >
                  Não, prefiro perder essa oportunidade
                </button>
              </form>
            </>
          )}
        </div>

        {/* Decorative Gradients */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-orange-coral/20 rounded-full blur-[80px] -z-10" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] -z-10" />
      </div>
    </div>
  );
}
