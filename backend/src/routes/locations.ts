import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../lib/prisma.js';

const DEFAULT_LOCATION = '储物柜';

export async function locationRoutes(fastify: FastifyInstance) {
  // 获取位置列表
  fastify.get('/locations', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user) {
      return reply.status(401).send({ error: '未授权' });
    }

    // 如果没有位置，创建默认位置
    const locations = await prisma.location.findMany({
      where: { userId: user.userId },
      orderBy: { name: 'asc' },
    });

    if (locations.length === 0) {
      const defaultLocations = [
        { name: '冰箱', icon: '🧊', color: '#2196F3' },
        { name: '冷冻', icon: '❄️', color: '#03A9F4' },
        { name: '储物柜', icon: '📦', color: '#8D6E63' },
        { name: '医药箱', icon: '💊', color: '#F44336' },
      ];
      for (const loc of defaultLocations) {
        await prisma.location.create({
          data: { userId: user.userId, ...loc },
        });
      }
      return prisma.location.findMany({
        where: { userId: user.userId },
        orderBy: { name: 'asc' },
      });
    }

    // 返回位置及物品数量
    const locationsWithCount = await Promise.all(
      locations.map(async (loc) => {
        const count = await prisma.item.count({
          where: { userId: user.userId, location: loc.name },
        });
        return { ...loc, itemCount: count };
      })
    );

    return locationsWithCount;
  });

  // 创建位置
  fastify.post('/locations', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user) {
      return reply.status(401).send({ error: '未授权' });
    }

    const { name, icon, color } = request.body as any;

    // 检查数量限制
    const count = await prisma.location.count({
      where: { userId: user.userId },
    });
    if (count >= 10) {
      return reply.status(400).send({ error: '位置数量已达上限（最多10个）' });
    }

    // 检查是否已存在
    const existing = await prisma.location.findFirst({
      where: { userId: user.userId, name },
    });
    if (existing) {
      return reply.status(400).send({ error: '位置已存在' });
    }

    const location = await prisma.location.create({
      data: { userId: user.userId, name, icon, color },
    });

    return { ...location, itemCount: 0 };
  });

  // 更新位置
  fastify.put('/locations/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: { name?: string; icon?: string; color?: string } }>, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user) {
      return reply.status(401).send({ error: '未授权' });
    }

    const { id } = request.params;
    const { name, icon, color } = request.body;

    // 检查位置是否存在
    const existing = await prisma.location.findFirst({
      where: { id, userId: user.userId },
    });
    if (!existing) {
      return reply.status(404).send({ error: '位置不存在' });
    }

    // 如果修改了名称，检查新名称是否已存在
    if (name && name !== existing.name) {
      const nameExists = await prisma.location.findFirst({
        where: { userId: user.userId, name },
      });
      if (nameExists) {
        return reply.status(400).send({ error: '位置名称已存在' });
      }

      // 更新使用该位置的物品
      await prisma.item.updateMany({
        where: { userId: user.userId, location: existing.name },
        data: { location: name },
      });
    }

    const location = await prisma.location.update({
      where: { id },
      data: { name, icon, color },
    });

    const count = await prisma.item.count({
      where: { userId: user.userId, location: location.name },
    });

    return { ...location, itemCount: count };
  });

  // 删除位置
  fastify.delete('/locations/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user) {
      return reply.status(401).send({ error: '未授权' });
    }

    const { id } = request.params;

    // 检查位置是否存在
    const existing = await prisma.location.findFirst({
      where: { id, userId: user.userId },
    });
    if (!existing) {
      return reply.status(404).send({ error: '位置不存在' });
    }

    // 检查是否为最后一个位置
    const count = await prisma.location.count({
      where: { userId: user.userId },
    });
    if (count <= 1) {
      return reply.status(400).send({ error: '至少保留一个位置' });
    }

    // 将使用该位置的物品改为默认位置
    await prisma.item.updateMany({
      where: { userId: user.userId, location: existing.name },
      data: { location: DEFAULT_LOCATION },
    });

    await prisma.location.delete({ where: { id } });

    return { success: true };
  });
}
