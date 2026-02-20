import { useState } from 'react';
import {
    BookOpen,
    ChevronRight,
    User,
    Settings,
    Zap,
    ShieldCheck,
    Users,
    Building2,
    Rocket,
    ArrowLeft,
    Search,
    CheckCircle2,
    Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { usabilityGuide, RoleGuide } from '@/data/usabilityGuide';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export function HelpCenter() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedRole, setSelectedRole] = useState<RoleGuide | null>(null);
    const [selectedModule, setSelectedModule] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const guidesToShow = usabilityGuide.filter(guide => {
        if (guide.role === 'admin') return user?.role === 'admin';
        return true;
    });

    const filteredGuides = guidesToShow.filter(guide =>
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.modules.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const roleIcons: Record<string, any> = {
        admin: ShieldCheck,
        participant: User,
        mentor: Zap,
        company: Building2,
        startup: Rocket,
        sponsor: Gem
    };

    if (selectedRole) {
        const activeModule = selectedRole.modules.find(m => m.id === selectedModule) || selectedRole.modules[0];

        return (
            <div className="min-h-screen bg-dark-200">
                {/* Header Superior */}
                <div className="bg-dark-100 border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => { setSelectedRole(null); setSelectedModule(null); }}
                            className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all shadow-lg"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                {selectedRole.title}
                                <Badge className="bg-brand-orange-coral/20 text-brand-orange-coral">Manual</Badge>
                            </h1>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="text-gray-400 hover:text-white"
                    >
                        Sair do Guia
                    </Button>
                </div>

                <div className="max-w-7xl mx-auto p-6 md:p-12 grid lg:grid-cols-[280px,1fr] gap-8">
                    {/* Sidebar de Módulos */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 mb-4">Módulos do Sistema</h3>
                        {selectedRole.modules.map((module) => (
                            <button
                                key={module.id}
                                onClick={() => setSelectedModule(module.id)}
                                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${selectedModule === module.id || (!selectedModule && selectedRole.modules[0].id === module.id)
                                    ? 'bg-brand-orange-coral text-white shadow-[0_0_20px_rgba(255,112,67,0.3)]'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span className="font-semibold">{module.name}</span>
                                <ChevronRight className={`w-4 h-4 transition-transform ${selectedModule === module.id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                            </button>
                        ))}
                    </div>

                    {/* Conteúdo do Passo a Passo */}
                    <div className="space-y-8">
                        <motion.div
                            key={activeModule.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-dark-100 border border-white/5 rounded-3xl p-8 shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-brand-orange-coral/20 flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-brand-orange-coral" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{activeModule.name}</h2>
                                    <p className="text-gray-400">Guia detalhado de usabilidade</p>
                                </div>
                            </div>

                            <div className="space-y-12">
                                {activeModule.steps.map((step, index) => (
                                    <div key={index} className="relative pl-12">
                                        {/* Linha Conectora */}
                                        {index !== activeModule.steps.length - 1 && (
                                            <div className="absolute left-6 top-10 bottom-[-40px] w-px bg-gradient-to-b from-brand-orange-coral/50 to-transparent" />
                                        )}

                                        {/* Indicador de Passo */}
                                        <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-dark-200 border-2 border-brand-orange-coral flex items-center justify-center z-10 shadow-[0_0_15px_rgba(255,112,67,0.2)]">
                                            <span className="text-brand-orange-coral font-bold text-lg">{index + 1}</span>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-xl font-bold text-white pt-2">{step.title}</h4>
                                            <p className="text-gray-400 leading-relaxed text-lg max-w-3xl">
                                                {step.description}
                                            </p>

                                            {/* Dica Dinâmica */}
                                            {step.tip && (
                                                <div className="bg-brand-orange-coral/5 border border-brand-orange-coral/20 rounded-2xl p-6 mt-4 flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-brand-orange-coral/20 flex items-center justify-center flex-shrink-0">
                                                        <Info className="w-5 h-5 text-brand-orange-coral" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-brand-orange-coral uppercase tracking-wider mb-1">Dica Extra</p>
                                                        <p className="text-sm text-gray-300">
                                                            {step.tip}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Ações Finais */}
                            <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center gap-4">
                                <Button className="w-full sm:w-auto bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-dark-100 font-bold px-8 h-12 rounded-xl">
                                    <CheckCircle2 className="w-5 h-5 mr-2" />
                                    Entendi, ir para o módulo
                                </Button>
                                <Button variant="ghost" className="text-gray-400 hover:text-white underline underline-offset-4">
                                    Abrir ticket de suporte
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-200">
            {/* Hero Section */}
            <div className="relative pt-20 pb-16 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-orange-coral/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-4xl mx-auto relative text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Badge className="mb-6 bg-brand-orange-coral/10 text-brand-orange-coral px-4 py-1.5 text-sm uppercase tracking-widest border border-brand-orange-coral/20">
                            Central de Usabilidade
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                            Como podemos <span className="text-gradient">ajudar</span> hoje?
                        </h1>
                        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Explore os guias passo a passo para cada perfil de usuário. Escolha seu acesso e aprenda a gerir a plataforma como um mestre.
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl mx-auto mb-16">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Pesquise por módulo (ex: B2B, Projetos, Ingressos...)"
                            className="w-full h-16 bg-dark-100 border border-white/10 rounded-2xl pl-16 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange-coral transition-all shadow-2xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Role Selection Grid */}
            <div className="max-w-7xl mx-auto px-6 pb-20">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filteredGuides.map((guide, index) => {
                            const Icon = roleIcons[guide.role] || User;
                            return (
                                <motion.div
                                    key={guide.role}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <Card
                                        className="bg-dark-100 border-white/5 hover:border-brand-orange-coral/50 cursor-pointer overflow-hidden group transition-all duration-300"
                                        onClick={() => setSelectedRole(guide)}
                                    >
                                        <CardContent className="p-8">
                                            <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center transition-all group-hover:scale-110 shadow-lg ${guide.role === 'admin'
                                                ? 'bg-red-500/20 text-red-400'
                                                : 'bg-brand-orange-coral/20 text-brand-orange-coral'
                                                }`}>
                                                <Icon className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white mb-3 flex items-center justify-between">
                                                {guide.title}
                                                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-brand-orange-coral group-hover:translate-x-1 transition-all" />
                                            </h3>
                                            <p className="text-gray-400 mb-6 line-clamp-2 leading-relaxed">
                                                {guide.description}
                                            </p>

                                            <div className="flex flex-wrap gap-2 mt-auto">
                                                {guide.modules.map(mod => (
                                                    <Badge key={mod.id} variant="outline" className="bg-white/5 border-white/10 text-gray-300 text-[10px] uppercase tracking-wider">
                                                        {mod.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
