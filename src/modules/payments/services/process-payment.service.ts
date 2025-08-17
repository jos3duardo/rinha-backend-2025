import { Injectable, Logger } from '@nestjs/common';
import { PaymentDefaultProcessor } from '../processor/payment-default.processor';
import { PaymentFallbackProcessor } from '../processor/payment-fallback.processor';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { Payment } from '../entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessorTypeEnum } from '../enumns/processor-type.enum';

@Injectable()
export class ProcessPaymentService {
  private readonly logger = new Logger(ProcessPaymentService.name);

  constructor(
    @InjectRepository(Payment) private readonly repository: Repository<Payment>,
    private paymentDefaultProcessor: PaymentDefaultProcessor,
    private paymentFallbackProcessor: PaymentFallbackProcessor,
  ) {}

  async execute(job: CreatePaymentDto): Promise<void> {
    const existingPayment = await this.repository.findOne({
      where: { correlationId: job.correlationId },
    });

    if (existingPayment) return;

    let defaultSuccess = false;
    try {
      defaultSuccess = await this.paymentDefaultProcessor.execute(job);

      if (defaultSuccess) {
        await this.savePayment(job, ProcessorTypeEnum.DEFAULT);
        return;
      }
    } catch (error) {
      if (error.response?.status === 422) {
        await this.savePayment(job, ProcessorTypeEnum.DEFAULT);
        return;
      }
      this.logger.warn(`Default processor failed: ${error.message}`);
    }

    let fallbackSuccess = false;
    try {
      fallbackSuccess = await this.paymentFallbackProcessor.execute(job);

      if (fallbackSuccess) {
        await this.savePayment(job, ProcessorTypeEnum.FALLBACK);
        return;
      }
    } catch (error) {
      if (error.response?.status === 422) {
        await this.savePayment(job, ProcessorTypeEnum.FALLBACK);

        return;
      }

      throw new Error(`Payment processing failed for ${job.correlationId}`);
    }
  }

  private async savePayment(
    job: CreatePaymentDto,
    processor: ProcessorTypeEnum,
  ): Promise<void> {
    await this.repository.query(
      `
      INSERT INTO payments (correlation_id, amount, payment_processor)
      VALUES ($1, $2, $3)
      ON CONFLICT (correlation_id) DO NOTHING
      `,
      [job.correlationId, job.amount, processor],
    );
  }
}
