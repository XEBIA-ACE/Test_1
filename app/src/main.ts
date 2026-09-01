/**
 * Application entry point.
 * Initialises OpenTelemetry BEFORE any other imports so instrumentation patches
 * are applied to all subsequently loaded modules.
 */
import './infrastructure/observability/tracing'; // must be first

import { buildApp } from './app';
import { config } from './config';
import { logger } from './infrastructure/observability/metrics';

async function bootstrap(): Promise<void> {
  const app = await buildApp();

  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
    logger.info({ port: config.port }, 'Identity & Auth Service started');
  } catch (err) {
    logger.error(err, 'Failed to start server');
    process.exit(1);
  }
}

bootstrap();
