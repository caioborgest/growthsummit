import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import { useAuth } from '@/contexts/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticating, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

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
        default:
          navigate('/minha-area');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticating) return;

    setError('');

    try {
      const loggedInUser = await login(email, password);

      if (loggedInUser) {
        // Se precisar de 2FA, o AuthContext já terá atualizado o estado
        // e o componente de login pode mostrar o formulário de 2FA ou esperar
        if (loggedInUser.requires2FA) {
          console.log('2FA requerido');
          return;
        }

        // Redirecionamento baseado na role real do usuário
        switch (loggedInUser.role) {
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
          default:
            navigate('/minha-area');
        }
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
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl opacity-50" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center">
            <img
              src="https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/growthsummit-fundoescuro.png"
              alt="Growth Summit"
              className="h-10 sm:h-16 w-auto transition-all"
            />
          </Link>
        </div>

        {/* Login Card */}
        <div className="glass-card p-6 sm:p-8 w-full">
          <h1 className="text-xl sm:text-2xl font-bold text-white text-center mb-1">
            Bem-vindo de volta
          </h1>
          <p className="text-gray-400 text-center mb-4 sm:mb-6 text-sm sm:text-base">
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
                  className="pl-11 bg-dark-100 border-dark-300 text-white placeholder:text-gray-500 h-10 sm:h-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 bg-dark-100 border-dark-300 text-white placeholder:text-gray-500 h-10 sm:h-12"
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
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-5 sm:py-6 mt-2"
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
      </div>

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </div>
  );
}
