
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://zczfutmymobgypbbamme.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU'
);

async function createTestUser() {
    const email = 'test@example.com';
    const password = 'growth2026';

    console.log(`Creating user ${email}...`);
    const { data: { user }, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'admin', name: 'Test Admin' }
    });

    if (error) {
        console.error('Error creating user:', error);
    } else {
        console.log('User created successfully:', user.id);

        // Try to sign in with this user to verify
        console.log('Testing sign in...');
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (signInError) {
            console.error('Sign in failed for NEW user:', signInError.message);
        } else {
            console.log('Sign in SUCCESSFUL for NEW user!');
        }
    }
}

createTestUser();
