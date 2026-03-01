import { lazy, Suspense } from 'react';
import { FileText } from 'lucide-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PageLoader } from './components/ui/PageLoader';

// ── Public Layout (loaded eagerly — needed for initial route)
import { Layout } from './components/layout/Layout';

// ── Public Pages (lazy)
const Sobre = lazy(() => import('./pages/public/Sobre').then(m => ({ default: m.Sobre })));
const Programacao = lazy(() => import('./pages/public/Programacao').then(m => ({ default: m.Programacao })));
const Palestrantes = lazy(() => import('./pages/public/Palestrantes').then(m => ({ default: m.Palestrantes })));
const Inscricoes = lazy(() => import('./pages/public/Inscricoes').then(m => ({ default: m.Inscricoes })));
const Mentorias = lazy(() => import('./pages/public/Mentorias').then(m => ({ default: m.Mentorias })));
const RodadaB2B = lazy(() => import('./pages/public/RodadaB2B').then(m => ({ default: m.RodadaB2B })));
const Startups = lazy(() => import('./pages/public/Startups').then(m => ({ default: m.Startups })));
const Patrocinio = lazy(() => import('./pages/public/Patrocinio').then(m => ({ default: m.Patrocinio })));
const GrowthExperience = lazy(() => import('./pages/public/GrowthExperience').then(m => ({ default: m.GrowthExperience })));
const GrowthExperienceTriunfo = lazy(() => import('./pages/public/GrowthExperienceTriunfo').then(m => ({ default: m.GrowthExperienceTriunfo })));
const GrowthExperiencePetrolina = lazy(() => import('./pages/public/GrowthExperiencePetrolina').then(m => ({ default: m.GrowthExperiencePetrolina })));
const FAQ = lazy(() => import('./pages/public/FAQ').then(m => ({ default: m.FAQ })));
const Contato = lazy(() => import('./pages/public/Contato').then(m => ({ default: m.Contato })));
const SejaMentor = lazy(() => import('./pages/public/SejaMentor').then(m => ({ default: m.SejaMentor })));
const LocalViagem = lazy(() => import('./pages/public/LocalViagem').then(m => ({ default: m.LocalViagem })));
const HelpCenter = lazy(() => import('./pages/help/HelpCenter').then(m => ({ default: m.HelpCenter })));

// ── Auth (lazy)
const Login = lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword').then(m => ({ default: m.ResetPassword })));

// ── Dashboards (lazy — each in its own chunk)
const DashboardParticipante = lazy(() => import('./pages/dashboard/DashboardParticipante').then(m => ({ default: m.DashboardParticipante })));
const DashboardMentor = lazy(() => import('./pages/dashboard/DashboardMentor').then(m => ({ default: m.DashboardMentor })));
const DashboardCompany = lazy(() => import('./pages/dashboard/DashboardCompany').then(m => ({ default: m.DashboardCompany })));
const DashboardStartup = lazy(() => import('./pages/dashboard/DashboardStartup').then(m => ({ default: m.DashboardStartup })));
const DashboardSponsor = lazy(() => import('./pages/dashboard/DashboardSponsor').then(m => ({ default: m.DashboardSponsor })));
const Certificados = lazy(() => import('./pages/dashboard/Certificados').then(m => ({ default: m.Certificados })));

