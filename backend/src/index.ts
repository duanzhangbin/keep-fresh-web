import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from 'jsonwebtoken';
import { authRoutes } from './routes/auth.js';
import { itemRoutes } from './routes/items.js';
import { settingsRoutes } from './routes/settings.js';
import { categoryRoutes } from './routes/categories.js';
import { locationRoutes } from './routes/locations.js';
import { recognizeRoutes } from './routes/recognize.js';
import { pushRoutes } from './routes/push.js';
import { initializeAllReminders } from './jobs/reminder.job.js';

const fastify = Fastify({
  logger: true,
});

async function start() {
  try {
    // 注册 CORS
    await fastify.register(cors, {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    });

    // 全局认证中间件
    fastify.addHook('preHandler', async (request, reply) => {
      const publicPaths = ['/auth/login', '/auth/register', '/health', '/recognize', '/push/vapid-key'];
      
      if (publicPaths.some(path => request.url.startsWith(path))) {
        return;
      }

      try {
        const auth = request.headers.authorization;
        if (!auth || !auth.startsWith('Bearer ')) {
          return reply.status(401).send({ error: '未授权，请先登录' });
        }

        const token = auth.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        (request as any).user = decoded;
      } catch (err) {
        return reply.status(401).send({ error: 'Token 无效或已过期' });
      }
    });

    // 注册路由
    await fastify.register(authRoutes);
    await fastify.register(itemRoutes);
    await fastify.register(settingsRoutes);
    await fastify.register(categoryRoutes);
    await fastify.register(locationRoutes);
    await fastify.register(recognizeRoutes);
    await fastify.register(pushRoutes);

    // 初始化定时提醒任务
    await initializeAllReminders();

    // 健康检查
    fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    const port = Number(process.env.PORT) || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
