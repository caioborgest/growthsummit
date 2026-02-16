const fs = require('fs');

const filePath = 'c:\\Users\\Cristiano D. Borges\\Downloads\\Plataforma Growth Summit 2026\\app\\src\\pages\\public\\GrowthExperienceTriunfo.tsx';

// Ler o arquivo
const content = fs.readFileSync(filePath, 'utf8');

// Contar ocorrências antes
const countBefore = (content.match(/brand-yellow/g) || []).length;
console.log(`Encontradas ${countBefore} ocorrências de 'brand-yellow'`);

// Substituir
const newContent = content.replace(/brand-yellow/g, 'brand-orange-coral');

// Contar ocorrências depois
const countAfter = (newContent.match(/brand-yellow/g) || []).length;
console.log(`Restam ${countAfter} ocorrências de 'brand-yellow'`);

// Salvar
fs.writeFileSync(filePath, newContent, 'utf8');

console.log(`✅ Substituição concluída! ${countBefore} ocorrências foram substituídas.`);
