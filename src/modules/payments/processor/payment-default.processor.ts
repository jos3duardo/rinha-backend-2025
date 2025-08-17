import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payment } from '../entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessorTypeEnum } from '../enumns/processor-type.enum';
import { MakePaymentToProcessorService } from '../services/make-payment-to-processor.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';

@Injectable()
export class PaymentDefaultProcessor {
  private readonly logger = new Logger(PaymentDefaultProcessor.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Payment) private readonly repository: Repository<Payment>,
    private makePaymentToProcessorService: MakePaymentToProcessorService,
  ) {}

  async execute(payment: CreatePaymentDto): Promise<boolean> {
    const url = this.configService.get('paymentProcessors.defaultUrl');

    const responseExists = await this.makePaymentToProcessorService.execute(
      payment,
      url,
    );

    if (!responseExists) return false;
    await this.repository.query(
      `
      INSERT INTO payments (correlation_id, amount, payment_processor)
      VALUES ($1, $2, $3)
      ON CONFLICT (correlation_id) DO NOTHING
      `,
      [payment.correlationId, payment.amount, ProcessorTypeEnum.DEFAULT],
    );
    return true;
  }
}
