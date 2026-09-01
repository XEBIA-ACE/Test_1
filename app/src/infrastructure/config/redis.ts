import Redis from 'ioredis';
import { config } from './config';

export function createRedisClient(): Redis {
  return new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
    retryStrategy: (times: number) => Math.min(times * 50, 2000),
    lazyConnect: true,
  });
}
