import { FastifyRequest, FastifyReply } from 'fastify';
import { RegisterUserHandler } from '../../../../../application/handlers/RegisterUserHandler';
import { LoginHandler } from '../../../../../application/handlers/LoginHandler';
import { RefreshTokenHandler } from '../../../../../application/handlers/RefreshTokenHandler';
import { LogoutHandler } from '../../../../../application/handlers/LogoutHandler';

export class AuthController {
  constructor(
    private readonly registerHandler: RegisterUserHandler,
    private readonly loginHandler: LoginHandler,
    private readonly refreshTokenHandler: RefreshTokenHandler,
    private readonly logoutHandler: LogoutHandler,
  ) {}

  async register(
    request: FastifyRequest<{
      Body: { method: 'EMAIL' | 'MOBILE'; email?: string; password?: string; phoneNumber?: string };
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    const result = await this.registerHandler.handle(request.body);
    reply.status(201).send(result);
  }

  async login(
    request: FastifyRequest<{
      Body: { email?: string; phoneNumber?: string; password: string };
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    const result = await this.loginHandler.handle(request.body);
    reply.status(200).send(result);
  }

  async refreshToken(
    request: FastifyRequest<{ Body: { refreshToken: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const result = await this.refreshTokenHandler.handle(request.body);
    reply.status(200).send(result);
  }

  async logout(
    request: FastifyRequest<{
      Body: { accessToken: string; refreshToken?: string };
      Headers: { authorization?: string };
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    // Extract userId from token (best-effort; validation done by middleware in production)
    const token = request.body.accessToken;
    // TODO: decode userId from token via TokenService
    await this.logoutHandler.handle({
      userId: 'unknown', // TODO: inject TokenService and decode
      accessToken: token,
      refreshToken: request.body.refreshToken,
    });
    reply.status(204).send();
  }
}
