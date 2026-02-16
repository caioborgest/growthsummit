import os
import re

# Diretório raiz
root_dir = r"c:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026\app\src"

# Mapeamento de substituições
replacements = {
    'brand-yellow': 'brand-orange-coral',
    'yellow-500': 'orange-500',
    'yellow-400': 'orange-400',
    'yellow-600': 'orange-600',
    'from-yellow-400 to-yellow-600': 'from-orange-400 to-orange-600',
    'text-yellow': 'text-orange',
    'bg-yellow': 'bg-orange',
    'border-yellow': 'border-orange',
    'fill-yellow': 'fill-orange',
    'hover:bg-yellow': 'hover:bg-orange',
    'focus:border-yellow': 'focus:border-orange',
    "cor: 'yellow'": "cor: 'orange'",
    "color: 'yellow'": "color: 'orange'",
}

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        for old, new in replacements.items():
            content = content.replace(old, new)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ Atualizado: {filepath}")
            return True
        return False
    except Exception as e:
        print(f"✗ Erro em {filepath}: {e}")
        return False

# Percorrer todos os arquivos
updated_count = 0
for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css', '.jsx', '.js')):
            filepath = os.path.join(root, file)
            if replace_in_file(filepath):
                updated_count += 1

print(f"\n{'='*50}")
print(f"Total de arquivos atualizados: {updated_count}")
print(f"{'='*50}")
