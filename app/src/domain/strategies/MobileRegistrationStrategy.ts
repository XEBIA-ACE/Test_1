import { User } from '../entities/User';
import { PhoneNumber } from '../value-objects/PhoneNumber';
import { IUserRepository } from '../ports/outbound/IUserRepository';
import { OtpService } from '../services/OtpService';
import { IOutboxRepository } from '../ports/outbound/IOutboxRepository';
import { OutboxEvent } from '../entities/OutboxEvent';

export interface MobileRegistrationParams {
  phoneNumber: string;
}

export class MobileRegistrationStrategy {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpService: OtpService,
    private readonly outboxRepository: IOutboxRepository,
  ) {}

  async execute(params: MobileRegistrationParams): Promise<{ user: User; otp: string }> {
    const phone = PhoneNumber.create(params.phoneNumber);

    const existing = await this.userRepository.findByPhoneNumber(phone.toString());
    if (existing && existing.status !== 'PENDING') {
      throw new Error('An account with this phone number already exists');
    }

    const user = existing ?? User.create({
      phoneNumber: phone.toString(),
      registrationMethod: 'MOBILE',
    });

    const savedUser = existing ? user : await this.userRepository.save(user);

    const otp = this.otpService.generate();
    await this.otpService.store(phone.toString(), otp);

    // Publish OTPRequested event via Transactional Outbox
    const event = OutboxEvent.create(
      savedUser.id,
      'User',
      'OTPRequested',
      { userId: savedUser.id, phoneNumber: phone.toString() },
    );
    await this.outboxRepository.save(event);

    return { user: savedUser, otp };
  }
}
