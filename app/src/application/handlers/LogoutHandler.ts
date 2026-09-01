import { LogoutCommand } from '../commands/LogoutCommand';
import { IRefreshTokenRepository } from '../../domain/ports/outbound/IRefreshTokenRepository';
import { ICachePort } from '../../domain/ports/outbound/ICachePort';
import { TokenService } from '../../domain/services/TokenService';

const BLACKLIST_KEY_PREFIX = 'blacklist:';

export class LogoutHandler {
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly cache: ICachePort,
    private readonly tokenService: TokenService,
  ) {}

  async handle(command: LogoutCommand): Promise<void> {
    // Blacklist the access token
    const decoded = this.tokenService.decodeToken(command.accessToken);
    if (decoded?.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        const blacklistKey = `${BLACKLIST_KEY_PREFIX}${command.accessToken}`;
        await this.cache.set(blacklistKey, '1', ttl);
      }
    }

    // Revoke refresh token if provided
    if (command.refreshToken) {
      const tokenHash = this.tokenService.hashToken(command.refreshToken);
      const stored = await this.refreshTokenRepository.findByTokenHash(tokenHash);
      if (stored) {
        await this.refreshTokenRepository.revoke(stored.id);
      }
    }
  }
}
