import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type {
  Registration, Mentor, MentoringSession, Company, B2BMeeting,
  Startup, Sponsor, Transaction, CheckIn, Session, Lead, Project, Coupon,
  B2BSwipe, B2BMatch, B2BAppointmentTriunfo, User, Profile, Certificate,
  EmpresaIncentivadora, Notification
} from '@/types';
import { withTimeout } from '@/lib/promiseUtils';

// Table Mapping based on project slug prefix
// All GE projects (ge-*) use the standardized Growth Experience tables
// ProjectId can be either a UUID (from DB) or a slug (from config)
// The isGEProject() function handles both cases by reading selectedProject from context

/**
 * Returns true if the projectId belongs to a Growth Experience edition.
 * Checks both slug patterns (ge-*) AND matches the selectedProject slug.
 */
const isGEProject = (projectId: string | undefined): boolean => {
  if (!projectId) return false;
  // Slug-based detection (works when slug is stored as projectId)
  if (projectId.startsWith('ge-')) return true;
  // If projectId is a UUID, we check the cached selectedProject slug from localStorage
  try {
    const saved = localStorage.getItem('selectedProject');
    if (saved) {
      const project = JSON.parse(saved);
      if (project?.id === projectId && project?.slug?.startsWith('ge-')) return true;
    }
  } catch {
    // ignore parse errors
  }
  return false;
};

const getTableName = (projectId: string | undefined, entity: string) => {
  // Global table mappings (not project-scoped)
  if (entity === 'cupons') return 'cupons_parceria_social';
  if (entity === 'projects') return 'projects';
  if (entity === 'users') return 'users';
  if (entity === 'profiles') return 'profiles';
  if (entity === 'certificates') return 'certificates';
  if (entity === 'notifications') return 'notifications';
  if (entity === 'audit_logs') return 'audit_logs';

  // Specific mappings for Growth Experience projects (ge-*)
  if (isGEProject(projectId)) {
    switch (entity) {
      case 'registrations': return 'inscricoes_growth_experience';
      case 'startups': return 'startups_arena_pitch';
      case 'companies': return 'rodada_negocios_b2b';
      case 'mentoring_sessions': return 'mentorias_agendadas';
      case 'mentors': return 'mentores_growth_experience';
      case 'sessions': return 'programacao_evento';
      case 'b2b_meetings': return 'rodada_negocios_b2b'; // B2B companies serve as meetings for GE
      case 'empresas_incentivadoras': return 'inscricoes_empresas_incentivadoras';
      default: return entity;
    }
  }

  // Default to entity name for other project types
  return entity;
};

