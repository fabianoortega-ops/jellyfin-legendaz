# =============================================================================
# build-release.ps1 — Legendaz
# Uso: .\build-release.ps1
#      .\build-release.ps1 -Version "0.1.1.0"
# =============================================================================
param(
    [string]$GitHubUser = "fabianoortega-ops",
    [string]$Version    = "0.1.0.0"
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
Write-Host "=== Legendaz — Build & Release ===" -ForegroundColor Cyan
Write-Host "    Usuário : $GitHubUser  |  Versão: $Version"
Write-Host ""

# ── 1. Compilar ──────────────────────────────────────────────────────────────
Write-Host "[1/6] Compilando..." -ForegroundColor Yellow
dotnet build --configuration Release --nologo -v q /p:Version=$Version /p:AssemblyVersion=$Version /p:FileVersion=$Version
if ($LASTEXITCODE -ne 0) { Write-Error "Falha na compilação."; exit 1 }
Write-Host "      OK"

# ── 2. Empacotar .dll ────────────────────────────────────────────────────────
Write-Host "[2/6] Empacotando $ZipName..." -ForegroundColor Yellow
if (Test-Path $ZipDest) { Remove-Item $ZipDest -Force }
Compress-Archive -Path $DllPath -DestinationPath $ZipDest -Force
Write-Host "      OK"

# ── 3. Gerar manifest.json ───────────────────────────────────────────────────
Write-Host "[3/6] Gerando manifest.json..." -ForegroundColor Yellow
$checksum  = (Get-FileHash $ZipDest -Algorithm MD5).Hash.ToLower()
$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

$pluginObj = [ordered]@{
    guid        = "d814c265-0396-455b-ba28-397be1d33f13"
    name        = "Legendaz"
    description = "Busca e baixa legendas diretamente do menu do player Jellyfin."
    overview    = "Adiciona um botão de busca no menu de legendas do player, integrado com o Bazarr."
    owner       = $GitHubUser
    category    = "Subtitles"
    imageUrl    = "$RepoUrl/logo.svg"
    versions    = @([ordered]@{
        version   = $Version
        changelog = "## $Version`n`n- Legendaz v$Version"
        targetAbi = "10.11.0.0"
        sourceUrl = $SourceUrl
        checksum  = $checksum
        timestamp = $timestamp
    })
}
$manifestJson = "[" + ($pluginObj | ConvertTo-Json -Depth 10) + "]"
Set-Content -Path "manifest.json" -Value $manifestJson -Encoding UTF8
Write-Host "      MD5: $checksum  |  OK"

# ── 4. Commit ────────────────────────────────────────────────────────────────
Write-Host "[4/6] Commitando..." -ForegroundColor Yellow
git add .
git rm -r --cached bin/ obj/ 2>&1 | Out-Null

$status = git status --porcelain 2>&1
if ($status) {
    git commit -m "chore: publish" 2>&1 | ForEach-Object { Write-Host "      $_" }
} else {
    Write-Host "      Nada novo para commitar."
}

# ── 5. Sync + Push ───────────────────────────────────────────────────────────
Write-Host "[5/6] Sincronizando e enviando..." -ForegroundColor Yellow
git pull --rebase origin main 2>&1 | ForEach-Object { Write-Host "      $_" }
if ($LASTEXITCODE -ne 0) { Write-Error "Falha no pull."; exit 1 }
git push origin main 2>&1 | ForEach-Object { Write-Host "      $_" }
if ($LASTEXITCODE -ne 0) { Write-Error "Falha no push."; exit 1 }

# ── 6. GitHub Release ────────────────────────────────────────────────────────
Write-Host "[6/6] Criando GitHub Release $TagName..." -ForegroundColor Yellow
$GitHubToken = $env:GITHUB_TOKEN
if (-not $GitHubToken) {
    Write-Warning "Token não encontrado. Defina: `$env:GITHUB_TOKEN = 'ghp_...'"
    Write-Host "   Release manual: https://github.com/$GitHubUser/$RepoSlug/releases/new"
} else {
    $headers = @{
        "Authorization"        = "Bearer $GitHubToken"
        "Accept"               = "application/vnd.github+json"
        "X-GitHub-Api-Version" = "2022-11-28"
    }
    $releaseBody = @{ tag_name = $TagName; name = "Legendaz $TagName"; body = "Legendaz $Version"; draft = $false; prerelease = $false } | ConvertTo-Json
    try {
        # Verificar se o release já existe
        $existingRelease = $null
        try {
            $existingRelease = Invoke-RestMethod -Uri "https://api.github.com/repos/$GitHubUser/$RepoSlug/releases/tags/$TagName" -Headers $headers
        } catch {}

        if ($existingRelease) {
            Write-Host "      Release $TagName já existe — fazendo upload do zip..."
            $uploadUrl = $existingRelease.upload_url -replace '\{.*\}', "?name=$ZipName"
        } else {
            $release   = Invoke-RestMethod -Uri "https://api.github.com/repos/$GitHubUser/$RepoSlug/releases" -Method POST -Headers $headers -Body $releaseBody -ContentType "application/json"
            $uploadUrl = $release.upload_url -replace '\{.*\}', "?name=$ZipName"
            Write-Host "      Release $TagName criado!"
        }

        $zipBytes = [System.IO.File]::ReadAllBytes($ZipDest)
        Invoke-RestMethod -Uri $uploadUrl -Method POST -Headers $headers -Body $zipBytes -ContentType "application/octet-stream" | Out-Null
        Write-Host "      Zip enviado com sucesso!"
    } catch {
        Write-Warning "Erro ao criar/atualizar release: $_"
    }
}

Write-Host ""
Write-Host "=== Pronto! ===" -ForegroundColor Green
Write-Host "  $RepoUrl/manifest.json" -ForegroundColor Green
Write-Host ""
