export interface GuideStep {
    title: string;
    description: string;
    image?: string;
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
        description: 'Manual completo para gestão da plataforma Growth Summit.',
        modules: [
            {
                id: 'projetos',
                name: 'Gestão de Projetos',
                steps: [
                    {
                        title: 'Visualizar Projetos',
                        description: 'No menu lateral, clique em "Projetos" para ver todas as edições do evento (Summit, GE Triunfo, etc.).'
                    },
                    {
                        title: 'Selecionar Projeto Ativo',
                        description: 'Para gerenciar os dados de um evento específico, você deve selecioná-lo no seletor do topo da barra lateral. Todas as métricas e listas mudarão para o contexto do projeto escolhido.'
                    },
                    {
                        title: 'Configurações de Metas',
                        description: 'Ao editar um projeto, defina o número máximo de inscritos, mentores e preços dos ingressos. Isso alimentará as barras de progresso do seu Dashboard.'
                    }
                ]
            },
            {
                id: 'b2b-admin',
                name: 'Rodada de Negócios (B2B)',
                steps: [
                    {
                        title: 'Gerar Agenda Automática',
                        description: 'Quando houver matches (likes mútuos) entre empresas, use o botão "Gerar Agenda Automática" na aba de Matches. O sistema criará horários de 15 minutos para cada par.'
                    },
                    {
                        title: 'Gestão de Mesas',
                        description: 'Você pode monitorar quais empresas estão em qual mesa e o nível de interesse gerado em cada reunião.'
                    }
                ]
            },
            {
                id: 'comunicacao-automatica',
                name: 'Automação WhatsApp',
                steps: [
                    {
                        title: 'Configurar Grupos',
                        description: 'Vá em "Grupos WhatsApp" para configurar os links de convite. Você pode ativar o "Auto-convite" para que o usuário receba o link assim que a inscrição for paga.'
                    }
                ]
            }
        ]
    },
    {
        role: 'participant',
        title: 'Guia do Participante',
        description: 'Como aproveitar ao máximo o evento e sua área logada.',
        modules: [
            {
                id: 'ingresso',
                name: 'Ingresso e Check-in',
                steps: [
                    {
                        title: 'Meu Ingresso',
                        description: 'No Dashboard, você encontrará seu QR Code. Ele é essencial para o check-in rápido na entrada do evento.'
                    },
                    {
                        title: 'PWA / App Móvel',
                        description: 'Instale a plataforma como aplicativo no seu celular (PWA) para receber notificações em tempo real e acessar sua agenda offline.'
                    }
                ]
            },
            {
                id: 'agenda-pessoal',
                name: 'Agenda e Mentorias',
                steps: [
                    {
                        title: 'Reservar Lugar',
                        description: 'Na aba "Programação", adicione as palestras que deseja assistir à sua agenda pessoal.'
                    },
                    {
                        title: 'Agendar Mentoria',
                        description: 'Se o seu ingresso permitir, escolha um mentor disponível e agende um horário 1:1 de 25 minutos.'
                    }
                ]
            }
        ]
    },
    {
        role: 'mentor',
        title: 'Guia do Mentor',
        description: 'Manual para gestão de sessões de mentoria estratégica.',
        modules: [
            {
                id: 'perfil-mentor',
                name: 'Perfil e Visibilidade',
                steps: [
                    {
                        title: 'Dados Bio e Foto',
                        description: 'Mantenha sua bio atualizada. Ela é o principal critério que os participantes usam para escolher você.'
                    },
                    {
                        title: 'Disponibilidade',
                        description: 'Defina os blocos de horários em que você estará disponível durante o evento.'
                    }
                ]
            },
            {
                id: 'sessao-mentoria',
                name: 'Durante a Mentoria',
                steps: [
                    {
                        title: 'Os 3 Passos (Output)',
                        description: 'Ao final de cada sessão, é obrigatório preencher 3 passos práticos para o mentorado. Isso garante que a mentoria gere resultados imediatos.'
                    }
                ]
            }
        ]
    },
    {
        role: 'company',
        title: 'Guia B2B / Empresa',
        description: 'Manual para matchmaking e geração de negócios.',
        modules: [
            {
                id: 'matchmaking',
                name: 'Discovery (Swiping)',
                steps: [
                    {
                        title: 'Dar Like',
                        description: 'Navegue pelas empresas participantes e dê "Like" naquelas que fazem sentido para seu negócio. Se elas derem Like de volta, um Match é criado.'
                    },
                    {
                        title: 'Reuniões Agendadas',
                        description: 'Verifique sua agenda de reuniões de 15 minutos. Esteja no local (mesa designada) pontualmente.'
                    }
                ]
            }
        ]
    }
];
