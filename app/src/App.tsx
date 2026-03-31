import { lazy, Suspense } from 'react';
import { FileText, Home as HomeIcon, ArrowLeft } from 'lucide-react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PageLoader } from './components/ui/PageLoader';

// ── Helper para Carregamento Dinâmico com Retry ───────────────────────────
const lazyWithRetry = (componentImport: () => Promise<any>, exportName?: string) => {
  return lazy(async () => {
    try {
      const module = await componentImport();
      // Se tiver exportName, usa ele. Senão tenta default, senão o próprio módulo.
      const Component = exportName ? module[exportName] : module.default || module;
      
      if (!Component) {
        throw new Error(`Componente "${exportName || 'default'}" não encontrado no módulo.`);
      }
      
      return { default: Component };
    } catch (error) {
      console.error(`[lazyWithRetry] Falha ao carregar ${exportName || 'componente'}:`, error);
      
      // Verifica se é erro de rede/chunk e tenta novamente uma vez antes de desistir
      const isNetworkError = error instanceof Error && 
        (error.message.includes('fetch') || error.message.includes('Loading chunk') || error.message.includes('connection lost'));
      
      if (isNetworkError) {
        // Aguarda um pouco e recarrega a página como última instância para tentar reconectar ao servidor Vite
        console.warn('[lazyWithRetry] Erro de rede detectado. Agendando recarregamento...');
        setTimeout(() => window.location.reload(), 2000);
      }
      
      return { default: () => (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-dark-200 rounded-3xl border border-white/5">
          <h2 className="text-xl font-bold text-white mb-2">Ops! Problema na Conexão</h2>
          <p className="text-gray-400 mb-6">Não conseguimos baixar os arquivos necessários. O servidor pode estar reiniciando.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-brand-orange-coral text-white rounded-2xl font-black shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
          >
            Sincronizar Agora
          </button>
        </div>
      )};
    }
  });
};

// ── Public Layout (loaded eagerly — needed for initial route)
import { Layout } from './components/layout/Layout';

// ── Public Pages (lazy)
const Sobre = lazyWithRetry(() => import('./pages/public/Sobre'), 'Sobre');
const Programacao = lazyWithRetry(() => import('./pages/public/Programacao'), 'Programacao');
const Palestrantes = lazyWithRetry(() => import('./pages/public/Palestrantes'), 'Palestrantes');
const Inscricoes = lazyWithRetry(() => import('./pages/public/Inscricoes'), 'Inscricoes');
const Mentorias = lazyWithRetry(() => import('./pages/public/Mentorias'), 'Mentorias');
const RodadaB2B = lazyWithRetry(() => import('./pages/public/RodadaB2B'), 'RodadaB2B');
const Startups = lazyWithRetry(() => import('./pages/public/Startups'), 'Startups');
const Patrocinio = lazyWithRetry(() => import('./pages/public/Patrocinio'), 'Patrocinio');
const GrowthExperience = lazyWithRetry(() => import('./pages/public/GrowthExperience'));
const GrowthExperienceTriunfo = lazyWithRetry(() => import('./pages/public/GrowthExperienceTriunfo'));
const GrowthExperiencePetrolina = lazyWithRetry(() => import('./pages/public/GrowthExperiencePetrolina'));
const DynamicEventPage = lazyWithRetry(() => import('./pages/public/DynamicEventPage'));
const FAQ = lazyWithRetry(() => import('./pages/public/FAQ'), 'FAQ');
const Contato = lazyWithRetry(() => import('./pages/public/Contato'), 'Contato');
const SejaMentor = lazyWithRetry(() => import('./pages/public/SejaMentor'), 'SejaMentor');
const LocalViagem = lazyWithRetry(() => import('./pages/public/LocalViagem'), 'LocalViagem');
const HelpCenter = lazyWithRetry(() => import('./pages/help/HelpCenter'), 'HelpCenter');
const ValidarCertificado = lazyWithRetry(() => import('./pages/public/ValidarCertificado'), 'ValidarCertificado');

// ── Auth (lazy)
const Login = lazyWithRetry(() => import('./pages/auth/Login'), 'Login');
const ResetPassword = lazyWithRetry(() => import('./pages/auth/ResetPassword'), 'ResetPassword');
const AuthCallback = lazyWithRetry(() => import('./pages/auth/AuthCallback'), 'AuthCallback');

