
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
    // Check for React.use, React.create, React.memo, React.forwardRef, React.createElement, etc.
    // Basically anything that looks like a method call or property access (lowercase or specific ones)
    const hasReactRuntimeRef = /\bReact\.(use|create|memo|forward|Component|Pure|Fragment|lazy|Suspense|StrictMode|Children|clone|isValid|profiler|startTransition|useId|useTransition|useDeferredValue|useInsertionEffect|useLayoutEffect|useSyncExternalStore)/i.test(content);
    const hasReactImport = /import\s+React\b/.test(content) || /import\s+\*\s+as\s+React\b/.test(content);
    
    if (hasReactRuntimeRef && !hasReactImport) {
        const lines = content.split('\n');
        let problematicLines = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (/\bReact\.(use|create|memo|forward|Component|Pure|Fragment|lazy|Suspense|StrictMode|Children|clone|isValid|profiler|startTransition|useId|useTransition|useDeferredValue|useInsertionEffect|useLayoutEffect|useSyncExternalStore)/i.test(line) 
                && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
                problematicLines.push(i + 1);
            }
        }
        if (problematicLines.length > 0) {
            issues.push({ file: filePath, lines: problematicLines });
        }
    }
  }
});

console.log(JSON.stringify(issues, null, 2));
