import { supabase } from '@/lib/supabase';
import type { Raffle } from '@/types';

export const raffleService = {
  async createRaffle(data: any) {
    const { data: raffle, error } = await supabase
      .from('raffles' as any)
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return raffle;
  },

  async updateRaffle(id: string, data: any) {
    const { data: raffle, error } = await supabase
      .from('raffles' as any)
      .update(data)
      .eq('id' as any, id)
      .select()
      .single();
    if (error) throw error;
    return raffle;
  },

  async enterRaffle(raffleId: string, registrationId: string) {
    const { data, error } = await supabase
      .from('raffle_participants' as any)
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
      .from('raffles' as any)
      .select('*')
      .eq('project_id' as any, projectId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Raffle[];
  },

  async getParticipants(raffleId: string) {
    const { data, error } = await supabase
      .from('raffle_participants' as any)
      .select('*, inscricoes_growth_experience(id, nome, email)')
      .eq('raffle_id' as any, raffleId);
    if (error) throw error;
    return data;
  }
};
