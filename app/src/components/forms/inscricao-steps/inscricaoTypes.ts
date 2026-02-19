// Tipos compartilhados entre os steps de inscrição

export interface DadosInscricao {
    // Etapa 1
    cursosSelecionados: string[];

    // Etapa 2
    nome: string;
    email: string;
    telefone: string;
    senha: string;
    indicacaoTipo?: 'prefeitura' | 'politico' | 'nenhum';
    indicacaoNome?: string;
    codigo?: string;
    descontoSocial?: number;

    // Etapa 4
    comprarPalestras: boolean;

    // Controle
    userId?: string;
    inscricaoId?: string;
    appInstalado?: boolean;
}
