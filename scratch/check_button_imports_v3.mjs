import fs from 'fs';
import path from 'path';

function findFiles(dir, files = []) {
    try {
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
    } catch (e) {}
    return files;
}

const allFiles = findFiles('app');
const issues = [];

for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    // Case sensitive check for <Button usage
    if (content.includes('<Button')) {
        // Check if Button is imported from @/components/ui/button
        // Using a more flexible regex for the import
        const hasImport = /import\s+\{.*Button.*\}\s+from\s+['"]@\/components\/ui\/button['"]/.test(content);
        if (!hasImport) {
            // Check if it's imported at all (maybe from another path, though @/comp is standard here)
            const importedAtAll = /import\s+.*Button/.test(content);
            if (!importedAtAll) {
                issues.push(file);
            }
        }
    }
}

console.log(JSON.stringify(issues, null, 2));
