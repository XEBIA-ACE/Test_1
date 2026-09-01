import { Kafka, Producer, CompressionTypes } from 'kafkajs';
import { IOutboxRepository } from '../../../../domain/ports/outbound/IOutboxRepository';
import { IEventPublisher, DomainEvent } from '../../../../domain/ports/outbound/IEventPublisher';
import { config } from '../../../../config';

export class KafkaOutboxRelay implements IEventPublisher {
  private readonly kafka: Kafka;
  private producer: Producer | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor(private readonly outboxRepository: IOutboxRepository) {
    this.kafka = new Kafka({
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers.split(','),
      ssl: config.kafka.ssl,
    });
  }

  async connect(): Promise<void> {
    this.producer = this.kafka.producer({
      transactionalId: `${config.kafka.clientId}-outbox`,
      idempotent: true,
    });
    await this.producer.connect();
  }

  async disconnect(): Promise<void> {
    this.stopPolling();
    if (this.producer) {
      await this.producer.disconnect();
    }
  }

  startPolling(): void {
    this.pollingInterval = setInterval(
      () => this.processOutbox(),
      config.outbox.pollIntervalMs,
    );
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private async processOutbox(): Promise<void> {
    const events = await this.outboxRepository.findPending(config.outbox.batchSize);
    if (events.length === 0) return;

    for (const event of events) {
      try {
        await this.publish(config.kafka.topicUserEvents, {
          eventId: event.id,
          eventType: event.eventType,
          aggregateId: event.aggregateId,
          aggregateType: event.aggregateType,
          payload: event.payload,
          occurredAt: event.createdAt,
        });
        await this.outboxRepository.markPublished(event.id);
      } catch (err) {
        console.error(`Failed to publish outbox event ${event.id}:`, err);
        await this.outboxRepository.markFailed(event.id);
      }
    }
  }

  async publish(topic: string, event: DomainEvent): Promise<void> {
    if (!this.producer) throw new Error('Kafka producer not connected');

    await this.producer.send({
      topic,
      compression: CompressionTypes.GZIP,
      messages: [
        {
          key: event.aggregateId,
          value: JSON.stringify(event),
          headers: {
            eventType: event.eventType,
            eventId: event.eventId,
          },
        },
      ],
    });
  }

  async publishBatch(topic: string, events: DomainEvent[]): Promise<void> {
    if (!this.producer) throw new Error('Kafka producer not connected');

    await this.producer.send({
      topic,
      compression: CompressionTypes.GZIP,
      messages: events.map((event) => ({
        key: event.aggregateId,
        value: JSON.stringify(event),
        headers: {
          eventType: event.eventType,
          eventId: event.eventId,
        },
      })),
    });
  }
}
