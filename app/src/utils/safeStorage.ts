
import { logger } from '@/lib/logger';

/**
 * Utilitário para acesso seguro ao localStorage.
 * Evita crashes no Safari (especialmente em modo privado ou com cookies bloqueados)
 * onde o acesso ao localStorage pode lançar exceções de segurança.
 */
export const safeStorage = {
  /**
   * Obtém um item do localStorage de forma segura
   */
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      logger.warn(`Erro ao acessar localStorage.getItem('${key}'):`, error);
      return null;
    }
  },

  /**
   * Define um item no localStorage de forma segura
   */
  setItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      logger.warn(`Erro ao acessar localStorage.setItem('${key}'):`, error);
      return false;
    }
  },

  /**
   * Remove um item do localStorage de forma segura
   */
  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      logger.warn(`Erro ao acessar localStorage.removeItem('${key}'):`, error);
      return false;
    }
  },

  /**
   * Limpa o localStorage de forma segura
   */
  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      logger.warn('Erro ao acessar localStorage.clear():', error);
      return false;
    }
  }
};
