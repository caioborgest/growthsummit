import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { User } from '@/types';
import { logger } from '@/lib/logger';
import { logAuditEvent, getClientIP } from '@/lib/auth-audit';
import { withTimeout } from '@/lib/promiseUtils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthenticating: boolean;
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

const ROLE_MAPPING: Record<string, string> = {
  'participante': 'participant',
  'admin': 'admin',
  'superadmin': 'admin',
  'super-admin': 'admin',
  'mentor': 'mentor',
  'company': 'company',
  'empresa': 'company',
  'startup': 'startup',
  'sponsor': 'sponsor'
};

interface UserDBMetadata {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
  phone?: string;
  staff_role?: string;
  permissions?: string[];
  two_factor_enabled?: boolean;
}

// Converter SupabaseUser para User
function mapSupabaseUserToUser(supabaseUser: SupabaseUser, metadata?: UserDBMetadata): User {
  const rawRole = (metadata?.role || supabaseUser.user_metadata?.role || 'participant').toLowerCase();
  const role = ROLE_MAPPING[rawRole] || rawRole;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: metadata?.name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || '',
    role,
    avatar: metadata?.avatar || supabaseUser.user_metadata?.avatar || undefined,
    phone: metadata?.phone || supabaseUser.user_metadata?.phone || undefined,
    department: metadata?.department || undefined,
    staffRole: metadata?.staff_role || undefined,
    permissions: metadata?.permissions || [],
    createdAt: supabaseUser.created_at,
    twoFactorEnabled: metadata?.two_factor_enabled || false,
  };
}

