import { useState, useCallback, useEffect, useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import type { 
  Registration, Mentor, MentoringSession, Company, B2BMeeting, 
  Startup, Sponsor, Transaction, CheckIn, Session, Lead, Project
} from '@/types';

// Project IDs
const GS_2026 = 'gs-2026';
const GE_TRIUNFO = 'ge-triunfo-2026';
const GE_PETROLINA = 'ge-petrolina-2026';
const GE_JUAZEIRO = 'ge-juazeiro-2026';

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: GS_2026,
    name: 'Growth Summit 2026',
    slug: 'growth-summit-2026',
    type: 'growth_summit',
    description: 'O maior evento de gestão, inovação e empreendedorismo do interior do Nordeste.',
    shortDescription: 'Gestão, Inovação & Empreendedorismo',
    location: 'Boulevard Hotel & Convention',
    city: 'Juazeiro do Norte',
    state: 'CE',
    startDate: '2026-05-21',
    endDate: '2026-05-22',
    status: 'active',
    primaryColor: '#21808D',
    secondaryColor: '#FE4C38',
    settings: {
      enableB2B: true,
      enableMentoring: true,
      enableStartups: true,
      enableCheckIn: true,
      ticketPrices: { standard: 297, pro: 497, vip: 2500 },
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: GE_TRIUNFO,
    name: 'Growth Experience - Edição Triunfo',
    slug: 'growth-experience-triunfo-2026',
    type: 'growth_experience',
    description: 'Edição especial do Growth Experience em Triunfo, PE.',
    shortDescription: 'Edição Triunfo',
    location: 'Centro de Convenções de Triunfo',
    city: 'Triunfo',
    state: 'PE',
    startDate: '2026-03-15',
    endDate: '2026-03-15',
    status: 'active',
    primaryColor: '#21808D',
    secondaryColor: '#FE4C38',
    settings: {
      enableB2B: false,
      enableMentoring: true,
      enableStartups: true,
      enableCheckIn: true,
      ticketPrices: { standard: 197, pro: 347, vip: 1500 },
    },
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01',
  },
  {
    id: GE_PETROLINA,
    name: 'Growth Experience - Edição Petrolina',
    slug: 'growth-experience-petrolina-2026',
    type: 'growth_experience',
    description: 'Edição especial do Growth Experience em Petrolina, PE.',
    shortDescription: 'Edição Petrolina',
    location: 'Centro de Convenções de Petrolina',
    city: 'Petrolina',
    state: 'PE',
    startDate: '2026-04-20',
    endDate: '2026-04-20',
    status: 'draft',
    primaryColor: '#21808D',
    secondaryColor: '#FE4C38',
    settings: {
      enableB2B: true,
      enableMentoring: true,
      enableStartups: false,
      enableCheckIn: true,
      ticketPrices: { standard: 197, pro: 347, vip: 1500 },
    },
    createdAt: '2024-02-15',
    updatedAt: '2024-02-15',
  },
  {
    id: GE_JUAZEIRO,
    name: 'Growth Experience - Edição Juazeiro',
    slug: 'growth-experience-juazeiro-2026',
    type: 'growth_experience',
    description: 'Edição especial do Growth Experience em Juazeiro do Norte, CE.',
    shortDescription: 'Edição Juazeiro',
    location: 'Boulevard Hotel & Convention',
    city: 'Juazeiro do Norte',
    state: 'CE',
    startDate: '2026-06-10',
    endDate: '2026-06-10',
    status: 'draft',
    primaryColor: '#21808D',
    secondaryColor: '#FE4C38',
    settings: {
      enableB2B: false,
      enableMentoring: true,
      enableStartups: true,
      enableCheckIn: true,
      ticketPrices: { standard: 197, pro: 347, vip: 1500 },
    },
    createdAt: '2024-03-01',
    updatedAt: '2024-03-01',
  },
];

