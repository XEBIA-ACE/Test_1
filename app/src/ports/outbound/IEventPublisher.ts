import { CatalogUpdatedEvent } from '../../domain/events/CatalogUpdatedEvent';

export interface IEventPublisher {
  publish(event: CatalogUpdatedEvent): Promise<void>;
}
