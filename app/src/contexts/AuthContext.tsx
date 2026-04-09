import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { User } from '@/types';
import { logger } from '@/lib/logger';
import { logAuditEvent, getClientIP } from '@/lib/auth-audit';
import { withTimeout } from '@/lib/promiseUtils';
import { toast } from 'sonner';

import { safeStorage } from '@/utils/safeStorage';

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
const LAST_ACTIVITY_KEY = 'growth_experience_last_activity';
const LOGIN_ATTEMPTS_KEY = 'growth_experience_login_attempts';
const LOCKOUT_UNTIL_KEY = 'growth_experience_lockout_until';

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
      safeStorage.setItem(LOCKOUT_UNTIL_KEY, lockoutUntil.toString());
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
    const currentAttempts = parseInt(safeStorage.getItem(LOGIN_ATTEMPTS_KEY) || '0');
    safeStorage.setItem(LOGIN_ATTEMPTS_KEY, (currentAttempts + 1).toString());
  }

  clearAttempts(email: string): void {
    this.attempts.delete(email);
    safeStorage.removeItem(LOGIN_ATTEMPTS_KEY);
    safeStorage.removeItem(LOCKOUT_UNTIL_KEY);
  }

  getRemainingLockoutTime(): number {
    const lockoutUntil = safeStorage.getItem(LOCKOUT_UNTIL_KEY);
    if (!lockoutUntil) return 0;

    const remaining = parseInt(lockoutUntil) - Date.now();
    return remaining > 0 ? remaining : 0;
  }
}

const rateLimiter = new RateLimiter();

import { ROLE_MAPPING } from '@/lib/constants';

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

