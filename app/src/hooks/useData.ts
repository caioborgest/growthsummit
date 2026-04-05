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
  ActivityAttendance, Partner, PartnerTeamMember, EmailTemplate, EmailCampaign
} from '@/types';
// Unused imports removed
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
  
  // 1. Fixed UUID detection (Triunfo)
  if (projectId === 'a1b2c3d4-e5f6-7890-abcd-ef1234567890') return true;

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
  if (entity === 'cupons') return 'social_partnership_coupons';
  if (entity === 'projects') return 'projects';
  if (entity === 'users') return 'users';
  if (entity === 'profiles') return 'profiles';
  if (entity === 'certificates') return 'certificates';
  if (entity === 'notifications') return 'notifications';
  if (entity === 'audit_logs') return 'audit_logs';
  if (entity === 'login_attempts') return 'login_attempts';

  // Specific mapping for registration batches (always points to this table)
  if (entity === 'registration_batches') return 'company_registration_batches';

  // Specific mappings for Growth Experience projects (ge-*)
  if (isGE) {
    switch (entity) {
      case 'registrations': return 'growth_experience_registrations';
      case 'startups': return 'arena_pitch_startups';
      case 'companies': return 'b2b_business_rounds';
      case 'mentoring_sessions': return 'scheduled_mentorings';
      case 'mentors': return 'growth_experience_mentors';
      case 'mentoring_waitlist': return 'mentoring_waitlist';
      case 'sessions': return 'event_schedule';
      case 'b2b_meetings': return 'b2b_meetings';
      case 'b2b_matches': return 'b2b_matches';
      case 'b2b_chat_messages': return 'b2b_chat_messages';
      case 'empresas_incentivadoras': return 'incentive_company_registrations';
      case 'stands': return 'stands';
      case 'stand_checkins': return 'stand_checkins';
      case 'raffles': return 'raffles';
      case 'raffle_participants': return 'raffle_participants';
      case 'support_tickets': return 'support_tickets';
      case 'support_ticket_messages': return 'support_ticket_messages';
      case 'transactions': return 'growth_experience_transactions';
      case 'partners': return 'partners';
      case 'partner_team_members': return 'partner_team_members';
      case 'email_templates': return 'email_templates';
      case 'email_campaigns': return 'email_campaigns';
      default: return entity;
    }
  }

  // Default to entity name for other project types
  return entity;
};

