import fs from 'fs';
import path from 'path';

function findFiles(dir, files = []) {
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                findFiles(fullPath, files);
            }
        } else if (fullPath.endsWith('.tsx')) {
            files.push(fullPath);
        }
    }
    return files;
}

const allFiles = findFiles('app');
const issues = [];

for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('<Button') && !content.includes('import { Button }')) {
        issues.push(file);
    }
}

console.log(JSON.stringify(issues, null, 2));
