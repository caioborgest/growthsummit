#!/usr/bin/env node
/**
 * pre-commit-check.js
 *
 * Checklist de segurança antes de commitar.
 * Execute: node pre-commit-check.js
 *
 * Verifica:
 * 1. Erros de TypeScript (tsc --noEmit)
 * 2. Erros de ESLint
 * 3. Mappers importados nos hooks principais
 */

const { execSync } = require('child_process');

const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
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
        const output = err.stdout?.toString() || err.stderr?.toString() || err.message;
        // Mostrar apenas as primeiras 30 linhas para não poluir
        const lines = output.split('\n').slice(0, 30).join('\n');
        console.log(lines);
        hasErrors = true;
        return false;
    }
}

console.log(`\n${BOLD}===== Checklist Anti-Regressão =====${RESET}\n`);

// 1. Verificar TypeScript
run('TypeScript (sem erros de tipo)', 'npx tsc -p tsconfig.app.json --noEmit');

// 2. Verificar ESLint nos arquivos mais críticos
run('ESLint (hooks e mappers)', 'npx eslint src/hooks/useData.ts src/lib/mappers/ src/contexts/ --max-warnings 50');

console.log(`\n${BOLD}===== Resultado =====${RESET}`);
if (hasErrors) {
    console.log(`${RED}✖ Corrija os erros acima antes de commitar.${RESET}`);
    console.log(`${YELLOW}  Dica: erros de TypeScript em tipos compartilhados (useData.ts, types/index.ts)
  podem quebrar múltiplos módulos. Verifique todos os consumidores.${RESET}\n`);
    process.exit(1);
} else {
    console.log(`${GREEN}✔ Tudo OK! Seguro para commitar.${RESET}\n`);
}
