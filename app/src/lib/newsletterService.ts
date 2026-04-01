import { supabase } from './supabase';
import { logger } from './logger';

export interface NewsletterLead {
  id?: string;
  name: string;
  email: string;
  interests?: string[];
  engagement_score?: number;
  source?: string;
  project_id?: string;
  created_at?: string;
  unsubscribed_at?: string | null;
}

class NewsletterService {
  private readonly TABLE = 'newsletter_leads';

  /**
   * Inscreve um novo lead na newsletter com suporte a tags/interesses
   */
  async subscribe(lead: { name: string; email: string; interests?: string[]; source?: string; project_id?: string }) {
    try {
      // 1. Verificar se já existe
      const { data: existing } = await supabase
        .from(this.TABLE)
        .select('id, unsubscribed_at')
        .eq('email', lead.email.toLowerCase())
        .maybeSingle();

      if (existing) {
        if (existing.unsubscribed_at) {
          // Re-inscrever se tinha cancelado
          const { error } = await supabase
            .from(this.TABLE)
            .update({
              name: lead.name,
              interests: lead.interests,
              unsubscribed_at: null,
              source: lead.source || 're-subscription'
            })
            .eq('id', existing.id);
          
          if (error) throw error;
          return { success: true, message: 'Bem-vindo de volta! Inscrição reativada.' };
        }
        return { success: true, message: 'Você já está inscrito em nossa lista!' };
      }

      // 2. Criar novo registro
      const { error } = await supabase
        .from(this.TABLE)
        .insert({
          name: lead.name,
          email: lead.email.toLowerCase(),
          interests: lead.interests || [],
          source: lead.source || 'website',
          project_id: lead.project_id,
          engagement_score: 0
        });

      if (error) throw error;

      return { success: true, message: 'Inscrição realizada com sucesso! Prepare-se para o Growth Experience.' };
    } catch (error) {
      logger.error('Newsletter subscribe error:', error);
      throw error;
    }
  }

  /**
   * Cancela a inscrição de um lead (Opt-out LGPD)
   */
  async unsubscribe(email: string) {
    try {
      const { error } = await supabase
        .from(this.TABLE)
        .update({ unsubscribed_at: new Date().toISOString() })
        .eq('email', email.toLowerCase());

      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error('Newsletter unsubscribe error:', error);
      throw error;
    }
  }

  /**
   * Busca leads com filtros avançados
   */
  async getLeads(filters?: { project_id?: string; tag?: string; minScore?: number }) {
    try {
      let query = supabase
        .from(this.TABLE)
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.project_id) {
        query = query.eq('project_id', filters.project_id);
      }

      if (filters?.tag) {
        query = query.contains('interests', [filters.tag]);
      }

      if (filters?.minScore !== undefined) {
        query = query.gte('engagement_score', filters.minScore);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as NewsletterLead[];
    } catch (error) {
      logger.error('Newsletter getLeads error:', error);
      throw error;
    }
  }

  /**
   * Incrementa o score de engajamento (ex: ao clicar num link de email)
   */
  async trackEngagement(email: string, points: number = 1) {
    try {
      const { data: lead } = await supabase
        .from(this.TABLE)
        .select('engagement_score')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (lead) {
        const newScore = (lead.engagement_score || 0) + points;
        await supabase
          .from(this.TABLE)
          .update({ engagement_score: newScore })
          .eq('email', email.toLowerCase());
      }
    } catch (error) {
      logger.error('Newsletter trackEngagement error:', error);
    }
  }

  /**
   * Exporta leads para CSV
   */
  async exportToCSV(projectId?: string) {
    const leads = await this.getLeads({ project_id: projectId });
    if (!leads || leads.length === 0) return null;

    const headers = ['Nome', 'Email', 'Interesses', 'Score', 'Data Inscrição', 'Fonte'];
    const rows = leads.map(l => [
      l.name,
      l.email,
      (l.interests || []).join(', '),
      l.engagement_score,
      new Date(l.created_at!).toLocaleDateString(),
      l.source
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(';')).join('\n');
    return csvContent;
  }
}

export const newsletterService = new NewsletterService();
