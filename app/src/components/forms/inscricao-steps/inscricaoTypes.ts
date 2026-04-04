// Tipos compartilhados entre os steps de inscrição

export interface DadosInscricao {
    // Etapa 1 - Atividades Diurnas
    cursosSelecionados: string[];
    tipoAtividadeSelecionada?: string;
    salaAtividade?: string;
    horarioAtividade?: string;
    nivelAtividade?: string;

    // Etapa 2
    nome: string;
    cpf: string;
    email: string;
    phone: string;
    senha: string;
    indicacaoTipo?: 'prefeitura' | 'politico' | 'empresa' | 'promocional' | 'influenciador' | 'associacao' | 'instituicao' | 'parceiro' | 'outro' | 'nenhum';
    indicacaoNome?: string;
    partnerId?: string;
    /** Código de acesso do parceiro (obrigatório se o parceiro tiver access_code no banco) */
    partnerAccessCode?: string;
    code?: string;
    descontoSocial?: number;

    // Etapa 4 (Night Experience)
    comprarPalestras: boolean;
    cupomPalestra?: string;
    descontoPalestra?: number;
    tipoSocioPalestra?: string;

    // Controle
    userId?: string;
    inscricaoId?: string;
    statusPagamento?: string;
    appInstalado?: boolean;
    loteId?: string;
    voucherEmpresa?: string;
    tipoInscricao?: 'standard' | 'pro' | 'vip' | 'social';
    valorFinal?: number;
}
