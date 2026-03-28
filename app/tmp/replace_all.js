const fs = require('fs');
const path = require('path');

const rootDir = 'c:/Users/Cristiano D. Borges/Downloads/Plataforma Growth Summit 2026/app/src';

const replacements = [
  { search: /Growth Summit/g, replace: 'Growth Experience' },
  { search: /GROWTH SUMMIT/g, replace: 'GROWTH EXPERIENCE' },
  { search: /growth summit/g, replace: 'growth experience' },
  { search: /growthsummit\.site/g, replace: 'growthexperience.site' },
  { search: /growthsummit\.com\.br/g, replace: 'growthexperience.com.br' },
  { search: /growth_summit/g, replace: 'growth_experience' },
  { search: /GROWTH_SUMMIT/g, replace: 'GROWTH_EXPERIENCE' },
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file.match(/\.(ts|tsx|js|jsx|css|html|json|md)$/)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      for (const r of replacements) {
        if (r.search.test(content)) {
          content = content.replace(r.search, r.replace);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDir(rootDir);
console.log('Global replacement completed.');
