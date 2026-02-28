import { supabase } from './supabase';
import { issueCertificate, generateCertificatePDF } from './certificateGenerator';
import type { User, Project, Session, Certificate } from '@/types';

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
            const { data: existing } = await supabase
                .from('certificates')
                .select('id')
                .eq('user_id', user.id)
                .eq('session_id', session.id)
                .maybeSingle();

            if (existing) {
                console.log('Certificate already exists for this session');
                return;
            }

            // 2. Issuance Logic: For now, if they checked in, they get it.
            // In a real scenario, we might check if the session is over or 
            // if they stayed X% of the time, but for Triunfo, check-in = participation.

            const certData = await issueCertificate(user, project, 'lecture', session);

            const { error } = await supabase
                .from('certificates')
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

            console.log(`Certificate issued for ${user.name} - ${session.title}`);
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
        // Similar logic for overall event attendance
        const certData = await issueCertificate(user, project, 'event');

        const { error } = await supabase
            .from('certificates')
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
    }
}
