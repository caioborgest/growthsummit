import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { useAuth } from '@/contexts/AuthContext';
import type {
  Registration, Mentor, MentoringSession, Company, B2BMeeting,
  Startup, Sponsor, Transaction, CheckIn, Session, Lead, Project, Coupon,
  B2BSwipe, B2BMatch, B2BAppointmentTriunfo, User, Profile, Certificate,
  EmpresaIncentivadora, Notification, B2BChatMessage, RegistrationBatch,
  Stand, StandCheckIn, SupportTicket, SupportMessage, Raffle, RaffleParticipant, MentoringWaitlist,
  ActivityAttendance
} from '@/types';
import { withTimeout } from '@/lib/promiseUtils';
import { STATUS_MAPPING } from '@/lib/constants';

// Table Mapping based on project slug prefix
// All GE projects (ge-*) use the standardized Growth Experience tables
// ProjectId can be either a UUID (from DB) or a slug (from config)
// The isGEProject() function handles both cases by reading selectedProject from context

/**
 * Returns true if the projectId belongs to a Growth Experience edition.
 * Checks both slug patterns (ge-*) AND matches the selectedProject slug.
 */
const isGEProject = (projectId: string | undefined, slug?: string): boolean => {
  if (!projectId && !slug) return false;
  
  // 1. Slug-based detection (direct slug or projectId acting as slug)
  const identifier = (slug || projectId || '').toLowerCase();
  if (identifier.startsWith('ge-') || 
      identifier.startsWith('growth-') || 
      identifier.includes('triunfo') || 
      identifier.includes('petrolina')) return true;

  // 2. Persistence-based detection (works for UUIDs)
  try {
    const selectedProjectStr = localStorage.getItem('selectedProject');
    if (selectedProjectStr) {
      const p = JSON.parse(selectedProjectStr);
      const storageSlug = (p.slug || '').toLowerCase();
      if ((p.id === projectId || p.slug === projectId) &&
        (storageSlug.startsWith('ge-') || storageSlug.startsWith('growth-') || storageSlug.includes('triunfo') || storageSlug.includes('petrolina'))) return true;
    }
  } catch {
    // ignore
  }
  
  return false;
};

const getTableName = (projectId: string | undefined, entity: string, slug?: string) => {
  const isGE = isGEProject(projectId, slug);
  // Global table mappings (not project-scoped)
  if (entity === 'cupons') return 'cupons_parceria_social';
  if (entity === 'projects') return 'projects';
  if (entity === 'users') return 'users';
  if (entity === 'profiles') return 'profiles';
  if (entity === 'certificates') return 'certificates';
  if (entity === 'notifications') return 'notifications';
  if (entity === 'audit_logs') return 'audit_logs';

  // Specific mapping for registration batches (always points to this table)
  if (entity === 'registration_batches') return 'lotes_inscricao_empresa';

  // Specific mappings for Growth Experience projects (ge-*)
  if (isGE) {
    switch (entity) {
      case 'registrations': return 'inscricoes_growth_experience';
      case 'startups': return 'startups_arena_pitch';
      case 'companies': return 'rodada_negocios_b2b';
      case 'mentoring_sessions': return 'mentorias_agendadas';
      case 'mentors': return 'mentores_growth_experience';
      case 'mentoring_waitlist': return 'mentoring_waitlist';
      case 'sessions': return 'programacao_evento';
      case 'b2b_meetings': return 'b2b_meetings';
      case 'b2b_matches': return 'b2b_matches';
      case 'b2b_chat_messages': return 'b2b_chat_messages';
      case 'empresas_incentivadoras': return 'inscricoes_empresas_incentivadoras';
      case 'stands': return 'stands';
      case 'stand_checkins': return 'stand_checkins';
      case 'raffles': return 'raffles';
      case 'raffle_participants': return 'raffle_participants';
      case 'support_tickets': return 'support_tickets';
      case 'support_ticket_messages': return 'support_ticket_messages';
      case 'transactions': return 'transacoes_growth_experience';
      default: return entity;
    }
  }

  // Default to entity name for other project types
  return entity;
};

const isGlobalEntity = (entity: string) => {
  return ['projects', 'users', 'profiles', 'support_ticket_messages', 'raffle_participants', 'stand_checkins', 'notifications', 'certificates'].includes(entity);
};

