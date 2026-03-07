import { QrCode, Sparkles, Download, Moon, Sun, CreditCard, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';

interface TicketSectionProps {
    myRegistration: any;
    user: any;
    selectedProject: any;
    statusFinanceiro: any;
    generateTicketPDF: (reg: any, projectName: string) => Promise<void>;
    setShowCheckInModal: (show: boolean) => void;
}

export function TicketSection({
    myRegistration,
    user,
    selectedProject,
    statusFinanceiro,
    generateTicketPDF,
    setShowCheckInModal
}: TicketSectionProps) {
    return (
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Premium Apple Wallet Style Ticket */}
            <div className="flex flex-col items-center">
                <div className="w-full max-w-[340px] relative">
                    {/* Top Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-dark-400 rounded-b-2xl z-20 border-x border-b border-white/10 flex items-center justify-center">
                        <div className="w-8 h-1 bg-white/20 rounded-full"></div>
                    </div>

                    <div className="bg-gradient-to-b from-dark-200 to-dark-300 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden relative group">
                        {/* Header Area */}
                        <div className="p-8 pb-4 bg-gradient-to-br from-teal-500/10 to-orange-500/10 border-b border-white/5">
                            <div className="flex justify-between items-start mb-6 pt-4">
                                <div className="w-12 h-12 rounded-xl bg-dark-400 p-2 border border-white/10 shadow-inner">
                                    <img src="/logo-icon.png" alt="GS" className="w-full h-full object-contain opacity-50 grayscale contrast-125 invert" onError={(e) => (e.currentTarget.src = 'https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/gs-logo-icon.png')} />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-1">Growth Summit</p>
                                    <p className="text-white font-black text-xl italic leading-none">2026</p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[9px] text-gray-500 uppercase font-black tracking-[0.2em]">Nome do Participante</p>
                                <h3 className="text-white font-black text-lg truncate uppercase">{myRegistration?.nome || user?.name || 'Visitante'}</h3>
                            </div>
                        </div>

                        {/* Middle Perforation Style */}
                        <div className="relative h-6 bg-dark-250 flex items-center">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-6 h-6 rounded-full bg-dark-400 border border-white/10"></div>
                            <div className="w-full border-t-2 border-dashed border-white/5 mx-6"></div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-6 h-6 rounded-full bg-dark-400 border border-white/10"></div>
                        </div>

                        {/* QR Code Section */}
                        <div className="p-8 pt-4 flex flex-col items-center">
                            <div className="bg-white p-4 rounded-[1.5rem] shadow-2xl relative mb-6">
                                <div className="w-40 h-40">
                                    {myRegistration?.id ? (
                                        <QRCode
                                            value={`GE-CHECKIN|${myRegistration.id}|${user?.email || ''}|${myRegistration.id}`}
                                            size={160}
                                            viewBox={`0 0 256 256`}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        />
                                    ) : (
                                        <QrCode className="h-full w-full text-gray-200" />
                                    )}
                                </div>
                                {/* Scanner guide lines */}
                                <div className="absolute inset-0 border-2 border-teal-500/20 rounded-[1.5rem] animate-pulse"></div>
                            </div>

                            <div className="text-center space-y-1 mb-6">
                                <p className="text-gray-600 text-[10px] uppercase font-black tracking-widest">Protocolo Digital</p>
                                <p className="text-white font-mono text-lg font-bold">
                                    {myRegistration?.id?.slice(0, 13).toUpperCase() || 'GS2026-PENDENTE'}
                                </p>
                            </div>

                            {/* Status Tags inside Ticket */}
                            <div className="flex gap-2 mb-2">
                                <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase ${myRegistration?.palestrasNoturnas ? 'bg-orange-500/20 text-orange-400' : 'bg-teal-500/20 text-teal-400'}`}>
                                    {myRegistration?.palestrasNoturnas ? 'Experience Pro' : 'Free Morning'}
                                </div>
                                <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase ${statusFinanceiro.label === 'Confirmado' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                    {statusFinanceiro.label === 'Confirmado' ? 'Validado' : 'Pendente'}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Glow */}
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-teal-500/20 blur-3xl rounded-full group-hover:bg-teal-500/30 transition-all duration-700"></div>
                        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-orange-500/20 blur-3xl rounded-full group-hover:bg-orange-500/30 transition-all duration-700"></div>
                    </div>

                    {/* Action Buttons Shadowy layer */}
                    <div className="flex gap-3 mt-8 w-full">
                        <Button
                            variant="outline"
                            className="bg-dark-300 border-white/10 rounded-2xl hover:bg-dark-200 hover:text-teal-400 transition-all flex-1 h-12 font-bold"
                            onClick={async () => {
                                if (!myRegistration) return;
                                await generateTicketPDF(myRegistration, selectedProject?.name || 'Growth Summit');
                                toast.success('Ingresso PDF gerado!');
                            }}
                        >
                            <Download className="h-4 w-4 mr-2" /> PDF
                        </Button>
                        <Button
                            className="bg-teal-500 hover:bg-teal-400 text-white font-black rounded-2xl px-8 flex-1 h-12 shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02]"
                            onClick={() => {
                                if (!myRegistration) {
                                    toast.error('Nenhuma inscrição encontrada.');
                                    return;
                                }
                                setShowCheckInModal(true);
                            }}
                        >
                            <QrCode className="h-4 w-4 mr-2" /> VALIDAR
                        </Button>
                    </div>
                </div>
            </div>

            {/* Info Column */}
            <div className="space-y-6">
                <div className="glass-card p-8 border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Sparkles className="h-16 w-16 text-teal-500" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-8 border-b border-white/5 pb-4 flex items-center">
                        <Badge className="bg-teal-500 text-white border-none mr-3 h-6 w-6 rounded-full flex items-center justify-center p-0">1</Badge>
                        Status da Sua Inscrição
                    </h3>

                    <div className="space-y-4">
                        {/* Tipo */}
                        <div className="flex justify-between items-center p-4 bg-dark-100/50 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3 text-gray-400 text-sm">
                                <div className={`p-2 rounded-lg ${myRegistration?.palestrasNoturnas ? 'bg-orange-500/10' : 'bg-teal-500/10'}`}>
                                    {myRegistration?.palestrasNoturnas ? <Moon className="h-4 w-4 text-orange-400" /> : <Sun className="h-4 w-4 text-teal-400" />}
                                </div>
                                Tipo de Acesso
                            </div>
                            <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20 uppercase text-[10px] font-black px-3 py-1">
                                {myRegistration?.palestrasNoturnas ? 'Experience Pro' : 'Free Morning'}
                            </Badge>
                        </div>

                        {/* Status Financeiro */}
                        <div className="flex justify-between items-center p-4 bg-dark-100/50 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3 text-gray-400 text-sm">
                                <div className="p-2 rounded-lg bg-teal-500/10">
                                    <CreditCard className="h-4 w-4 text-teal-400" />
                                </div>
                                Pagamento
                            </div>
                            <div className="flex flex-col items-end gap-0.5">
                                <Badge className={`${statusFinanceiro.color} px-3 py-1 text-[10px]`}>
                                    {statusFinanceiro.label}
                                </Badge>
                                <span className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">{statusFinanceiro.info}</span>
                            </div>
                        </div>

                        {/* Palestras Noturnas Logic */}
                        {myRegistration?.palestrasNoturnas ? (
                            <div className="p-4 bg-green-500/5 rounded-2xl border border-green-500/10 mt-6">
                                <p className="text-green-400 text-xs font-bold leading-relaxed">
                                    ✅ Seu acesso PRO está ativo! Você tem entrada liberada nas palestras noturnas e agendamento de mentorias.
                                </p>
                            </div>
                        ) : (
                            <div className="p-6 bg-orange-500/5 rounded-2xl border border-orange-500/10 mt-6 relative overflow-hidden group">
                                <div className="relative z-10">
                                    <h4 className="text-orange-400 font-bold mb-2 flex items-center gap-2">
                                        <Sparkles className="h-4 w-4" /> Quer mais networking?
                                    </h4>
                                    <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                                        O seu ingresso atual é <strong>Free Morning</strong> (palestras da manhã).
                                        Faça o upgrade para <strong>Experience Pro</strong> e libere as 2 palestras noturnas + mentorias exclusivas com executivos.
                                    </p>
                                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-5 rounded-xl">
                                        QUERO ME TORNAR PRO
                                    </Button>
                                </div>
                                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                                    <Moon className="h-24 w-24 text-orange-500" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
