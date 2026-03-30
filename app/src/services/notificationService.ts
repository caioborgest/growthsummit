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
        const payload: any = {
            user_id: params.userId,
            project_id: params.projectId && params.projectId.length > 20 ? params.projectId : null,
            title: params.title,
            message: params.message,
            type: params.type || 'info',
            metadata: params.metadata || {},
        };

        // Só inclui action_url se fornecido, mas pode falhar se a coluna não existir no DB
        if (params.actionUrl) {
            payload.action_url = params.actionUrl;
        }

        try {
            const { data, error } = await (supabase
                .from('notifications') as any)
                .insert(payload)
                .select()
                .single();

            if (error) {
                // Se o erro for de coluna inexistente (action_url), tenta sem ela
                if (error.code === 'PGRST204' || (error.message && error.message.includes('action_url'))) {
                    delete payload.action_url;
                    const { data: retryData, error: retryError } = await (supabase
                        .from('notifications') as any)
                        .insert(payload)
                        .select()
                        .single();
                    if (retryError) throw retryError;
                    return retryData;
                }
                throw error;
            }
            return data;
        } catch (err) {
            logger.error('Error sending notification:', err);
            throw err;
        }
    },

    async sendBulk(userIds: string[], params: Omit<NotificationParams, 'userId' | 'projectId'>, projectId: string) {
        const createPayload = (userId: string, includeActionUrl = true) => {
            const payload: any = {
                user_id: userId,
                project_id: projectId && projectId.length > 20 ? projectId : null,
                title: params.title,
                message: params.message,
                type: params.type || 'info',
                metadata: params.metadata || {},
            };
            if (includeActionUrl && params.actionUrl) {
                payload.action_url = params.actionUrl;
            }
            return payload;
        };

        try {
            const notifications = userIds.map(uid => createPayload(uid));
            const { data, error } = await (supabase
                .from('notifications') as any)
                .insert(notifications)
                .select();

            if (error) {
                if (error.code === 'PGRST204' || (error.message && error.message.includes('action_url'))) {
                    const fallbackNotifications = userIds.map(uid => createPayload(uid, false));
                    const { data: retryData, error: retryError } = await (supabase
                        .from('notifications') as any)
                        .insert(fallbackNotifications)
                        .select();
                    if (retryError) throw retryError;
                    return retryData;
                }
                throw error;
            }
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
