# CarPriceHub Docker 部署指南

> 使用 Docker Compose 一键部署完整应用

---

## 📋 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 4GB 可用内存

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/Tshameless/CarPriceHub.git
cd CarPriceHub
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置
nano .env
```

修改以下配置:

```env
DB_PASSWORD=your-strong-password-here
JWT_SECRET=your-jwt-secret-key-here
```

### 3. 启动服务

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 4. 访问应用

- **前端**: http://localhost
- **后端 API**: http://localhost/api
- **健康检查**: http://localhost/api/health

---

## 🛠️ 服务管理

### 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 仅启动特定服务
docker-compose up -d postgres backend
```

### 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v
```

### 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend
```

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 进入容器

```bash
# 进入后端容器
docker-compose exec backend sh

# 进入数据库容器
docker-compose exec postgres psql -U carpricehub_user -d carpricehub
```

---

## 📊 服务架构

```
┌─────────────┐
│   用户请求   │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  Frontend (Nginx)│ :80
│  React + Vite    │
└──────┬───────────┘
       │ /api/*
       ▼
┌──────────────────┐
│  Backend (Node)  │ :8080
│  Express API     │
└──────┬───────────┘
       │
       ├──────────────┐
       ▼              ▼
┌──────────────┐ ┌──────────────┐
│  PostgreSQL  │ │    Redis     │
│   Database   │ │    Cache     │
└──────────────┘ └──────────────┘
```

---

## 🔧 配置说明

### 端口映射

默认端口映射:

| 服务 | 容器端口 | 主机端口 | 说明 |
|------|---------|---------|------|
| frontend | 80 | 80 | 前端 Web 服务 |
| backend | 8080 | - | 后端 API (内部) |
| postgres | 5432 | 5432 | 数据库 (可选暴露) |
| redis | 6379 | 6379 | 缓存 (可选暴露) |

如需修改端口,编辑 `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # 修改为 8080 端口
```

### 数据持久化

数据卷说明:

- `postgres_data`: PostgreSQL 数据库文件
- `redis_data`: Redis 持久化数据

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| DB_PASSWORD | 数据库密码 | changeme |
| JWT_SECRET | JWT 签名密钥 | - |
| NODE_ENV | 运行环境 | production |

---

## 🏗️ 生产环境部署

### 1. 使用 HTTPS

创建 `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  nginx-proxy:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-proxy.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - frontend

  frontend:
    expose:
      - "80"
```

### 2. 配置 SSL 证书

使用 Let's Encrypt:

```bash
# 安装 certbot
sudo apt install certbot

# 获取证书
sudo certbot certonly --standalone -d yourdomain.com

# 复制证书
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./certs/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./certs/
```

### 3. 启动生产环境

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 📈 性能优化

### 资源限制

在 `docker-compose.yml` 中添加资源限制:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '1'
          memory: 512M
```

### 水平扩展

```bash
# 扩展后端服务到 3 个实例
docker-compose up -d --scale backend=3

# 需要配置负载均衡器
```

---

## 🔍 故障排查

### 容器无法启动

```bash
# 查看容器状态
docker-compose ps

# 查看详细日志
docker-compose logs backend

# 检查容器配置
docker-compose config
```

### 数据库连接失败

```bash
# 检查数据库是否运行
docker-compose ps postgres

# 测试数据库连接
docker-compose exec postgres pg_isready -U carpricehub_user

# 查看数据库日志
docker-compose logs postgres
```

### 前端无法访问后端

```bash
# 检查网络
docker network ls
docker network inspect carpricehub_carpricehub-network

# 检查后端健康状态
docker-compose exec backend wget -qO- http://localhost:8080/health
```

### 清理并重新部署

```bash
# 停止并删除所有容器、网络、卷
docker-compose down -v

# 重新构建镜像
docker-compose build --no-cache

# 启动服务
docker-compose up -d
```

---

## 💾 数据备份

### 备份数据库

```bash
# 导出数据库
docker-compose exec postgres pg_dump -U carpricehub_user carpricehub > backup.sql

# 或使用 docker exec
docker exec carpricehub-db pg_dump -U carpricehub_user carpricehub > backup.sql
```

### 恢复数据库

```bash
# 导入数据库
cat backup.sql | docker-compose exec -T postgres psql -U carpricehub_user carpricehub
```

---

## 🔄 更新部署

### 更新代码

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose up -d --build

# 仅重新构建特定服务
docker-compose up -d --build backend
```

### 零停机更新

```bash
# 使用滚动更新
docker-compose up -d --no-deps --build backend
```

---

## 📝 常用命令

```bash
# 查看运行状态
docker-compose ps

# 查看资源使用
docker stats

# 进入容器
docker-compose exec backend sh

# 查看网络
docker network ls

# 查看卷
docker volume ls

# 清理未使用资源
docker system prune -a

# 查看镜像大小
docker images
```

---

## ✅ 部署检查清单

- [ ] 修改默认密码 (DB_PASSWORD, JWT_SECRET)
- [ ] 配置 HTTPS (生产环境)
- [ ] 设置资源限制
- [ ] 配置日志收集
- [ ] 设置监控告警
- [ ] 配置数据库备份
- [ ] 测试健康检查
- [ ] 配置防火墙规则

---

## 📞 获取帮助

如有问题,请查看:

1. 项目文档: `README.md`, `DEPLOYMENT.md`
2. Docker 日志: `docker-compose logs`
3. GitHub Issues: https://github.com/Tshameless/CarPriceHub/issues

---

**最后更新**: 2026-03-19
