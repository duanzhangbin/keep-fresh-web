import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../lib/prisma.js';

const DEFAULT_CATEGORY = '其它';
const DEFAULT_LOCATION = '储物柜';

export async function categoryRoutes(fastify: FastifyInstance) {
  // 获取分类列表
  fastify.get('/categories', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user) {
      return reply.status(401).send({ error: '未授权' });
    }

    // 如果没有分类，创建默认分类
    const categories = await prisma.category.findMany({
      where: { userId: user.userId },
      orderBy: { name: 'asc' },
    });

    if (categories.length === 0) {
      const defaultCategories = [
        { name: '食品', icon: '🍎', color: '#4CAF50' },
        { name: '药品', icon: '💊', color: '#2196F3' },
        { name: '美妆', icon: '💄', color: '#E91E63' },
        { name: '其它', icon: '📦', color: '#9E9E9E' },
      ];
      for (const cat of defaultCategories) {
        await prisma.category.create({
          data: { userId: user.userId, ...cat },
        });
      }
      return prisma.category.findMany({
        where: { userId: user.userId },
        orderBy: { name: 'asc' },
      });
    }

    // 返回分类及物品数量
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await prisma.item.count({
          where: { userId: user.userId, category: cat.name },
        });
        return { ...cat, itemCount: count };
      })
    );

    return categoriesWithCount;
  });

  // 创建分类
  fastify.post('/categories', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user) {
      return reply.status(401).send({ error: '未授权' });
    }

    const { name, icon, color } = request.body as any;

    // 检查数量限制
    const count = await prisma.category.count({
      where: { userId: user.userId },
    });
    if (count >= 10) {
      return reply.status(400).send({ error: '分类数量已达上限（最多10个）' });
    }

    // 检查是否已存在
    const existing = await prisma.category.findFirst({
      where: { userId: user.userId, name },
    });
    if (existing) {
      return reply.status(400).send({ error: '分类已存在' });
    }

    const category = await prisma.category.create({
      data: { userId: user.userId, name, icon, color },
    });

    return { ...category, itemCount: 0 };
  });

  // 更新分类
  fastify.put('/categories/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: { name?: string; icon?: string; color?: string } }>, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user) {
      return reply.status(401).send({ error: '未授权' });
    }

    const { id } = request.params;
    const { name, icon, color } = request.body;

    // 检查分类是否存在
    const existing = await prisma.category.findFirst({
      where: { id, userId: user.userId },
    });
    if (!existing) {
      return reply.status(404).send({ error: '分类不存在' });
    }

    // 如果修改了名称，检查新名称是否已存在
    if (name && name !== existing.name) {
      const nameExists = await prisma.category.findFirst({
        where: { userId: user.userId, name },
      });
      if (nameExists) {
        return reply.status(400).send({ error: '分类名称已存在' });
      }

      // 更新使用该分类的物品
      await prisma.item.updateMany({
        where: { userId: user.userId, category: existing.name },
        data: { category: name },
      });
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name, icon, color },
    });

    const count = await prisma.item.count({
      where: { userId: user.userId, category: category.name },
    });

    return { ...category, itemCount: count };
  });

  // 删除分类
  fastify.delete('/categories/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user) {
      return reply.status(401).send({ error: '未授权' });
    }

    const { id } = request.params;

    // 检查分类是否存在
    const existing = await prisma.category.findFirst({
      where: { id, userId: user.userId },
    });
    if (!existing) {
      return reply.status(404).send({ error: '分类不存在' });
    }

    // 检查是否为最后一个分类
    const count = await prisma.category.count({
      where: { userId: user.userId },
    });
    if (count <= 1) {
      return reply.status(400).send({ error: '至少保留一个分类' });
    }

    // 将使用该分类的物品改为默认分类
    await prisma.item.updateMany({
      where: { userId: user.userId, category: existing.name },
      data: { category: DEFAULT_CATEGORY },
    });

    await prisma.category.delete({ where: { id } });

    return { success: true };
  });
}