const isGlobalEntity = (entity: string) => {
  return ['projects', 'users', 'profiles'].includes(entity);
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
  setor: 'sector',
  estagio: 'stage',
  descricao_startup: 'description',
  nome_startup: 'name',
  nome_fundador: 'founderName',
  nome_representante: 'contactName',
  descricao_empresa: 'description',
  tipo_inscricao: 'ticketType',
  status_pagamento: 'paymentStatus',
  palestras_noturnas: 'palestrasNoturnas',
  cursos_selecionados: 'cursosSelecionados',
  cupom_palestra: 'couponCode',
  valor_pago: 'amount',
  valor_desconto_palestra: 'discountAmount',
  check_in_at: 'checkInTime',
  indicacao_tipo: 'indicacaoTipo',
  indicacao_nome: 'indicacaoNome',
  porcentagem_desconto: 'porcentagemDesconto',
  uso_limite: 'usoLimite',
  uso_atual: 'usoAtual',
  start_time: 'startTime',
  end_time: 'endTime',
  max_capacity: 'maxCapacity',
  registered_count: 'registeredCount',
  mentorado_id: 'menteeId',
  mentor_id: 'mentorId',
  nome_mentorado: 'menteeName',
  email_mentorado: 'menteeEmail',
  telefone_mentorado: 'menteePhone',
  tema_interesse: 'topic',
  anotacoes: 'notes',
  mentor_name: 'mentorName',
  years_experience: 'yearsExperience',
  max_mentories: 'maxMentories',
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
  if (!result.ticketNumber && item.id && (item.id as string).length > 20) {
    result.ticketNumber = (item.id as string).split('-')[0].toUpperCase();
  }

  // Semantic status value translation
  if (result.paymentStatus === 'pago') result.status = 'paid';
  else if (result.paymentStatus === 'pendente') result.status = 'pending';
  else if (item.status === 'cancelado') result.status = 'cancelled';

  // Handle projects specific status mapping
  if (item.status !== undefined) {
    result.status = item.status;
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

  // First pass: map directly using semantic map and snake case
  for (const [key, value] of Object.entries(data)) {
    const dbKey = SEMANTIC_MAP_TO_DB[key] || toSnakeCase(key);
    result[dbKey] = value;
  }

  // Handle nested/special structures
  if (entity === 'projects' && data.settings) {
    const s = data.settings as Record<string, unknown>;
    if (s.maxRegistrations !== undefined) result.max_registrations = s.maxRegistrations;
    if (s.maxMentors !== undefined) result.max_mentors = s.maxMentors;
    // ... continue other project specific mappings if they don't follow the rule
    if (s.ticketPrices) {
      const tp = s.ticketPrices as Record<string, number>;
      result.ticket_price_standard = Math.round((tp.standard || 0) * 100);
      result.ticket_price_pro = Math.round((tp.pro || 0) * 100);
      result.ticket_price_vip = Math.round((tp.vip || 0) * 100);
    }
  }

  // Special status mapping for registrations
  if (entity === 'registrations' && data.status) {
    if (data.status === 'paid') {
      result.status_pagamento = 'pago';
      result.status = 'ativo';
    } else if (data.status === 'pending') {
      result.status_pagamento = 'pendente';
      result.status = 'pendente';
    } else if (data.status === 'cancelled') {
      result.status_pagamento = 'pendente';
      result.status = 'cancelado';
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
  projectId?: string;
}

// ── In-memory cache (TTL: 30s) ──────────────────────────────────────────────
const CACHE_TTL = 30_000;
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
      return 'id,project_id,user_id,nome,email,telefone,tipo_inscricao,status,valor_pago,status_pagamento,palestras_noturnas,cursos_selecionados,cupom_palestra,valor_desconto_palestra,created_at';
    }
    if (entity === 'sessions') {
      return 'id,project_id,title,description,type,category,speakers,partner,room,start_time,end_time,max_capacity,registered_count,topics,color';
    }
    if (entity === 'mentors') {
      return 'id,project_id,user_id,nome,email,telefone,empresa,cargo,especialidades,bio,linkedin_url,foto_url,status,created_at,years_experience,max_mentories';
    }
    if (entity === 'check_ins') {
      return 'id,project_id,registration_id,user_id,ticket_number,timestamp,location,method';
    }
    if (entity === 'companies') {
      return 'id,project_id,user_id,nome_representante,cargo,email,telefone,nome_empresa,cnpj,setor,porte,faturamento_anual,numero_funcionarios,descricao_empresa,produtos_servicos,site_url,linkedin_url,logo_url,tipo_interesse,areas_interesse,descricao_objetivos,status,created_at';
    }
    if (entity === 'startups') {
      return 'id,project_id,user_id,nome_fundador,email,telefone,nome_startup,setor,estagio,descricao_startup,problema,solucao,modelo_negocio,diferencial,site_url,linkedin_url,faturamento_mensal,investimento_buscado,pitch_deck_url,video_pitch_url,status,created_at';
    }
    if (entity === 'empresas_incentivadoras') {
      return 'id,project_id,nome_responsavel,email,telefone,nome_empresa,quantidade_equipe,objetivo,status,created_at';
    }
    if (entity === 'mentoring_sessions') {
      return 'id,project_id,mentorado_id,mentor_id,nome_mentorado,email_mentorado,telefone_mentorado,tema_interesse,anotacoes,status,created_at';
    }
  }

  const fields: Record<string, string> = {
    registrations: 'id,project_id,user_id,ticket_type,status,ticket_number,qr_code,amount,payment_method,payment_date,checked_in,check_in_at,created_at',
    mentors: 'id,project_id,user_id,name,email,phone,company,position,specialties,tracks,years_experience,status,max_mentories,foto_url,created_at,nome,telefone,empresa,cargo',
    mentoring_sessions: 'id,project_id,mentor_id,mentee_id,status,created_at,scheduled_at,duration,topic,notes,mentor_name,mentee_name',
    companies: 'id,project_id,user_id,name,sector,description,contact_name,contact_email,status,package_type,logo_url,tipo_interesse,areas_interesse,created_at,nome_empresa,nome_representante',
    startups: 'id,project_id,user_id,name,sector,stage,status,package_type,created_at,nome_startup,descricao_startup,nome_fundador,estagio',
    sponsors: 'id,project_id,company_name,contact_name,contact_email,level,investment,status,created_at',
    transactions: 'id,project_id,type,category,description,amount,date,status,created_at',
    check_ins: 'id,project_id,registration_id,user_id,ticket_number,timestamp,location,method',
    sessions: 'id,project_id,title,description,type,track,day,start_time,end_time,room,max_capacity,registered_count,image',
    leads: 'id,project_id,startup_id,visitor_name,visitor_email,interest_level,created_at',
    projects: 'id,name,slug,type,description,location,city,state,start_date,end_date,status,created_at,updated_at,short_description',
    cupons: 'id,project_id,codigo,indicacao_tipo,indicacao_nome,porcentagem_desconto,ativo,uso_limite,uso_atual,descricao,vencimento,created_at',
    b2b_meetings: 'id,project_id,company_a_id,company_b_id,scheduled_at,duration_minutes,table_number,status,created_at',
    b2b_swipes: 'id,project_id,from_company_id,to_company_id,status,created_at',
    b2b_matches: 'id,project_id,company_a_id,company_b_id,status,created_at',
    empresas_incentivadoras: 'id,project_id,nome_responsavel,email,telefone,nome_empresa,quantidade_equipe,objetivo,status,created_at',
    users: 'id,email,name,role,department,permissions,created_at,staff_role',
    profiles: 'id,user_id,company,position,bio,website,linkedin,city,state,country,birth_date,gender,cpf,cnpj,newsletter_opt_in',
    notifications: 'id,project_id,user_id,title,message,type,is_read,created_at'
  };
  return fields[entity] ?? '*';
}

