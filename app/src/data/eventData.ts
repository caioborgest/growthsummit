// Growth Experience 2026 - Event Data

export const eventInfo = {
  name: "Growth Experience 2026",
  subtitle: "Gestão e Inovação",
  tagline: "A maior conferência de Growth, Marketing, Vendas e IA do Nordeste",
  dates: "16 de abril de 2026",
  location: "Boulevard Hotel, Juazeiro do Norte - CE",
  address: "Boulevard Hotel, Juazeiro do Norte, Ceará",
  timezone: "-03:00 (Brasil)",
  targetAudience: "Empresários, empreendedores, gestores, profissionais, universitários, técnicos",
};

export const stats = {
  participants: 1500,
  speakers: 10,
  mentorias: 100,
  b2bMeetings: 120,
  startups: 15,
  sponsors: 25,
};

export const tracks = [
  {
    id: 1,
    name: "Growth Marketing",
    description: "Aquisição, retenção, viral loops e estratégias de crescimento",
    icon: "TrendingUp",
    color: "teal",
    topics: ["Aquisição de usuários", "Retenção e engajamento", "Viral loops"],
  },
  {
    id: 2,
    name: "Marketing Digital",
    description: "Brand, conteúdo, SEO, SEM e estratégias digitais",
    icon: "Megaphone",
    color: "orange",
    topics: ["Branding digital", "Content marketing", "SEO/SEM"],
  },
  {
    id: 3,
    name: "Vendas B2B",
    description: "Vendas consultivas, outbound e revenue operations",
    icon: "Handshake",
    color: "teal",
    topics: ["Vendas consultivas", "Outbound sales", "Sales ops"],
  },
  {
    id: 4,
    name: "Inteligência Artificial",
    description: "ChatGPT, automação, análise de dados e IA aplicada",
    icon: "Brain",
    color: "orange",
    topics: ["ChatGPT e LLMs", "Automação", "Análise preditiva"],
  },
  {
    id: 5,
    name: "Gestão & Liderança",
    description: "OKRs, cultura organizacional e people operations",
    icon: "Users",
    color: "teal",
    topics: ["OKRs e metas", "Cultura organizacional", "People ops"],
  },
];

export const schedule = {
  day1: {
    date: "21 de maio (quinta-feira)",
    events: [
      { time: "08:00-09:00", title: "Credenciamento + Coffee da Manhã", type: "networking", speaker: null },
      { time: "09:00-10:00", title: "Abertura + Palestra Âncora: Growth & IA em 2026", type: "keynote", speaker: "Speaker Nacional" },
      { time: "10:00-12:30", title: "Trilhas Paralelas", type: "tracks", description: "Growth Marketing | Marketing Digital", speaker: null },
      { time: "12:30-14:00", title: "Almoço Patrocinado + Networking", type: "networking", speaker: null },
      { time: "14:00-16:30", title: "Trilhas Paralelas", type: "tracks", description: "Vendas B2B | IA Aplicada", speaker: null },
      { time: "16:30-17:30", title: "Painel: Inovação no Cariri-CE", type: "panel", speaker: null },
      { time: "17:30-19:00", title: "Coffee Break + Networking", type: "networking", speaker: null },
      { time: "19:00-20:30", title: "Happy Hour", type: "social", speaker: null },
    ],
  },
  day2: {
    date: "22 de maio (sexta-feira)",
    events: [
      { time: "08:00-09:00", title: "Credenciamento + Café da Manhã", type: "networking", speaker: null },
      { time: "09:00-10:00", title: "Palestra Âncora: Tendências 2026-2027", type: "keynote", speaker: null },
      { time: "10:00-10:30", title: "Coffee Break", type: "break", speaker: null },
      { time: "10:30-12:00", title: "Workshops Paralelos", type: "workshop", description: "Growth Hacking | Liderança | Pitch", speaker: null },
      { time: "12:00-13:30", title: "Almoço Patrocinado + Networking", type: "networking", speaker: null },
      { time: "13:30-15:00", title: "Oficinas Paralelas", type: "workshop", description: "Estratégia de Conteúdo | Métricas | Inovação", speaker: null },
      { time: "15:00-17:30", title: "Rodada de Mentorias 1:1 + B2B", type: "mentoring", speaker: null },
      { time: "17:30-18:30", title: "Palestra Final + Encerramento", type: "keynote", speaker: null },
      { time: "18:30-21:00", title: "Happy Hour + Prêmios Startups", type: "social", speaker: null },
    ],
  },
};

export const speakers = [
  {
    id: 1,
    name: "Ana Silva",
    role: "Head of Growth",
    company: "TechStart Brasil",
    bio: "Especialista em growth hacking com 10+ anos de experiência em startups",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    track: "Growth Marketing",
  },
  {
    id: 2,
    name: "Carlos Mendes",
    role: "CEO",
    company: "DataDriven Labs",
    bio: "Pioneiro em IA aplicada a negócios no Brasil",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    track: "Inteligência Artificial",
  },
  {
    id: 3,
    name: "Mariana Costa",
    role: "VP de Vendas",
    company: "SalesPro",
    bio: "Especialista em vendas B2B e revenue operations",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    track: "Vendas B2B",
  },
  {
    id: 4,
    name: "Pedro Oliveira",
    role: "Founder",
    company: "Growth Masters",
    bio: "Mentor de startups e especialista em marketing digital",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    track: "Marketing Digital",
  },
  {
    id: 5,
    name: "Juliana Ferreira",
    role: "People Director",
    company: "InnovateCo",
    bio: "Especialista em cultura organizacional e liderança",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    track: "Gestão & Liderança",
  },
  {
    id: 6,
    name: "Ricardo Souza",
    role: "CTO",
    company: "AI Solutions",
    bio: "Especialista em machine learning e automação",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    track: "Inteligência Artificial",
  },
];

