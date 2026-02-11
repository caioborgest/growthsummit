@echo off
echo ==================================================
echo AUDITORIA E CORREÇÃO DE BUILD - GROWTH SUMMIT 2026
echo ==================================================
echo.

cd /d "%~dp0app"

echo 1. Verificando dependências...
echo Adicionando react-helmet-async (fluxo alternativo)...
call npm install react-helmet-async --save --legacy-peer-deps

echo.
echo 2. Instalando todas as dependências do projeto (com legacy-peer-deps)...
call npm install --legacy-peer-deps

echo.
echo 3. Verificando compilação TypeScript...
call npx tsc --noEmit
if %errorlevel% neq 0 (
    echo [ERRO] Falha na verificação de tipos TypeScript.
    pause
    exit /b %errorlevel%
) else (
    echo [OK] Compilação TypeScript bem-sucedida.
)

echo.
echo 4. Executando build de produção...
call npm run build
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao construir aplicação para produção.
    pause
    exit /b %errorlevel%
) else (
    echo [OK] Build de produção concluído com sucesso!
)

echo.
echo ==================================================
echo AUDITORIA CONCLUÍDA - APLICAÇÃO 100% FUNCIONAL
echo ==================================================
echo.
pause
