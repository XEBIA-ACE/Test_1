import { Pool } from 'pg';
import { OutboxEvent, OutboxEventType, OutboxEventStatus } from '../../../../domain/entities/OutboxEvent';
import { IOutboxRepository } from '../../../../domain/ports/outbound/IOutboxRepository';

export class PostgresOutboxRepository implements IOutboxRepository {
  constructor(private readonly pool: Pool) {}

  private mapRow(row: Record<string, unknown>): OutboxEvent {
    return new OutboxEvent({
      id: row['id'] as string,
      aggregateId: row['aggregate_id'] as string,
      aggregateType: row['aggregate_type'] as string,
      eventType: row['event_type'] as OutboxEventType,
      payload: row['payload'] as Record<string, unknown>,
      status: row['status'] as OutboxEventStatus,
      retryCount: row['retry_count'] as number,
      createdAt: new Date(row['created_at'] as string),
      publishedAt: row['published_at'] ? new Date(row['published_at'] as string) : undefined,
    });
  }

  async save(event: OutboxEvent): Promise<OutboxEvent> {
    const result = await this.pool.query(
      `INSERT INTO outbox_events (id, aggregate_id, aggregate_type, event_type, payload, status, retry_count, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        event.id, event.aggregateId, event.aggregateType, event.eventType,
        JSON.stringify(event.payload), event.status, event.retryCount, event.createdAt,
      ],
    );
    return this.mapRow(result.rows[0]);
  }

  async findPending(limit: number): Promise<OutboxEvent[]> {
    const result = await this.pool.query(
      `SELECT * FROM outbox_events WHERE status = 'PENDING' ORDER BY created_at ASC LIMIT $1`,
      [limit],
    );
    return result.rows.map((r) => this.mapRow(r));
  }

  async markPublished(id: string): Promise<void> {
    await this.pool.query(
      `UPDATE outbox_events SET status = 'PUBLISHED', published_at = NOW() WHERE id = $1`,
      [id],
    );
  }

  async markFailed(id: string): Promise<void> {
    await this.pool.query(
      `UPDATE outbox_events SET status = 'FAILED', retry_count = retry_count + 1 WHERE id = $1`,
      [id],
    );
  }
}
