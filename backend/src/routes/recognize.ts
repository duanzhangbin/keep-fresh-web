import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { recognizeImage } from '../services/ai/qwen.service.js';

export async function recognizeRoutes(fastify: FastifyInstance) {
  // 识别图片
  fastify.post('/recognize', async (request: FastifyRequest<{ Body: { image: string } }>, reply: FastifyReply) => {
    const { image } = request.body as { image: string };

    if (!image) {
      return reply.status(400).send({ error: '请提供图片' });
    }

    try {
      const result = await recognizeImage(image);
      return result;
    } catch (error: any) {
      console.error('识别失败:', error);
      return reply.status(500).send({ error: '识别失败，请重试', details: error.message });
    }
  });
}
