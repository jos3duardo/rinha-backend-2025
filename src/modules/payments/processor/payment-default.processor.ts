import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payment } from '../entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessorTypeEnum } from '../enumns/processor-type.enum';
import { PaymentStatusEnum } from '../enumns/payment-status.enum';
import { MakePaymentToProcessorService } from '../services/make-payment-to-processor.service';
import { PaymentJobData } from '../../queue/queue.service';

@Injectable()
export class PaymentDefaultProcessor {
  private readonly logger = new Logger(PaymentDefaultProcessor.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Payment) private readonly repository: Repository<Payment>,
    private makePaymentToProcessorService: MakePaymentToProcessorService,
  ) {}

  async execute(payment: PaymentJobData): Promise<boolean> {
    const url = this.configService.get('paymentProcessors.defaultUrl');

    const responseExists = await this.makePaymentToProcessorService.execute(
      payment,
      url,
    );

    if (responseExists) {
      await this.repository.save({
        amount: payment.paymentData.amount,
        correlationId: payment.paymentData.correlationId,
        createdAt: payment.createdAt,
        paymentProcessor: ProcessorTypeEnum.DEFAULT,
        status: PaymentStatusEnum.SUCCESS,
      });
      return true;
    }

    return false;
  }
}
