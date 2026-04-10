import { useState, useMemo } from 'react';
import type { RegistrationBatch } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Users, Mail, Building2, Copy, CheckCircle2, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardEquipeProps {
    batches: RegistrationBatch[];
}

export function DashboardEquipe({ batches }: DashboardEquipeProps) {
    const [copied, setCopied] = useState<string | null>(null);
    const [selectedBatch, setSelectedBatch] = useState<RegistrationBatch | null>(batches[0] || null);

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(code);
        toast.success('Código copiado para a área de transferência!');
        setTimeout(() => setCopied(null), 2000);
    };

    const handleSendNotification = (batch: RegistrationBatch) => {
        // In a real app this would call an Edge Function to trigger email/whatsapp sending
        // For now we simulate success
        toast.success(`Notificações automáticas ativadas para o lote da ${batch.nomeEmpresa}. Os participantes receberão o voucher e instruções por e-mail quando se registrarem.`);
    };

    if (!batches || batches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-dark-200/50 rounded-3xl border border-white/5 text-center">
                <Users className="h-16 w-16 text-gray-600 mb-6" />
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wide">Nenhum Lote Encontrado</h3>
                <p className="text-gray-500 max-w-sm">Você ainda não possui Lotes Empresariais (Corporate Pass) vinculados a este e-mail.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-dark-200/50 border border-teal-500/20 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-white italic tracking-tight mb-2 flex items-center gap-3">
                            <Building2 className="h-8 w-8 text-teal-400" /> Minhas Equipes
                        </h2>
                        <p className="text-gray-400 flex items-center gap-2">
                            Gerencie os Lotes Corporativos vinculados ao seu e-mail.
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {batches.map((batch) => {
                        const isSelected = selectedBatch?.id === batch.id;
                        return (
                            <div
                                key={batch.id}
                                onClick={() => setSelectedBatch(batch)}
                                className={`p-6 rounded-2xl border transition-all cursor-pointer ${isSelected
                                        ? 'bg-teal-500/10 border-teal-500/50 shadow-lg shadow-teal-500/10'
                                        : 'bg-dark-300/50 border-white/5 hover:border-teal-500/30'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-white leading-tight">{batch.nomeEmpresa}</h3>
                                    <Badge className={
                                        batch.statusPagamento === 'paid' ? 'bg-green-500/20 text-green-400' :
                                            batch.statusPagamento === 'pending' ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'
                                    }>
                                        {batch.statusPagamento.toUpperCase()}
                                    </Badge>
                                </div>

                                <div className="space-y-2 mt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400 uppercase font-black text-[10px] tracking-widest">Vagas Utilizadas</span>
                                        <span className="text-white font-bold">{batch.vagasUtilizadas} / {batch.quantidadeVagas}</span>
                                    </div>
                                    <div className="w-full bg-dark-400 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-teal-500 h-full rounded-full"
                                            style={{ width: `${Math.min(100, (batch.vagasUtilizadas / batch.quantidadeVagas) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {selectedBatch && (
                    <div className="mt-8 bg-dark-300/80 rounded-[2rem] p-8 border border-white/5">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                            <div className="space-y-6 flex-1">
                                <div>
                                    <h3 className="text-2xl font-black text-white italic tracking-tight">{selectedBatch.nomeEmpresa}</h3>
                                    <p className="text-gray-400 text-sm">Responsável: {selectedBatch.nomeResponsavel}</p>
                                </div>

                                <div className="bg-dark-400/50 rounded-xl p-6 border border-white/5 space-y-4">
                                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] mb-2">Voucher de Acesso da Equipe</p>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-dark-200 border border-teal-500/30 px-6 py-4 rounded-xl text-teal-400 font-black text-2xl tracking-widest flex-1 text-center font-mono">
                                            {selectedBatch.voucherCode}
                                        </div>
                                        <Button
                                            size="icon"
                                            onClick={() => handleCopyCode(selectedBatch.voucherCode)}
                                            className="bg-teal-500 hover:bg-teal-600 h-16 w-16 rounded-xl flex-shrink-0"
                                        >
                                            {copied === selectedBatch.voucherCode ? <CheckCircle2 className="h-6 w-6 text-white" /> : <Copy className="h-6 w-6 text-white" />}
                                        </Button>
                                    </div>
                                    <p className="text-gray-500 text-xs leading-relaxed">
                                        Compartilhe este código com os {selectedBatch.quantidadeVagas} membros da equipe. Eles deverão se inscrever na plataforma
                                        normalmente, e informar este código no momento do pagamento para zerar o valor ("Passe Completo").
                                    </p>
                                </div>
                            </div>

                            <div className="w-full md:w-80 space-y-4">
                                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5">
                                    <p className="text-orange-400 font-black text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Mail className="h-4 w-4" /> Distribuição Rápida
                                    </p>
                                    <p className="text-gray-400 text-xs mb-4">
                                        Podemos notificar os participantes adicionais caso você deseje uma automação corporativa.
                                    </p>
                                    <Button
                                        onClick={() => handleSendNotification(selectedBatch)}
                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold"
                                    >
                                        Habilitar Notificações Automáticas
                                    </Button>
                                </div>

                                <div className="bg-dark-400/50 rounded-xl p-5 border border-white/5">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-400 text-xs mb-1">Valor Total</span>
                                        <span className="text-white font-black text-lg">R$ {selectedBatch.valorTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-xs">Status do Pagamento</span>
                                        <Badge className={selectedBatch.statusPagamento === 'paid' ? "bg-green-500/20 text-green-400 border-none" : "bg-orange-500/20 text-orange-400 border-none"}>
                                            {selectedBatch.statusPagamento}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
