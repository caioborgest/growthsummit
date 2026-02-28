
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zczfutmymobgypbbamme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU';
const supabase = createClient(supabaseUrl, supabaseKey);

const TARGET_ID = '550e8400-e29b-41d4-a716-446655440000';

async function deleteProject() {
    console.log(`Tentando excluir o projeto: ${TARGET_ID}...`);

    const { data, error } = await supabase
        .from('projects')
        .delete()
        .eq('id', TARGET_ID)
        .select();

    if (error) {
        console.error('Erro ao excluir projeto:', JSON.stringify(error, null, 2));
    } else {
        if (data && data.length > 0) {
            console.log('Projeto excluído com sucesso:', JSON.stringify(data, null, 2));
        } else {
            console.log('Nenhum projeto encontrado com este ID ou já foi excluído.');
        }
    }
}

deleteProject();
