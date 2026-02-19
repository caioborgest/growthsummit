import { useState, useCallback, useEffect, useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type {
  Registration, Mentor, MentoringSession, Company, B2BMeeting,
  Startup, Sponsor, Transaction, CheckIn, Session, Lead, Project
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
const mockProjects: Project[] = [];

// Project IDs
const GS_2026 = 'gs-2026';
const GE_TRIUNFO = 'ge-triunfo-2026';

// Table Mapping based on project and entity
const getTableName = (projectId: string, entity: string) => {
  if (projectId === GE_TRIUNFO) {
    switch (entity) {
      case 'registrations': return 'inscricoes_growth_experience';
      case 'startups': return 'startups_arena_pitch';
      case 'companies': return 'rodada_negocios_b2b';
      case 'mentors': return 'mentores_growth_experience';
      case 'sessions': return 'mentorias_agendadas';
      default: return entity;
    }
  }
  // Default to summit tables
  return entity;
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
      const mappedData = (supabaseData || []).map((item: any) => {
        const mappedItem: any = { ...item };
        // Map common fields
        if (item.project_id) mappedItem.projectId = item.project_id;
        if (item.user_id) mappedItem.userId = item.user_id;
        if (item.ticket_type) mappedItem.ticketType = item.ticket_type;
        if (item.ticket_number) mappedItem.ticketNumber = item.ticket_number;
        if (item.qr_code) mappedItem.qrCode = item.qr_code;
        if (item.created_at) mappedItem.createdAt = item.created_at;
        if (item.updated_at) mappedItem.updatedAt = item.updated_at;
        if (item.payment_method) mappedItem.paymentMethod = item.payment_method;
        if (item.payment_status) mappedItem.paymentStatus = item.payment_status;
        if (item.payment_date) mappedItem.paymentDate = item.payment_date;
        if (item.checked_in) mappedItem.checkedIn = item.checked_in;

        // Specific for Startup
        if (item.nome_startup) mappedItem.name = item.nome_startup;
        if (item.descricao_startup) mappedItem.description = item.descricao_startup;
        if (item.nome_fundador) mappedItem.foundingTeam = [{ name: item.nome_fundador, role: 'Founder' }];

        // Specific for B2B/Company
        if (item.nome_empresa) mappedItem.name = item.nome_empresa;
        if (item.nome_representante) mappedItem.contactName = item.nome_representante;

        return mappedItem as T;
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

      // Map CamelCase back to snake_case for Supabase
      const dataToInsert: any = { ...item };
      delete dataToInsert.projectId;
      dataToInsert.project_id = projectId;

      const { data: inserted, error } = await supabase
        .from(tableName)
        .insert(dataToInsert)
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
      const { error } = await supabase
        .from(tableName)
        .update(updates as any)
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
        .from(tableName)
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

      const mappedData = (supabaseData || []).map((item: any) => ({
        ...item,
        startDate: item.start_date,
        endDate: item.end_date,
        shortDescription: item.short_description,
        primaryColor: item.primary_color,
        secondaryColor: item.secondary_color,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
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
      const { data: inserted, error } = await supabase
        .from('projects')
        .insert({
          ...item,
          start_date: item.startDate,
          end_date: item.endDate,
          short_description: item.shortDescription,
          primary_color: item.primaryColor,
          secondary_color: item.secondaryColor,
        })
        .select()
        .single();

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
      const { error } = await supabase
        .from('projects')
        .update(updates as any)
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
  return useData<MentoringSession>(mockMentoringSessions, 'sessions');
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
