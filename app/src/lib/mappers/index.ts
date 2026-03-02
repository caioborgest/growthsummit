/**
 * Mappers — Barreira de Isolamento entre Banco e TypeScript
 *
 * REGRA: Sempre que o nome de uma coluna no banco mudar, edite APENAS
 * o mapper correspondente. Nenhum componente ou hook precisa ser tocado.
 *
 * Entidades mapeadas:
 * - Registration / Inscrição  → registrationMapper.ts
 * - Mentor                   → mentorMapper.ts
 * - Startup                  → startupMapper.ts
 * - Company / B2B            → companyMapper.ts
 */

export * from './registrationMapper';
export * from './mentorMapper';
export * from './startupMapper';
export * from './companyMapper';
