@echo off
echo ========================================
echo INICIANDO SERVIDOR - Growth Summit 2026
echo ========================================
echo.

cd /d "%~dp0app"

echo Pasta atual: %CD%
echo.

echo Verificando Node.js...
node --version
echo.

echo Verificando npm...
npm --version
echo.

echo Iniciando servidor de desenvolvimento...
echo.
echo Aguarde aparecer: "Local:http://localhost:5173/" 
echo.

npm run dev

pause
