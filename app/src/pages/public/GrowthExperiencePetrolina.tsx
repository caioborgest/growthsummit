import { useState } from 'react';
import {
    MapPin,
    TrendingUp,
    Handshake,
    Building2,
    GraduationCap,
    Menu,
    X,
    Mic2,
    Award,
    Phone,
    Target,
    Mail,
    Zap,
    Rocket,
    Trophy,
    ArrowRight,
    Sparkles,
    Instagram,
    Linkedin,
    Facebook,
    CheckCircle,
    Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InscricaoModal } from '@/components/forms/InscricaoModal';
import { StartupFormModal } from '@/components/forms/StartupFormModal';
import { B2BFormModal } from '@/components/forms/B2BFormModal';
import { MentorFormModal } from '@/components/forms/MentorFormModal';
import { MentoriaMultiStepModal } from '@/components/forms/MentoriaMultiStepModal';
import { EmpresaIncentivadoraModal } from '@/components/forms/EmpresaIncentivadoraModal';
import { SEOHead } from '@/components/seo/SEOHead';
import { getPalestranteImage, getStandImage } from '@/lib/storage';
import { InscricaoSection } from '@/components/growth-experience/InscricaoSection';
import { AppDownloadSection } from '@/components/app/AppDownloadSection';
import { InscricaoMultiStepModal } from '@/components/forms/InscricaoMultiStepModal';
import { SocialRegistrationSection } from '@/components/growth-experience/SocialRegistrationSection';
import { ProgramacaoCircuitoSection } from '@/components/growth-experience/ProgramacaoCircuitoSection';
import { EdicaoAnteriorVideo } from '@/components/growth-experience/EdicaoAnteriorVideo';
import { HeroSectionRefined } from '@/components/growth-experience/HeroSectionRefined';
import { StatsSection } from '@/components/growth-experience/StatsSection';
import { PalestranteCardRefined } from '@/components/growth-experience/PalestranteCardRefined';
import { SectionShare } from '@/components/social/SectionShare';
import { SocialShare } from '@/components/social/SocialShare';
import { LotePromocionalPopUp } from '@/components/growth-experience/LotePromocionalPopUp';
import { PatrocinioCard } from '@/components/growth-experience/PatrocinioCard';
import { WhatsAppButton } from '@/components/growth-experience/WhatsAppButton';
import { useMentors, useProjects } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import { useEffect, useCallback } from 'react';
import { ensureProject } from '@/lib/ensureProject';

// Dados do evento
const palestrantes = [
    {
        nome: "Speaker Nacional 1",
        cargo: "Especialista em Growth & IA",
        descricao: "Referência em estratégias de crescimento acelerado utilizando inteligência artificial.",
        tema: "O Futuro do Growth: Como a IA está redefinindo o mercado",
        horario: "19:00 - 19:45"
    },
    {
        nome: "Speaker Nacional 2",
        cargo: "Expert em Vendas e Escala",
        descricao: "Especialista em construir times de vendas de alta performance e processos de escala.",
        tema: "Escala Inevitável: Processos de Vendas para 2026",
        horario: "19:45 - 20:30"
    }
];

const cotas = [
    {
        nome: "DIAMANTE",
        espaco: "10m x 10m - Stand Premium",
        ingressos: 15,
        beneficios: [
            "Posição de destaque total",
            "Logo em todas as comunicações",
            "Slot de palestra garantido",
            "Relatório de leads qualificados"
        ],
        destaque: true,
        vagas: 2
    },
    {
        nome: "OURO",
        espaco: "5m x 10m - Stand Gold",
        ingressos: 10,
        beneficios: [
            "Posição de grande visibilidade",
            "Logo em banners e programas",
            "Menção nos palcos principais"
        ],
        vagas: 4
    }
];

const navItems = [
    { label: 'Sobre', href: '#sobre' },
    { label: 'Mentores', href: '#mentores' },
    { label: 'Palestrantes', href: '#palestrantes' },
    { label: 'Programação', href: '#programacao' },
    { label: 'Inscrições', href: '#inscricoes' },
];

