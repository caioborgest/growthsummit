import { supabase } from '../lib/supabase';
import { NPSSurvey, NPSResponse } from '../types';
import { logger } from '../lib/logger';

export const npsService = {
  /**
   * Busca as pesquisas NPS de um projeto
   */
  async getSurveys(projectId: string): Promise<NPSSurvey[]> {
    try {
      const { data, error } = await supabase
        .from('event_nps_surveys')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(d => this._mapSurvey(d));
    } catch (error) {
      logger.error('Erro ao buscar surveys NPS:', error);
      return [];
    }
  },

  /**
   * Busca uma pesquisa por ID
   */
  async getSurveyById(surveyId: string): Promise<NPSSurvey | null> {
    try {
      const { data, error } = await supabase
        .from('event_nps_surveys')
        .select('*')
        .eq('id', surveyId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return this._mapSurvey(data);
    } catch (error) {
      logger.error('Erro ao buscar survey por ID:', error);
      return null;
    }
  },

  /**
   * Busca uma pesquisa ativa para o PWA
   */
  async getActiveSurvey(projectId: string): Promise<NPSSurvey | null> {
    try {
      const { data, error } = await supabase
        .from('event_nps_surveys')
        .select('*')
        .eq('project_id', projectId)
        .eq('active', true)
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }
      return this._mapSurvey(data);
    } catch (error) {
      logger.error('Erro ao buscar survey ativa:', error);
      return null;
    }
  },

  /**
   * Busca os resultados e estatísticas de uma pesquisa
   */
  async getResults(surveyId: string) {
    try {
      const { data: responses, error } = await supabase
        .from('event_nps_responses')
        .select('*')
        .eq('survey_id', surveyId);

      if (error) throw error;

      const total = responses.length;
      if (total === 0) return { score: 0, promoters: 0, detractors: 0, passives: 0, total: 0, responses: [] };

      const promoters = responses.filter(r => r.score >= 9).length;
      const detractors = responses.filter(r => r.score <= 6).length;
      const passives = total - promoters - detractors;

      // NPS = (% Promotores) - (% Detratores)
      const score = Math.round(((promoters / total) * 100) - ((detractors / total) * 100));

      return {
        score,
        promoters,
        detractors,
        passives,
        total,
        responses: responses.map(r => this._mapResponse(r))
      };
    } catch (error) {
      logger.error('Erro ao buscar resultados NPS:', error);
      return null;
    }
  },

  /**
   * Salva uma resposta de NPS
   */
  async submitResponse(response: Partial<NPSResponse>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('event_nps_responses')
        .insert([{
          survey_id: response.surveyId,
          registration_id: response.registrationId,
          user_id: response.userId,
          score: response.score,
          comment: response.comment,
          metadata: response.metadata || {}
        }]);

      if (error) {
        if (error.code === '23505') return { success: false, error: 'Você já respondeu a esta pesquisa.' };
        throw error;
      }

      return { success: true };
    } catch (error) {
      logger.error('Erro ao enviar resposta NPS:', error);
      return { success: false, error: 'Falha ao salvar resposta.' };
    }
  },

  /**
   * Cria ou atualiza uma pesquisa
   */
  async saveSurvey(survey: Partial<NPSSurvey>): Promise<NPSSurvey | null> {
    try {
      const { data, error } = await supabase
        .from('event_nps_surveys')
        .upsert([{
          id: survey.id,
          project_id: survey.projectId,
          title: survey.title,
          description: survey.description,
          active: survey.active,
          target_audience: survey.targetAudience,
          settings: survey.settings
        }])
        .select()
        .single();

      if (error) throw error;
      return this._mapSurvey(data);
    } catch (error) {
      logger.error('Erro ao salvar survey NPS:', error);
      return null;
    }
  },

  /**
   * Deleta uma pesquisa
   */
  async deleteSurvey(surveyId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('event_nps_surveys')
        .delete()
        .eq('id', surveyId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Erro ao deletar survey NPS:', error);
      return false;
    }
  },

  /**
   * Mapeadores (Internos)
   */
  _mapSurvey(db: any): NPSSurvey {
    return {
      id: db.id,
      projectId: db.project_id,
      title: db.title,
      description: db.description,
      active: db.active,
      targetAudience: db.target_audience,
      settings: db.settings,
      createdAt: db.created_at,
      updatedAt: db.updated_at
    };
  },

  _mapResponse(db: any): NPSResponse {
    return {
      id: db.id,
      surveyId: db.survey_id,
      registrationId: db.registration_id,
      userId: db.user_id,
      score: db.score,
      comment: db.comment,
      metadata: db.metadata,
      createdAt: db.created_at
    };
  }
};