function toCamelCase(str: string): string {
  if (str.includes('_')) {
    return str.toLowerCase().replace(/(_[a-z])/g, group =>
      group.toUpperCase().replace('_', '')
    );
  }
  return str;
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

const SEMANTIC_MAP_FROM_DB: Record<string, string> = {
  nome: 'name',
  telefone: 'phone',
  empresa: 'company',
  cargo: 'position',
  especialidades: 'specialties',
  bio: 'bio',
  foto_url: 'photo',
  linkedin_url: 'linkedin',
  avatar_url: 'avatar',
  setor: 'sector',
  estagio: 'stage',
  descricao_startup: 'startupDescription',
  nome_startup: 'startupName',
  nome_fundador: 'founderName',
  nome_representante: 'contactName',
  descricao_empresa: 'companyDescription',
  nome_empresa: 'companyName',
  tipo_inscricao: 'ticketType',
  status_pagamento: 'paymentStatus',
  palestras_noturnas: 'palestrasNoturnas',
  cursos_selecionados: 'cursosSelecionados',
  cupom_palestra: 'couponCode',
  valor_pago: 'amount',
  valor_desconto_palestra: 'discountAmount',
  check_in_at: 'checkInTime',
  external_payment_id: 'externalPaymentId',
  external_payment_url: 'externalPaymentUrl',
  indicacao_tipo: 'indicacaoTipo',
  indicacao_nome: 'indicacaoNome',
  porcentagem_desconto: 'porcentagemDesconto',
  uso_limite: 'usoLimite',
  uso_atual: 'usoAtual',
  start_time: 'startTime',
  end_time: 'endTime',
  max_capacity: 'maxCapacity',
  registered_count: 'registeredCount',
  // Mentorship (standard)
  mentee_id: 'menteeId',
  mentor_id: 'mentorId',
  mentee_name: 'menteeName',
  scheduled_at: 'scheduledAt',
  topic: 'topic',
  notes: 'notes',
  // Mentorship (GE semantic mapping)
  mentorado_id: 'menteeId',
  // mentor_id: 'mentorId', // Already defined above
  nome_mentorado: 'menteeName',
  email_mentorado: 'menteeEmail',
  telefone_mentorado: 'menteePhone',
  tema_interesse: 'topic',
  anotacoes: 'notes',
  data_mentoria: 'scheduledAt',
  localizacao: 'location',
  descricao: 'description',
  avaliacao_mentoria: 'mentoringRating',
  indicacao_mentor: 'mentorIndicationRating',
  // Other GE fields
  nome_mentor: 'mentorName',
  duracao: 'duration',
  mentor_name: 'mentorName',
  years_experience: 'yearsExperience',
  max_mentories: 'maxMentories',
  porte: 'companySize',
  faturamento_anual: 'annualRevenue',
  numero_funcionarios: 'employeeCount',
  produtos_servicos: 'productsServices',
  tipo_interesse: 'interestType',
  areas_interesse: 'interestAreas',
  descricao_objetivos: 'objectives',
  // Notifications
  read: 'read',
  read_at: 'readAt',
  quantidade_dia: 'quantidadeDia',
  quantidade_noite: 'quantidadeNoite',
  valor_investido: 'investmentAmount',
  // Mentoria additional business info
  // nome_startup: 'startupName', // Already defined at line 104
  // Registration Batch
  nome_responsavel: 'nomeResponsavel',
  email_responsavel: 'emailResponsavel',
  email_contato: 'emailContato',
  voucher_code: 'voucherCode',
  quantidade_vagas: 'quantidadeVagas',
  vagas_utilizadas: 'vagasUtilizadas',
  tipo_ingresso: 'tipoIngresso',
  valor_total: 'valorTotal',
  owner_id: 'ownerId',
  owner_type: 'ownerType',
  company_id: 'companyId',
  visitor_phone: 'visitorPhone',
  visitor_cpf: 'visitorCpf',
  // Raffle / Stand fields
  stand_id: 'standId',
  winner_registration_id: 'winnerRegistrationId',
  drawn_at: 'drawnAt',
  project_id: 'projectId',
};

const SEMANTIC_MAP_TO_DB: Record<string, string> = Object.entries(SEMANTIC_MAP_FROM_DB).reduce((acc, [db, app]) => {
  acc[app] = db;
  return acc;
}, {} as Record<string, string>);

const mapFromSupabase = (item: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(item)) {
    // 1. Try semantic map first
    const semanticKey = SEMANTIC_MAP_FROM_DB[key];
    if (semanticKey) {
      result[semanticKey] = value;
    } else {
      // 2. Fallback to generic camelCase
      result[toCamelCase(key)] = value;
    }
  }

  // Cross-entity specific logic
  if (item.project_id) result.projectId = item.project_id;
  if (item.user_id) result.userId = item.user_id;
  // Handle company name cross-naming (AdminBatches uses nomeEmpresa)
  if (item.nome_empresa) result.nomeEmpresa = item.nome_empresa;
  if (!result.ticketNumber && item.id && (item.id as string).length > 20) {
    result.ticketNumber = (item.id as string).split('-')[0].toUpperCase();
  }

  // 2. Semantic status value translation (GE inscricoes use Portuguese status)
  // Translate both payment_status and general status to standard English equivalents
  if (item.status_pagamento !== undefined) {
    result.paymentStatus = STATUS_MAPPING[String(item.status_pagamento)] || String(item.status_pagamento);
    // Backward compatibility: Ensure 'status' is also set from paymentStatus for registrations if not already set
    if (!result.status) result.status = result.paymentStatus;
  }
  
  if (item.status !== undefined) {
    const rawStatus = String(item.status);
    result.status = STATUS_MAPPING[rawStatus] ?? rawStatus;
  }
  
  // Sync statusPagamento for entities using that naming (RegistrationBatch)
  if (result.paymentStatus && !result.statusPagamento) {
    result.statusPagamento = result.paymentStatus;
  }

  return result;
};

// mapToSnakeCase is currently unused but kept for parity with mapFromSupabase if needed in future
// const mapToSnakeCase = (obj: Record<string, unknown>): Record<string, unknown> => {
//   const result: Record<string, unknown> = {};
//   for (const key in obj) {
//     if (Object.prototype.hasOwnProperty.call(obj, key)) {
//       result[toSnakeCase(key)] = obj[key];
//     }
//   }
//   return result;
// };

