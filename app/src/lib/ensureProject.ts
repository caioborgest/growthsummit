import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Project } from '@/types';

/**
 * ensures a project exists in the database based on its config.
 * Idempotent — won't create duplicates if slug matches.
 */
export async function ensureProject(projectConfig: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Project | null> {
    try {
        // 1. Try to find by slug
        const { data: existing, error: fetchError } = await (supabase as any)
            .from('projects')
            .select('*')
            .eq('slug', projectConfig.slug)
            .maybeSingle();

        if (fetchError) {
            logger.error(`[ensureProject] Error fetching project ${projectConfig.slug}:`, fetchError.message);
            return null;
        }

        const projectDataToUpsert = {
            ...mapToSupabaseFormat(projectConfig),
            status: projectConfig.status || 'active',
            updated_at: new Date().toISOString(),
        };

        if (existing) {
            // Update if exists to ensure settings are in sync with code config
            // We'll proceed to the upsert below which uses onConflict: slug
            projectDataToUpsert.id = existing.id;
        }

        // 2. Create if doesn't exist
        const { data: created, error: createError } = await (supabase as any)
            .from('projects')
            .upsert(projectDataToUpsert, { onConflict: 'slug' })
            .select()
            .single();

        if (createError) {
            logger.warn(`[ensureProject] Failed to create project ${projectConfig.slug}:`, createError.message);

            // Final attempt to fetch (race condition check)
            const { data: retry } = await (supabase as any)
                .from('projects')
                .select('*')
                .eq('slug', projectConfig.slug)
                .maybeSingle();

            return retry ? rowToProject(retry) : null;
        }

        return created ? rowToProject(created) : null;
    } catch (err) {
        logger.error('[ensureProject] Unexpected error:', err);
        return null;
    }
}

function mapToSupabaseFormat(p: any) {
    const s = p.settings || {};
    const tp = s.ticketPrices || {};
    return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        type: p.type,
        description: p.description,
        short_description: p.shortDescription,
        location: p.location,
        city: p.city,
        state: p.state,
        country: p.country || 'BR',
        address: p.address || p.location,
        start_date: p.startDate,
        end_date: p.endDate,
        status: p.status,
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

function rowToProject(row: any): Project {
    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        type: row.type,
        description: row.description,
        shortDescription: row.short_description ?? '',
        location: row.location,
        city: row.city,
        state: row.state,
        startDate: row.start_date,
        endDate: row.end_date,
        status: row.status,
        banner: row.banner ?? '',
        logo: row.logo ?? '',
        primaryColor: row.primary_color ?? '#FE4C38',
        secondaryColor: row.secondary_color ?? '#FF6B35',
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        settings: {
            maxRegistrations: row.max_registrations,
            maxMentors: row.max_mentors,
            maxStartups: row.max_startups,
            maxCompanies: row.max_companies,
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
