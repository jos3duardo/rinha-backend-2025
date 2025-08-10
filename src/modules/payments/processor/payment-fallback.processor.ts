import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Payment } from '../entities/payment.entity';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessorTypeEnum } from '../enumns/processor-type.enum';
import { PaymentStatusEnum } from '../enumns/payment-status.enum';

@Injectable()
export class PaymentFallbackProcessor {
  private readonly logger = new Logger(PaymentFallbackProcessor.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Payment) private readonly repository: Repository<Payment>,
  ) {}

  async execute(payment: Payment): Promise<boolean> {
    const url = this.configService.get('paymentProcessors.fallbackUrl');

    this.logger.log(`Processing payment ${payment.id} via fallback processor`);

    const paymentData = {
      amount: payment.amount,
      correlationId: payment.correlationId,
    };

    const response = await firstValueFrom(
      this.httpService.post(`${url}/payments`, paymentData, {
        timeout: 2000, // 30 segundos
      }),
    );

    if (response.status === 200 && response.data.success) {
      this.logger.log(
        `Payment ${payment.id} processed successfully via fallback processor`,
      );

      await this.repository.update(payment.id, {
        ...payment,
        paymentProcessor: ProcessorTypeEnum.FALLBACK,
        status: PaymentStatusEnum.SUCCESS,
      });
      return true;
    }
    return false;
  }
}
