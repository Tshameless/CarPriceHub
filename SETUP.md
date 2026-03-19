# ── 环境配置说明 ─────────────────────────────────────────────

## Windows 环境安装指南

### 1. 安装 Rust

```powershell
# 下载并运行 Rust 安装程序
Invoke-WebRequest -Uri https://win.rustup.rs/x86_64 -OutFile rustup-init.exe
.\rustup-init.exe

# 安装完成后重启终端，验证
rustc --version
cargo --version
```

### 2. 安装 PostgreSQL

1. 从官网下载: https://www.postgresql.org/download/windows/
2. 安装时设置密码（记住这个密码）
3. 默认端口: 5432
4. 安装完成后，将 PostgreSQL 的 bin 目录添加到系统 PATH

```powershell
# 验证
psql --version

# 创建数据库
psql -U postgres
CREATE DATABASE carpricehub;
\q
```

### 3. 安装 Node.js

1. 从官网下载 LTS 版本: https://nodejs.org/
2. 安装时勾选 "Add to PATH"
3. 验证:

```powershell
node --version
npm --version
```

### 4. 安装项目依赖

```powershell
# 后端依赖
cd backend
cargo build

# 前端依赖
cd frontend
npm install
```

### 5. 配置数据库

```powershell
# 安装 sqlx-cli
cargo install sqlx-cli

# 配置环境变量（复制并编辑）
cd backend
copy .env.example .env
# 用记事本编辑 .env，填入实际的数据库密码

# 运行迁移
cd ..
sqlx migrate run
```

### 6. 启动项目

```powershell
# 方式1: 使用启动脚本
.\start.ps1

# 方式2: 手动启动
# 终端1 - 后端
cd backend
cargo run

# 终端2 - 前端
cd frontend
npm run dev
```

### 常见问题

**Q: cargo 命令找不到**
A: 重启终端或重启电脑，确保 Rust 安装时添加到了 PATH

**Q: PostgreSQL 连接失败**
A: 
1. 检查 PostgreSQL 服务是否启动（服务管理器中查看）
2. 检查 .env 中的密码是否正确
3. 检查防火墙是否放行 5432 端口

**Q: 前端启动报错**
A:
1. 删除 node_modules 文件夹
2. 运行 `npm install`
3. 如果还是失败，尝试 `npm cache clean --force`

**Q: sqlx migrate 报错**
A: 确保已设置 DATABASE_URL 环境变量或 .env 文件

## 开发工具推荐

- **IDE**: VS Code + rust-analyzer 插件
- **数据库工具**: DBeaver 或 pgAdmin
- **API 测试**: Postman 或 curl
