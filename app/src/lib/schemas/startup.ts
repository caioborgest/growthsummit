import { z } from 'zod';

/**
 * Schema de validação para cadastro de Startup (Arena Pitch)
 * Compartilhado entre StartupFormModal (público) e admin
 */
export const StartupSchema = z.object({
    // Dados do fundador
    nomeFundador: z.string()
        .min(3, 'Nome deve ter pelo menos 3 caracteres')
        .max(100, 'Nome muito longo'),
    email: z.string()
        .email('E-mail inválido')
        .toLowerCase()
        .trim(),
    phone: z.string()
        .regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Formato de telefone inválido (esperado: (XX) XXXXX-XXXX)'),

    // Dados da startup
    nomeStartup: z.string()
        .min(2, 'Nome da startup deve ter pelo menos 2 caracteres')
        .max(100, 'Nome muito longo'),
    setor: z.string()
        .min(2, 'Selecione um setor'),
    estagio: z.enum(['ideia', 'mvp', 'tração', 'escala'], {
        errorMap: () => ({ message: 'Selecione um estágio válido' })
    }),
    descricaoStartup: z.string()
        .min(50, 'Descrição deve ter pelo menos 50 caracteres')
        .max(1000, 'Descrição muito longa (máximo 1000 caracteres)'),
    problema: z.string()
        .min(30, 'Descreva o problema com pelo menos 30 caracteres')
        .max(500, 'Muito longo (máximo 500 caracteres)')
        .optional(),
    solucao: z.string()
        .min(30, 'Descreva a solução com pelo menos 30 caracteres')
        .max(500, 'Muito longo (máximo 500 caracteres)')
        .optional(),
    modeloNegocio: z.string()
        .max(500, 'Muito longo (máximo 500 caracteres)')
        .optional(),
    diferencial: z.string()
        .max(500, 'Muito longo (máximo 500 caracteres)')
        .optional(),

    // Links e finanças (opcionais)
    siteUrl: z.string()
        .url('URL do site inválida')
        .optional()
        .or(z.literal('')),
    linkedinUrl: z.string()
        .url('URL do LinkedIn inválida')
        .optional()
        .or(z.literal('')),
    faturamentoMensal: z.number()
        .min(0, 'Valor não pode ser negativo')
        .optional(),
    investimentoBuscado: z.number()
        .min(0, 'Valor não pode ser negativo')
        .optional(),
    pitchDeckUrl: z.string()
        .url('URL do pitch deck inválida')
        .optional()
        .or(z.literal('')),
    videoPitchUrl: z.string()
        .url('URL do vídeo inválida')
        .optional()
        .or(z.literal('')),
});

export type StartupFormData = z.infer<typeof StartupSchema>;
