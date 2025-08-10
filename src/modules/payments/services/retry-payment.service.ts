import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../entities/payment.entity';
import { Repository } from 'typeorm';
import { ProcessorTypeEnum } from '../enumns/processor-type.enum';
import { HealthService } from '../../health/services/health.service';
import { PaymentStatusEnum } from '../enumns/payment-status.enum';
import { PaymentDefaultProcessor } from '../processor/payment-default.processor';
import { PaymentFallbackProcessor } from '../processor/payment-fallback.processor';
import { QueueService } from '../../queue/queue.service';

@Injectable()
export class RetryPaymentService {
  private readonly logger = new Logger(RetryPaymentService.name);

  constructor(
    @InjectRepository(Payment) private readonly repository: Repository<Payment>,
    private healthService: HealthService,
    private paymentDefaultProcessor: PaymentDefaultProcessor,
    private paymentFallbackProcessor: PaymentFallbackProcessor,
    private queueService: QueueService,
  ) {}

  async execute(paymentId: string, failedProcessor: ProcessorTypeEnum) {
    const alternativeProcessor =
      failedProcessor === ProcessorTypeEnum.DEFAULT
        ? ProcessorTypeEnum.FALLBACK
        : ProcessorTypeEnum.DEFAULT;

    const payment = await this.repository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error(`Payment ${paymentId} not found`);
    }

    const isAlternativeAvailable =
      alternativeProcessor === ProcessorTypeEnum.DEFAULT
        ? this.healthService.shouldUseDefaultProcessor()
        : this.healthService.shouldUseFallbackProcessor();

    if (!isAlternativeAvailable) {
      await this.repository.update(payment.id, {
        status: PaymentStatusEnum.RETRY,
      });
    }

    try {
      let result;

      if (failedProcessor === ProcessorTypeEnum.DEFAULT) {
        result = await this.paymentDefaultProcessor.execute(payment);
      } else {
        result = await this.paymentFallbackProcessor.execute(payment);
      }

      if (result) {
        this.logger.log(
          `Nova Tentativa do Payment ${payment?.id} processed successfully via ${alternativeProcessor}`,
        );
      } else {
        await this.queueService.addRetryPaymentJob({
          paymentId: payment.id,
          paymentData: {
            amount: payment.amount,
            correlationId: payment.correlationId,
          },
        });

        await this.repository.update(payment.id, {
          status: PaymentStatusEnum.RETRY,
        });
      }
    } catch (error) {
      this.logger.error('Error processing payment:', error.message);

      await this.repository.update(payment.id, {
        status: PaymentStatusEnum.FAILED,
        errorMessage: error.message,
      });
    }
  }
}
