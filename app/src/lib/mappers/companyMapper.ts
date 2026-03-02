/**
 * Mapper: Company (B2B / Rodada de Negócios)
 *
 * Responsabilidade única: converter entre o banco (nome_empresa, nome_representante,
 * descricao_empresa) e o tipo TypeScript `Company`.
 */
import type { Company } from '@/types';

type DbRow = Record<string, unknown>;

/** Banco → TypeScript */
export function mapCompanyFromDB(item: DbRow): Company {
    return {
        id: item['id'] as string,
        projectId: (item['project_id'] as string) ?? undefined,
        userId: (item['user_id'] as string) ?? undefined,

        // Triunfo usa: nome_empresa, nome_representante, descricao_empresa
        name: (item['nome_empresa'] ?? item['name'] ?? '') as string,
        contactName: (item['nome_representante'] ?? item['contact_name'] ?? '') as string,
        contactEmail: (item['email'] ?? item['contact_email'] ?? '') as string,
        sector: (item['setor'] ?? item['sector'] ?? '') as string,
        description: (item['descricao_empresa'] ?? item['description'] ?? '') as string,
        status: (item['status'] ?? 'pending') as string,

        phone: (item['telefone'] ?? item['phone'] ?? '') as string,
        cnpj: (item['cnpj'] ?? '') as string,
        porte: (item['porte'] ?? '') as string,
        faturamentoAnual: (item['faturamento_anual'] ?? '') as string,
        numeroFuncionarios: (item['numero_funcionarios'] ?? '') as string,
        produtosServicos: (item['produtos_servicos'] ?? '') as string,
        siteUrl: (item['site_url'] ?? '') as string,
        linkedinUrl: (item['linkedin_url'] ?? '') as string,
        logoUrl: (item['logo_url'] ?? '') as string,

        tipoInteresse: (item['tipo_interesse'] ?? '') as string,
        areasInteresse: (item['areas_interesse'] ?? []) as string[],
        descricaoObjetivos: (item['descricao_objetivos'] ?? '') as string,

        cargo: (item['cargo'] ?? '') as string,
        packageType: (item['package_type'] ?? '') as string,

        createdAt: (item['created_at'] ?? '') as string,
    } as Company;
}

/** TypeScript → Banco */
export function mapCompanyToDB(data: Partial<Company>, isTriunfo = false): DbRow {
    const result: DbRow = {};

    if (data.projectId !== undefined) result['project_id'] = data.projectId;
    if (data.userId !== undefined) result['user_id'] = data.userId;
    if (data.status !== undefined) result['status'] = data.status;
    if (data.sector !== undefined) result['setor'] = data.sector;
    if (data.contactEmail !== undefined) result['email'] = data.contactEmail;
    if (data.phone !== undefined) result['telefone'] = data.phone;
    if (data.cnpj !== undefined) result['cnpj'] = data.cnpj;
    if (data.porte !== undefined) result['porte'] = data.porte;
    if (data.faturamentoAnual !== undefined) result['faturamento_anual'] = data.faturamentoAnual;
    if (data.numeroFuncionarios !== undefined) result['numero_funcionarios'] = data.numeroFuncionarios;
    if (data.produtosServicos !== undefined) result['produtos_servicos'] = data.produtosServicos;
    if (data.siteUrl !== undefined) result['site_url'] = data.siteUrl;
    if (data.linkedinUrl !== undefined) result['linkedin_url'] = data.linkedinUrl;
    if (data.logoUrl !== undefined) result['logo_url'] = data.logoUrl;
    if (data.tipoInteresse !== undefined) result['tipo_interesse'] = data.tipoInteresse;
    if (data.areasInteresse !== undefined) result['areas_interesse'] = data.areasInteresse;
    if (data.descricaoObjetivos !== undefined) result['descricao_objetivos'] = data.descricaoObjetivos;
    if (data.cargo !== undefined) result['cargo'] = data.cargo;
    if (data.packageType !== undefined) result['package_type'] = data.packageType;

    if (isTriunfo) {
        if (data.name !== undefined) result['nome_empresa'] = data.name;
        if (data.contactName !== undefined) result['nome_representante'] = data.contactName;
        if (data.description !== undefined) result['descricao_empresa'] = data.description;
    } else {
        if (data.name !== undefined) result['name'] = data.name;
        if (data.contactName !== undefined) result['contact_name'] = data.contactName;
        if (data.description !== undefined) result['description'] = data.description;
    }

    return result;
}
