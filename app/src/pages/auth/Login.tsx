import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      // Redirect based on role
      if (email === 'admin@growthsummit.site') {
        navigate('/admin');
      } else if (email === 'mentor@email.com') {
        navigate('/mentor-area');
      } else if (email === 'empresa@email.com') {
        navigate('/empresa-area');
      } else if (email === 'startup@email.com') {
        navigate('/startup-area');
      } else {
        navigate('/minha-area');
      }
    } catch {
      setError('Email ou senha inválidos');
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-100 to-dark" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
              <span className="text-white font-bold text-xl">GS</span>
            </div>
            <div>
              <span className="text-white font-bold text-xl">Growth Summit</span>
              <span className="text-teal-400 text-sm block">2026</span>
            </div>
          </Link>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-gray-400 text-center mb-6">
            Entre com suas credenciais para acessar
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 bg-dark-100 border-dark-300 text-white placeholder:text-gray-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 bg-dark-100 border-dark-300 text-white placeholder:text-gray-500"
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
              <label className="flex items-center">
                <input type="checkbox" className="rounded bg-dark-100 border-dark-300 text-teal-500" />
                <span className="ml-2 text-sm text-gray-400">Lembrar-me</span>
              </label>
              <a href="#" className="text-sm text-teal-400 hover:underline">
                Esqueceu a senha?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Ainda não tem conta?{' '}
              <Link to="/inscricoes" className="text-teal-400 hover:underline">
                Inscreva-se
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 glass-card p-4">
          <p className="text-gray-400 text-sm text-center mb-2">Credenciais de demonstração:</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            <div className="bg-dark-100 p-2 rounded">
              <span className="text-teal-400">Admin:</span> admin@growthsummit.site
            </div>
            <div className="bg-dark-100 p-2 rounded">
              <span className="text-teal-400">Senha:</span> 123456
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
