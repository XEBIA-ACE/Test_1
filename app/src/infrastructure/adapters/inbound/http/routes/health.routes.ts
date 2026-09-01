import { FastifyInstance } from 'fastify';
import { HealthController } from '../controllers/HealthController';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  const controller = new HealthController();

  app.get('/health', {
    schema: {
      description: 'Liveness probe — returns 200 if the process is running',
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            service: { type: 'string' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    handler: controller.liveness.bind(controller),
  });

  app.get('/ready', {
    schema: {
      description: 'Readiness probe — returns 200 when all dependencies are healthy',
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            checks: { type: 'object' },
            timestamp: { type: 'string' },
          },
        },
        503: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            checks: { type: 'object' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    handler: controller.readiness.bind(controller),
  });
}
