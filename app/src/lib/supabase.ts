import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { logger } from './logger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  logger.warn('⚠️ Supabase URL ou Anon Key não configurados. Algumas funcionalidades podem não funcionar.');
}

// Cliente Supabase para o browser
export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Silenciar erros de inicialização (como AbortError de locks) que podem surgir como
// unhandled rejections no console, especialmente durante HMR ou navegação rápida.
supabase.auth.getSession().catch(err => {
  if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
    // logger.debug('[Supabase] Initial session fetch aborted');
  } else {
    logger.error('[Supabase] Initial session fetch failed:', err);
  }
});

// Helper para upload de arquivos
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    logger.error('Erro no upload:', error);
    return null;
  }

  // Retornar URL pública
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}

// Helper para download de arquivo
export async function downloadFile(bucket: string, path: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);

  if (error) {
    logger.error('Erro no download:', error);
    return null;
  }

  return data;
}

// Helper para deletar arquivo
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    logger.error('Erro ao deletar:', error);
    return false;
  }

  return true;
}

// Helper para listar arquivos
export async function listFiles(bucket: string, path?: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path || '');

  if (error) {
    logger.error('Erro ao listar:', error);
    return [];
  }

  return data;
}