const mapToSupabase = (projectId: string | undefined, entity: string, data: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  // Entities that use the global SEMANTIC_MAP (Portuguese column names)
  // Projects, sessions, users etc use standard English snake_case columns
  const useSemanticMap = !['projects', 'sessions', 'users', 'profiles', 'certificates', 'notifications', 'audit_logs', 'stand_checkins', 'leads', 'transactions', 'check_ins', 'check_ins_atividades'].includes(entity);

  // Virtual / computed fields that exist only in the frontend model (never DB columns)
  // These are generated by mapFromSupabase and must NOT be sent back to the DB
  const VIRTUAL_FIELDS = new Set([
    'ticketNumber',  // computed from id by mapFromSupabase — not a real column
    'createdAt',     // snake_case version created_at is sent explicitly
    'updatedAt',     // same
    'projectId',     // project_id is added separately below
    'staffRole',     // not stored as a separate column  
    'permissions',   // stored in metadata/jwt
    'twoFactorEnabled', // stored in auth
  ]);

  // First pass: map directly using semantic map and snake case — skip virtual fields
  for (const [key, value] of Object.entries(data)) {
    if (VIRTUAL_FIELDS.has(key)) continue;

    // Resolve semantic map collisions based on entity type
    let dbKey: string;

    if (useSemanticMap) {
      // Priority overrides for specific entities to resolve app-to-db collisions
      if (entity === 'mentors' && key === 'name') dbKey = 'nome';
      else if (entity === 'mentors' && key === 'description') dbKey = 'bio';
      else if (entity === 'mentors' && key === 'specialties') dbKey = 'especialidades';
      else if (entity === 'startups' && key === 'name') dbKey = 'nome_startup';
      else if (entity === 'startups' && key === 'description') dbKey = 'descricao_startup';
      else if (entity === 'companies' && key === 'name') dbKey = 'nome_empresa';
      else if (entity === 'companies' && key === 'description') dbKey = 'descricao_empresa';
      else if (entity === 'mentoring_sessions' && key === 'scheduledAt') dbKey = isGEProject(projectId) ? 'data_mentoria' : 'scheduled_at';
      else if (entity === 'mentoring_sessions' && key === 'topic') dbKey = isGEProject(projectId) ? 'tema_interesse' : 'topic';
      else if (entity === 'mentoring_sessions' && key === 'notes') dbKey = isGEProject(projectId) ? 'anotacoes' : 'notes';
      else if (entity === 'mentoring_sessions' && key === 'menteeId') dbKey = isGEProject(projectId) ? 'mentorado_id' : 'mentee_id';
      else if (entity === 'mentoring_sessions' && key === 'menteeName') dbKey = isGEProject(projectId) ? 'nome_mentorado' : 'mentee_name';
      else if (entity === 'mentoring_sessions' && key === 'mentorName') dbKey = 'mentor_name';
      else if (entity === 'mentoring_sessions' && key === 'duration') dbKey = isGEProject(projectId) ? 'duracao' : 'duration';
      else if (entity === 'mentoring_sessions' && key === 'mentorId') dbKey = 'mentor_id';
      else if (entity === 'registrations' && key === 'amount') dbKey = 'valor_pago';
      else if (entity === 'companies' && key === 'amount') dbKey = 'valor_investido';
      else if (entity === 'empresas_incentivadoras' && key === 'amount') dbKey = 'valor_investido';
      else if (entity === 'transactions' && key === 'amount') dbKey = 'amount';
      else {
        // Use generic semantic map or snake_case fallback
        dbKey = SEMANTIC_MAP_TO_DB[key] || toSnakeCase(key);
      }
    } else {
      dbKey = toSnakeCase(key);
    }

    // Clean up: convert empty strings to null for ID/foreign key fields to avoid UUID errors
    if (typeof value === 'string' && value.trim() === '') {
      result[dbKey] = null;
    } else {
      result[dbKey] = value;
    }
  }

  // Handle nested/special structures
  if (entity === 'projects' && data.settings) {
    const s = data.settings as Record<string, unknown>;
    if (s.maxRegistrations !== undefined) result.max_registrations = s.maxRegistrations;
    if (s.maxMentors !== undefined) result.max_mentors = s.maxMentors;
    if (s.ticketPrices) {
      const tp = s.ticketPrices as Record<string, number>;
      result.ticket_price_standard = Math.round((tp.standard || 0) * 100);
      result.ticket_price_pro = Math.round((tp.pro || 0) * 100);
      result.ticket_price_vip = Math.round((tp.vip || 0) * 100);
    }
    if (s.enableB2B !== undefined) result.enable_b2b = s.enableB2B;
    if (s.enableMentoring !== undefined) result.enable_mentoring = s.enableMentoring;
    if (s.enableStartups !== undefined) result.enable_startups = s.enableStartups;
    if (s.enableCheckIn !== undefined) result.enable_check_in = s.enableCheckIn;
    if (s.goalRevenue !== undefined) result.goal_revenue = s.goalRevenue;
    if (s.goalSponsorship !== undefined) result.goal_sponsorship = s.goalSponsorship;
    if (s.goalRegistrations !== undefined) result.goal_registrations = s.goalRegistrations;
    if (s.publicContent !== undefined) result.public_content = s.publicContent;
    // Remove the raw settings object — it was expanded above into flat columns
    delete result.settings;
  }

  // Special status mapping for registrations and batches
  if ((entity === 'registrations' || entity === 'registration_batches') && (data.status || data.statusPagamento)) {
    const s = String(data.status || data.statusPagamento).toLowerCase();
    if (s === 'paid' || s === 'pago') {
      result.status_pagamento = 'pago';
      if (entity === 'registrations') result.status = 'ativo';
    } else if (s === 'pending' || s === 'pendente') {
      result.status_pagamento = 'pendente';
      if (entity === 'registrations') result.status = 'pendente';
    } else if (s === 'cancelled' || s === 'cancelado') {
      result.status_pagamento = 'cancelado';
      if (entity === 'registrations') result.status = 'cancelado';
    }
  }

  // Project isolation
  if (!isGlobalEntity(entity) && projectId) {
    result.project_id = projectId;
  }

  return result;
};



