import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../lib/prisma.js';

export async function settingsRoutes(fastify: FastifyInstance) {
  // 获取用户设置
  fastify.get('/settings', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user) {
      return reply.status(401).send({ error: '未授权' });
    }

    let settings = await prisma.settings.findUnique({
      where: { userId: user.userId },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: { userId: user.userId },
      });
    }

    return settings;
  });

  // 更新用户设置
  fastify.put('/settings', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user) {
      return reply.status(401).send({ error: '未授权' });
    }

    const data = request.body as any;

    const settings = await prisma.settings.upsert({
      where: { userId: user.userId },
      update: data,
      create: { userId: user.userId, ...data },
    });

    return settings;
  });
}
