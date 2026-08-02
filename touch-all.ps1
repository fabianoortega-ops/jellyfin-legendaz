$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

function Touch($file) {
    if (-not (Test-Path $file)) { return }
    Add-Content -Path $file -Value "" -Encoding UTF8
}

Write-Host "Atualizando todos os arquivos..." -ForegroundColor Cyan

Touch ".gitignore"
Touch ".nojekyll"
Touch "JellyfinLegendaz.csproj"
Touch "LICENSE"
Touch "Plugin.cs"
Touch "PluginConfiguration.cs"
Touch "README.md"
Touch "banner.svg"
Touch "index.html"
Touch "legendaz-player.js"
Touch "logo.svg"
Touch "social.svg"

Get-ChildItem -Path "translations" -Filter "*.md" | ForEach-Object {
    Touch $_.FullName
}

git add .
git rm -r --cached bin/ obj/ 2>&1 | Out-Null

$status = git status --porcelain 2>&1
if ($status) {
    git commit -m "update" 2>&1 | ForEach-Object { Write-Host "  $_" }
} else {
    Write-Host "Nada para commitar."
}

git pull --rebase origin main 2>&1 | Out-Null
git push origin main 2>&1 | ForEach-Object { Write-Host "  $_" }

Write-Host "Pronto! Apague este arquivo." -ForegroundColor Green
