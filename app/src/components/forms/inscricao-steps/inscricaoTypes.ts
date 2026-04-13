// Shared types for registration steps

export interface DadosInscricao {
    // Step 1 - Daytime Activities
    cursosSelecionados?: string[];
    session_ids?: string[];
    selectedActivityType?: string;
    activityRoom?: string;
    activitySchedule?: string;
    activityLevel?: string;

    // Step 2 - Personal Details
    name: string;
    cpf: string;
    email: string;
    phone: string;
    password?: string;
    referralType?: 'prefeitura' | 'politico' | 'empresa' | 'promocional' | 'influenciador' | 'associacao' | 'instituicao' | 'parceiro' | 'outro' | 'nenhum';
    referralName?: string;
    partnerId?: string;
    /** Partner access code (required if partner has access_code in DB) */
    partnerAccessCode?: string;
    code?: string;
    socialDiscount?: number;

    // Step 4 (Night Experience)
    buyLectures: boolean;
    lectureCoupon?: string;
    lectureDiscount?: number;
    lecturePartnerType?: string;

    // Control
    userId?: string;
    registrationId?: string;
    paymentStatus?: string;
    appInstalled?: boolean;
    batchId?: string | null;
    companyVoucher?: string | null;
    registrationType?: 'standard' | 'pro' | 'vip' | 'social';
    valorFinal?: number;
    registrationStatus?: string;
}
