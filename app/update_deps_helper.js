const { execSync } = require('child_process');
const fs = require('fs');

try {
    console.log('Running npm update...');
    const output = execSync('npm update', { encoding: 'utf8' });
    fs.writeFileSync('c:/Users/Cristiano D. Borges/Downloads/Plataforma Growth Summit 2026/app/npm_update_output.txt', output);
    console.log('Update finished.');
} catch (error) {
    fs.writeFileSync('c:/Users/Cristiano D. Borges/Downloads/Plataforma Growth Summit 2026/app/npm_update_error.txt', error.toString());
    if (error.stdout) fs.writeFileSync('c:/Users/Cristiano D. Borges/Downloads/Plataforma Growth Summit 2026/app/npm_update_stdout.txt', error.stdout);
    if (error.stderr) fs.writeFileSync('c:/Users/Cristiano D. Borges/Downloads/Plataforma Growth Summit 2026/app/npm_update_stderr.txt', error.stderr);
    console.error('Error running update:', error);
}
