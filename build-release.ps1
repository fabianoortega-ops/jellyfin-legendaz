param(
    [string]$GitHubUser = "fabianoortega-ops",
    [string]$Version    = "0.1.6.0"
)

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

$PluginName  = "JellyfinLegendaz"
$RepoSlug    = "jellyfin-legendaz"
$DllPath     = "bin\Release\net9.0\$PluginName.dll"
$ZipName     = "${PluginName}_${Version}.zip"
$ZipDest     = "$env:TEMP\$ZipName"
$RepoUrl     = "https://$GitHubUser.github.io/$RepoSlug"
$TagName     = "v$Version"
$SourceUrl   = "https://github.com/$GitHubUser/$RepoSlug/releases/download/$TagName/$ZipName"

Write-Host ""
Write-Host "=== Legendaz === Build & Release ===" -ForegroundColor Cyan
Write-Host "    Versao: $Version"
Write-Host ""

Write-Host "[1/6] Compilando..." -ForegroundColor Yellow
dotnet build --configuration Release --nologo -v q /p:Version=$Version /p:AssemblyVersion=$Version /p:FileVersion=$Version
if ($LASTEXITCODE -ne 0) { Write-Error "Falha na compilacao."; exit 1 }
Write-Host "      OK"

Write-Host "[2/6] Empacotando $ZipName..." -ForegroundColor Yellow
if (Test-Path $ZipDest) { Remove-Item $ZipDest -Force }
Compress-Archive -Path $DllPath -DestinationPath $ZipDest -Force
Write-Host "      OK"

Write-Host "[3/6] Gerando manifest.json..." -ForegroundColor Yellow
$checksum  = (Get-FileHash $ZipDest -Algorithm MD5).Hash.ToLower()
$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$pluginObj = [ordered]@{
    guid        = "d814c265-0396-455b-ba28-397be1d33f13"
    name        = "Legendaz"
    description = "Busca e baixa legendas diretamente do menu do player Jellyfin."
    overview    = "Adiciona um botao de busca no OSD do player, integrado com Bazarr."
    owner       = $GitHubUser
    category    = "Subtitles"
    imageUrl    = "$RepoUrl/logo.svg"
    versions    = @([ordered]@{
        version   = $Version
        changelog = "## $Version"
        targetAbi = "10.11.0.0"
        sourceUrl = $SourceUrl
        checksum  = $checksum
        timestamp = $timestamp
    })
}
$manifestJson = "[" + ($pluginObj | ConvertTo-Json -Depth 10) + "]"
Set-Content -Path "manifest.json" -Value $manifestJson -Encoding UTF8
Write-Host "      MD5: $checksum"

Write-Host "[4/6] Commitando..." -ForegroundColor Yellow
git add .
git rm -r --cached bin/ obj/ releases/ 2>&1 | Out-Null
$status = git status --porcelain 2>&1
if ($status) {
    git commit -m "update" 2>&1 | ForEach-Object { Write-Host "      $_" }
} else {
    Write-Host "      Nada para commitar."
}

Write-Host "[5/6] Sincronizando..." -ForegroundColor Yellow
git pull --rebase origin main 2>&1 | ForEach-Object { Write-Host "      $_" }
if ($LASTEXITCODE -ne 0) { Write-Error "Falha no pull."; exit 1 }
git push origin main 2>&1 | ForEach-Object { Write-Host "      $_" }
if ($LASTEXITCODE -ne 0) { Write-Error "Falha no push."; exit 1 }

Write-Host "[6/6] GitHub Release $TagName..." -ForegroundColor Yellow
$GitHubToken = $env:GITHUB_TOKEN
if (-not $GitHubToken) {
    $credOutput  = "protocol=https`nhost=github.com`n" | git credential fill 2>&1
    $GitHubToken = ($credOutput | Select-String "password=(.+)").Matches.Groups[1].Value
}
if (-not $GitHubToken) {
    Write-Warning "Token nao encontrado. Defina: `$env:GITHUB_TOKEN = 'ghp_...'"
    Write-Host "  Release manual: https://github.com/$GitHubUser/$RepoSlug/releases/new"
} else {
    $headers = @{
        "Authorization"        = "Bearer $GitHubToken"
        "Accept"               = "application/vnd.github+json"
        "X-GitHub-Api-Version" = "2022-11-28"
    }
    $releaseBody = @{ tag_name = $TagName; name = "Legendaz $TagName"; body = $Version; draft = $false; prerelease = $false } | ConvertTo-Json
    try {
        $existingRelease = $null
        try { $existingRelease = Invoke-RestMethod -Uri "https://api.github.com/repos/$GitHubUser/$RepoSlug/releases/tags/$TagName" -Headers $headers } catch {}
        if ($existingRelease) {
            $uploadUrl = $existingRelease.upload_url -replace '\{.*\}', "?name=$ZipName"
        } else {
            $release   = Invoke-RestMethod -Uri "https://api.github.com/repos/$GitHubUser/$RepoSlug/releases" -Method POST -Headers $headers -Body $releaseBody -ContentType "application/json"
            $uploadUrl = $release.upload_url -replace '\{.*\}', "?name=$ZipName"
        }
        $zipBytes = [System.IO.File]::ReadAllBytes($ZipDest)
        Invoke-RestMethod -Uri $uploadUrl -Method POST -Headers $headers -Body $zipBytes -ContentType "application/octet-stream" | Out-Null
        Write-Host "      Release $TagName OK"
    } catch {
        Write-Warning "Erro: $_"
    }
}

Write-Host ""
Write-Host "=== Pronto! ===" -ForegroundColor Green
Write-Host "  $RepoUrl/manifest.json" -ForegroundColor Green
Write-Host ""
