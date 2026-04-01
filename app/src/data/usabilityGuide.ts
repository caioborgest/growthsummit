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
        title: 'Manual do Administrador (Mestre)',
        description: 'Manual de controle total da plataforma, gestão de projetos e auditoria financeira avançada.',
        modules: [
            {
                id: 'gestao-projetos',
                name: 'Gestão Multi-Evento',
                steps: [
                    {
                        title: 'Alternando Projetos',
                        description: 'Utilize o seletor no topo da sidebar para gerenciar Summit vs Growth Experience. Cada projeto tem seu próprio banco de dados e finanças.',
                        tip: 'Certifique-se de que o projeto correto está selecionado antes de emitir relatórios ou certificados.'
                    }
                ]
            },
            {
                id: 'controle-financeiro',
                name: 'Auditoria de Vendas',
                steps: [
                    {
                        title: 'Gestão de Receita Real',
                        description: 'Acompanhe faturamento bruto, líquido e taxas de gateway diretamente no módulo Financeiro.',
                        tip: 'Os dados são consolidados em tempo real via webhooks com Stripe/Pagarme.'
                    }
                ]
            }
        ]
    },
    {
        role: 'staff',
        title: 'Guia Operacional (Staff)',
        description: 'Instruções críticas para o dia do evento: credenciamento, suporte e operação de fluxo.',
        modules: [
            {
                id: 'credenciamento-qr',
                name: 'Check-in e Credenciamento',
                steps: [
                    {
                        title: 'Operando o Scanner',
                        description: 'Acesse Operação > Check-in Digital. Aponte a câmera para o QR Code do participante ou pesquise pelo nome/CPF.',
                        tip: 'Mantenha o brilho do seu celular alto e peça para o participante fazer o mesmo.'
                    },
                    {
                        title: 'Status de Inscrição',
                        description: 'Verifique se a inscrição aparece como "Paga". Se estiver "Pendente", o participante deve ser direcionado ao balcão de suporte financeiro.',
                        tip: 'O sistema registra qual operador fez o check-in para fins de auditoria.'
                    }
                ]
            },
            {
                id: 'resolucao-problemas',
                name: 'Protocolos de Suporte',
                steps: [
                    {
                        title: 'Certificados e Acesso',
                        description: 'Se um participante não conseguir acessar, verifique o e-mail cadastrado em "Base de Participantes". Erros de digitação no e-mail são a causa número 1 de problemas.',
                        tip: 'Você pode editar o e-mail do participante e reenviar o link de acesso na hora.'
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
    },
    {
        role: 'sponsor',
        title: 'Guia do Patrocinador',
        description: 'Manual para gerir seus benefícios, ingressos VIP e visibilidade de marca.',
        modules: [
            {
                id: 'ingressos-vip',
                name: 'Gestão de Convidados',
                steps: [
                    {
                        title: 'Liberando Acessos',
                        description: 'Na aba "Ingressos", você pode gerar códigos únicos para seus convidados VIP e colaboradores.',
                        tip: 'Monitore quem já ativou o ingresso em tempo real pelo dashboard.'
                    }
                ]
            },
            {
                id: 'branding-visibilidade',
                name: 'Marca e Ativação',
                steps: [
                    {
                        title: 'Upload de Materiais',
                        description: 'Envie sua logo em alta resolução para ser exibida nos telões e materiais impressos do evento.',
                        tip: 'O formato ideal é PNG com fundo transparente ou SVG.'
                    }
                ]
            }
        ]
    }
];
