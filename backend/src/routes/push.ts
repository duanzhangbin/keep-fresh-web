import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getVapidPublicKey, saveSubscription, deleteSubscription } from '../services/push.service.js';

interface PushBody {
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
}

interface UnsubscribeBody {
  endpoint: string;
}

export async function pushRoutes(fastify: FastifyInstance) {
  // 获取 VAPID 公钥
  fastify.get('/push/vapid-key', async (request: FastifyRequest, reply: FastifyReply) => {
    return { publicKey: getVapidPublicKey() };
  });

  // 订阅推送
  fastify.post<{ Body: PushBody }>('/push/subscribe', async (request: FastifyRequest<{ Body: PushBody }>, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user) {
      return reply.status(401).send({ error: '未授权' });
    }

    const { subscription } = request.body;
    if (!subscription || !subscription.endpoint) {
      return reply.status(400).send({ error: '无效的订阅信息' });
    }

    await saveSubscription(user.userId, subscription);
    return { success: true };
  });

  // 取消订阅
  fastify.delete<{ Body: UnsubscribeBody }>('/push/unsubscribe', async (request: FastifyRequest<{ Body: UnsubscribeBody }>, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user) {
      return reply.status(401).send({ error: '未授权' });
    }

    const { endpoint } = request.body;
    if (!endpoint) {
      return reply.status(400).send({ error: '无效的端点' });
    }

    await deleteSubscription(user.userId, endpoint);
    return { success: true };
  });

  // 检查订阅状态
  fastify.get('/push/status', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user) {
      return reply.status(401).send({ error: '未授权' });
    }

    const prisma = (await import('../lib/prisma.js')).default;
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: user.userId },
      select: { endpoint: true, createdAt: true },
    });

    return { subscribed: subscriptions.length > 0 };
  });
}
