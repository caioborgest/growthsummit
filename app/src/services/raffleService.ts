import { supabase } from '@/lib/supabase';
import type { Raffle } from '@/types';

export const raffleService = {
  async createRaffle(data: any) {
    // Map camelCase to snake_case for direct Supabase call
    const dbData = {
      project_id: data.projectId,
      name: data.name,
      description: data.description,
      type: data.type,
      stand_id: data.standId,
      status: data.status || 'draft'
    };

    const { data: raffle, error } = await supabase
      .from('raffles')
      .insert([dbData as any])
      .select('id, project_id, name, description, type, status, stand_id, winner_registration_id, drawn_at, created_at, updated_at')
      .single();
    
    if (error) {
      console.error('[raffleService] createRaffle error:', error);
      throw error;
    }
    return raffle;
  },

  async updateRaffle(id: string, data: any) {
    // Map camelCase to snake_case
    const dbData: any = {};
    if (data.status) dbData.status = data.status;
    if (data.name) dbData.name = data.name;
    if (data.description) dbData.description = data.description;
    if (data.winnerRegistrationId) dbData.winner_registration_id = data.winnerRegistrationId;
    if (data.drawnAt) dbData.drawn_at = data.drawnAt;
    if (data.standId) dbData.stand_id = data.standId;

    const { data: raffle, error } = await supabase
      .from('raffles')
      .update(dbData)
      .eq('id', id)
      .select('id, project_id, name, description, type, status, stand_id, winner_registration_id, drawn_at, created_at, updated_at')
      .single();
    
    if (error) {
      console.error('[raffleService] updateRaffle error:', error);
      throw error;
    }
    return raffle;
  },

  async enterRaffle(raffleId: string, registrationId: string) {
    const { data, error } = await supabase
      .from('raffle_participants')
      .insert([{ raffle_id: raffleId, registration_id: registrationId }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async drawWinner(raffleId: string) {
    const { data, error } = await supabase
      .rpc('draw_raffle_winner', { p_raffle_id: raffleId });
    if (error) throw error;
    return data;
  },

  async getRaffles(projectId: string) {
    const { data, error } = await supabase
      .from('raffles')
      .select('id, project_id, name, description, type, status, stand_id, winner_registration_id, drawn_at, created_at, updated_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) {
       console.error('[raffleService] getRaffles error:', error);
       throw error;
    }
    return data as any[];
  },

  async getParticipants(raffleId: string) {
    const { data, error } = await supabase
      .from('raffle_participants')
      .select('*, registrations(id, name, email)')
      .eq('raffle_id' as any, raffleId);
    if (error) throw error;
    return data;
  }
};
