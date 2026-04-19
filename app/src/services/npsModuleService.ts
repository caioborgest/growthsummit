import { supabase } from '../lib/supabase';
import { 
  NPSForm, 
  NPSFormQuestion, 
  NPSAutomation, 
  NPSResponse, 
  NPSCase,
  NPSSession,
  NPSAnswer,
  NPSCaseActivity
} from '../types';
import { logger } from '../lib/logger';

export const npsModuleService = {
  // ==========================================
  // FORMS & BUILDER
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

  async getFormById(formId: string): Promise<{ form: NPSForm; questions: NPSFormQuestion[] } | null> {
    try {
      const { data: form, error: formError } = await supabase
        .from('nps_forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (formError || !form) throw formError;

      const { data: questions, error: questionsError } = await supabase
        .from('nps_form_questions')
        .select('*')
        .eq('form_id', formId)
        .order('order_index', { ascending: true });

      if (questionsError) throw questionsError;

      return { form: this._mapForm(form), questions: questions.map(this._mapFormQuestion) };
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
        objective: form.objective,
        status: form.status,
        default_channel: form.defaultChannel,
        language: form.language,
        visual_settings: form.visualSettings
      };

      if (!form.id) {
        const { data, error } = await supabase.from('nps_forms').insert([payload]).select().single();
        if (error) throw error;
        return this._mapForm(data);
      } else {
        const { data, error } = await supabase.from('nps_forms').update(payload).eq('id', form.id).select().single();
        if (error) throw error;
        return this._mapForm(data);
      }
    } catch (error) {
      logger.error('Erro ao salvar form:', error);
      return null;
    }
  },

  async saveFormQuestions(formId: string, questions: Partial<NPSFormQuestion>[]): Promise<boolean> {
    try {
      // Very basic replace all strategy for the builder
      await supabase.from('nps_form_questions').delete().eq('form_id', formId);
      
      if (questions.length > 0) {
        const payload = questions.map(q => ({
          form_id: formId,
          type: q.type,
          label: q.label,
          help_text: q.helpText,
          placeholder: q.placeholder,
          is_required: q.isRequired,
          order_index: q.orderIndex,
          options: q.options,
          conditional_rules: q.conditionalRules
        }));
        
        const { error } = await supabase.from('nps_form_questions').insert(payload);
        if (error) throw error;
      }
      return true;
    } catch (error) {
      logger.error('Erro ao salvar questions:', error);
      return false;
    }
  },

  // ==========================================
  // DASHBOARD & ANALYTICS
  // ==========================================
  async getDashboardStats(projectId: string) {
    try {
      const { data: responses, error } = await supabase
        .from('nps_responses')
        .select('nps_score, classification, created_at')
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
          { name: 'Promotores', value: promoters, fill: '#10B981' }, 
          { name: 'Neutros', value: passives, fill: '#F59E0B' }, 
          { name: 'Detratores', value: detractors, fill: '#EF4444' } 
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
  async getLoopCases(projectId: string): Promise<NPSCase[]> {
    try {
      const { data, error } = await supabase
        .from('nps_cases')
        .select(`*, response:nps_responses(*)`)
        .eq('event_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(d => ({
        ...this._mapCase(d),
        response: d.response ? this._mapResponse(d.response) : undefined
      }));
    } catch (error) {
      logger.error('Erro ao buscar cases de loop:', error);
      return [];
    }
  },

  async getCaseActivities(caseId: string): Promise<NPSCaseActivity[]> {
    try {
      const { data, error } = await supabase.from('nps_case_activities').select('*').eq('case_id', caseId).order('created_at', { ascending: true });
      if (error) throw error;
      return data.map(this._mapCaseActivity);
    } catch (error) {
      logger.error('Erro ao buscar atividades:', error);
      return [];
    }
  },

  async updateCaseStatus(caseId: string, status: string, actionTaken?: string, userId?: string, ownerId?: string, priority?: string): Promise<boolean> {
    try {
      const payload: any = {};
      if (status) {
        payload.status = status;
        if (status === 'resolved' || status === 'closed') payload.resolved_at = new Date().toISOString();
      }
      if (ownerId !== undefined) payload.owner_id = ownerId;
      if (priority !== undefined) payload.priority = priority;

      const { error } = await supabase.from('nps_cases').update(payload).eq('id', caseId);
      if (error) throw error;

      if (actionTaken || ownerId || priority) {
        await supabase.from('nps_case_activities').insert([{
           case_id: caseId,
           user_id: userId,
           action_type: actionTaken ? 'status_changed' : 'property_updated',
           content: actionTaken || `Propriedades do caso atualizadas (Owner/Priority)`,
           internal_only: true
        }]);
      }

      return true;
    } catch (error) {
      logger.error('Erro ao atualizar status do case:', error);
      return false;
    }
  },

  // ==========================================
  // SUBMISSION (V2 Multi-table)
  // ==========================================
  async startSession(formId: string, projectId: string, tokenId?: string, participantId?: string): Promise<NPSSession | null> {
      try {
          const { data, error } = await supabase.from('nps_response_sessions').insert([{
              form_id: formId,
              event_id: projectId,
              public_token_id: tokenId,
              participant_user_id: participantId,
              device_info: { userAgent: navigator.userAgent },
              status: 'in_progress'
          }]).select().single();
          if (error) throw error;
          return this._mapSession(data);
      } catch (e) {
          logger.error('Error starting session', e);
          return null;
      }
  },

  async submitFullResponse(sessionId: string, projectId: string, formId: string, npsScore: number, answers: Partial<NPSAnswer>[], comment?: string): Promise<boolean> {
    try {
      // 1. Inserir Response Core
      const { data: responseData, error: respError } = await supabase.from('nps_responses').insert([{
        event_id: projectId,
        session_id: sessionId,
        form_id: formId,
        nps_score: npsScore,
        main_comment: comment
      }]).select().single();
      
      if (respError) throw respError;

      // 2. Inserir Respostas Fracionadas
      if (answers.length > 0) {
         const ansPayload = answers.map(a => ({
            session_id: sessionId,
            question_id: a.questionId,
            value_text: a.valueText,
            value_numeric: a.valueNumeric,
            value_json: a.valueJson
         }));
         await supabase.from('nps_response_answers').insert(ansPayload);
      }

      // 3. Close Session
      await supabase.from('nps_response_sessions').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', sessionId);

      return true;
    } catch (error) {
      logger.error('Erro ao enviar resposta massiva:', error);
      return false;
    }
  },

  async generatePublicToken(formId: string, projectId: string, participantEmail?: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.from('nps_public_tokens').insert([{
        form_id: formId,
        event_id: projectId,
        participant_email: participantEmail
        // token is generated by postgres default gen_random_uuid()
      }]).select('token').single();
      
      if (error) throw error;
      return data.token;
    } catch (error) {
      logger.error('Erro ao gerar token publico:', error);
      return null;
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
      objective: db.objective,
      status: db.status,
      defaultChannel: db.default_channel,
      language: db.language,
      visualSettings: db.visual_settings,
      createdBy: db.created_by,
      createdAt: db.created_at,
      updatedAt: db.updated_at
    };
  },

  _mapFormQuestion(db: any): NPSFormQuestion {
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
      createdAt: db.created_at,
      updatedAt: db.updated_at
    };
  },

  _mapResponse(db: any): NPSResponse {
    return {
      id: db.id,
      projectId: db.event_id,
      sessionId: db.session_id,
      formId: db.form_id,
      score: db.nps_score,
      classification: db.classification,
      mainComment: db.main_comment,
      createdAt: db.created_at
    };
  },

  _mapSession(db: any): NPSSession {
      return {
          id: db.id,
          projectId: db.event_id,
          formId: db.form_id,
          participantUserId: db.participant_user_id,
          publicTokenId: db.public_token_id,
          deviceInfo: db.device_info,
          status: db.status,
          startedAt: db.started_at,
          completedAt: db.completed_at,
          updatedAt: db.updated_at
      }
  },

  _mapCaseActivity(db: any): NPSCaseActivity {
      return {
          id: db.id,
          caseId: db.case_id,
          userId: db.user_id,
          actionType: db.action_type,
          content: db.content,
          internalOnly: db.internal_only,
          createdAt: db.created_at
      }
  },

  _mapCase(db: any): NPSCase {
    return {
      id: db.id,
      projectId: db.event_id,
      responseId: db.response_id,
      ownerId: db.owner_id,
      status: db.status,
      priority: db.priority,
      slaDueAt: db.sla_due_at,
      resolvedAt: db.resolved_at,
      createdAt: db.created_at,
      updatedAt: db.updated_at
    };
  }
};
