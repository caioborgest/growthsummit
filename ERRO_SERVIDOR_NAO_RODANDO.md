# 🚨 ERRO: Servidor Não Está Rodando
## ERR_CONNECTION_REFUSED

---

## ❌ PROBLEMA IDENTIFICADO

Você está tentando acessar:
```
http://localhost:5173/growth-experience-triunfo
```

Mas recebe o erro:
```
ERR_CONNECTION_REFUSED
Não é possível acessar esse site
A conexão com localhost foi recusada
```

**Causa**: O servidor de desenvolvimento **NÃO está rodando**!

---

## ✅ SOLUÇÃO: INICIAR O SERVIDOR

### **Passo a Passo Visual**

#### **1. Abrir Terminal no VS Code**

1. No VS Code, pressione: **`Ctrl + '`** (Ctrl + aspas simples)
   - Ou vá em: Menu → Terminal → New Terminal

2. Você verá o terminal aparecer na parte inferior

#### **2. Verificar Pasta Atual**

No terminal, digite:
```bash
cd
```

Pressione Enter.

**Você deve ver**:
```
C:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026
```

**Se estiver em outra pasta**, navegue para a pasta correta:
```bash
cd "C:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026"
```

#### **3. Entrar na Pasta `app`**

No terminal, digite:
```bash
cd app
```

Pressione Enter.

**Agora você deve estar em**:
```
C:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026\app
```

#### **4. Iniciar o Servidor**

No terminal, digite:
```bash
npm run dev
```

Pressione Enter.

#### **5. Aguardar o Servidor Iniciar**

Você verá várias mensagens aparecendo. Aguarde até ver:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

✅ **Pronto! Servidor rodando!**

#### **6. Acessar no Navegador**

Agora você pode acessar:
- **Home**: http://localhost:5173/
- **Growth Experience Triunfo**: http://localhost:5173/growth-experience-triunfo
- **Admin** (após login): http://localhost:5173/admin/growth-experience-triunfo

---

## 🎯 COMANDOS RESUMIDOS

```bash
# 1. Navegue para a pasta do projeto
cd "C:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026"

# 2. Entre na pasta app
cd app

# 3. Inicie o servidor
npm run dev

# 4. Aguarde aparecer: ➜  Local:   http://localhost:5173/

# 5. Acesse no navegador
```

---

## 🚨 ERROS COMUNS

### **Erro 1: "npm: command not found"**
**Causa**: Node.js não está instalado  
**Solução**: Instale o Node.js em https://nodejs.org/

### **Erro 2: "Cannot find module"**
**Causa**: Dependências não instaladas  
**Solução**:
```bash
cd app
npm install
npm run dev
```

### **Erro 3: "Port 5173 is already in use"**
**Causa**: Outro servidor já está usando a porta  
**Solução**:
- Feche o terminal anterior
- Ou use outra porta: `npm run dev -- --port 5174`

### **Erro 4: "ENOENT: no such file or directory"**
**Causa**: Você está na pasta errada  
**Solução**: Certifique-se de estar na pasta `app`
```bash
cd "C:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026\app"
```

---

## 📋 CHECKLIST

Antes de tentar acessar o site:

- [ ] Terminal aberto no VS Code
- [ ] Estou na pasta `app`
- [ ] Executei `npm run dev`
- [ ] Vi a mensagem "Local: http://localhost:5173/"
- [ ] O terminal ainda está rodando (não fechei)

**Se tudo OK**: ✅ Acesse http://localhost:5173/

---

## 💡 DICAS

### **Como Saber se o Servidor Está Rodando?**

1. **No Terminal**: Você vê a mensagem "Local: http://localhost:5173/"
2. **O Terminal está "travado"**: Não volta para o prompt (isso é normal!)
3. **Você NÃO pode digitar novos comandos**: O servidor está ocupando o terminal

### **Como Parar o Servidor?**

Pressione **`Ctrl + C`** no terminal onde o servidor está rodando.

### **Como Abrir um Novo Terminal?**

Se precisar executar outros comandos enquanto o servidor roda:
1. Clique no **`+`** no canto superior direito do terminal
2. Ou pressione **`Ctrl + Shift + '`**

---

## 🎬 PASSO A PASSO COMPLETO

### **Do Zero ao Servidor Rodando**

1. **Abra o VS Code**
2. **Abra a pasta do projeto**:
   - File → Open Folder
   - Selecione: `Plataforma Growth Summit 2026`
3. **Abra o Terminal**: `Ctrl + '`
4. **Digite**:
   ```bash
   cd app
   npm run dev
   ```
5. **Aguarde** aparecer: `Local: http://localhost:5173/`
6. **Acesse** no navegador: http://localhost:5173/growth-experience-triunfo

---

## ✅ RESULTADO ESPERADO

Quando tudo estiver certo:

1. ✅ Terminal mostra: `Local: http://localhost:5173/`
2. ✅ Navegador carrega a página sem erros
3. ✅ Você vê a página Growth Experience Triunfo
4. ✅ Seção de Exposição de Negócios aparece
5. ✅ Formulários funcionam

---

## 🆘 AINDA NÃO FUNCIONA?

Se mesmo seguindo todos os passos não funcionar:

1. **Tire um print do terminal** mostrando o erro
2. **Copie a mensagem de erro completa**
3. **Verifique**:
   - Node.js está instalado? (`node --version`)
   - npm está instalado? (`npm --version`)
   - Você está na pasta `app`? (`cd`)

---

**Siga os passos acima e o servidor vai iniciar! 🚀**
