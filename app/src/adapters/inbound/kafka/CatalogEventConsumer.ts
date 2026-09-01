import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { IEventConsumer } from '../../../ports/outbound/IEventConsumer';
import { ISearchRepository } from '../../../ports/outbound/ISearchRepository';
import { ICacheRepository } from '../../../ports/outbound/ICacheRepository';
import { CatalogUpdatedEvent, CatalogEventType } from '../../../domain/events/CatalogUpdatedEvent';
import { Product } from '../../../domain/entities/Product';

export class CatalogEventConsumer implements IEventConsumer {
  private consumer: Consumer;

  constructor(
    private readonly kafka: Kafka,
    private readonly topic: string,
    private readonly groupId: string,
    private readonly searchRepository: ISearchRepository,
    private readonly cacheRepository: ICacheRepository,
  ) {
    this.consumer = kafka.consumer({ groupId });
  }

  async start(): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: this.topic, fromBeginning: false });
    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        await this.handleMessage(payload);
      },
    });
  }

  async stop(): Promise<void> {
    await this.consumer.disconnect();
  }

  private async handleMessage({ message }: EachMessagePayload): Promise<void> {
    if (!message.value) return;
    try {
      const event: CatalogUpdatedEvent = JSON.parse(message.value.toString());
      switch (event.eventType) {
        case CatalogEventType.PRODUCT_CREATED:
        case CatalogEventType.PRODUCT_UPDATED:
          await this.searchRepository.indexProduct(event.payload.product as Product);
          await this.cacheRepository.del(`product:${event.productId}`);
          await this.cacheRepository.delByPattern('products:list:*');
          break;
        case CatalogEventType.PRODUCT_DELETED:
          await this.searchRepository.removeProduct(event.productId);
          await this.cacheRepository.del(`product:${event.productId}`);
          await this.cacheRepository.delByPattern('products:list:*');
          break;
      }
    } catch (err) {
      console.error('Error processing catalog event:', err);
    }
  }
}
