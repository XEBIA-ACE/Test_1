import { config } from '../../config';

/**
 * OpenTelemetry SDK initialisation.
 * Must be imported BEFORE any other modules in main.ts.
 */
if (config.otel.enabled) {
  // Dynamic import to avoid loading OTel SDK when disabled
  (async () => {
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { OTLPTraceExporter } = await import('@opentelemetry/exporter-otlp-grpc' as any);
    const { Resource } = await import('@opentelemetry/resources');
    const { SemanticResourceAttributes } = await import('@opentelemetry/semantic-conventions');
    const { FastifyInstrumentation } = await import('@opentelemetry/instrumentation-fastify');
    const { HttpInstrumentation } = await import('@opentelemetry/instrumentation-http');
    const { PgInstrumentation } = await import('@opentelemetry/instrumentation-pg');

    const sdk = new NodeSDK({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: config.otel.serviceName,
        [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
      }),
      traceExporter: new OTLPTraceExporter({
        url: config.otel.endpoint,
      }),
      instrumentations: [
        new HttpInstrumentation(),
        new FastifyInstrumentation(),
        new PgInstrumentation(),
      ],
    });

    sdk.start();

    process.on('SIGTERM', () => {
      sdk.shutdown().catch(console.error);
    });
  })();
}