// Mock Data with projectId
const mockRegistrations: Registration[] = [
  { id: '1', projectId: GS_2026, userId: '2', ticketType: 'pro', status: 'paid', qrCode: 'qr1', ticketNumber: 'GS2026-00001', amount: 497, paymentMethod: 'credit_card', paymentDate: '2024-01-15', createdAt: '2024-01-15', checkedIn: false },
  { id: '2', projectId: GS_2026, userId: '6', ticketType: 'standard', status: 'paid', qrCode: 'qr2', ticketNumber: 'GS2026-00002', amount: 297, paymentMethod: 'pix', paymentDate: '2024-01-16', createdAt: '2024-01-16', checkedIn: true, checkInTime: '2024-05-21T08:30:00' },
  { id: '3', projectId: GS_2026, userId: '7', ticketType: 'vip', status: 'paid', qrCode: 'qr3', ticketNumber: 'GS2026-00003', amount: 2500, paymentMethod: 'credit_card', paymentDate: '2024-01-17', createdAt: '2024-01-17', checkedIn: false },
  { id: '4', projectId: GS_2026, userId: '8', ticketType: 'pro', status: 'pending', qrCode: 'qr4', ticketNumber: 'GS2026-00004', amount: 497, createdAt: '2024-01-18', checkedIn: false },
  { id: '5', projectId: GS_2026, userId: '9', ticketType: 'standard', status: 'paid', qrCode: 'qr5', ticketNumber: 'GS2026-00005', amount: 297, paymentMethod: 'boleto', paymentDate: '2024-01-19', createdAt: '2024-01-19', checkedIn: false },
  { id: '6', projectId: GE_TRIUNFO, userId: '18', ticketType: 'standard', status: 'paid', qrCode: 'qr6', ticketNumber: 'GETRI-00001', amount: 197, paymentMethod: 'pix', paymentDate: '2024-02-10', createdAt: '2024-02-10', checkedIn: false },
  { id: '7', projectId: GE_TRIUNFO, userId: '19', ticketType: 'pro', status: 'paid', qrCode: 'qr7', ticketNumber: 'GETRI-00002', amount: 347, paymentMethod: 'credit_card', paymentDate: '2024-02-11', createdAt: '2024-02-11', checkedIn: false },
];

const mockMentors: Mentor[] = [
  { id: '1', projectId: GS_2026, userId: '3', name: 'Dr. Fernando Lima', email: 'fernando@email.com', bio: 'Especialista em Growth Strategy', specialties: ['Growth', 'Strategy'], tracks: ['Growth Marketing'], yearsExperience: 15, company: 'ScaleUp', position: 'CEO', linkedin: 'linkedin.com/in/fernando', status: 'approved', maxMentories: 5, createdAt: '2024-01-10' },
  { id: '2', projectId: GS_2026, userId: '10', name: 'Dra. Amanda Rocha', email: 'amanda@email.com', bio: 'Especialista em Marketing Digital', specialties: ['Marketing', 'SEO'], tracks: ['Marketing Digital'], yearsExperience: 12, company: 'DigitalPro', position: 'CMO', status: 'approved', maxMentories: 4, createdAt: '2024-01-11' },
  { id: '3', projectId: GS_2026, userId: '11', name: 'Prof. Bruno Dias', email: 'bruno@email.com', bio: 'Especialista em Vendas B2B', specialties: ['Sales', 'B2B'], tracks: ['Vendas B2B'], yearsExperience: 18, company: 'SalesForce', position: 'VP Sales', status: 'pending', maxMentories: 3, createdAt: '2024-01-12' },
  { id: '4', projectId: GE_TRIUNFO, userId: '20', name: 'Dra. Carla Mendes', email: 'carla@email.com', bio: 'Especialista em Inovação', specialties: ['Innovation', 'Strategy'], tracks: ['Inovação'], yearsExperience: 14, company: 'InnovateLab', position: 'Diretora', linkedin: 'linkedin.com/in/carla', status: 'approved', maxMentories: 4, createdAt: '2024-02-05' },
];

const mockMentoringSessions: MentoringSession[] = [
  { id: '1', projectId: GS_2026, mentorId: '1', mentorName: 'Dr. Fernando Lima', menteeId: '2', menteeName: 'João Silva', scheduledAt: '2024-05-22T15:00:00', duration: 25, status: 'scheduled', topic: 'Estratégia de crescimento', createdAt: '2024-01-20' },
  { id: '2', projectId: GS_2026, mentorId: '2', mentorName: 'Dra. Amanda Rocha', menteeId: '6', menteeName: 'Maria Santos', scheduledAt: '2024-05-22T15:30:00', duration: 25, status: 'completed', topic: 'Marketing digital', notes: 'Ótima sessão', feedback: { rating: 5, comment: 'Excelente mentoria!' }, threeSteps: ['Definir persona', 'Criar conteúdo', 'Medir resultados'], createdAt: '2024-01-21' },
  { id: '3', projectId: GE_TRIUNFO, mentorId: '4', mentorName: 'Dra. Carla Mendes', menteeId: '18', menteeName: 'Pedro Alves', scheduledAt: '2024-03-15T14:00:00', duration: 25, status: 'scheduled', topic: 'Inovação na prática', createdAt: '2024-02-15' },
];

