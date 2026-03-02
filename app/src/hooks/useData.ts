import { useState, useCallback, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type {
  Registration, Mentor, MentoringSession, Company, B2BMeeting,
  Startup, Sponsor, Transaction, CheckIn, Session, Lead, Project, Coupon,
  B2BSwipe, B2BMatch, B2BAppointmentTriunfo, User, Profile, Certificate
} from '@/types';
import { withTimeout } from '@/lib/promiseUtils';

// Table Mapping based on project and entity
const GE_TRIUNFO = 'ge-triunfo-2026';
const GE_TRIUNFO_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const GE_PETROLINA = 'ge-petrolina-2026';
const GE_PETROLINA_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

const getTableName = (projectId: string, entity: string) => {
  // Global table mappings
  if (entity === 'cupons') return 'cupons_parceria_social';
  if (entity === 'projects') return 'projects';
  if (entity === 'users') return 'users';
  if (entity === 'profiles') return 'profiles';
  if (entity === 'certificates') return 'certificates';

  // Specific mappings for Growth Experience projects
  if (projectId && (
    projectId === GE_TRIUNFO ||
    projectId === GE_TRIUNFO_ID ||
    projectId === GE_PETROLINA ||
    projectId === GE_PETROLINA_ID ||
    projectId.startsWith('ge-')
  )) {
    switch (entity) {
      case 'registrations': return 'inscricoes_growth_experience';
      case 'startups': return 'startups_arena_pitch';
      case 'companies': return 'rodada_negocios_b2b';
      case 'mentoring_sessions': return 'mentorias_agendadas';
      case 'mentors': return 'mentores_growth_experience';
      case 'sessions': return 'programacao_evento';
      case 'b2b_meetings': return 'b2b_appointments_triunfo';
      case 'b2b_swipes': return 'b2b_swipes';
      case 'b2b_matches': return 'b2b_matches';
      case 'b2b_appointments': return 'b2b_appointments_triunfo';
      case 'empresas_incentivadoras': return 'inscricoes_empresas_incentivadoras';
      default: return entity;
    }
  }

  // Default to entity name for other projects
  return entity;
};

const mapToSnakeCase = (obj: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = obj[key];
    }
  }
  return result;
};

const mapToSupabase = (projectId: string, entity: string, data: Record<string, unknown>): Record<string, unknown> => {
  const result = mapToSnakeCase(data);

  // Project isolation
  if (entity !== 'projects' && entity !== 'users' && entity !== 'profiles') {
    result.project_id = projectId;
  }

  // Specific semantic remapping for Growth Experience tables
  if (projectId === GE_TRIUNFO || projectId.startsWith('ge-')) {
    if (entity === 'registrations') {
      if (data.name) result.nome = data.name;
      if (data.email) result.email = data.email;
      if (data.phone) result.telefone = data.phone;
      if (data.company) result.empresa = data.company;
    }

    if (entity === 'startups') {
      if (data.name) result.nome_startup = data.name;
      if (data.description) result.descricao_startup = data.description;
      if (data.sector) result.setor = data.sector;
      if (data.stage) result.estagio = data.stage;
      if (data.foundingTeam && Array.isArray(data.foundingTeam) && data.foundingTeam.length > 0) {
        result.nome_fundador = data.foundingTeam[0].name;
      }
    }

    if (entity === 'companies') {
      if (data.name) result.nome_empresa = data.name;
      if (data.contactName) result.nome_representante = data.contactName;
      if (data.sector) result.setor = data.sector;
      if (data.description) result.descricao_empresa = data.description;
    }

    if (entity === 'mentors') {
      if (data.name) result.nome = data.name;
      if (data.email) result.email = data.email;
      if (data.phone) result.telefone = data.phone;
      if (data.company) result.empresa = data.company;
      if (data.position) result.cargo = data.position;
      if (data.specialties) result.especialidades = data.specialties;
      if (data.bio) result.bio = data.bio;
      if (data.photo) result.foto_url = data.photo;
      if (data.linkedin) result.linkedin_url = data.linkedin;
    }

    if (entity === 'mentoring_sessions') {
      if (data.menteeName) result.nome_mentorado = data.menteeName;
      if (data.topic) result.tema_interesse = data.topic;
      if (data.scheduledAt) result.horario_preferido = String(data.scheduledAt);
    }

    if (entity === 'cupons') {
      if (data.indicacaoTipo) result.indicacao_tipo = data.indicacaoTipo;
      if (data.indicacaoNome) result.indicacao_nome = data.indicacaoNome;
      if (data.porcentagemDesconto) result.porcentagem_desconto = data.porcentagemDesconto;
      if (data.usoLimite) result.uso_limite = data.usoLimite;
    }
  }

  return result;
};

