import { supabase } from './supabase';
import { issueCertificate } from './certificateGenerator';
import { notificationService } from '@/services/notificationService';
import { emailService } from '@/services/emailService';
import type { Project, Session } from '@/types';

/**
 * Service to handle automatic certificate issuance
 */
export class CertificateService {
    /**
     * Checks if a user is eligible for a certificate and issues it if they are
     */
    static async checkAndIssueSessionCertificate(
        user: { id: string; name: string },
        project: Project,
        session: Session,
        registrationId: string
    ) {
        try {
            // 1. Check if certificate already exists
            const { data: existing } = await supabase
                .from('certificates')
                .select('id')
                .eq('user_id', user.id)
                .eq('session_id', session.id)
                .maybeSingle();

            if (existing) {
                console.info('Certificate already exists for this session');
                return;
            }

            // 2. Issuance Logic: Check if they checked into this activity
            const { data: attendance, error: attendanceError } = await supabase
                .from('activity_check_ins')
                .select('id')
                .eq('session_id', session.id)
                .eq('registration_id', registrationId)
                .maybeSingle();

            if (attendanceError || !attendance) {
                console.info(`User ${user.id} not checked in for session ${session.id}`);
                return;
            }

            // 3. Generate certificate data
            const certData = await issueCertificate(user, project, 'lecture', session);

            // 4. Save certificate to DB
            const { data: certificate, error } = await supabase
                .from('certificates')
                .insert({
                    project_id: project.id,
                    user_id: user.id,
                    registration_id: registrationId,
                    session_id: session.id,
                    activity_name: session.title,
                    type: 'lecture',
                    code: certData.certificateCode,
                    issue_date: new Date().toISOString(),
                    status: 'validado',
                    metadata: {
                        session_title: session.title,
                        room: session.room,
                        total_hours: 1 // Default for activity
                    }
                })
                .select()
                .single();

            if (error) throw error;

            // 5. Notify the user (Push)
            await notificationService.send({
                userId: user.id,
                projectId: project.id,
                title: '🎉 Certificado Disponível!',
                message: `Seu certificado da palestra "${session.title}" já está pronto para download em seu painel.`,
                type: 'success',
                actionUrl: '/minha-area/certificados'
            });

            // 6. Send Automated Email
            if (registrationId) {
                const { data: reg } = await supabase
                    .from('registrations')
                    .select('nome, email')
                    .eq('id', registrationId)
                    .maybeSingle();

                if (reg?.email) {
                    const validateUrl = `${window.location.origin}/validar/${certData.certificateCode}`;
                    await emailService.sendCertificate(
                        reg.email,
                        reg.nome || 'Participante',
                        session.title,
                        certData.certificateCode,
                        validateUrl
                    );
                }
            }

            console.info(`Certificate issued, user notified and email sent: ${user.name} - ${session.title}`);
            return certificate;
        } catch (err) {
            console.error('Failed to issue certificate:', err);
        }
    }

    /**
     * Issues the main event participation certificate
     */
    static async issueEventCertificate(
        user: { id: string; name: string },
        project: Project,
        registrationId: string
    ) {
        try {
            // Check if already exists
            const { data: existing } = await supabase
                .from('certificates')
                .select('id')
                .eq('user_id', user.id)
                .eq('registration_id', registrationId)
                .eq('type', 'event')
                .maybeSingle();

            if (existing) return;

            const certData = await issueCertificate(user, project, 'event');
            const { data: certificate, error } = await supabase
                .from('certificates')
                .insert({
                    project_id: project.id,
                    user_id: user.id,
                    registration_id: registrationId,
                    activity_name: project.name,
                    type: 'event',
                    code: certData.certificateCode,
                    issue_date: new Date().toISOString(),
                    status: 'validado',
                    metadata: {
                        event_name: project.name,
                        total_hours: (project.metadata as any)?.certificate_template?.total_hours || 12
                    }
                })
                .select()
                .single();

            if (error) throw error;

            // 5. Notify the user (Push)
            await notificationService.send({
                userId: user.id,
                projectId: project.id,
                title: '🏆 Conquista Desbloqueada!',
                message: `Parabéns! Sua participação no ${project.name} foi validada e seu certificado oficial já está disponível.`,
                type: 'success',
                actionUrl: '/minha-area/certificados'
            });

            // 6. Send Automated Email
            if (registrationId) {
                const { data: reg } = await supabase
                    .from('registrations')
                    .select('nome, email')
                    .eq('id', registrationId)
                    .maybeSingle();

                if (reg?.email) {
                    const validateUrl = `${window.location.origin}/validar/${certData.certificateCode}`;
                    await emailService.sendCertificate(
                        reg.email,
                        reg.nome || 'Participante',
                        project.name,
                        certData.certificateCode,
                        validateUrl
                    );
                }
            }

            console.info(`Event certificate issued, user notified and email sent: ${user.name}`);
            return certificate;
        } catch (err) {
            console.error('Failed to issue event certificate:', err);
        }
    }

    /**
     * Tracks when a certificate is shared on social media
     */
    static async trackShare(certificateId: string) {
        try {
            const { data: cert } = await supabase
                .from('certificates')
                .select('social_share_count')
                .eq('id', certificateId)
                .maybeSingle();

            if (cert) {
                const currentCount = Number(cert.social_share_count) || 0;
                await supabase
                    .from('certificates')
                    .update({ 
                        social_share_count: currentCount + 1,
                        last_shared_at: new Date().toISOString()
                    } as never)
                    .eq('id', certificateId);
            }
        } catch (err) {
            console.error('Failed to track share:', err);
        }
    }
}
