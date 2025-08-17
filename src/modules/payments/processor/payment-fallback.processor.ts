import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MakePaymentToProcessorService } from '../services/make-payment-to-processor.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';

@Injectable()
export class PaymentFallbackProcessor {
  private readonly logger = new Logger(PaymentFallbackProcessor.name);

  constructor(
    private readonly configService: ConfigService,
    private makePaymentToProcessorService: MakePaymentToProcessorService,
  ) {}

  async execute(payment: CreatePaymentDto): Promise<boolean> {
    const url = this.configService.get('paymentProcessors.fallbackUrl');

    return await this.makePaymentToProcessorService.execute(payment, url);
  }
}
