import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { User } from '@/types';
import { logger } from '@/lib/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  loginWithOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
  updateProfile: (data: Partial<User>) => Promise<void>;
  enable2FA: () => Promise<{ qrCode: string; secret: string }>;
  verify2FA: (token: string) => Promise<boolean>;
  disable2FA: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Constantes de segurança
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos de inatividade
const LAST_ACTIVITY_KEY = 'growth_summit_last_activity';
const LOGIN_ATTEMPTS_KEY = 'growth_summit_login_attempts';
const LOCKOUT_UNTIL_KEY = 'growth_summit_lockout_until';

// Rate Limiting para login
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  isRateLimited(email: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(email) || [];

    // Filtrar tentativas dos últimos 15 minutos
    const recentAttempts = attempts.filter(time => now - time < LOCKOUT_DURATION);

    if (recentAttempts.length >= MAX_LOGIN_ATTEMPTS) {
      const lockoutUntil = recentAttempts[0] + LOCKOUT_DURATION;
      localStorage.setItem(LOCKOUT_UNTIL_KEY, lockoutUntil.toString());
      return true;
    }

    return false;
  }

  recordAttempt(email: string): void {
    const now = Date.now();
    const attempts = this.attempts.get(email) || [];
    attempts.push(now);
    this.attempts.set(email, attempts);

    // Salvar no localStorage também
    const currentAttempts = parseInt(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '0');
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, (currentAttempts + 1).toString());
  }

  clearAttempts(email: string): void {
    this.attempts.delete(email);
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
    localStorage.removeItem(LOCKOUT_UNTIL_KEY);
  }

  getRemainingLockoutTime(): number {
    const lockoutUntil = localStorage.getItem(LOCKOUT_UNTIL_KEY);
    if (!lockoutUntil) return 0;

    const remaining = parseInt(lockoutUntil) - Date.now();
    return remaining > 0 ? remaining : 0;
  }
}

const rateLimiter = new RateLimiter();

// Mapeamento de roles para normalização
const ROLE_MAPPING: Record<string, string> = {
  'participante': 'participant',
  'admin': 'admin',
  'mentor': 'mentor',
  'company': 'company',
  'startup': 'startup',
  'sponsor': 'sponsor'
};

