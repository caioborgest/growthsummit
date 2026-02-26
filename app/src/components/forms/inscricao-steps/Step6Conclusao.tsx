import { useProject } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Home, Smartphone, Mail, AlertCircle, Copy, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import type { DadosInscricao } from './inscricaoTypes';

interface Step6ConclusaoProps {
    dados: DadosInscricao;
    onFechar: () => void;
}

export function Step6Conclusao({ dados, onFechar }: Step6ConclusaoProps) {
    const { selectedProject } = useProject();
    const [copied, setCopied] = useState(false);

    // Check if payment is pending (standard logic from Step 3/4)
    const isPending = dados.comprarPalestras && dados.statusPagamento !== 'pago';
    const pixKey = "financeiro@growthsummit.site"; // Placeholder Pix Key

    const handleCopyPix = () => {
        navigator.clipboard.writeText(pixKey);
        setCopied(true);
        toast.success('Chave Pix copiada!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="text-center space-y-6">
            {/* Icon Sucesso / Pendência */}
            <div className="relative w-24 h-24 mx-auto animate-float">
                <div className={`absolute inset-0 ${isPending ? 'bg-orange-500/20' : 'bg-green-500/20'} rounded-full blur-2xl animate-pulse`} />
                <div className={`relative w-full h-full bg-gradient-to-br ${isPending ? 'from-orange-500 to-orange-700' : 'from-green-500 to-green-700'} rounded-full flex items-center justify-center text-white shadow-xl ${isPending ? 'shadow-orange-500/30' : 'shadow-green-500/30'}`}>
                    {isPending ? <AlertCircle className="h-12 w-12" /> : <CheckCircle className="h-12 w-12" />}
                </div>
            </div>

            {/* Título */}
            <div className="px-4">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
                    {isPending ? 'Quase lá! Falta o Pagamento' : 'Inscrição Confirmada!'}
                </h3>
                <p className="text-gray-400 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
                    {isPending ? (
                        <>Sua pré-inscrição em <span className="text-white font-semibold">{selectedProject?.name}</span> foi realizada. Realize o pagamento via Pix para liberar seu acesso Pro.</>
                    ) : (
                        <>Parabéns, <span className="text-white font-semibold">{dados.nome}</span>! Sua vaga no <span className="text-white font-semibold">{selectedProject?.name || 'evento'}</span> está garantida.</>
                    )}
                </p>
            </div>

            {isPending ? (
                /* Card de Pix */
                <Card className="glass-card p-6 border-orange-500/30 max-w-2xl mx-auto text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />

                    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start relative z-10">
                        <div className="bg-white p-3 rounded-2xl flex-shrink-0 shadow-lg">
                            {/* Mock QR Code */}
                            <div className="w-32 h-32 bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                                <span className="text-xs text-gray-400 font-bold text-center">QR CODE PIX<br />(Simulado)</span>
                            </div>
                        </div>

                        <div className="space-y-4 flex-1">
                            <div>
                                <h4 className="font-bold text-white text-lg">Pagamento via Pix</h4>
                                <p className="text-gray-400 text-sm">Valor: <strong className="text-orange-400 text-xl">R$ 179,90</strong></p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Chave Pix (E-mail)</p>
                                <div className="flex items-center gap-2 bg-dark-300/50 p-3 rounded-xl border border-white/5">
                                    <code className="text-orange-300 font-mono text-sm flex-1 truncate">{pixKey}</code>
                                    {isPending && (
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={handleCopyPix}
                                            className="h-8 w-8 hover:bg-orange-500/20 text-orange-400"
                                        >
                                            {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <p className="text-[10px] text-gray-500">Após o pagamento, nosso time confirmará seu acesso em até 24h. Envie o comprovante para agilizar.</p>
                        </div>
                    </div>
                </Card>
            ) : (
                /* Card de Resumo Original */
                <Card className="glass-card p-4 sm:p-6 border-white/10 max-w-2xl mx-auto text-left mx-4 sm:mx-auto">
                    <h4 className="font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                        <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-brand-orange-coral" />
                        Verifique seu Email
                    </h4>
                    <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-300">
                        <p>
                            Enviamos uma confirmação para <strong className="text-white">{dados.email}</strong> com:
                        </p>
                        <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 ml-2">
                            <li>Sua credencial digital</li>
                            <li>Link de acesso rápido ao app</li>
                            <li>Detalhes dos cursos selecionados</li>
                            {dados.comprarPalestras && (
                                <li>Informações sobre as palestras noturnas</li>
                            )}
                        </ul>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
                            Caso não encontre, verifique sua caixa de spam ou promoções.
                        </p>
                    </div>
                </Card>
            )}

            {/* Próximos Passos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto px-4 sm:px-0">
                <Card className="p-3 sm:p-4 bg-dark-200/50 border-white/10 flex items-center gap-3 sm:gap-4 text-left">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-orange-coral/20 flex items-center justify-center flex-shrink-0 text-brand-orange-coral font-bold text-sm sm:text-base">
                        1
                    </div>
                    <div>
                        <h5 className="font-semibold text-white text-sm sm:text-base">Acesse o App</h5>
                        <p className="text-[10px] sm:text-xs text-gray-400">Use seu email e senha cadastrados</p>
                    </div>
                </Card>

                <Card className="p-3 sm:p-4 bg-dark-200/50 border-white/10 flex items-center gap-3 sm:gap-4 text-left">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-orange-coral/20 flex items-center justify-center flex-shrink-0 text-brand-orange-coral font-bold text-sm sm:text-base">
                        2
                    </div>
                    <div>
                        <h5 className="font-semibold text-white text-sm sm:text-base">
                            {isPending ? 'Aguarde Confirmação' : 'Monte sua Agenda'}
                        </h5>
                        <p className="text-[10px] sm:text-xs text-gray-400">
                            {isPending ? 'Liberaremos seu acesso Pro em breve' : 'Favorite palestras e cursos'}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Botões Finais */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-2xl mx-auto mt-6 sm:mt-8 px-4 sm:px-0">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={onFechar}
                    className="flex-1 border-white/20 text-white hover:bg-white/10 h-12 sm:h-14"
                >
                    <Home className="h-5 w-5 mr-2" />
                    Voltar ao Início
                </Button>
                {isPending ? (
                    <Button
                        size="lg"
                        onClick={() => {
                            const mensagem = encodeURIComponent(
                                `*Comprovante de Pagamento - Growth Experience*\n\n` +
                                `Olá! Estou enviando o comprovante da minha inscrição.\n\n` +
                                `*Dados:* \n` +
                                `• *Nome:* ${dados.nome}\n` +
                                `• *Email:* ${dados.email}\n` +
                                `• *Evento:* ${selectedProject?.name || 'Growth Experience'}\n` +
                                `• *Tipo:* Palestra Noturna / Upgrade`
                            );
                            window.open(`https://wa.me/5588988432310?text=${mensagem}`, '_blank');
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg h-12 sm:h-14"
                    >
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Enviar Comprovante
                    </Button>
                ) : (
                    <Button
                        size="lg"
                        onClick={() => {
                            onFechar();
                            window.location.href = '/minha-area';
                        }}
                        className="flex-1 bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient hover:from-brand-orange-intense hover:to-brand-orange-coral text-white font-bold shadow-lg h-12 sm:h-14"
                    >
                        <Smartphone className="h-5 w-5 mr-2" />
                        Acessar App Agora
                    </Button>
                )}
            </div>
        </div>
    );
}