// ── Dashboards (lazy — each in its own chunk)
const DashboardParticipante = lazyWithRetry(() => import('./pages/dashboard/DashboardParticipante'), 'DashboardParticipante');
const DashboardMentor = lazyWithRetry(() => import('./pages/dashboard/DashboardMentor'));
const DashboardCompany = lazyWithRetry(() => import('./pages/dashboard/DashboardCompany'), 'DashboardCompany');
const DashboardStartup = lazyWithRetry(() => import('./pages/dashboard/DashboardStartup'), 'DashboardStartup');
const DashboardSponsor = lazyWithRetry(() => import('./pages/dashboard/DashboardSponsor'), 'DashboardSponsor');
const Certificados = lazyWithRetry(() => import('./pages/dashboard/Certificados'), 'Certificados');
const ComingSoon = lazyWithRetry(() => import('./pages/ComingSoon'), 'ComingSoon');

// ── Admin (lazy — all in shared 'admin' chunk via dynamic imports)
const AdminLayout = lazyWithRetry(() => import('./pages/admin/AdminLayout'), 'AdminLayout');
const AdminDashboard = lazyWithRetry(() => import('./pages/admin/AdminDashboard'), 'AdminDashboard');
const AdminProjetos = lazyWithRetry(() => import('./pages/admin/AdminProjetos'));
const AdminInscricoes = lazyWithRetry(() => import('./pages/admin/AdminInscricoes'));
const AdminEmpresasIncentivadoras = lazyWithRetry(() => import('./pages/admin/AdminEmpresasIncentivadoras'));
const AdminMentores = lazyWithRetry(() => import('./pages/admin/AdminMentores'), 'AdminMentores');
const AdminMentorias = lazyWithRetry(() => import('./pages/admin/AdminMentorias'), 'AdminMentorias');
const AdminB2B = lazyWithRetry(() => import('./pages/admin/AdminB2B'), 'AdminB2B');
const AdminStartups = lazyWithRetry(() => import('./pages/admin/AdminStartups'), 'AdminStartups');
const AdminPatrocinadores = lazyWithRetry(() => import('./pages/admin/AdminPatrocinadores'));
const AdminFinanceiro = lazyWithRetry(() => import('./pages/admin/AdminFinanceiro'), 'AdminFinanceiro');
const AdminCheckIn = lazyWithRetry(() => import('./pages/admin/AdminCheckIn'), 'AdminCheckIn');
const AdminComunicacao = lazyWithRetry(() => import('./pages/admin/AdminComunicacao'));
const AdminRelatorios = lazyWithRetry(() => import('./pages/admin/AdminRelatorios'), 'AdminRelatorios');
const AdminProgramacao = lazyWithRetry(() => import('./pages/admin/AdminProgramacao'), 'AdminProgramacao');
const AdminSecurity = lazyWithRetry(() => import('./pages/admin/AdminSecurity'), 'AdminSecurity');
const AdminCupons = lazyWithRetry(() => import('./pages/admin/AdminCupons'));
const AdminUsuarios = lazyWithRetry(() => import('./pages/admin/AdminUsuarios'));
const AdminGrowthExperienceTriunfo = lazyWithRetry(() => import('./pages/admin/AdminGrowthExperienceTriunfo'), 'AdminGrowthExperienceTriunfo');
const AdminCertificados = lazyWithRetry(() => import('./pages/admin/AdminCertificados'));
const AdminBatches = lazyWithRetry(() => import('./pages/admin/AdminBatches'));
const AdminStands = lazyWithRetry(() => import('./pages/admin/AdminStands'));
const AdminSorteio = lazyWithRetry(() => import('./pages/admin/AdminSorteio'));
const AdminSupport = lazyWithRetry(() => import('./pages/admin/AdminSupport'));
const AdminIntegracoes = lazyWithRetry(() => import('./pages/admin/AdminIntegracoes'), 'AdminIntegracoes');
const PWAInstallPrompt = lazyWithRetry(() => import('./components/PWAInstallPrompt'), 'PWAInstallPrompt');
const IOSInstallBadge = lazyWithRetry(() => import('./components/PWAInstallPrompt'), 'IOSInstallBadge');

