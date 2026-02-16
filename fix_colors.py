#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Script para substituir brand-yellow por brand-orange-coral"""

import os

file_path = r"c:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026\app\src\pages\public\GrowthExperienceTriunfo.tsx"

# Ler o arquivo
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Contar ocorrências antes
count_before = content.count('brand-yellow')
print(f"Encontradas {count_before} ocorrências de 'brand-yellow'")

# Substituir
content = content.replace('brand-yellow', 'brand-orange-coral')

# Contar ocorrências depois
count_after = content.count('brand-yellow')
print(f"Restam {count_after} ocorrências de 'brand-yellow'")

# Salvar
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✅ Substituição concluída! {count_before} ocorrências foram substituídas.")
