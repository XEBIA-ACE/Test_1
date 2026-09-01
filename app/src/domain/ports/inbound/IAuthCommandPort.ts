import { RegisterUserCommand } from '../../../application/commands/RegisterUserCommand';
import { LoginCommand } from '../../../application/commands/LoginCommand';
import { RefreshTokenCommand } from '../../../application/commands/RefreshTokenCommand';
import { LogoutCommand } from '../../../application/commands/LogoutCommand';
import { VerifyOtpCommand } from '../../../application/commands/VerifyOtpCommand';

export interface RegisterResult {
  userId: string;
  message: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface IAuthCommandPort {
  register(command: RegisterUserCommand): Promise<RegisterResult>;
  login(command: LoginCommand): Promise<LoginResult>;
  refreshToken(command: RefreshTokenCommand): Promise<RefreshResult>;
  logout(command: LogoutCommand): Promise<void>;
  verifyOtp(command: VerifyOtpCommand): Promise<void>;
}
