
/**
 * Role Mappings: Translates database/JWT roles to frontend standard roles.
 */
export const ROLE_MAPPING: Record<string, string> = {
  'participante': 'participant',
  'admin': 'admin',
  'superadmin': 'admin',
  'super-admin': 'admin',
  'mentor': 'mentor',
  'company': 'company',
  'empresa': 'company',
  'startup': 'startup',
  'sponsor': 'sponsor',
  'staff': 'staff',
  'speaker': 'speaker',
  'palestrante': 'speaker'
};

/**
 * Display labels for roles in Portuguese.
 */
export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  staff: 'Equipe (Staff)',
  mentor: 'Mentor',
  sponsor: 'Patrocinador',
  company: 'Empresa Âncora',
  startup: 'Startup',
  participant: 'Participante',
  speaker: 'Palestrante',
  visitor: 'Visitante'
};

/**
 * Status Mappings: Translates database status strings to frontend standard statuses.
 * Handles both standard English DBs andized Portuguese DBs (Growth Experience).
 */
export const STATUS_MAPPING: Record<string, string> = {
  // Database -> Frontend
  'ativo': 'paid',
  'pago': 'paid',
  'paid': 'paid',
  'pendente': 'pending',
  'pending': 'pending',
  'cancelado': 'cancelled',
  'cancelled': 'cancelled',
  'rejeitado': 'rejected',
  'rejected': 'rejected',
  'aprovado': 'approved',
  'approved': 'approved',
  'processing': 'processing',
  'failed': 'failed',
  'refunded': 'refunded',
  'expired': 'expired',
  'no_show': 'no_show',
  'completed': 'completed',
  'scheduled': 'scheduled',
  'active': 'active'
};

/**
 * Display labels for statuses in Portuguese.
 */
export const STATUS_LABELS: Record<string, string> = {
  paid: 'Pago / Ativo',
  pending: 'Pendente',
  cancelled: 'Cancelado',
  rejected: 'Rejeitado',
  approved: 'Aprovado',
  processing: 'Processando',
  failed: 'Falhou',
  refunded: 'Reembolsado',
  expired: 'Expirado',
  no_show: 'Não Compareceu',
  completed: 'Concluído',
  scheduled: 'Agendado',
  active: 'Ativo'
};
