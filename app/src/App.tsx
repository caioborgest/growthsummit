import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/public/Home';
import { Sobre } from './pages/public/Sobre';
import { Programacao } from './pages/public/Programacao';
import { Palestrantes } from './pages/public/Palestrantes';
import { Inscricoes } from './pages/public/Inscricoes';
import { Mentorias } from './pages/public/Mentorias';
import { RodadaB2B } from './pages/public/RodadaB2B';
import { Startups } from './pages/public/Startups';
import { Patrocinio } from './pages/public/Patrocinio';
import { GrowthExperience } from './pages/public/GrowthExperience';
import { GrowthExperienceTriunfo } from './pages/public/GrowthExperienceTriunfo';
import { FAQ } from './pages/public/FAQ';
import { Contato } from './pages/public/Contato';
import { Login } from './pages/auth/Login';
import { DashboardParticipante } from './pages/dashboard/DashboardParticipante';
import { DashboardMentor } from './pages/dashboard/DashboardMentor';
import { DashboardCompany } from './pages/dashboard/DashboardCompany';
import { DashboardStartup } from './pages/dashboard/DashboardStartup';
import { DashboardSponsor } from './pages/dashboard/DashboardSponsor';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import AdminProjetos from './pages/admin/AdminProjetos';
import { AdminInscricoes } from './pages/admin/AdminInscricoes';
import { AdminMentores } from './pages/admin/AdminMentores';
import { AdminMentorias } from './pages/admin/AdminMentorias';
import { AdminB2B } from './pages/admin/AdminB2B';
import { AdminStartups } from './pages/admin/AdminStartups';
import { AdminPatrocinadores } from './pages/admin/AdminPatrocinadores';
import { AdminFinanceiro } from './pages/admin/AdminFinanceiro';
import { AdminCheckIn } from './pages/admin/AdminCheckIn';
import { AdminComunicacao } from './pages/admin/AdminComunicacao';
import { AdminRelatorios } from './pages/admin/AdminRelatorios';
import { AdminProgramacao } from './pages/admin/AdminProgramacao';
import { AdminSecurity } from './pages/admin/AdminSecurity';
import { AdminWhatsAppGroups } from './pages/admin/AdminWhatsAppGroups';
import { PWAInstallPrompt, IOSInstallBadge } from './components/PWAInstallPrompt';

// 404 Not Found Component
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

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange-coral"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
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
        <Route path="growth-experience" element={<GrowthExperience />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="contato" element={<Contato />} />
      </Route>

      {/* Dedicated Page for Triunfo (No Global Layout) */}
      <Route path="growth-experience-triunfo" element={<GrowthExperienceTriunfo />} />

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />

      {/* Participant Dashboard */}
      <Route
        path="/minha-area/*"
        element={
          <ProtectedRoute allowedRoles={['participant', 'admin']}>
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
      </Route>

      {/* 404 - Catch all undefined routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <IOSInstallBadge />
        <AppRoutes />
        <PWAInstallPrompt />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
