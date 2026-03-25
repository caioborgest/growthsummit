import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface SupportTicket {
    id: string;
    project_id?: string;
    user_id?: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    category?: 'technical' | 'finance' | 'registration' | 'general' | string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    created_at: string;
    updated_at: string;
}

export interface SupportMessage {
    id: string;
    ticket_id: string;
    user_id?: string;
    message: string;
    is_admin: boolean;
    created_at: string;
}

export const supportService = {
    async createTicket(params: Partial<SupportTicket>) {
        try {
            const { data, error } = await supabase
                .from('support_tickets')
                .insert(params)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            logger.error('Error creating support ticket:', err);
            throw err;
        }
    },

    async getTickets(filter?: Partial<SupportTicket>) {
        try {
            let query = supabase.from('support_tickets').select('*');
            if (filter?.user_id) query = query.eq('user_id', filter.user_id);
            if (filter?.status) query = query.eq('status', filter.status);
            
            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        } catch (err) {
            logger.error('Error fetching support tickets:', err);
            throw err;
        }
    },

    async updateTicket(ticketId: string, updates: Partial<SupportTicket>) {
        try {
            const { data, error } = await supabase
                .from('support_tickets')
                .update(updates)
                .eq('id', ticketId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            logger.error('Error updating support ticket:', err);
            throw err;
        }
    },

    async addMessage(params: Partial<SupportMessage>) {
        try {
            const { data, error } = await supabase
                .from('support_ticket_messages')
                .insert(params)
                .select()
                .single();

            if (error) throw error;

            // Auto-update ticket status to 'in_progress' if admin responds
            if (params.is_admin) {
                await this.updateTicket(params.ticket_id!, { status: 'in_progress' });
            }

            return data;
        } catch (err) {
            logger.error('Error adding support message:', err);
            throw err;
        }
    },

    async getTicketMessages(ticketId: string) {
        try {
            const { data, error } = await supabase
                .from('support_ticket_messages')
                .select('*')
                .eq('ticket_id', ticketId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data;
        } catch (err) {
            logger.error('Error fetching ticket messages:', err);
            throw err;
        }
    }
};
