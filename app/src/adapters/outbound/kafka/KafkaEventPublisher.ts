import { Kafka, Producer } from 'kafkajs';
import { IEventPublisher } from '../../../ports/outbound/IEventPublisher';
import { CatalogUpdatedEvent } from '../../../domain/events/CatalogUpdatedEvent';

export class KafkaEventPublisher implements IEventPublisher {
  private producer: Producer;
  private connected = false;

  constructor(
    private readonly kafka: Kafka,
    private readonly topic: string,
  ) {
    this.producer = kafka.producer();
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      await this.producer.connect();
      this.connected = true;
    }
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
    this.connected = false;
  }

  async publish(event: CatalogUpdatedEvent): Promise<void> {
    await this.connect();
    await this.producer.send({
      topic: this.topic,
      messages: [
        {
          key: event.productId,
          value: JSON.stringify(event),
          headers: { eventType: event.eventType },
        },
      ],
    });
  }
}
