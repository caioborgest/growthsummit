import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface NotificationParams {
    userId: string;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    actionUrl?: string;
    metadata?: any;
}

export const notificationService = {
    async send(params: NotificationParams) {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .insert({
                    user_id: params.userId,
                    title: params.title,
                    message: params.message,
                    type: params.type || 'info',
                    action_url: params.actionUrl,
                    metadata: params.metadata || {},
                    read: false
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            logger.error('Error sending notification:', err);
            throw err;
        }
    },

    async sendBulk(userIds: string[], params: Omit<NotificationParams, 'userId'>) {
        try {
            const notifications = userIds.map(userId => ({
                user_id: userId,
                title: params.title,
                message: params.message,
                type: params.type || 'info',
                action_url: params.actionUrl,
                metadata: params.metadata || {},
                read: false
            }));

            const { data, error } = await supabase
                .from('notifications')
                .insert(notifications)
                .select();

            if (error) throw error;
            return data;
        } catch (err) {
            logger.error('Error sending bulk notifications:', err);
            throw err;
        }
    },

    async markAsRead(notificationId: string) {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true, read_at: new Date().toISOString() })
                .eq('id', notificationId);

            if (error) throw error;
            return true;
        } catch (err) {
            logger.error('Error marking notification as read:', err);
            throw err;
        }
    },

    async getUserNotifications(userId: string) {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (err) {
            logger.error('Error fetching notifications:', err);
            throw err;
        }
    }
};
