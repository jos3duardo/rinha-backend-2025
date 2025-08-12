import { Injectable, Logger } from '@nestjs/common';
import { PaymentDefaultProcessor } from '../processor/payment-default.processor';
import { PaymentFallbackProcessor } from '../processor/payment-fallback.processor';
import { CreatePaymentDto } from '../dto/create-payment.dto';

@Injectable()
export class ProcessPaymentService {
  private readonly logger = new Logger(ProcessPaymentService.name);

  constructor(
    private paymentDefaultProcessor: PaymentDefaultProcessor,
    private paymentFallbackProcessor: PaymentFallbackProcessor,
  ) {}

  async execute(job: CreatePaymentDto): Promise<void> {
    const result = await this.paymentDefaultProcessor.execute(job);
    if (!result) await this.paymentFallbackProcessor.execute(job);
  }
}
