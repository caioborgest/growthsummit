import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Copy,
    CheckCircle,
    Smartphone,
    MessageCircle,
    ArrowRight,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useProject } from '@/contexts/ProjectContext';
import { EVENT_CONFIG } from '@/config/eventConfig';
import type { DadosInscricao } from './inscricaoTypes';

interface Step5PagamentoPixProps {
    dados: DadosInscricao;
    onContinuar: () => void;
}

export function Step5PagamentoPix({ dados, onContinuar }: Step5PagamentoPixProps) {
    const { selectedProject } = useProject();
    const [copied, setCopied] = useState(false);

    // Configurações do PIX (centralizadas no EVENT_CONFIG)
    const cnpj = EVENT_CONFIG.pix.cnpj;
    const merchantName = EVENT_CONFIG.pix.beneficiario;

    // Cálculo do valor
    const valorOriginal = 179.99;
    const descontoEfetivo = dados.descontoPalestra !== undefined ? dados.descontoPalestra : (dados.descontoSocial || 0);
    const valorFinal = valorOriginal * (1 - descontoEfetivo / 100);
    const valorFormatado = valorFinal.toFixed(2);

    const handleCopy = () => {
        navigator.clipboard.writeText(cnpj);
        setCopied(true);
        toast.success("CNPJ copiado!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsApp = () => {
        const phoneInfo = `\n• *Telefone:* ${dados.telefone}`;
        const cupomInfo = dados.cupomPalestra ? `\n• *Cupom:* ${dados.cupomPalestra}` : '';

        const mensagem = encodeURIComponent(
            `🚀 *COMPROVANTE DE PAGAMENTO - GROWTH EXPERIENCE*\n\n` +
            `Olá! Acabo de realizar o pagamento do meu upgrade para o *Passaporte Night*.\n\n` +
            `*DADOS DO PARTICIPANTE:*\n` +
            `• *Nome:* ${dados.nome}${phoneInfo}${cupomInfo}\n` +
            `• *Evento:* ${selectedProject?.name || 'Growth Experience'}\n` +
            `• *Valor Pago:* R$ ${valorFormatado}\n\n` +
            `_Estou enviando o comprovante em anexo abaixo._`
        );

        window.open(`https://wa.me/${EVENT_CONFIG.whatsapp.number}?text=${mensagem}`, '_blank');
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center">
                <Badge className="mb-3 bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/30 px-3 py-1">
                    ETAPA DE PAGAMENTO
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
                    Finalize seu <span className="text-brand-orange-coral">Passaporte Night</span>
                </h3>
                <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto">
                    Copie o CNPJ abaixo para realizar o pagamento via PIX no aplicativo do seu banco.
                </p>
            </div>

            {/* Pix Container */}
            <Card className="glass-card p-6 border-white/10 relative overflow-hidden bg-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange-coral/5 rounded-full -mr-16 -mt-16 blur-3xl" />

                <div className="space-y-6 relative z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="space-y-1 text-center sm:text-left">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Valor do Upgrade</p>
                            <p className="text-4xl font-black text-white">
                                R$ <span className="text-brand-orange-coral">{valorFormatado.replace('.', ',')}</span>
                            </p>
                            {descontoEfetivo > 0 && (
                                <Badge className="bg-green-500/10 text-green-500 border-none px-2 py-0 text-[10px]">
                                    {descontoEfetivo}% de desconto aplicado
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Favorecido</p>
                            <div className="p-3 rounded-xl bg-dark-200/50 border border-white/5 h-full flex flex-col justify-center">
                                <p className="text-sm font-bold text-white uppercase">{merchantName}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Banco PJ</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Chave PIX (CNPJ)</p>
                            <div className="flex items-center gap-2 bg-dark-300/50 p-1.5 rounded-xl border border-white/5 group hover:border-brand-orange-coral/30 transition-all">
                                <code className="text-white font-mono text-base font-bold flex-1 text-center py-2">
                                    {cnpj}
                                </code>
                                <Button
                                    size="sm"
                                    onClick={handleCopy}
                                    className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white px-4 h-10 font-bold rounded-lg shadow-lg"
                                >
                                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Instruction Alert */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-brand-orange-coral/5 border border-brand-orange-coral/10">
                <AlertCircle className="h-5 w-5 text-brand-orange-coral flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                    <p className="text-sm text-gray-300 leading-relaxed">
                        Após realizar o pagamento, você <strong className="text-white">precisa enviar o comprovante</strong> pelo WhatsApp para liberação imediata do seu acesso Pro.
                    </p>
                </div>
            </div>

            {/* Botões de Ação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <Button
                    size="lg"
                    onClick={handleWhatsApp}
                    className="h-16 bg-green-600 hover:bg-green-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-green-500/20 group"
                >
                    <MessageCircle className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
                    Enviar Comprovante
                </Button>

                <Button
                    size="lg"
                    onClick={onContinuar}
                    className="h-16 bg-white hover:bg-dark-100 text-dark hover:text-white font-black text-lg rounded-2xl transition-all group"
                >
                    Avançar Etapa
                    <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>

            <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                Ao clicar em avançar, você prossegue para a área de instalação do app.
            </p>
        </div>
    );
}
