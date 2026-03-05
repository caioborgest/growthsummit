
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://zczfutmymobgypbbamme.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU'
);

async function checkAuthUsers() {
    console.log('--- checking auth.users via admin api ---');
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    console.log(`Found ${data.users.length} users.`);
    data.users.forEach(u => {
        console.log(`- ${u.email} (id: ${u.id}, confirmed: ${!!u.email_confirmed_at})`);
    });

    // Check specific test user
    const testEmail = 'participante@test.com';
    const testUser = data.users.find(u => u.email === testEmail);
    if (!testUser) {
        console.log(`User ${testEmail} NOT FOUND!`);
    } else {
        console.log(`User ${testEmail} found with id ${testUser.id}`);
    }
}

checkAuthUsers();
