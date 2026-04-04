
export interface Mentor {
    id: string;
    nome: string;
    role_title: string;
    empresa: string;
    bio: string;
    foto: string;
    specialties: string[];
}

export const mentoresTriunfo: Mentor[] = [
    {
        id: 'leandro-batista',
        nome: 'Leandro Batista',
        role_title: 'CEO',
        empresa: 'Fitness Exclusive',
        bio: 'Estrategista em escala e expansão de negócios físicos. Fundou e escalou a maior rede de academias do interior do Nordeste.',
        foto: 'https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/palestrantes/Leandro%20Batista.png',
        specialties: ['Gestão Empresarial', 'Escala', 'Marketing Digital']
    },
    {
        id: 'vanylton-matias',
        nome: 'Vanylton Matias',
        role_title: 'CEO',
        empresa: 'Grupo Núcleo',
        bio: 'Especialista em inovação corporativa e gestão de grupos empresariais de alto desempenho.',
        foto: 'https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/palestrantes/Vanylton%20Matias.png',
        specialties: ['Inovação', 'Liderança', 'Operações & Processos']
    },
    {
        id: 'cristiano-borges',
        nome: 'Cristiano Borges',
        role_title: 'Founder',
        empresa: 'Growth Experience',
        bio: 'Especialista em Growth Marketing e estratégias de aquisição acelerada de clientes.',
        foto: 'https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/palestrantes/Cristiano%20Borges.png',
        specialties: ['Growth Marketing', 'Vendas', 'Inteligência Artificial']
    }
];

export const areasMentoria = [
    'Growth Marketing',
    'Vendas',
    'Inteligência Artificial',
    'Gestão Empresarial',
    'Inovação',
    'Liderança',
    'Escala',
    'Marketing Digital',
    'Operações & Processos',
    'Finanças',
    'Mentoria Especializada'
];
