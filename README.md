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
├── backend/           # Rust Axum 后端
│   ├── src/
│   │   ├── main.rs       # 服务入口
│   │   ├── db.rs         # 数据库层
│   │   ├── handlers.rs   # HTTP 接口
│   │   ├── recommend.rs  # 推荐算法
│   │   └── websocket.rs  # 实时推送
│   └── Cargo.toml
│
├── shared/            # 前后端共享类型
│   ├── src/types.rs
│   └── Cargo.toml
│
├── migrations/        # 数据库迁移
│   └── 001_create_tables.sql
│
└── Cargo.toml         # Workspace 配置
```

## 🚀 快速开始

### 前置要求

- **Rust**: 安装 Rust 工具链
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```

- **Node.js**: >= 18.x
  ```bash
  # Windows: 从 https://nodejs.org 下载安装
  ```

- **PostgreSQL**: >= 14.x
  ```bash
  # Windows: 从 https://www.postgresql.org/download/ 下载安装
  ```

### 后端启动

```bash
# 1. 创建数据库
psql -U postgres
CREATE DATABASE carpricehub;
\q

# 2. 配置环境变量
cd backend
cp .env.example .env
# 编辑 .env 填入实际配置

# 3. 安装 sqlx-cli (首次)
cargo install sqlx-cli

# 4. 运行数据库迁移
sqlx migrate run

# 5. 启动后端服务
cargo run
```

后端服务将在 `http://localhost:8080` 启动

### 前端启动

```bash
# 1. 安装依赖
cd frontend
npm install

# 2. 启动开发服务器
npm run dev
```

前端服务将在 `http://localhost:5173` 启动

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

## 📦 生产部署

### Docker 部署（推荐）

```bash
# 构建镜像
docker build -t carpricehub-backend ./backend

# 运行容器
docker run -d \
  -p 8080:8080 \
  -e DATABASE_URL=postgresql://... \
  carpricehub-backend
```

### 环境变量配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| DATABASE_URL | PostgreSQL 连接串 | - |
| REDIS_URL | Redis 连接串（可选） | - |
| SERVER_HOST | 服务监听地址 | 127.0.0.1 |
| SERVER_PORT | 服务监听端口 | 8080 |
| FRONTEND_URL | 前端地址（CORS） | http://localhost:5173 |

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
- [React](https://react.dev/) - 前端框架
- [Ant Design](https://ant.design/) - UI 组件库