// ── Legal Pages (Shared Component Stub)
function LegalPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-dark py-20 px-4">
      <div className="max-w-4xl mx-auto glass-card p-8 sm:p-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-orange-coral/20 flex items-center justify-center">
            <FileText className="h-6 w-6 text-brand-orange-coral" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">{title}</h1>
            <p className="text-gray-500 text-sm">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-gray-400 space-y-6">
          <section>
            <h3 className="text-white font-bold text-xl mb-4">1. Introdução</h3>
            <p>O Growth Experience 2026 preza pela transparência e segurança de todos os participantes. Este documento estabelece as diretrizes para {title.toLowerCase()}.</p>
          </section>

          <section>
            <h3 className="text-white font-bold text-xl mb-4">2. Uso dos Dados</h3>
            <p>Todas as informações coletadas através desta plataforma são utilizadas exclusivamente para a gestão do evento, emissão de certificados e comunicação oficial.</p>
          </section>

          <section>
            <h3 className="text-white font-bold text-xl mb-4">3. Responsabilidades</h3>
            <p>A organização do evento garante a proteção dos dados em conformidade com a LGPD, implementando as melhores práticas conceituais de segurança cibernética.</p>
          </section>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">Documento gerado automaticamente pela Plataforma Growth Experience.</p>
            <a href="/" className="text-brand-orange-coral hover:underline font-bold text-sm">Voltar para a página inicial</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 404 Not Found
