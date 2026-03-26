$baseDir = "c:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026\app\supabase"
$migrationsDir = "$baseDir\migrations"
$outputFile = "c:\Users\Cristiano D. Borges\Downloads\Plataforma Growth Summit 2026\migracao_completa_growth_summit.sql"

"-- ============================================================`n-- GROWTH SUMMIT 2026 - MIGRACAO COMPLETA E UNICA`n-- Data: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n-- ============================================================`n`n" | Out-File -FilePath $outputFile -Encoding utf8

$files = @()
$files += Get-Item "$baseDir\schema.sql"
$files += Get-ChildItem "$migrationsDir\*.sql" | Sort-Object Name
$files += Get-Item "$baseDir\seeds.sql"

foreach ($file in $files) {
    "`n`n-- ARCHIVE: $($file.Name)`n-- ============================================================`n" | Add-Content -Path $outputFile
    Get-Content $file.FullName | Add-Content -Path $outputFile
    "`n`n" | Add-Content -Path $outputFile
}

Write-Output "Success! File created at $outputFile"
