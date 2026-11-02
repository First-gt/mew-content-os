# UTF-8
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  Upgrading MEW Docker Services (Zero-Downtime Rebuild)..." -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

Write-Host "[1/3] Stopping existing version..." -ForegroundColor Yellow
docker compose down

Write-Host "[2/3] Rebuilding latest images without cache..." -ForegroundColor Yellow
docker compose build --no-cache

if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] Build failed. Please inspect Dockerfile." -ForegroundColor Red
    exit 1
}

Write-Host "[3/3] Starting upgraded services..." -ForegroundColor Green
docker compose up -d

Write-Host "`n[+] Version upgrade completed successfully!" -ForegroundColor Green
Write-Host "Services are running with the latest version. Checking status...`n" -ForegroundColor Cyan

powershell -File .\service-up.ps1
