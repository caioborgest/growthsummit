// Endpoints da API organizados por recurso

export const endpoints = {
  // Autenticação
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    me: '/auth/me',
  },
  
  // Usuários
  users: {
    base: '/users',
    byId: (id: string) => `/users/${id}`,
    profile: '/users/profile',
    avatar: '/users/avatar',
  },
  
  // Projetos
  projects: {
    base: '/projects',
    byId: (id: string) => `/projects/${id}`,
    select: (id: string) => `/projects/${id}/select`,
    stats: (id: string) => `/projects/${id}/stats`,
  },
  
  // Inscrições
  registrations: {
    base: '/registrations',
    byId: (id: string) => `/registrations/${id}`,
    checkout: '/registrations/checkout',
    verifyPayment: '/registrations/verify-payment',
    my: '/registrations/my',
    qrCode: (id: string) => `/registrations/${id}/qr`,
  },
  
  // Mentorias
  mentors: {
    base: '/mentors',
    byId: (id: string) => `/mentors/${id}`,
    apply: '/mentors/apply',
    my: '/mentors/my',
  },
  mentoringSessions: {
    base: '/mentoring-sessions',
    byId: (id: string) => `/mentoring-sessions/${id}`,
    schedule: '/mentoring-sessions/schedule',
    my: '/mentoring-sessions/my',
    feedback: (id: string) => `/mentoring-sessions/${id}/feedback`,
  },
  
  // B2B
  companies: {
    base: '/companies',
    byId: (id: string) => `/companies/${id}`,
    apply: '/companies/apply',
    my: '/companies/my',
  },
  b2bMeetings: {
    base: '/b2b-meetings',
    byId: (id: string) => `/b2b-meetings/${id}`,
    schedule: '/b2b-meetings/schedule',
    my: '/b2b-meetings/my',
    match: '/b2b-meetings/match',
  },
  
  // Startups
  startups: {
    base: '/startups',
    byId: (id: string) => `/startups/${id}`,
    apply: '/startups/apply',
    my: '/startups/my',
    pitchDeck: (id: string) => `/startups/${id}/pitch-deck`,
  },
  
  // Patrocinadores
  sponsors: {
    base: '/sponsors',
    byId: (id: string) => `/sponsors/${id}`,
    proposal: '/sponsors/proposal',
    deliverables: (id: string) => `/sponsors/${id}/deliverables`,
  },
  
  // Financeiro
  transactions: {
    base: '/transactions',
    byId: (id: string) => `/transactions/${id}`,
    report: '/transactions/report',
  },
  
  // Check-in
  checkIns: {
    base: '/check-ins',
    byId: (id: string) => `/check-ins/${id}`,
    validate: '/check-ins/validate',
    stats: '/check-ins/stats',
  },
  
  // Comunicação
  communications: {
    base: '/communications',
    templates: '/communications/templates',
    campaigns: '/communications/campaigns',
    send: '/communications/send',
  },
  
  // Relatórios
  reports: {
    base: '/reports',
    export: '/reports/export',
    dashboard: '/reports/dashboard',
  },
  
  // Uploads
  uploads: {
    base: '/uploads',
    signedUrl: '/uploads/signed-url',
  },
  
  // Notificações
  notifications: {
    base: '/notifications',
    byId: (id: string) => `/notifications/${id}`,
    markRead: '/notifications/mark-read',
    markAllRead: '/notifications/mark-all-read',
  },
} as const;
