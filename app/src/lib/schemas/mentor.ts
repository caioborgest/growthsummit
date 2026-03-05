import { z } from 'zod';

/**
 * Schema de validação para candidatura de Mentor
 * Compartilhado entre MentorFormModal (público) e AdminAddMentor (admin)
 */
export const MentorSchema = z.object({
    nome: z.string()
        .min(3, 'Nome deve ter pelo menos 3 caracteres')
        .max(100, 'Nome muito longo'),
    email: z.string()
        .email('E-mail inválido')
        .toLowerCase()
        .trim(),
    telefone: z.string()
        .regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Formato de telefone inválido (esperado: (XX) XXXXX-XXXX)'),
    empresa: z.string()
        .min(2, 'Nome da empresa deve ter pelo menos 2 caracteres')
        .max(100, 'Nome da empresa muito longo')
        .optional(),
    cargo: z.string()
        .max(100, 'Cargo muito longo')
        .optional(),
    especialidades: z.array(z.string())
        .min(1, 'Selecione pelo menos uma especialidade')
        .max(10, 'Máximo de 10 especialidades'),
    bio: z.string()
        .min(50, 'A bio deve ter pelo menos 50 caracteres')
        .max(1000, 'Bio muito longa (máximo 1000 caracteres)')
        .optional(),
    linkedinUrl: z.string()
        .url('URL do LinkedIn inválida')
        .regex(/linkedin\.com/, 'Deve ser uma URL do LinkedIn')
        .optional()
        .or(z.literal('')),
    fotoUrl: z.string()
        .url('URL da foto inválida')
        .optional()
        .or(z.literal('')),
    yearsExperience: z.number()
        .int('Deve ser um número inteiro')
        .min(0, 'Experiência não pode ser negativa')
        .max(60, 'Valor inválido para anos de experiência')
        .optional(),
    maxMentories: z.number()
        .int()
        .min(1, 'Deve aceitar pelo menos 1 mentoria')
        .max(20, 'Máximo de 20 mentorias por evento')
        .default(5),
});

export type MentorFormData = z.infer<typeof MentorSchema>;
