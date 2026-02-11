@echo off
echo ========================================
echo LIMPEZA PROFUNDA E REINICIO - Growth Summit
echo ========================================
echo.

cd /d "%~dp0app"

echo 1. Parando processos Node.js...
taskkill /f /im node.exe
echo.

echo 2. Limpando cache do Vite...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo Cache .vite removido.
) else (
    echo Cache .vite nao encontrado (ok).
)
echo.

echo 3. Limpando cache do npm...
call npm cache clean --force
echo.

echo 4. Verificando node_modules...
if not exist "node_modules" (
    echo node_modules nao encontrado. Instalando...
    call npm install
) else (
    echo node_modules verificado.
)
echo.

echo 5. INICIANDO O SERVIDOR...
echo.
echo Aguarde aparecer: "Local: http://localhost:5173/"
echo.

npm run dev

pause
