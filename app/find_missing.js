
import fs from 'fs';
import path from 'path';

const srcDir = './src';

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
};

const missingImport = [];

walk(srcDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasReactObjectRef = /\bReact\./.test(content);
    const hasReactImport = /import\s+React\b/.test(content) || /import\s+\*\s+as\s+React\b/.test(content);
    
    if (hasReactObjectRef && !hasReactImport) {
        missingImport.push(filePath);
    }
  }
});

fs.writeFileSync('missing.json', JSON.stringify(missingImport, null, 2));