const isGlobalEntity = (entity: string) => {
  return [
    'projects', 'users', 'profiles', 'support_ticket_messages', 'raffle_participants', 
    'stand_checkins', 'notifications', 'certificates', 'audit_logs', 'login_attempts', 
    'email_templates', 'email_campaigns', 'cupons'
  ].includes(entity);
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

// Legacy semantic mapping removed, using standard database keys.

const mapFromSupabase = (item: Record<string, unknown>, entityName?: string): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(item)) {
    result[toCamelCase(key)] = value;
  }

  // Partner-specific collision safety: if both 'name' and 'nome' somehow exist or if we need to force DB 'name'
  if (entityName === 'partners' && item.name) {
    result.name = item.name;
  }

  // Cross-entity specific logic
  if (item.project_id) result.projectId = item.project_id;
  if (item.user_id) result.userId = item.user_id;
  if (item.company_name) result.companyName = item.company_name;
  if (entityName === 'registration_batches') {
    result.name = item.name || item.company_name;
    result.total_slots = item.total_slots || 0;
    result.used_slots = item.used_slots || 0;
    result.price = item.total_amount || item.price || 0;
    result.ticketType = item.registration_type || item.ticketType || 'pro';
    result.active = item.is_active !== undefined ? item.is_active : true;
  }
  if (entityName === 'sessions' || entityName === 'event_schedule') {
    if (item.max_slots) result.maxCapacity = item.max_slots;
  }
  if (!result.ticketNumber && item.id && (item.id as string).length > 20) {
    result.ticketNumber = (item.id as string).split('-')[0].toUpperCase();
  }

  // 2. Semantic status value translation (GE inscricoes use Portuguese status)
  // Translate both payment_status and general status to standard English equivalents
  if (item.payment_status !== undefined) {
    result.paymentStatus = STATUS_MAPPING[String(item.payment_status)] || String(item.payment_status);
    // Backward compatibility: Ensure 'status' is also set from paymentStatus for registrations if not already set
    if (!result.status) result.status = result.paymentStatus;
  }
  
  if (item.status !== undefined) {
    const rawStatus = String(item.status);
    result.status = STATUS_MAPPING[rawStatus] ?? rawStatus;
  }
  

  // 3. Asset Redirect: Force high-res local logos to Supabase Storage URLs
  // This avoids build errors for large assets while maintaining DB compatibility
  const REDIRECT_MAP: Record<string, string> = {
    'logomarca-GX-fundoescuro.png': 'https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/LOGO-growthexperience-fundoescuro.v2.png',
    'logomarca-GX-fundobranco.png': 'https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/LOGO-growthexperience-fundoescuro.v2.png',
    'growthsummit-fundoclaro.png': 'https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/LOGO-growthexperience-fundoescuro.v2.png',
    'growthsummit-fundoescuro.png': 'https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/LOGO-growthexperience-fundoescuro.v2.png',
    'favicon.png': 'https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/favicon.png',
    'LOGO-growth_experience.png': 'https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/LOGO-growthexperience-fundoescuro.v2.png'
  };

  if (typeof result.logo === 'string' && !result.logo.startsWith('http')) {
    const filename = result.logo.split('/').pop() || '';
    if (REDIRECT_MAP[filename]) result.logo = REDIRECT_MAP[filename];
  }
  if (typeof result.banner === 'string' && !result.banner.startsWith('http')) {
    const filename = result.banner.split('/').pop() || '';
    if (REDIRECT_MAP[filename]) result.banner = REDIRECT_MAP[filename];
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

const mapToSupabase = (projectId: string | undefined, entity: string, data: Record<string, unknown>, _projectSlug?: string): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

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
    'publicContent',    // nested object in settings, not a separate column
  ]);

  for (const [key, value] of Object.entries(data)) {
    if (VIRTUAL_FIELDS.has(key)) continue;

    let dbKey = toSnakeCase(key);

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
    if (s.maxStartups !== undefined) result.max_startups = s.maxStartups;
    if (s.maxCompanies !== undefined) result.max_companies = s.maxCompanies;
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
    if (s.settings !== undefined) result.settings = s.settings;
    if (s.ticketTiers !== undefined) result.ticket_tiers = s.ticketTiers;
    delete result.settings;
  }


  // Specific mapping for registration_batches to use correct column names
  if (entity === 'registration_batches') {
    const rawStatus = String(data.paymentStatus || 'pending').toLowerCase();
    const status = (rawStatus === 'paid' || rawStatus === 'pago') ? 'paid' : 
                   (rawStatus === 'pending' || rawStatus === 'pendente') ? 'pending' : 'cancelled';
    
    return {
      project_id: projectId,
      name: data.name, // standard column is 'name'
      contact_email: data.contactEmail,
      responsible_name: data.responsibleName,
      responsible_email: data.responsibleEmail,
      voucher_code: data.voucherCode,
      total_slots: data.total_slots || data.maxSlots || 0,
      used_slots: data.used_slots || data.usedSlots || 0,
      registration_type: data.registrationType || data.ticketType || 'pro',
      total_amount: data.totalAmount || data.price || 0,
      is_active: data.active !== undefined ? data.active : true,
      expires_at: data.expiresAt || null,
      payment_status: status,
      cnpj: data.cnpj || null,
      notes: data.notes || null,
      updated_at: new Date().toISOString()
    };
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
function getSelectFields(entity: string, projectId?: string, slug?: string): string {
  // If it's a Growth Experience project, use the specific table schema
  if (isGEProject(projectId, slug)) {
    if (entity === 'registrations' || entity === 'sessions' || entity === 'companies' || entity === 'startups') {
      return '*';
    }
    if (entity === 'mentors') {
      return 'id,project_id,user_id,name,email,phone,company,role_title,specialties,bio,linkedin_url,photo_url,status,created_at,years_experience,max_mentorings';
    }
    if (entity === 'empresas_incentivadoras') {
      return 'id,project_id,responsible_name,email,phone,company_name,team_quantity,day_quantity,night_quantity,objetivo,status,paid_amount,created_at';
    }
    if (entity === 'mentoring_sessions') {
      return 'id,project_id,mentee_id,mentor_id,mentee_name,mentee_email,mentee_phone,topic_of_interest,notes,status,created_at,start_date,duration,mentoring_rating,mentor_indication,rated_at';
    }
    if (entity === 'b2b_meetings') {
      // Remover company_a_id se estiver dando erro (pode ser company_a_id ou name_a em versões diferentes)
      return 'id,project_id,company_b_id,scheduled_at,duration_minutes,table_number,status,created_at';
    }
    if (entity === 'b2b_matches') {
      return 'id,project_id,company_a_id,company_b_id,status,score,created_at';
    }
    if (entity === 'stands') {
      return 'id,project_id,name,logo_url,location,description,owner_id,owner_type,created_at';
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
    registrations: 'id,project_id,user_id,registration_type,status,ticket_number,qr_code,paid_amount,payment_method,payment_date,event_name,app_installed,checked_in,check_in_at,created_at',
    mentors: 'id,project_id,user_id,name,email,phone,company,role_title,specialties,tracks,years_experience,status,max_mentorings,photo_url,created_at',
    mentoring_sessions: 'id,project_id,mentee_id,mentor_id,mentee_name,mentee_email,mentee_phone,topic_of_interest,notes,status,created_at,start_date,duration,mentoring_rating,mentor_indication,rated_at',
    mentoring_waitlist: 'id,project_id,registration_id,mentor_id,challenge,status,created_at,updated_at',
    companies: 'id,project_id,user_id,name,sector,description,contact_name,contact_email,status,package_type,logo_url,interest_type,interest_areas,created_at,company_name,responsible_name',
    startups: 'id,project_id,user_id,name,sector,stage,status,package_type,created_at,company_name,description,responsible_name',
    sponsors: 'id,project_id,company_name,contact_name,contact_email,level,investment,status,created_at',
    transactions: 'id,project_id,type,category,description,reference_person,amount,date,status,related_id,related_type,created_at',
    check_ins: 'id,project_id,registration_id,user_id,timestamp,location,method',
    sessions: 'id,project_id,title,description,type,track,day,start_time,end_time,room,max_capacity,registered_count,image',
    leads: 'id,project_id,startup_id,visitor_name,visitor_email,interest_level,created_at',
    projects: 'id,name,slug,type,description,location,city,state,start_date,start_time,end_date,end_time,status,created_at,updated_at,short_description,goal_revenue,goal_sponsorship,goal_registrations,target_revenue,target_registrations,settings,ticket_tiers,enable_b2b,enable_mentoring,enable_startups,enable_check_in,ticket_price_standard,ticket_price_pro,ticket_price_vip,max_registrations,max_mentors,max_startups,max_companies,primary_color',
    cupons: 'id,project_id,code,referral_type,referral_name,discount_percentage,is_active,usage_limit,current_usage,description,expires_at,created_at',
    b2b_meetings: 'id,project_id,status,scheduled_at,duration_minutes,table_number,created_at',
    b2b_swipes: 'id,project_id,from_company_id,to_company_id,status,created_at',
    b2b_matches: 'id,project_id,status,created_at',
    empresas_incentivadoras: 'id,project_id,responsible_name,email,phone,company_name,team_quantity,day_quantity,night_quantity,objetivo,status,paid_amount,created_at',
    users: 'id,email,name,role,phone,avatar_url,created_at',
    speakers: 'id,project_id,name,role,company,bio,image,linkedin,twitter,website,track,is_featured,order_index',
    sponsor_deliverables: 'id,sponsor_id,item,description,status,deadline,completed_at,notes',
    faqs: 'id,project_id,question,answer,category,order_index',
    profiles: 'id,user_id,company,position,bio,website,linkedin,city,state,country,birth_date,gender,cpf,cnpj,phone,newsletter_opt_in',
    notifications: '*',
    support_tickets: 'id,project_id,user_id,name,email,subject,message,category,status,priority,created_at,updated_at',
    support_ticket_messages: 'id,ticket_id,user_id,message,is_admin,created_at',
    raffles: 'id,project_id,name,description,type,status,stand_id,winner_registration_id,drawn_at,created_at,updated_at',
    raffle_participants: 'id,raffle_id,registration_id,created_at',
    partners: 'id,project_id,name,logo_url,website,description,tier,active,created_at,updated_at,cnpj,type,category,status,contact_name,contact_email,contact_phone,access_code,max_team_members,sponsor_id,stand_id',
    registration_batches: 'id,project_id,name,total_slots,used_slots,total_amount,voucher_code,registration_type,payment_status,responsible_name,responsible_email,expires_at,is_active,contact_email,cnpj,notes,created_at,updated_at',
    partner_team_members: 'id,partner_id,project_id,user_id,name,email,phone,cpf,role,qr_code,checked_in,check_in_time,created_at',
    email_templates: 'id,project_id,name,subject,body,category,variables,created_at,updated_at',
    email_campaigns: 'id,project_id,name,template_id,recipients_filter,status,scheduled_at,sent_at,stats,created_at,updated_at'
  };
  return fields[entity] ?? '*';
}

// Generic hook for CRUD operations with project filtering
export function useData<T extends WithId>(initialData: T[] = [], entityName: string = 'registrations', options?: { realtime?: boolean, projectId?: string }) {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { projectId: contextProjectId, selectedProject } = useProject();
  
  // Use explicit projectId from options if provided, otherwise fallback to context
  const projectId = options?.projectId || contextProjectId;

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
    const globalTables = [
      'projects', 'users', 'profiles', 'vouchers', 'cupons', 
      'notifications', 'certificates', 'audit_logs', 'login_attempts'
    ];
    
    if (!globalTables.includes(entityName) && !projectId) {
      // Se não for global e não tiver projectId, não busca
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
      const fields = getSelectFields(entityName, projectId || undefined, selectedProject?.slug);

      let query = supabase.from(tableName as never).select(fields) as any;

      // Filtro por projeto para tabelas não genéricas
      if (!isGlobal && projectId) {
        // Apenas aplicar o filtro .eq se o projectId parecer ser um UUID ou se for explicitamente um slug GE
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(projectId);
        const isGESlug = projectId.startsWith('ge-') || projectId.startsWith('growth-');
        
        if (isUUID) {
          query = query.eq('project_id', projectId);
        } else if (isGESlug) {
          // No Growth Experience, algumas tabelas aceitam slug mas a maioria usa UUID.
          // Se recebemos um slug, tentamos filtrar, mas o RLS ou a falta de coluna uuid=text pode dar erro.
          // Por garantia, se não for UUID mas for slug, tentamos filtrar.
          query = query.eq('project_id', projectId);
        } else {
          // Se não é UUID nem slug válido, retorna vazio para evitar erro 500/400 do PG
          setData([]);
          setIsLoading(false);
          isFetchingRef.current = false;
          return;
        }
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
        const mappedItem = mapFromSupabase(item, entityName);

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
            ticketTiers: item['ticket_tiers'] || [],
            settings: item['settings'] || {},
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
      
      // Silence 403 errors for background data fetching (prevents console spam for non-admins)
      if (errStr.includes('403') || errStr.includes('permission denied')) {
        logger.debug(`Acesso negado para ${entityName} (403) - Isso pode ser normal para seu nível de acesso.`);
        return;
      }

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
      const tableName = getTableName(projectId!, entityName, selectedProject?.slug);
      const dataToInsert = mapToSupabase(projectId!, entityName, {
        ...(item as any),
        projectId: projectId // Garantir que o projectId seja setado corretamente
      }, selectedProject?.slug);

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
      const tableName = getTableName(projectId!, entityName, selectedProject?.slug);
      const dataToUpdate = mapToSupabase(projectId!, entityName, updates as Record<string, unknown>, selectedProject?.slug);

      let query = (supabase as any)
        .from(tableName as never)
        .update(dataToUpdate as never)
        .eq('id', id);

      // Filtro por projeto para tabelas não genéricas
      if (!isGlobal && projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data: updatedData, error } = await query.select();

      if (error) throw error;
      
      // Update local state immediately with returned data if available, or fall back to updates object
      const finalUpdate = updatedData && updatedData[0] ? mapFromSupabase(updatedData[0]) : { ...updates };
      setData(prev => prev.map(item => item.id === id ? { ...item, ...finalUpdate } as T : item));
      invalidateCache(projectId!, entityName);
      
      // Still fetch to ensure consistency, but local state is already optimistic
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
      const tableName = getTableName(projectId!, entityName, selectedProject?.slug);

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

  // Habilitar Realtime se solicitado via options (ex: useSessions)
  useEffect(() => {
    if (!options?.realtime || !projectId) return;

    const tableName = getTableName(projectId || undefined, entityName, selectedProject?.slug);
    
    // logger.debug(`[useData:${entityName}] Ativando Realtime para ${tableName}`);
    const channel = supabase
      .channel(`realtime:${entityName}:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
        filter: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(projectId)
          ? `project_id=eq.${projectId}`
          : undefined
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

export function useSessions(projectId?: string) {
  return useData<Session>([], 'sessions', { realtime: true, projectId });
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
  return useData<ActivityAttendance>([], 'activity_check_ins');
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

export function usePartners() {
  return useData<Partner>([], 'partners');
}

export function usePartnerTeam() {
  return useData<PartnerTeamMember>([], 'partner_team_members');
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
        setData(mapFromSupabase(supabaseData, 'profiles') as unknown as Profile);
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

  return { data, isLoading, update, refetch: fetchData };
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

export function useEmailTemplates() {
  return useData<EmailTemplate>([], 'email_templates', { realtime: true });
}

export function useEmailCampaigns() {
  return useData<EmailCampaign>([], 'email_campaigns', { realtime: true });
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


