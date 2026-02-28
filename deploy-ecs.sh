#!/bin/bash
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   FreshKeep ECS 一键部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查是否在正确目录
if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}错误：请在项目根目录执行此脚本${NC}"
    exit 1
fi

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误：请先安装 Docker${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker 已安装${NC}"

# 检查 .env 文件
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}错误：backend/.env 文件不存在${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 找到 .env 配置文件${NC}"

# 从 .env 读取环境变量
source backend/.env

# 检查必要的环境变量
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}错误：请设置 DATABASE_URL${NC}"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo -e "${RED}错误：请设置 JWT_SECRET${NC}"
    exit 1
fi

if [ -z "$QWEN_API_KEY" ]; then
    echo -e "${RED}错误：请设置 QWEN_API_KEY${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 环境变量检查通过${NC}"

# 安装依赖
echo -e "${YELLOW}>>> 安装依赖...${NC}"

echo -e "${YELLOW}>>> 构建前端...${NC}"
cd frontend
npm install
npm run build
cd ..

echo -e "${YELLOW}>>> 安装后端依赖...${NC}"
cd backend
npm install
npx prisma generate
cd ..

# 构建 Docker 镜像
echo -e "${YELLOW}>>> 构建 Docker 镜像...${NC}"
docker build -t freshkeep:latest .

# 停止并删除旧容器
echo -e "${YELLOW}>>> 停止旧容器（如有）...${NC}"
docker rm -f freshkeep 2>/dev/null || true

# 启动新容器
echo -e "${YELLOW}>>> 启动新容器...${NC}"
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

# 等待容器启动
sleep 3

# 检查容器状态
echo -e "${YELLOW}>>> 检查容器状态...${NC}"
if docker ps | grep -q freshkeep; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}   部署成功！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "服务访问地址：${GREEN}http://115.190.248.195${NC}"
    echo ""
    echo "容器信息："
    docker ps | grep freshkeep
    echo ""
    echo -e "${YELLOW}查看日志：${NC}docker logs -f freshkeep"
    echo -e "${YELLOW}重启容器：${NC}docker restart freshkeep"
    echo -e "${YELLOW}停止容器：${NC}docker stop freshkeep"
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}   部署失败，请检查日志${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo "容器日志："
    docker logs freshkeep --tail 50
    exit 1
fi
