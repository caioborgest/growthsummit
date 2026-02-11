@echo off
echo ========================================
echo SUBSTITUINDO CONSOLE.* POR LOGGER.*
echo ========================================
echo.

cd /d "%~dp0app\src"

echo Substituindo em usePWA.ts...
powershell -Command "(Get-Content 'hooks\usePWA.ts') -replace 'console\.log', 'logger.log' | Set-Content 'hooks\usePWA.ts'"

echo Substituindo em supabase.ts...
powershell -Command "$content = Get-Content 'lib\supabase.ts'; if ($content -notmatch 'import.*logger') { $content = '@import { logger } from ''@/lib/logger'';@' + $content }; $content -replace 'console\.warn', 'logger.warn' -replace 'console\.error', 'logger.error' | Set-Content 'lib\supabase.ts'"

echo Substituindo em stripe.ts...
powershell -Command "$content = Get-Content 'lib\stripe.ts'; if ($content -notmatch 'import.*logger') { $content = '@import { logger } from ''@/lib/logger'';@' + $content }; $content -replace 'console\.warn', 'logger.warn' -replace 'console\.error', 'logger.error' | Set-Content 'lib\stripe.ts'"

echo Substituindo em config.ts...
powershell -Command "$content = Get-Content 'lib\config.ts'; if ($content -notmatch 'import.*logger') { $content = '@import { logger } from ''@/lib/logger'';@' + $content }; $content -replace 'console\.warn', 'logger.warn' | Set-Content 'lib\config.ts'"

echo Substituindo em useGrowthExperienceData.ts...
powershell -Command "$content = Get-Content 'hooks\useGrowthExperienceData.ts'; if ($content -notmatch 'import.*logger') { $content = '@import { logger } from ''@/lib/logger'';@' + $content }; $content -replace 'console\.error', 'logger.error' | Set-Content 'hooks\useGrowthExperienceData.ts'"

echo Substituindo em SocialShare.tsx...
powershell -Command "$content = Get-Content 'components\social\SocialShare.tsx'; if ($content -notmatch 'import.*logger') { $content = '@import { logger } from ''@/lib/logger'';@' + $content }; $content -replace 'console\.error', 'logger.error' | Set-Content 'components\social\SocialShare.tsx'"

echo.
echo ========================================
echo CONCLUIDO!
echo ========================================
echo.
echo Todos os console.* foram substituidos por logger.*
echo.
pause
