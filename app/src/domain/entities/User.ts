import { v4 as uuidv4 } from 'uuid';

export type UserStatus = 'PENDING' | 'ACTIVE' | 'LOCKED' | 'DEACTIVATED';
export type RegistrationMethod = 'EMAIL' | 'MOBILE' | 'GOOGLE' | 'FACEBOOK';

export interface UserProps {
  id: string;
  email?: string;
  phoneNumber?: string;
  passwordHash?: string;
  status: UserStatus;
  registrationMethod: RegistrationMethod;
  oauthProvider?: string;
  oauthProviderId?: string;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  readonly id: string;
  email?: string;
  phoneNumber?: string;
  passwordHash?: string;
  status: UserStatus;
  registrationMethod: RegistrationMethod;
  oauthProvider?: string;
  oauthProviderId?: string;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.phoneNumber = props.phoneNumber;
    this.passwordHash = props.passwordHash;
    this.status = props.status;
    this.registrationMethod = props.registrationMethod;
    this.oauthProvider = props.oauthProvider;
    this.oauthProviderId = props.oauthProviderId;
    this.failedLoginAttempts = props.failedLoginAttempts;
    this.lockedUntil = props.lockedUntil;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    params: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt' | 'failedLoginAttempts' | 'status'>,
  ): User {
    const now = new Date();
    return new User({
      ...params,
      id: uuidv4(),
      status: 'PENDING',
      failedLoginAttempts: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  isLocked(): boolean {
    if (this.status === 'LOCKED' && this.lockedUntil) {
      return new Date() < this.lockedUntil;
    }
    return false;
  }

  activate(): void {
    this.status = 'ACTIVE';
    this.updatedAt = new Date();
  }

  lock(until: Date): void {
    this.status = 'LOCKED';
    this.lockedUntil = until;
    this.updatedAt = new Date();
  }

  unlock(): void {
    this.status = 'ACTIVE';
    this.lockedUntil = undefined;
    this.failedLoginAttempts = 0;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.status = 'DEACTIVATED';
    this.updatedAt = new Date();
  }

  incrementFailedAttempts(): void {
    this.failedLoginAttempts += 1;
    this.updatedAt = new Date();
  }

  resetFailedAttempts(): void {
    this.failedLoginAttempts = 0;
    this.updatedAt = new Date();
  }
}
