# 🚗 车价通 CarPriceHub

> 基于 Tauri 的多端汽车价格查询 App，让每位购车用户在 30 秒内找到最优购车方案

## 🎯 项目特点

- **全平台支持**: Windows / macOS / Linux / iOS / Android
- **智能推荐**: 根据用户财务状况、家庭情况、用车需求综合推荐
- **实时价格**: 官方价、优惠价、贷款贴息、置换补贴一目了然
- **多车对比**: 最多 4 款车型横向对比
- **价格提醒**: 目标价到达时系统主动通知

## 🏗️ 技术架构

```
├── frontend/          # React + TypeScript 前端
│   ├── src/
│   │   ├── components/   # UI 组件
│   │   ├── pages/        # 页面
│   │   ├── store/        # Zustand 状态管理
│   │   └── types/        # TypeScript 类型定义
│   └── package.json
│
├── backend/           # Rust Axum 后端 (生产环境)
│   ├── src/
│   │   ├── main.rs       # 服务入口
│   │   ├── db.rs         # 数据库层
│   │   ├── handlers.rs   # HTTP 接口
│   │   ├── recommend.rs  # 推荐算法
│   │   └── websocket.rs  # 实时推送
│   └── Cargo.toml
│
├── backend-node/      # Node.js Express 后端 (开发环境)
│   ├── server.js         # 服务入口
│   ├── cars-data.js      # 示例数据
│   ├── recommend.js      # 推荐算法
│   └── package.json
│
├── shared/            # 前后端共享类型
│   ├── src/types.rs
│   └── Cargo.toml
│
├── migrations/        # 数据库迁移
│   ├── 001_init_schema.sql
│   └── 002_seed_data.sql
│
├── crawler/           # 爬虫模块
│   ├── carprice_crawler/  # Scrapy 爬虫
│   └── requirements.txt
│
├── docker-compose.yml # Docker 编排配置
└── Cargo.toml         # Workspace 配置
```

## 🚀 快速开始

### 方式一: Docker 部署 (推荐)

最简单的部署方式,一键启动完整应用:

```bash
# 1. 克隆项目
git clone https://github.com/Tshameless/CarPriceHub.git
cd CarPriceHub

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件,修改 DB_PASSWORD 和 JWT_SECRET

# 3. 启动所有服务
docker-compose up -d

# 4. 访问应用
# 前端: http://localhost
# 后端: http://localhost/api
```

详细说明请查看 [Docker 部署指南](./DOCKER.md)

### 方式二: 本地开发环境

#### 前置要求

- **Node.js**: >= 18.x (开发环境必需)
- **Rust**: 最新稳定版 (生产环境可选)
- **PostgreSQL**: >= 14.x (可选,有示例数据)
- **Docker**: >= 20.10 (可选)

#### 使用 Node.js 后端 (开发环境推荐)

```bash
# 1. 启动后端
cd backend-node
npm install
npm start
# 后端运行在 http://localhost:8080

# 2. 启动前端 (新终端)
cd frontend
npm install
npm run dev
# 前端运行在 http://localhost:5173
```

#### 使用 Rust 后端 (生产环境)

```bash
# 1. 创建数据库
psql -U postgres
CREATE DATABASE carpricehub;
\q

# 2. 配置环境变量
cd backend
cp .env.example .env
# 编辑 .env 填入实际配置

# 3. 运行数据库迁移
psql -U postgres -d carpricehub -f ../migrations/001_init_schema.sql
psql -U postgres -d carpricehub -f ../migrations/002_seed_data.sql

# 4. 启动后端服务
cargo run --release
# 后端运行在 http://localhost:8080
```

### 方式三: 生产环境部署

详细的生产环境部署指南,请查看:
- [部署方案对比](./部署方案对比.md) - Node.js vs Rust 性能对比
- [生产环境部署指南](./DEPLOYMENT.md) - 完整部署流程
- [Docker 部署指南](./DOCKER.md) - Docker 详细说明

