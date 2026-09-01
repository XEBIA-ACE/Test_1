import { FastifyInstance } from 'fastify';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  verifyOtpSchema,
} from '../schemas/auth.schemas';

/**
 * Auth routes — handlers are wired up via dependency injection in production.
 * In this scaffold the routes are registered with placeholder handlers that
 * return 501 Not Implemented until the DI container is wired.
 *
 * TODO: Wire AuthController via a DI container (e.g. tsyringe / awilix).
 */
export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/register', {
    schema: { ...registerSchema, tags: ['Auth'] },
    handler: async (_req, reply) => {
      reply.status(501).send({ message: 'Not implemented — wire AuthController' });
    },
  });

  app.post('/login', {
    schema: { ...loginSchema, tags: ['Auth'] },
    handler: async (_req, reply) => {
      reply.status(501).send({ message: 'Not implemented — wire AuthController' });
    },
  });

  app.post('/refresh', {
    schema: { ...refreshSchema, tags: ['Auth'] },
    handler: async (_req, reply) => {
      reply.status(501).send({ message: 'Not implemented — wire AuthController' });
    },
  });

  app.post('/logout', {
    schema: { ...logoutSchema, tags: ['Auth'] },
    handler: async (_req, reply) => {
      reply.status(501).send({ message: 'Not implemented — wire AuthController' });
    },
  });

  app.post('/otp/verify', {
    schema: { ...verifyOtpSchema, tags: ['Auth'] },
    handler: async (_req, reply) => {
      reply.status(501).send({ message: 'Not implemented — wire AuthController' });
    },
  });

  // OAuth2 routes — placeholder
  app.get('/oauth/google', {
    schema: { tags: ['OAuth2'] },
    handler: async (_req, reply) => {
      reply.status(501).send({ message: 'Not implemented — configure OAuth2 adapter' });
    },
  });

  app.get('/oauth/google/callback', {
    schema: { tags: ['OAuth2'] },
    handler: async (_req, reply) => {
      reply.status(501).send({ message: 'Not implemented — configure OAuth2 adapter' });
    },
  });

  app.get('/oauth/facebook', {
    schema: { tags: ['OAuth2'] },
    handler: async (_req, reply) => {
      reply.status(501).send({ message: 'Not implemented — configure OAuth2 adapter' });
    },
  });

  app.get('/oauth/facebook/callback', {
    schema: { tags: ['OAuth2'] },
    handler: async (_req, reply) => {
      reply.status(501).send({ message: 'Not implemented — configure OAuth2 adapter' });
    },
  });
}
