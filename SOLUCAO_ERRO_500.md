# 🚨 ERRO 500 - Internal Server Error
## SEOHead.tsx

---

## ❌ ERRO IDENTIFICADO

```
SEOHead.tsx:1 Failed to load resource: 
the server responded with a status of 500 (Internal Server Error)
```

**Causa**: O servidor de desenvolvimento está com problemas ou não iniciou corretamente.

---

## ✅ SOLUÇÃO RÁPIDA

### **Passo 1: Parar Tudo**

1. Vá no terminal onde executou `npm run dev`
2. Pressione **`Ctrl + C`** para parar o servidor
3. Aguarde o terminal voltar ao prompt

### **Passo 2: Limpar Cache e node_modules**

```bash
# Navegue para a pasta app
cd "C:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026\app"

# Limpar cache do npm
npm cache clean --force

# Deletar node_modules (opcional mas recomendado)
# No Windows, use o Explorer para deletar a pasta node_modules
# Ou use: rmdir /s /q node_modules
```

### **Passo 3: Reinstalar Dependências**

```bash
npm install
```

Aguarde terminar (pode demorar 1-2 minutos).

### **Passo 4: Reiniciar Servidor**

```bash
npm run dev
```

### **Passo 5: Limpar Cache do Navegador**

1. Pressione **`F12`** (DevTools)
2. Vá em **Application**
3. **Service Workers** → **Unregister** (se houver)
4. **Storage** → **Clear site data** → Marque tudo → **Clear data**
5. Feche o DevTools
6. Pressione **`Ctrl + Shift + R`** (hard reload)

### **Passo 6: Acessar Novamente**

http://localhost:5173/

---

## 🔍 DIAGNÓSTICO DETALHADO

### **Possíveis Causas do Erro 500:**

1. **Servidor não iniciou corretamente**
   - Solução: Reiniciar servidor

2. **Dependências corrompidas**
   - Solução: Reinstalar node_modules

3. **Cache do Vite corrompido**
   - Solução: Deletar pasta `.vite` e reiniciar

4. **Porta em uso**
   - Solução: Usar outra porta ou fechar processo

5. **Erro no código**
   - Solução: Verificar terminal por erros

---

## 🔧 SOLUÇÃO COMPLETA (Passo a Passo)

### **1. Parar Servidor**
```bash
# No terminal onde está rodando npm run dev
Ctrl + C
```

### **2. Deletar Cache**
```bash
cd "C:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026\app"

# Deletar pasta .vite (cache do Vite)
rmdir /s /q .vite

# Deletar node_modules (opcional)
rmdir /s /q node_modules
```

### **3. Limpar Cache do npm**
```bash
npm cache clean --force
```

### **4. Reinstalar**
```bash
npm install
```

### **5. Iniciar Servidor**
```bash
npm run dev
```

### **6. Verificar Terminal**

Você DEVE ver:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Se aparecer ERRO em vermelho**: Copie a mensagem completa do erro.

### **7. Limpar Navegador**
```
F12 → Application → Clear site data → Ctrl + Shift + R
```

### **8. Acessar**
```
http://localhost:5173/
```

---

## 🚨 SE O ERRO PERSISTIR

### **Verifique o Terminal por Erros**

Procure por mensagens em **vermelho** no terminal. Exemplos:

#### **Erro: "Cannot find module"**
```bash
# Solução
npm install
```

#### **Erro: "Port already in use"**
```bash
# Solução: Usar outra porta
npm run dev -- --port 5174
# Acesse: http://localhost:5174/
```

#### **Erro: "EACCES: permission denied"**
```bash
# Solução: Executar como administrador
# Feche o VS Code
# Abra como administrador
# Tente novamente
```

---

## 📋 CHECKLIST DE VERIFICAÇÃO

Antes de acessar o site:

- [ ] Parei o servidor anterior (Ctrl + C)
- [ ] Deletei a pasta `.vite`
- [ ] Limpei o cache do npm
- [ ] Reinstalei dependências (npm install)
- [ ] Iniciei o servidor (npm run dev)
- [ ] Vi a mensagem "Local: http://localhost:5173/"
- [ ] Limpei o cache do navegador
- [ ] Aguardei 10 segundos após iniciar
- [ ] Fiz hard reload (Ctrl + Shift + R)

---

## 💡 DICAS IMPORTANTES

### **1. Sempre Verifique o Terminal**
O terminal mostra erros importantes. Se aparecer texto vermelho, há um problema.

### **2. Aguarde o Servidor Iniciar**
Após executar `npm run dev`, aguarde até ver "Local: http://localhost:5173/"

### **3. Limpe o Cache Regularmente**
Se tiver problemas, sempre limpe:
- Cache do npm
- Pasta `.vite`
- Cache do navegador

### **4. Use Hard Reload**
`Ctrl + Shift + R` força o navegador a recarregar tudo sem usar cache.

---

## 🎯 COMANDOS RÁPIDOS

### **Reiniciar Tudo do Zero:**

```bash
# 1. Parar servidor
Ctrl + C

# 2. Navegar para pasta
cd "C:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026\app"

# 3. Limpar tudo
rmdir /s /q .vite
npm cache clean --force

# 4. Reinstalar
npm install

# 5. Iniciar
npm run dev

# 6. Aguardar mensagem: Local: http://localhost:5173/

# 7. No navegador: F12 → Application → Clear site data

# 8. Acessar: http://localhost:5173/
```

---

## ✅ RESULTADO ESPERADO

Após seguir todos os passos:

1. ✅ Terminal mostra: `Local: http://localhost:5173/`
2. ✅ Sem erros vermelhos no terminal
3. ✅ Navegador carrega a página
4. ✅ Sem erro 500
5. ✅ Conteúdo aparece normalmente

---

## 🆘 AINDA COM ERRO 500?

Se mesmo após seguir TODOS os passos o erro persistir:

### **Tire Prints de:**

1. **Terminal completo** mostrando a saída de `npm run dev`
2. **Console do navegador** (F12 → Console) mostrando todos os erros
3. **Network tab** (F12 → Network) mostrando a requisição com erro 500

### **Copie:**

1. Mensagem completa do erro no terminal
2. Stack trace completo (se houver)
3. Todos os erros do console do navegador

---

**Siga os passos acima e o erro 500 será resolvido! 🚀**