// Generic interface with id
interface WithId {
  id: string;
  createdAt: string;
  projectId?: string;
}

// ── In-memory cache (TTL dinâmico por entidade) ─────────────────────────────
// Dados estáticos (programação, projetos) têm TTL maior para reduzir queries
// Dados do usuário (inscrições, notificações) têm TTL curto para manter frescor
const CACHE_TTL_MAP: Record<string, number> = {
  sessions: 30 * 1000,        // 30s — programação precisa ser fresca
  projects: 10 * 60 * 1000,   // 10 min — reduzido de 60 min
  sponsors: 5 * 60 * 1000,    // 5 min — reduzido de 15 min
  mentors: 60 * 1000,         // 1 min — reduzido de 5 min
  startups: 60 * 1000,
  companies: 60 * 1000,
  cupons: 2 * 60 * 1000,
  registrations: 15 * 1000,       // 15s — reduzido de 30s
  notifications: 5 * 1000,        // 5s — quase tempo real
  check_ins: 10 * 1000,           // 10s
  mentoring_sessions: 15 * 1000,
  b2b_meetings: 15 * 1000,
  stands: 5 * 60 * 1000,      // 5 min (mostly static)
  stand_checkins: 10 * 1000,   // 10s
};
const DEFAULT_CACHE_TTL = 30_000; // fallback para entidades não mapeadas
const dataCache = new Map<string, { data: unknown[]; ts: number }>();

function invalidateCache(projectId: string | undefined, entityName: string) {
  const key = projectId ? `${projectId}:${entityName}` : `global:${entityName}`;
  dataCache.delete(key);
}

