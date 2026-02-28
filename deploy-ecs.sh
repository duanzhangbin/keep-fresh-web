#!/bin/bash
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   FreshKeep 自动化部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"

# ==================== 配置区 ====================
DEPLOY_DIR="/opt/keep-fresh-web"
# ⚠️ 请替换为你的 GitHub 仓库地址
GITHUB_REPO="https://github.com/duanzhangbin/keep-fresh-web.git"
# ===============================================

# 检查依赖
for cmd in docker git npm; do
    if ! command -v $cmd &> /dev/null; then
        echo -e "${RED}错误：请先安装 $cmd${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✓ 所有依赖已安装 (Docker, Git, NPM)${NC}"

# 停止旧容器
echo -e "${YELLOW}>>> 停止旧容器（如有）...${NC}"
docker rm -f freshkeep 2>/dev/null || true

# 克隆或更新代码
if [ -d "$DEPLOY_DIR/.git" ]; then
    echo -e "${YELLOW}>>> 检测到已有代码，执行 git pull...${NC}"
    cd $DEPLOY_DIR
    git fetch --all
    git reset --hard origin/main || git reset --hard origin/master
    git pull
else
    echo -e "${YELLOW}>>> 克隆代码到 $DEPLOY_DIR...${NC}"
    mkdir -p $DEPLOY_DIR
    git clone $GITHUB_REPO $DEPLOY_DIR
    cd $DEPLOY_DIR
fi

# 检查 .env 文件
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}✗ backend/.env 文件不存在${NC}"
    echo -e "${YELLOW}请将本地的 .env 文件上传到服务器：${NC}"
    echo -e "  scp backend/.env root@YOUR_SERVER_IP:$DEPLOY_DIR/backend/"
    exit 1
fi
echo -e "${GREEN}✓ backend/.env 已找到${NC}"

# 加载环境变量
source backend/.env

# 验证必要的环境变量
for var in DATABASE_URL JWT_SECRET QWEN_API_KEY; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}错误：请设置 $var${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✓ 环境变量验证通过${NC}"

# 构建前端
echo -e "${YELLOW}>>> 构建前端...${NC}"
cd frontend
npm install
npm run build
cd ..

# 构建后端
echo -e "${YELLOW}>>> 构建后端...${NC}"
cd backend
npm install
npx prisma generate
cd ..

# 构建 Docker 镜像
echo -e "${YELLOW}>>> 构建 Docker 镜像...${NC}"
docker build -t freshkeep:latest .

# 启动容器
echo -e "${YELLOW}>>> 启动容器...${NC}"
docker run -d \
    --name freshkeep \
    -p 80:80 \
    -e DATABASE_URL="${DATABASE_URL}" \
    -e JWT_SECRET="${JWT_SECRET}" \
    -e QWEN_API_KEY="${QWEN_API_KEY}" \
    -e QWEN_MODEL="${QWEN_MODEL:-qwen-vl-plus}" \
    -e VAPID_PUBLIC_KEY="${VAPID_PUBLIC_KEY:-}" \
    -e VAPID_PRIVATE_KEY="${VAPID_PRIVATE_KEY:-}" \
    --restart unless-stopped \
    freshkeep:latest

# 等待容器启动
sleep 3

# 检查容器状态
if docker ps | grep -q freshkeep; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}   🎉 部署成功！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "服务访问地址：${GREEN}http://115.190.248.195${NC}"
    echo ""
    echo "容器信息："
    docker ps | grep freshkeep
    echo ""
    echo -e "${YELLOW}常用命令：${NC}"
    echo -e "  查看日志：docker logs -f freshkeep"
    echo -e "  重启容器：docker restart freshkeep"
    echo -e "  停止容器：docker stop freshkeep"
    echo -e "  进入容器：docker exec -it freshkeep bash"
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}   部署失败，请检查日志${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo "容器日志："
    docker logs freshkeep --tail 50
    exit 1
fi
