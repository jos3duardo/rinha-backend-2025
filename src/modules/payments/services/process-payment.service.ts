import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../entities/payment.entity';
import { Repository } from 'typeorm';
import { HealthService } from '../../health/services/health.service';
import { ProcessorTypeEnum } from '../enumns/processor-type.enum';
import { PaymentStatusEnum } from '../enumns/payment-status.enum';
import { PaymentDefaultProcessor } from '../processor/payment-default.processor';
import { PaymentFallbackProcessor } from '../processor/payment-fallback.processor';

@Injectable()
export class ProcessPaymentService {
  private readonly logger = new Logger(ProcessPaymentService.name);

  constructor(
    @InjectRepository(Payment) private readonly repository: Repository<Payment>,
    private healthService: HealthService,
    private paymentDefaultProcessor: PaymentDefaultProcessor,
    private paymentFallbackProcessor: PaymentFallbackProcessor,
  ) {}

  async execute(paymentId: string): Promise<void> {
    const payment = await this.repository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error(`Payment ${paymentId} not found`);
    }

    await this.repository.update(paymentId, {
      status: PaymentStatusEnum.PROCESSING,
    });

    const preferredProcessor = this.healthService.getPreferredProcessor();

    if (!preferredProcessor) {
      throw new Error('No payment processor available');
    }

    try {
      if (preferredProcessor === ProcessorTypeEnum.DEFAULT) {
        await this.paymentDefaultProcessor.execute(payment);
      } else {
        await this.paymentFallbackProcessor.execute(payment);
      }
    } catch (error) {
      this.logger.error(
        `Error processing payment ${paymentId}:`,
        error.message,
      );
      await this.repository.update(payment.id, {
        status: PaymentStatusEnum.RETRY,
      });
    }
  }
}
