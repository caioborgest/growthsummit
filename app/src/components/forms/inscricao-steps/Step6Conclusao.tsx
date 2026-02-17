import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Home, Smartphone, Mail } from 'lucide-react';
import type { DadosInscricao } from './inscricaoTypes';

interface Step6ConclusaoProps {
    dados: DadosInscricao;
    onFechar: () => void;
}

export function Step6Conclusao({ dados, onFechar }: Step6ConclusaoProps) {
    return (
        <div className="text-center space-y-6">
            {/* Icon Sucesso */}
            <div className="relative w-24 h-24 mx-auto animate-float">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-full h-full bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-500/30">
                    <CheckCircle className="h-12 w-12" />
                </div>
            </div>

            {/* Título */}
            <div>
                <h3 className="text-3xl font-bold text-white mb-2">
                    Inscrição Confirmada!
                </h3>
                <p className="text-gray-400 text-lg max-w-xl mx-auto">
                    Parabéns, <span className="text-white font-semibold">{dados.nome}</span>! Sua vaga no Growth Experience Triunfo-PE 2026 está garantida.
                </p>
            </div>

            {/* Card de Resumo */}
            <Card className="glass-card p-6 border-white/10 max-w-2xl mx-auto text-left">
                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-brand-orange-coral" />
                    Verifique seu Email
                </h4>
                <div className="space-y-4 text-sm text-gray-300">
                    <p>
                        Enviamos uma confirmação para <strong className="text-white">{dados.email}</strong> com:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                        <li>Sua credencial digital</li>
                        <li>Link de acesso rápido ao app</li>
                        <li>Detalhes dos cursos selecionados</li>
                        {dados.comprarPalestras && (
                            <li>Informações sobre as palestras noturnas</li>
                        )}
                    </ul>
                    <p className="text-xs text-gray-500 mt-2">
                        Caso não encontre, verifique sua caixa de spam ou promoções.
                    </p>
                </div>
            </Card>

            {/* Próximos Passos */}
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <Card className="p-4 bg-dark-200/50 border-white/10 flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-full bg-brand-orange-coral/20 flex items-center justify-center flex-shrink-0 text-brand-orange-coral font-bold">
                        1
                    </div>
                    <div>
                        <h5 className="font-semibold text-white">Acesse o App</h5>
                        <p className="text-xs text-gray-400">Use seu email e senha cadastrados</p>
                    </div>
                </Card>

                <Card className="p-4 bg-dark-200/50 border-white/10 flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-full bg-brand-orange-coral/20 flex items-center justify-center flex-shrink-0 text-brand-orange-coral font-bold">
                        2
                    </div>
                    <div>
                        <h5 className="font-semibold text-white">Monte sua Agenda</h5>
                        <p className="text-xs text-gray-400">Favorite palestras e cursos</p>
                    </div>
                </Card>
            </div>

            {/* Botões Finais */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mt-8">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={onFechar}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                    <Home className="h-5 w-5 mr-2" />
                    Voltar ao Início
                </Button>
                <Button
                    size="lg"
                    onClick={() => {
                        onFechar();
                        // Redirecionar para app ou dashboard se necessário
                        window.location.href = '/app';
                    }}
                    className="flex-1 bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient hover:from-brand-orange-intense hover:to-brand-orange-coral text-white font-bold shadow-lg"
                >
                    <Smartphone className="h-5 w-5 mr-2" />
                    Acessar App Agora
                </Button>
            </div>
        </div>
    );
}
