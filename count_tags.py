
with open(r'c:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026\app\src\pages\dashboard\DashboardParticipante.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
    
print(f"Open <div: {content.count('<div')}")
print(f"Close </div>: {content.count('</div>')}")
print(f"Open (: {content.count('(')}")
print(f"Close ): {content.count(')')}")
print(f"Open {{: {content.count('{')}")
print(f"Close }}: {content.count('}')}")
