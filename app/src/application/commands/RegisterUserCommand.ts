export type RegistrationMethod = 'EMAIL' | 'MOBILE';

export interface RegisterUserCommand {
  method: RegistrationMethod;
  email?: string;
  password?: string;
  phoneNumber?: string;
}
