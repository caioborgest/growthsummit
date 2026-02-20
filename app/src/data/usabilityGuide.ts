export interface GuideStep {
    title: string;
    description: string;
    tip?: string;
}

export interface ModuleGuide {
    id: string;
    name: string;
    steps: GuideStep[];
}

export interface RoleGuide {
    role: string;
    title: string;
    description: string;
    modules: ModuleGuide[];
}

export const usabilityGuide: RoleGuide[] = [
    {
        role: 'admin',
        title: 'Guia do Administrador (Super Admin)',
        description: 'Manual mestre para controle total da plataforma, gestão de projetos e auditoria financeira.',
        modules: [
            {
                id: 'projetos',
                name: 'Gestão de Projetos',
                steps: [
                    {
                        title: 'Modo Multi-Evento',
                        description: 'A plataforma suporta múltiplos eventos simultâneos. Use o seletor no topo da sidebar para alternar entre Summit e Growth Experience.',
                        tip: 'As métricas do dashboard são filtradas automaticamente pelo projeto selecionado.'
                    },
                    {
                        title: 'Configurações de Ingressos',
                        description: 'Em Projetos > Editar, você define os lotes e preços individuais para Standard, Pro e VIP.',
                        tip: 'Certifique-se de definir um limite de inscrições para evitar overbooking.'
                    }
                ]
            },
            {
                id: 'financeiro-admin',
                name: 'Gestão Financeira',
                steps: [
                    {
                        title: 'Acompanhamento de Receita',
                        description: 'Acesse o módulo Financeiro para visualizar faturamento bruto, descontos aplicados e ticket médio por categoria.',
                        tip: 'Os dados são sincronizados em tempo real com os gateways de pagamento (Stripe/Pagarme).'
                    }
                ]
            },
            {
                id: 'comunicacao',
                name: 'Automações e WhatsApp',
                steps: [
                    {
                        title: 'Grupos Automáticos',
                        description: 'Configure links de grupos para cada tipo de ingresso. O sistema convida o participante via WhatsApp assim que o pagamento é confirmado.',
                        tip: 'Mantenha o recurso de "Auto-convite" ativado para aumentar a taxa de engajamento.'
                    }
                ]
            }
        ]
    },
    {
        role: 'participant',
        title: 'Guia do Participante',
        description: 'Tudo o que você precisa para aproveitar palestras, networking e garantir seu certificado.',
        modules: [
            {
                id: 'ingresso-pwa',
                name: 'Seu Ingresso Digital',
                steps: [
                    {
                        title: 'Check-in via QR Code',
                        description: 'Seu QR Code está disponível na tela inicial. Apresente-o na entrada para validação instantânea.',
                        tip: 'Instale o PWA no seu celular para acessar o ingresso mesmo sem internet estável.'
                    }
                ]
            },
            {
                id: 'networking-area',
                name: 'Networking e Mentoria',
                steps: [
                    {
                        title: 'Agendando Especialistas',
                        description: 'Se o seu ingresso incluir mentorias, acesse a aba "Mentorias" e escolha um horário disponível com os especialistas.',
                        tip: 'Prepare suas perguntas com antecedência, cada sessão dura precisamente 25 minutos.'
                    }
                ]
            }
        ]
    },
    {
        role: 'mentor',
        title: 'Guia do Mentor',
        description: 'Instruções para guiar participantes e registrar resultados práticos das sessões.',
        modules: [
            {
                id: 'gestao-agenda',
                name: 'Sua Agenda de Mentor',
                steps: [
                    {
                        title: 'Aceitando Mentorias',
                        description: 'Veja todos os participantes que solicitaram seu tempo. Você pode ver o perfil e o desafio da startup antes da reunião.',
                        tip: 'Mude seu status para "Indisponível" se precisar de pausas durante o evento.'
                    }
                ]
            },
            {
                id: 'feedback-entrega',
                name: 'Os 3 Passos Práticos',
                steps: [
                    {
                        title: 'Registro de Output',
                        description: 'Ao final da mentoria, você deve registrar 3 ações claras para o mentorado executar.',
                        tip: 'Este conteúdo será enviado automaticamente para o email do participante como um Plano de Ação.'
                    }
                ]
            }
        ]
    },
    {
        role: 'company',
        title: 'Guia B2B / Empresa',
        description: 'Manual estratégico para a Rodada de Negócios e Matchmaking.',
        modules: [
            {
                id: 'b2b-discovery',
                name: 'Rodada de Negócios',
                steps: [
                    {
                        title: 'Discovery e Swiping',
                        description: 'Utilize a ferramenta de Discovery para ver empresas parceiras. Dê "Like" para solicitar uma reunião.',
                        tip: 'Quanto mais completo seu perfil B2B, maiores as chances de receber "Likes" de volta.'
                    },
                    {
                        title: 'Gestão de Reuniões',
                        description: 'Quando houver um Match, o sistema agenda automaticamente uma mesa e horário para a negociação.',
                        tip: 'Cada reunião tem 15 minutos. Foco total em proposta de valor e próximos passos.'
                    }
                ]
            }
        ]
    },
    {
        role: 'startup',
        title: 'Guia da Startup',
        description: 'Como brilhar na Arena Pitch e conectar-se com investidores.',
        modules: [
            {
                id: 'pitch-arena',
                name: 'Arena Pitch',
                steps: [
                    {
                        title: 'Preparação do Pitch',
                        description: 'Verifique seu horário de apresentação na aba "Arena Pitch". O tempo é rigorosamente controlado.',
                        tip: 'Investidores terão acesso ao seu deck de slides através da plataforma durante a fala.'
                    }
                ]
            }
        ]
    }
];
