const fs = require('fs');
const file = 'app/src/pages/dashboard/DashboardParticipante.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = '{item.desc}</p>';
const wrongLine = 'text-gray-500 text-xs mt-1}>{item.desc}</p>';
const rightLine = 'text-gray-500 text-xs mt-1">{item.desc}</p>';

if (content.includes(wrongLine)) {
    content = content.replace(wrongLine, rightLine);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed syntax error!');
} else {
    console.log('Target line not found in the file.');
}
