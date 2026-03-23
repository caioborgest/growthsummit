
import fs from 'fs';
import path from 'path';

const srcDir = 'c:/Users/Cristiano D. Borges/Downloads/Plataforma Growth Summit 2026/app/src';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
};

const issues = [];

walk(srcDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasReactReference = /\bReact\./.test(content);
    const hasReactImport = /import\s+React\b/.test(content) || /import\s+\*\s+as\s+React\b/.test(content);
    
    if (hasReactReference && !hasReactImport) {
        // Double check if it's just in a comment
        const lines = content.split('\n');
        let realIssue = false;
        for (let line of lines) {
            if (line.includes('React.') && !line.trim().startsWith('//') && !line.trim().startsWith('/*')) {
                realIssue = true;
                break;
            }
        }
        if (realIssue) {
            issues.push(filePath);
        }
    }
  }
});

console.log(JSON.stringify(issues, null, 2));
