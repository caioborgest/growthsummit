import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/Cristiano D. Borges/Downloads/Plataforma Growth Summit 2026/app/supabase';
const migrationsDir = path.join(baseDir, 'migrations');
const outputFile = 'c:/Users/Cristiano D. Borges/Downloads/Plataforma Growth Summit 2026/migracao_completa_growth_summit.sql';

const files = [
  path.join(baseDir, 'schema.sql'),
  ...fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort().map(f => path.join(migrationsDir, f)),
  path.join(baseDir, 'seeds.sql')
];

let fullSql = '-- ============================================================\n';
fullSql += '-- GROWTH SUMMIT 2026 - MIGRACAO COMPLETA E UNICA\n';
fullSql += `-- Gerado em: ${new Date().toISOString()}\n`;
fullSql += '-- ============================================================\n\n';

for (const file of files) {
  if (fs.existsSync(file)) {
    console.log(`Adding ${file}...`);
    fullSql += `\n\n-- ARCHIVE: ${path.basename(file)}\n`;
    fullSql += '-- ============================================================\n';
    fullSql += fs.readFileSync(file, 'utf8');
    fullSql += '\n\n';
  } else {
    console.warn(`File not found: ${file}`);
  }
}

fs.writeFileSync(outputFile, fullSql);
console.log(`Success! File created at: ${outputFile}`);
