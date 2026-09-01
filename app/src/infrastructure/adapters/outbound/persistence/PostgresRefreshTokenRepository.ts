import { Pool } from 'pg';
import { RefreshToken } from '../../../../domain/entities/RefreshToken';
import { IRefreshTokenRepository } from '../../../../domain/ports/outbound/IRefreshTokenRepository';

export class PostgresRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly pool: Pool) {}

  private mapRow(row: Record<string, unknown>): RefreshToken {
    return new RefreshToken({
      id: row['id'] as string,
      userId: row['user_id'] as string,
      tokenHash: row['token_hash'] as string,
      expiresAt: new Date(row['expires_at'] as string),
      revokedAt: row['revoked_at'] ? new Date(row['revoked_at'] as string) : undefined,
      createdAt: new Date(row['created_at'] as string),
    });
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const result = await this.pool.query(
      'SELECT * FROM refresh_tokens WHERE token_hash = $1',
      [tokenHash],
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    const result = await this.pool.query(
      'SELECT * FROM refresh_tokens WHERE user_id = $1 ORDER BY created_at DESC',
      [userId],
    );
    return result.rows.map((r) => this.mapRow(r));
  }

  async save(token: RefreshToken): Promise<RefreshToken> {
    const result = await this.pool.query(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [token.id, token.userId, token.tokenHash, token.expiresAt, token.createdAt],
    );
    return this.mapRow(result.rows[0]);
  }

  async revoke(tokenId: string): Promise<void> {
    await this.pool.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1',
      [tokenId],
    );
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.pool.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
      [userId],
    );
  }

  async deleteExpired(): Promise<number> {
    const result = await this.pool.query(
      'DELETE FROM refresh_tokens WHERE expires_at < NOW()',
    );
    return result.rowCount ?? 0;
  }
}
