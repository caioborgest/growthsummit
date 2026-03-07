const fs = require('fs');
let c = fs.readFileSync('app/src/pages/dashboard/DashboardParticipante.tsx', 'utf8');
const original = c;
c = c.replace(/className="text-gray-500 text-xs mt-1\}>\{item\.desc\}/g, 'className="text-gray-500 text-xs mt-1">{item.desc}');
if (c !== original) {
    fs.writeFileSync('app/src/pages/dashboard/DashboardParticipante.tsx', c);
    console.log('Replaced successfully.');
} else {
    console.log('Nothing matched. The exact text might be slightly different.');
    // Try a looser regex
    c = c.replace(/mt-1\}>\{item\.desc\}/g, 'mt-1">{item.desc}');
    if (c !== original) {
        fs.writeFileSync('app/src/pages/dashboard/DashboardParticipante.tsx', c);
        console.log('Replaced with looser regex successfully.');
    } else {
        console.log('Still nothing matched.');
    }
}
