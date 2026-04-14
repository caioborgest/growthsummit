/**
 * auth-helpers.ts
 * ─────────────────────────────────────────────────────────────
 * Camada centralizada para autenticação de usuários.
 *
 * ANTES: A lógica de "criar ou logar usuário" estava duplicada em:
 *   - Step3Confirmacao.tsx
 *   - InscricaoModal.tsx
 *   - MentorFormModal.tsx
 *
 * DEPOIS: Uma única implementação canônica aqui.
 * Se a lógica mudar (ex: verificação de email, 2FA), basta alterar aqui.
 */

import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface GetOrCreateUserOptions {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    role?: string;
}

export interface GetOrCreateUserResult {
    userId: string;
    isNew: boolean;
    sessionCreated: boolean;
}

/**
 * Garante que um usuário existe no Supabase Auth.
 *
 * Fluxo:
 *  1. Se há sessão ativa com o mesmo email → reutiliza
 *  2. Se não → tenta signUp
 *  3. Se já cadastrado → tenta signIn com a senha fornecida
 *  4. Se signIn falhar → lança erro com mensagem clara
 *
 * @throws {Error} Se o email já existe com outra senha, ou se ocorrer erro desconhecido
 */
export async function getOrCreateUser({
    email,
    password,
    name = '',
    phone = '',
    role = 'participant',
}: GetOrCreateUserOptions): Promise<GetOrCreateUserResult> {
    const cleanEmail = email.trim().toLowerCase();

    // ── STEP 1: Verificar sessão existente com o mesmo email
    const { data: { session: existingSession } } = await supabase.auth.getSession();

    if (existingSession?.user?.email === cleanEmail) {
        logger.info('[auth-helpers] Reutilizando sessão existente', { email: cleanEmail });
        return {
            userId: existingSession.user.id,
            isNew: false,
            sessionCreated: false,
        };
    }

    logger.debug('[auth-helpers] Iniciando tentativa de login', { email: cleanEmail });

    // ── STEP 2: Tentar LOGIN primeiro (mais rápido e evita rate-limit de signUp para existentes)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
    });

    if (!signInError) {
        logger.info('[auth-helpers] Login de usuário existente (via bypass):', { email: cleanEmail });
        return {
            userId: signInData.user.id,
            isNew: false,
            sessionCreated: true
        };
    }

    // Se falhou por senha incorreta (e o usuário existe), lançamos o erro imediatamente
    // Supabase geralmente retorna 'Invalid login credentials' tanto para user não existe qto senha errada
    // mas se a politica de enumeracao estiver desativada, ele pode ser específico.
    const isInvalidCredentials =
        signInError.message.toLowerCase().includes('invalid login credentials') ||
        signInError.message.toLowerCase().includes('invalid_credentials');

    // Se NÃO for erro de credenciais (ex: erro de rede, rate limit de login), lançamos
    if (!isInvalidCredentials) {
        if (signInError.message.includes('429') || signInError.message.toLowerCase().includes('too many requests')) {
            throw new Error('Muitas tentativas de login. Aguarde um momento e tente novamente.');
        }

        // NOVO: Tratar e-mail não confirmado explicitamente
        if (signInError.message.toLowerCase().includes('email not confirmed')) {
            throw new Error('Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada ou peça uma nova confirmação.');
        }

        throw signInError;
    }

    // ── STEP 3: Se o login falhou (provavelmente não existe), tentamos o SignUp
    logger.info('[auth-helpers] Login falhou ou usuário inexistente. Tentando signUp', { email: cleanEmail });
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
            data: { name, phone, role },
        },
    });

    if (!signUpError) {
        const userId = authData?.user?.id;
        if (!userId) throw new Error('Não foi possível identificar o usuário criado.');

        // ── STEP 3.5: Fallback Sync (Garantir public.users se o trigger falhar)
        try {
            const { error: syncError } = await supabase.from('users').upsert({
                id: userId,
                email: cleanEmail,
                name: name || cleanEmail,
                phone: phone,
                role: role,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

            if (syncError) {
                logger.warn('[auth-helpers] Manual sync warning (non-blocking)', { error: syncError.message });
            }
        } catch {
            logger.warn('[auth-helpers] Manual sync failed (non-blocking)');
        }

        logger.info('[auth-helpers] Novo usuário criado:', { userId, email: cleanEmail });
        return { userId, isNew: true, sessionCreated: !!authData.session };
    }

    // ── STEP 4: Tratar erros do SignUp
    const msg = signUpError.message.toLowerCase();

    // Usuário já existe mas a senha no Step 2 estava errada?
    if (msg.includes('already registered') || msg.includes('user already registered')) {
        throw new Error(
            'Este email já está cadastrado, mas a senha informada está incorreta. ' +
            'Use sua senha cadastrada ou recupere-a caso tenha esquecido.'
        );
    }

    // Erro de Rate Limit do Supabase (muito comum em signups repetidos)
    if (msg.includes('security purposes') || msg.includes('rate limit') || signUpError.status === 429) {
        // Tenta extrair os segundos da mensagem
        const secondsMatch = signUpError.message.match(/(\d+)\s+seconds/);
        const seconds = secondsMatch ? secondsMatch[1] : '60';
        throw new Error(`Por segurança, o Supabase bloqueou novas tentativas temporariamente. Tente novamente em ${seconds} segundos.`);
    }

    logger.error('[auth-helpers] Erro inesperado no processo de auth:', signUpError);
    throw signUpError;
}

/**
 * Aguarda a propagação do trigger de sincronização do Supabase Auth → public.users.
 * Verifica se o registro apareceu na tabela users (máximo 5 tentativas × 800ms).
 *
 * @returns O userId se sincronizado, ou o userId original se o timeout expirar
 */
export async function waitForUserSync(userId: string): Promise<string> {
    const MAX_ATTEMPTS = 5;
    const DELAY_MS = 800;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        await new Promise((r) => setTimeout(r, DELAY_MS));

        const { data } = await supabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .maybeSingle() as { data: { id: string } | null };

        if (data?.id) {
            logger.debug(`[auth-helpers] Usuário sincronizado após ${attempt} tentativa(s):`, userId);
            return userId;
        }

        logger.debug(`[auth-helpers] Aguardando sync do usuário (tentativa ${attempt}/${MAX_ATTEMPTS})...`);
    }

    // Mesmo sem confirmar a sincronia, retornar o userId — o insert de inscrição vai funcionar
    // pois o Supabase propaga o trigger assincronicamente ou nós já tentamos o upsert no getOrCreateUser
    logger.warn('[auth-helpers] Timeout aguardando sync do usuário. Verifique se o trigger handle_new_user() está ativo no Supabase.', { userId });
    return userId;
}

