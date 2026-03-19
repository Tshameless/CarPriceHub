# 车价通爬虫定时任务脚本
# 使用 Windows 任务计划程序定时执行

param(
    [string]$Spider = "batch_update",
    [int]$Days = 7,
    [string]$Brand = ""
)

# 切换到爬虫目录
$crawlerDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $crawlerDir

# 日志文件路径
$logDir = Join-Path $crawlerDir "logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = Join-Path $logDir "crawl_$timestamp.log"

Write-Host "========================================" | Tee-Object -FilePath $logFile
Write-Host "车价通爬虫定时任务" | Tee-Object -FilePath $logFile -Append
Write-Host "时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Tee-Object -FilePath $logFile -Append
Write-Host "爬虫: $Spider" | Tee-Object -FilePath $logFile -Append
if ($Brand) {
    Write-Host "品牌: $Brand" | Tee-Object -FilePath $logFile -Append
}
if ($Spider -eq "batch_update") {
    Write-Host "更新天数: $Days" | Tee-Object -FilePath $logFile -Append
}
Write-Host "========================================" | Tee-Object -FilePath $logFile -Append

# 激活虚拟环境 (如果有)
$venvPath = Join-Path $crawlerDir "venv\Scripts\Activate.ps1"
if (Test-Path $venvPath) {
    Write-Host "激活虚拟环境..." | Tee-Object -FilePath $logFile -Append
    & $venvPath
}

# 构建命令
$command = "python run_spider.py $Spider"
if ($Brand) {
    $command += " --brand $Brand"
}
if ($Spider -eq "batch_update") {
    $command += " --days $Days"
}

Write-Host "执行命令: $command" | Tee-Object -FilePath $logFile -Append
Write-Host "" | Tee-Object -FilePath $logFile -Append

# 执行爬虫
try {
    $output = Invoke-Expression $command 2>&1
    $output | Tee-Object -FilePath $logFile -Append
    
    Write-Host "" | Tee-Object -FilePath $logFile -Append
    Write-Host "========================================" | Tee-Object -FilePath $logFile -Append
    Write-Host "爬虫执行完成!" | Tee-Object -FilePath $logFile -Append
    Write-Host "结束时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Tee-Object -FilePath $logFile -Append
    Write-Host "日志文件: $logFile" | Tee-Object -FilePath $logFile -Append
    Write-Host "========================================" | Tee-Object -FilePath $logFile -Append
    
    # 可选: 发送邮件通知
    # Send-MailMessage -To "admin@example.com" -Subject "爬虫执行完成" -Body "爬虫 $Spider 已完成执行,详见日志 $logFile" -SmtpServer "smtp.example.com"
    
    exit 0
}
catch {
    Write-Host "" | Tee-Object -FilePath $logFile -Append
    Write-Host "========================================" | Tee-Object -FilePath $logFile -Append
    Write-Host "错误: 爬虫执行失败!" | Tee-Object -FilePath $logFile -Append
    Write-Host "错误信息: $_" | Tee-Object -FilePath $logFile -Append
    Write-Host "========================================" | Tee-Object -FilePath $logFile -Append
    
    # 可选: 发送错误邮件
    # Send-MailMessage -To "admin@example.com" -Subject "爬虫执行失败" -Body "爬虫 $Spider 执行失败,错误: $_" -SmtpServer "smtp.example.com"
    
    exit 1
}