// ── Minimal column selection per entity (avoids SELECT *) ───────────────────
function getSelectFields(entity: string, projectId?: string): string {
  // If it's a Growth Experience project, use the specific table schema
  if (isGEProject(projectId)) {
    if (entity === 'registrations') {
      return '*';
    }
    if (entity === 'sessions') {
      return 'id,project_id,title,description,type,category,speakers,partner,room,start_time,end_time,max_capacity,registered_count,topics,color';
    }
    if (entity === 'mentors') {
      return 'id,project_id,user_id,nome,email,telefone,empresa,cargo,especialidades,bio,linkedin_url,foto_url,status,created_at,years_experience,max_mentories';
    }
    if (entity === 'check_ins') {
      return '*';
    }
    if (entity === 'companies') {
      return 'id,project_id,user_id,nome_representante,cargo,email,telefone,nome_empresa,cnpj,setor,porte,faturamento_anual,numero_funcionarios,descricao_empresa,produtos_servicos,site_url,linkedin_url,logo_url,tipo_interesse,areas_interesse,descricao_objetivos,status,created_at';
    }
    if (entity === 'startups') {
      return '*';
    }
    if (entity === 'empresas_incentivadoras') {
      return 'id,project_id,nome_responsavel,email,telefone,nome_empresa,quantidade_equipe,quantidade_dia,quantidade_noite,objetivo,status,valor_investido,created_at';
    }
    if (entity === 'mentoring_sessions') {
      return 'id,project_id,mentorado_id,mentor_id,nome_mentorado,email_mentorado,telefone_mentorado,tema_interesse,anotacoes,status,created_at,data_mentoria,duracao,avaliacao_mentoria,indicacao_mentor,avaliado_em';
    }
    if (entity === 'b2b_meetings') {
      // Remover company_a_id se estiver dando erro (pode ser company_a_id ou name_a em versões diferentes)
      return 'id,project_id,company_b_id,scheduled_at,duration_minutes,table_number,status,created_at';
    }
    if (entity === 'b2b_matches') {
      return 'id,project_id,company_a_id,company_b_id,status,score,created_at';
    }
    if (entity === 'stands') {
      return 'id,project_id,nome,logo_url,localizacao,descricao,owner_id,owner_type,created_at';
    }
    if (entity === 'stand_checkins') {
      return 'id,registration_id,stand_id';
    }
    if (entity === 'leads') {
      return 'id,project_id,visitor_name,visitor_email,visitor_phone,visitor_company,interest_level,notes,created_at,startup_id,company_id';
    }
    if (entity === 'mentoring_waitlist') {
      return 'id,project_id,registration_id,mentor_id,challenge,status,created_at,updated_at';
    }
  }

  const fields: Record<string, string> = {
    registrations: 'id,project_id,user_id,ticket_type,status,ticket_number,qr_code,amount,payment_method,payment_date,checked_in,check_in_at,created_at',
    mentors: 'id,project_id,user_id,name,email,phone,company,position,specialties,tracks,years_experience,status,max_mentories,photo,created_at',
    mentoring_sessions: 'id,project_id,mentorado_id,mentor_id,nome_mentorado,email_mentorado,telefone_mentorado,tema_interesse,anotacoes,status,created_at,data_mentoria,duracao,avaliacao_mentoria,indicacao_mentor,avaliado_em',
    mentoring_waitlist: 'id,project_id,registration_id,mentor_id,challenge,status,created_at,updated_at',
    companies: 'id,project_id,user_id,name,sector,description,contact_name,contact_email,status,package_type,logo_url,tipo_interesse,areas_interesse,created_at,nome_empresa,nome_representante',
    startups: 'id,project_id,user_id,name,sector,stage,status,package_type,created_at,nome_startup,descricao_startup,nome_fundador,estagio',
    sponsors: 'id,project_id,company_name,contact_name,contact_email,level,investment,status,created_at',
    transactions: 'id,project_id,type,category,description,amount,date,status,created_at',
    check_ins: 'id,project_id,registration_id,user_id,timestamp,location,method',
    sessions: 'id,project_id,title,description,type,track,day,start_time,end_time,room,max_capacity,registered_count,image',
    leads: 'id,project_id,startup_id,visitor_name,visitor_email,interest_level,created_at',
    projects: 'id,name,slug,type,description,location,city,state,start_date,end_date,status,created_at,updated_at,short_description,goal_revenue,goal_sponsorship,goal_registrations,target_revenue,target_registrations,public_content',
    cupons: 'id,project_id,codigo,indicacao_tipo,indicacao_nome,porcentagem_desconto,ativo,uso_limite,uso_atual,descricao,vencimento,created_at',
    b2b_meetings: 'id,project_id,status,scheduled_at,duration_minutes,table_number,created_at',
    b2b_swipes: 'id,project_id,from_company_id,to_company_id,status,created_at',
    b2b_matches: 'id,project_id,status,created_at',
    empresas_incentivadoras: 'id,project_id,nome_responsavel,email,telefone,nome_empresa,quantidade_equipe,quantidade_dia,quantidade_noite,objetivo,status,valor_investido,created_at',
    users: 'id,email,name,role,phone,avatar_url,created_at',
    speakers: 'id,project_id,name,role,company,bio,image,linkedin,twitter,website,track,is_featured,order_index',
    sponsor_deliverables: 'id,sponsor_id,item,description,status,deadline,completed_at,notes',
    faqs: 'id,project_id,question,answer,category,order_index',
    profiles: 'id,user_id,company,position,bio,website,linkedin,city,state,country,birth_date,gender,cpf,cnpj,phone,newsletter_opt_in',
    notifications: '*',
    support_tickets: 'id,project_id,user_id,name,email,subject,message,category,status,priority,created_at,updated_at',
    support_ticket_messages: 'id,ticket_id,user_id,message,is_admin,created_at',
    raffles: 'id,project_id,name,description,type,status,stand_id,winner_registration_id,drawn_at,created_at,updated_at',
    raffle_participants: 'id,raffle_id,registration_id,created_at'
  };
  return fields[entity] ?? '*';
}

