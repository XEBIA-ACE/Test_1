import { FastifyRequest, FastifyReply } from 'fastify';
import { Pool } from 'pg';
import Redis from 'ioredis';

export class HealthController {
  constructor(
    private readonly dbPool?: Pool,
    private readonly redisClient?: Redis,
  ) {}

  async liveness(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    reply.status(200).send({
      status: 'ok',
      service: 'identity-auth-service',
      timestamp: new Date().toISOString(),
    });
  }

  async readiness(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const checks: Record<string, string> = {};
    let allHealthy = true;

    // Database check
    if (this.dbPool) {
      try {
        const client = await this.dbPool.connect();
        await client.query('SELECT 1');
        client.release();
        checks['database'] = 'ok';
      } catch {
        checks['database'] = 'error';
        allHealthy = false;
      }
    } else {
      checks['database'] = 'not_configured';
    }

    // Redis check
    if (this.redisClient) {
      try {
        await this.redisClient.ping();
        checks['redis'] = 'ok';
      } catch {
        checks['redis'] = 'error';
        allHealthy = false;
      }
    } else {
      checks['redis'] = 'not_configured';
    }

    const statusCode = allHealthy ? 200 : 503;
    reply.status(statusCode).send({
      status: allHealthy ? 'ready' : 'not_ready',
      checks,
      timestamp: new Date().toISOString(),
    });
  }
}
