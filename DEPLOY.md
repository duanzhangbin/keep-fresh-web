# FreshKeep 部署指南

## 📋 前置要求

- ECS 服务器已安装：Docker、Git、Node.js
- 已将代码推送到 GitHub 仓库
- 本地有 `backend/.env` 配置文件

---

## 🚀 首次部署步骤

### 1️⃣ 修改部署脚本

编辑 `deploy-ecs.sh`，替换 GitHub 仓库地址：

```bash
GITHUB_REPO="https://github.com/YOUR_USERNAME/freshkeep-web.git"
```

改为你的实际仓库地址，例如：
```bash
GITHUB_REPO="https://github.com/johndoe/freshkeep-web.git"
```

### 2️⃣ 上传 .env 文件到服务器

在本地执行（Windows PowerShell 或 Git Bash）：

```bash
scp backend/.env root@115.190.248.195:/opt/freshkeep/backend/
```

如果 `/opt/freshkeep` 目录不存在，先创建：
```bash
ssh root@115.190.248.195 "mkdir -p /opt/freshkeep"
scp backend/.env root@115.190.248.195:/opt/freshkeep/backend/
```

### 3️⃣ 登录服务器执行部署

```bash
# SSH 登录
ssh root@115.190.248.195

# 进入项目目录
cd /opt/freshkeep

# 给脚本执行权限
chmod +x deploy-ecs.sh

# 执行部署
./deploy-ecs.sh
```

### 4️⃣ 验证部署

部署成功后，浏览器访问：
```
http://115.190.248.195
```

---

## 🔄 后续更新部署

代码更新后，在服务器上执行：

```bash
cd /opt/freshkeep
./deploy-ecs.sh
```

脚本会自动：
1. 执行 `git pull` 拉取最新代码
2. 重新构建前端和后端
3. 重建 Docker 镜像
4. 重启容器

---

## 🔧 常用运维命令

```bash
# 查看容器状态
docker ps | grep freshkeep

# 查看实时日志
docker logs -f freshkeep

# 查看最近 100 行日志
docker logs freshkeep --tail 100

# 重启容器
docker restart freshkeep

# 停止容器
docker stop freshkeep

# 启动容器
docker start freshkeep

# 进入容器
docker exec -it freshkeep bash

# 查看容器资源占用
docker stats freshkeep

# 删除容器（保留镜像）
docker rm freshkeep

# 删除镜像
docker rmi freshkeep:latest
```

---

## 📝 .env 配置说明

```env
# 数据库连接
DATABASE_URL="postgresql://user:password@host:5432/database"

# JWT 密钥（建议 32 位以上随机字符串）
JWT_SECRET=your_jwt_secret_here

# 阿里云百炼 Qwen API
QWEN_API_KEY=sk-xxxxxxxxxxxxxxxx
QWEN_MODEL=qwen-vl-plus

# Web Push VAPID 密钥（可选）
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

生成 VAPID 密钥：
```bash
npx web-push generate-vapid-keys
```

---

## ⚠️ 故障排查

### 容器启动失败

```bash
# 查看完整日志
docker logs freshkeep

# 检查端口占用
netstat -tlnp | grep :80

# 手动测试容器
docker run --rm -it freshkeep:latest /bin/bash
```

### 数据库连接失败

```bash
# 在容器内测试数据库连接
docker exec -it freshkeep bash
cd backend
npx prisma db pull
```

### 前端无法访问

```bash
# 检查 Nginx 配置
docker exec -it freshkeep cat /etc/nginx/http.d/freshkeep.conf

# 检查前端文件
docker exec -it freshkeep ls -la /opt/freshkeep/frontend/dist
```

---

## 📦 完全重新部署

```bash
# 1. 停止并删除容器
docker rm -f freshkeep

# 2. 删除镜像
docker rmi freshkeep:latest

# 3. 删除代码（可选）
rm -rf /opt/freshkeep

# 4. 重新执行部署脚本
./deploy-ecs.sh
```

---

## 🔐 安全建议

1. **不要将 `.env` 提交到 Git** - 已添加到 `.gitignore`
2. **定期更新 JWT_SECRET** - 使用 `openssl rand -hex 32` 生成
3. **配置防火墙** - 只开放必要端口（80, 443）
4. **使用 HTTPS** - 生产环境建议配置 SSL 证书
5. **定期备份数据库** - 使用 `pg_dump` 导出数据

---

## 📞 技术支持

遇到问题请查看：
- 项目文档：`/docs/goods_spec_web.md`
- 容器日志：`docker logs -f freshkeep`
- Prisma 错误：`docker exec -it freshkeep npx prisma db pull`
