
export interface Mentor {
    id: string;
    nome: string;
    cargo: string;
    empresa: string;
    bio: string;
    foto: string;
    especialidades: string[];
}

export const mentoresTriunfo: Mentor[] = [
    {
        id: 'leandro-batista',
        nome: 'Leandro Batista',
        cargo: 'CEO',
        empresa: 'Fitness Exclusive',
        bio: 'Estrategista em escala e expansão de negócios físicos. Fundou e escalou a maior rede de academias do interior do Nordeste.',
        foto: 'https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/palestrantes/Leandro%20Batista.png',
        especialidades: ['Gestão', 'Escala', 'Franquias']
    },
    {
        id: 'vanylton-matias',
        nome: 'Vanylton Matias',
        cargo: 'CEO',
        empresa: 'Grupo Núcleo',
        bio: 'Especialista em inovação corporativa e gestão de grupos empresariais de alto desempenho.',
        foto: 'https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/palestrantes/Vanylton%20Matias.png',
        especialidades: ['Inovação', 'Liderança', 'Processos']
    },
    {
        id: 'cristiano-borges',
        nome: 'Cristiano Borges',
        cargo: 'Founder',
        empresa: 'Growth Summit',
        bio: 'Especialista em Growth Marketing e estratégias de aquisição acelerada de clientes.',
        foto: 'https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/palestrantes/Cristiano%20Borges.png',
        especialidades: ['Growth Marketing', 'Vendas', 'IA']
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
    'Finanças'
];
