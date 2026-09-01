import { OutboxEvent } from '../../entities/OutboxEvent';

export interface IOutboxRepository {
  save(event: OutboxEvent): Promise<OutboxEvent>;
  findPending(limit: number): Promise<OutboxEvent[]>;
  markPublished(id: string): Promise<void>;
  markFailed(id: string): Promise<void>;
}
