# 车价通 CarPriceHub - 开发环境启动脚本

Write-Host "🚗 启动车价通开发环境..." -ForegroundColor Green
Write-Host ""

# 检查 Node.js
Write-Host "检查 Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js 未安装，请先安装 Node.js 18+" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js 版本: $nodeVersion" -ForegroundColor Green

# 检查端口占用
Write-Host ""
Write-Host "检查端口..." -ForegroundColor Yellow

$backendPort = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($backendPort) {
    Write-Host "⚠ 端口 8080 已被占用，尝试停止进程..." -ForegroundColor Yellow
    $backendPort | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 1
}

$frontendPort = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($frontendPort) {
    Write-Host "⚠ 端口 5173 已被占用，尝试停止进程..." -ForegroundColor Yellow
    $frontendPort | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 1
}

# 启动后端
Write-Host ""
Write-Host "启动后端服务..." -ForegroundColor Yellow
Set-Location backend-node
Start-Process node -ArgumentList "server.js" -WindowStyle Minimized
Set-Location ..
Start-Sleep -Seconds 2

# 验证后端
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8080/health" -TimeoutSec 5
    Write-Host "✓ 后端服务启动成功 (PID: $(Get-Process node | Select-Object -First 1 -ExpandProperty Id))" -ForegroundColor Green
} catch {
    Write-Host "❌ 后端服务启动失败" -ForegroundColor Red
    exit 1
}

# 启动前端
Write-Host ""
Write-Host "启动前端服务..." -ForegroundColor Yellow
Set-Location frontend
Start-Process npm -ArgumentList "run", "dev" -WindowStyle Minimized
Set-Location ..
Start-Sleep -Seconds 5

# 验证前端
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✓ 前端服务启动成功" -ForegroundColor Green
} catch {
    Write-Host "❌ 前端服务启动失败" -ForegroundColor Red
    exit 1
}

# 显示信息
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎉 车价通开发环境已启动！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 前端地址: " -NoNewline
Write-Host "http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 后端地址: " -NoNewline
Write-Host "http://localhost:8080" -ForegroundColor Cyan
Write-Host "📊 后端健康: " -NoNewline
Write-Host "http://localhost:8080/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "API 端点:" -ForegroundColor Yellow
Write-Host "  POST /api/v1/cars/search       - 搜索车型"
Write-Host "  GET  /api/v1/cars/:id/price-detail - 获取详情"
Write-Host "  POST /api/v1/recommend          - 智能推荐"
Write-Host "  GET  /api/v1/stats              - 统计信息"
Write-Host ""
Write-Host "按任意键打开浏览器..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# 打开浏览器
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "提示: 关闭此窗口不会停止服务" -ForegroundColor Gray
Write-Host "要停止服务，请运行: .\stop-dev.ps1" -ForegroundColor Gray
