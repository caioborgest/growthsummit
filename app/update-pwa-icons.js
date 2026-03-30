/**
 * Script para atualizar todos os ícones do PWA com o favicon oficial
 * do Growth Experience a partir do Supabase.
 * 
 * Execute: node update-pwa-icons.js
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const FAVICON_URL = 'https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/favicon.png';

const ICON_PATHS = [
  'public/favicon.png',
  'public/apple-touch-icon.png',
  'public/icons/icon-72x72.png',
  'public/icons/icon-96x96.png',
  'public/icons/icon-128x128.png',
  'public/icons/icon-144x144.png',
  'public/icons/icon-152x152.png',
  'public/icons/icon-192x192.png',
  'public/icons/icon-384x384.png',
  'public/icons/icon-512x512.png',
  'public/icons/maskable-icon.png',
  'public/images/GrowthSummit-icone-PWA.png',
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const dest = path.resolve(__dirname, destPath);
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlink(dest, () => {});
        downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        const size = fs.statSync(dest).size;
        console.log(`✅ ${destPath} (${size} bytes)`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      console.error(`❌ Erro ao baixar ${destPath}:`, err.message);
      reject(err);
    });
  });
}

async function main() {
  console.log('🚀 Baixando favicon do Growth Experience...\n');
  
  // Download once
  const tmpPath = 'public/favicon_tmp.png';
  try {
    await downloadFile(FAVICON_URL, tmpPath);
    
    // Copy to all destinations
    const src = path.resolve(__dirname, tmpPath);
    for (const destPath of ICON_PATHS) {
      const dest = path.resolve(__dirname, destPath);
      const dir = path.dirname(dest);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.copyFileSync(src, dest);
      const size = fs.statSync(dest).size;
      console.log(`📋 ${destPath} (${size} bytes)`);
    }
    
    // Remove tmp
    fs.unlinkSync(src);
    
    console.log('\n✨ Todos os ícones PWA foram atualizados com sucesso!');
    console.log('   Reinicie o servidor de desenvolvimento para aplicar as mudanças.\n');
  } catch (err) {
    console.error('\n❌ Falha ao baixar o favicon:', err.message);
    console.error('   Tente baixar manualmente de:', FAVICON_URL);
    console.error('   E substitua os arquivos em public/favicon.png e public/icons/*.png');
  }
}

main();
