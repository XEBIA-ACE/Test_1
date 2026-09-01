import { v4 as uuidv4 } from 'uuid';

export type OutboxEventType = 'UserRegistered' | 'OTPRequested' | 'AccountDeactivated';
export type OutboxEventStatus = 'PENDING' | 'PUBLISHED' | 'FAILED';

export interface OutboxEventProps {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: OutboxEventType;
  payload: Record<string, unknown>;
  status: OutboxEventStatus;
  retryCount: number;
  createdAt: Date;
  publishedAt?: Date;
}

export class OutboxEvent {
  readonly id: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly eventType: OutboxEventType;
  readonly payload: Record<string, unknown>;
  status: OutboxEventStatus;
  retryCount: number;
  readonly createdAt: Date;
  publishedAt?: Date;

  constructor(props: OutboxEventProps) {
    this.id = props.id;
    this.aggregateId = props.aggregateId;
    this.aggregateType = props.aggregateType;
    this.eventType = props.eventType;
    this.payload = props.payload;
    this.status = props.status;
    this.retryCount = props.retryCount;
    this.createdAt = props.createdAt;
    this.publishedAt = props.publishedAt;
  }

  static create(
    aggregateId: string,
    aggregateType: string,
    eventType: OutboxEventType,
    payload: Record<string, unknown>,
  ): OutboxEvent {
    return new OutboxEvent({
      id: uuidv4(),
      aggregateId,
      aggregateType,
      eventType,
      payload,
      status: 'PENDING',
      retryCount: 0,
      createdAt: new Date(),
    });
  }

  markPublished(): void {
    this.status = 'PUBLISHED';
    this.publishedAt = new Date();
  }

  markFailed(): void {
    this.status = 'FAILED';
    this.retryCount += 1;
  }
}
