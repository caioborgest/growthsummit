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
  startTime?: string;
  endDate: string;
  endTime?: string;
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
  targetRegistrations?: number;
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
    /** Pop-up de saída (exit intent); desligado por padrão — use Gestão de Pop-ups quando possível */
    exitIntentPopup?: {
      active?: boolean;
    };
    palestrantes?: {
      nome: string;
      role_title: string;
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
    manualSteps?: string[];
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
  role_title?: string;
  whatsapp?: string;
  ticketType: 'standard' | 'pro' | 'vip' | string;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded' | 'active' | 'error' | string;
  qrCode: string;
  ticketNumber: string;
  amount: number;
  paidAmount?: number;
  paymentStatus?: 'pending' | 'paid' | 'cancelled' | 'error' | string;
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
  socialCode?: string;
  voucherCode?: string;
  discountAmount?: number;
  externalPaymentId?: string;
  externalPaymentUrl?: string;
  batchId?: string;
  companyVoucher?: string;
  batchInfo?: {
    id: string;
    name: string;
    companyName: string;
    voucherCode: string;
  };
  registrationType?: string;
  eventName?: string;
  appInstalled?: boolean;
  nome?: string; // Legacy snake case mapping
  phone?: string; // Legacy snake case mapping
}

export interface Mentor {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  bio: string;
  specialties: string[];
  tracks: string[];
  yearsExperience: number;
  company: string;
  roleTitle: string;
  linkedinUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  maxMentorings: number;
  createdAt: string;
}

