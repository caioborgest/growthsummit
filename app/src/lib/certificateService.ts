import { supabase } from './supabase';
import { issueCertificate } from './certificateGenerator';
import type { User, Project, Session } from '@/types';

/**
 * Service to handle automatic certificate issuance
 */
export class CertificateService {
    /**
     * Checks if a user is eligible for a certificate and issues it if they are
     */
    static async checkAndIssueSessionCertificate(
        user: User,
        project: Project,
        session: Session,
        registrationId: string
    ) {
        try {
            // 1. Check if certificate already exists
            const { data: existing } = await (supabase
                .from('certificados' as any) as any)
                .select('id')
                .eq('user_id', user.id)
                .eq('session_id', session.id)
                .maybeSingle();

            if (existing) {
                console.info('Certificate already exists for this session');
                return;
            }

            // 2. Issuance Logic: Check if they checked into this activity
            // We use the new check_ins_atividades table
            const { data: attendance, error: attendanceError } = await (supabase
                .from('check_ins_atividades' as any) as any)
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
            const { error } = await (supabase
                .from('certificados' as any) as any)
                .insert({
                    project_id: project.id,
                    user_id: user.id,
                    registration_id: registrationId,
                    session_id: session.id,
                    type: 'lecture',
                    code: certData.certificateCode,
                    metadata: {
                        session_title: session.title,
                        room: session.room
                    }
                });

            if (error) throw error;

            console.info(`Certificate issued for ${user.name} - ${session.title}`);
        } catch (err) {
            console.error('Failed to issue certificate:', err);
        }
    }

    /**
     * Issues the main event participation certificate
     */
    static async issueEventCertificate(
        user: User,
        project: Project,
        registrationId: string
    ) {
        try {
            // Check if already exists
            const { data: existing } = await (supabase
                .from('certificados' as any) as any)
                .select('id')
                .eq('user_id', user.id)
                .eq('registration_id', registrationId)
                .eq('type', 'event')
                .maybeSingle();

            if (existing) return;

            const certData = await issueCertificate(user, project, 'event');

            const { error } = await (supabase
                .from('certificados' as any) as any)
                .insert({
                    project_id: project.id,
                    user_id: user.id,
                    registration_id: registrationId,
                    type: 'event',
                    code: certData.certificateCode,
                    metadata: {
                        event_name: project.name,
                        total_hours: 12 // Example
                    }
                });

            if (error) throw error;
        } catch (err) {
            console.error('Failed to issue event certificate:', err);
        }
    }
}
