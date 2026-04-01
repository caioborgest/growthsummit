import { useState } from 'react';
import {
    BookOpen,
    ChevronRight,
    CheckCircle2,
    Info,
    LayoutDashboard,
    Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { usabilityGuide } from '@/data/usabilityGuide';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export function GuiaInterno() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedModule, setSelectedModule] = useState<string | null>(null);

    // Encontrar o guia específico para a role do usuário
    const userRole = user?.role || 'participant';
    const guide = usabilityGuide.find(g => g.role === userRole) || usabilityGuide.find(g => g.role === 'participant')!;

    const activeModule = guide.modules.find(m => m.id === selectedModule) || guide.modules[0];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header do Guia */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-100/50 p-8 rounded-3xl border border-white/5 shadow-xl">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-brand-orange-coral/20 flex items-center justify-center shadow-glow-orange/10">
                        <BookOpen className="w-8 h-8 text-brand-orange-coral" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                            {guide.title}
                        </h1>
                        <p className="text-gray-500 font-medium">{guide.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                   <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20 px-3 py-1 uppercase font-black text-[10px] tracking-widest">
                      Acesso Interno
                   </Badge>
                </div>
            </div>

            <div className="grid lg:grid-cols-[300px,1fr] gap-8">
                {/* Lateral: Lista de Módulos */}
                <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] px-4 mb-4">Selecione o Módulo</p>
                    {guide.modules.map((module) => (
                        <button
                            key={module.id}
                            onClick={() => setSelectedModule(module.id)}
                            className={`w-full text-left px-6 py-4 rounded-2xl transition-all flex items-center justify-between group border ${
                                activeModule.id === module.id
                                    ? 'bg-brand-orange-coral border-brand-orange-coral text-white shadow-glow-orange/20'
                                    : 'bg-dark-100/30 border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <span className="font-bold text-sm uppercase tracking-tight">{module.name}</span>
                            <ChevronRight className={`w-4 h-4 transition-transform ${activeModule.id === module.id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                        </button>
                    ))}
                    
                    <div className="pt-8 px-4">
                       <div className="p-6 rounded-2xl bg-teal-500/5 border border-teal-500/10">
                          <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <Zap className="h-3 w-3 fill-current" />
                             Suporte Rápido
                          </p>
                          <p className="text-xs text-gray-500 leading-relaxed mb-4">Ficou com alguma dúvida sobre este manual?</p>
                          <Button 
                             variant="link" 
                             className="p-0 h-auto text-teal-400 font-bold text-xs uppercase tracking-widest hover:text-teal-300"
                             onClick={() => navigate('/contato')}
                          >
                             Falar com Equipe
                          </Button>
                       </div>
                    </div>
                </div>

                {/* Conteúdo: Passo a Passo */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeModule.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="glass-card p-10 border-white/5 rounded-[2.5rem] shadow-2xl space-y-12 bg-dark-100/40"
                    >
                        <div className="flex items-center gap-4 pb-8 border-b border-white/5">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                                <LayoutDashboard className="w-5 h-5 text-gray-400" />
                            </div>
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">{activeModule.name}</h2>
                        </div>

                        <div className="space-y-16">
                            {activeModule.steps.map((step, index) => (
                                <div key={index} className="relative pl-16">
                                    {/* Linha Conectora Vertical */}
                                    {index !== activeModule.steps.length - 1 && (
                                        <div className="absolute left-7 top-14 bottom-[-64px] w-0.5 bg-gradient-to-b from-brand-orange-coral/30 to-transparent" />
                                    )}

                                    {/* Número do Passo */}
                                    <div className="absolute left-0 top-0 w-14 h-14 rounded-2xl bg-dark-200 border border-brand-orange-coral/30 flex items-center justify-center z-10 shadow-glow-orange/5 group-hover:scale-110 transition-transform">
                                        <span className="text-brand-orange-coral font-black text-xl italic">{index + 1}</span>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-xl font-bold text-white tracking-tight pt-2">{step.title}</h4>
                                        <p className="text-gray-400 leading-relaxed font-medium text-lg max-w-3xl">
                                            {step.description}
                                        </p>

                                        {step.tip && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-brand-orange-coral/5 border border-brand-orange-coral/10 rounded-2xl p-6 mt-6 flex items-start gap-4 max-w-2xl"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-brand-orange-coral/20 flex items-center justify-center flex-shrink-0">
                                                    <Info className="w-5 h-5 text-brand-orange-coral" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-brand-orange-coral uppercase tracking-[0.2em] mb-1">Dica de Especialista</p>
                                                    <p className="text-sm text-gray-300 font-medium">
                                                        {step.tip}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Botão de Conclusão / Ação */}
                        <div className="pt-12 border-t border-white/5">
                           <Button 
                              onClick={() => navigate(-1)}
                              className="bg-white/5 hover:bg-white/10 text-white font-black px-10 h-14 rounded-2xl border border-white/5 transition-all text-xs uppercase tracking-widest"
                           >
                              <CheckCircle2 className="w-4 h-4 mr-2 text-teal-400" />
                              Entendi o fluxo, voltar
                           </Button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
