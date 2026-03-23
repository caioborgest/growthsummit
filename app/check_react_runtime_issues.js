
import fs from 'fs';
import path from 'path';

const srcDir = 'c:/Users/Cristiano D. Borges/Downloads/Plataforma Growth Summit 2026/app/src';

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
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
    const hasReactReference = /\bReact\.[a-z]/.test(content); // Use lowercase to catch hooks like useEffect, useMemo, etc.
    const hasReactImport = /import\s+React\b/.test(content) || /import\s+\*\s+as\s+React\b/.test(content);
    
    if (hasReactReference && !hasReactImport) {
        // Double check if it's just in a comment
        const lines = content.split('\n');
        let realIssueLines = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (/\bReact\.[a-z]/.test(line) && !line.trim().startsWith('//') && !line.trim().startsWith('*') && !line.trim().startsWith('/*')) {
                realIssueLines.push(i + 1);
            }
        }
        if (realIssueLines.length > 0) {
            issues.push({ file: filePath, lines: realIssueLines });
        }
    }
  }
});

console.log(JSON.stringify(issues, null, 2));
