import { ValidateTokenQuery } from './ValidateTokenQuery';
import { TokenPayload } from '../../domain/ports/inbound/IAuthQueryPort';
import { ICachePort } from '../../domain/ports/outbound/ICachePort';
import { TokenService } from '../../domain/services/TokenService';

const BLACKLIST_KEY_PREFIX = 'blacklist:';

export class ValidateTokenHandler {
  constructor(
    private readonly cache: ICachePort,
    private readonly tokenService: TokenService,
  ) {}

  async handle(query: ValidateTokenQuery): Promise<TokenPayload> {
    // Check blacklist first (cache-aside)
    const blacklistKey = `${BLACKLIST_KEY_PREFIX}${query.token}`;
    const isBlacklisted = await this.cache.exists(blacklistKey);
    if (isBlacklisted) {
      throw new Error('Token has been revoked');
    }

    const payload = this.tokenService.verifyAccessToken(query.token);

    return {
      sub: payload.sub as string,
      email: payload.email as string | undefined,
      phoneNumber: payload.phoneNumber as string | undefined,
      iat: payload.iat as number,
      exp: payload.exp as number,
      iss: payload.iss as string,
      aud: payload.aud as string | string[],
    };
  }
}
