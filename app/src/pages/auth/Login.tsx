import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { motion, AnimatePresence } from 'framer-motion';

// Partículas flutuantes decorativas
function FloatingParticle({ x, y, size, delay, duration }: { x: string; y: string; size: number; delay: number; duration: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, background: 'rgba(255,112,67,0.25)' }}
      animate={{ y: [0, -30, 0], opacity: [0.2, 0.7, 0.2], scale: [1, 1.4, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticating, isAuthenticated, user, verify2FA, loginWithOTP } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && !user.requires2FA) {
      const paths: Record<string, string> = {
        admin: '/admin', mentor: '/mentor-area', company: '/empresa-area',
        startup: '/startup-area', sponsor: '/patrocinador-area',
        participant: '/minha-area', participante: '/minha-area',
      };
      navigate(paths[user.role] || '/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isVerifying2FA) return;
    if (twoFactorCode.length !== 6) { toast.error('O código deve ter 6 dígitos'); return; }
    setIsVerifying2FA(true);
    try {
      const isValid = await verify2FA(twoFactorCode);
      if (!isValid) toast.error('Código inválido ou expirado');
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
      if (loginMethod === 'password') {
        const loggedInUser = await login(email, password);
        if (loggedInUser && !loggedInUser.requires2FA) {
          const paths: Record<string, string> = {
            admin: '/admin', mentor: '/mentor-area', company: '/empresa-area',
            startup: '/startup-area', sponsor: '/patrocinador-area',
            participant: '/minha-area', participante: '/minha-area',
          };
          navigate(paths[loggedInUser.role] || '/', { replace: true });
        }
      } else {
        await loginWithOTP(email);
        setOtpSent(true);
        toast.success(`Link enviado para ${email}!`);
      }
    } catch (err: any) {
      const msg = err?.message || '';
      logger.error('Login error:', err);
      if (msg.includes('Email logins are disabled')) {
        setError('Login por senha desativado. Use "Sem Senha".');
        setLoginMethod('otp');
      } else {
        setError(msg || 'Email ou senha inválidos');
      }
    }
  };

  const particles = [
    { x: '8%', y: '12%', size: 6, delay: 0, duration: 5 },
    { x: '85%', y: '20%', size: 4, delay: 1, duration: 6 },
    { x: '75%', y: '70%', size: 8, delay: 2, duration: 7 },
    { x: '15%', y: '75%', size: 5, delay: 0.5, duration: 5.5 },
    { x: '50%', y: '8%', size: 3, delay: 1.5, duration: 4.5 },
    { x: '92%', y: '50%', size: 4, delay: 3, duration: 6.5 },
  ];

  // ── OTP Enviado ─────────────────────────────────────────────────────────
  if (otpSent) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center p-4 overflow-hidden relative" style={{ background: '#0c0e12' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(255,112,67,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(255,64,53,0.08) 0%, transparent 60%)' }} />
        {particles.map((p, i) => <FloatingParticle key={i} {...p} />)}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-sm text-center">
          <div className="rounded-[2rem] p-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-20 h-20 rounded-[1.5rem] mx-auto mb-6 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(255,112,67,0.2), rgba(255,64,53,0.1))', border: '1px solid rgba(255,112,67,0.3)' }}>
              <Mail className="h-9 w-9 text-brand-orange-coral" />
            </motion.div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Verifique seu E-mail</h2>
            <p className="text-gray-400 mb-8 text-sm">Enviamos um link de acesso para <strong className="text-white">{email}</strong>. Clique no link para entrar.</p>
            <Button variant="outline" onClick={() => setOtpSent(false)} className="w-full border-white/10 text-gray-400 hover:text-white rounded-xl h-12">
              Voltar ao Login
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center p-4 overflow-hidden relative" style={{ background: '#0c0e12' }}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 20%, rgba(255,112,67,0.15) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(255,64,53,0.1) 0%, transparent 55%), radial-gradient(ellipse at 80% 10%, rgba(255,133,73,0.08) 0%, transparent 45%)' }} />
        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'linear-gradient(rgba(255,112,67,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,112,67,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        {particles.map((p, i) => <FloatingParticle key={i} {...p} />)}
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="text-center">
          <Link to="/" className="inline-flex items-center justify-center flex-col gap-3">
            <img src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/favicon.png" alt="Growth Experience" className="h-20 w-auto drop-shadow-[0_0_15px_rgba(255,112,67,0.3)] hover:scale-105 transition-transform" />
          </Link>
        </motion.div>

        {/* 2FA Card */}
        {user?.requires2FA ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full rounded-[2rem] p-6 sm:p-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,112,67,0.2)', backdropFilter: 'blur(24px)', boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)' }}>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-[1.2rem] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(255,112,67,0.2), rgba(255,64,53,0.1))', border: '1px solid rgba(255,112,67,0.3)' }}>
                <Lock className="h-8 w-8 text-brand-orange-coral" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-white text-center mb-2">Verificação em 2 Etapas</h1>
            <p className="text-gray-400 text-center mb-6 text-sm">Digite o código de 6 dígitos do seu aplicativo autenticador.</p>
            <form onSubmit={handleVerify2FA} className="space-y-5">
              <Input
                type="text" inputMode="numeric" placeholder="000 000" maxLength={6}
                value={twoFactorCode} onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                className="bg-white/5 border-white/10 text-white text-center h-16 text-3xl font-black rounded-2xl tracking-[0.3em] focus:border-brand-orange-coral/50"
                required autoFocus
              />
              <Button type="submit" disabled={isVerifying2FA || twoFactorCode.length !== 6}
                className="w-full h-14 rounded-2xl font-black text-base text-white border-none btn-shimmer"
                style={{ background: 'linear-gradient(135deg, #ff7043, #ff4035)', boxShadow: '0 4px 24px rgba(255,112,67,0.4)' }}
              >
                {isVerifying2FA ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : 'Verificar Código'}
              </Button>
              <button type="button" onClick={() => window.location.reload()} className="w-full py-2 text-xs font-bold text-gray-600 hover:text-white transition-colors">
                Tentar com outra conta
              </button>
            </form>
          </motion.div>
        ) : (
          // ── Main Login Card ────────────────────────────────────────────
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full rounded-[2rem] overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            {/* Top accent */}
            <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #ff7043, #ff4035, transparent)' }} />

            <div className="p-6 sm:p-8 space-y-5">
              {/* Method Toggle */}
              <div className="flex p-1 rounded-xl gap-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {(['password', 'otp'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setLoginMethod(m)}
                    className="flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
                    style={loginMethod === m ? {
                      background: 'linear-gradient(135deg, #ff7043, #ff4035)',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(255,112,67,0.35)'
                    } : { color: 'rgba(255,255,255,0.4)' }}
                  >
                    {m === 'password' ? 'Com Senha' : 'Sem Senha'}
                  </button>
                ))}
              </div>

              {/* Heading */}
              <div className="text-center">
                <h1 className="text-xl font-black text-white mb-1">
                  {loginMethod === 'password' ? 'Bem-vindo de volta' : 'Entrar via E-mail'}
                </h1>
                <p className="text-gray-500 text-xs">
                  {loginMethod === 'password' ? 'Entre com suas credenciais para acessar' : 'Receba um link mágico na sua caixa de entrada'}
                </p>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-xl"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
                  >
                    <p className="text-red-400 text-xs text-center">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">E-mail</label>
                  <div className="relative border-animated" style={{ borderRadius: '0.875rem' }}>
                    <div
                      className="relative flex items-center rounded-[0.875rem] overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <Mail className="absolute left-4 h-4 w-4 text-gray-600 pointer-events-none" />
                      <Input
                        type="email" placeholder="exemplo@email.com" value={email}
                        onChange={e => setEmail(e.target.value)} required
                        className="pl-11 bg-transparent border-none text-white placeholder:text-gray-600 h-12 focus-visible:ring-0"
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <AnimatePresence>
                  {loginMethod === 'password' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Senha</label>
                        <button type="button" onClick={() => setIsForgotModalOpen(true)} className="text-[10px] text-brand-orange-coral hover:underline font-bold">
                          Esqueceu?
                        </button>
                      </div>
                      <div
                        className="flex items-center rounded-[0.875rem] overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,112,67,0.2)' }}
                      >
                        <Lock className="ml-4 h-4 w-4 text-gray-600 shrink-0" />
                        <Input
                          type={showPassword ? 'text' : 'password'} placeholder="••••••"
                          value={password} onChange={e => setPassword(e.target.value)}
                          className="bg-transparent border-none text-white placeholder:text-gray-600 h-12 focus-visible:ring-0 flex-1"
                          required={loginMethod === 'password'}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="mr-4 text-gray-600 hover:text-white transition-colors">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <Button
                  type="submit" disabled={isAuthenticating}
                  className="w-full h-14 rounded-2xl font-black text-base text-white border-none mt-2 btn-shimmer"
                  style={{
                    background: 'linear-gradient(135deg, #ff7043 0%, #ff4035 100%)',
                    boxShadow: '0 4px 24px rgba(255,112,67,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                  }}
                >
                  {isAuthenticating ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      {loginMethod === 'password' ? 'Acessar Painel' : 'Enviar Link de Acesso'}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>

              {/* Footer */}
              <p className="text-center text-[10px] text-gray-700 font-bold uppercase tracking-widest pt-1">
                🔒 Plataforma segura · Growth Experience 2026
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
    </div>
  );
}
