@echo off
chcp 65001 >nul
echo 🚗 车价通 CarPriceHub 启动脚本
echo.

echo 检查依赖...

:: 检查 Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未安装 Node.js，请先安装: https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js 已安装

:: 检查前端依赖
echo.
echo 安装前端依赖...
cd /d "C:\Users\Laplace\Desktop\study file\CarPriceHub\frontend"
call npm install
if errorlevel 1 (
    echo ❌ 前端依赖安装失败
    pause
    exit /b 1
)

:: 检查后端依赖
echo.
echo 安装后端依赖...
cd /d "C:\Users\Laplace\Desktop\study file\CarPriceHub\backend-node"
call npm install
if errorlevel 1 (
    echo ❌ 后端依赖安装失败
    pause
    exit /b 1
)

echo.
echo ✅ 依赖安装完成
echo.

:: 启动后端
echo 启动后端服务 (端口 8080)...
start "CarPriceHub Backend" cmd /k "cd /d ""C:\Users\Laplace\Desktop\study file\CarPriceHub\backend-node"" && npm start"

:: 等待后端启动
timeout /t 3 /nobreak >nul

:: 启动前端
echo 启动前端服务 (端口 5173)...
start "CarPriceHub Frontend" cmd /k "cd /d ""C:\Users\Laplace\Desktop\study file\CarPriceHub\frontend"" && npm run dev"

echo.
echo ✅ 启动完成！
echo.
echo 后端地址: http://localhost:8080
echo 前端地址: http://localhost:5173
echo.
pause
