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
    let result = false;
    try {
      result = await this.paymentDefaultProcessor.execute(job);
    } catch (error) {
      if (error.response?.status === 422) {
        await this.repository.query(
          `
            INSERT INTO payments (correlation_id, amount, payment_processor)
            VALUES ($1, $2, $3)
            ON CONFLICT (correlation_id) DO NOTHING
            `,
          [job.correlationId, job.amount, ProcessorTypeEnum.DEFAULT],
        );
        this.logger.warn(
          `Pagamento já realizado para correlationId: ${job.correlationId}`,
        );
        return; // Não lança exceção, job é considerado processado
      }
      this.logger.warn(`Default processor failed: ${error.message}`);
    }
    if (!result) {
      await this.paymentFallbackProcessor.execute(job);
      await this.repository.query(
        `
        INSERT INTO payments (correlation_id, amount, payment_processor)
        VALUES ($1, $2, $3)
        ON CONFLICT (correlation_id) DO NOTHING
        `,
        [job.correlationId, job.amount, ProcessorTypeEnum.FALLBACK],
      );
    }
    throw new Error('Payment processing failed');
  }
}