const mockCompanies: Company[] = [
  { id: '1', projectId: GS_2026, userId: '4', name: 'Empresa ABC', cnpj: '12.345.678/0001-90', type: 'anchor', sector: 'Tecnologia', description: 'Empresa de software', website: 'abc.com', contactName: 'Carlos Mendes', contactEmail: 'carlos@abc.com', contactPhone: '(11) 99999-9999', status: 'approved', packageType: 'anchor', maxMeetings: 8, createdAt: '2024-01-15' },
  { id: '2', projectId: GS_2026, userId: '13', name: 'Fornecedora XYZ', cnpj: '98.765.432/0001-10', type: 'vendor', sector: 'Marketing', description: 'Agência de marketing', website: 'xyz.com', contactName: 'Ana Paula', contactEmail: 'ana@xyz.com', contactPhone: '(21) 88888-8888', status: 'approved', packageType: 'vendor', maxMeetings: 15, createdAt: '2024-01-16' },
  { id: '3', projectId: GS_2026, userId: '14', name: 'Tech Solutions', cnpj: '11.222.333/0001-44', type: 'vendor', sector: 'TI', description: 'Consultoria em TI', contactName: 'Roberto Alves', contactEmail: 'roberto@tech.com', contactPhone: '(31) 77777-7777', status: 'pending', maxMeetings: 10, createdAt: '2024-01-17' },
];

const mockB2BMeetings: B2BMeeting[] = [
  { id: '1', projectId: GS_2026, companyAnchorId: '1', companyAnchorName: 'Empresa ABC', companyVendorId: '2', companyVendorName: 'Fornecedora XYZ', scheduledAt: '2024-05-22T15:00:00', duration: 15, status: 'scheduled', createdAt: '2024-01-20' },
  { id: '2', projectId: GS_2026, companyAnchorId: '1', companyAnchorName: 'Empresa ABC', companyVendorId: '2', companyVendorName: 'Fornecedora XYZ', scheduledAt: '2024-05-22T15:20:00', duration: 15, status: 'completed', interestLevel: 'high', followUp: true, createdAt: '2024-01-21' },
];

const mockStartups: Startup[] = [
  { id: '1', projectId: GS_2026, userId: '5', name: 'TechStart Brasil', cnpj: '33.444.555/0001-66', description: 'Plataforma de gestão', sector: 'SaaS', stage: 'traction', website: 'techstart.com', foundingTeam: [{ name: 'João Silva', role: 'CEO' }, { name: 'Maria Santos', role: 'CTO' }], metrics: { revenue: 50000, users: 1000, growth: 150 }, status: 'approved', packageType: 'pitch', standNumber: 'A01', createdAt: '2024-01-10' },
  { id: '2', projectId: GS_2026, userId: '15', name: 'AppNova', cnpj: '77.888.999/0001-22', description: 'App de delivery', sector: 'FoodTech', stage: 'mvp', website: 'appnova.com', foundingTeam: [{ name: 'Pedro Costa', role: 'Founder' }], metrics: { users: 500, growth: 80 }, status: 'approved', packageType: 'expo', standNumber: 'A02', createdAt: '2024-01-11' },
  { id: '3', projectId: GS_2026, userId: '16', name: 'DataDriven', cnpj: '55.666.777/0001-33', description: 'Analytics com IA', sector: 'Data', stage: 'idea', foundingTeam: [{ name: 'Lucas Lima', role: 'CEO' }], metrics: {}, status: 'pending', packageType: 'expo', createdAt: '2024-01-12' },
  { id: '4', projectId: GE_TRIUNFO, userId: '21', name: 'GreenEnergy', cnpj: '99.000.111/0001-55', description: 'Soluções em energia solar', sector: 'CleanTech', stage: 'traction', website: 'greenenergy.com', foundingTeam: [{ name: 'Ana Silva', role: 'CEO' }], metrics: { revenue: 30000, users: 200, growth: 120 }, status: 'approved', packageType: 'pitch', createdAt: '2024-02-10' },
];

