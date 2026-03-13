
import { QrCode, Sparkles, Download, Moon, Sun, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';

interface TicketSectionProps {
    myRegistration: any;
    user: any;
    selectedProject: any;
    statusFinanceiro: any;
    isActuallyPaid: boolean;
    generateTicketPDF: (reg: any, projectName: string) => Promise<void>;
    setShowCheckInModal: (show: boolean) => void;
}

export function TicketSection({
    myRegistration,
    user,
    selectedProject,
    statusFinanceiro,
    isActuallyPaid,
    generateTicketPDF,
    setShowCheckInModal
}: TicketSectionProps) {
    return (
        <div className="flex flex-col gap-8 pb-32">
            {/* INFORMAÇÕES IMPORTANTES (TOP) */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="glass-card p-6 border-white/5 bg-dark-200/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Sparkles size={60} className="text-teal-400" />
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${myRegistration?.palestrasNoturnas ? 'bg-orange-500/10 border-orange-500/20' : 'bg-teal-500/10 border-teal-500/20'}`}>
                            {myRegistration?.palestrasNoturnas ? <Moon className="h-6 w-6 text-orange-400" /> : <Sun className="h-6 w-6 text-teal-400" />}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Status de Inscrição</p>
                            <h3 className="text-white font-black text-lg uppercase italic tracking-tight">
                                {myRegistration?.palestrasNoturnas ? 'EXPERIENCE PRO' : 'FREE MORNING'}
                            </h3>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-dark-300/50 rounded-xl border border-white/5">
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Pagamento</span>
                            <div className="flex flex-col items-end">
                                <Badge className={`${statusFinanceiro.color} px-3 py-1 text-[10px] font-black`}>
                                    {statusFinanceiro.label}
                                </Badge>
                                <span className="text-[8px] text-gray-600 font-bold uppercase mt-1">{statusFinanceiro.info}</span>
                            </div>
                        </div>
                        {myRegistration?.palestrasNoturnas && isActuallyPaid ? (
                            <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                                <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                                <p className="text-green-400 text-[10px] font-bold leading-tight">Acesso noturno e mentorias liberadas com sucesso!</p>
                            </div>
                        ) : myRegistration?.palestrasNoturnas ? (
                            <div className="flex items-center gap-2 p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                                <AlertCircle size={14} className="text-orange-400 shrink-0" />
                                <p className="text-orange-400 text-[10px] font-bold leading-tight">Aguardando confirmação financeira para liberar extras.</p>
                            </div>
                        ) : null}
                    </div>
                </Card>

                <Card className="glass-card p-6 border-white/5 bg-dark-200/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-teal-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-black text-xs uppercase tracking-widest italic">Dados Cadastrais</h4>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-white font-bold text-sm truncate uppercase">{myRegistration?.nome || user?.name}</p>
                        <p className="text-gray-500 text-xs truncate italic">{myRegistration?.email || user?.email}</p>
                        <p className="text-gray-500 text-xs mt-2 uppercase font-black tracking-widest">{selectedProject?.name || 'Growth Experience'}</p>
                    </div>
                </Card>
            </div>

            {/* UPGRADE AND EXTRA OPTIONS (IF NOT PRO) */}
            {!myRegistration?.palestrasNoturnas && (
                <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20 rounded-[2rem] relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1 text-center md:text-left">
                            <h4 className="text-orange-400 font-black text-xl mb-2 flex items-center justify-center md:justify-start gap-2 italic uppercase">
                                <Sparkles className="h-5 w-5" /> Turbine sua Experiência
                            </h4>
                            <p className="text-gray-400 text-xs leading-relaxed max-w-lg">
                                O seu ingresso <strong>Free Morning</strong> garante acesso apenas às palestras da manhã.
                                Faça o upgrade para <strong>Experience Pro</strong> e sinta o poder das sessões noturnas e mentorias 1-on-1.
                            </p>
                        </div>
                        <Button className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white font-black px-10 py-7 rounded-2xl shadow-glow-orange transition-all hover:scale-105 active:scale-95">
                            QUERO ME TORNAR PRO
                        </Button>
                    </div>
                    <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:scale-110 transition-transform">
                        <Moon className="h-32 w-32 text-orange-500" />
                    </div>
                </Card>
            )}

            {/* OPÇÕES DE INSCRIÇÃO / TICKET (BOTTOM) */}
            <div className="flex flex-col items-center gap-10 mt-6 pt-10 border-t border-white/5">
                <div className="text-center">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-8">Credencial de Acesso</h3>

                    <div className="relative w-full max-w-[340px] mx-auto">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-dark-400 rounded-b-2xl z-20 border-x border-b border-white/10 flex items-center justify-center">
                            <div className="w-8 h-1 bg-white/20 rounded-full"></div>
                        </div>

                        <div className="bg-gradient-to-b from-dark-200 to-dark-300 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden relative group p-1">
                            <div className="bg-dark-100 rounded-[2.2rem] overflow-hidden">
                                {/* Ticket Inner */}
                                <div className="p-8 pb-4 bg-gradient-to-br from-teal-500/10 to-orange-500/10 border-b border-white/5 text-center">
                                    <p className="text-[9px] text-teal-400 font-black uppercase tracking-widest mb-1">SUA CREDENCIAL</p>
                                    <p className="text-white font-mono text-base font-bold tracking-tighter uppercase">{myRegistration?.id?.slice(0, 13).toUpperCase() || 'GS2026-PENDENTE'}</p>
                                </div>
                                <div className="p-10 flex flex-col items-center bg-white">
                                    <div className="relative group">
                                        <div className="w-48 h-48">
                                            {myRegistration?.id ? (
                                                <QRCode
                                                    value={`GE-CHECKIN|${myRegistration.id}|${user?.email || ''}|${myRegistration.id}`}
                                                    size={192}
                                                    viewBox={`0 0 256 256`}
                                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                                />
                                            ) : (
                                                <QrCode className="h-full w-full text-gray-200" />
                                            )}
                                        </div>
                                        <div className="absolute inset-0 border-2 border-teal-500/10 rounded-xl group-hover:border-teal-500/30 transition-all pointer-events-none"></div>
                                    </div>
                                    <p className="mt-6 text-[8px] text-dark font-black uppercase tracking-[0.3em] opacity-40">Apresente para leitura no balcão</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 w-full max-w-sm">
                    <div className="flex flex-col gap-4 w-full">
                        <Button
                            className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black rounded-2xl px-8 w-full h-16 shadow-xl shadow-brand-orange-coral/20 transition-all hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center gap-1 border-none"
                            onClick={() => {
                                if (!myRegistration) {
                                    toast.error('Inscrição não localizada.');
                                    return;
                                }
                                setShowCheckInModal(true);
                            }}
                        >
                            <div className="flex items-center gap-2 uppercase text-[12px] tracking-widest">
                                <QrCode className="h-5 w-5" /> Confirmar Presença
                            </div>
                            <span className="text-[9px] opacity-70 font-bold uppercase tracking-widest">Aponte para o QR Code na sala</span>
                        </Button>

                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                            <Button
                                variant="ghost"
                                className="bg-teal-500/10 border border-teal-500/30 rounded-2xl hover:bg-teal-500/20 text-teal-400 transition-all flex-1 h-14 font-black uppercase text-[10px] tracking-widest"
                                onClick={() => {
                                    if (!myRegistration) {
                                        toast.error('Inscrição não localizada.');
                                        return;
                                    }
                                    setShowCheckInModal(true);
                                }}
                            >
                                <CheckCircle2 className="h-4 w-4 mr-2" /> Autocredenciamento
                            </Button>
                            <Button
                                variant="ghost"
                                className="bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 text-gray-400 hover:text-white transition-all flex-1 h-14 font-black uppercase text-[10px] tracking-widest"
                                onClick={async () => {
                                    if (!myRegistration) return;
                                    await generateTicketPDF(myRegistration, selectedProject?.name || 'Growth Summit');
                                    toast.success('Ingresso PDF gerado!');
                                }}
                            >
                                <Download className="h-4 w-4 mr-2 text-teal-400" /> Baixar PDF
                            </Button>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        className="w-full bg-[#00C4CC]/10 hover:bg-[#00C4CC]/20 border border-[#00C4CC]/30 hover:border-[#00C4CC]/50 text-[#00C4CC] font-black rounded-2xl h-14 transition-all hover:scale-[1.02] uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
                        onClick={() => window.open('https://www.canva.com/design/DAHDS-Bkw5w/hmucdo1Un_o-wOxW8zaZ9A/view?utm_content=DAHDS-Bkw5w&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', '_blank')}
                    >
                        <Sparkles className="h-4 w-4" /> Mostre aos seus amigos
                    </Button>
                </div>

                <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] max-w-xs text-center leading-relaxed">
                    Uso exclusivo para check-in. Válido conforme os termos do Growth Summit 2026.
                </p>
            </div>
        </div>
    );
}
