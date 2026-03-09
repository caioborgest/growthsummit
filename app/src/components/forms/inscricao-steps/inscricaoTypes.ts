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
    email: string;
    telefone: string;
    senha: string;
    indicacaoTipo?: 'prefeitura' | 'politico' | 'empresa' | 'promocional' | 'influenciador' | 'associacao' | 'instituicao' | 'outro' | 'nenhum';
    indicacaoNome?: string;
    codigo?: string;
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
}
