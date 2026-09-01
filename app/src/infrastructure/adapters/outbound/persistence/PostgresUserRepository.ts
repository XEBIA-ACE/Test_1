import { Pool } from 'pg';
import { User, UserProps, UserStatus, RegistrationMethod } from '../../../../domain/entities/User';
import { IUserRepository } from '../../../../domain/ports/outbound/IUserRepository';

export class PostgresUserRepository implements IUserRepository {
  constructor(private readonly pool: Pool) {}

  private mapRow(row: Record<string, unknown>): User {
    return new User({
      id: row['id'] as string,
      email: row['email'] as string | undefined,
      phoneNumber: row['phone_number'] as string | undefined,
      passwordHash: row['password_hash'] as string | undefined,
      status: row['status'] as UserStatus,
      registrationMethod: row['registration_method'] as RegistrationMethod,
      oauthProvider: row['oauth_provider'] as string | undefined,
      oauthProviderId: row['oauth_provider_id'] as string | undefined,
      failedLoginAttempts: row['failed_login_attempts'] as number,
      lockedUntil: row['locked_until'] ? new Date(row['locked_until'] as string) : undefined,
      createdAt: new Date(row['created_at'] as string),
      updatedAt: new Date(row['updated_at'] as string),
    });
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const result = await this.pool.query('SELECT * FROM users WHERE phone_number = $1', [phoneNumber]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async findByOAuthProvider(provider: string, providerId: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE oauth_provider = $1 AND oauth_provider_id = $2',
      [provider, providerId],
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async save(user: User): Promise<User> {
    const result = await this.pool.query(
      `INSERT INTO users (
        id, email, phone_number, password_hash, status, registration_method,
        oauth_provider, oauth_provider_id, failed_login_attempts, locked_until,
        created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        user.id, user.email, user.phoneNumber, user.passwordHash,
        user.status, user.registrationMethod, user.oauthProvider,
        user.oauthProviderId, user.failedLoginAttempts, user.lockedUntil,
        user.createdAt, user.updatedAt,
      ],
    );
    return this.mapRow(result.rows[0]);
  }

  async update(user: User): Promise<User> {
    const result = await this.pool.query(
      `UPDATE users SET
        email = $2, phone_number = $3, password_hash = $4, status = $5,
        failed_login_attempts = $6, locked_until = $7, updated_at = $8
      WHERE id = $1
      RETURNING *`,
      [
        user.id, user.email, user.phoneNumber, user.passwordHash,
        user.status, user.failedLoginAttempts, user.lockedUntil, user.updatedAt,
      ],
    );
    return this.mapRow(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM users WHERE id = $1', [id]);
  }
}