// Generic interface with id
interface WithId {
  id: string;
  projectId: string;
}

// ── In-memory cache (TTL: 30s) ──────────────────────────────────────────────
const CACHE_TTL = 30_000;
const dataCache = new Map<string, { data: unknown[]; ts: number }>();

function invalidateCache(projectId: string, entityName: string) {
  dataCache.delete(`${projectId}:${entityName}`);
}

// ── Minimal column selection per entity (avoids SELECT *) ───────────────────
function getSelectFields(entity: string, projectId?: string): string {
  // If it's a Growth Experience project, use the specific table schema
  if (projectId && (projectId === GE_TRIUNFO || projectId === GE_TRIUNFO_ID || projectId.startsWith('ge-'))) {
    if (entity === 'registrations') {
      return 'id,project_id,user_id,nome,email,telefone,tipo_inscricao,status,valor_pago,status_pagamento,palestras_noturnas,cursos_selecionados,cupom_palestra,valor_desconto_palestra,created_at';
    }
    if (entity === 'sessions') {
      return 'id,project_id,title,description,type,category,speakers,partner,room,start_time,end_time,max_capacity,registered_count,topics,color,metadata';
    }
    if (entity === 'mentors') {
      return 'id,project_id,user_id,nome,email,telefone,empresa,cargo,especialidades,bio,linkedin_url,foto_url,status,created_at';
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
      return 'id,project_id,mentorado_id,mentor_id,nome_mentorado,email_mentorado,telefone_mentorado,tema_interesse,notes,status,created_at';
    }
  }

  const fields: Record<string, string> = {
    registrations: 'id,project_id,user_id,ticket_type,status,ticket_number,qr_code,amount,payment_method,payment_date,checked_in,check_in_at,created_at',
    mentors: 'id,project_id,user_id,name,email,phone,company,position,specialties,tracks,years_experience,status,max_mentories,foto_url,created_at,nome,telefone,empresa,cargo',
    mentoring_sessions: 'id,project_id,mentor_id,mentor_name,mentee_id,mentee_name,scheduled_at,duration,status,topic,created_at',
    companies: 'id,project_id,user_id,name,sector,description,contact_name,contact_email,status,package_type,logo_url,tipo_interesse,areas_interesse,created_at,nome_empresa,nome_representante',
    startups: 'id,project_id,user_id,name,sector,stage,status,package_type,created_at,nome_startup,descricao_startup,nome_fundador,estagio',
    sponsors: 'id,project_id,company_name,contact_name,contact_email,level,investment,status,created_at',
    transactions: 'id,project_id,type,category,description,amount,date,status,created_at',
    check_ins: 'id,project_id,registration_id,user_id,ticket_number,timestamp,location,method',
    sessions: 'id,project_id,title,description,type,track,day,start_time,end_time,room,max_capacity,registered_count,image',
    leads: 'id,project_id,startup_id,visitor_name,visitor_email,interest_level,created_at',
    projects: 'id,name,slug,type,description,location,city,state,start_date,end_date,status,banner,logo,primary_color,secondary_color,settings,created_at,updated_at',
    cupons: 'id,project_id,codigo,indicacao_tipo,indicacao_nome,porcentagem_desconto,ativo,uso_limite,uso_atual,descricao,vencimento,created_at',
    b2b_meetings: 'id,project_id,company_a_id,company_b_id,scheduled_at,duration_minutes,table_number,status,created_at',
    b2b_swipes: 'id,project_id,from_company_id,to_company_id,status,created_at',
    b2b_matches: 'id,project_id,company_a_id,company_b_id,status,created_at',
    empresas_incentivadoras: 'id,project_id,nome_responsavel,email,telefone,nome_empresa,quantidade_equipe,objetivo,status,created_at',
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
    if (!projectId) {
      // logger.debug(`[useData] ${entityName}: No project ID, skipping fetch.`);
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
      // logger.debug(`[useData] Já buscando ${entityName}...`);
      return;
    }

    const cacheKey = `${projectId}:${entityName}`;
    const cached = dataCache.get(cacheKey);

    // Se temos cache e não é force, usamos o cache e paramos
    if (!force && cached && Date.now() - cached.ts < CACHE_TTL) {
      // logger.debug(`[useData] ${entityName}: Usando cache para projeto ${projectId}`);
      setData(cached.data as T[]);
      return;
    }

    // console.log(`[useData] Fetching ${entityName} for project ${projectId} (Force: ${force})`);
    setIsLoading(true);
    setError(null);
    isFetchingRef.current = true;

    try {
      const tableName = getTableName(projectId, entityName);
      const fields = getSelectFields(entityName, projectId);

      const query = supabase.from(tableName as never).select(fields) as any;

      // Filtro por projeto para tabelas não genéricas
      let filteredQuery = query;
      if (tableName !== 'projects' && tableName !== 'users' && tableName !== 'profiles') {
        filteredQuery = query.eq('project_id', projectId);
      }

      const result = await withTimeout(
        filteredQuery as unknown as Promise<any>,
        15000,
        `FetchData:${entityName}`
      );
      const { data: supabaseData, error: supabaseError } = result as any;

      if (supabaseData) {
        // console.log(`[useData] Successfully fetched ${supabaseData.length} records for ${entityName}`);
      }

      if (supabaseError) throw supabaseError;

      // Basic mapping from snake_case to CamelCase if needed
      const mappedData = (supabaseData || []).map((item: Record<string, unknown>) => {
        const mappedItem: Record<string, unknown> = { ...item };
        // Map common fields
        if (item['project_id']) mappedItem['projectId'] = item['project_id'];
        if (item['user_id']) mappedItem['userId'] = item['user_id'];
        if (item['ticket_type']) mappedItem['ticketType'] = item['ticket_type'];
        if (item['ticket_number']) mappedItem['ticketNumber'] = item['ticket_number'];
        if (!item['ticket_number'] && item['id']) mappedItem['ticketNumber'] = (item['id'] as string).split('-')[0].toUpperCase();
        if (item['qr_code']) mappedItem['qrCode'] = item['qr_code'];
        if (item['created_at']) mappedItem['createdAt'] = item['created_at'];
        if (item['updated_at']) mappedItem['updatedAt'] = item['updated_at'];
        if (item['payment_method']) mappedItem['paymentMethod'] = item['payment_method'];
        if (item['payment_status']) mappedItem['paymentStatus'] = item['payment_status'];
        if (item['payment_date']) mappedItem['paymentDate'] = item['payment_date'];
        if (item['checked_in']) mappedItem['checkedIn'] = item['checked_in'];

        // QR & Certification Specific
        if (item['session_id']) mappedItem['sessionId'] = item['session_id'];
        if (item['registration_id']) mappedItem['registrationId'] = item['registration_id'];
        if (item['check_in_type']) mappedItem['checkInType'] = item['check_in_type'];
        if (item['issue_date']) mappedItem['issueDate'] = item['issue_date'];
        if (item['download_count'] !== undefined) mappedItem['downloadCount'] = item['download_count'];

        // Specific for Triunfo Registrations
        if (item['tipo_inscricao']) mappedItem['ticketType'] = item['tipo_inscricao'];
        if (item['nome']) mappedItem['name'] = item['nome'];
        if (item['telefone']) mappedItem['phone'] = item['telefone'];
        if (item['palestras_noturnas'] !== undefined) mappedItem['palestrasNoturnas'] = item['palestras_noturnas'];
        if (item['cursos_selecionados']) mappedItem['cursosSelecionados'] = item['cursos_selecionados'];
        if (item['valor_pago'] !== undefined) {
          mappedItem['valorPago'] = item['valor_pago'];
          mappedItem['amount'] = item['valor_pago'];
        }
        if (item['cupom_palestra']) mappedItem['couponCode'] = item['cupom_palestra'];
        if (item['valor_desconto_palestra'] !== undefined) mappedItem['discountAmount'] = item['valor_desconto_palestra'];

        // Specific for Startup
        if (item['nome_startup']) mappedItem['name'] = item['nome_startup'];
        if (item['descricao_startup']) mappedItem['description'] = item['descricao_startup'];
        if (item['nome_fundador']) mappedItem['foundingTeam'] = [{ name: item['nome_fundador'] as string, role: 'Founder' }];

        // Specific for B2B/Company
        if (item['nome_empresa']) mappedItem['name'] = item['nome_empresa'];
        if (item['nome_representante']) mappedItem['contactName'] = item['nome_representante'];
        if (item['logo_url']) mappedItem['logoUrl'] = item['logo_url'];
        if (item['tipo_interesse']) mappedItem['tipoInteresse'] = item['tipo_interesse'];
        if (item['areas_interesse']) mappedItem['areasInteresse'] = item['areas_interesse'];

        // Specific for Matchmaking
        if (item['from_company_id']) mappedItem['fromCompanyId'] = item['from_company_id'];
        if (item['to_company_id']) mappedItem['toCompanyId'] = item['to_company_id'];
        if (item['company_a_id']) mappedItem['companyAId'] = item['company_a_id'];
        if (item['company_b_id']) mappedItem['companyBId'] = item['company_b_id'];
        if (item['match_id']) mappedItem['matchId'] = item['match_id'];
        if (item['scheduled_at']) mappedItem['scheduledAt'] = item['scheduled_at'];
        if (item['duration_minutes']) mappedItem['durationMinutes'] = item['duration_minutes'];
        if (item['table_number']) mappedItem['tableNumber'] = item['table_number'];

        // B2B Specific Name Mapping
        if (item['company_anchor_name']) mappedItem['companyAnchorName'] = item['company_anchor_name'];
        if (item['company_vendor_name']) mappedItem['companyVendorName'] = item['company_vendor_name'];
        if (item['interest_level']) mappedItem['interestLevel'] = item['interest_level'];
        if (item['follow_up'] !== undefined) mappedItem['followUp'] = item['follow_up'];

        // Mentoring & Mentors Specific Mapping
        if (item['nome']) mappedItem['name'] = item['nome'];
        if (item['telefone']) mappedItem['phone'] = item['telefone'];
        if (item['empresa']) mappedItem['company'] = item['empresa'];
        if (item['cargo']) mappedItem['position'] = item['cargo'];
        if (item['especialidades']) mappedItem['specialties'] = item['especialidades'];
        if (item['bio']) mappedItem['bio'] = item['bio'];
        if (item['linkedin_url']) mappedItem['linkedin'] = item['linkedin_url'];
        if (item['foto_url']) mappedItem['photo'] = item['foto_url'];

        if (item['nome_mentorado']) mappedItem['menteeName'] = item['nome_mentorado'];
        if (item['email_mentorado']) mappedItem['menteeEmail'] = item['email_mentorado'];
        if (item['telefone_mentorado']) mappedItem['menteePhone'] = item['telefone_mentorado'];
        if (item['tema_interesse']) mappedItem['topic'] = item['tema_interesse'];
        if (item['notes']) mappedItem['notes'] = item['notes'];
        if (item['mentor_name']) mappedItem['mentorName'] = item['mentor_name'];
        if (item['mentee_name']) mappedItem['menteeName'] = item['mentee_name'];
        if (item['three_steps']) mappedItem['threeSteps'] = item['three_steps'];
        if (item['mentor_id']) mappedItem['mentorId'] = item['mentor_id'];
        if (item['mentee_id']) mappedItem['menteeId'] = item['mentee_id'];
        if (item['years_experience']) mappedItem['yearsExperience'] = item['years_experience'];
        if (item['max_mentories']) mappedItem['maxMentories'] = item['max_mentories'];

        // Specific for Coupons
        if (item['indicacao_tipo']) mappedItem['indicacaoTipo'] = item['indicacao_tipo'];
        if (item['indicacao_nome']) mappedItem['indicacaoNome'] = item['indicacao_nome'];
        if (item['porcentagem_desconto'] !== undefined) mappedItem['porcentagemDesconto'] = item['porcentagem_desconto'];
        if (item['uso_limite'] !== undefined) mappedItem['usoLimite'] = item['uso_limite'];
        if (item['uso_atual'] !== undefined) mappedItem['usoAtual'] = item['uso_atual'];
        if (item['codigo']) mappedItem['codigo'] = item['codigo'];

        // Specific for Sessions
        if (item['start_time']) mappedItem['startTime'] = item['start_time'];
        if (item['end_time']) mappedItem['endTime'] = item['end_time'];
        if (item['max_capacity'] !== undefined) mappedItem['maxCapacity'] = item['max_capacity'];
        if (item['registered_count'] !== undefined) mappedItem['registeredCount'] = item['registered_count'];


        return mappedItem as unknown as T;
      });

      setData(mappedData);
      // Store in cache
      dataCache.set(cacheKey, { data: mappedData, ts: Date.now() });
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      const errorObj = err instanceof Error ? err : new Error(errorMessage);
      setError(errorObj);
      logger.error(`Erro ao buscar ${entityName}:`, err);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [projectId, entityName]);

  const create = useCallback(async (item: Omit<T, 'id' | 'createdAt'>) => {
    if (!projectId) throw new Error('No project selected');
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

      invalidateCache(projectId!, entityName);
      await fetchData(true);
      return inserted as unknown as T;
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
      const tableName = getTableName(projectId!, entityName);
      const dataToUpdate = mapToSupabase(projectId!, entityName, updates as Record<string, unknown>);

      // Se for a tabela de projetos, tratar os campos específicos
      if (tableName === 'projects') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const projectUpdates = updates as any;
        if (projectUpdates.settings) {
          const settings = projectUpdates.settings;
          if (settings.maxRegistrations !== undefined) dataToUpdate.max_registrations = settings.maxRegistrations;
          if (settings.maxMentors !== undefined) dataToUpdate.max_mentors = settings.maxMentors;
          if (settings.maxStartups !== undefined) dataToUpdate.max_startups = settings.maxStartups;
          if (settings.maxCompanies !== undefined) dataToUpdate.max_companies = settings.maxCompanies;
          if (settings.enableB2B !== undefined) dataToUpdate.enable_b2b = settings.enableB2B;
          if (settings.enableMentoring !== undefined) dataToUpdate.enable_mentoring = settings.enableMentoring;
          if (settings.enableStartups !== undefined) dataToUpdate.enable_startups = settings.enableStartups;
          if (settings.enableCheckIn !== undefined) dataToUpdate.enable_check_in = settings.enableCheckIn;

          if (settings.ticketPrices) {
            if (settings.ticketPrices.standard !== undefined) dataToUpdate.ticket_price_standard = Math.round(settings.ticketPrices.standard * 100);
            if (settings.ticketPrices.pro !== undefined) dataToUpdate.ticket_price_pro = Math.round(settings.ticketPrices.pro * 100);
            if (settings.ticketPrices.vip !== undefined) dataToUpdate.ticket_price_vip = Math.round(settings.ticketPrices.vip * 100);
          }
          delete dataToUpdate.settings;
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from(tableName)
        .update(dataToUpdate as never)
        .eq('id', id)
        .eq('project_id', projectId);

      if (error) throw error;
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
      const tableName = getTableName(projectId!, entityName);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from(tableName)
        .delete()
        .eq('id', id)
        .eq('project_id', projectId);

      if (error) throw error;
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

// Hook for projects (no project filtering)
export function useProjects() {
  const [data, setData] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: supabaseData, error } = await supabase
        .from('projects')
        .select('*');

      if (error) throw error;

      const mappedData = (supabaseData || []).map((item: Record<string, unknown>) => ({
        ...item,
        startDate: item['start_date'] as string,
        endDate: item['end_date'] as string,
        shortDescription: item['short_description'] as string,
        primaryColor: item['primary_color'] as string,
        secondaryColor: item['secondary_color'] as string,
        createdAt: item['created_at'] as string,
        updatedAt: item['updated_at'] as string,
        settings: {
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
        }
      }));

      setData(mappedData as Project[]);
    } catch (err) {
      logger.error('Erro ao buscar projetos:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const create = useCallback(async (item: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    try {
      const { settings, ...rest } = item;
      const dataToInsert: any = {
        ...mapToSnakeCase(rest as Record<string, unknown>),
        start_date: item.startDate,
        end_date: item.endDate,
        short_description: item.shortDescription,
        primary_color: item.primaryColor,
        secondary_color: item.secondaryColor,
      };

      if (settings) {
        dataToInsert.max_registrations = settings.maxRegistrations;
        dataToInsert.max_mentors = settings.maxMentors;
        dataToInsert.max_startups = settings.maxStartups;
        dataToInsert.max_companies = settings.maxCompanies;
        dataToInsert.enable_b2b = settings.enableB2B;
        dataToInsert.enable_mentoring = settings.enableMentoring;
        dataToInsert.enable_startups = settings.enableStartups;
        dataToInsert.enable_check_in = settings.enableCheckIn;
        if (settings.ticketPrices) {
          dataToInsert.ticket_price_standard = Math.round((settings.ticketPrices.standard || 0) * 100);
          dataToInsert.ticket_price_pro = Math.round((settings.ticketPrices.pro || 0) * 100);
          dataToInsert.ticket_price_vip = Math.round((settings.ticketPrices.vip || 0) * 100);
        }
      }

      const { data: inserted, error } = await (supabase
        .from('projects')
        .insert(dataToInsert)
        .select()
        .single());

      if (error) throw error;
      await fetchData();
      return inserted;
    } catch (err) {
      logger.error('Erro ao criar projeto:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  const update = useCallback(async (id: string, updates: Partial<Project>) => {
    setIsLoading(true);
    try {
      const { settings, ...rest } = updates;
      const dataToUpdate: any = {
        ...mapToSnakeCase(rest as Record<string, unknown>),
      };

      if (rest.startDate) dataToUpdate.start_date = rest.startDate;
      if (rest.endDate) dataToUpdate.end_date = rest.endDate;
      if (rest.shortDescription) dataToUpdate.short_description = rest.shortDescription;
      if (rest.primaryColor) dataToUpdate.primary_color = rest.primaryColor;
      if (rest.secondaryColor) dataToUpdate.secondary_color = rest.secondaryColor;

      if (settings) {
        if (settings.maxRegistrations !== undefined) dataToUpdate.max_registrations = settings.maxRegistrations;
        if (settings.maxMentors !== undefined) dataToUpdate.max_mentors = settings.maxMentors;
        if (settings.maxStartups !== undefined) dataToUpdate.max_startups = settings.maxStartups;
        if (settings.maxCompanies !== undefined) dataToUpdate.max_companies = settings.maxCompanies;
        if (settings.enableB2B !== undefined) dataToUpdate.enable_b2b = settings.enableB2B;
        if (settings.enableMentoring !== undefined) dataToUpdate.enable_mentoring = settings.enableMentoring;
        if (settings.enableStartups !== undefined) dataToUpdate.enable_startups = settings.enableStartups;
        if (settings.enableCheckIn !== undefined) dataToUpdate.enable_check_in = settings.enableCheckIn;

        if (settings.ticketPrices) {
          if (settings.ticketPrices.standard !== undefined) dataToUpdate.ticket_price_standard = Math.round((settings.ticketPrices.standard || 0) * 100);
          if (settings.ticketPrices.pro !== undefined) dataToUpdate.ticket_price_pro = Math.round((settings.ticketPrices.pro || 0) * 100);
          if (settings.ticketPrices.vip !== undefined) dataToUpdate.ticket_price_vip = Math.round((settings.ticketPrices.vip || 0) * 100);
        }
      }

      const { error } = await (supabase as any)
        .from('projects')
        .update(dataToUpdate)
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      logger.error('Erro ao atualizar projeto:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  const remove = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      logger.error('Erro ao remover projeto:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

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
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await withTimeout(
        supabase.from('users' as any).select('*') as unknown as Promise<any>,
        8000,
        'FetchUsers'
      );
      const { data: supabaseData, error } = result as any;

      if (error) throw error;

      const mappedData = (supabaseData || []).map((item: Record<string, unknown>) => ({
        ...item,
        id: item['id'] as string,
        email: item['email'] as string,
        name: item['name'] as string,
        role: item['role'] as any,
        department: item['department'] as string,
        permissions: item['permissions'] as string[],
        createdAt: item['created_at'] as string,
      }));

      setData(mappedData as User[]);
    } catch (err) {
      logger.error('Erro ao buscar usuários:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, updates: Partial<User>) => {
    setIsLoading(true);
    try {
      const dataToUpdate = mapToSnakeCase(updates as Record<string, unknown>);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('users')
        .update(dataToUpdate)
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      logger.error('Erro ao atualizar usuário:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, update, refetch: fetchData };
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = supabaseData as any;
        setData({
          id: d.id,
          userId: d.user_id,
          company: d.company,
          position: d.position,
          bio: d.bio,
          website: d.website,
          linkedin: d.linkedin,
          city: d.city,
          state: d.state,
          country: d.country,
          birthDate: d.birth_date,
          gender: d.gender,
          cpf: d.cpf,
          cnpj: d.cnpj,
          newsletterOptIn: d.newsletter_opt_in,
        } as Profile);
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
      const dataToUpdate = mapToSnakeCase(updates as Record<string, unknown>);

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

  return { data, isLoading, update, refetch: fetchData };
}

export function useEmpresasIncentivadoras() {
  return useData<any>([], 'empresas_incentivadoras');
}

