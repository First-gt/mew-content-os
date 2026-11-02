# UTF-8
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  Starting MEW Docker Services (Dashboard + Mobile 4G Gateway)..." -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

# 1. Start containers in background
docker compose up --build -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] Docker Compose failed to start." -ForegroundColor Red
    exit 1
}

Write-Host "`n[+] Containers are up! Fetching public HTTPS gateway link for mobile..." -ForegroundColor Green

# 2. Wait 5 seconds for cloudflared tunnel
Start-Sleep -Seconds 5

$tunnelLog = docker logs mew-live-gateway 2>&1 | Out-String
$publicUrl = ""

if ($tunnelLog -match 'https://[a-zA-Z0-9-]+\.trycloudflare\.com') {
    $publicUrl = $matches[0]
}

# 3. Get LAN IP
$lanIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -match "Wi-Fi|Ethernet" } | Select-Object -ExpandProperty IPAddress -First 1)

Write-Host "`n==================================================================" -ForegroundColor Yellow
Write-Host "  LIVE DASHBOARD LINKS (MOBILE & DESKTOP)" -ForegroundColor Yellow
Write-Host "==================================================================" -ForegroundColor Yellow
Write-Host "  [1] Mobile (Outside home on 4G / 5G / Any Network):" -ForegroundColor Magenta
if ($publicUrl) {
    Write-Host "      >> $publicUrl" -ForegroundColor Green
} else {
    Write-Host "      (Generating link... check with: docker logs mew-live-gateway)" -ForegroundColor Gray
}
Write-Host "`n  [2] Mobile / Tablet on Local Home Wi-Fi:" -ForegroundColor White
Write-Host "      >> http://$($lanIp):4000" -ForegroundColor Cyan
Write-Host "`n  [3] Desktop on this PC:" -ForegroundColor White
Write-Host "      >> http://localhost:4000" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Yellow
Write-Host "Docker management:" -ForegroundColor Gray
Write-Host "  - View live logs:    docker compose logs -f" -ForegroundColor Gray
Write-Host "  - Upgrade version:   powershell -File .\service-upgrade.ps1" -ForegroundColor Gray
Write-Host "  - Stop all services: docker compose down`n" -ForegroundColor Gray
