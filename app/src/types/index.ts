// Growth Experience - TypeScript Types
// Multi-Project Event Management Platform

export type ProjectType = 'growth_experience' | 'growth_conference' | 'growth_festival';

export type ProjectStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  name: string;
  slug: string;
  type: ProjectType;
  description: string;
  shortDescription?: string;
  location: string;
  city: string;
  state: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  banner?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  country?: string;
  address?: string;
  settings: ProjectSettings;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TicketBatch {
  id: string;
  name: string; // Ex: Lote 1, Lote 2
  price: number;
  description?: string;
  active: boolean;
  maxCapacity?: number;
  soldCount?: number;
  startDate?: string;
  endDate?: string;
}

export interface TicketTier {
  id: string; // standard, pro, premium, diamanted
  name: string; // Ex: Standard, Pro, Premium, Diamante
  description?: string;
  active: boolean;
  batches: TicketBatch[];
}

export interface ProjectSettings {
  maxRegistrations?: number;
  maxMentors?: number;
  maxStartups?: number;
  maxCompanies?: number;
  enableB2B: boolean;
  enableMentoring: boolean;
  enableStartups: boolean;
  enableCheckIn: boolean;
  ticketPrices: {
    standard: number;
    pro: number;
    vip: number;
    premium?: number;
    diamante?: number;
  };
  ticketTiers?: TicketTier[];
  goalRevenue?: number;
  goalSponsorship?: number;
  goalRegistrations?: number;
  targetRevenue?: number;
  publicContent?: {
    heroTitle?: string;
    heroSubtitle?: string;
    heroVideo?: string;
    aboutTitle?: string;
    aboutText?: string;
    popup?: {
      active: boolean;
      title: string;
      subtitle: string;
      description: string;
      buttonText: string;
    };
    palestrantes?: {
      nome: string;
      cargo: string;
      descricao: string;
      tema: string;
      horario: string;
    }[];
    vagas?: {
      nome: string;
      espaco: string;
      ingressos: number;
      beneficios: string[];
      vagas: number;
      destaque?: boolean;
    }[];
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'visitor' | 'participant' | 'mentor' | 'company' | 'startup' | 'sponsor' | 'admin' | 'staff' | 'speaker';
  avatar?: string;
  avatar_url?: string;
  department?: string;
  staffRole?: string;
  permissions?: string[];
  twoFactorEnabled?: boolean;
  requires2FA?: boolean;
  createdAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  company?: string;
  position?: string;
  bio?: string;
  website?: string;
  linkedin?: string;
  city?: string;
  state?: string;
  country?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  cpf?: string;
  cnpj?: string;
  newsletterOptIn?: boolean;
}

export interface Registration {
  id: string;
  projectId: string;
  userId: string;
  name?: string;
  email?: string;
  empresa?: string;
  cargo?: string;
  whatsapp?: string;
  ticketType: 'standard' | 'pro' | 'vip' | string;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded' | 'pago' | 'ativo' | 'error' | string;
  qrCode: string;
  ticketNumber: string;
  amount: number;
  valor_pago?: number;
  status_pagamento?: 'pendente' | 'pago' | 'cancelado' | 'erro' | string;
  paymentStatus?: 'pending' | 'paid' | 'cancelled' | 'error' | 'pago' | 'pendente' | string;
  paymentMethod?: string;
  paymentDate?: string;
  createdAt: string;
  checkedIn: boolean;
  checkInTime?: string;
  check_in_at?: string; // Snake case mapping
  // Growth Experience specific fields
  cursosSelecionados?: string[];
  palestrasNoturnas?: boolean;
  couponCode?: string;
  discountAmount?: number;
  externalPaymentId?: string;
  externalPaymentUrl?: string;
  loteId?: string;
  voucherEmpresa?: string;
  tipo_inscricao?: string; // Snake case mapping
  nome?: string; // Snake case mapping
  telefone?: string; // Snake case mapping
}

export interface Mentor {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  bio: string;
  specialties: string[];
  tracks: string[];
  yearsExperience: number;
  company: string;
  position: string;
  linkedin?: string;
  status: 'pending' | 'approved' | 'rejected';
  maxMentories: number;
  createdAt: string;
}

export interface Company {
  id: string;
  projectId: string;
  userId: string;
  companyName: string; // Primary field from DB 'nome_empresa'
  name?: string; // Fallback for 'nome' (sometimes used)
  cnpj: string;
  type: 'anchor' | 'vendor';
  sector: string;
  description: string;
  companyDescription?: string; // Semantic mapping for DB 'descricao_empresa'
  website?: string;
  logo?: string;
  logoUrl?: string; // New field for public url
  contactName: string; // From DB 'nome_representante'
  contactEmail: string;
  contactPhone: string;
  position?: string; // From DB 'cargo'
  status: 'pending' | 'approved' | 'rejected';
  packageType?: 'anchor' | 'vendor';
  maxMeetings: number;
  interestType?: 'comprar' | 'vender' | 'parceria' | 'todos' | string;
  interestAreas?: string;
  objectives?: string; // From DB 'descricao_objetivos'
  companySize?: string; // From DB 'porte'
  annualRevenue?: string; // From DB 'faturamento_anual'
  employeeCount?: string; // From DB 'numero_funcionarios'
  productsServices?: string; // From DB 'produtos_servicos'
  createdAt: string;
}

export interface B2BSwipe {
  id: string;
  projectId: string;
  fromCompanyId: string;
  toCompanyId: string;
  status: 'like' | 'dislike';
  createdAt: string;
}

export interface B2BMatch {
  id: string;
  projectId: string;
  companyAId: string;
  companyBId: string;
  status: 'pending_schedule' | 'scheduled' | 'cancelled';
  createdAt: string;
}

export interface B2BAppointmentTriunfo {
  id: string;
  projectId: string;
  matchId?: string;
  companyAId: string;
  companyBId: string;
  scheduledAt: string;
  durationMinutes: number;
  tableNumber?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  createdAt: string;
}

export interface B2BMeeting {
  id: string;
  projectId: string;
  companyAnchorId: string;
  companyAnchorName: string;
  companyVendorId: string;
  companyVendorName: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  interestLevel?: 'low' | 'medium' | 'high';
  followUp?: boolean;
  createdAt: string;
}

export interface Startup {
  id: string;
  projectId: string;
  userId?: string;
  name: string;
  cnpj?: string;
  description: string;
  sector: string;
  stage: 'idea' | 'mvp' | 'traction' | 'scale' | string;
  website?: string;
  siteUrl?: string;
  logo?: string;
  pitchDeck?: string;
  pitchDeckUrl?: string;
  videoPitch?: string;
  videoPitchUrl?: string;
  foundingTeam: TeamMember[];

