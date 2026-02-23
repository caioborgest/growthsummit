/**
 * ensureGETriunfoProject.ts
 *
 * Garante que o projeto "Growth Experience Triunfo-PE 2026" exista na tabela
 * `projects` do Supabase.  É chamado pelo GrowthExperienceTriunfo.tsx na
 * primeira renderização.  Idempotente — não cria duplicatas.
 */

import { supabase } from '@/lib/supabase';
import type { Project } from '@/types';

const GE_TRIUNFO_SLUG = 'ge-triunfo-2026';
const GE_TRIUNFO_FIXED_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

const PROJECT_DATA = {
    id: GE_TRIUNFO_FIXED_ID,
    name: 'Growth Experience Triunfo-PE 2026',
    slug: GE_TRIUNFO_SLUG,
    type: 'growth_experience' as const,
    description: 'A Maior Exposição de Negócios do Sertão do Pajeú. Capacitação, networking, mentoria 1:1 e Arena Pitch para startups. Tudo gratuito em 16 de abril de 2026.',
    short_description: 'Edição Triunfo-PE',
    location: 'Espaço Parque',
    city: 'Triunfo',
    state: 'PE',
    country: 'BR',
    address: 'Espaço Parque — Triunfo, Pernambuco',
    start_date: '2026-04-16',
    end_date: '2026-04-16',
    status: 'active' as const,
    primary_color: '#FE4C38',
    secondary_color: '#FF6B35',
    max_registrations: 500,
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
    target_registrations: 500,
    target_revenue: 8_000_000,
} as const;

/**
 * Monta um objeto `Project` completo com as settings calculadas a partir dos
 * campos flat do Supabase (ticket_price_*, enable_*, etc.)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

/**
 * Procura o projeto no Supabase pelo slug.  Se não existir, cria.
 * Retorna o projeto como objeto `Project`.
 */
export async function ensureGETriunfoProject(): Promise<Project | null> {
    try {
        // 1. Buscar pelo slug
        const { data: existing, error: fetchError } = await (supabase as any)
            .from('projects')
            .select('*')
            .eq('slug', GE_TRIUNFO_SLUG)
            .maybeSingle();

        if (fetchError) {
            console.error('[ensureGETriunfoProject] Erro ao buscar projeto:', fetchError.message);
            return null;
        }

        if (existing) {
            // Projeto encontrado — garantir status ativo
            if (existing.status !== 'active') {
                await (supabase as any)
                    .from('projects')
                    .update({ status: 'active', updated_at: new Date().toISOString() })
                    .eq('id', existing.id);
                existing.status = 'active';
            }
            return rowToProject(existing);
        }

        // 2. Criar se não existe (upsert por id fixo para evitar duplicatas)
        const { data: created, error: createError } = await (supabase as any)
            .from('projects')
            .upsert(PROJECT_DATA, { onConflict: 'id' })
            .select()
            .single();

        if (createError) {
            // Pode falhar por RLS (não-admin) — não é fatal para a página pública
            console.warn('[ensureGETriunfoProject] Não foi possível criar o projeto (RLS?):', createError.message);

            // Tentar buscar novamente — pode ter sido criado por outra aba/instância
            const { data: retry } = await (supabase as any)
                .from('projects')
                .select('*')
                .eq('slug', GE_TRIUNFO_SLUG)
                .maybeSingle();

            return retry ? rowToProject(retry) : null;
        }

        console.info('[ensureGETriunfoProject] Projeto criado:', created?.id);
        return created ? rowToProject(created) : null;
    } catch (err) {
        console.error('[ensureGETriunfoProject] Erro inesperado:', err);
        return null;
    }
}
