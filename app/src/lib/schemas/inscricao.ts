import { z } from 'zod';

/**
 * Schema base para dados pessoais do inscrito
 */
export const DadosPessoaisSchema = z.object({
    nome: z.string()
        .min(3, 'Nome deve ter pelo menos 3 caracteres')
        .max(100, 'Nome muito longo'),
    email: z.string()
        .email('E-mail inválido')
        .toLowerCase()
        .trim(),
    telefone: z.string()
        .regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Formato de telefone inválido (esperado: (XX) XXXXX-XXXX)'),
    senha: z.string()
        .min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

/**
 * Schema para a inscrição completa (Growth Experience)
 */
export const InscricaoSchema = DadosPessoaisSchema.extend({
    projetoId: z.string().uuid('ID do projeto inválido'),
    cursosSelecionados: z.array(z.string().uuid()).min(1, 'Selecione pelo menos uma atividade'),
    comprarPalestras: z.boolean().default(false),
    tipoInscricao: z.enum(['standard', 'pro', 'vip']).default('standard'),
    indicacaoTipo: z.string().optional(),
    indicacaoNome: z.string().optional(),
    codigo: z.string().optional(), // código de desconto social
    cupomPalestra: z.string().optional(), // cupom para palestras noturnas
});

export type DadosPessoais = z.infer<typeof DadosPessoaisSchema>;
export type InscricaoCompleta = z.infer<typeof InscricaoSchema>;