// Generic hook for CRUD operations with project filtering
export function useData<T extends WithId>(initialData: T[] = [], entityName: string = 'registrations', options?: { realtime?: boolean }) {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { projectId, selectedProject } = useProject();

  const isFetchingRef = useRef(false);
  const consecutiveFetchCountRef = useRef(0);
  const lastFetchTimeRef = useRef(0);

  const fetchData = useCallback(async (force = false, signal?: AbortSignal) => {
    const isGlobal = isGlobalEntity(entityName);

    if (!projectId && !isGlobal) {
      // logger.debug(`[useData:${entityName}] Ignorando busca: sem projectId`);
      return;
    }

    if (isFetchingRef.current && !force) return;

    if (entityName === 'mentoring_waitlist') {
      setIsLoading(false);
      isFetchingRef.current = false;
      return;
    }

    // logger.debug(`[useData:${entityName}] Iniciando busca...`, { force, projectId });

    const now = Date.now();

    // Circuit breaker: detecta loops de re-render (>20 fetches em 10s)
    if (now - lastFetchTimeRef.current < 10000) {
      consecutiveFetchCountRef.current++;
    } else {
      consecutiveFetchCountRef.current = 0;
    }

    if (consecutiveFetchCountRef.current > 20) {
      console.error(`[useData] CRITICAL: Loop de busca detectado para ${entityName}. Bloqueando tentativas para proteger o navegador.`);
      setError(new Error(`Carregamento bloqueado: Muitas tentativas para ${entityName}. Verifique o console ou atualize a página.`));
      setIsLoading(false);
      isFetchingRef.current = false;
      return;
    }


    // Proteção: não buscar entidades não globais sem projectId
    const globalTables = ['projects', 'users', 'checkins', 'profiles', 'empresas_incentivadoras', 'vouchers', 'cupons', 'campanhas_whatsapp', 'programacao', 'atividades', 'locais', 'palestrantes', 'mentorias', 'matches_b2b', 'matches', 'registration_batches', 'leads_scanner', 'notifications', 'certificates', 'support_ticket_messages', 'stand_checkins', 'raffle_participants'];
    if (!globalTables.includes(entityName) && !projectId) {
      logger.debug(`[useData] Ignorando busca de ${entityName} (requer projectId)`);
      setIsLoading(false);
      return;
    }


    lastFetchTimeRef.current = now;


    const cacheKey = projectId ? `${projectId}:${entityName}` : `global:${entityName}`;
    const cached = dataCache.get(cacheKey);

    // TTL dinâmico: entidades estáticas ficam mais tempo em cache
    const ttl = CACHE_TTL_MAP[entityName] ?? DEFAULT_CACHE_TTL;
    if (!force && cached && Date.now() - cached.ts < ttl) {
      setData(cached.data as T[]);
      return;
    }

    setIsLoading(true);
    setError(null);
    isFetchingRef.current = true;

    try {
      const tableName = getTableName(projectId || undefined, entityName, selectedProject?.slug);
      const fields = getSelectFields(entityName, projectId || undefined);

      let query = supabase.from(tableName as never).select(fields) as any;

      // Filtro por projeto para tabelas não genéricas
      if (!isGlobal && projectId) {
        query = query.eq('project_id', projectId);
      }

      const resultRaw = await withTimeout(
        (timeoutSignal) => {
          // Usar o signal externo se fornecido (para cancelamento via unmount)
          // mas garantir que abortSignal() do Supabase receba um signal válido
          const combinedSignal = signal || timeoutSignal;
          return (query as any).abortSignal(combinedSignal) as Promise<{ data: Record<string, unknown>[] | null; error: Error | null }>;
        },
        15000,
        `FetchData:${entityName}`
      );
      const { data: supabaseData, error: supabaseError } = resultRaw;

      if (supabaseError) throw supabaseError;

      // Basic mapping from snake_case to CamelCase
      const mappedData = (supabaseData || []).map((item: Record<string, unknown>) => {
        const mappedItem = mapFromSupabase(item);

        // Project Specific Mapping for Projects Entity (Complex nested structure)
        if (entityName === 'projects') {
          mappedItem['settings'] = {
            maxRegistrations: item['max_registrations'],
            maxMentors: item['max_mentors'],
            maxStartups: item['max_startups'],
            maxCompanies: item['max_companies'],
            enableB2B: item['enable_b2b'],
            enableMentoring: item['enable_mentoring'],
            enableStartups: item['enable_startups'],
            enableCheckIn: item['enable_check_in'],
            ticketPrices: {
              standard: (item['ticket_price_standard'] as number || 0) / 100,
              pro: (item['ticket_price_pro'] as number || 0) / 100,
              vip: (item['ticket_price_vip'] as number || 0) / 100,
            },
            goalRevenue: item['goal_revenue'],
            goalSponsorship: item['goal_sponsorship'],
            goalRegistrations: item['goal_registrations'],
            publicContent: item['public_content'] || {},
          };
        }

        return mappedItem as unknown as T;
      });

      setData(mappedData);
      // Store in cache
      dataCache.set(cacheKey, { data: mappedData, ts: Date.now() });
    } catch (err: unknown) {
      const errStr = String(err).toLowerCase();
      const isAborted = (err as any)?.name === 'AbortError' || 
                        (err as any)?.message?.includes('aborted') ||
                        (err as any)?.message?.includes('AbortError') ||
                        errStr.includes('aborted') ||
                        errStr.includes('abort_error') ||
                        errStr.includes('timeout_exceeded');

      if (isAborted) {
        return;
      }

      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      
      // Log mais limpo: se for erro objeto do Supabase, tenta logar a mensagem
      const errorMsg = (err as any)?.message || errorObj.message;
      logger.error(`Erro ao buscar ${entityName}: ${errorMsg}`, err);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [projectId, entityName]);

  const create = useCallback(async (item: Omit<T, 'id' | 'createdAt'>) => {
    const isGlobal = isGlobalEntity(entityName);
    if (!projectId && !isGlobal) throw new Error('No project selected');

    setIsLoading(true);
    try {
      const tableName = getTableName(projectId!, entityName);
      const dataToInsert = mapToSupabase(projectId!, entityName, item as Record<string, unknown>);

      const { data: inserted, error } = await (supabase
        .from(tableName as never)
        .insert(dataToInsert as never)
        .select()
        .single() as any);

      if (error) throw error;

      const mappedInserted = mapFromSupabase(inserted) as unknown as T;
      setData(prev => [mappedInserted, ...prev]);
      invalidateCache(projectId!, entityName);
      await fetchData(true);
      return mappedInserted;
    } catch (err) {
      logger.error(`Erro ao criar ${entityName}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, entityName, fetchData]);

  const update = useCallback(async (id: string, updates: Partial<T>) => {
    setIsLoading(true);
    try {
      const isGlobal = isGlobalEntity(entityName);
      const tableName = getTableName(projectId!, entityName);
      const dataToUpdate = mapToSupabase(projectId!, entityName, updates as Record<string, unknown>);

      let query = (supabase as any)
        .from(tableName as never)
        .update(dataToUpdate as never)
        .eq('id', id);

      // Filtro por projeto para tabelas não genéricas
      if (!isGlobal && projectId) {
        query = query.eq('project_id', projectId);
      }

      const { error } = await query;

      if (error) throw error;
      // Update local state immediately
      setData(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      invalidateCache(projectId!, entityName);
      await fetchData(true);
    } catch (err) {
      logger.error(`Erro ao atualizar ${entityName}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, entityName, fetchData]);

  const remove = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const isGlobal = isGlobalEntity(entityName);
      const tableName = getTableName(projectId!, entityName);

      let query = (supabase as any)
        .from(tableName as never)
        .delete()
        .eq('id', id);

      if (!isGlobal && projectId) {
        query = query.eq('project_id', projectId);
      }

      const { error } = await query;

      if (error) throw error;
      // Update local state immediately for snappy UI
      setData(prev => prev.filter(item => item.id !== id));
      invalidateCache(projectId!, entityName);
      await fetchData(true);
    } catch (err) {
      logger.error(`Erro ao remover ${entityName}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, entityName, fetchData]);

  const getById = useCallback((id: string) => {
    return data.find(item => item.id === id);
  }, [data]);

  const filter = useCallback((predicate: (item: T) => boolean) => {
    return data.filter(predicate);
  }, [data]);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();

    const doFetch = async () => {
      if (!isSubscribed) return;
      await fetchData(false, controller.signal);
    };

    doFetch();
    
    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [fetchData]);

  return useMemo(() => ({
    data,
    allData: data,
    isLoading,
    create,
    update,
    remove,
    getById,
    filter,
    refetch: fetchData,
    error,
  }), [data, isLoading, create, update, remove, getById, filter, fetchData, error]);
}

// ── Specialized Hooks ────────────────────────────────────────────────────────

export function useProjects() {
  const hook = useData<Project>([], 'projects');
  return hook;
}

export function useRegistrations() {
  return useData<Registration>([], 'registrations');
}

export function useInscricoes() {
  return useRegistrations();
}

export function useMyRegistration() {
  const { user } = useAuth();
  const { projectId } = useProject();
  const { data: registrations, isLoading, error, refetch } = useRegistrations();

  const registration = useMemo(() => {
    if (!user || !registrations || !projectId) return null;
    return registrations.find(r => r.userId === user.id && r.projectId === projectId);
  }, [user, registrations, projectId]);

  return { registration, isLoading, error, refetch };
}

export function useMentors() {
  return useData<Mentor>([], 'mentors');
}

export function useMentoringSessions() {
  return useData<MentoringSession>([], 'mentoring_sessions');
}

export function useMentoringWaitlistHook() { 
  return useData<MentoringWaitlist>([], 'mentoring_waitlist'); 
}

export function useCompanies() {
  return useData<Company>([], 'companies');
}

export function useB2BMeetings() {
  return useData<B2BMeeting>([], 'b2b_meetings');
}

export function useStartups() {
  return useData<Startup>([], 'startups');
}

export function useSponsors() {
  return useData<Sponsor>([], 'sponsors');
}

export function useTransactions() {
  return useData<Transaction>([], 'transactions');
}

export function useCheckIns() {
  return useData<CheckIn>([], 'check_ins');
}

export function useSessions() {
  return useData<Session>([], 'sessions', { realtime: true });
}

export function useSpeakers() {
  return useData<any>([], 'speakers');
}

export function useSponsorDeliverables(sponsorId?: string) {
  const hook = useData<any>([], 'sponsor_deliverables');
  const filtered = useMemo(() => {
    if (!sponsorId) return hook.data;
    return hook.data.filter(d => d.sponsorId === sponsorId);
  }, [hook.data, sponsorId]);

  return { ...hook, data: filtered };
}

export function useFAQs() {
  return useData<any>([], 'faqs');
}

export function useCertificates() {
  const { user } = useAuth();
  const hook = useData<Certificate>([], 'certificates');
  const filteredData = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin' || user.role === 'staff') return hook.data;
    return hook.data.filter(c => c.userId === user.id);
  }, [hook.data, user]);
  return { ...hook, data: filteredData };
}

export function useLeads() {
  return useData<Lead>([], 'leads');
}

export function useB2BSwipes() {
  return useData<B2BSwipe>([], 'b2b_swipes');
}

export function useB2BMatches() {
  return useData<B2BMatch>([], 'b2b_matches');
}

export function useB2BAppointmentsTriunfo() {
  return useData<B2BAppointmentTriunfo>([], 'b2b_appointments');
}

export function useCoupons() {
  return useData<Coupon>([], 'cupons');
}

export function useCheckInsAtividades() {
  return useData<ActivityAttendance>([], 'check_ins_atividades');
}

export function usePitchScores() {
  return useData<any>([], 'pitch_scores');
}

export function useUsers() {
  return useData<User>([], 'users');
}

export function useStands() {
  return useData<Stand>([], 'stands');
}

export function useStandCheckIns() {
  return useData<StandCheckIn>([], 'stand_checkins');
}

export function useProfile(userId?: string) {
  const [data, setData] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const { data: supabaseData, error } = await (supabase
        .from('profiles' as any)
        .select('id,user_id,company,position,bio,website,linkedin,city,state,country,birth_date,gender,newsletter_opt_in,created_at,updated_at') as any)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (supabaseData) {
        setData(mapFromSupabase(supabaseData) as unknown as Profile);
      }
    } catch (err) {
      logger.error('Erro ao buscar perfil:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const update = useCallback(async (updates: Partial<Profile>) => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const dataToUpdate = mapToSupabase(undefined, 'profiles', updates as Record<string, unknown>);

      const { error } = await supabase
        .from('profiles' as any)
        .upsert(
          {
            user_id: userId,
            ...dataToUpdate,
            updated_at: new Date().toISOString()
          } as any,
          { onConflict: 'user_id' }
        );

      if (error) throw error;
      await fetchData();
    } catch (err) {
      logger.error('Erro ao atualizar perfil:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Habilitar Realtime se solicitado
  useEffect(() => {
    if (!options?.realtime || !projectId) return;

    const tableName = getTableName(projectId || undefined, entityName, selectedProject?.slug);
    
    const channel = supabase
      .channel(`realtime:${entityName}:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: `project_id=eq.${projectId}`
        },
        () => {
          // logger.debug(`[useData:${entityName}] Mudança detectada no banco. Atualizando...`);
          fetchData(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [options?.realtime, entityName, projectId, selectedProject?.slug, fetchData]);

  return useMemo(() => ({
    data,
    isLoading,
    update,
    refetch: fetchData
  }), [data, isLoading, update, fetchData]);
}

export function useEmpresasIncentivadoras() {
  return useData<EmpresaIncentivadora>([], 'empresas_incentivadoras');
}

export function useNotifications() {
  return useData<Notification>([], 'notifications');
}

export function useRegistrationBatches() {
  return useData<RegistrationBatch>([], 'registration_batches');
}

/** Hook para discovery B2B: retorna empresas aprovadas SEM dados sensíveis (telefone, email, cnpj). LGPD-safe. */
export function useB2BDiscoveryCompanies() {
  const { projectId } = useProject();
  const [data, setData] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data: rows, error: rpcError } = await (supabase.rpc as any)('get_b2b_discovery_companies', {
        p_project_id: projectId,
      });
      if (rpcError) throw rpcError;
      const mapped = (rows || []).map((r: Record<string, unknown>) => {
        const m = mapFromSupabase(r) as Record<string, unknown>;
        if (!m.name && m.companyName) m.name = m.companyName;
        return m;
      });
      setData(mapped as Company[]);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      logger.error('Erro ao buscar empresas discovery B2B:', err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useB2BChat(matchId?: string) {
  const hook = useData<B2BChatMessage>([], 'b2b_chat_messages');
  
  const matchMessages = useMemo(() => {
    if (!matchId) return hook.data;
    return hook.data.filter(m => m.matchId === matchId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [hook.data, matchId]);

  return {
    ...hook,
    data: matchMessages,
    messages: matchMessages
  };
}

export function useSupportTickets() {
  const { user } = useAuth();
  const hook = useData<SupportTicket>([], 'support_tickets');
  
  // For non-admins, we filter by their user_id. 
  // RLS should also handle this, but it's good for the UI.
  const filtered = useMemo(() => {
    if (!user || user.role === 'admin' || user.role === 'staff') return hook.data;
    return hook.data.filter(t => t.userId === user.id);
  }, [hook.data, user]);

  return { ...hook, data: filtered };
}

export function useSupportMessages(ticketId?: string) {
  const hook = useData<SupportMessage>([], 'support_ticket_messages');
  
  const filtered = useMemo(() => {
    if (!ticketId) return [];
    return hook.data.filter(m => m.ticketId === ticketId);
  }, [hook.data, ticketId]);

  return { ...hook, data: filtered };
}

export function useRaffles() { return useData<Raffle>([], 'raffles'); }
export function useRaffleParticipants(raffleId?: string) {
  const hook = useData<RaffleParticipant>([], 'raffle_participants');
  const filteredData = raffleId ? hook.data.filter(p => p.raffleId === raffleId) : hook.data;
  return { ...hook, data: filteredData };
}

export function useSupportQualityStats() {
  const { data: tickets } = useSupportTickets();
  const { data: allMessages } = useData<SupportMessage>([], 'support_ticket_messages');

  const stats = useMemo(() => {
    if (!tickets.length) return null;

    const resolved = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
    const resolutionRate = (resolved / tickets.length) * 100;

    // Calculate Average First Response Time
    let totalResponseTime = 0;
    let responsiveCount = 0;

    tickets.forEach(ticket => {
      const ticketMessages = allMessages.filter(m => m.ticketId === ticket.id);
      const firstAdminMsg = ticketMessages.find(m => m.isAdmin);

      if (firstAdminMsg) {
        const diff = new Date(firstAdminMsg.createdAt).getTime() - new Date(ticket.createdAt).getTime();
        totalResponseTime += diff;
        responsiveCount++;
      }
    });

    const avgResponseTime = responsiveCount > 0 ? totalResponseTime / responsiveCount / (1000 * 60) : 0; // in minutes

    // Group by category
    const byCategory = tickets.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by priority
    const byPriority = tickets.reduce((acc, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ticketsWithRating = tickets.filter(t => (t as any).rating > 0);
    const avgRating = ticketsWithRating.length > 0 
      ? ticketsWithRating.reduce((sum, t) => sum + (t as any).rating, 0) / ticketsWithRating.length
      : 0;

    return {
      total: tickets.length,
      resolved,
      resolutionRate,
      avgResponseTime,
      avgRating,
      byCategory,
      byPriority,
      openCount: tickets.filter(t => t.status === 'open').length,
      urgentCount: tickets.filter(t => t.priority === 'urgent' && t.status !== 'closed').length
    };
  }, [tickets, allMessages]);

  return stats;
}


