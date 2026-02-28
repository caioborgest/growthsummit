import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import { toast } from 'sonner';

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticating, isAuthenticated, user, verify2FA } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);

  // Redirecionamento automático se já estiver logado
  useEffect(() => {
    if (isAuthenticated && user && !user.requires2FA) {
      switch (user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'mentor':
          navigate('/mentor-area');
          break;
        case 'company':
          navigate('/empresa-area');
          break;
        case 'startup':
          navigate('/startup-area');
          break;
        case 'sponsor':
          navigate('/patrocinador-area');
          break;
        case 'participant':
          navigate('/minha-area');
          break;
        default:
          navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isVerifying2FA) return;

    if (twoFactorCode.length !== 6) {
      toast.error('O código deve ter 6 dígitos');
      return;
    }

    setIsVerifying2FA(true);
    try {
      const isValid = await verify2FA(twoFactorCode);
      if (isValid) {
        toast.success('Login concluído com sucesso!');
        // O redirecionamento será tratado pelo useEffect de autenticação
      } else {
        toast.error('Código inválido ou expirado');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao verificar código');
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticating) return;

    setError('');

    try {
      const loggedInUser = await login(email, password);

      if (loggedInUser) {
        // Se precisar de 2FA, o AuthContext já terá atualizado o estado
        if (loggedInUser.requires2FA) {
          toast.info('Autenticação de dois fatores necessária');
          return;
        }

        // Redirecionamento baseado na role real do usuário com replace: true
        const rolesToPaths: Record<string, string> = {
          'admin': '/admin',
          'mentor': '/mentor-area',
          'company': '/empresa-area',
          'startup': '/startup-area',
          'sponsor': '/patrocinador-area',
          'participant': '/minha-area',
          'participante': '/minha-area'
        };

        const targetPath = rolesToPaths[loggedInUser.role] || '/';
        navigate(targetPath, { replace: true });
      }
    } catch (err) {
      const error = err as Error;
      setError(error?.message || 'Email ou senha inválidos');
    }
  };

  return (
    <div className="h-screen h-[100dvh] bg-dark flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-100 to-dark" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-orange-coral/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl opacity-50" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center">
            <img
              src="/images/logomarca-GX-fundoescuro.png"
              alt="Growth Experience"
              className="h-10 sm:h-16 w-auto transition-all"
            />
          </Link>
        </div>

        {/* 2FA Card or Login Card */}
        {user?.requires2FA ? (
          <div className="glass-card p-6 sm:p-8 w-full border-brand-orange-coral/30 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-brand-orange-coral/20 flex items-center justify-center ring-4 ring-brand-orange-coral/10">
                <Lock className="h-8 w-8 text-brand-orange-coral" />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white text-center mb-2">
              Verificação em 2 Etapas
            </h1>
            <p className="text-gray-400 text-center mb-8 text-sm sm:text-base">
              Digite o código de 6 dígitos gerado pelo seu aplicativo autenticador.
            </p>

            <form onSubmit={handleVerify2FA} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 text-center uppercase tracking-widest">
                  Código de Verificação
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="000 000"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    className="bg-dark-100/50 border-brand-orange-coral/30 text-white text-center h-16 text-3xl font-black rounded-2xl tracking-[0.3em] focus:border-brand-orange-coral focus:ring-4 focus:ring-brand-orange-coral/10 transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isVerifying2FA || twoFactorCode.length !== 6}
                className="w-full bg-brand-orange-coral hover:bg-brand-orange-intense text-white py-6 rounded-2xl font-black text-lg shadow-glow-orange"
              >
                {isVerifying2FA ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  'Verificar Código'
                )}
              </Button>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-2 text-xs font-bold text-gray-500 hover:text-white transition-colors"
              >
                Tentar entrar com outra conta
              </button>
            </form>
          </div>
        ) : (
          <div className="glass-card p-6 sm:p-8 w-full border-brand-orange-coral/10">
            <h1 className="text-xl sm:text-2xl font-bold text-white text-center mb-1">
              Bem-vindo de volta
            </h1>
            <p className="text-gray-400 text-center mb-4 sm:mb-6 text-sm sm:text-base font-medium">
              Entre com suas credenciais para acessar
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-xs sm:text-sm text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 bg-dark-100/50 border-dark-300 text-white placeholder:text-gray-500 h-10 sm:h-12 rounded-xl focus:border-brand-orange-coral/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
                  Senha
                </label>
                <div className="relative border-2 border-brand-orange-coral/20 rounded-xl focus-within:border-brand-orange-coral transition-all">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 bg-transparent border-none text-white placeholder:text-gray-500 h-10 sm:h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer group">
                  <input type="checkbox" className="rounded bg-dark-100 border-dark-300 text-teal-500" />
                  <span className="ml-2 text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Lembrar-me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs text-brand-orange-coral hover:text-brand-orange-intense font-bold transition-all"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-brand-orange-coral hover:bg-brand-orange-intense text-white py-5 sm:py-6 mt-2 rounded-xl font-black text-lg shadow-lg shadow-brand-orange-coral/20 transition-all hover:scale-[1.02]"
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </div>
        )}
      </div>

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </div>
  );
}
