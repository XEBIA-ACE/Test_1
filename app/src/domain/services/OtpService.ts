import crypto from 'crypto';
import { config } from '../../config';
import { ICachePort } from '../ports/outbound/ICachePort';

const OTP_KEY_PREFIX = 'otp:';
const OTP_ATTEMPTS_PREFIX = 'otp_attempts:';

export class OtpService {
  constructor(private readonly cache: ICachePort) {}

  generate(): string {
    const digits = config.otp.length;
    const max = Math.pow(10, digits);
    const otp = crypto.randomInt(0, max).toString().padStart(digits, '0');
    return otp;
  }

  async store(identifier: string, otp: string): Promise<void> {
    const key = `${OTP_KEY_PREFIX}${identifier}`;
    await this.cache.set(key, otp, config.otp.ttlSeconds);
  }

  async verify(identifier: string, otp: string): Promise<boolean> {
    const attemptsKey = `${OTP_ATTEMPTS_PREFIX}${identifier}`;
    const attempts = await this.cache.increment(attemptsKey);

    if (attempts === 1) {
      await this.cache.expire(attemptsKey, config.otp.ttlSeconds);
    }

    if (attempts > config.otp.maxAttempts) {
      throw new Error('Maximum OTP verification attempts exceeded');
    }

    const key = `${OTP_KEY_PREFIX}${identifier}`;
    const stored = await this.cache.get(key);

    if (!stored) {
      throw new Error('OTP expired or not found');
    }

    const isValid = crypto.timingSafeEqual(Buffer.from(stored), Buffer.from(otp));

    if (isValid) {
      await this.cache.del(key);
      await this.cache.del(attemptsKey);
    }

    return isValid;
  }

  async invalidate(identifier: string): Promise<void> {
    await this.cache.del(`${OTP_KEY_PREFIX}${identifier}`);
    await this.cache.del(`${OTP_ATTEMPTS_PREFIX}${identifier}`);
  }
}
