// Growth Summit - TypeScript Types
// Multi-Project Event Management Platform

export type ProjectType = 'growth_summit' | 'growth_experience' | 'growth_conference' | 'growth_festival';

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
  createdAt: string;
  updatedAt: string;
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
  };
  targetRegistrations?: number;
  targetRevenue?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'visitor' | 'participant' | 'mentor' | 'company' | 'startup' | 'sponsor' | 'admin' | 'staff' | 'speaker';
  avatar?: string;
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
  ticketType: 'standard' | 'pro' | 'vip';
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  qrCode: string;
  ticketNumber: string;
  amount: number;
  paymentMethod?: string;
  paymentDate?: string;
  createdAt: string;
  checkedIn: boolean;
  checkInTime?: string;
  // Growth Experience specific fields
  cursosSelecionados?: string[];
  palestrasNoturnas?: boolean;
}

export interface Mentor {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  email: string;
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

export interface MentoringSession {
  id: string;
  projectId: string;
  mentorId: string;
  mentorName: string;
  menteeId: string;
  menteeName: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  topic?: string;
  notes?: string;
  feedback?: {
    rating: number;
    comment: string;
  };
  threeSteps?: string[];
  createdAt: string;
}

export interface Company {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  cnpj: string;
  type: 'anchor' | 'vendor';
  sector: string;
  description: string;
  website?: string;
  logo?: string;
  logoUrl?: string; // New field for public url
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: 'pending' | 'approved' | 'rejected';
  packageType?: 'anchor' | 'vendor';
  maxMeetings: number;
  tipoInteresse?: 'comprar' | 'vender' | 'parceria' | 'todos';
  areasInteresse?: string;
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
  userId: string;
  name: string;
  cnpj: string;
  description: string;
  sector: string;
  stage: 'idea' | 'mvp' | 'traction' | 'scale';
  website?: string;
  logo?: string;
  pitchDeck?: string;
  videoPitch?: string;
  foundingTeam: TeamMember[];
  metrics: {
    revenue?: number;
    users?: number;
    growth?: number;
  };
  status: 'pending' | 'approved' | 'rejected';
  packageType: 'expo' | 'pitch';
  standNumber?: string;
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
  relatedId?: string;
  relatedType?: string;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  ticketNumber: string;
  timestamp: string;
  location: string;
  method: 'qr_code' | 'manual';
  staffId?: string;
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
  type: 'keynote' | 'talk' | 'panel' | 'workshop' | 'networking' | 'circuito';
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
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface Lead {
  id: string;
  projectId: string;
  startupId: string;
  visitorName: string;
  visitorEmail: string;
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