function InnerHeader() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { selectedProject } = useProject();

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
                                to="/"
                                className="text-xs font-black uppercase tracking-widest text-brand-orange-coral hover:text-white transition-all bg-brand-orange-coral/10 px-4 py-2 rounded-xl"
                            >
                                Voltar ao Portal
                            </Link>
                        </nav>

                        <div className="flex items-center space-x-4">
                            <Button variant="outline" className="hidden sm:flex border-brand-orange-coral text-brand-orange-coral hover:bg-brand-orange-coral/10" asChild>
                                <Link to="/login">Entrar</Link>
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
                            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Entrar na Área do Aluno</Link>
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
    const { data: projects } = useProjects();
    const { setSelectedProject, selectedProject } = useProject();
    const [modalInscricaoAberto, setModalInscricaoAberto] = useState(false);
    const [modalAberto, setModalAberto] = useState<'mentor' | 'mentor-cadastro' | 'startup' | 'b2b' | 'palestra' | 'empresa' | null>(null);

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
            primaryColor: '#FE4C38',
            secondaryColor: '#FF6B35',
            settings: {
                maxRegistrations: 500,
                maxMentors: 30,
                enableB2B: true,
                enableMentoring: true,
                enableStartups: true,
            },
        });

        if (project && (!selectedProject || selectedProject.id !== project.id)) {
            setSelectedProject(project);
        }
    }, [projects, selectedProject, setSelectedProject]);

    useEffect(() => {
        initProject();
    }, [initProject]);

    const { data: mentorsData, isLoading: mentorsLoading } = useMentors();
    const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://www.growthsummit.site/growth-experience-petrolina';
    const approvedMentors = (mentorsData || []).filter(m => m.status === 'approved');

    return (
        <div className="bg-dark min-h-screen pt-20 flex flex-col overflow-x-hidden">
            <SEOHead
                title="Growth Experience Petrolina-PE 2026 | 30 de Abril"
                description="A Maior Imersão de Growth e IA do Vale do São Francisco. 30/04/2026 em Petrolina-PE. Inscreva-se para a lista VIP."
                keywords="growth experience, petrolina, evento negócios, vale do são francisco, sebrae"
                url={pageUrl}
            />

            <InnerHeader />

            <InscricaoMultiStepModal isOpen={modalInscricaoAberto} onClose={() => setModalInscricaoAberto(false)} />
            <MentoriaMultiStepModal isOpen={modalAberto === 'mentor'} onClose={() => setModalAberto(null)} />
            <InscricaoModal isOpen={modalAberto === 'palestra'} onClose={() => setModalAberto(null)} tipo="palestra" eventoNome="Growth Experience Petrolina 2026" />
            <MentorFormModal isOpen={modalAberto === 'mentor-cadastro'} onClose={() => setModalAberto(null)} />
            <StartupFormModal isOpen={modalAberto === 'startup'} onClose={() => setModalAberto(null)} />
            <B2BFormModal isOpen={modalAberto === 'b2b'} onClose={() => setModalAberto(null)} />
            <EmpresaIncentivadoraModal isOpen={modalAberto === 'empresa'} onClose={() => setModalAberto(null)} />

            <HeroSectionRefined onCTAClick={() => setModalInscricaoAberto(true)} />
            <StatsSection />

            <section id="sobre" className="py-16 sm:py-24 bg-dark-100 relative overflow-hidden">
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
                                    { icon: TrendingUp, title: 'Inovação', desc: 'IA aplicada ao agronegócio e varejo' },
                                    { icon: Handshake, title: 'Conexões', desc: 'Networking com os maiores do Vale' }
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
                    </div>
                </div>
            </section>

            <section id="mentores" className="py-16 sm:py-24 bg-dark-200 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <Badge className="mb-4 bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30 px-4 py-1">CONSELHORES ESTRATÉGICOS</Badge>
                        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4">Mentores <span className="text-gradient">Confirmados</span></h2>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">Especialistas prontos para diagnosticar seu negócio e acelerar Petrolina.</p>
                    </div>

                    {!mentorsLoading && approvedMentors.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                            {approvedMentors.map((mentor) => (
                                <div key={mentor.id} className="group relative glass-card p-6 border-white/5 hover:border-brand-orange-coral/30 transition-all duration-500">
                                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-6 bg-dark-200">
                                        <img
                                            src={mentor.photo || 'https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/LOGO-growth-summit_branco.v2.png'}
                                            alt={mentor.name}
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-brand-orange-coral transition-colors">{mentor.name}</h3>
                                    <p className="text-brand-orange-coral font-bold text-xs uppercase tracking-widest">{mentor.position} @ {mentor.company}</p>
                                </div>
                            ))}
                        </div>
                    ) : mentorsLoading ? (
                        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange-coral"></div></div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl mb-16">
                            <Sparkles className="h-10 w-10 text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">Novos mentores estão sendo aprovados para o Vale...</p>
                        </div>
                    )}
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
                                titulo: "Palestra Magna 1: Inovação e Growth",
                                desc: "A primeira imersão sobre como aplicar as tendências de 2026 no seu negócio.",
                                icon: Mic2
                            },
                            {
                                hora: "19:45",
                                titulo: "Palestra Magna 2: Estratégias de Escala",
                                desc: "Técnicas avançadas de vendas e processos para crescer de forma sustentável.",
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

            {/* Seções de Inscrição */}
            <div id="inscricoes">
                <InscricaoSection
                    id="night-experience"
                    icon={Mic2}
                    titulo="Night Experience Petrolina"
                    subtitulo="O auge do conhecimento e networking"
                    descricao="Participe do momento principal com palestras magnas e o prêmio empresa incentivadora."
                    beneficios={[
                        "Acesso às palestras principais",
                        "Networking com grandes empresários do Vale",
                        "Certificado de participação VIP"
                    ]}
                    vagasLimitadas
                    onInscrever={() => setModalInscricaoAberto(true)}
                    imagemUrl="https://images.unsplash.com/photo-1475721027181-e00184321c2e?q=80&w=2070&auto=format&fit=crop"
                />

                <InscricaoSection
                    id="cursos-workshops"
                    icon={GraduationCap}
                    titulo="Cursos e Workshops Gratuitos"
                    subtitulo="Acesso ilimitado a todas as trilhas diurnas"
                    descricao="Participe de workshops práticos e oficinas mão na massa focadas no varejo e agro local."
                    beneficios={[
                        "Acesso a todos os workshops e oficinas",
                        "Certificado de participação digital",
                        "Material didático da edição Petrolina"
                    ]}
                    gratuito
                    onInscrever={() => setModalInscricaoAberto(true)}
                    imagemUrl="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop"
                />

                <InscricaoSection
                    id="mentorias"
                    icon={Target}
                    titulo="Mentoria Individual no Vale"
                    subtitulo="30 minutos exclusivos com especialistas"
                    descricao="Sessões personalizadas para diagnosticar e acelerar o seu negócio no Sertão."
                    beneficios={[
                        "Sessão individual de 30 minutos",
                        "Diagnóstico personalizado",
                        "Plano de ação imediato"
                    ]}
                    gratuito
                    onInscrever={() => setModalAberto('mentor')}
                    imagemUrl="https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=2071&auto=format&fit=crop"
                />
            </div>

            <InnerFooter />
            <WhatsAppButton />
        </div>
    );
}
