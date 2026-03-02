#!/usr/bin/env node
/**
 * pre-commit-check.cjs
 *
 * Checklist de segurança antes de commitar.
 * Execute: node pre-commit-check.cjs
 */

const { execSync } = require('child_process');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

let hasErrors = false;

function run(label, cmd) {
    process.stdout.write(`${BOLD}▶ ${label}...${RESET} `);
    try {
        execSync(cmd, { stdio: 'pipe', cwd: __dirname });
        console.log(`${GREEN}✔ OK${RESET}`);
        return true;
    } catch (err) {
        console.log(`${RED}✖ FALHOU${RESET}`);
        const output = (err.stdout || err.stderr || '').toString();
        const lines = output.split('\n').slice(0, 30).join('\n');
        console.log(lines);
        hasErrors = true;
        return false;
    }
}

console.log(`\n${BOLD}===== Checklist Anti-Regressão =====${RESET}\n`);

run('TypeScript (sem erros de tipo)', 'npx tsc -p tsconfig.app.json --noEmit');
run('ESLint (hooks e mappers críticos)',
    'npx eslint src/hooks/useData.ts src/lib/mappers/ src/contexts/AuthContext.tsx src/contexts/ProjectContext.tsx --max-warnings 50');

console.log(`\n${BOLD}===== Resultado =====${RESET}`);
if (hasErrors) {
    console.log(`${RED}✖ Corrija os erros acima antes de commitar.${RESET}`);
    console.log(`${YELLOW}  Dica: erros em tipos compartilhados (types/index.ts, useData.ts) podem
  quebrar múltiplos módulos. Verifique todos os consumidores após corrigir.${RESET}\n`);
    process.exit(1);
} else {
    console.log(`${GREEN}✔ Tudo OK! Seguro para commitar.${RESET}\n`);
}