  // Contato (campos do banco GE Triunfo)
  email?: string;
  phone?: string;

  // Campos de pitch GE Triunfo
  problema?: string;
  solucao?: string;
  modeloNegocio?: string;
  diferencial?: string;
  faturamentoMensal?: string;
  investimentoBuscado?: string;

  metrics?: {
    revenue?: number;
    users?: number;
    growth?: number;
  };
  status: 'pending' | 'approved' | 'rejected' | string;
  packageType?: 'expo' | 'pitch' | string;
  standNumber?: string;
  linkedin?: string;
  createdAt: string;
}


export interface TeamMember {
  name: string;
  role: string;
  linkedin?: string;
}

export interface Sponsor {
  id: string;
  projectId: string;
  userId?: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  level: 'diamond' | 'gold' | 'silver' | 'bronze';
  investment: number;
  status: 'prospect' | 'negotiation' | 'closed' | 'cancelled';
  deliverables: Deliverable[];
  logo?: string;
  website?: string;
  createdAt: string;
}

export interface Deliverable {
  id: string;
  item: string;
  status: 'pending' | 'in_progress' | 'completed';
  deadline?: string;
  responsible?: string;
}

export interface Transaction {
  id: string;
  projectId: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  reference_person?: string;
  relatedId?: string;
  relatedType?: string;
  createdAt: string;
}


export interface Certificate {
  id: string;
  projectId: string;
  userId: string;
  registrationId: string;
  sessionId?: string;
  type: 'event' | 'course' | 'lecture' | 'workshop' | 'oficina';
  code: string;
  issueDate: string;
  downloadCount: number;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface EmailTemplate {
  id: string;
  projectId: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  category: string;
}

export interface EmailCampaign {
  id: string;
  projectId: string;
  name: string;
  templateId: string;
  recipients: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'sent';
  scheduledAt?: string;
  sentAt?: string;
  stats?: {
    sent: number;
    opened: number;
    clicked: number;
    bounced: number;
  };
}

export interface Session {
  id: string;
  projectId: string;
  category: string;
  title: string;
  description?: string;
  type: 'palestra' | 'talk' | 'panel' | 'workshop' | 'networking' | 'circuito' | 'curso' | 'oficina' | 'mentoria' | 'startup' | 'b2b';
  track?: string;
  day?: 1 | 2;
  startTime: string;
  endTime: string;
  room: string;
  speakers: string[];
  partner?: string;
  maxCapacity?: number;
  registeredCount: number;
  topics?: string[];
  color?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  projectId?: string;
  userId?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: 'technical' | 'finance' | 'registration' | 'general' | string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  rating?: number;
  feedback?: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  userId?: string;
  message: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Raffle {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  type: 'stand_checkin' | 'realtime_qr';
  status: 'draft' | 'pending' | 'open' | 'active' | 'completed' | 'cancelled';
  standId?: string;
  winnerRegistrationId?: string;
  winnerName?: string;
  drawnAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RaffleParticipant {
  id: string;
  raffleId: string;
  registrationId: string;
  createdAt: string;
  registration?: Registration;
}

export interface Lead {
  id: string;
  projectId?: string;
  startupId?: string;
  sponsorId?: string;
  companyId?: string;
  registrationId?: string;
  visitorName: string;
  visitorEmail?: string;
  visitorPhone?: string;
  visitorCpf?: string;
  visitorCompany?: string;
  interestLevel: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalRegistrations: number;
  totalRevenue: number;
  totalMentories: number;
  totalB2BMeetings: number;
  totalStartups: number;
  totalSponsors: number;
  checkInsToday: number;
  pendingApprovals: number;
}

export interface ProjectStats {
  projectId: string;
  registrations: number;
  revenue: number;
  mentors: number;
  mentoringSessions: number;
  companies: number;
  b2bMeetings: number;
  startups: number;
  sponsors: number;
  checkIns: number;
}

export interface Coupon {
  id: string;
  projectId: string;
  codigo: string;
  indicacaoTipo: 'prefeitura' | 'politico' | 'empresa' | 'promocional' | 'influenciador' | 'associacao' | 'instituicao' | 'outro';
  indicacaoNome: string;
  porcentagemDesconto: number;
  ativo: boolean;
  usoLimite: number | null;
  usoAtual: number;
  descricao?: string;
  vencimento?: string;
  createdAt: string;
}

export interface EmpresaIncentivadora {
  id: string;
  projectId: string;
  nomeResponsavel: string;
  email: string;
  phone: string;
  nomeEmpresa: string;
  quantidadeEquipe: number;
  quantidadeDia: number;
  quantidadeNoite: number;
  objetivo: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'ativo' | 'cancelado' | 'aprovado' | 'pendente' | 'rejeitado';
  createdAt: string;
}

export interface RegistrationBatch {
  id: string;
  projectId: string;
  nomeEmpresa: string;
  cnpj?: string;
  nomeResponsavel: string;
  emailResponsavel: string;
  emailContato: string;
  voucherCode: string;
  quantidadeVagas: number;
  vagasUtilizadas: number;
  tipoIngresso: string;
  valorTotal: number;
  statusPagamento: 'pending' | 'paid' | 'cancelled' | 'pago' | 'pendente' | 'cancelado';
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MentoringSession {
  id: string;
  projectId: string;
  mentorId: string;
  mentorName: string;
  menteeId: string;
  menteeName: string;
  menteeEmail?: string;
  menteePhone?: string;
  scheduledAt: string;
  duration: number;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  topic?: string;
  notes?: string;
  startupName?: string;
  sector?: string;
  feedback?: {
    rating: number;
    comment: string;
    /** 1-5 — "Como você avalia a mentoria realizada?" */
    avaliacaoMentoria?: number;
    /** 1-5 — "Quanto você indicaria este mentor a um empresário?" */
    indicacaoMentor?: number;
    avaliadoEm?: string;
  };
  threeSteps?: string[];
  createdAt: string;
}

export interface MentoringWaitlist {
  id: string;
  projectId: string;
  registrationId: string;
  mentorId?: string;
  challenge: string;
  status: 'pending' | 'redirected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface B2BChatMessage {
  id: string;
  projectId: string;
  matchId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt?: string;
}

export interface Stand {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  logoUrl?: string;
  location?: string;
  ownerId?: string;
  ownerType?: 'startup' | 'company' | 'sponsor';
  createdAt: string;
}

export interface StandCheckIn {
  id: string;
  projectId: string;
  registrationId: string;
  standId: string;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  projectId: string;
  registrationId: string | null;
  userId: string;
  ticketNumber: string;
  timestamp: string;
  location: string;
  method: 'qr_code' | 'manual' | 'rfid' | 'facial' | 'self_scan' | 'qrcode' | 'face';
  checkInType?: 'event' | string;
  operatorId?: string;
  notes?: string;
  createdAt: string;
}

export interface ActivityAttendance {
  id: string;
  projectId: string;
  sessionId: string;
  registrationId: string | null;
  userId: string;
  checkInAt: string;
  checkInType: 'qr' | 'manual';
  operatorId?: string;
  createdAt: string;
}

export interface Partner {
  id: string;
  projectId: string;
  name: string;
  cnpj?: string;
  type: 'sponsor' | 'exhibitor' | 'media' | 'institutional' | 'other';
  category: 'permuta' | 'investimento' | 'misto';
  status: 'active' | 'inactive';
  logoUrl?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  accessCode?: string;
  maxTeamMembers?: number;
  sponsorId?: string;
  standId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerTeamMember {
  id: string;
  partnerId: string;
  projectId: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  role: string;
  qrCode: string;
  checkedIn: boolean;
  checkInTime?: string;
  createdAt: string;
}
