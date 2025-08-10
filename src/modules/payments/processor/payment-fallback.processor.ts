import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payment } from '../entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessorTypeEnum } from '../enumns/processor-type.enum';
import { PaymentStatusEnum } from '../enumns/payment-status.enum';
import { MakePaymentToProcessorService } from '../services/make-payment-to-processor.service';

@Injectable()
export class PaymentFallbackProcessor {
  private readonly logger = new Logger(PaymentFallbackProcessor.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Payment) private readonly repository: Repository<Payment>,
    private makePaymentToProcessorService: MakePaymentToProcessorService,
  ) {}

  async execute(payment: Payment): Promise<boolean> {
    const url = this.configService.get('paymentProcessors.fallbackUrl');

    const responseExists = await this.makePaymentToProcessorService.execute(
      payment,
      url,
    );

    if (responseExists) {
      await this.repository.update(payment.id, {
        ...payment,
        paymentProcessor: ProcessorTypeEnum.FALLBACK,
        status: PaymentStatusEnum.SUCCESS,
      });
      return true;
    }
    return false;
  }
}
