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
        const projCols = 'id,name,slug,type,description,short_description,location,city,state,country,address,start_date,end_date,status,banner,logo,primary_color,secondary_color,max_registrations,max_mentors,max_startups,max_companies,enable_b2b,enable_mentoring,enable_startups,enable_check_in,ticket_price_standard,ticket_price_pro,ticket_price_vip,target_registrations,target_revenue,created_at,updated_at';
        
        // 1. Try to find existing project
        const query = (supabase.from('projects') as any).select(projCols);
        if (projectConfig.id) {
            query.eq('id', projectConfig.id);
        } else {
            query.eq('slug', projectConfig.slug);
        }

        const { data: existing, error: fetchError } = await query.maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') {
            if (fetchError.message?.includes('aborted') || fetchError.name === 'AbortError') return null;
            logger.warn(`[ensureProject] Error fetching project ${projectConfig.slug}:`, fetchError);
        }

        if (existing) {
            return rowToProject(existing as ProjectRow);
        }

        // 2. Not found, try to create it (Idempotent)
        logger.info(`[ensureProject] Creating missing project: ${projectConfig.slug}`);
               const dataToInsert: any = {
            id: projectConfig.id,
            name: projectConfig.name,
            slug: projectConfig.slug,
            type: projectConfig.type,
            description: projectConfig.description,
            short_description: projectConfig.shortDescription,
            location: projectConfig.location,
            city: projectConfig.city,
            state: projectConfig.state,
            country: projectConfig.country,
            address: projectConfig.address,
            start_date: projectConfig.startDate,
            end_date: projectConfig.endDate,
            status: projectConfig.status,
            primary_color: projectConfig.primaryColor,
            secondary_color: projectConfig.secondaryColor,
            max_registrations: projectConfig.settings?.maxRegistrations,
            max_mentors: projectConfig.settings?.maxMentors,
            max_startups: projectConfig.settings?.maxStartups,
            max_companies: projectConfig.settings?.maxCompanies,
            enable_b2b: projectConfig.settings?.enableB2B,
            enable_mentoring: projectConfig.settings?.enableMentoring,
            enable_startups: projectConfig.settings?.enableStartups,
            enable_check_in: projectConfig.settings?.enableCheckIn,
            ticket_price_standard: Math.round((projectConfig.settings?.ticketPrices?.standard || 0) * 100),
            ticket_price_pro: Math.round((projectConfig.settings?.ticketPrices?.pro || 0) * 100),
            ticket_price_vip: Math.round((projectConfig.settings?.ticketPrices?.vip || 0) * 100),
            target_registrations: projectConfig.settings?.targetRegistrations,
            target_revenue: projectConfig.settings?.targetRevenue,
        };

        const { data: created, error: insertError } = await (supabase
            .from('projects')
            .upsert(dataToInsert, { onConflict: 'slug' })
            .select(projCols)
            .single() as any);

        if (insertError) {
            // If it's a conflict, try to fetch one last time (maybe someone else created it)
            if (insertError.code === '23505') {
                 const { data: retry } = await (supabase.from('projects') as any).select(projCols).eq('slug', projectConfig.slug).maybeSingle();
                 if (retry) return rowToProject(retry as ProjectRow);
            }
            logger.error(`[ensureProject] Failed to create project:`, insertError);
            return null;
        }

        return rowToProject(created as ProjectRow);
    } catch (err: any) {
        if (err?.name === 'AbortError' || err?.message?.includes('aborted')) return null;
        logger.error('[ensureProject] Unexpected error:', err);
        return null;
    }
}


function rowToProject(row: ProjectRow): Project {
    return {
        id: row.id,
        name: row.name ?? '',
        slug: row.slug ?? '',
        type: (row.type as ProjectType) || 'growth_experience',
        description: row.description ?? '',
        shortDescription: row.short_description ?? '',
        location: row.location ?? '',
        city: row.city ?? '',
        state: row.state ?? '',
        country: row.country ?? 'Brasil',
        address: row.address ?? '',
        startDate: row.start_date ?? '',
        endDate: row.end_date ?? '',
        status: (row.status as ProjectStatus) || 'active',
        banner: row.banner ?? '',
        logo: row.logo ?? '',
        primaryColor: row.primary_color ?? '#FE4C38',
        secondaryColor: row.secondary_color ?? '#FF6B35',
        createdAt: row.created_at ?? new Date().toISOString(),
        updatedAt: row.updated_at ?? new Date().toISOString(),
        settings: {
            maxRegistrations: row.max_registrations ?? undefined,
            maxMentors: row.max_mentors ?? undefined,
            maxStartups: row.max_startups ?? undefined,
            maxCompanies: row.max_companies ?? undefined,
            enableB2B: !!row.enable_b2b,
            enableMentoring: !!row.enable_mentoring,
            enableStartups: !!row.enable_startups,
            enableCheckIn: !!row.enable_check_in,
            ticketPrices: {
                standard: (row.ticket_price_standard ?? 0) / 100,
                pro: (row.ticket_price_pro ?? 0) / 100,
                vip: (row.ticket_price_vip ?? 0) / 100,
            },
            targetRegistrations: row.target_registrations ?? undefined,
            targetRevenue: row.target_revenue ?? undefined,
        },
    };
}