const mockSponsors: Sponsor[] = [
  { id: '1', projectId: GS_2026, companyName: 'TechCorp', contactName: 'Ana Silva', contactEmail: 'ana@techcorp.com', contactPhone: '(11) 99999-9999', level: 'diamond', investment: 60000, status: 'closed', deliverables: [{ id: '1', item: 'Palestra 20min', status: 'completed' }, { id: '2', item: 'Stand 6x4m', status: 'completed' }], logo: '/logos/techcorp.svg', website: 'techcorp.com', createdAt: '2024-01-05' },
  { id: '2', projectId: GS_2026, companyName: 'InnovateLabs', contactName: 'Bruno Mendes', contactEmail: 'bruno@innovate.com', contactPhone: '(21) 88888-8888', level: 'gold', investment: 30000, status: 'closed', deliverables: [{ id: '3', item: 'Stand 4x3m', status: 'in_progress' }], createdAt: '2024-01-06' },
  { id: '3', projectId: GS_2026, companyName: 'CloudSys', contactName: 'Carla Rocha', contactEmail: 'carla@cloudsys.com', contactPhone: '(31) 77777-7777', level: 'silver', investment: 15000, status: 'negotiation', deliverables: [], createdAt: '2024-01-07' },
  { id: '4', projectId: GE_TRIUNFO, companyName: 'TriunfoInvest', contactName: 'João Pedro', contactEmail: 'joao@triunfo.com', contactPhone: '(87) 99999-9999', level: 'gold', investment: 20000, status: 'closed', deliverables: [{ id: '4', item: 'Stand Principal', status: 'completed' }], createdAt: '2024-02-05' },
];

const mockTransactions: Transaction[] = [
  { id: '1', projectId: GS_2026, type: 'income', category: 'Inscrições', description: 'João Silva - Passe Pro', amount: 497, date: '2024-01-15', status: 'completed', relatedId: '1', relatedType: 'registration', createdAt: '2024-01-15' },
  { id: '2', projectId: GS_2026, type: 'income', category: 'Patrocínio', description: 'TechCorp - Diamond', amount: 60000, date: '2024-01-10', status: 'completed', relatedId: '1', relatedType: 'sponsor', createdAt: '2024-01-10' },
  { id: '3', projectId: GS_2026, type: 'expense', category: 'Venue', description: 'Boulevard Hotel - Caução', amount: 18000, date: '2024-01-05', status: 'completed', createdAt: '2024-01-05' },
  { id: '4', projectId: GS_2026, type: 'income', category: 'Startups', description: 'TechStart Brasil - Pitch', amount: 2500, date: '2024-01-12', status: 'completed', relatedId: '1', relatedType: 'startup', createdAt: '2024-01-12' },
  { id: '5', projectId: GE_TRIUNFO, type: 'income', category: 'Inscrições', description: 'Pedro Alves - Passe Standard', amount: 197, date: '2024-02-10', status: 'completed', relatedId: '6', relatedType: 'registration', createdAt: '2024-02-10' },
  { id: '6', projectId: GE_TRIUNFO, type: 'income', category: 'Patrocínio', description: 'TriunfoInvest - Gold', amount: 20000, date: '2024-02-05', status: 'completed', relatedId: '4', relatedType: 'sponsor', createdAt: '2024-02-05' },
];

const mockCheckIns: CheckIn[] = [
  { id: '1', projectId: GS_2026, userId: '6', userName: 'Maria Santos', ticketNumber: 'GS2026-00002', timestamp: '2024-05-21T08:30:00', location: 'Entrada Principal', method: 'qr_code', staffId: '1' },
  { id: '2', projectId: GS_2026, userId: '17', userName: 'Pedro Costa', ticketNumber: 'GS2026-00010', timestamp: '2024-05-21T08:45:00', location: 'Entrada Principal', method: 'qr_code', staffId: '1' },
];

const mockSessions: Session[] = [
  { id: '1', projectId: GS_2026, title: 'Growth & IA em 2026', description: 'Palestra de abertura', type: 'keynote', track: 'Growth Marketing', day: 1, startTime: '09:00', endTime: '10:00', room: 'Auditório Principal', speakers: ['Carlos Mendes'], maxCapacity: 500, registeredCount: 420 },
  { id: '2', projectId: GS_2026, title: 'Marketing Digital Avançado', type: 'talk', track: 'Marketing Digital', day: 1, startTime: '10:30', endTime: '11:30', room: 'Sala A', speakers: ['Ana Silva'], maxCapacity: 100, registeredCount: 85 },
  { id: '3', projectId: GS_2026, title: 'Workshop: Growth Hacking', type: 'workshop', track: 'Growth Marketing', day: 2, startTime: '10:30', endTime: '12:00', room: 'Sala B', speakers: ['Pedro Oliveira'], maxCapacity: 50, registeredCount: 48 },
  { id: '4', projectId: GE_TRIUNFO, title: 'Inovação no Interior', description: 'Palestra de abertura', type: 'keynote', track: 'Inovação', day: 1, startTime: '09:00', endTime: '10:00', room: 'Auditório', speakers: ['Dra. Carla Mendes'], maxCapacity: 200, registeredCount: 150 },
];

