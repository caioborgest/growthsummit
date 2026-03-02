/**
 * Mapper: Startup (Arena Pitch)
 *
 * Responsabilidade única: converter entre o banco (nome_startup, descricao_startup,
 * nome_fundador, estagio) e o tipo TypeScript `Startup`.
 */
import type { Startup } from '@/types';

type DbRow = Record<string, unknown>;

/** Banco → TypeScript */
export function mapStartupFromDB(item: DbRow): Startup {
    const id = item['id'] as string;
    const projectId = (item['project_id'] as string) ?? '';

    return {
        id,
        projectId,
        userId: (item['user_id'] as string) ?? undefined,

        // Triunfo usa: nome_startup, descricao_startup, nome_fundador, estagio
        name: (item['nome_startup'] ?? item['name'] ?? '') as string,
        description: (item['descricao_startup'] ?? item['description'] ?? '') as string,
        sector: (item['setor'] ?? item['sector'] ?? '') as string,
        stage: (item['estagio'] ?? item['stage'] ?? 'idea') as Startup['stage'],
        status: (item['status'] ?? 'pending') as Startup['status'],
        packageType: (item['package_type'] ?? 'expo') as Startup['packageType'],

        // Founder info
        foundingTeam: item['nome_fundador']
            ? [{ name: item['nome_fundador'] as string, role: 'Founder' }]
            : (item['founding_team'] as Startup['foundingTeam']) ?? [],

        // Links
        website: (item['website'] ?? item['site_url'] ?? '') as string,
        siteUrl: (item['site_url'] ?? '') as string,
        pitchDeck: (item['pitch_deck_url'] ?? item['pitch_deck'] ?? '') as string,
        pitchDeckUrl: (item['pitch_deck_url'] ?? '') as string,
        videoPitch: (item['video_pitch_url'] ?? item['video_pitch'] ?? '') as string,
        videoPitchUrl: (item['video_pitch_url'] ?? '') as string,
        linkedin: (item['linkedin_url'] ?? item['linkedin'] ?? '') as string,

        // Contato
        email: (item['email'] ?? '') as string,
        phone: (item['telefone'] ?? item['phone'] ?? '') as string,

        // Campos de pitch GE Triunfo
        problema: (item['problema'] ?? '') as string,
        solucao: (item['solucao'] ?? '') as string,
        modeloNegocio: (item['modelo_negocio'] ?? '') as string,
        diferencial: (item['diferencial'] ?? '') as string,
        faturamentoMensal: (item['faturamento_mensal'] ?? '') as string,
        investimentoBuscado: (item['investimento_buscado'] ?? '') as string,

        metrics: {
            revenue: item['faturamento_mensal'] ? Number(item['faturamento_mensal']) : undefined,
        },

        createdAt: (item['created_at'] ?? '') as string,
    };
}

/** TypeScript → Banco */
export function mapStartupToDB(data: Partial<Startup>, isTriunfo = false): DbRow {
    const result: DbRow = {};

    if (data.projectId !== undefined) result['project_id'] = data.projectId;
    if (data.userId !== undefined) result['user_id'] = data.userId;
    if (data.status !== undefined) result['status'] = data.status;
    if (data.sector !== undefined) result['setor'] = data.sector;
    if (data.email !== undefined) result['email'] = data.email;
    if (data.phone !== undefined) result['telefone'] = data.phone;
    if (data.website !== undefined) result['site_url'] = data.website;
    if (data.siteUrl !== undefined) result['site_url'] = data.siteUrl;
    if (data.linkedin !== undefined) result['linkedin_url'] = data.linkedin;
    if (data.pitchDeck !== undefined) result['pitch_deck_url'] = data.pitchDeck;
    if (data.pitchDeckUrl !== undefined) result['pitch_deck_url'] = data.pitchDeckUrl;
    if (data.videoPitch !== undefined) result['video_pitch_url'] = data.videoPitch;
    if (data.videoPitchUrl !== undefined) result['video_pitch_url'] = data.videoPitchUrl;
    if (data.problema !== undefined) result['problema'] = data.problema;
    if (data.solucao !== undefined) result['solucao'] = data.solucao;
    if (data.modeloNegocio !== undefined) result['modelo_negocio'] = data.modeloNegocio;
    if (data.diferencial !== undefined) result['diferencial'] = data.diferencial;
    if (data.faturamentoMensal !== undefined) result['faturamento_mensal'] = data.faturamentoMensal;
    if (data.investimentoBuscado !== undefined) result['investimento_buscado'] = data.investimentoBuscado;
    if (data.packageType !== undefined) result['package_type'] = data.packageType;

    if (isTriunfo) {
        if (data.name !== undefined) result['nome_startup'] = data.name;
        if (data.description !== undefined) result['descricao_startup'] = data.description;
        if (data.stage !== undefined) result['estagio'] = data.stage;
        if (data.foundingTeam?.[0]?.name !== undefined) result['nome_fundador'] = data.foundingTeam[0].name;
    } else {
        if (data.name !== undefined) result['name'] = data.name;
        if (data.description !== undefined) result['description'] = data.description;
        if (data.stage !== undefined) result['stage'] = data.stage;
    }

    return result;
}
