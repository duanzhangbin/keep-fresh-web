import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';

export async function authMiddleware(fastify: FastifyInstance) {
  fastify.addHook('preHandler', (request: FastifyRequest, reply: FastifyReply, done: () => void) => {
    const publicPaths = ['/auth/login', '/auth/register', '/health', '/recognize'];
    
    if (publicPaths.some(path => request.url.startsWith(path))) {
      done();
      return;
    }

    const auth = request.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      reply.status(401).send({ error: '未授权，请先登录' });
      done();
      return;
    }

    try {
      const token = auth.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      (request as any).user = decoded;
      done();
    } catch (err) {
      reply.status(401).send({ error: 'Token 无效或已过期' });
      done();
    }
  });
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
    }
  }
}
