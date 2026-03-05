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
        logger.debug('[auth-helpers] Reutilizando sessão existente para:', cleanEmail);
        return {
            userId: existingSession.user.id,
            isNew: false,
            sessionCreated: false,
        };
    }

    // ── STEP 2: Tentar criar novo usuário via signUp
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
            data: { name, phone, role },
        },
    });

    if (!signUpError) {
        // signUp bem-sucedido (novo usuário)
        const userId = authData?.user?.id;
        if (!userId) {
            throw new Error('Não foi possível identificar o usuário criado. Tente novamente.');
        }

        // Se o Supabase não criou sessão automaticamente (ex: confirmação de email desativada),
        // tenta login automático
        if (!authData.session) {
            await supabase.auth.signInWithPassword({ email: cleanEmail, password }).catch((e) => {
                logger.warn('[auth-helpers] Auto-login após signUp falhou (normal se email confirmation ativo):', e.message);
            });
        }

        logger.info('[auth-helpers] Novo usuário criado:', { userId, email: cleanEmail });
        return { userId, isNew: true, sessionCreated: !!authData.session };
    }

    // ── STEP 3: Email já existente → tentar signIn
    const isAlreadyRegistered =
        signUpError.message.toLowerCase().includes('already registered') ||
        signUpError.message.toLowerCase().includes('user already registered');

    if (isAlreadyRegistered) {
        logger.debug('[auth-helpers] Email já cadastrado, tentando signIn:', cleanEmail);

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
        });

        if (signInError) {
            // Senha incorreta → erro claro para o usuário
            if (
                signInError.message.includes('Invalid login credentials') ||
                signInError.message.includes('invalid_credentials')
            ) {
                throw new Error(
                    'Este email já está cadastrado, mas a senha informada está incorreta. ' +
                    'Use a senha da sua conta ou clique em "Esqueci minha senha".'
                );
            }
            // Outro erro de signIn
            throw signInError;
        }

        const userId = signInData?.user?.id;
        if (!userId) {
            throw new Error('Login bem-sucedido mas usuário não identificado. Tente recarregar a página.');
        }

        logger.info('[auth-helpers] Login de usuário existente:', { userId, email: cleanEmail });
        return { userId, isNew: false, sessionCreated: !!signInData.session };
    }

    // ── STEP 4: Erro desconhecido no signUp
    logger.error('[auth-helpers] Erro inesperado no signUp:', signUpError);
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
            .maybeSingle();

        if (data?.id) {
            logger.debug(`[auth-helpers] Usuário sincronizado após ${attempt} tentativa(s):`, userId);
            return userId;
        }

        logger.debug(`[auth-helpers] Aguardando sync do usuário (tentativa ${attempt}/${MAX_ATTEMPTS})...`);
    }

    // Mesmo sem confirmar a sincronia, retornar o userId — o insert de inscrição vai funcionar
    // pois o Supabase propaga o trigger assincronicamente
    logger.warn('[auth-helpers] Timeout aguardando sync do usuário. Prosseguindo com userId:', userId);
    return userId;
}
