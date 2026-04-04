import { useEffect, useCallback, useRef } from 'react';
import {
    Handshake,
    Mic2,
    Phone,
    Target,
    Zap,
    Rocket,
    Users,
    CheckCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SEOHead } from '@/components/seo/SEOHead';
import { EdicaoAnteriorVideo } from '@/components/growth-experience/EdicaoAnteriorVideo';
import { WhatsAppButton } from '@/components/growth-experience/WhatsAppButton';
import { useProject } from '@/contexts/ProjectContext';
import { PetrolinaRegistrationForm } from '@/components/forms/PetrolinaRegistrationForm';
import { ensureProject } from '@/lib/ensureProject';
import { AppDownloadSection } from '@/components/app/AppDownloadSection';


const conselheiros = [
    {
        nome: "Caio Borges",
        role_title: "CEO da CBX Growth & IA",
        bio: "Especialista em growth e inteligência artificial para performance de negócios.",
        empresa: "CBX Growth & IA",
        foto: "https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/profiles/caio-borges.png"
    },
    {
        nome: "Leandro Batista",
        role_title: "CEO da Fitness Exclusive",
        bio: "CEO da rede de academias que mais cresce no interior do Nordeste.",
        empresa: "Fitness Exclusive",
        foto: "https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/palestrantes/leandro-batista.jpeg"
    }
];






export function GrowthExperiencePetrolina() {
    const { setSelectedProject, selectedProject: contextProject } = useProject();

    const initProject = useCallback(async () => {
        // Garantir dados atualizados do projeto

        const project = await ensureProject({
            id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
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
            primaryColor: '#0D9488',
            secondaryColor: '#10B981',
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

    const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://www.growthsummit.site/petrolina';

    return (
        <div className="flex flex-col overflow-x-hidden">
            <SEOHead
                title="Growth Experience Petrolina-PE 2026 | 30 de Abril"
                description="A Maior Imersão de Growth e IA do Vale do São Francisco. 30/04/2026 em Petrolina-PE. Inscreva-se para a lista VIP."
                keywords="growth experience, petrolina, evento negócios, vale do são francisco, sebrae"
                url={pageUrl}
            />




            <section id="sobre" className="py-20 bg-dark-100 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="animate-fade-in-up">
                            <Badge className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/30 px-6 py-2 rounded-full uppercase tracking-widest font-black text-[10px]">
                                O EVENTO PETROLINA
                            </Badge>
                            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tighter">
                                O Vale do São Francisco entra na <span className="text-gradient">Nova Era</span>
                            </h2>
                            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                                Petrolina recebe a edição especial do Growth Experience. Um dia focado em transformar o potencial agrícola e comercial da região através da Inteligência Artificial e estratégias avançadas de Gestão e Growth.
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
                                src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/caretas-triunfo/petrolina.jpeg"
                                className="rounded-3xl shadow-2xl border border-white/5"
                                alt="Petrolina-PE"
                            />
                            <div className="absolute -bottom-6 -right-6 glass-card p-6 border-teal-500/30 animate-float">
                                <p className="text-teal-400 font-black text-4xl">30/04</p>
                                <p className="text-white font-bold">Petrolina-PE</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="mentores" className="py-20 bg-dark-200 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <Badge className="mb-6 bg-teal-500/20 text-teal-400 border-teal-500/30 px-8 py-2 rounded-full uppercase tracking-[0.3em] font-black text-[10px] italic">
                            Palestrantes Âncoras
                        </Badge>
                        <h2 className="text-4xl sm:text-6xl font-extrabold text-white mb-4 tracking-tighter uppercase italic">
                            Mestres da <span className="text-teal-400">Estratégia</span>
                        </h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto font-bold uppercase tracking-widest text-[10px]">
                            Os especialistas que guiarão a imersão de Growth e Alta Performance no Vale.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {conselheiros.map((mentor, idx) => (
                            <div key={idx} className="group relative glass-card p-8 border-white/5 hover:border-brand-orange-coral/30 transition-all duration-500 hover:-translate-y-2">
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-3xl overflow-hidden bg-dark-200 flex-shrink-0 border-2 border-white/5 group-hover:border-teal-500/50 transition-all shadow-2xl">
                                        <img
                                            src={mentor.foto}
                                            alt={mentor.nome}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/LOGO-growthexperience-fundoescuro.v2.png';
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white group-hover:text-teal-400 transition-colors tracking-tight uppercase italic">{mentor.nome}</h3>
                                        <p className="text-teal-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2">{mentor.role_title}</p>
                                        <p className="text-gray-500 text-xs leading-relaxed font-medium">{mentor.bio}</p>
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
                        <Badge className="mb-4 bg-teal-500/20 text-teal-400 border-teal-500/30 px-4 py-1">
                            CRONOGRAMA OFICIAL
                        </Badge>
                        <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
                            Programação <span className="text-teal-400">Night Experience</span>
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
                            <div key={i} className={`flex gap-6 p-6 rounded-2xl border transition-all ${item.destaque ? 'bg-teal-500/10 border-teal-500/30 shadow-glow-teal' : 'bg-dark-200 border-white/5 hover:border-white/10'}`}>
                                <div className="text-teal-400 font-black text-lg sm:text-xl whitespace-nowrap pt-1">
                                    {item.hora}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <item.icon className={`h-5 w-5 ${item.destaque ? 'text-teal-400' : 'text-gray-500'}`} />
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
                    <div className="glass-card p-8 sm:p-12 border-teal-500/20 shadow-glow-teal/10">
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 flex items-center justify-center mx-auto mb-6 border border-teal-500/30">
                                <Rocket className="h-8 w-8 text-teal-400" />
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Garanta sua <span className="text-teal-400">Vaga no Vale</span></h2>
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


            {/* Realização */}
            <section className="py-12 bg-dark-200 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center">
                        <h3 className="text-gray-500 uppercase tracking-[0.3em] text-[10px] font-black mb-6">Realização</h3>
                        <div className="group transition-all duration-500 hover:scale-105">
                            <img
                                src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/logomarca-cbx-growth-ia.png"
                                alt="CBX Growth I.A."
                                className="h-16 sm:h-20 w-auto opacity-70 group-hover:opacity-100 transition-all filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <AppDownloadSection />


            <WhatsAppButton />
        </div>
    );
}

export default GrowthExperiencePetrolina;
