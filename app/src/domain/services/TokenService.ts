import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../../config';

export interface AccessTokenPayload {
  sub: string;
  email?: string;
  phoneNumber?: string;
}

export interface SignedTokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
}

export class TokenService {
  private privateKey: string;
  private publicKey: string;

  constructor(privateKey: string, publicKey: string) {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: config.jwt.accessTokenExpiry,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    });
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  verifyAccessToken(token: string): jwt.JwtPayload {
    return jwt.verify(token, this.publicKey, {
      algorithms: ['RS256'],
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    }) as jwt.JwtPayload;
  }

  decodeToken(token: string): jwt.JwtPayload | null {
    const decoded = jwt.decode(token);
    if (typeof decoded === 'string' || decoded === null) return null;
    return decoded;
  }
}
