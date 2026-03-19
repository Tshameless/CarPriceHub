# ── 快速启动脚本 (PowerShell) ─────────────────────────────────

Write-Host "🚗 车价通 CarPriceHub 启动脚本" -ForegroundColor Cyan
Write-Host ""

# 检查依赖
Write-Host "检查依赖..." -ForegroundColor Yellow

# 检查 Rust
$cargo = Get-Command cargo -ErrorAction SilentlyContinue
if (-not $cargo) {
    Write-Host "❌ 未安装 Rust，请先安装: https://rustup.rs" -ForegroundColor Red
    Write-Host "   或运行: Invoke-WebRequest -Uri https://win.rustup.rs -OutFile rustup-init.exe; ./rustup-init.exe" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Rust 已安装" -ForegroundColor Green

# 检查 Node.js
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "❌ 未安装 Node.js，请先安装: https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js 已安装" -ForegroundColor Green

# 检查 PostgreSQL
$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
    Write-Host "⚠️  未找到 psql，请确保 PostgreSQL 已安装并配置 PATH" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "启动服务..." -ForegroundColor Yellow

# 启动后端
Write-Host ""
Write-Host "启动后端服务 (端口 8080)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; cargo run"

# 等待后端启动
Start-Sleep -Seconds 5

# 启动前端
Write-Host "启动前端服务 (端口 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "✅ 启动完成！" -ForegroundColor Green
Write-Host ""
Write-Host "后端地址: http://localhost:8080" -ForegroundColor White
Write-Host "前端地址: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "按任意键打开浏览器..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "http://localhost:5173"
