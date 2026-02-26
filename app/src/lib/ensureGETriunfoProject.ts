/**
 * ensureGETriunfoProject.ts
 *
 * Garante que o projeto "Growth Experience Triunfo-PE 2026" exista na tabela
 * `projects` do Supabase.  É chamado pelo GrowthExperienceTriunfo.tsx na
 * primeira renderização.  Idempotente — não cria duplicatas.
 */

import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Project, ProjectType, ProjectStatus } from '@/types';
import type { Database } from '@/types/supabase';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

const GE_TRIUNFO_SLUG = 'ge-triunfo-2026';
const GE_TRIUNFO_FIXED_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

const PROJECT_DATA: ProjectInsert = {
    id: GE_TRIUNFO_FIXED_ID,
    name: 'Growth Experience Triunfo-PE 2026',
    slug: GE_TRIUNFO_SLUG,
    type: 'growth_experience',
    description: 'A Maior Exposição de Negócios do Sertão do Pajeú. Capacitação, networking, mentoria 1:1 e Arena Pitch para startups. Tudo gratuito em 16 de abril de 2026.',
    short_description: 'Edição Triunfo-PE',
    location: 'Espaço Parque',
    city: 'Triunfo',
    state: 'PE',
    country: 'BR',
    address: 'Espaço Parque — Triunfo, Pernambuco',
    start_date: '2026-04-16',
    end_date: '2026-04-16',
    status: 'active',
    primary_color: '#FE4C38',
    secondary_color: '#FF6B35',
    max_registrations: 2000,
    max_mentors: 30,
    max_startups: 20,
    max_companies: 40,
    enable_b2b: true,
    enable_mentoring: true,
    enable_startups: true,
    enable_check_in: true,
    ticket_price_standard: 0,       // gratuito — cursos e workshops
    ticket_price_pro: 17999,   // R$ 179,99 — palestras noturnas
    ticket_price_vip: 0,
    target_registrations: 2000,
    target_revenue: 8_000_000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

/**
 * Monta um objeto `Project` completo com as settings calculadas a partir dos
 * campos flat do Supabase (ticket_price_*, enable_*, etc.)
 */
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

/**
 * Procura o projeto no Supabase pelo slug.  Se não existir, cria.
 * Retorna o projeto como objeto `Project`.
 */
export async function ensureGETriunfoProject(): Promise<Project | null> {
    try {
        // 1. Buscar pelo slug
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existing, error: fetchError } = await (supabase.from('projects') as any)
            .select('*')
            .eq('slug', GE_TRIUNFO_SLUG)
            .maybeSingle();

        if (fetchError) {
            logger.error('[ensureGETriunfoProject] Erro ao buscar projeto:', { error: fetchError.message });
            return null;
        }

        if (existing) {
            // Projeto encontrado — garantir status ativo e dados atualizados (2000+ participantes)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const existingTyped = existing as any as ProjectRow;
            const needsUpdate = existingTyped.status !== 'active' || existingTyped.max_registrations !== 2000;

            if (needsUpdate) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: updated } = await (supabase.from('projects') as any)
                    .update({
                        status: 'active',
                        max_registrations: 2000,
                        target_registrations: 2000,
                        location: 'Espaço Parque',
                        updated_at: new Date().toISOString()
                    } as ProjectUpdate)
                    .eq('id', existingTyped.id)
                    .select()
                    .single();

                if (updated) return rowToProject(updated as any as ProjectRow);
            }
            return rowToProject(existingTyped);
        }

        // 2. Criar se não existe (upsert por id fixo para evitar duplicatas)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: created, error: createError } = await (supabase.from('projects') as any)
            .upsert(PROJECT_DATA, { onConflict: 'id' })
            .select()
            .single();

        if (createError) {
            // Pode falhar por RLS (não-admin) — não é fatal para a página pública
            logger.warn('[ensureGETriunfoProject] Não foi possível criar o projeto (RLS?):', { error: createError.message });

            // Tentar buscar novamente — pode ter sido criado por outra aba/instância
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: retry } = await (supabase.from('projects') as any)
                .select('*')
                .eq('slug', GE_TRIUNFO_SLUG)
                .maybeSingle();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return retry ? rowToProject(retry as any as ProjectRow) : null;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        logger.info('[ensureGETriunfoProject] Projeto criado:', { id: (created as any)?.id });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return created ? rowToProject(created as any as ProjectRow) : null;
    } catch (err) {
        logger.error('[ensureGETriunfoProject] Erro inesperado:', { error: err });
        return null;
    }
}
