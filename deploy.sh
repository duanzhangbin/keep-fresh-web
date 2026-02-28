#!/bin/bash
set -e

echo "=== FreshKeep Docker 部署开始 ==="

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "错误: 请先安装 Docker"
    exit 1
fi

# 检查是否在正确目录
if [ ! -f "Dockerfile" ]; then
    echo "错误: 请在项目根目录执行此脚本"
    exit 1
fi

# 检查环境变量
if [ -z "$DATABASE_URL" ]; then
    echo "错误: 请设置 DATABASE_URL 环境变量"
    exit 1
fi

# 构建前端
echo "=== 构建前端 ==="
cd /opt/freshkeep/frontend
npm install
npm run build
cd ..

# 构建 Docker 镜像
echo "=== 构建 Docker 镜像 ==="
docker build -t freshkeep:latest .

# 重启容器
echo "=== 重启服务 ==="
docker rm -f freshkeep 2>/dev/null || true

docker run -d \
    --name freshkeep \
    -p 80:80 \
    -e DATABASE_URL="${DATABASE_URL}" \
    -e JWT_SECRET="${JWT_SECRET}" \
    -e QWEN_API_KEY="${QWEN_API_KEY}" \
    -e QWEN_MODEL="${QWEN_MODEL:-qwen-vl-plus}" \
    -e VAPID_PUBLIC_KEY="${VAPID_PUBLIC_KEY}" \
    -e VAPID_PRIVATE_KEY="${VAPID_PRIVATE_KEY}" \
    --restart unless-stopped \
    freshkeep:latest

echo "=== 部署完成 ==="
echo "访问 http://115.190.248.195"
docker ps | grep freshkeep