// ── Admin (lazy — all in shared 'admin' chunk via dynamic imports)
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProjetos = lazy(() => import('./pages/admin/AdminProjetos').then(m => ({ default: m.AdminProjetos })));
const AdminInscricoes = lazy(() => import('./pages/admin/AdminInscricoes').then(m => ({ default: m.AdminInscricoes })));
const AdminMentores = lazy(() => import('./pages/admin/AdminMentores').then(m => ({ default: m.AdminMentores })));
const AdminMentorias = lazy(() => import('./pages/admin/AdminMentorias').then(m => ({ default: m.AdminMentorias })));
const AdminB2B = lazy(() => import('./pages/admin/AdminB2B').then(m => ({ default: m.AdminB2B })));
const AdminStartups = lazy(() => import('./pages/admin/AdminStartups').then(m => ({ default: m.AdminStartups })));
const AdminPatrocinadores = lazy(() => import('./pages/admin/AdminPatrocinadores').then(m => ({ default: m.AdminPatrocinadores })));
const AdminFinanceiro = lazy(() => import('./pages/admin/AdminFinanceiro').then(m => ({ default: m.AdminFinanceiro })));
const AdminCheckIn = lazy(() => import('./pages/admin/AdminCheckIn').then(m => ({ default: m.AdminCheckIn })));
const AdminComunicacao = lazy(() => import('./pages/admin/AdminComunicacao').then(m => ({ default: m.AdminComunicacao })));
const AdminRelatorios = lazy(() => import('./pages/admin/AdminRelatorios').then(m => ({ default: m.AdminRelatorios })));
const AdminProgramacao = lazy(() => import('./pages/admin/AdminProgramacao').then(m => ({ default: m.AdminProgramacao })));
const AdminSecurity = lazy(() => import('./pages/admin/AdminSecurity').then(m => ({ default: m.AdminSecurity })));
const AdminWhatsAppGroups = lazy(() => import('./pages/admin/AdminWhatsAppGroups').then(m => ({ default: m.AdminWhatsAppGroups })));
const AdminCupons = lazy(() => import('./pages/admin/AdminCupons').then(m => ({ default: m.AdminCupons })));
const AdminUsuarios = lazy(() => import('./pages/admin/AdminUsuarios').then(m => ({ default: m.AdminUsuarios })));
const AdminGrowthExperienceTriunfo = lazy(() => import('./pages/admin/AdminGrowthExperienceTriunfo').then(m => ({ default: m.AdminGrowthExperienceTriunfo })));
const PWAInstallPrompt = lazy(() => import('./components/PWAInstallPrompt').then(m => ({ default: m.PWAInstallPrompt })));
const IOSInstallBadge = lazy(() => import('./components/PWAInstallPrompt').then(m => ({ default: m.IOSInstallBadge })));

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
            <p>O Growth Summit 2026 preza pela transparência e segurança de todos os participantes. Este documento estabelece as diretrizes para {title.toLowerCase()}.</p>
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
            <p className="text-xs text-gray-500">Documento gerado automaticamente pela Plataforma Growth Summit.</p>
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
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-brand-orange-coral mb-4">404</h1>
        <h2 className="text-3xl font-bold text-white mb-4">Página não encontrada</h2>
        <p className="text-gray-400 mb-8">A página que você está procurando não existe.</p>
        <a
          href="/"
          className="inline-block bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-dark-100 font-bold px-8 py-3 rounded-lg transition-colors"
        >
          Voltar para Home
        </a>
      </div>
    </div>
  );
}

// ── Protected Route
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Normalizar roles para comparação segura
  const userRole = (user?.role || '').toLowerCase().trim();
  const normalizedAllowedRoles = allowedRoles?.map(r => r.toLowerCase().trim()) || [];

  if (allowedRoles && !normalizedAllowedRoles.includes(userRole)) {
    console.warn(`[ProtectedRoute] Acesso negado para role: ${userRole}. Permitidos: ${normalizedAllowedRoles}`);
    // Se logado mas sem permissão, vai para a página inicial
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={
            // Só redireciona automaticamente se estiver no modo standalone (PWA)
            window.matchMedia('(display-mode: standalone)').matches && isAuthenticated ? (
              user?.role === 'admin' ? <Navigate to="/admin" replace /> :
                user?.role === 'mentor' ? <Navigate to="/mentor-area" replace /> :
                  user?.role === 'company' ? <Navigate to="/empresa-area" replace /> :
                    user?.role === 'startup' ? <Navigate to="/startup-area" replace /> :
                      user?.role === 'sponsor' ? <Navigate to="/patrocinador-area" replace /> :
                        (user?.role === 'participant' || (user?.role as string) === 'participante') ? <Navigate to="/minha-area" replace /> :
                          (user?.role as string) === 'empresa' ? <Navigate to="/empresa-area" replace /> :
                            (user?.role as string) === 'palestrante' ? <Navigate to="/mentor-area" replace /> :
                              <GrowthExperience />
            ) : <GrowthExperience />
          } />
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
          <Route path="lgpd" element={<LegalPage title="LGPD" />} />
          <Route path="growth-experience-triunfo" element={<GrowthExperienceTriunfo />} />
          <Route path="growth-experience-petrolina" element={<GrowthExperiencePetrolina />} />
          <Route path="meus-certificados" element={
            <ProtectedRoute allowedRoles={['participant', 'participante', 'admin']}>
              <Certificados />
            </ProtectedRoute>
          } />
        </Route>

        {/* Help Center (App only, no public layout) */}
        <Route path="guia" element={
          <ProtectedRoute>
            <HelpCenter />
          </ProtectedRoute>
        } />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
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
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="projetos" element={<AdminProjetos />} />
          <Route path="inscricoes" element={<AdminInscricoes />} />
          <Route path="mentores" element={<AdminMentores />} />
          <Route path="mentorias" element={<AdminMentorias />} />
          <Route path="rodada-negocios" element={<AdminB2B />} />
          <Route path="startups" element={<AdminStartups />} />
          <Route path="patrocinadores" element={<AdminPatrocinadores />} />
          <Route path="financeiro" element={<AdminFinanceiro />} />
          <Route path="check-in" element={<AdminCheckIn />} />
          <Route path="whatsapp-groups" element={<AdminWhatsAppGroups />} />
          <Route path="comunicacao" element={<AdminComunicacao />} />
          <Route path="relatorios" element={<AdminRelatorios />} />
          <Route path="programacao" element={<AdminProgramacao />} />
          <Route path="seguranca" element={<AdminSecurity />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="cupons" element={<AdminCupons />} />
          <Route path="growth-experience" element={<AdminGrowthExperienceTriunfo />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function App() {
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
