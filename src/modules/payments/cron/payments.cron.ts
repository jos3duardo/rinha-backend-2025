import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../entities/payment.entity';
import { In, Repository } from 'typeorm';
import { PaymentStatusEnum } from '../enumns/payment-status.enum';
import { ProcessPaymentService } from '../services/process-payment.service';

@Injectable()
export class PaymentsCron {
  private readonly logger = new Logger(PaymentsCron.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private processPaymentService: ProcessPaymentService,
  ) {}

  @Cron('*/10 * * * * *')
  async handleCron() {
    const payments = await this.paymentRepository.find({
      where: {
        status: In([PaymentStatusEnum.RETRY, PaymentStatusEnum.PROCESSING]),
      },
    });

    this.logger.debug(
      `Found ${payments.length} payments in processing or retry status`,
    );

    if (payments.length > 0) {
      for (const payment of payments) {
        await this.processPaymentService.execute(payment.id);
      }
    }
  }
}