// withTimeout movido para @/lib/promiseUtils

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const isSyncingRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastSyncedSessionIdRef = useRef<string | null>(null);
  const lastSyncTimeRef = useRef<number>(0);

  // Função centralizada para atualizar sessão e usuário
  const updateAuthState = useCallback(async (currentSession: Session | null) => {
    // 1. Limpar estado se não houver sessão
    if (!currentSession?.user) {
      if (lastSyncedSessionIdRef.current !== null) {
        logger.debug('Limpando estado de autenticação (sem sessão)');
        setSession(null);
        setUser(null);
        setIsLoading(false);
        isSyncingRef.current = false;
        lastSyncedSessionIdRef.current = null;
      } else {
        setIsLoading(false);
      }
      return;
    }

    const now = Date.now();
    const isSameUser = lastSyncedSessionIdRef.current === currentSession.user.id;
    const isRecent = now - lastSyncTimeRef.current < 5000; // 5s throttle

    // 2. Prevenir sincronizações redundantes (mesmo usuário dentro de 5s)
    if (isSyncingRef.current || (isSameUser && isRecent)) {
      if (isSameUser && isRecent) {
        logger.debug('Ignorando atualização auth redundante (< 5s)');
      }
      return;
    }

    // 3. Iniciar sincronização
    isSyncingRef.current = true;
    lastSyncedSessionIdRef.current = currentSession.user.id;
    lastSyncTimeRef.current = now;

    // --- ABORDAGEM OTIMISTA ---
    // Definimos o usuário IMEDIATAMENTE usando os metadados do JWT (Supabase Auth)
    // Isso garante que a UI (Dashboard) carregue instantaneamente sem depender do banco.
    const optimisticUser = mapSupabaseUserToUser(currentSession.user);

    // Se o usuário já tiver nome e role no JWT, já podemos liberar a UI
    const hasCoreData = !!(optimisticUser.name && optimisticUser.role);

    setSession(currentSession);
    setUser(optimisticUser);

    if (hasCoreData) {
      setIsLoading(false);
      logger.debug('✅ UI liberada com dados otimistas (JWT)');
    } else {
      // Se não tivermos o essencial no JWT, ainda mostramos o loader até o DB responder.
      // Usamos isLoading para evitar piscar se já estiver falso.
      setIsLoading(prev => prev || true);
    }

    // 4. Buscar metadados enriquecidos no banco em background
    try {
      const { data: userData, error: fetchError } = await withTimeout(
        supabase
          .from('users')
          .select('id,name,email,role,avatar,phone')
          .eq('id', currentSession.user.id)
          .maybeSingle(),
        5000,
        'AuthMetadataFetch'
      );

      if (fetchError) {
        logger.warn(`DB metadata fetch failed (User: ${currentSession.user.id}):`, fetchError.message);
      }

      const finalUser = mapSupabaseUserToUser(currentSession.user, (userData as UserDBMetadata) || undefined);

      // Atualizar o estado com os dados finais do banco
      setUser(finalUser);
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());

    } catch (err: any) {
      // Se der timeout (RLS recursion), avisamos mas NÃO quebramos o site
      if (err?.message?.includes('TIMEOUT_EXCEEDED')) {
        logger.error(`❌ ⚠️ TIMEOUT RLS DETECTADO: Usando dados do JWT como fallback. O banco de dados está travando ao ler a tabela 'users'.`);
      } else {
        logger.warn('Erro silencioso na sincronização de metadados:', err);
      }
    } finally {
      setIsLoading(false);
      isSyncingRef.current = false;
    }
  }, []);

  // Login com email e senha
  const login = useCallback(async (email: string, password: string): Promise<User | null> => {
    if (isAuthenticating) return null;
    setIsAuthenticating(true);

    try {
      if (rateLimiter.isRateLimited(email)) {
        const remainingTime = Math.ceil(rateLimiter.getRemainingLockoutTime() / 60000);
        throw new Error(`Muitas tentativas. Tente novamente em ${remainingTime} min.`);
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      // Registrar tentativa (Sucesso ou Falha)
      const ip = await getClientIP().catch(() => 'unknown');

      if (error) {
        rateLimiter.recordAttempt(email);

        // Log de Erro na tabela Auditoria
        logAuditEvent('login_failed', undefined, { email, error: error.message } as any);

        // Log na tabela de Tentativas de Login
        supabase.from('login_attempts').insert({
          email,
          ip_address: ip,
          success: false,
          attempted_at: new Date().toISOString()
        }).then(({ error: err }) => { if (err) logger.debug('Silent login fail log (RLS):', err.message); });

        throw error;
      }

      if (data.user && data.session) {
        rateLimiter.clearAttempts(email);

        // Registrar Sucesso
        supabase.from('login_attempts').insert({
          user_id: data.user.id,
          email,
          ip_address: ip,
          success: true,
          attempted_at: new Date().toISOString()
        }).then(({ error: err }) => { if (err) logger.debug('Silent login success log (RLS):', err.message); });

        // O listener onAuthStateChange será disparado, mas vamos atualizar manualmente aqui
        // para garantir que o retorno da função tenha o usuário atualizado
        let userData: UserDBMetadata | null = null;
        try {
          const { data: ud } = await withTimeout(
            supabase.from('users').select('id,name,email,role,avatar,phone').eq('id', data.user.id).maybeSingle(),
            3000
          );
          userData = ud as UserDBMetadata;
        } catch (e) {
          logger.warn('DB metadata fetch failed during login:', e);
        }

        const userObj = mapSupabaseUserToUser(data.user, userData || undefined);

        if (userData?.two_factor_enabled) {
          userObj.requires2FA = true;
        }

        // Não chamamos mais setSession/setUser manualmente aqui
        // O listener onAuthStateChange (linha 366+) já detectará o evento SIGNED_IN
        // e chamará updateAuthState(data.session) automaticamente de forma robusta.

        logAuditEvent('login_success', data.user.id);
        return userObj;
      }
      return null;
    } catch (error: any) {
      if (error.message === 'Invalid login credentials') {
        logger.error('Login inválido: Verifique se o e-mail ou a senha estão corretos.');
      } else {
        logger.error('Erro no login:', error.message || error);
      }
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAuthenticating]);

  // Login com OTP (Magic Link)
  const loginWithOTP = useCallback(async (email: string) => {
    setIsAuthenticating(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      logAuditEvent('otp_sent', undefined, { email });
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  // Verificar OTP
  const verifyOTP = useCallback(async (email: string, token: string) => {
    setIsAuthenticating(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
      if (error) throw error;
      if (data.user) {
        const { data: userData } = await supabase.from('users').select('*').eq('id', data.user.id).single();
        setSession(data.session);
        setUser(mapSupabaseUserToUser(data.user, userData as UserDBMetadata));
        logAuditEvent('otp_verified', data.user.id);
      }
    } finally {
      setIsAuthenticating(false);
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
    } catch (error: unknown) {
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
    const { error } = await supabase.from('users').update(data).eq('id', user.id);
    if (error) throw error;
    setUser({ ...user, ...data });
    logAuditEvent('profile_updated', user.id, { fields: Object.keys(data) });
  }, [user]);

  // Habilitar 2FA
  const enable2FA = useCallback(async (): Promise<{ qrCode: string; secret: string }> => {
    if (!user) throw new Error('Auth required');
    const { data, error } = await supabase.rpc('generate_2fa_secret', { user_id: user.id });
    if (error) throw error;
    logAuditEvent('2fa_enabled', user.id);
    return data as { qrCode: string; secret: string };
  }, [user]);

  // Verificar código 2FA
  const verify2FA = useCallback(async (token: string): Promise<boolean> => {
    if (!user) throw new Error('Auth required');
    const { data, error } = await supabase.rpc('verify_2fa_token', { user_id: user.id, token });
    if (error) throw error;
    if (data) {
      setUser({ ...user, requires2FA: false });
      logAuditEvent('2fa_verified', user.id);
    }
    return !!data;
  }, [user]);

  // Desabilitar 2FA
  const disable2FA = useCallback(async () => {
    if (!user) throw new Error('Auth required');
    const { error } = await supabase.from('users').update({ two_factor_enabled: false }).eq('id', user.id);
    if (error) throw error;
    setUser({ ...user, twoFactorEnabled: false });
    logAuditEvent('2fa_disabled', user.id);
  }, [user]);

  // Efeito de inicialização e monitoramento de Auth
  useEffect(() => {

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error) {
          logger.error('Erro inicial getSession:', error.message);
          if (isMountedRef.current) setIsLoading(false);
          return;
        }

        if (currentSession && isMountedRef.current) {
          await updateAuthState(currentSession);
          logAuditEvent('session_restored', currentSession.user.id);
        }
      } catch (error) {
        logger.error('Fatal auth init error:', error);
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    };

    initializeAuth();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      logger.info(`🔔 Auth State Change: ${event}`, { userId: currentSession?.user?.id });

      if (isMountedRef.current) {
        if (event === 'SIGNED_OUT') {
          // Limpar imediatamente para evitar loop de redirecionamento
          isSyncingRef.current = false;
          setSession(null);
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED') {
          // Token refresh é apenas uma rotação do JWT — não precisa re-sincronizar o perfil
          // Basta atualizar a sessão na memória
          if (currentSession) setSession(currentSession);
          logger.debug('TOKEN_REFRESHED: apenas sessão atualizada, sem re-sync do perfil');
        } else if (currentSession) {
          // SIGNED_IN, INITIAL_SESSION, USER_UPDATED etc.
          updateAuthState(currentSession);
          logAuditEvent(event, currentSession.user.id);
        }
      }
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [updateAuthState]);

  // Monitorar atividade do usuário
  useEffect(() => {
    if (!user) return;

    // Throttled activity update: max 1 write per 2 seconds
    let lastActivityWrite = 0;
    const updateActivity = () => {
      const now = Date.now();
      if (now - lastActivityWrite > 2000) {
        lastActivityWrite = now;
        localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
      }
    };

    // Track only meaningful interaction events (not scroll — too noisy)
    const events = ['mousedown', 'keydown', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
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
  }, [user, logout]);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated: !!user && !user.requires2FA,
      isLoading,
      isAuthenticating,
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


