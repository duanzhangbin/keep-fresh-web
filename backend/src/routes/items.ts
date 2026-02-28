import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../lib/prisma.js';

interface ItemQuery {
  category?: string;
  location?: string;
  status?: string;
}

interface ItemBody {
  name: string;
  prodDate?: string;
  expDate?: string;
  category?: string;
  location?: string;
  imagePath?: string;
  openDate?: string;
  shelfLifeAfterOpen?: number;
}

export async function itemRoutes(fastify: FastifyInstance) {
  // 获取物品列表
  fastify.get('/items', async (request: FastifyRequest<{ Querystring: ItemQuery }>, reply: FastifyReply) => {
    const user = (request as any).user;
    const { category, location, status } = request.query;

    const items = await prisma.item.findMany({
      where: {
        userId: user.userId,
        ...(category && { category }),
        ...(location && { location }),
        ...(status && { status: parseInt(status) }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return items;
  });

  // 获取单个物品
  fastify.get('/items/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = (request as any).user;
    const { id } = request.params;

    const item = await prisma.item.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!item) {
      return reply.status(404).send({ error: '物品不存在' });
    }

    return item;
  });

  // 创建物品
  fastify.post<{ Body: ItemBody }>('/items', async (request: FastifyRequest<{ Body: ItemBody }>, reply: FastifyReply) => {
    const user = (request as any).user;
    const data = request.body;

    const item = await prisma.item.create({
      data: {
        ...data,
        userId: user.userId,
      },
    });

    return item;
  });

  // 更新物品
  fastify.put<{ Params: { id: string }; Body: ItemBody }>('/items/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: ItemBody }>, reply: FastifyReply) => {
    const user = (request as any).user;
    const { id } = request.params;
    const data = request.body;

    const existingItem = await prisma.item.findFirst({
      where: { id, userId: user.userId },
    });

    if (!existingItem) {
      return reply.status(404).send({ error: '物品不存在' });
    }

    const item = await prisma.item.update({
      where: { id },
      data,
    });

    return item;
  });

  // 删除物品
  fastify.delete('/items/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = (request as any).user;
    const { id } = request.params;

    const existingItem = await prisma.item.findFirst({
      where: { id, userId: user.userId },
    });

    if (!existingItem) {
      return reply.status(404).send({ error: '物品不存在' });
    }

    await prisma.item.delete({
      where: { id },
    });

    return { success: true };
  });

  // 标记已开封
  fastify.post('/items/:id/open', async (request: FastifyRequest<{ Params: { id: string }; Body: { openDate?: string; shelfLifeAfterOpen?: number } }>, reply: FastifyReply) => {
    const user = (request as any).user;
    const { id } = request.params;
    const { openDate, shelfLifeAfterOpen } = request.body;

    const existingItem = await prisma.item.findFirst({
      where: { id, userId: user.userId },
    });

    if (!existingItem) {
      return reply.status(404).send({ error: '物品不存在' });
    }

    const item = await prisma.item.update({
      where: { id },
      data: {
        status: 1,
        openDate,
        shelfLifeAfterOpen,
      },
    });

    return item;
  });

  // 标记状态 (已消耗/已丢弃)
  fastify.post('/items/:id/status', async (request: FastifyRequest<{ Params: { id: string }; Body: { status: number } }>, reply: FastifyReply) => {
    const user = (request as any).user;
    const { id } = request.params;
    const { status } = request.body;

    const existingItem = await prisma.item.findFirst({
      where: { id, userId: user.userId },
    });

    if (!existingItem) {
      return reply.status(404).send({ error: '物品不存在' });
    }

    const item = await prisma.item.update({
      where: { id },
      data: { status },
    });

    return item;
  });
}
