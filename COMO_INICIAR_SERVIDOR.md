# 🚀 GUIA RÁPIDO: Iniciar o Servidor
## Growth Experience Triunfo-PE

---

## ⚠️ PROBLEMA IDENTIFICADO

Você estava executando `npm run dev` na **pasta errada**!

### **Pasta Errada** ❌
```
C:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026\
```

### **Pasta Correta** ✅
```
C:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026\app\
```

---

## 🔧 COMO INICIAR O SERVIDOR

### **Opção 1: Terminal Integrado do VS Code** (Recomendado)

1. **Abra o Terminal no VS Code**:
   - Menu: `Terminal` → `New Terminal`
   - Ou pressione: `Ctrl + '` (Ctrl + aspas simples)

2. **Navegue para a pasta `app`**:
   ```bash
   cd app
   ```

3. **Inicie o servidor**:
   ```bash
   npm run dev
   ```

4. **Aguarde aparecer**:
   ```
   VITE v5.x.x  ready in xxx ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

5. **Acesse no navegador**:
   - http://localhost:5173/

---

### **Opção 2: Prompt de Comando (CMD)**

1. **Abra o CMD**:
   - Pressione `Win + R`
   - Digite: `cmd`
   - Pressione Enter

2. **Navegue para a pasta do projeto**:
   ```cmd
   cd "C:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026\app"
   ```

3. **Inicie o servidor**:
   ```cmd
   npm run dev
   ```

---

### **Opção 3: PowerShell**

1. **Abra o PowerShell**:
   - Pressione `Win + X`
   - Selecione "Windows PowerShell"

2. **Navegue para a pasta do projeto**:
   ```powershell
   cd "C:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026\app"
   ```

3. **Inicie o servidor**:
   ```powershell
   npm run dev
   ```

---

## ✅ VERIFICAR SE ESTÁ FUNCIONANDO

### **1. No Terminal**
Você deve ver algo como:
```
  VITE v5.4.11  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### **2. No Navegador**
1. Abra: http://localhost:5173/
2. Você deve ver a página inicial do Growth Summit

---

## 🌐 PÁGINAS PARA TESTAR

Após o servidor iniciar, teste estas URLs:

### **Página Pública**
- **Home**: http://localhost:5173/
- **Growth Experience Triunfo**: http://localhost:5173/growth-experience-triunfo

### **Painel Admin** (precisa fazer login)
- **Login**: http://localhost:5173/login
- **Dashboard Admin**: http://localhost:5173/admin
- **Growth Experience Admin**: http://localhost:5173/admin/growth-experience-triunfo

---

## 🚨 POSSÍVEIS ERROS

### **Erro: "Cannot find module"**
**Solução**: Instale as dependências
```bash
cd app
npm install
npm run dev
```

### **Erro: "Port 5173 is already in use"**
**Solução**: Outra instância já está rodando
- Feche o terminal anterior
- Ou use outra porta: `npm run dev -- --port 5174`

### **Erro: "ENOENT: no such file or directory"**
**Solução**: Você está na pasta errada
```bash
# Verifique onde você está
pwd  # ou cd (no Windows)

# Navegue para a pasta correta
cd "C:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026\app"
```

---

## 📋 CHECKLIST

Antes de iniciar o servidor:

- [ ] Estou na pasta `app`? (não na raiz do projeto)
- [ ] As dependências estão instaladas? (`node_modules` existe?)
- [ ] O arquivo `package.json` existe na pasta atual?
- [ ] Nenhum outro servidor está rodando na porta 5173?

---

## 💡 DICAS

### **Verificar Pasta Atual**
```bash
# Windows (CMD)
cd

# Windows (PowerShell) ou Linux/Mac
pwd
```

Deve mostrar:
```
C:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026\app
```

### **Listar Arquivos**
```bash
# Windows
dir

# Linux/Mac
ls
```

Você deve ver:
- `package.json` ✅
- `vite.config.ts` ✅
- `src/` ✅
- `node_modules/` ✅

### **Parar o Servidor**
Pressione `Ctrl + C` no terminal

---

## 🎯 RESUMO RÁPIDO

```bash
# 1. Navegue para a pasta app
cd "C:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026\app"

# 2. Inicie o servidor
npm run dev

# 3. Acesse no navegador
# http://localhost:5173/
```

---

## ✅ APÓS INICIAR

Quando o servidor estiver rodando:

1. ✅ Acesse: http://localhost:5173/growth-experience-triunfo
2. ✅ Teste os formulários
3. ✅ Verifique a seção de Exposição de Negócios
4. ✅ Faça login no admin
5. ✅ Acesse: http://localhost:5173/admin/growth-experience-triunfo
6. ✅ Veja as estatísticas

---

**Servidor pronto para uso! 🚀**
