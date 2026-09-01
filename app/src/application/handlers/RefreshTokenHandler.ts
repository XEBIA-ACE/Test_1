import { RefreshTokenCommand } from '../commands/RefreshTokenCommand';
import { RefreshResult } from '../../domain/ports/inbound/IAuthCommandPort';
import { IUserRepository } from '../../domain/ports/outbound/IUserRepository';
import { IRefreshTokenRepository } from '../../domain/ports/outbound/IRefreshTokenRepository';
import { TokenService } from '../../domain/services/TokenService';
import { RefreshToken } from '../../domain/entities/RefreshToken';
import { config } from '../../config';

export class RefreshTokenHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenService: TokenService,
  ) {}

  async handle(command: RefreshTokenCommand): Promise<RefreshResult> {
    const tokenHash = this.tokenService.hashToken(command.refreshToken);
    const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken || !storedToken.isValid()) {
      throw new Error('Invalid or expired refresh token');
    }

    const user = await this.userRepository.findById(storedToken.userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new Error('User not found or inactive');
    }

    // Rotate: revoke old token
    await this.refreshTokenRepository.revoke(storedToken.id);

    // Issue new token pair
    const accessToken = this.tokenService.signAccessToken({
      sub: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
    });

    const rawRefreshToken = this.tokenService.generateRefreshToken();
    const newTokenHash = this.tokenService.hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + config.jwt.refreshTokenExpiry * 1000);

    const newRefreshToken = RefreshToken.create(user.id, newTokenHash, expiresAt);
    await this.refreshTokenRepository.save(newRefreshToken);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: config.jwt.accessTokenExpiry,
    };
  }
}
