import { MapPin, Users, Sparkles, ChevronRight } from 'lucide-react';

interface EdicaoAnteriorVideoProps {
    /** URL do vídeo story vertical */
    videoSrc?: string;
    /** true = seção na página GE Triunfo (menção à próxima edição Triunfo) */
    showTriunfoTeaser?: boolean;
}

import { useProject } from '@/contexts/ProjectContext';

export function EdicaoAnteriorVideo({
    videoSrc = 'https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/edicao-jn/Cobertura%20do%20Evento%20.mov',
    showTriunfoTeaser = false,
}: EdicaoAnteriorVideoProps) {
    const { selectedProject } = useProject();
    return (
        <section className="py-16 sm:py-28 bg-dark relative overflow-hidden">
            {/* Background atmosphere */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-brand-orange-coral/6 blur-[160px] rounded-full -translate-x-1/2 -translate-y-1/3" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/6 blur-[140px] rounded-full translate-x-1/3 translate-y-1/3" />
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                    }}
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange-coral/15 border border-brand-orange-coral/30 mb-6">
                        <Sparkles className="h-3.5 w-3.5 text-brand-orange-coral" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-orange-coral">
                            Edição Anterior • 2025
                        </span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
                        Growth Experience{' '}
                        <span className="text-gradient">Juazeiro do Norte</span>
                        <br />
                        <span className="text-2xl sm:text-3xl text-gray-400 font-semibold">
                            Cariri — CE · 2025
                        </span>
                    </h2>

                    <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Veja como foi a edição anterior — a experiência que provou que o Growth Experience
                        transforma o empreendedorismo do interior.
                        {showTriunfoTeaser && (
                            <>
                                {' '}A edição {selectedProject?.city || 'Triunfo'} {selectedProject?.startDate ? new Date(selectedProject.startDate + 'T00:00:00').getFullYear() : '2026'} chega com tudo amplificado:{' '}
                                <strong className="text-white">2.000 participantes</strong> durante toda a programação.
                            </>
                        )}
                    </p>
                </div>

                {/* Layout: centrado com vídeo story */}
                <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">

                    {/* ── Story Vertical Video ── */}
                    <div className="flex-shrink-0 mx-auto">
                        <div className="relative group">
                            {/* Glow */}
                            <div className="absolute -inset-4 bg-gradient-to-b from-brand-orange-coral/40 via-purple-500/20 to-transparent rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />

                            {/* Phone-like frame — story 9:16 */}
                            <div
                                className="relative bg-dark-200 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/60"
                                style={{ width: '280px', aspectRatio: '9/16', maxWidth: '90vw' }}
                            >
                                {/* Status bar decoration */}
                                <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 pt-4 pb-2 bg-gradient-to-b from-black/70 to-transparent">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-brand-orange-coral animate-pulse" />
                                        <span className="text-white/70 text-[10px] font-bold uppercase tracking-wider">
                                            GX Juazeiro 2025
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3 text-white/50" />
                                        <span className="text-white/50 text-[9px]">Cariri · CE</span>
                                    </div>
                                </div>

                                {/* Video */}
                                <video
                                    className="w-full h-full object-cover"
                                    controls
                                    playsInline
                                    preload="metadata"
                                    style={{ aspectRatio: '9/16' }}
                                >
                                    <source src={videoSrc} type="video/mp4" />
                                    <source src={videoSrc} type="video/quicktime" />
                                    Seu navegador não suporta reprodução de vídeo.
                                </video>

                                {/* Bottom gradient */}
                                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                                <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                                    <p className="text-white/80 text-[11px] font-bold uppercase tracking-widest">Cobertura Oficial</p>
                                </div>
                            </div>

                            {/* Floating badge */}
                            <div className="absolute -bottom-4 -right-3 sm:-right-6 glass-card px-4 py-2.5 border-brand-orange-coral/30 shadow-glow-orange flex items-center gap-2 z-20 animate-float">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                                <p className="text-white text-xs font-bold whitespace-nowrap">JN · Cariri 2025</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Texto lateral ── */}
                    <div className="flex-1 text-center lg:text-left">
                        {/* Stats do evento anterior */}
                        <div className="grid grid-cols-2 gap-4 mb-10">
                            {[
                                { value: '200+', label: 'Participantes', sub: 'edição 2025' },
                                { value: '6+', label: 'Palestrantes', sub: 'especialistas' },
                                { value: '4h', label: 'Imersão', sub: 'intensiva' },
                                { value: '100%', label: 'Aprovação', sub: 'dos presentes' },
                            ].map((s, i) => (
                                <div
                                    key={i}
                                    className="glass-card p-4 border-white/5 hover:border-brand-orange-coral/25 transition-all duration-300 rounded-2xl hover:-translate-y-1"
                                >
                                    <p className="text-2xl sm:text-3xl font-black text-white">{s.value}</p>
                                    <p className="text-sm font-bold text-brand-orange-coral">{s.label}</p>
                                    <p className="text-[11px] text-gray-500 uppercase tracking-wider">{s.sub}</p>
                                </div>
                            ))}
                        </div>

                        {/* Items info */}
                        <div className="space-y-4 mb-10">
                            {[
                                {
                                    icon: MapPin,
                                    title: 'Juazeiro do Norte — Cariri, CE',
                                    desc: 'Realizado em 2025, formato Pocket de alto impacto',
                                },
                                {
                                    icon: Users,
                                    title: 'Público: Empresários & Profissionais',
                                    desc: 'Marketing, vendas, IA e gestão estratégica para PMEs do interior',
                                },
                                ...(showTriunfoTeaser
                                    ? [
                                        {
                                            icon: Sparkles,
                                            title: `${selectedProject?.city || 'Triunfo'} — A Versão Expandida`,
                                            desc: `2.000 participantes durante toda a programação · ${selectedProject?.state === 'PE' ? 'Pernambuco' : 'Região'}`,
                                        },
                                    ]
                                    : [
                                        {
                                            icon: Sparkles,
                                            title: 'Próxima Parada: Petrolina',
                                            desc: 'Em breve — uma nova edição para o Sertão de Pernambuco',
                                        },
                                    ]),
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4 group">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-orange-coral/10 flex items-center justify-center group-hover:bg-brand-orange-coral transition-all duration-300">
                                        <item.icon className="h-5 w-5 text-brand-orange-coral group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-white font-bold text-sm mb-0.5">{item.title}</p>
                                        <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Teaser da próxima edição */}
                        {showTriunfoTeaser ? (
                            <div className="glass-card p-5 border-brand-orange-coral/20 rounded-2xl bg-gradient-to-r from-brand-orange-coral/5 to-transparent">
                                <div className="flex items-start gap-3">
                                    <Sparkles className="h-5 w-5 text-brand-orange-coral flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-white font-bold text-sm mb-1">
                                            {selectedProject?.city || 'Triunfo'} {selectedProject?.startDate ? new Date(selectedProject.startDate + 'T00:00:00').getFullYear() : '2026'} será grandiosa e ampliada 🚀
                                        </p>
                                        <p className="text-gray-400 text-xs leading-relaxed">
                                            Inspirada no sucesso do Juazeiro do Norte, a edição de {selectedProject?.city || 'Triunfo'} chega
                                            com formato completo — <strong className="text-white">2.000 participantes</strong>,
                                            circuito de experiências, Arena Pitch, Rodada B2B e manhã + noite de capacitação.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="glass-card p-5 border-purple-500/20 rounded-2xl bg-gradient-to-r from-purple-500/5 to-transparent">
                                <div className="flex items-start gap-3">
                                    <ChevronRight className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-white font-bold text-sm mb-1">
                                            Em breve — Growth Experience Petrolina
                                        </p>
                                        <p className="text-gray-400 text-xs leading-relaxed">
                                            O formato que transformou o Cariri chega ao Sertão de Pernambuco.
                                            Fique ligado para ser um dos primeiros a saber.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
