# CarPriceHub 生产环境部署指南

> 本指南提供完整的部署流程,适用于 Node.js 后端方案

---

## 📋 目录

- [前置要求](#前置要求)
- [服务器配置](#服务器配置)
- [数据库部署](#数据库部署)
- [后端部署](#后端部署)
- [前端部署](#前端部署)
- [Nginx 配置](#nginx-配置)
- [监控告警](#监控告警)
- [备份策略](#备份策略)
- [故障排查](#故障排查)

---

## 🔧 前置要求

### 服务器规格

**最低配置 (测试环境)**
- CPU: 2核
- 内存: 4GB
- 硬盘: 40GB SSD
- 带宽: 3Mbps

**推荐配置 (生产环境)**
- CPU: 4核
- 内存: 8GB
- 硬盘: 100GB SSD
- 带宽: 10Mbps

### 软件环境

- **操作系统**: Ubuntu 22.04 LTS / CentOS 8+
- **Node.js**: v20 LTS
- **PostgreSQL**: 15+
- **Nginx**: 1.24+
- **PM2**: 5.0+

---

## 🖥️ 服务器配置

### 1. 系统更新

```bash
# Ubuntu
sudo apt update && sudo apt upgrade -y

# CentOS
sudo yum update -y
```

### 2. 安装依赖

```bash
# 安装 Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version  # v20.x.x
npm --version   # 10.x.x

# 安装 PM2
sudo npm install -g pm2

# 安装 PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 安装 Nginx
sudo apt install -y nginx

# 安装 Git
sudo apt install -y git
```

### 3. 配置防火墙

```bash
# 开放必要端口
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw enable
```

---

## 🗄️ 数据库部署

### 1. 初始化 PostgreSQL

```bash
# 启动 PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 切换到 postgres 用户
sudo -u postgres psql

# 创建数据库和用户
CREATE DATABASE carpricehub;
CREATE USER carpricehub_user WITH ENCRYPTED PASSWORD '你的强密码';
GRANT ALL PRIVILEGES ON DATABASE carpricehub TO carpricehub_user;

# 退出
\q
```

### 2. 配置 PostgreSQL

编辑 `/etc/postgresql/15/main/postgresql.conf`:

```conf
# 连接设置
listen_addresses = 'localhost'
max_connections = 200

# 内存设置
shared_buffers = 256MB
effective_cache_size = 768MB
work_mem = 4MB

# 日志设置
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
```

编辑 `/etc/postgresql/15/main/pg_hba.conf`:

```conf
# 允许本地连接
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

重启服务:

```bash
sudo systemctl restart postgresql
```

---

## ⚙️ 后端部署

### 1. 克隆代码

```bash
# 创建应用目录
sudo mkdir -p /var/www/carpricehub
sudo chown -R $USER:$USER /var/www/carpricehub

# 克隆代码
cd /var/www
git clone https://github.com/Tshameless/CarPriceHub.git carpricehub
cd carpricehub
```

### 2. 配置环境变量

```bash
cd backend-node
cp .env.example .env
nano .env
```

编辑 `.env` 文件:

```env
# 数据库配置
DATABASE_URL=postgresql://carpricehub_user:你的强密码@localhost:5432/carpricehub

# 服务器配置
PORT=8080
NODE_ENV=production

# JWT 密钥 (生成强密钥)
JWT_SECRET=$(openssl rand -base64 32)

# Redis (可选,用于缓存)
REDIS_URL=redis://localhost:6379
```

### 3. 安装依赖

```bash
cd /var/www/carpricehub/backend-node
npm install --production
```

### 4. 初始化数据库

```bash
# 连接数据库并执行迁移脚本
psql -U carpricehub_user -d carpricehub -f ../migrations/001_init_schema.sql
psql -U carpricehub_user -d carpricehub -f ../migrations/002_seed_data.sql
```

### 5. 配置 PM2

创建 PM2 配置文件 `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'carpricehub-api',
    script: 'server.js',
    cwd: '/var/www/carpricehub/backend-node',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    error_file: '/var/log/carpricehub/api-error.log',
    out_file: '/var/log/carpricehub/api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    // 优雅重启
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 3000,
  }]
};
```

创建日志目录:

```bash
sudo mkdir -p /var/log/carpricehub
sudo chown -R $USER:$USER /var/log/carpricehub
```

### 6. 启动服务

```bash
cd /var/www/carpricehub/backend-node
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs carpricehub-api

# 保存 PM2 配置
pm2 save
pm2 startup
```

---

## 🎨 前端部署

### 1. 构建生产版本

```bash
cd /var/www/carpricehub/frontend

# 安装依赖
npm install

# 构建生产版本
npm run build
```

构建完成后,静态文件位于 `dist/` 目录。

### 2. 部署静态文件

```bash
# 复制到 Nginx 目录
sudo mkdir -p /var/www/carpricehub/html
sudo cp -r dist/* /var/www/carpricehub/html/

# 设置权限
sudo chown -R www-data:www-data /var/www/carpricehub/html
sudo chmod -R 755 /var/www/carpricehub/html
```

---

## 🌐 Nginx 配置

### 1. 创建 Nginx 配置

创建 `/etc/nginx/sites-available/carpricehub`:

```nginx
# 后端 API 上游服务器
upstream api_server {
    server 127.0.0.1:8080;
    keepalive 64;
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Let's Encrypt 验证路径
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # 其他请求重定向到 HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS 服务器
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全头部
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # 前端静态文件
    root /var/www/carpricehub/html;
    index index.html;
    
    # 前端路由 (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://api_server;
        proxy_http_version 1.1;
        
        # 代理头部
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket 支持
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲设置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;
    
    # 日志
    access_log /var/log/nginx/carpricehub-access.log;
    error_log /var/log/nginx/carpricehub-error.log;
}
```

### 2. 启用站点

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/carpricehub /etc/nginx/sites-enabled/

# 删除默认站点
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 3. 配置 SSL 证书

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 📊 监控告警

### 1. PM2 监控

```bash
# 连接到 PM2 Plus (可选)
pm2 link <secret_key> <public_key>

# 查看监控面板
pm2 monit
```

### 2. 系统监控脚本

创建 `/usr/local/bin/monitor.sh`:

```bash
#!/bin/bash

# CPU 使用率
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')

# 内存使用率
MEM_USAGE=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')

# 磁盘使用率
DISK_USAGE=$(df -h / | awk '{print $5}' | tail -1 | sed 's/%//')

# 检查阈值
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    echo "警告: CPU 使用率 $CPU_USAGE%"
fi

if (( $(echo "$MEM_USAGE > 80" | bc -l) )); then
    echo "警告: 内存使用率 $MEM_USAGE%"
fi

if [ "$DISK_USAGE" -gt 80 ]; then
    echo "警告: 磁盘使用率 $DISK_USAGE%"
fi
```

添加到定时任务:

```bash
chmod +x /usr/local/bin/monitor.sh
crontab -e

# 每小时检查一次
0 * * * * /usr/local/bin/monitor.sh >> /var/log/system-monitor.log 2>&1
```

---

## 💾 备份策略

### 1. 数据库备份脚本

创建 `/usr/local/bin/backup-db.sh`:

```bash
#!/bin/bash

# 配置
DB_NAME="carpricehub"
DB_USER="carpricehub_user"
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/carpricehub_$DATE.sql.gz"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_FILE

# 删除 7 天前的备份
find $BACKUP_DIR -name "carpricehub_*.sql.gz" -mtime +7 -delete

echo "备份完成: $BACKUP_FILE"
```

添加到定时任务:

```bash
chmod +x /usr/local/bin/backup-db.sh

# 每天凌晨 2 点备份
0 2 * * * /usr/local/bin/backup-db.sh >> /var/log/db-backup.log 2>&1
```

### 2. 代码备份

```bash
# 创建代码备份
tar -czf /var/backups/carpricehub-code-$(date +%Y%m%d).tar.gz /var/www/carpricehub
```

---

## 🔧 故障排查

### 常见问题

#### 1. 后端服务无法启动

```bash
# 查看日志
pm2 logs carpricehub-api

# 检查端口占用
sudo netstat -tulpn | grep 8080

# 检查环境变量
pm2 env 0
```

#### 2. 数据库连接失败

```bash
# 测试数据库连接
psql -U carpricehub_user -d carpricehub -h localhost

# 查看数据库日志
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

#### 3. Nginx 502 错误

```bash
# 检查后端是否运行
pm2 status

# 检查 Nginx 日志
sudo tail -f /var/log/nginx/carpricehub-error.log

# 检查 SELinux (CentOS)
sudo setsebool -P httpd_can_network_connect 1
```

#### 4. SSL 证书问题

```bash
# 续期证书
sudo certbot renew

# 测试证书
openssl s_client -connect yourdomain.com:443
```

---

## 📝 维护命令

### 服务管理

```bash
# 重启后端
pm2 restart carpricehub-api

# 重启 Nginx
sudo systemctl restart nginx

# 重启 PostgreSQL
sudo systemctl restart postgresql

# 查看所有服务状态
pm2 status
sudo systemctl status nginx
sudo systemctl status postgresql
```

### 日志查看

```bash
# 后端日志
pm2 logs carpricehub-api

# Nginx 日志
sudo tail -f /var/log/nginx/carpricehub-access.log
sudo tail -f /var/log/nginx/carpricehub-error.log

# 系统日志
sudo journalctl -u nginx -f
```

### 更新部署

```bash
# 拉取最新代码
cd /var/www/carpricehub
git pull origin main

# 更新后端
cd backend-node
npm install --production
pm2 restart carpricehub-api

# 更新前端
cd ../frontend
npm install
npm run build
sudo cp -r dist/* /var/www/carpricehub/html/
```

---

## 🎯 性能优化

### 1. Node.js 优化

```javascript
// ecosystem.config.js
{
  instances: 'max',           // 使用所有 CPU 核心
  max_memory_restart: '1G',   // 内存超过 1G 重启
  node_args: '--max-old-space-size=2048'  // 增加内存限制
}
```

### 2. PostgreSQL 优化

```sql
-- 创建索引
CREATE INDEX idx_cars_brand ON cars(brand);
CREATE INDEX idx_cars_price ON cars(price_discount);
CREATE INDEX idx_cars_energy ON cars(energy_type);

-- 定期清理
VACUUM ANALYZE;
```

### 3. Nginx 优化

```nginx
# 开启文件缓存
open_file_cache max=1000 inactive=20s;
open_file_cache_valid 30s;
open_file_cache_min_uses 2;
open_file_cache_errors on;

# 连接优化
worker_processes auto;
worker_connections 2048;
keepalive_timeout 65;
```

---

## ✅ 部署检查清单

- [ ] 服务器环境配置完成
- [ ] PostgreSQL 数据库初始化
- [ ] 后端服务运行正常
- [ ] 前端静态文件部署
- [ ] Nginx 配置正确
- [ ] SSL 证书配置完成
- [ ] PM2 进程守护启动
- [ ] 监控告警配置
- [ ] 备份策略设置
- [ ] 防火墙规则配置
- [ ] 日志轮转配置
- [ ] 性能优化完成

---

**部署完成后,访问 https://yourdomain.com 查看应用!**

**最后更新**: 2026-03-19
