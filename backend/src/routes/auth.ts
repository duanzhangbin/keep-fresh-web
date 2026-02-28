import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

interface RegisterBody {
  phone?: string;
  email?: string;
  password: string;
  name?: string;
}

interface LoginBody {
  phone?: string;
  email?: string;
  password: string;
}

export async function authRoutes(fastify: FastifyInstance) {
  // 注册
  fastify.post<{ Body: RegisterBody }>('/auth/register', async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
    const { phone, password, name, email } = request.body;

    if (!phone && !email) {
      return reply.status(400).send({ error: '请提供手机号或邮箱' });
    }

    if (!password || password.length < 6) {
      return reply.status(400).send({ error: '密码长度至少6位' });
    }

    // 检查手机号或邮箱是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          phone ? { phone } : { id: '' },
          email ? { email } : { id: '' },
        ].filter(Boolean) as any,
      },
    });

    if (existingUser) {
      return reply.status(400).send({ error: '手机号或邮箱已被注册' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        name,
        email,
      },
    });

    // 创建设置
    await prisma.settings.create({
      data: { userId: user.id },
    });

    // 创建默认分类
    const defaultCategories = [
      { name: '食品', icon: '🍎', color: '#4CAF50' },
      { name: '药品', icon: '💊', color: '#2196F3' },
      { name: '美妆', icon: '💄', color: '#E91E63' },
      { name: '其它', icon: '📦', color: '#9E9E9E' },
    ];
    for (const cat of defaultCategories) {
      await prisma.category.create({
        data: { userId: user.id, ...cat },
      });
    }

    // 创建默认位置
    const defaultLocations = [
      { name: '冰箱', icon: '🧊', color: '#2196F3' },
      { name: '冷冻', icon: '❄️', color: '#03A9F4' },
      { name: '储物柜', icon: '📦', color: '#8D6E63' },
      { name: '医药箱', icon: '💊', color: '#F44336' },
    ];
    for (const loc of defaultLocations) {
      await prisma.location.create({
        data: { userId: user.id, ...loc },
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return { 
      token, 
      user: { 
        id: user.id, 
        phone: user.phone, 
        name: user.name, 
        email: user.email 
      } 
    };
  });

  // 登录
  fastify.post<{ Body: LoginBody }>('/auth/login', async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
    const { phone, email, password } = request.body;

    if (!phone && !email) {
      return reply.status(400).send({ error: '请提供手机号或邮箱' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          phone ? { phone } : { id: '' },
          email ? { email } : { id: '' },
        ].filter(Boolean) as any,
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return reply.status(401).send({ error: '手机号/邮箱或密码错误' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return { 
      token, 
      user: { 
        id: user.id, 
        phone: user.phone, 
        name: user.name, 
        email: user.email 
      } 
    };
  });

  // 获取当前用户信息
  fastify.get('/auth/me', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user) {
      return reply.status(401).send({ error: '未授权' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        settings: true,
      },
    });

    if (!existingUser) {
      return reply.status(404).send({ error: '用户不存在' });
    }

    return {
      id: existingUser.id,
      phone: existingUser.phone,
      name: existingUser.name,
      email: existingUser.email,
      settings: existingUser.settings,
    };
  });

  // 更新用户信息
  fastify.put('/auth/me', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user) {
      return reply.status(401).send({ error: '未授权' });
    }

    const { name, email } = request.body as any;

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: { name, email },
    });

    return { 
      id: updatedUser.id, 
      phone: updatedUser.phone, 
      name: updatedUser.name, 
      email: updatedUser.email 
    };
  });

  // 修改密码
  fastify.put('/auth/password', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user) {
      return reply.status(401).send({ error: '未授权' });
    }

    const { oldPassword, newPassword } = request.body as any;

    const existingUser = await prisma.user.findUnique({ where: { id: user.userId } });

    if (!(await bcrypt.compare(oldPassword, existingUser!.password))) {
      return reply.status(400).send({ error: '原密码错误' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.userId },
      data: { password: hashedPassword },
    });

    return { success: true };
  });
}