/**
 * Cria um usuário no Supabase Auth sem afetar a sessão atual.
 * Útil para administradores criando contas para outros.
 */
export async function createAuthUserWithoutSession({
    email,
    password,
    name = '',
    phone = '',
    role = 'participant',
}: GetOrCreateUserOptions) {
    const cleanEmail = email.trim().toLowerCase();

    // Criar um cliente temporário COM persistência DESATIVADA
    const tempSupabase = (await import('@supabase/supabase-js')).createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        }
    );

    const { data, error } = await tempSupabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
            data: { name, phone, role },
        },
    });

    if (error) {
        logger.error('[auth-helpers] Erro ao criar usuário admin-side:', error);
        throw error;
    }

    return data.user;
}

/**
 * Retorna o caminho de redirecionamento padrão baseado na role do usuário.
 * Centraliza a lógica de navegação pós-login e de dashboard.
 */
export function getRedirectPathByRole(role?: string): string {
  const normalizedRole = (role || '').toLowerCase().trim();

  switch (normalizedRole) {
    case 'admin':
    case 'superadmin':
    case 'staff':
      return '/admin';
    case 'mentor':
      return '/mentor-area';
    case 'company':
      return '/empresa-area';
    case 'startup':
      return '/startup-area';
    case 'sponsor':
      return '/patrocinador-area';
    case 'participant':
    case 'participante':
    default:
      return '/minha-area';
  }
}

