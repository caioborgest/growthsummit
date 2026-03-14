const { execSync } = require('child_process');
const fs = require('fs');

try {
    console.log('Running npm install...');
    const output = execSync('npm install --prefer-offline --no-audit', { encoding: 'utf8' });
    fs.writeFileSync('c:/Users/Cristiano D. Borges/Downloads/Plataforma Growth Summit 2026/app/npm_install_output.txt', output);
    console.log('Install finished.');
} catch (error) {
    fs.writeFileSync('c:/Users/Cristiano D. Borges/Downloads/Plataforma Growth Summit 2026/app/npm_install_error.txt', error.toString());
    if (error.stdout) fs.writeFileSync('c:/Users/Cristiano D. Borges/Downloads/Plataforma Growth Summit 2026/app/npm_install_stdout.txt', error.stdout);
    if (error.stderr) fs.writeFileSync('c:/Users/Cristiano D. Borges/Downloads/Plataforma Growth Summit 2026/app/npm_install_stderr.txt', error.stderr);
    console.error('Error running install:', error);
}
