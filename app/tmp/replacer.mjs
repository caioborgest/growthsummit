import fs from 'fs';
import path from 'path';

const files = [
    'scripts/sync_triunfo_ids.mjs',
    'scripts/sync_session_counts.sql',
    'scripts/seed_with_fetch.js',
    'scripts/seed_triunfo_programacao.ts',
    'scripts/seed_triunfo.mjs',
    'scripts/seed_programacao.sql',
    'scripts/global_fix.mjs',
    'scripts/check_triunfo_sessions.mjs',
    'tmp/check_cols.ts',
    'tmp/check_rls_perf.mjs',
    'tmp/fix_rpc.mjs',
    'tmp/list_tables.mjs',
    'tmp/migrate_programming.ts',
    'tmp/rename_to_english_v2.cjs',
    'tmp/setup_triunfo_full.mjs',
    'tmp/sync_programacao.mjs',
    'tmp/test_db_structure.mjs',
    'tmp/verify_sessions.mjs',
    'tmp/rename_to_english_final.cjs',
    'tmp/rename_to_english.js',
    'tmp/sync_dynamic.mjs',
    'tmp/check_db.mjs',
    'tmp/check_categories.mjs',
];

const migrationsPath = path.join(basePath, 'supabase/migrations');
if (fs.existsSync(migrationsPath)) {
    const migrationFiles = fs.readdirSync(migrationsPath).filter(f => f.endsWith('.sql'));
    migrationFiles.forEach(f => files.push(path.join('supabase/migrations', f)));
}

const basePath = process.argv[2] || '.';

files.forEach(file => {
    const fullPath = path.join(basePath, file);
    if (fs.existsSync(fullPath)) {
        console.log(`Processing ${fullPath}...`);
        const content = fs.readFileSync(fullPath, 'utf8');
        const updatedContent = content.replace(/programacao_evento/g, 'event_schedule');
        if (content !== updatedContent) {
            fs.writeFileSync(fullPath, updatedContent);
            console.log(`  Updated ${file}`);
        }
    } else {
        console.warn(`  File not found: ${fullPath}`);
    }
});