const mockLeads: Lead[] = [
  { id: '1', projectId: GS_2026, startupId: '1', visitorName: 'Carlos Alberto', visitorEmail: 'carlos@empresa.com', visitorCompany: 'Empresa XYZ', interestLevel: 'high', notes: 'Interessado em parceria', createdAt: '2024-05-21T10:00:00' },
  { id: '2', projectId: GS_2026, startupId: '1', visitorName: 'Maria Fernanda', visitorEmail: 'maria@startup.com', interestLevel: 'medium', createdAt: '2024-05-21T11:00:00' },
];

// Generic interface with id
interface WithId {
  id: string;
  projectId: string;
}

// Generic hook for CRUD operations with project filtering
export function useData<T extends WithId>(initialData: T[]) {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const { projectId } = useProject();

  // Filter data by selected project
  const filteredData = useMemo(() => {
    if (!projectId) return [];
    return data.filter(item => item.projectId === projectId);
  }, [data, projectId]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);
  }, []);

  const create = useCallback(async (item: Omit<T, 'id' | 'createdAt'>) => {
    if (!projectId) throw new Error('No project selected');
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const newItem = {
      ...item,
      projectId,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    } as unknown as T;
    setData(prev => [...prev, newItem]);
    setIsLoading(false);
    return newItem;
  }, [projectId]);

  const update = useCallback(async (id: string, updates: Partial<T>) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setData(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    setIsLoading(false);
  }, []);

  const remove = useCallback(async (id: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setData(prev => prev.filter(item => item.id !== id));
    setIsLoading(false);
  }, []);

  const getById = useCallback((id: string) => {
    return filteredData.find(item => item.id === id);
  }, [filteredData]);

  const filter = useCallback((predicate: (item: T) => boolean) => {
    return filteredData.filter(predicate);
  }, [filteredData]);

  useEffect(() => {
    fetchData();
  }, [fetchData, projectId]);

  return {
    data: filteredData,
    allData: data,
    isLoading,
    create,
    update,
    remove,
    getById,
    filter,
    refetch: fetchData,
  };
}

// Hook for projects (no project filtering)
export function useProjects() {
  const [data, setData] = useState<Project[]>(mockProjects);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);
  }, []);

  const create = useCallback(async (item: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const newItem: Project = {
      ...item,
      id: `proj-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setData(prev => [...prev, newItem]);
    setIsLoading(false);
    return newItem;
  }, []);

  const update = useCallback(async (id: string, updates: Partial<Project>) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setData(prev => prev.map(item => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item));
    setIsLoading(false);
  }, []);

  const remove = useCallback(async (id: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setData(prev => prev.filter(item => item.id !== id));
    setIsLoading(false);
  }, []);

  const getById = useCallback((id: string) => {
    return data.find(item => item.id === id);
  }, [data]);

  const filter = useCallback((predicate: (item: Project) => boolean) => {
    return data.filter(predicate);
  }, [data]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    create,
    update,
    remove,
    getById,
    filter,
    refetch: fetchData,
  };
}

// Specific hooks with project filtering
export function useRegistrations() {
  return useData<Registration>(mockRegistrations);
}

export function useMentors() {
  return useData<Mentor>(mockMentors);
}

export function useMentoringSessions() {
  return useData<MentoringSession>(mockMentoringSessions);
}

export function useCompanies() {
  return useData<Company>(mockCompanies);
}

export function useB2BMeetings() {
  return useData<B2BMeeting>(mockB2BMeetings);
}

export function useStartups() {
  return useData<Startup>(mockStartups);
}

export function useSponsors() {
  return useData<Sponsor>(mockSponsors);
}

export function useTransactions() {
  return useData<Transaction>(mockTransactions);
}

export function useCheckIns() {
  return useData<CheckIn>(mockCheckIns);
}

export function useSessions() {
  return useData<Session>(mockSessions);
}

export function useLeads() {
  return useData<Lead>(mockLeads);
}
