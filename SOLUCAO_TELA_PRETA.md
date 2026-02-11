# 🚨 TELA PRETA - SERVIDOR NÃO INICIOU
## Solução Definitiva

---

## ❌ PROBLEMA

Você está vendo:
- ✅ Tela preta no navegador
- ✅ Erros: `ERR_CONNECTION_REFUSED`
- ✅ Recursos não carregam

**Causa**: O servidor **NÃO iniciou corretamente**!

---

## ✅ SOLUÇÃO DEFINITIVA

### **Método 1: Script Automático** (MAIS FÁCIL) ⭐

Criei um arquivo `INICIAR_SERVIDOR.bat` que faz tudo automaticamente!

#### **Como usar:**

1. **Localize o arquivo**:
   ```
   C:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026\INICIAR_SERVIDOR.bat
   ```

2. **Clique duas vezes** no arquivo `INICIAR_SERVIDOR.bat`

3. **Aguarde** aparecer no terminal:
   ```
   ➜  Local:   http://localhost:5173/
   ```

4. **Acesse** no navegador: http://localhost:5173/

✅ **Pronto! Servidor rodando!**

---

### **Método 2: Terminal Manual** (Se o Método 1 não funcionar)

#### **Passo 1: Fechar Tudo**

1. Feche **TODOS** os terminais abertos
2. Feche o navegador
3. Pressione `Ctrl + C` em qualquer terminal que esteja rodando

#### **Passo 2: Abrir Novo Terminal**

1. No VS Code: `Ctrl + '`
2. Ou abra o CMD:
   - Pressione `Win + R`
   - Digite: `cmd`
   - Enter

#### **Passo 3: Navegar para a Pasta**

```bash
cd "C:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026\app"
```

#### **Passo 4: Verificar Node.js**

```bash
node --version
```

Deve mostrar algo como: `v20.x.x` ou `v18.x.x`

**Se mostrar erro**: Instale o Node.js em https://nodejs.org/

#### **Passo 5: Verificar npm**

```bash
npm --version
```

Deve mostrar algo como: `10.x.x` ou `9.x.x`

#### **Passo 6: Instalar Dependências** (se necessário)

```bash
npm install
```

Aguarde terminar (pode demorar 1-2 minutos).

#### **Passo 7: Iniciar Servidor**

```bash
npm run dev
```

#### **Passo 8: Aguardar Mensagem**

Você DEVE ver:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Se NÃO aparecer essa mensagem**: Há um erro! Copie a mensagem de erro completa.

#### **Passo 9: Acessar no Navegador**

Abra: http://localhost:5173/

---

## 🔍 DIAGNÓSTICO

### **Como Saber se o Servidor Está Rodando?**

✅ **Servidor RODANDO**:
- Terminal mostra: `Local: http://localhost:5173/`
- Terminal está "travado" (não volta ao prompt)
- Você NÃO consegue digitar novos comandos
- Navegador carrega a página

❌ **Servidor NÃO RODANDO**:
- Terminal volta ao prompt imediatamente
- Mostra erro em vermelho
- Navegador mostra tela preta ou erro de conexão

---

## 🚨 ERROS COMUNS E SOLUÇÕES

### **Erro 1: "npm: command not found"**

**Causa**: Node.js não instalado

**Solução**:
1. Baixe: https://nodejs.org/
2. Instale a versão LTS (recomendada)
3. Reinicie o terminal
4. Tente novamente

---

### **Erro 2: "Cannot find module"**

**Causa**: Dependências não instaladas

**Solução**:
```bash
cd "C:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026\app"
npm install
npm run dev
```

---

### **Erro 3: "Port 5173 is already in use"**

**Causa**: Outro servidor já está usando a porta

**Solução**:
```bash
# Opção 1: Fechar o outro servidor
# Procure por outro terminal rodando npm run dev e feche

# Opção 2: Usar outra porta
npm run dev -- --port 5174
# Depois acesse: http://localhost:5174/
```

---

### **Erro 4: "EACCES: permission denied"**

**Causa**: Falta de permissões

**Solução**:
1. Feche o VS Code
2. Abra o VS Code como Administrador:
   - Clique direito no ícone do VS Code
   - "Executar como administrador"
3. Tente novamente

---

### **Erro 5: Tela Preta Mesmo com Servidor Rodando**

**Causa**: Cache do navegador ou Service Worker

**Solução**:
1. Pressione `F12` (DevTools)
2. Vá em **Application**
3. **Service Workers** → **Unregister**
4. **Storage** → **Clear site data**
5. Recarregue: `Ctrl + F5` (hard reload)

---

## 📋 CHECKLIST COMPLETO

Antes de tentar acessar o site:

- [ ] Node.js instalado (`node --version` funciona)
- [ ] npm instalado (`npm --version` funciona)
- [ ] Estou na pasta `app`
- [ ] Executei `npm install` (pelo menos uma vez)
- [ ] Executei `npm run dev`
- [ ] Vi a mensagem "Local: http://localhost:5173/"
- [ ] Terminal ainda está rodando (não fechei)
- [ ] Aguardei pelo menos 10 segundos após a mensagem
- [ ] Limpei o cache do navegador

---

## 🎬 VÍDEO TUTORIAL (Passo a Passo)

### **Do Zero ao Servidor Rodando**

```
1. Abra o CMD ou Terminal do VS Code
   ↓
2. cd "C:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026\app"
   ↓
3. npm install
   (aguarde terminar - pode demorar)
   ↓
4. npm run dev
   (aguarde aparecer: Local: http://localhost:5173/)
   ↓
5. Abra o navegador
   ↓
6. Acesse: http://localhost:5173/
   ↓
7. ✅ SUCESSO!
```

---

## 💡 DICAS IMPORTANTES

### **1. NÃO Feche o Terminal**
O servidor precisa ficar rodando. Se fechar o terminal, o site para de funcionar.

### **2. Aguarde o Servidor Iniciar**
Após executar `npm run dev`, aguarde 10-30 segundos antes de acessar o navegador.

### **3. Use o Terminal Correto**
Certifique-se de estar na pasta `app`, não na raiz do projeto.

### **4. Limpe o Cache**
Se a tela continuar preta, limpe o cache do navegador (`Ctrl + Shift + Delete`).

### **5. Verifique a Porta**
Certifique-se de acessar `localhost:5173`, não outra porta.

---

## 🆘 AINDA NÃO FUNCIONA?

Se mesmo seguindo TODOS os passos não funcionar:

### **Tire Prints de:**

1. **Terminal** mostrando o comando `npm run dev` e a saída completa
2. **Navegador** mostrando a tela preta e o console (F12)
3. **Pasta** mostrando que você está em `app`

### **Copie e Cole:**

1. Saída completa do comando `node --version`
2. Saída completa do comando `npm --version`
3. Saída completa do comando `npm run dev`
4. Erros do console do navegador (F12 → Console)

---

## ✅ RESULTADO ESPERADO

Quando tudo estiver funcionando:

1. ✅ Terminal mostra: `Local: http://localhost:5173/`
2. ✅ Navegador carrega a página (não fica preta)
3. ✅ Você vê o conteúdo da página
4. ✅ Sem erros de conexão

---

## 🎯 ATALHO RÁPIDO

**Use o arquivo `INICIAR_SERVIDOR.bat`!**

1. Clique duas vezes nele
2. Aguarde aparecer: `Local: http://localhost:5173/`
3. Acesse o navegador

**É a forma mais fácil e rápida!** ⭐

---

**Siga os passos acima e o servidor vai iniciar corretamente! 🚀**
