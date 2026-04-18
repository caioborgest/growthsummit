import { supabase } from '../lib/supabase';
import { 
  NPSForm, 
  NPSQuestion, 
  NPSAutomation, 
  NPSResponse, 
  NPSLoopCase 
} from '../types';
import { logger } from '../lib/logger';

export const npsModuleService = {
  // ==========================================
  // FORMS MANAGEMENT
  // ==========================================
  async getForms(projectId: string): Promise<NPSForm[]> {
    try {
      const { data, error } = await supabase
        .from('nps_forms')
        .select('*')
        .eq('event_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(this._mapForm);
    } catch (error) {
      logger.error('Erro ao buscar forms NPS:', error);
      return [];
    }
  },

  async getFormById(formId: string): Promise<{ form: NPSForm; questions: NPSQuestion[] } | null> {
    try {
      const { data: form, error: formError } = await supabase
        .from('nps_forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (formError || !form) throw formError;

      const { data: questions, error: questionsError } = await supabase
        .from('nps_questions')
        .select('*')
        .eq('form_id', formId)
        .order('order_index', { ascending: true });

      if (questionsError) throw questionsError;

      return { form: this._mapForm(form), questions: questions.map(this._mapQuestion) };
    } catch (error) {
      logger.error('Erro ao buscar form por ID:', error);
      return null;
    }
  },

  async saveForm(form: Partial<NPSForm>): Promise<NPSForm | null> {
    try {
      const payload = {
        id: form.id,
        event_id: form.projectId,
        internal_name: form.internalName,
        description: form.description,
        status: form.status,
        default_channel: form.defaultChannel,
        language: form.language,
        visual_settings: form.visualSettings,
        nps_question: form.npsQuestion,
        min_score: form.minScore,
        max_score: form.maxScore,
        min_label: form.minLabel,
        max_label: form.maxLabel,
        thanks_promoter: form.thanksPromoter,
        thanks_passive: form.thanksPassive,
        thanks_detractor: form.thanksDetractor,
      };

      if (!form.id) {
        // Insert
        const { data, error } = await supabase.from('nps_forms').insert([payload]).select().single();
        if (error) throw error;
        return this._mapForm(data);
      } else {
        // Update
        const { data, error } = await supabase.from('nps_forms').update(payload).eq('id', form.id).select().single();
        if (error) throw error;
        return this._mapForm(data);
      }
    } catch (error) {
      logger.error('Erro ao salvar form:', error);
      return null;
    }
  },

  // ==========================================
  // DASHBOARD & ANALYTICS
  // ==========================================
  async getDashboardStats(projectId: string) {
    try {
      // Get all responses for the project
      const { data: responses, error } = await supabase
        .from('nps_responses')
        .select('nps_score, classification, created_at, session_id')
        .eq('event_id', projectId);

      if (error) throw error;

      const total = responses.length;
      if (total === 0) return { score: 0, promoters: 0, detractors: 0, passives: 0, total: 0, responsesByClassification: [] };

      const promoters = responses.filter(r => r.classification === 'promoter').length;
      const detractors = responses.filter(r => r.classification === 'detractor').length;
      const passives = total - promoters - detractors;

      const score = Math.round(((promoters / total) * 100) - ((detractors / total) * 100));

      return {
        score,
        promoters,
        detractors,
        passives,
        total,
        responsesByClassification: [
          { name: 'Promotores', value: promoters, fill: '#10B981' }, // emerald-500
          { name: 'Neutros', value: passives, fill: '#F59E0B' }, // amber-500
          { name: 'Detratores', value: detractors, fill: '#EF4444' } // red-500
        ]
      };
    } catch (error) {
      logger.error('Erro ao buscar stats do dashboard:', error);
      return null;
    }
  },

  // ==========================================
  // CLOSED LOOP (CASES)
  // ==========================================
  async getLoopCases(projectId: string): Promise<NPSLoopCase[]> {
    try {
      const { data, error } = await supabase
        .from('nps_cases')
        .select(`
          *,
          response:nps_responses(*)
        `)
        .eq('event_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(d => ({
        ...this._mapLoopCase(d),
        response: d.response ? this._mapResponse(d.response) : undefined
      }));
    } catch (error) {
      logger.error('Erro ao buscar cases de loop:', error);
      return [];
    }
  },

  async updateCaseStatus(caseId: string, status: string, actionTaken?: string): Promise<boolean> {
    try {
      const payload: any = { status };
      if (actionTaken) payload.action_taken = actionTaken;
      if (status === 'resolved' || status === 'closed') payload.resolved_at = new Date().toISOString();
      if (status === 'in_progress') payload.first_response_at = new Date().toISOString();

      const { error } = await supabase
        .from('nps_cases')
        .update(payload)
        .eq('id', caseId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Erro ao atualizar status do case:', error);
      return false;
    }
  },

  // ==========================================
  // SUBMISSION
  // ==========================================
  async submitResponse(response: Partial<NPSResponse>): Promise<{ success: boolean; error?: string }> {
    try {
      // Classification is handled by DB Trigger, but we can pass it if we want
      const payload = {
        form_id: response.formId,
        event_id: response.projectId,
        participant_user_id: response.userId,
        session_id: response.sessionId,
        nps_score: response.score,
        main_comment: response.mainComment,
        channel: response.channel || 'in_app'
      };

      const { error } = await supabase.from('nps_responses').insert([payload]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error('Erro ao enviar resposta:', error);
      return { success: false, error: 'Falha ao salvar resposta.' };
    }
  },

  // ==========================================
  // MAPPERS
  // ==========================================
  _mapForm(db: any): NPSForm {
    return {
      id: db.id,
      projectId: db.event_id,
      internalName: db.internal_name,
      description: db.description,
      status: db.status,
      defaultChannel: db.default_channel,
      language: db.language,
      visualSettings: db.visual_settings,
      npsQuestion: db.nps_question,
      minScore: db.min_score,
      maxScore: db.max_score,
      minLabel: db.min_label,
      maxLabel: db.max_label,
      thanksPromoter: db.thanks_promoter,
      thanksPassive: db.thanks_passive,
      thanksDetractor: db.thanks_detractor,
      createdBy: db.created_by,
      createdAt: db.created_at,
      updatedAt: db.updated_at
    };
  },

  _mapQuestion(db: any): NPSQuestion {
    return {
      id: db.id,
      formId: db.form_id,
      type: db.type,
      label: db.label,
      helpText: db.help_text,
      placeholder: db.placeholder,
      isRequired: db.is_required,
      orderIndex: db.order_index,
      options: db.options,
      conditionalRules: db.conditional_rules,
      tags: db.tags,
      slug: db.slug,
      createdAt: db.created_at
    };
  },

  _mapResponse(db: any): NPSResponse {
    return {
      id: db.id,
      formId: db.form_id,
      projectId: db.event_id,
      userId: db.participant_user_id,
      dispatchId: db.send_log_id,
      sessionId: db.session_id,
      score: db.nps_score,
      classification: db.classification,
      mainComment: db.main_comment,
      channel: db.channel,
      metadata: db.metadata,
      createdAt: db.created_at
    };
  },

  _mapLoopCase(db: any): NPSLoopCase {
    return {
      id: db.id,
      projectId: db.event_id,
      responseId: db.response_id,
      ownerId: db.owner_id,
      status: db.status,
      priority: db.priority,
      slaDueAt: db.sla_due_at,
      firstResponseAt: db.first_response_at,
      resolvedAt: db.resolved_at,
      rootCause: db.root_cause,
      actionTaken: db.action_taken,
      recoveryOutcome: db.recovery_outcome,
      createdAt: db.created_at,
      updatedAt: db.updated_at
    };
  }
};
