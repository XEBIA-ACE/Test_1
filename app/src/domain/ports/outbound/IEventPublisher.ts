export interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  payload: Record<string, unknown>;
  occurredAt: Date;
}

export interface IEventPublisher {
  publish(topic: string, event: DomainEvent): Promise<void>;
  publishBatch(topic: string, events: DomainEvent[]): Promise<void>;
}
