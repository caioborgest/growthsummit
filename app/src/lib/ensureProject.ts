import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Project, ProjectType, ProjectStatus } from '@/types';
import type { Database } from '@/types/supabase';

type ProjectRow = Database['public']['Tables']['projects']['Row'];


/**
 * ensures a project exists in the database based on its config.
 * Idempotent — won't create duplicates if slug matches.
 */
export async function ensureProject(projectConfig: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Project | null> {
    try {
        // 1. Try to find by slug or by id if provided
        const projCols = 'id,name,slug,type,description,short_description,location,city,state,country,address,start_date,end_date,status,banner,logo,primary_color,secondary_color,max_registrations,max_mentors,max_startups,max_companies,enable_b2b,enable_mentoring,enable_startups,enable_check_in,ticket_price_standard,ticket_price_pro,ticket_price_vip,goal_registrations,goal_revenue,target_registrations,target_revenue,created_at,updated_at';
        
        const query = (supabase.from('projects') as any).select(projCols);
        
        if (projectConfig.id) {
            query.eq('id', projectConfig.id);
        } else {
            query.eq('slug', projectConfig.slug);
        }

        const { data: existing, error: fetchError } = await query.maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') {
            if (fetchError.message?.includes('aborted') || fetchError.name === 'AbortError') {
                return null;
            }
            logger.warn(`[ensureProject] Potential issue fetching project ${projectConfig.slug || projectConfig.id}:`, { error: fetchError.message });
        }

        if (existing) {
            return rowToProject(existing as ProjectRow);
        }

        logger.debug(`[ensureProject] Project not found: ${projectConfig.slug || projectConfig.id}`);
        return null;
    } catch (err: any) {
        if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
            return null;
        }
        logger.error('[ensureProject] Unexpected error:', { error: err });
        return null;
    }
}




function rowToProject(row: ProjectRow): Project {
    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        type: row.type as ProjectType,
        description: row.description,
        shortDescription: row.short_description ?? '',
        location: row.location,
        city: row.city,
        state: row.state,
        country: row.country,
        address: row.address ?? '',
        startDate: row.start_date,
        endDate: row.end_date,
        status: row.status as ProjectStatus,
        banner: row.banner ?? '',
        logo: row.logo ?? '',
        primaryColor: row.primary_color ?? '#FE4C38',
        secondaryColor: row.secondary_color ?? '#FF6B35',
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        settings: {
            maxRegistrations: row.max_registrations ?? undefined,
            maxMentors: row.max_mentors ?? undefined,
            maxStartups: row.max_startups ?? undefined,
            maxCompanies: row.max_companies ?? undefined,
            enableB2B: row.enable_b2b,
            enableMentoring: row.enable_mentoring,
            enableStartups: row.enable_startups,
            enableCheckIn: row.enable_check_in,
            ticketPrices: {
                standard: (row.ticket_price_standard ?? 0) / 100,
                pro: (row.ticket_price_pro ?? 0) / 100,
                vip: (row.ticket_price_vip ?? 0) / 100,
            },
            targetRegistrations: row.target_registrations,
            targetRevenue: row.target_revenue,
        },
    };
}