export interface Company {
  id: string;
  projectId: string;
  userId: string;
  companyName: string; // Primary field from DB 'company_name'
  name?: string; // Fallback for 'nome' (sometimes used)
  cnpj: string;
  type: 'anchor' | 'vendor';
  sector: string;
  description: string;
  companyDescription?: string; // Semantic mapping for DB 'descricao_empresa'
  website?: string;
  logo?: string;
  logoUrl?: string; // New field for public url
  contactName: string; // From DB 'representative_name'
  contactEmail: string;
  contactPhone: string;
  position?: string; // From DB 'cargo'
  status: 'pending' | 'approved' | 'rejected';
  packageType?: 'anchor' | 'vendor';
  maxMeetings: number;
  interestType?: 'buy' | 'sell' | 'partnership' | 'all' | 'comprar' | 'vender' | 'parceria' | 'todos' | string;
  interestAreas?: string[];
  objectives?: string; // From DB 'objectives_description'
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
  stage: 'idea' | 'mvp' | 'validation' | 'traction' | 'scale' | 'ideia' | 'validacao' | 'tracao' | 'escala' | string;
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
  email?: string;
  phone?: string;
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
  createdAt: string;
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
  createdAt: string;
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
  date?: string; // Date-only string (YYYY-MM-DD)
  startTime: string;
  endTime: string;
  room: string;
  speakers: string[];
  partner?: string;
  maxCapacity?: number;
  registeredCount: number;
  topics?: string[];
  speakerName?: string;
  speakerRole?: string;
  speakerImage?: string;
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
  code: string;
  referralType: 'government' | 'political' | 'company' | 'promotional' | 'influencer' | 'association' | 'institution' | 'other';
  referralName: string;
  discountPercentage: number;
  isActive: boolean;
  usageLimit: number | null;
  currentUsage: number;
  description?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface EmpresaIncentivadora {
  id: string;
  projectId: string;
  responsibleName: string;
  email: string;
  phone: string;
  companyName: string;
  teamQuantity: number;
  dayQuantity: number;
  nightQuantity: number;
  objective: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | string;
  createdAt: string;
}

export interface RegistrationBatch {
  id: string;
  projectId: string;
  name: string;
  cnpj?: string;
  responsibleName?: string;
  responsibleEmail?: string;
  contactEmail: string;
  voucherCode: string;
  total_slots: number;
  used_slots: number;
  ticketType: string;
  price: number;
  active: boolean;
  paymentStatus: 'pending' | 'paid' | 'cancelled' | string;
  notes?: string;
  expiresAt?: string;
  unit_price?: number;
  discount_percentage?: number;
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
  topicOfInterest?: string;
  notes?: string;
  startupName?: string;
  sector?: string;
  menteeRating?: number;
  ratedAt?: string;
  feedback?: {
    rating: number;
    comment: string;
    /** 1-5 — "Como você avalia a mentoria realizada?" */
    mentoringRating?: number;
    /** 1-5 — "Quanto você indicaria este mentor a um empresário?" */
    mentorRecommendation?: number;
    /** ISO Date — "Avaliado em" */
    ratedAt?: string;
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
  type?: 'sponsor' | 'exhibitor' | 'media' | 'institutional' | 'other';
  category?: 'permuta' | 'investimento' | 'misto';
  status?: 'active' | 'inactive';
  logoUrl?: string;
  website?: string;
  description?: string;
  tier?: string;
  active: boolean;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
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

export type NPSFormStatus = 'draft' | 'active' | 'archived';
export type NPSQuestionType = 'nps_score' | 'textarea' | 'short_text' | 'single_choice' | 'multi_choice' | 'csat' | 'ces' | 'yes_no' | 'hidden_metadata';
export type NPSClassification = 'detractor' | 'passive' | 'promoter';
export type NPSAutomationTrigger = 'manual' | 'post_event' | 'post_session' | 'check_in' | 'check_out' | 'session_attendance';
export type NPSChannel = 'email' | 'whatsapp' | 'sms' | 'push' | 'in_app' | 'qr';
export type NPSCaseStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type NPSCasePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface NPSForm {
  id: string;
  projectId: string;
  internalName: string;
  description?: string;
  objective?: string;
  status: NPSFormStatus;
  defaultChannel: NPSChannel;
  language: string;
  visualSettings?: {
    primaryColor?: string;
    logo?: string | null;
  };
  npsQuestion?: string;
  minScore?: number;
  maxScore?: number;
  minLabel?: string;
  maxLabel?: string;
  thanksPromoter?: string;
  thanksPassive?: string;
  thanksDetractor?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NPSQuestion {
  id: string;
  formId: string;
  type: NPSQuestionType;
  label: string;
  helpText?: string;
  placeholder?: string;
  isRequired: boolean;
  orderIndex: number;
  options?: any[];
  conditionalRules?: any;
  tags?: string[];
  slug: string;
  createdAt: string;
}

export interface NPSAutomation {
  id: string;
  projectId: string;
  formId: string;
  name: string;
  isActive: boolean;
  triggerType: NPSAutomationTrigger;
  channel: NPSChannel;
  delayAmount: number;
  delayUnit: string;
  audienceRules?: any;
  quietHours?: any;
  dedupWindowHours: number;
  activeFrom?: string;
  activeUntil?: string;
  messageTemplate: string;
  subjectTemplate?: string;
  senderName?: string;
  utmParams?: any;
  createdAt: string;
  updatedAt: string;
}

export interface NPSDispatch {
  id: string;
  automationId: string;
  registrationId: string;
  userId?: string;
  channel: NPSChannel;
  status: string;
  failureReason?: string;
  sentAt?: string;
  openedAt?: string;
  clickedAt?: string;
  createdAt: string;
}

export interface NPSResponse {
  id: string;
  formId: string;
  projectId: string;
  registrationId?: string;
  userId?: string;
  dispatchId?: string;
  sessionId?: string;
  speakerId?: string;
  sponsorId?: string;
  score: number;
  classification: NPSClassification;
  mainComment?: string;
  answers?: Record<string, any>;
  channel: NPSChannel;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface NPSLoopCase {
  id: string;
  projectId: string;
  responseId: string;
  ownerId?: string;
  status: NPSCaseStatus;
  priority: NPSCasePriority;
  slaDueAt?: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  rootCause?: string;
  actionTaken?: string;
  recoveryOutcome?: string;
  createdAt: string;
  updatedAt: string;
  response?: NPSResponse; // For joined queries
}