function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-300">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange-coral/10 rounded-full blur-[120px] -z-10 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] -z-10 translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-md w-full text-center relative z-10">
        <div className="mb-8 relative inline-block">
          <h1 className="text-[12rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-brand-orange-coral to-brand-orange-intense opacity-20 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-brand-orange-coral/20 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/10 rotate-12 animate-float">
              <HomeIcon className="h-12 w-12 text-brand-orange-coral -rotate-12" />
            </div>
          </div>
        </div>

        <h2 className="text-4xl font-black text-white mb-4 tracking-tight uppercase">Página Perdida</h2>
        <p className="text-gray-400 mb-10 text-lg leading-relaxed">
          O conteúdo que você procura foi movido ou não existe mais no ecossistema Growth Experience.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-3 bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-brand-orange-coral/20 hover:scale-105 active:scale-95 group"
          >
            <HomeIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
            Voltar para Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 px-8 py-4 rounded-2xl transition-all backdrop-blur-md"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    console.info('[ProtectedRoute] Usuário não autenticado, redirecionando para /login');
    return <Navigate to="/login" replace />;
  }

  // Normalizar roles para comparação segura
  const userRole = (user?.role || '').toLowerCase().trim();
  const normalizedAllowedRoles = allowedRoles?.map(r => r.toLowerCase().trim()) || [];

  // Superadmin sempre tem acesso a tudo
  if (userRole === 'superadmin') {
    return <>{children}</>;
  }

  if (allowedRoles && !normalizedAllowedRoles.includes(userRole)) {
    console.warn(`[ProtectedRoute] Acesso negado para role: ${userRole}. Permitidos: ${normalizedAllowedRoles}. Redirecionando para Home.`);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function Home() {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) {
    const rolesToPaths: Record<string, string> = {
      'superadmin': '/admin',
      'admin': '/admin',
      'staff': '/admin/check-in',
      'mentor': '/mentor-area',
      'company': '/empresa-area',
      'startup': '/startup-area',
      'sponsor': '/patrocinador-area',
      'participant': '/minha-area',
      'participante': '/minha-area',
      'visitor': '/',
      'speaker': '/'
    };
    const path = rolesToPaths[user.role] || '/';
    if (path !== '/') return <Navigate to={path} replace />;
  }

  return <GrowthExperience />;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="sobre" element={<Sobre />} />
          <Route path="programacao" element={<Programacao />} />
          <Route path="palestrantes" element={<Palestrantes />} />
          <Route path="inscricoes" element={<Inscricoes />} />
          <Route path="mentorias" element={<Mentorias />} />
          <Route path="rodada-negocios" element={<RodadaB2B />} />
          <Route path="startups" element={<Startups />} />
          <Route path="seja-patrocinador" element={<Patrocinio />} />
          <Route path="growth-experience" element={<Navigate to="/" replace />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="contato" element={<Contato />} />
          <Route path="seja-mentor" element={<SejaMentor />} />
          <Route path="local-e-viagem" element={<LocalViagem />} />
          <Route path="termos" element={<LegalPage title="Termos de Uso" />} />
          <Route path="privacidade" element={<LegalPage title="Política de Privacidade" />} />
          <Route path="growth-experience-triunfo" element={<Navigate to="/triunfo" replace />} />
          <Route path="growth-experience-petrolina" element={<Navigate to="/petrolina" replace />} />
          <Route path="triunfo" element={<GrowthExperienceTriunfo />} />
          <Route path="petrolina" element={<GrowthExperiencePetrolina />} />
          <Route path="evento/:slug" element={<DynamicEventPage />} />
          <Route path="validar" element={<ValidarCertificado />} />
          <Route path="validar/:code" element={<ValidarCertificado />} />
          <Route path="meus-certificados" element={
            <ProtectedRoute allowedRoles={['participant', 'participante', 'admin']}>
              <Certificados />
            </ProtectedRoute>
          } />
          <Route path="em-breve" element={<ComingSoon />} />
          <Route path="em-breve/:feature" element={<ComingSoon />} />
        </Route>

        {/* Help Center (App only, no public layout) */}
        <Route path="guia" element={
          <ProtectedRoute>
            <HelpCenter />
          </ProtectedRoute>
        } />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />

        {/* Participant Dashboard */}
        <Route
          path="/minha-area/*"
          element={
            <ProtectedRoute allowedRoles={['participant', 'participante', 'admin']}>
              <DashboardParticipante />
            </ProtectedRoute>
          }
        />

        {/* Mentor Dashboard */}
        <Route
          path="/mentor-area/*"
          element={
            <ProtectedRoute allowedRoles={['mentor', 'admin']}>
              <DashboardMentor />
            </ProtectedRoute>
          }
        />

        {/* Company Dashboard */}
        <Route
          path="/empresa-area/*"
          element={
            <ProtectedRoute allowedRoles={['company', 'admin']}>
              <DashboardCompany />
            </ProtectedRoute>
          }
        />

        {/* Startup Dashboard */}
        <Route
          path="/startup-area/*"
          element={
            <ProtectedRoute allowedRoles={['startup', 'admin']}>
              <DashboardStartup />
            </ProtectedRoute>
          }
        />

        {/* Sponsor Dashboard */}
        <Route
          path="/patrocinador-area/*"
          element={
            <ProtectedRoute allowedRoles={['sponsor', 'admin']}>
              <DashboardSponsor />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="projetos" element={<AdminProjetos />} />
          <Route path="inscricoes" element={<AdminInscricoes />} />
          <Route path="empresas-incentivadoras" element={<AdminEmpresasIncentivadoras />} />
          <Route path="mentores" element={<AdminMentores />} />
          <Route path="mentorias" element={<AdminMentorias />} />
          <Route path="rodada-negocios" element={<AdminB2B />} />
          <Route path="startups" element={<AdminStartups />} />
          <Route path="patrocinadores" element={<AdminPatrocinadores />} />
          <Route path="financeiro" element={<AdminFinanceiro />} />
          <Route path="check-in" element={<AdminCheckIn />} />
          <Route path="comunicacao" element={<AdminComunicacao />} />
          <Route path="relatorios" element={<AdminRelatorios />} />
          <Route path="programacao" element={<AdminProgramacao />} />
          <Route path="seguranca" element={<AdminSecurity />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="cupons" element={<AdminCupons />} />
          <Route path="growth-experience" element={<AdminGrowthExperienceTriunfo />} />
          <Route path="certificados" element={<AdminCertificados />} />
          <Route path="lotes-equipes" element={<AdminBatches />} />
          <Route path="integracoes" element={<AdminIntegracoes />} />
          <Route path="stands" element={<AdminStands />} />
          <Route path="sorteio" element={<AdminSorteio />} />
          <Route path="suporte" element={<AdminSupport />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  useEffect(() => {
    // Sistema de Atualização Forçada (Cache Buster)
    // Se a versão do app mudar, força um recarregamento para limpar caches antigos do Service Worker
    const APP_VERSION = '1.1.3';
    const lastVersion = localStorage.getItem('ge_app_version');

    if (lastVersion && lastVersion !== APP_VERSION) {
      console.info(`[PWA] Atualizando da versão ${lastVersion} para ${APP_VERSION}...`);
      localStorage.setItem('ge_app_version', APP_VERSION);
      // Aguarda o SW registrar a nova versão e recarrega
      setTimeout(() => window.location.reload(), 500);
    } else if (!lastVersion) {
      localStorage.setItem('ge_app_version', APP_VERSION);
    }

    // Interceptador de erros do Zod para facilitar o diagnóstico de campos obrigatórios vazios
    const originalError = console.error;
    console.error = (...args) => {
      const errorMsg = args.join(' ');
      if (errorMsg.includes('ZodError') || errorMsg.includes('String must contain at least 1 character(s)')) {
        console.group('🔍 GROWTH PLATFORM - DETECTOR DE ERRO DE VALIDAÇÃO');
        console.warn('Campo(s) com erro:', errorMsg);
        console.info('DICA: Procure por campos marcados como .min(1) que estão recebendo strings vazias.');
        console.trace('Rastro do Erro (Stack Trace):');
        console.groupEnd();
      }
      originalError.apply(console, args);
    };
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={null}>
          <IOSInstallBadge />
        </Suspense>
        <AppRoutes />
        <Suspense fallback={null}>
          <PWAInstallPrompt />
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
