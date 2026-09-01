import Fastify, { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { config } from './config';
import { healthRoutes } from './infrastructure/adapters/inbound/http/routes/health.routes';
import { authRoutes } from './infrastructure/adapters/inbound/http/routes/auth.routes';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: config.logLevel,
      serializers: {
        req(request) {
          return {
            method: request.method,
            url: request.url,
            hostname: request.hostname,
          };
        },
      },
    },
    trustProxy: true,
  });

  // ── Security plugins ──────────────────────────────────────────────────────
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: config.nodeEnv === 'production' ? false : true,
    credentials: true,
  });
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // ── Swagger (dev only) ────────────────────────────────────────────────────
  if (config.nodeEnv !== 'production') {
    const swagger = await import('@fastify/swagger');
    const swaggerUi = await import('@fastify/swagger-ui');
    await app.register(swagger.default, {
      openapi: {
        info: {
          title: 'Identity & Auth Service',
          description: 'Authentication and identity management API',
          version: '1.0.0',
        },
        components: {
          securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          },
        },
      },
    });
    await app.register(swaggerUi.default, { routePrefix: '/docs' });
  }

  // ── Routes ────────────────────────────────────────────────────────────────
  await app.register(healthRoutes);
  await app.register(authRoutes, { prefix: '/auth' });

  return app;
}
