param(
    [string]$Workspace = "D:\loop engineering"
)

$Host.UI.RawUI.WindowTitle = "LOOP ENGINEERING - LIVE MONITOR (Maker Account #2 + Verifier)"

while ($true) {
    Clear-Host
    $now = Get-Date -Format "HH:mm:ss"
    Write-Host "==========================================================================" -ForegroundColor Cyan
    Write-Host "  LOOP ENGINEERING LIVE MONITOR  |  Time: $now  |  Workspace: $Workspace" -ForegroundColor Cyan
    Write-Host "==========================================================================" -ForegroundColor Cyan

    # 1. Check Worker Process Status
    $workerProcs = Get-CimInstance Win32_Process | Where-Object { $_.Name -eq "agy.exe" -and $_.CommandLine -like "*--print*" }
    if ($workerProcs) {
        Write-Host " [WORKER STATUS]: " -NoNewline -ForegroundColor White
        Write-Host "RUNNING (Subordinate Account #2 is actively coding...)" -ForegroundColor Green
    } else {
        Write-Host " [WORKER STATUS]: " -NoNewline -ForegroundColor White
        Write-Host "IDLE / VERIFIER RUNNING TESTS" -ForegroundColor Yellow
    }

    # 2. Plan Progress
    $planFile = Join-Path $Workspace "plan.md"
    if (Test-Path $planFile) {
        $planRaw = Get-Content $planFile -Raw -Encoding UTF8
        $doneCount = ([regex]::Matches($planRaw, "- \[x\] \*\*Topic")).Count
        $todoCount = ([regex]::Matches($planRaw, "- \[ \] \*\*Topic")).Count
        $total = $doneCount + $todoCount
        $pct = if ($total -gt 0) { [math]::Round(($doneCount / $total) * 100) } else { 0 }
        Write-Host " [PLAN PROGRESS]: $doneCount / $total Topics Completed ($pct%)" -ForegroundColor Magenta
    }

    # 3. Current In-Progress from STATE.md
    $stateFile = Join-Path $Workspace "STATE.md"
    if (Test-Path $stateFile) {
        Write-Host "`n--- CURRENT STATE (STATE.md) ---" -ForegroundColor Yellow
        $stateLines = Get-Content $stateFile -Encoding UTF8
        $inProg = $false
        foreach ($line in $stateLines) {
            if ($line -match "^## In Progress") { $inProg = $true; continue }
            if ($line -match "^## " -and $inProg) { break }
            if ($inProg -and $line.Trim() -ne "") {
                Write-Host "  $line" -ForegroundColor White
            }
        }
    }

    # 4. Latest 8 Modified Files in Workspace
    Write-Host "`n--- LATEST FILES CREATED/EDITED BY WORKER ---" -ForegroundColor Cyan
    $recentFiles = Get-ChildItem -Path $Workspace -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch "node_modules|\.git" } |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 8
    foreach ($f in $recentFiles) {
        $rel = $f.FullName.Replace("$Workspace\", "")
        $t = $f.LastWriteTime.ToString("HH:mm:ss")
        Write-Host ("  [{0}] {1} ({2} bytes)" -f $t, $rel, $f.Length) -ForegroundColor Gray
    }

    # 5. Verifier Run Log
    $logFile = Join-Path $Workspace "loop-run-log.md"
    if (Test-Path $logFile) {
        Write-Host "`n--- VERIFIER LOG (loop-run-log.md) ---" -ForegroundColor Green
        Get-Content $logFile -Tail 6 -Encoding UTF8 | ForEach-Object {
            Write-Host "  $_" -ForegroundColor Green
        }
    }

    Write-Host "`n(Auto-refreshing every 2 seconds... Press Ctrl+C to close monitor)" -ForegroundColor DarkGray
    Start-Sleep -Seconds 2
}
