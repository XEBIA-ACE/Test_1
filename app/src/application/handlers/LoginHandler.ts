import { LoginCommand } from '../commands/LoginCommand';
import { LoginResult } from '../../domain/ports/inbound/IAuthCommandPort';
import { IUserRepository } from '../../domain/ports/outbound/IUserRepository';
import { IRefreshTokenRepository } from '../../domain/ports/outbound/IRefreshTokenRepository';
import { ICachePort } from '../../domain/ports/outbound/ICachePort';
import { PasswordService } from '../../domain/services/PasswordService';
import { TokenService } from '../../domain/services/TokenService';
import { RefreshToken } from '../../domain/entities/RefreshToken';
import { config } from '../../config';

const LOCKOUT_KEY_PREFIX = 'lockout:';

export class LoginHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly cache: ICachePort,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async handle(command: LoginCommand): Promise<LoginResult> {
    const user = command.email
      ? await this.userRepository.findByEmail(command.email)
      : command.phoneNumber
        ? await this.userRepository.findByPhoneNumber(command.phoneNumber)
        : null;

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check lockout
    const lockoutKey = `${LOCKOUT_KEY_PREFIX}${user.id}`;
    const isLockedOut = await this.cache.exists(lockoutKey);
    if (isLockedOut || user.isLocked()) {
      throw new Error('Account is temporarily locked due to too many failed login attempts');
    }

    if (!user.passwordHash) {
      throw new Error('Invalid credentials');
    }

    const isValid = await this.passwordService.verify(user.passwordHash, command.password);
    if (!isValid) {
      user.incrementFailedAttempts();
      await this.userRepository.update(user);

      if (user.failedLoginAttempts >= config.lockout.maxAttempts) {
        const lockUntil = new Date(Date.now() + config.lockout.durationSeconds * 1000);
        user.lock(lockUntil);
        await this.userRepository.update(user);
        await this.cache.set(lockoutKey, '1', config.lockout.durationSeconds);
      }

      throw new Error('Invalid credentials');
    }

    // Successful login — reset failed attempts
    user.resetFailedAttempts();
    if (user.status === 'LOCKED') user.unlock();
    await this.userRepository.update(user);
    await this.cache.del(lockoutKey);

    // Issue token pair
    const accessToken = this.tokenService.signAccessToken({
      sub: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
    });

    const rawRefreshToken = this.tokenService.generateRefreshToken();
    const tokenHash = this.tokenService.hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + config.jwt.refreshTokenExpiry * 1000);

    const refreshToken = RefreshToken.create(user.id, tokenHash, expiresAt);
    await this.refreshTokenRepository.save(refreshToken);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: config.jwt.accessTokenExpiry,
    };
  }
}
