import { randomBytes, randomUUID, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { Clock, IdGenerator, PasswordHasher } from '../../domain/ports';

const scryptAsync = promisify(scrypt);

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

export class UuidGenerator implements IdGenerator {
  next(): string {
    return randomUUID();
  }
}

export class ScryptPasswordHasher implements PasswordHasher {
  async hash(plaintext: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derived = (await scryptAsync(plaintext, salt, 64)) as Buffer;
    return `scrypt$${salt}$${derived.toString('hex')}`;
  }
}
