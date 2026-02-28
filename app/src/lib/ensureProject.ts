import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Project, ProjectType, ProjectStatus } from '@/types';
import type { Database } from '@/types/supabase';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
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

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is just 'no rows' which is fine
            logger.warn(`[ensureProject] Potential issue fetching project ${projectConfig.slug}:`, { error: fetchError.message });
        }

        // 2. Only attempt UPSERT if we have a session or if we are in development
        // This prevents 401 errors for anonymous users who shouldn't be creating projects anyway
        const { data: { session } } = await supabase.auth.getSession();
        const userRole = session?.user?.user_metadata?.role || session?.user?.app_metadata?.role;
        const isAdmin = userRole === 'admin';

        if (session) {
            logger.debug(`[ensureProject] Session found. User: ${session.user.email}, Role: ${userRole}, isAdmin: ${isAdmin}`);
        }

        // 2. Se já existe, retorna o existente (independente de ser admin ou não)
        if (existing) {
            return rowToProject(existing as ProjectRow);
        }

        // 3. Se NÃO existe e NÃO é admin, não tenta criar (evita 403)
        if (!isAdmin) {
            logger.warn(`[ensureProject] Project ${projectConfig.slug} not found and user is not admin. Skipping creation.`);
            return null;
        }

        const projectDataToUpsert: ProjectInsert = {
            ...mapToSupabaseFormat(projectConfig),
            updated_at: new Date().toISOString(),
        };

        if (existing) {
            // Update if exists to ensure settings are in sync with code config
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            projectDataToUpsert.id = (existing as any).id;
        }

        // 2. Create if doesn't exist
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: created, error: createError } = await (supabase.from('projects') as any)
            .upsert(projectDataToUpsert, { onConflict: 'slug' })
            .select()
            .single();

        if (createError) {
            logger.warn(`[ensureProject] Failed to create project ${projectConfig.slug}:`, { error: createError.message });

            // Final attempt to fetch (race condition check)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

function mapToSupabaseFormat(p: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): ProjectInsert {
    const s = p.settings || {};
    const tp = s.ticketPrices || {};

    return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        type: p.type as Database['public']['Tables']['projects']['Insert']['type'],
        description: p.description,
        short_description: p.shortDescription || null,
        location: p.location,
        city: p.city,
        state: p.state,
        country: p.country || 'BR',
        address: p.address || p.location,
        start_date: p.startDate,
        end_date: p.endDate,
        status: (p.status || 'active') as Database['public']['Tables']['projects']['Insert']['status'],
        primary_color: p.primaryColor || '#FE4C38',
        secondary_color: p.secondaryColor || '#FF6B35',
        max_registrations: s.maxRegistrations || null,
        max_mentors: s.maxMentors || null,
        max_startups: s.maxStartups || null,
        max_companies: s.maxCompanies || null,
        enable_b2b: s.enableB2B ?? false,
        enable_mentoring: s.enableMentoring ?? false,
        enable_startups: s.enableStartups ?? false,
        enable_check_in: s.enableCheckIn ?? true,
        ticket_price_standard: Math.round((tp.standard || 0) * 100),
        ticket_price_pro: Math.round((tp.pro || 0) * 100),
        ticket_price_vip: Math.round((tp.vip || 0) * 100),
        target_registrations: s.targetRegistrations || 500,
        target_revenue: s.targetRevenue || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
