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
            <div className="px-4">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
                    Inscrição Confirmada!
                </h3>
                <p className="text-gray-400 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
                    Parabéns, <span className="text-white font-semibold">{dados.nome}</span>! Sua vaga no Growth Experience Triunfo-PE 2026 está garantida.
                </p>
            </div>

            {/* Card de Resumo */}
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
                        <h5 className="font-semibold text-white text-sm sm:text-base">Monte sua Agenda</h5>
                        <p className="text-[10px] sm:text-xs text-gray-400">Favorite palestras e cursos</p>
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
                <Button
                    size="lg"
                    onClick={() => {
                        onFechar();
                        // Redirecionar para dashboard ou home
                        window.location.href = '/minha-area';
                    }}
                    className="flex-1 bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient hover:from-brand-orange-intense hover:to-brand-orange-coral text-white font-bold shadow-lg h-12 sm:h-14"
                >
                    <Smartphone className="h-5 w-5 mr-2" />
                    Acessar App Agora
                </Button>
            </div>
        </div>
    );
}