### 构建 Tauri 应用

```bash
# 1. 安装 Tauri CLI
cargo install tauri-cli

# 2. 初始化 Tauri（首次）
cargo tauri init

# 3. 开发模式运行
cargo tauri dev

# 4. 构建生产版本
cargo tauri build
```

## 📊 核心功能

### 1. 价格查询
- 支持品牌、车型、价格区间、能源类型筛选
- 显示官方价、优惠价、直接优惠金额
- 贷款贴息、置换补贴详细信息

### 2. 智能推荐
- 用户画像采集（财务、家庭、用车情况）
- 综合评分模型（6 个维度加权计算）
- 风险警示（月供超收入 30% 自动提醒）

### 3. 多车对比
- 最多 4 款车型同屏对比
- 价格、配置、优惠多维度对比
- 差异项高亮显示

### 4. 价格提醒
- 设置目标价
- WebSocket 实时推送变价通知
- 系统通知（桌面端）或推送通知（移动端）

## 🔧 开发说明

### 数据库迁移

```bash
# 创建新迁移
sqlx migrate add <migration_name>

# 运行迁移
sqlx migrate run

# 回滚迁移
sqlx migrate revert
```

### API 文档

主要接口：

- `POST /api/v1/cars/search` - 搜索车型
- `GET /api/v1/cars/:id/price-detail` - 获取价格详情
- `POST /api/v1/recommend` - 智能推荐
- `WSS /ws` - WebSocket 实时推送

### 代码风格

- **Rust**: 使用 `cargo fmt` 和 `cargo clippy`
- **TypeScript**: 使用 ESLint + Prettier

```bash
# 后端
cargo fmt
cargo clippy

# 前端
npm run lint
npm run format
```

## 📦 部署说明

### 部署方案选择

| 方案 | 适用场景 | 性能 | 难度 |
|------|---------|------|------|
| **Docker** | 生产环境、快速部署 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Node.js** | 开发测试、中小规模应用 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Rust** | 生产环境、高并发场景 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**推荐方案**: 
- 初期 (日活 < 1万): Node.js 或 Docker
- 增长期 (日活 > 1万): 迁移到 Rust

详细对比请查看 [部署方案对比](./部署方案对比.md)

### 快速部署

#### Docker 部署 (推荐)

```bash
# 配置环境变量
cp .env.example .env

# 启动服务
docker-compose up -d

# 查看状态
docker-compose ps
```

#### 传统部署

```bash
# Node.js 后端
cd backend-node
npm install --production
pm2 start ecosystem.config.js

# 前端构建
cd frontend
npm run build
# 将 dist/ 目录部署到 Nginx
```

详细步骤请查看 [生产环境部署指南](./DEPLOYMENT.md)

### 环境变量配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| DATABASE_URL | PostgreSQL 连接串 | - |
| REDIS_URL | Redis 连接串（可选） | - |
| SERVER_HOST | 服务监听地址 | 127.0.0.1 |
| SERVER_PORT | 服务监听端口 | 8080 |
| JWT_SECRET | JWT 签名密钥 | - |
| NODE_ENV | 运行环境 | development |

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 License

MIT License

## 🙏 致谢

- [Tauri](https://tauri.app/) - 跨平台应用框架
- [Axum](https://github.com/tokio-rs/axum) - Rust Web 框架
- [Express](https://expressjs.com/) - Node.js Web 框架
- [React](https://react.dev/) - 前端框架
- [Ant Design](https://ant.design/) - UI 组件库
- [Scrapy](https://scrapy.org/) - Python 爬虫框架

## 📚 文档

- [项目概览](./PROJECT_SUMMARY.md) - 项目整体介绍
- [部署方案对比](./部署方案对比.md) - Node.js vs Rust 详细对比
- [生产环境部署指南](./DEPLOYMENT.md) - 完整部署流程
- [Docker 部署指南](./DOCKER.md) - Docker 详细说明
- [项目完成报告](./项目完成报告.md) - 技术实现细节
