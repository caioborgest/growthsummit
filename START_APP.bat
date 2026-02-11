@echo off
echo ========================================
echo INICIANDO PLATAFORMA GROWTH SUMMIT 2026
echo ========================================
echo.

cd /d "%~dp0app"

echo 1. Verificando node_modules...
if not exist "node_modules" (
    echo Instalando dependencias (isso pode demorar na primeira vez)...
    call npm install
)

echo 2. Limpando cache do Vite para evitar erros antigos...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"

echo 3. Iniciando servidor de desenvolvimento...
echo.
echo Aguarde a mensagem "Local: http://localhost:5173/"
echo.

call npm run dev
pause