export const ticketTypes = [
  {
    id: "standard",
    name: "Passe Standard",
    price: 297,
    originalPrice: 497,
    description: "Acesso completo ao evento",
    features: [
      "Acesso a todas as palestras",
      "Coffee breaks",
      "Material do evento",
      "Certificado de participação",
      "1 mentoria (sorteio)",
    ],
    popular: false,
    color: "teal",
  },
  {
    id: "pro",
    name: "Passe Pro",
    price: 497,
    originalPrice: 797,
    description: "Experiência completa com benefícios extras",
    features: [
      "Tudo do Standard",
      "Acesso prioritário às salas",
      "Almoço nos 2 dias",
      "2 mentorias garantidas",
      "Kit exclusivo Pro",
      "Gravações por 30 dias",
    ],
    popular: true,
    color: "teal",
  },
  {
    id: "vip",
    name: "Growth Experience",
    price: 2500,
    description: "Programa VIP premium (30 vagas)",
    features: [
      "Tudo do Pro",
      "Coffee com palestrantes",
      "Almoço VIP exclusivo",
      "2 mentorias 1:1 premium",
      "Grupo WhatsApp VIP",
      "Follow-up 3 meses",
      "Desconto 50% 2027",
    ],
    popular: false,
    limited: true,
    limit: 30,
    color: "orange",
  },
];

export const mentors = [
  { id: 1, name: "Dr. Fernando Lima", specialty: "Growth Strategy", company: "ScaleUp" },
  { id: 2, name: "Dra. Amanda Rocha", specialty: "Marketing Digital", company: "DigitalPro" },
  { id: 3, name: "Prof. Bruno Dias", specialty: "Vendas B2B", company: "SalesForce" },
  { id: 4, name: "Eng. Carla Martins", specialty: "IA & Automação", company: "AI Labs" },
  { id: 5, name: "Mestre Diego Alves", specialty: "Liderança", company: "Leadership Co" },
];

export const faqs = [
  {
    question: "O que está incluído no ingresso?",
    answer: "O ingresso inclui acesso a todas as palestras, coffee breaks, material do evento e certificado de participação. Os passes Pro e VIP incluem benefícios adicionais como mentorias, almoço e acesso a gravações.",
  },
  {
    question: "Posso cancelar minha inscrição?",
    answer: "Sim, cancelamentos podem ser solicitados até 30 dias antes do evento com reembolso integral. Entre 30 e 7 dias, reembolso de 50%. Menos de 7 dias não há reembolso, mas você pode transferir para outra pessoa.",
  },
  {
    question: "Como funcionam as mentorias?",
    answer: "As mentorias são sessões de 25 minutos 1:1 com especialistas. Participantes Standard concorrem por sorteio, Pro têm 2 garantidas, e VIP têm 2 premium com agendamento prioritário.",
  },
  {
    question: "Onde será o evento?",
    answer: "O Growth Experience 2026 será no Boulevard Hotel em Juazeiro do Norte, Ceará. O hotel fica próximo ao aeroporto regional e oferece fácil acesso.",
  },
  {
    question: "Haverá transmissão online?",
    answer: "Sim, participantes Growth Experience terão acesso a streaming ao vivo. Gravações estarão disponíveis por 30 dias após o evento para passes Pro e VIP.",
  },
  {
    question: "Como me torno um patrocinador?",
    answer: "Temos cotas de patrocínio de R$ 10k a R$ 60k. Entre em contato pelo formulário de patrocínio ou envie email para contato@growthexperience.site",
  },
];

export const sponsors = {
  diamond: [
    { name: "TechCorp", logo: "/sponsors/techcorp.svg" },
  ],
  gold: [
    { name: "InnovateLabs", logo: "/sponsors/innovate.svg" },
    { name: "DataPro", logo: "/sponsors/datapro.svg" },
  ],
  silver: [
    { name: "CloudSys", logo: "/sponsors/cloudsys.svg" },
    { name: "DevStudio", logo: "/sponsors/devstudio.svg" },
    { name: "MarketingPro", logo: "/sponsors/marketing.svg" },
  ],
};

export const testimonials = [
  {
    id: 1,
    name: "Roberto Almeida",
    role: "CEO",
    company: "StartupXYZ",
    content: "O Growth Experience transformou minha visão sobre growth hacking. As mentorias foram incríveis e já apliquei várias estratégias na minha empresa.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop",
  },
  {
    id: 2,
    name: "Fernanda Lima",
    role: "Marketing Manager",
    company: "TechBrasil",
    content: "Networking de alta qualidade, palestrantes excelentes e organização impecável. Já estou ansiosa pela edição 2026!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop",
  },
  {
    id: 3,
    name: "Gabriel Santos",
    role: "Founder",
    company: "AppNova",
    content: "A rodada B2B foi um divisor de águas para minha startup. Conseguimos 3 parcerias importantes e investidores interessados.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop",
  },
];
