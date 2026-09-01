import { ValidateTokenQuery } from '../../../application/queries/ValidateTokenQuery';

export interface TokenPayload {
  sub: string;
  email?: string;
  phoneNumber?: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string | string[];
}

export interface IAuthQueryPort {
  validateToken(query: ValidateTokenQuery): Promise<TokenPayload>;
}
