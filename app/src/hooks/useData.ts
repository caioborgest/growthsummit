import { useState, useCallback, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type {
  Registration, Mentor, MentoringSession, Company, B2BMeeting,
  Startup, Sponsor, Transaction, CheckIn, Session, Lead, Project, Coupon,
  B2BSwipe, B2BMatch, B2BAppointmentTriunfo, User
} from '@/types';

// Mock Data Placeholders (re-added for fallback/types)
const mockRegistrations: Registration[] = [];
const mockMentors: Mentor[] = [];
const mockMentoringSessions: MentoringSession[] = [];
const mockCompanies: Company[] = [];
const mockB2BMeetings: B2BMeeting[] = [];
const mockStartups: Startup[] = [];
const mockSponsors: Sponsor[] = [];
const mockTransactions: Transaction[] = [];
const mockCheckIns: CheckIn[] = [];
const mockSessions: Session[] = [];
const mockLeads: Lead[] = [];

// Project IDs
const GE_TRIUNFO = 'ge-triunfo-2026';

// Table Mapping based on project and entity
const getTableName = (projectId: string, entity: string) => {
  if (projectId === GE_TRIUNFO) {
    switch (entity) {
      case 'registrations': return 'inscricoes_growth_experience';
      case 'startups': return 'startups_arena_pitch';
      case 'companies': return 'rodada_negocios_b2b';
      case 'mentoring_sessions': return 'mentorias_agendadas';
      case 'sessions': return 'programacao_evento';
      case 'b2b_meetings': return 'b2b_appointments_triunfo';
      case 'b2b_swipes': return 'b2b_swipes';
      case 'b2b_matches': return 'b2b_matches';
      case 'b2b_appointments': return 'b2b_appointments_triunfo';
      case 'cupons': return 'cupons_parceria_social';
      default: return entity;
    }
  }
  // Default to summit tables
  return entity;
};

// Helper to map CamelCase back to snake_case for Supabase
const mapToSnakeCase = (obj: Record<string, unknown>) => {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = obj[key];
    }
  }
  return result;
};

// Generic interface with id
interface WithId {
  id: string;
  projectId: string;
}

// Generic hook for CRUD operations with project filtering
export function useData<T extends WithId>(initialData: T[], entityName: string = 'registrations') {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { projectId } = useProject();

  const fetchData = useCallback(async () => {
    if (!projectId) return;

    setIsLoading(true);
    try {
      const tableName = getTableName(projectId, entityName);
      const { data: supabaseData, error } = await supabase
        .from(tableName)
        .select('*');

      if (error) throw error;

      // Basic mapping from snake_case to CamelCase if needed
      // This is a simple heuristic, might need refinement for complex types
      const mappedData = (supabaseData || []).map((item: Record<string, unknown>) => {
        const mappedItem: Record<string, unknown> = { ...item };
        // Map common fields
        if (item['project_id']) mappedItem['projectId'] = item['project_id'];
        if (item['user_id']) mappedItem['userId'] = item['user_id'];
        if (item['ticket_type']) mappedItem['ticketType'] = item['ticket_type'];
        if (item['ticket_number']) mappedItem['ticketNumber'] = item['ticket_number'];
        if (item['qr_code']) mappedItem['qrCode'] = item['qr_code'];
        if (item['created_at']) mappedItem['createdAt'] = item['created_at'];
        if (item['updated_at']) mappedItem['updatedAt'] = item['updated_at'];
        if (item['payment_method']) mappedItem['paymentMethod'] = item['payment_method'];
        if (item['payment_status']) mappedItem['paymentStatus'] = item['payment_status'];
        if (item['payment_date']) mappedItem['paymentDate'] = item['payment_date'];
        if (item['checked_in']) mappedItem['checkedIn'] = item['checked_in'];

        // Specific for Triunfo Registrations
        if (item['palestras_noturnas'] !== undefined) mappedItem['palestrasNoturnas'] = item['palestras_noturnas'];
        if (item['cursos_selecionados']) mappedItem['cursosSelecionados'] = item['cursos_selecionados'];
        if (item['valor_pago']) mappedItem['valorPago'] = item['valor_pago'];

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

        // Mentoring Specific Mapping
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

        return mappedItem as unknown as T;
      });

      setData(mappedData);
    } catch (err) {
      logger.error(`Erro ao buscar ${entityName}:`, err);
      // Fallback to initial (mock) data in development if table doesn't exist
      if (import.meta.env.DEV) {
        setData(initialData.filter(item => item.projectId === projectId));
      }
    } finally {
      setIsLoading(false);
    }
  }, [projectId, entityName, initialData]);

  const create = useCallback(async (item: Omit<T, 'id' | 'createdAt'>) => {
    if (!projectId) throw new Error('No project selected');
    setIsLoading(true);
    try {
      const tableName = getTableName(projectId, entityName);

      // mapToSnakeCase returned type might need to be cast to matching table insert type
      const dataToInsert = mapToSnakeCase(item as Record<string, unknown>);
      dataToInsert.project_id = projectId;

      const { data: inserted, error } = await supabase
        .from(tableName as any)
        .insert(dataToInsert as any)
        .select()
        .single();

      if (error) throw error;

      await fetchData();
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
      const dataToUpdate = mapToSnakeCase(updates as Record<string, unknown>);
      const { error } = await supabase
        .from(tableName as any)
        .update(dataToUpdate as any)
        .eq('id', id);

      if (error) throw error;
      await fetchData();
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
      const { error } = await supabase
        .from(tableName as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchData();
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

  return {
    data,
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

      const { error } = await supabase
        .from('projects' as any)
        .update(dataToUpdate as any)
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
  return useData<Registration>(mockRegistrations, 'registrations');
}

export function useMentors() {
  return useData<Mentor>(mockMentors, 'mentors');
}

export function useMentoringSessions() {
  return useData<MentoringSession>(mockMentoringSessions, 'mentoring_sessions');
}

export function useCompanies() {
  return useData<Company>(mockCompanies, 'companies');
}

export function useB2BMeetings() {
  return useData<B2BMeeting>(mockB2BMeetings, 'b2b_meetings');
}

export function useStartups() {
  return useData<Startup>(mockStartups, 'startups');
}

export function useSponsors() {
  return useData<Sponsor>(mockSponsors, 'sponsors');
}

export function useTransactions() {
  return useData<Transaction>(mockTransactions, 'transactions');
}

export function useCheckIns() {
  return useData<CheckIn>(mockCheckIns, 'check_ins');
}

export function useSessions() {
  return useData<Session>(mockSessions, 'sessions');
}

export function useLeads() {
  return useData<Lead>(mockLeads, 'leads');
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
      const { data: supabaseData, error } = await supabase
        .from('users' as any)
        .select('*');

      if (error) throw error;

      const mappedData = (supabaseData || []).map((item: Record<string, unknown>) => ({
        ...item,
        id: item['id'] as string,
        email: item['email'] as string,
        name: item['name'] as string,
        role: item['role'] as any,
        department: item['department'] as string,
        staffRole: item['staff_role'] as string,
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
      const { error } = await supabase
        .from('users' as any)
        .update(dataToUpdate as any)
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
