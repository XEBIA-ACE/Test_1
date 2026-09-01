import { NodeSDK } from '@opentelemetry/sdk-node';
import { config } from '../config/config';

let sdk: NodeSDK | null = null;

export function initTracing(): void {
  sdk = new NodeSDK({
    serviceName: config.observability.serviceName,
    instrumentations: [],
  });
  sdk.start();
}

export async function shutdownTracing(): Promise<void> {
  if (sdk) {
    await sdk.shutdown();
  }
}
