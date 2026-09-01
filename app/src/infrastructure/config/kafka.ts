import { Kafka, logLevel } from 'kafkajs';
import { config } from './config';

export function createKafkaClient(): Kafka {
  return new Kafka({
    clientId: config.kafka.clientId,
    brokers: config.kafka.brokers,
    logLevel: logLevel.WARN,
  });
}