// mapSupabaseUserToUser converts Supabase Auth user to internal User type
function mapSupabaseUserToUser(supabaseUser: SupabaseUser, metadata?: UserDBMetadata): User {
  // Use metadata role (from DB) first, fallback specifically to JWT user_metadata role, finally default to 'participant'
  let rawRole = (metadata?.role || supabaseUser.user_metadata?.role || '').toLowerCase().trim();

  // Normalize role names
  if (!rawRole) rawRole = 'participant';
  if (rawRole === 'superadmin') rawRole = 'admin';
  if (rawRole === 'empresa') rawRole = 'company';

  const role = ROLE_MAPPING[rawRole] || rawRole;
  const email = (supabaseUser.email || metadata?.email || supabaseUser.user_metadata?.email || '').toLowerCase().trim();

  return {
    id: supabaseUser.id,
    email: email,
    name: metadata?.name || supabaseUser.user_metadata?.name || email.split('@')[0] || 'Usuário',
    role,
    avatar: metadata?.avatar_url || supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.avatar || undefined,
    phone: metadata?.phone || supabaseUser.user_metadata?.phone || undefined,
    department: metadata?.department || undefined,
    staffRole: metadata?.staff_role || undefined,
    permissions: metadata?.permissions || (role === 'admin' ? ['*'] : []),
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
  const isInitializingRef = useRef(false);
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

      // CRITICO: Garantir que o loader seja liberado se encontrarmos a mesma sessão
      setIsLoading(false);
      return;
    }

    // 3. Iniciar sincronização
    isSyncingRef.current = true;
    lastSyncedSessionIdRef.current = currentSession.user.id;
    lastSyncTimeRef.current = now;

    // Definimos o usuário IMEDIATAMENTE usando os metadados do JWT (Supabase Auth)
    const optimisticUser = mapSupabaseUserToUser(currentSession.user);
    const hasCoreData = !!(optimisticUser.name && optimisticUser.role);

    setSession(currentSession);

    // CRITICO: Sempre atualizar com dados otimistas para garantir que roles prioritários
    // (como o override de admin por email) sejam aplicados sem esperar o banco.
    setUser(optimisticUser);

    if (hasCoreData) {
      setIsLoading(false);
      logger.debug('✅ UI liberada com dados otimistas (JWT)');
      
      // Se já temos nome e role, só buscamos do banco se for admin ou se quisermos garantir refresh
      // Para usuários normais, o JWT é suficiente e evita timeouts de RLS
      if (optimisticUser.role !== 'admin') {
        isSyncingRef.current = false;
        return;
      }
    }

    // 4. Buscar metadados enriquecidos no banco em background
    try {
      const { data: userData, error: fetchError } = await withTimeout(
        async (signal) => {
          const { data, error } = await supabase
            .from('users')
            .select('id,name,email,role,avatar_url,phone')
            .eq('id', currentSession.user.id)
            .maybeSingle()
            .abortSignal(signal);
          return { data, error };
        },
        5000,
        'AuthMetadataFetch'
      );

      if (fetchError) {
        logger.warn(`DB metadata fetch failed (User: ${currentSession.user.id}):`, { error: fetchError });
      }

      const finalUser = mapSupabaseUserToUser(currentSession.user, (userData as UserDBMetadata) || undefined);

      // Atualizar o estado com os dados finais do banco
      if (isMountedRef.current) {
        setUser(finalUser);
        safeStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
      }

    } catch (err: any) {
      // Se der timeout (RLS recursion), avisamos mas NÃO quebramos o site
      if (err?.message?.includes('TIMEOUT_EXCEEDED')) {
        logger.error(`❌ ⚠️ TIMEOUT RLS DETECTADO: Usando dados do JWT como fallback. O banco de dados está travando ao ler a tabela 'users'.`);
      } else {
        logger.warn('Erro silencioso na sincronização de metadados:', { error: err });
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

        // Log de Erro na tabela Auditoria (Nunca deve travar o fluxo principal)
        try {
           logAuditEvent('login_failed', undefined, { email, error: error.message });
        } catch (e) {
           logger.debug('Audit log failed silently:', e);
        }

        // Log na tabela de Tentativas de Login (silencioso)
        try {
          supabase.from('login_attempts').insert({
            email,
            ip_address: ip,
            success: false,
            attempted_at: new Date().toISOString()
          }).then(({ error: err }) => { 
            if (err) logger.debug('Silent login fail log (RLS):', { error: err.message }); 
          });
        } catch (e) {
          logger.warn('Erro ao registrar log de falha:', { error: e });
        }

        throw error;
      }

      if (data.user && data.session) {
        rateLimiter.clearAttempts(email);

        // Registrar Sucesso (silencioso)
        try {
          supabase.from('login_attempts').insert({
            user_id: data.user.id,
            email,
            ip_address: ip,
            success: true,
            attempted_at: new Date().toISOString()
          }).then(({ error: err }) => { 
            if (err) logger.debug('Silent login success log (RLS):', { error: err.message }); 
          });
        } catch (e) {
          logger.warn('Erro ao registrar log de sucesso:', { error: e });
        }

        // O listener onAuthStateChange será disparado, mas vamos atualizar manualmente aqui
        // para garantir que o retorno da função tenha o usuário atualizado
        let userData: UserDBMetadata | null = null;
        try {
          const { data: ud } = await withTimeout(
            async (signal) => {
              const { data: result } = await supabase.from('users').select('id,name,email,role,avatar_url,phone').eq('id', data.user.id).maybeSingle().abortSignal(signal);
              return { data: result };
            },
            3000
          );
          userData = ud as UserDBMetadata;
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
        options: { emailRedirectTo: 'https://www.gxexperience.site/auth/callback' },
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
        const { data: userData } = await supabase.from('users').select('id,name,email,role,avatar_url,phone,two_factor_enabled').eq('id', data.user.id).single();
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
      safeStorage.removeItem(LAST_ACTIVITY_KEY);
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
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) throw new Error('Auth required');

    // 1. Atualizar metadados no Supabase Auth (JWT)
    const authMetadata: any = {};
    if (updates.name !== undefined) authMetadata.name = updates.name;
    if (updates.avatar !== undefined) authMetadata.avatar_url = updates.avatar;
    if (updates.phone !== undefined) authMetadata.phone = updates.phone;

    const { error: authError } = await supabase.auth.updateUser({
      data: authMetadata
    });

    if (authError) throw authError;

    // 2. Atualizar tabela 'users' no banco de dados
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.avatar) dbUpdates.avatar_url = updates.avatar;
    if (updates.phone) dbUpdates.phone = updates.phone;
    if (updates.department) dbUpdates.department = updates.department;

    if (Object.keys(dbUpdates).length > 0) {
      const { error: dbError } = await supabase.from('users')
        .update(dbUpdates)
        .eq('id', user.id);

      if (dbError) {
        logger.warn('Erro ao atualizar tabela users (ignorado pois Auth funcionou):', { error: dbError.message });
      }

      // 2.1 Se for mentor, sincronizar com growth_experience_mentors
      if (user.role === 'mentor') {
        const mentorUpdates: Record<string, any> = {};
        if (updates.name) mentorUpdates.name = updates.name;
        if (updates.avatar) mentorUpdates.photo_url = updates.avatar;

        if (Object.keys(mentorUpdates).length > 0) {
          await supabase
            .from('growth_experience_mentors')
            .update(mentorUpdates)
            .eq('user_id', user.id);
        }
      }
    }

    // 3. Atualizar estado local
    setUser({ ...user, ...updates });
    logAuditEvent('profile_updated', user.id, { fields: Object.keys(updates) });
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
      // Evitar execução dupla em StrictMode ou múltiplas chamadas rápidas
      if (isInitializingRef.current) return;
      isInitializingRef.current = true;

      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error) {
          // AbortError is triggered by React StrictMode double-mount or HMR — not a real error
          if (error.name === 'AbortError' || error.message?.includes('aborted')) {
            logger.debug('[Auth] getSession aborted (StrictMode/HMR) — ignorando');
            if (isMountedRef.current) setIsLoading(false);
            return;
          }

          // Se for erro de refresh token, é apenas uma sessão expirada/inválida. 
          // Não é um erro "fatal", apenas significa que o usuário deve logar novamente.
          const isRefreshTokenError = error.message?.toLowerCase().includes('refresh_token') || 
                                    error.message?.toLowerCase().includes('refresh token');
          
          if (isRefreshTokenError) {
            logger.info('Sessão anterior expirada. Usuário desconectado.');
          } else {
            logger.error('Erro inicial getSession:', error.message);
          }

          if (isMountedRef.current) setIsLoading(false);
          return;
        }

        if (currentSession && isMountedRef.current) {
          logger.debug('[Auth] Session found, updating state...');
          await updateAuthState(currentSession);
        } else {
          logger.debug('[Auth] No session found, setting isLoading to false');
          if (isMountedRef.current) setIsLoading(false);
        }
      } catch (error: any) {
        // AbortError can also surface as a thrown exception
        if (error?.name === 'AbortError' || error?.message?.includes('aborted without reason')) {
          logger.debug('[Auth] Init aborted (React lifecycle) — ignorando AbortError');
        } else {
          logger.error('Fatal auth init error:', error);
          if (isMountedRef.current) setIsLoading(false);
        }
      } finally {
        if (isMountedRef.current) {
          // Garante que o loading seja liberado mesmo se der erro ou fechar prematuro
          setIsLoading(false);
          isInitializingRef.current = false;
        }
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
        if (event === 'SIGNED_OUT' && !currentSession) {
          // Limpar imediatamente para evitar loop de redirecionamento
          isSyncingRef.current = false;
          lastSyncedSessionIdRef.current = null;
          setSession(null);
          setUser(null);
          setIsLoading(false);
          logAuditEvent('logout_forced', userId); // só loga signout inesperado
        } else if (event === 'TOKEN_REFRESH_FAILED' as any) {
          logger.warn('Sessão expirada ou falha na renovação de token em background.');
          // Não redirecionar forçadamente para não quebrar a SPA em quedas de rede oscilantes
          // Mas mostrar um aviso de que a sessão pode estar instável
          toast.error('Instabilidade na sessão. Seu acesso pode expirar em breve.', { 
            description: 'Se notar problemas ao salvar dados, salve seu trabalho e tente fazer login novamente.',
            duration: 10000
          });
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
        safeStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
      }
    };

    // Track only meaningful interaction events (not scroll — too noisy)
    const events = ['mousedown', 'keydown', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Verificar timeout periodicamente
    const intervalId = setInterval(async () => {
      const lastActivity = safeStorage.getItem(LAST_ACTIVITY_KEY);
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

  const value = useMemo(() => ({
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
  }), [user, session, isLoading, isAuthenticating, login, loginWithOTP, verifyOTP, logout, hasRole, updateProfile, enable2FA, verify2FA, disable2FA]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
