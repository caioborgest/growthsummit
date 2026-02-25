import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Project, ProjectType, ProjectStatus } from '@/types';
import type { Database } from '@/types/supabase';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

/**
 * ensures a project exists in the database based on its config.
 * Idempotent — won't create duplicates if slug matches.
 */
export async function ensureProject(projectConfig: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Project | null> {
    try {
        // 1. Try to find by slug
        const { data: existing, error: fetchError } = await (supabase.from('projects') as any)
            .select('*')
            .eq('slug', projectConfig.slug)
            .maybeSingle();

        if (fetchError) {
            logger.error(`[ensureProject] Error fetching project ${projectConfig.slug}:`, { error: fetchError.message });
            return null;
        }

        const projectDataToUpsert: ProjectInsert = {
            ...mapToSupabaseFormat(projectConfig),
            status: (projectConfig.status as any) || 'active',
            updated_at: new Date().toISOString(),
        };

        if (existing) {
            // Update if exists to ensure settings are in sync with code config
            projectDataToUpsert.id = existing.id;
        }

        // 2. Create if doesn't exist
        const { data: created, error: createError } = await (supabase.from('projects') as any)
            .upsert(projectDataToUpsert, { onConflict: 'slug' })
            .select()
            .single();

        if (createError) {
            logger.warn(`[ensureProject] Failed to create project ${projectConfig.slug}:`, { error: createError.message });

            // Final attempt to fetch (race condition check)
            const { data: retry } = await (supabase.from('projects') as any)
                .select('*')
                .eq('slug', projectConfig.slug)
                .maybeSingle();

            return retry ? rowToProject(retry as ProjectRow) : null;
        }

        return created ? rowToProject(created as ProjectRow) : null;
    } catch (err) {
        logger.error('[ensureProject] Unexpected error:', { error: err });
        return null;
    }
}

function mapToSupabaseFormat(p: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Partial<ProjectInsert> {
    const s = p.settings || {};
    const tp = s.ticketPrices || {};
    return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        type: p.type as any,
        description: p.description,
        short_description: p.shortDescription,
        location: p.location,
        city: p.city,
        state: p.state,
        country: p.country || 'BR',
        address: p.address || p.location,
        start_date: p.startDate,
        end_date: p.endDate,
        status: p.status as any,
        primary_color: p.primaryColor,
        secondary_color: p.secondaryColor,
        max_registrations: s.maxRegistrations,
        max_mentors: s.maxMentors,
        max_startups: s.maxStartups,
        max_companies: s.maxCompanies,
        enable_b2b: s.enableB2B,
        enable_mentoring: s.enableMentoring,
        enable_startups: s.enableStartups,
        enable_check_in: s.enableCheckIn,
        ticket_price_standard: Math.round((tp.standard || 0) * 100),
        ticket_price_pro: Math.round((tp.pro || 0) * 100),
        ticket_price_vip: Math.round((tp.vip || 0) * 100),
    };
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
        },
    };
}
