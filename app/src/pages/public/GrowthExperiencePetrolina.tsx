import { useState, useEffect, useCallback, useRef } from 'react';
import {
    MapPin,
    Handshake,
    Menu,
    X,
    Mic2,
    Phone,
    Target,
    Mail,
    Zap,
    Rocket,
    ArrowRight,
    Users,
    CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { SEOHead } from '@/components/seo/SEOHead';
import { EdicaoAnteriorVideo } from '@/components/growth-experience/EdicaoAnteriorVideo';
import { WhatsAppButton } from '@/components/growth-experience/WhatsAppButton';
import { useProject } from '@/contexts/ProjectContext';
import { PetrolinaRegistrationForm } from '@/components/forms/PetrolinaRegistrationForm';
import { ensureProject } from '@/lib/ensureProject';


const conselheiros = [
    {
        nome: "Caio Borges",
        cargo: "CEO, Growth & IA",
        bio: "Especialista em inteligência artificial e estratégias de crescimento acelerado.",
        empresa: "Growth & IA",
        foto: "https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/mentors-photos/caio-borges.png"
    },
    {
        nome: "Leandro Batista",
        cargo: "CEO, Exclusive Fitness",
        bio: "Especialista em escala de negócios e gestão de alta performance.",
        empresa: "Exclusive Fitness",
        foto: "https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/mentors-photos/leandro-batista.png"
    }
];


const navItems = [
    { label: 'Sobre', href: '#sobre' },
    { label: 'Conselheiros', href: '#mentores' },
    { label: 'Programação', href: '#programacao' },
    { label: 'Inscrições', href: '#registro' },
];

function InnerHeader() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isAuthenticated, user } = useAuth();

    const getDashboardLink = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'admin': return '/admin';
            case 'mentor': return '/mentor-area';
            case 'company': return '/empresa-area';
            case 'startup': return '/startup-area';
            case 'sponsor': return '/patrocinador-area';
            default: return '/minha-area';
        }
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <Link to="/" className="flex items-center space-x-3 group transition-transform duration-300 hover:scale-[1.05]">
                            <img
                                src="https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/logomarca-GX-fundoescuro.png"
                                alt="Growth Experience"
                                className="h-10 sm:h-14 w-auto drop-shadow-[0_0_8px_rgba(255,112,67,0.3)] transition-all group-hover:drop-shadow-[0_0_12px_rgba(255,112,67,0.5)]"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/LOGO-growth_experience.png';
                                }}
                            />
                        </Link>

                        <nav className="hidden lg:flex items-center space-x-8">
                            {navItems.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-brand-orange-coral transition-all duration-300 relative group"
                                >
                                    {item.label}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-orange-coral transition-all duration-300 group-hover:w-full" />
                                </a>
                            ))}
                            <Link
                                to={isAuthenticated ? getDashboardLink() : "/login"}
                                className="text-xs font-black uppercase tracking-widest text-brand-orange-coral hover:text-white transition-all bg-brand-orange-coral/10 px-4 py-2 rounded-xl"
                            >
                                {isAuthenticated ? 'Meu Painel' : 'Acessar Portal'}
                            </Link>
                        </nav>

                        <div className="flex items-center space-x-4">
                            <Button variant="outline" className="hidden sm:flex border-brand-orange-coral text-brand-orange-coral hover:bg-brand-orange-coral/10 rounded-xl px-6 h-11" asChild>
                                <Link to={isAuthenticated ? getDashboardLink() : "/login"}>
                                    {isAuthenticated ? (user?.name?.split(' ')[0] || 'Painel') : 'Entrar'}
                                </Link>
                            </Button>
                            <button className="lg:hidden text-white p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-[45] bg-dark backdrop-blur-2xl px-4 pt-24 pb-12 overflow-y-auto animate-in fade-in duration-300">
                    <nav className="flex flex-col gap-2">
                        {navItems.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="flex items-center justify-between text-2xl font-black text-gray-300 hover:text-white hover:bg-white/5 transition-all px-6 py-5 rounded-3xl group border border-transparent hover:border-white/5"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item.label}
                                <ArrowRight className="h-6 w-6 text-brand-orange-coral opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                            </a>
                        ))}
                    </nav>
                    <div className="mt-8 px-4 space-y-4">
                        <Button variant="outline" size="lg" className="w-full border-brand-orange-coral text-brand-orange-coral hover:bg-brand-orange-coral/10 h-16 text-xl font-black rounded-2xl" asChild>
                            <Link to={isAuthenticated ? getDashboardLink() : "/login"} onClick={() => setIsMobileMenuOpen(false)}>
                                {isAuthenticated ? `Olá, ${user?.name?.split(' ')[0]}` : 'Entrar na Área do Aluno'}
                            </Link>
                        </Button>
                        <div className="text-center pt-4">
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest text-[10px]">Growth Experience Petrolina 2026</p>
                            <Link to="/" className="text-brand-orange-coral text-xs font-black uppercase mt-4 block">Voltar ao Portal Global</Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function InnerFooter() {
    return (
        <footer className="bg-dark-100 border-t border-white/5 pt-20 pb-10 sm:pb-8 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-orange-coral/5 rounded-full blur-[120px] -z-10 translate-y-1/2 translate-x-1/2" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
                    <div className="lg:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="mb-8">
                            <img
                                src="https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/LOGO-growth_experience.png"
                                alt="Growth Experience"
                                className="h-12 w-auto"
                            />
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm">
                            A maior imersão de Growth e IA do Vale do São Francisco. O evento que vai conectar Petrolina ao futuro do marketing e das vendas.
                        </p>
                    </div>
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <h4 className="text-white font-bold text-lg mb-8">Navegação</h4>
                        <ul className="space-y-4">
                            {navItems.map(item => (
                                <li key={item.label}><a href={item.href} className="text-gray-400 hover:text-brand-orange-coral transition-all">{item.label}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <h4 className="text-white font-bold text-lg mb-8">Contato</h4>
                        <ul className="space-y-6 text-gray-400 text-sm">
                            <li className="flex items-center gap-3"><MapPin className="h-4 w-4 text-brand-orange-coral" /> Petrolina-PE (Vale do São Francisco)</li>
                            <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-brand-orange-coral" /> petrolina@growthsummit.site</li>
                            <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-brand-orange-coral" /> (88) 98843-2310</li>
                        </ul>
                    </div>
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <h4 className="text-white font-bold text-lg mb-8">Desenvolvido por</h4>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <img src="https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/cbx%20growth%20ia/cbxGrowth-versao1.png" className="h-12 mx-auto" alt="CBX" />
                        </div>
                    </div>
                </div>
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
                    <p className="text-gray-500 text-xs text-center md:text-left">© 2026 Growth Experience Petrolina-PE. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
}

export function GrowthExperiencePetrolina() {
    const { setSelectedProject, selectedProject: contextProject } = useProject();

    const initProject = useCallback(async () => {
        // Garantir dados atualizados do projeto

        const project = await ensureProject({
            name: 'Growth Experience Petrolina-PE 2026',
            slug: 'ge-petrolina-2026',
            type: 'growth_experience',
            description: 'A Maior Imersão de Growth e IA do Vale do São Francisco. Networking, mentorias e capacitação gratuita em 30 de abril de 2026.',
            shortDescription: 'Edição Petrolina-PE',
            location: 'Em breve',
            city: 'Petrolina',
            state: 'PE',
            startDate: '2026-04-30',
            endDate: '2026-04-30',
            status: 'active',
            primaryColor: '#FE4C38',
            secondaryColor: '#FF6B35',
            settings: {
                maxRegistrations: 500,
                maxMentors: 0,
                enableB2B: false,
                enableMentoring: false,
                enableStartups: false,
                enableCheckIn: true,
                ticketPrices: {
                    standard: 0,
                    pro: 179.99,
                    vip: 0,
                },
            },
        });

        if (project) {
            if (!contextProject || contextProject.id !== project.id) {
                setSelectedProject(project);
            }
        }
    }, [contextProject, setSelectedProject]);

    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            setTimeout(() => initProject(), 0);
            initialized.current = true;
        }
    }, [initProject]);

    const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://www.growthsummit.site/growth-experience-petrolina';

    return (
        <div className="bg-dark min-h-screen pt-20 flex flex-col overflow-x-hidden">
            <SEOHead
                title="Growth Experience Petrolina-PE 2026 | 30 de Abril"
                description="A Maior Imersão de Growth e IA do Vale do São Francisco. 30/04/2026 em Petrolina-PE. Inscreva-se para a lista VIP."
                keywords="growth experience, petrolina, evento negócios, vale do são francisco, sebrae"
                url={pageUrl}
            />

            <InnerHeader />


            <section id="sobre" className="py-20 bg-dark-100 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="animate-fade-in-up">
                            <Badge className="mb-4 bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/30 px-4 py-1">O EVENTO PETROLINA</Badge>
                            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">O Vale do São Francisco entra na <span className="text-gradient">Nova Era</span></h2>
                            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                                Petrolina recebe a edição especial do Growth Experience. Um dia focado em transformar o potencial agrícola e comercial da região através da Inteligência Artificial e estratégias avançadas de Growth.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-8 mb-8">
                                {[
                                    { icon: Zap, title: 'Inovação Local', desc: 'IA aplicada ao agronegócio e varejo do Vale' },
                                    { icon: Users, title: 'Conexões de Alto Valor', desc: 'Networking com os maiores empresários da região' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-4 group">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-orange-coral/10 flex items-center justify-center group-hover:bg-brand-orange-coral transition-all">
                                            <item.icon className="h-6 w-6 text-brand-orange-coral group-hover:text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold mb-1">{item.title}</h4>
                                            <p className="text-sm text-gray-400">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1510672981848-a1c4f1cb58f3?q=80&w=2070&auto=format&fit=crop"
                                className="rounded-3xl shadow-2xl border border-white/5"
                                alt="Petrolina-PE"
                            />
                            <div className="absolute -bottom-6 -right-6 glass-card p-6 border-brand-orange-coral/30 animate-float">
                                <p className="text-brand-orange-coral font-black text-4xl">30/04</p>
                                <p className="text-white font-bold">Petrolina-PE</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="mentores" className="py-20 bg-dark-200 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <Badge className="mb-4 bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30 px-4 py-1">CONSELHORES ESTRATÉGICOS</Badge>
                        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4">Apoio <span className="text-gradient">Especialista</span></h2>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">Mentores selecionados para guiar a transformação digital do Vale.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {conselheiros.map((mentor, idx) => (
                            <div key={idx} className="group relative glass-card p-8 border-white/5 hover:border-brand-orange-coral/30 transition-all duration-500 hover:-translate-y-2">
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-dark-200 flex-shrink-0 border-2 border-white/5 group-hover:border-brand-orange-coral/30 transition-all">
                                        <img
                                            src={mentor.foto}
                                            alt={mentor.nome}
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/LOGO-growth-summit_branco.v2.png';
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-extrabold text-white group-hover:text-brand-orange-coral transition-colors">{mentor.nome}</h3>
                                        <p className="text-brand-orange-coral font-bold text-sm uppercase tracking-widest mb-2">{mentor.cargo}</p>
                                        <p className="text-gray-400 text-sm leading-relaxed">{mentor.bio}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Programação Petrolina */}
            <section id="programacao" className="py-24 bg-dark-100 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <Badge className="mb-4 bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30 px-4 py-1">
                            CRONOGRAMA OFICIAL
                        </Badge>
                        <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
                            Programação <span className="text-gradient">Night Experience</span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Uma noite intensiva de aprendizado, estratégias práticas e mentoria direta com os grandes nomes do mercado.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-6">
                        {[
                            {
                                hora: "18:30",
                                titulo: "Credenciamento e Networking",
                                desc: "Abertura dos portões e conexões iniciais no Vale do São Francisco.",
                                icon: Users
                            },
                            {
                                hora: "19:00",
                                titulo: "Growth & IA (Caio Borges)",
                                desc: "Como aplicar as tendências de inteligência artificial de 2026 para acelerar seu negócio.",
                                icon: Mic2
                            },
                            {
                                hora: "19:45",
                                titulo: "Escala e Alta Performance (Leandro Batista)",
                                desc: "Estratégias avançadas de gestão e processos para escalar sua empresa com lucratividade.",
                                icon: Zap
                            },
                            {
                                hora: "20:30",
                                titulo: "Mentoria Coletiva (Hot Seat)",
                                desc: "Sessão exclusiva de perguntas e respostas com os dois palestrantes no palco.",
                                icon: Target,
                                destaque: true
                            },
                            {
                                hora: "21:30",
                                titulo: "Encerramento e Happy Hour",
                                desc: "Momento final de troca de cartões e consolidação de parcerias.",
                                icon: Handshake
                            }
                        ].map((item, i) => (
                            <div key={i} className={`flex gap-6 p-6 rounded-2xl border transition-all ${item.destaque ? 'bg-brand-orange-coral/10 border-brand-orange-coral/30 shadow-glow-orange' : 'bg-dark-200 border-white/5 hover:border-white/10'}`}>
                                <div className="text-brand-orange-coral font-black text-lg sm:text-xl whitespace-nowrap pt-1">
                                    {item.hora}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <item.icon className={`h-5 w-5 ${item.destaque ? 'text-brand-orange-coral' : 'text-gray-500'}`} />
                                        <h4 className="text-white font-bold text-lg sm:text-xl">{item.titulo}</h4>
                                    </div>
                                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <EdicaoAnteriorVideo showTriunfoTeaser={false} />

            <section id="registro" className="py-24 bg-dark relative overflow-hidden border-t border-white/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="glass-card p-8 sm:p-12 border-brand-orange-coral/20 shadow-glow-orange/10">
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 rounded-2xl bg-brand-orange-coral/20 flex items-center justify-center mx-auto mb-6 border border-brand-orange-coral/30">
                                <Rocket className="h-8 w-8 text-brand-orange-coral" />
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Garanta sua <span className="text-gradient">Vaga no Vale</span></h2>
                            <p className="text-gray-400">Preencha os dados abaixo para confirmar sua participação no Night Experience Petrolina.</p>
                        </div>

                        <PetrolinaRegistrationForm />

                        <div className="mt-12 p-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-center">
                            <p className="text-green-400 font-bold mb-4 flex items-center justify-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                Ingressos para o Night Experience são Limitados
                            </p>
                            <a
                                href="https://chat.whatsapp.com/L1MhM2f9m9n0M9m9M9m9M9"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-white bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-bold transition-all"
                            >
                                <Phone className="h-5 w-5" />
                                Entrar no Grupo do WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <InnerFooter />
            <WhatsAppButton />
        </div>
    );
}
