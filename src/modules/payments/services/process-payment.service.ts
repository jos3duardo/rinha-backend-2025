import { Injectable, Logger } from '@nestjs/common';
import { PaymentDefaultProcessor } from '../processor/payment-default.processor';
import { PaymentFallbackProcessor } from '../processor/payment-fallback.processor';
import { PaymentJobData } from '../../queue/queue.service';

@Injectable()
export class ProcessPaymentService {
  private readonly logger = new Logger(ProcessPaymentService.name);

  constructor(
    private paymentDefaultProcessor: PaymentDefaultProcessor,
    private paymentFallbackProcessor: PaymentFallbackProcessor,
  ) {}

  async execute(job: PaymentJobData): Promise<void> {
    const result = await this.paymentDefaultProcessor.execute(job);
    if (!result) await this.paymentFallbackProcessor.execute(job);
  }
}
