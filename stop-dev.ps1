# 车价通 CarPriceHub - 停止开发环境脚本

Write-Host "🛑 停止车价通开发环境..." -ForegroundColor Yellow
Write-Host ""

# 停止后端
$backendProcess = Get-Process node -ErrorAction SilentlyContinue | Where-Object {
    $conn = Get-NetTCPConnection -OwningProcess $_.Id -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq 8080 }
    $conn -ne $null
}

if ($backendProcess) {
    Stop-Process -Id $backendProcess.Id -Force
    Write-Host "✓ 后端服务已停止 (PID: $($backendProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "⚠ 后端服务未运行" -ForegroundColor Yellow
}

# 停止前端 (Vite 进程)
$frontendProcess = Get-Process node -ErrorAction SilentlyContinue | Where-Object {
    $conn = Get-NetTCPConnection -OwningProcess $_.Id -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq 5173 }
    $conn -ne $null
}

if ($frontendProcess) {
    Stop-Process -Id $frontendProcess.Id -Force
    Write-Host "✓ 前端服务已停止 (PID: $($frontendProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "⚠ 前端服务未运行" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✓ 开发环境已停止" -ForegroundColor Green
