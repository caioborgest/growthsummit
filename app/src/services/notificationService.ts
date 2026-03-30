import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface NotificationParams {
    userId: string;
    projectId: string; // Mandatory for scoping
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    actionUrl?: string;
    metadata?: any;
}

export const notificationService = {
    async send(params: NotificationParams) {
        try {
            const { data, error } = await (supabase
                .from('notifications') as any)
                .insert({
                    user_id: params.userId,
                    project_id: params.projectId && params.projectId.length > 20 ? params.projectId : null,
                    title: params.title,
                    message: params.message,
                    type: params.type || 'info',
                    action_url: params.actionUrl || null,
                    metadata: params.metadata || {},
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

    async sendBulk(userIds: string[], params: Omit<NotificationParams, 'userId' | 'projectId'>, projectId: string) {
        try {
            const notifications = userIds.map(userId => ({
                user_id: userId,
                project_id: projectId && projectId.length > 20 ? projectId : null,
                title: params.title,
                message: params.message,
                type: params.type || 'info',
                action_url: params.actionUrl || null,
                metadata: params.metadata || {},
            }));

            const { data, error } = await (supabase
                .from('notifications') as any)
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
            const updateData: Record<string, unknown> = { read: true };
            // Inclui read_at apenas se for possível (coluna pode não existir em versões antigas)
            try {
                updateData.read_at = new Date().toISOString();
            } catch { /* ignore */ }

            const { error } = await (supabase
                .from('notifications') as any)
                .update(updateData)
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
            const { data, error } = await (supabase
                .from('notifications') as any)
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
