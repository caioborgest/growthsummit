@echo off
echo ========================================
echo CORRIGINDO ERRO REACT-HELMET
echo ========================================
echo.

cd /d "%~dp0app"

echo Instalando biblioteca faltante (react-helmet-async)...
call npm install react-helmet-async

echo.
echo Biblioteca instalada! Iniciando servidor...
echo.
echo Aguarde aparecer: "Local: http://localhost:5173/"
echo.

npm run dev

pause
