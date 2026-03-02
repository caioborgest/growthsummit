/**
 * Mapper: Mentor
 *
 * Responsabilidade única: converter entre o formato do banco de dados
 * (snake_case PT-BR: nome, cargo, empresa) e o tipo TypeScript `Mentor` (camelCase EN).
 *
 * SE precisar mudar o nome de uma coluna no banco, mude APENAS aqui.
 */
import type { Mentor } from '@/types';

type DbRow = Record<string, unknown>;

/** Banco → TypeScript */
export function mapMentorFromDB(item: DbRow): Mentor {
    return {
        id: item['id'] as string,
        projectId: (item['project_id'] as string) ?? undefined,
        userId: (item['user_id'] as string) ?? undefined,

        // Triunfo usa: nome, cargo, empresa, telefone, especialidades, foto_url, linkedin_url
        name: (item['nome'] ?? item['name'] ?? '') as string,
        email: (item['email'] ?? '') as string,
        phone: (item['telefone'] ?? item['phone'] ?? '') as string,
        company: (item['empresa'] ?? item['company'] ?? '') as string,
        position: (item['cargo'] ?? item['position'] ?? '') as string,
        specialties: (item['especialidades'] ?? item['specialties'] ?? []) as string[],
        bio: (item['bio'] ?? '') as string,
        photo: (item['foto_url'] ?? item['photo'] ?? '') as string,
        linkedin: (item['linkedin_url'] ?? item['linkedin'] ?? '') as string,
        status: (item['status'] ?? 'pending') as string,
        yearsExperience: (item['years_experience'] ?? 0) as number,
        maxMentories: (item['max_mentories'] ?? 0) as number,

        createdAt: (item['created_at'] ?? '') as string,
    } as Mentor;
}

/** TypeScript → Banco (para INSERT/UPDATE) */
export function mapMentorToDB(data: Partial<Mentor>, isTriunfo = false): DbRow {
    const result: DbRow = {};

    if (data.projectId !== undefined) result['project_id'] = data.projectId;
    if (data.userId !== undefined) result['user_id'] = data.userId;
    if (data.status !== undefined) result['status'] = data.status;
    if (data.bio !== undefined) result['bio'] = data.bio;

    if (isTriunfo) {
        if (data.name !== undefined) result['nome'] = data.name;
        if (data.email !== undefined) result['email'] = data.email;
        if (data.phone !== undefined) result['telefone'] = data.phone;
        if (data.company !== undefined) result['empresa'] = data.company;
        if (data.position !== undefined) result['cargo'] = data.position;
        if (data.specialties !== undefined) result['especialidades'] = data.specialties;
        if (data.photo !== undefined) result['foto_url'] = data.photo;
        if (data.linkedin !== undefined) result['linkedin_url'] = data.linkedin;
    } else {
        if (data.name !== undefined) result['name'] = data.name;
        if (data.email !== undefined) result['email'] = data.email;
        if (data.phone !== undefined) result['phone'] = data.phone;
        if (data.company !== undefined) result['company'] = data.company;
        if (data.position !== undefined) result['position'] = data.position;
        if (data.specialties !== undefined) result['specialties'] = data.specialties;
        if (data.photo !== undefined) result['photo'] = data.photo;
        if (data.linkedin !== undefined) result['linkedin'] = data.linkedin;
    }

    return result;
}