// Converter SupabaseUser para User
function mapSupabaseUserToUser(supabaseUser: SupabaseUser, metadata?: any): User {
  const rawRole = metadata?.role || supabaseUser.user_metadata?.role || 'participant';
  const role = ROLE_MAPPING[rawRole] || rawRole;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: metadata?.name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || '',
    role,
    avatar: metadata?.avatar || supabaseUser.user_metadata?.avatar || undefined,
    phone: metadata?.phone || supabaseUser.user_metadata?.phone || undefined,
    createdAt: supabaseUser.created_at,
    twoFactorEnabled: metadata?.two_factor_enabled || false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar sessão ao carregar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error) {
          logger.error('Erro ao obter sessão:', error);
          setIsLoading(false);
          return;
        }

        if (currentSession?.user) {
          try {
            // Buscar metadados silenciosamente
            const { data: userData } = await (supabase
              .from('users')
              .select('*')
              .eq('id', currentSession.user.id)
              .single() as any);

            setSession(currentSession);
            setUser(mapSupabaseUserToUser(currentSession.user, userData));
          } catch (e) {
            console.warn('Metadata fetch failed, using auth metadata');
            setSession(currentSession);
            setUser(mapSupabaseUserToUser(currentSession.user));
          }

          localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
          logAuditEvent('session_restored', currentSession.user.id);
        }
      } catch (error) {
        logger.error('Erro ao inicializar autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      logger.info('Auth state changed:', { event });

      if (currentSession?.user) {
        try {
          const { data: userData } = await (supabase
            .from('users')
            .select('*')
            .eq('id', currentSession.user.id)
            .single() as any);

          setSession(currentSession);
          setUser(mapSupabaseUserToUser(currentSession.user, userData));
        } catch (e) {
          setSession(currentSession);
          setUser(mapSupabaseUserToUser(currentSession.user));
        }

        logAuditEvent(event, currentSession.user.id);
      } else {
        setSession(null);
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Monitorar atividade do usuário
  useEffect(() => {
    if (!user) return;

    const updateActivity = () => {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    };

    // Eventos que indicam atividade
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    // Verificar timeout periodicamente
    const intervalId = setInterval(async () => {
      const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
      if (lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
        if (timeSinceLastActivity > SESSION_TIMEOUT) {
          await logout();
          alert('Sua sessão expirou por inatividade.');
        }
      }
    }, 60000); // Verificar a cada minuto

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(intervalId);
    };
  }, [user]);

  // Login com email e senha
  const login = useCallback(async (email: string, password: string): Promise<User | null> => {
    setIsLoading(true);

    try {
      // Verificar rate limiting
      if (rateLimiter.isRateLimited(email)) {
        const remainingTime = Math.ceil(rateLimiter.getRemainingLockoutTime() / 60000);
        throw new Error(`Limite atingido. Tente em ${remainingTime} min.`);
      }

      // Tentar login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        rateLimiter.recordAttempt(email);

        // Log de auditoria - tentativa falha
        logAuditEvent('login_failed', undefined, { email, error: error.message });

        throw error;
      }

      if (data.user) {
        // Limpar tentativas de login
        rateLimiter.clearAttempts(email);

        let userData = null;
        try {
          const { data: ud } = await (supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single() as any);
          userData = ud;
        } catch (e) {
          console.warn('No DB metadata for user');
        }

        // Verificar se 2FA está habilitado
        if ((userData as any)?.two_factor_enabled) {
          // Redirecionar para verificação 2FA
          setSession(data.session);
          const u = { ...mapSupabaseUserToUser(data.user, userData), requires2FA: true };
          setUser(u);
          return u;
        }

        const userObj = mapSupabaseUserToUser(data.user, userData);
        setSession(data.session);
        setUser(userObj);
        localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());

        // Log de auditoria - sucesso
        logAuditEvent('login_success', data.user.id);
        return userObj;
      }
      return null;
    } catch (error: any) {
      logger.error('Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login com OTP (Magic Link)
  const loginWithOTP = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      logAuditEvent('otp_sent', undefined, { email });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verificar OTP
  const verifyOTP = useCallback(async (email: string, token: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
      if (error) throw error;
      if (data.user) {
        const { data: userData } = await (supabase.from('users').select('*').eq('id', data.user.id).single() as any);
        setSession(data.session);
        setUser(mapSupabaseUserToUser(data.user, userData));
        logAuditEvent('otp_verified', data.user.id);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      if (user) logAuditEvent('logout', user.id);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      localStorage.removeItem(LAST_ACTIVITY_KEY);
    } catch (error: any) {
      logger.error('Logout error:', error);
      throw error;
    }
  }, [user]);

  // Verificar role
  const hasRole = useCallback((roles: string[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  // Atualizar perfil
  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!user) throw new Error('Auth required');
    const { error } = await (supabase.from('users') as any).update(data).eq('id', user.id);
    if (error) throw error;
    setUser({ ...user, ...data });
    logAuditEvent('profile_updated', user.id, { fields: Object.keys(data) });
  }, [user]);

  // Habilitar 2FA
  const enable2FA = useCallback(async (): Promise<{ qrCode: string; secret: string }> => {
    if (!user) throw new Error('Auth required');
    const { data, error } = await (supabase.rpc('generate_2fa_secret', { user_id: user.id } as any) as any);
    if (error) throw error;
    logAuditEvent('2fa_enabled', user.id);
    return data;
  }, [user]);

  // Verificar código 2FA
  const verify2FA = useCallback(async (token: string): Promise<boolean> => {
    if (!user) throw new Error('Auth required');
    const { data, error } = await (supabase.rpc('verify_2fa_token', { user_id: user.id, token } as any) as any);
    if (error) throw error;
    if (data) {
      setUser({ ...user, requires2FA: false });
      logAuditEvent('2fa_verified', user.id);
    }
    return data;
  }, [user]);

  // Desabilitar 2FA
  const disable2FA = useCallback(async () => {
    if (!user) throw new Error('Auth required');
    const { error } = await (supabase.from('users') as any).update({ two_factor_enabled: false }).eq('id', user.id);
    if (error) throw error;
    setUser({ ...user, twoFactorEnabled: false });
    logAuditEvent('2fa_disabled', user.id);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated: !!user && !user.requires2FA,
      isLoading,
      login,
      loginWithOTP,
      verifyOTP,
      logout,
      hasRole,
      updateProfile,
      enable2FA,
      verify2FA,
      disable2FA,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

// ---------------------------------------------------------
// HELPERS (NÃO BLOQUEANTES)
// ---------------------------------------------------------

function logAuditEvent(event: string, userId?: string, metadata?: any) {
  // Fire and forget
  getClientIP().then(ip => {
    (supabase.from('audit_logs') as any).insert({
      event,
      user_id: userId,
      metadata,
      ip_address: ip,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    }).then(({ error }: any) => {
      if (error) logger.error('Audit log error:', error);
    });
  }).catch(() => { });
}

async function getClientIP(): Promise<string> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 2000); // 2 segundos timeout

  try {
    const response = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
    clearTimeout(id);
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}
