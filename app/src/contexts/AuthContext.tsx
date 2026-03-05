import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { User } from '@/types';
import { logger } from '@/lib/logger';
import { logAuditEvent, getClientIP } from '@/lib/auth-audit';
import { withTimeout } from '@/lib/promiseUtils';
import { toast } from 'sonner';

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
const SESSION_TIMEOUT = 30 * 24 * 60 * 60 * 1000; // 30 dias de inatividade
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
  avatar_url?: string;  // nome real da coluna no banco
  phone?: string;
  department?: string;
  staff_role?: string;
  permissions?: string[];
  two_factor_enabled?: boolean;
}

// Converter SupabaseUser para User
function mapSupabaseUserToUser(supabaseUser: SupabaseUser, metadata?: UserDBMetadata): User {
  // 1. Tentar pegar role (Prioridade: Metadata do DB > Metadata do JWT > default)
  let rawRole = (metadata?.role || supabaseUser.user_metadata?.role || '').toLowerCase().trim();

  // Se não houver role no metadata nem no JWT, verificamos se é um email admin conhecido 
  // ou se o metadata do DB existe mas a role está vazia
  if (!rawRole && supabaseUser.email?.endsWith('@growthsummit.site')) {
    rawRole = 'admin';
  }

  // Fallback final
  if (!rawRole) rawRole = 'participant';

  const role = ROLE_MAPPING[rawRole] || rawRole;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: metadata?.name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || '',
    role,
    avatar: metadata?.avatar_url || supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.avatar || undefined,
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
    const isRecent = now - lastSyncTimeRef.current < 4000; // 4s throttle

    // 2. Prevenir sincronizações redundantes (mesmo usuário dentro de 4s)
    if (isSyncingRef.current || (isSameUser && isRecent)) {
      if (isSameUser && isRecent) {
        logger.debug('Ignorando atualização auth redundante', { userId: currentSession.user.id });
      } else if (isSyncingRef.current) {
        logger.debug('Sincronização já em curso — aguardando...', { userId: currentSession.user.id });
      }

      // CRITICO: Garantir que o loader seja liberado se já temos o usuário
      if (user && user.id === currentSession.user.id && isLoading) {
        setIsLoading(false);
      }
      return;
    }

    // 3. Iniciar sincronização
    isSyncingRef.current = true;
    lastSyncedSessionIdRef.current = currentSession.user.id;
    lastSyncTimeRef.current = now;

    // --- ABORDAGEM OTIMISTA ---
    // Definimos o usuário IMEDIATAMENTE usando os metadados do JWT (Supabase Auth)
    // Se já tivermos um usuário no estado com os mesmos IDs, EVITAMOS o downgrade 
    // para dados otimistas (evita piscar o nome/avatar que já foram carregados do DB).
    const optimisticUser = mapSupabaseUserToUser(currentSession.user);
    const hasCoreData = !!(optimisticUser.name && optimisticUser.role);

    setSession(currentSession);

    // Só definimos usuário otimista se não tivermos nenhum ou se for um usuário diferente
    if (!user || user.id !== currentSession.user.id) {
      setUser(optimisticUser);
    }

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
      const { data: userData, error: fetchError } = (await withTimeout(
        supabase
          .from('users')
          .select('id,name,email,role,avatar_url,phone')
          .eq('id', currentSession.user.id)
          .maybeSingle() as any,
        5000,
        'AuthMetadataFetch'
      )) as { data: UserDBMetadata | null; error: any };

      if (fetchError) {
        logger.warn(`DB metadata fetch failed (User: ${currentSession.user.id}):`, fetchError.message);
      }

      const finalUser = mapSupabaseUserToUser(currentSession.user, (userData as UserDBMetadata) || undefined);

      // Atualizar o estado com os dados finais do banco
      if (isMountedRef.current) {
        setUser(finalUser);
        localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
      }

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
      const cleanEmail = email.trim().toLowerCase();

      if (rateLimiter.isRateLimited(cleanEmail)) {
        const remainingTime = Math.ceil(rateLimiter.getRemainingLockoutTime() / 60000);
        throw new Error(`Muitas tentativas. Tente novamente em ${remainingTime} min.`);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      // Registrar tentativa (Sucesso ou Falha)
      const ip = await getClientIP().catch(() => 'unknown');

      if (error) {
        rateLimiter.recordAttempt(email);

        // Log de Erro na tabela Auditoria
        logAuditEvent('login_failed', undefined, { email, error: error.message } as any);

        // Log na tabela de Tentativas de Login
        (supabase.from('login_attempts') as any).insert({
          email,
          ip_address: ip,
          success: false,
          attempted_at: new Date().toISOString()
        }).then(({ error: err }: any) => { if (err) logger.debug('Silent login fail log (RLS):', err.message); });

        throw error;
      }

      if (data.user && data.session) {
        rateLimiter.clearAttempts(email);

        // Registrar Sucesso
        (supabase.from('login_attempts') as any).insert({
          user_id: data.user.id,
          email,
          ip_address: ip,
          success: true,
          attempted_at: new Date().toISOString()
        }).then(({ error: err }: any) => { if (err) logger.debug('Silent login success log (RLS):', err.message); });

        // O listener onAuthStateChange será disparado, mas vamos atualizar manualmente aqui
        // para garantir que o retorno da função tenha o usuário atualizado
        let userData: UserDBMetadata | null = null;
        try {
          const { data: ud } = (await withTimeout(
            supabase.from('users').select('id,name,email,role,avatar_url,phone').eq('id', data.user.id).maybeSingle() as any,
            3000
          )) as { data: UserDBMetadata | null };
          userData = ud;
        } catch (e) {
          logger.warn('DB metadata fetch failed during login:', { error: String(e) });
        }

        const userObj = mapSupabaseUserToUser(data.user, userData || undefined);

        if (userData?.two_factor_enabled) {
          userObj.requires2FA = true;
        }

        // Marcar sincronização manual para que o onAuthStateChange subsequente 
        // respeite este estado estável e não tente re-sincronizar imediatamente.
        lastSyncedSessionIdRef.current = data.user.id;
        lastSyncTimeRef.current = Date.now();

        setSession(data.session);
        setUser(userObj);
        setIsLoading(false); // Liberar UI imediatamente após o login bem sucedido

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
        setUser(mapSupabaseUserToUser(data.user, (userData as unknown) as UserDBMetadata | undefined));
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
    const { error } = await (supabase.from('users') as any).update(data).eq('id', user.id);
    if (error) throw error;
    setUser({ ...user, ...data });
    logAuditEvent('profile_updated', user.id, { fields: Object.keys(data) });
  }, [user]);

  // Habilitar 2FA
  const enable2FA = useCallback(async (): Promise<{ qrCode: string; secret: string }> => {
    if (!user) throw new Error('Auth required');
    const { data, error } = await (supabase.rpc as any)('generate_2fa_secret', { user_id: user.id });
    if (error) throw error;
    logAuditEvent('2fa_enabled', user.id);
    return data as { qrCode: string; secret: string };
  }, [user]);

  // Verificar código 2FA
  const verify2FA = useCallback(async (token: string): Promise<boolean> => {
    if (!user) throw new Error('Auth required');
    const { data, error } = await (supabase.rpc as any)('verify_2fa_token', { user_id: user.id, token });
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
    const { error } = await (supabase.from('users') as any).update({ two_factor_enabled: false }).eq('id', user.id);
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
        }
      } catch (error) {
        logger.error('Fatal auth init error:', error);
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    };

    initializeAuth();

    // Listener para mudanças de autenticação
    let lastHandledEvent: { type: string, time: number, userId?: string } | null = null;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      const now = Date.now();
      const userId = currentSession?.user?.id;

      // Deduplicação estrita de eventos idênticos em curto intervalo (1s)
      if (lastHandledEvent &&
        lastHandledEvent.type === event &&
        lastHandledEvent.userId === userId &&
        now - lastHandledEvent.time < 1000) {
        return;
      }

      lastHandledEvent = { type: event, time: now, userId };
      logger.info(`🔔 Auth State Change: ${event}`, { userId });

      if (isMountedRef.current) {
        if (event === 'SIGNED_OUT') {
          // Limpar imediatamente para evitar loop de redirecionamento
          isSyncingRef.current = false;
          lastSyncedSessionIdRef.current = null;
          setSession(null);
          setUser(null);
          setIsLoading(false);
          logAuditEvent('logout_forced', userId); // só loga signout inesperado
        } else if (event === 'TOKEN_REFRESHED') {
          if (currentSession) setSession(currentSession);
        } else if (currentSession) {
          updateAuthState(currentSession);
          // Não logar SIGNED_IN automático — já capturado no login() manual
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
          toast.info('Sua sessão expirou por inatividade. Faça login novamente.');
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