// Generic hook for CRUD operations with project filtering
export function useData<T extends WithId>(initialData: T[] = [], entityName: string = 'registrations') {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { projectId } = useProject();

  const isFetchingRef = useRef(false);
  const consecutiveFetchCountRef = useRef(0);
  const lastFetchTimeRef = useRef(0);

  const fetchData = useCallback(async (force = false) => {
    const isGlobal = isGlobalEntity(entityName);

    if (!projectId && !isGlobal) {
      return;
    }

    const now = Date.now();

    // Circuit breaker para loops de re-render (mais de 10 fetches em 2 segundos)
    if (now - lastFetchTimeRef.current < 2000) {
      consecutiveFetchCountRef.current++;
    } else {
      consecutiveFetchCountRef.current = 0;
    }

    if (consecutiveFetchCountRef.current > 10) {
      logger.error(`[useData] CRITICAL: Loop de busca detectado para ${entityName}. Abortando.`);
      return;
    }

    lastFetchTimeRef.current = now;

    // Concorrência e redundância (guardas)
    if (isFetchingRef.current && !force) {
      return;
    }

    const cacheKey = projectId ? `${projectId}:${entityName}` : `global:${entityName}`;
    const cached = dataCache.get(cacheKey);

    // Se temos cache e não é force, usamos o cache e paramos
    if (!force && cached && Date.now() - cached.ts < CACHE_TTL) {
      setData(cached.data as T[]);
      return;
    }

    setIsLoading(true);
    setError(null);
    isFetchingRef.current = true;

    try {
      const tableName = getTableName(projectId || undefined, entityName);
      const fields = getSelectFields(entityName, projectId || undefined);

      let query = supabase.from(tableName as never).select(fields) as any;

      // Filtro por projeto para tabelas não genéricas
      if (!isGlobal && projectId) {
        query = query.eq('project_id', projectId);
      }

      const resultRaw = await withTimeout(
        query as unknown as Promise<{ data: Record<string, unknown>[] | null; error: Error | null }>,
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
            }
          };
        }

        return mappedItem as unknown as T;
      });

      setData(mappedData);
      // Store in cache
      dataCache.set(cacheKey, { data: mappedData, ts: Date.now() });
    } catch (err: unknown) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      logger.error(`Erro ao buscar ${entityName}:`, err);
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
    fetchData();
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

export function useMentors() {
  return useData<Mentor>([], 'mentors');
}

export function useMentoringSessions() {
  return useData<MentoringSession>([], 'mentoring_sessions');
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
  return useData<Session>([], 'sessions');
}

export function useCertificates() {
  return useData<Certificate>([], 'certificates');
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

export function useUsers() {
  return useData<User>([], 'users');
}

export function useProfile(userId?: string) {
  const [data, setData] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const { data: supabaseData, error } = await supabase
        .from('profiles' as any)
        .select('*')
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
        .upsert({
          user_id: userId,
          ...dataToUpdate,
          updated_at: new Date().toISOString()
        } as any);

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
