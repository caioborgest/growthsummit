/**
 * Mapper: Registration / Inscrição
 * 
 * Responsabilidade única: converter entre o formato do banco de dados
 * (snake_case PT-BR) e o tipo TypeScript `Registration` (camelCase EN).
 * 
 * SE precisar mudar o nome de uma coluna no banco, mude APENAS aqui.
 * Nenhum outro arquivo precisa ser tocado.
 */
import type { Registration } from '@/types';

type DbRow = Record<string, unknown>;

/** Banco → TypeScript */
export function mapRegistrationFromDB(item: DbRow): Registration {
    return {
        id: item['id'] as string,
        projectId: (item['project_id'] as string) ?? undefined,
        userId: (item['user_id'] as string) ?? undefined,

        // Triunfo usa: nome, telefone, tipo_inscricao, valor_pago
        // Standard usa: name, phone, ticket_type, amount
        name: (item['nome'] ?? item['name'] ?? '') as string,
        email: (item['email'] ?? '') as string,
        phone: (item['telefone'] ?? item['phone'] ?? '') as string,
        company: (item['empresa'] ?? item['company'] ?? '') as string,

        ticketType: (item['tipo_inscricao'] ?? item['ticket_type'] ?? 'standard') as string,
        ticketNumber: (item['ticket_number'] ?? (item['id'] as string)?.split('-')[0]?.toUpperCase() ?? '') as string,
        qrCode: (item['qr_code'] ?? '') as string,
        status: (item['status'] ?? 'pending') as string,

        // Pagamento: valor_pago (Triunfo) | amount (standard)
        amount: (item['valor_pago'] ?? item['amount'] ?? 0) as number,
        paymentMethod: (item['payment_method'] ?? '') as string,
        paymentStatus: (item['status_pagamento'] ?? item['payment_status'] ?? '') as string,
        paymentDate: (item['payment_date'] ?? undefined) as string | undefined,

        checkedIn: (item['checked_in'] ?? false) as boolean,

        // Campos específicos Triunfo
        palestrasNoturnas: (item['palestras_noturnas'] ?? false) as boolean,
        cursosSelecionados: (item['cursos_selecionados'] ?? []) as string[],
        couponCode: (item['cupom_palestra'] ?? undefined) as string | undefined,
        discountAmount: (item['valor_desconto_palestra'] ?? 0) as number,

        createdAt: (item['created_at'] ?? '') as string,
        updatedAt: (item['updated_at'] ?? undefined) as string | undefined,
    } as Registration;
}

/** TypeScript → Banco (para INSERT/UPDATE) */
export function mapRegistrationToDB(data: Partial<Registration>, isTriunfo = false): DbRow {
    const result: DbRow = {};

    if (data.projectId !== undefined) result['project_id'] = data.projectId;
    if (data.userId !== undefined) result['user_id'] = data.userId;
    if (data.status !== undefined) result['status'] = data.status;
    if (data.ticketType !== undefined) {
        result['ticket_type'] = data.ticketType;
        if (isTriunfo) result['tipo_inscricao'] = data.ticketType;
    }
    if (data.ticketNumber !== undefined) result['ticket_number'] = data.ticketNumber;
    if (data.qrCode !== undefined) result['qr_code'] = data.qrCode;

    if (isTriunfo) {
        if (data.name !== undefined) result['nome'] = data.name;
        if (data.email !== undefined) result['email'] = data.email;
        if (data.phone !== undefined) result['telefone'] = data.phone;
        if (data.company !== undefined) result['empresa'] = data.company;
        if (data.amount !== undefined) result['valor_pago'] = data.amount;
        if (data.palestrasNoturnas !== undefined) result['palestras_noturnas'] = data.palestrasNoturnas;
        if (data.cursosSelecionados !== undefined) result['cursos_selecionados'] = data.cursosSelecionados;
        if (data.couponCode !== undefined) result['cupom_palestra'] = data.couponCode;
        if (data.discountAmount !== undefined) result['valor_desconto_palestra'] = data.discountAmount;
    } else {
        if (data.name !== undefined) result['name'] = data.name;
        if (data.email !== undefined) result['email'] = data.email;
        if (data.phone !== undefined) result['phone'] = data.phone;
        if (data.company !== undefined) result['company'] = data.company;
        if (data.amount !== undefined) result['amount'] = data.amount;
    }

    return result;
}
