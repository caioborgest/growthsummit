// Shared types for registration steps

export interface DadosInscricao {
    // Step 1 - Daytime Activities
    cursosSelecionados: string[];
    tipoAtividadeSelecionada?: string;
    salaAtividade?: string;
    horarioAtividade?: string;
    nivelAtividade?: string;

    // Step 2 - Personal Details
    nome: string;
    cpf: string;
    email: string;
    phone: string;
    senha: string;
    indicacaoTipo?: 'prefeitura' | 'politico' | 'empresa' | 'promocional' | 'influenciador' | 'associacao' | 'instituicao' | 'parceiro' | 'outro' | 'nenhum';
    indicacaoNome?: string;
    partnerId?: string;
    /** Partner access code (required if partner has access_code in DB) */
    partnerAccessCode?: string;
    code?: string;
    descontoSocial?: number;

    // Step 4 (Night Experience)
    comprarPalestras: boolean;
    cupomPalestra?: string;
    descontoPalestra?: number;
    tipoSocioPalestra?: string;

    // Control
    userId?: string;
    inscricaoId?: string;
    statusPagamento?: string;
    appInstalado?: boolean;
    loteId?: string | null;
    voucherEmpresa?: string | null;
    tipoInscricao?: 'standard' | 'pro' | 'vip' | 'social';
    valorFinal?: number;
}
