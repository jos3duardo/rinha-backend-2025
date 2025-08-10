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
export class PaymentDefaultProcessor {
  private readonly logger = new Logger(PaymentDefaultProcessor.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Payment) private readonly repository: Repository<Payment>,
  ) {}

  async execute(payment: Payment): Promise<boolean> {
    const url = this.configService.get('paymentProcessors.defaultUrl');

    this.logger.log(
      `Processando Pagamento ${payment.id} com default processor`,
    );

    const paymentData = {
      amount: payment.amount,
      correlationId: payment.correlationId,
    };

    const response = await firstValueFrom(
      this.httpService.post(`${url}/payments`, paymentData, {
        timeout: 2000, // 30 segundos
      }),
    );
    this.logger.log(response.status === 200);
    if (response.status === 200) {
      this.logger.log(
        `Payment ${payment.id} processed successfully via default processor`,
      );

      await this.repository.update(payment.id, {
        ...payment,
        paymentProcessor: ProcessorTypeEnum.DEFAULT,
        status: PaymentStatusEnum.SUCCESS,
      });
      return true;
    }
    this.logger.log(
      `Payment ${payment.id} not processed successfully via default processor: ${response.data.message || 'Unknown error'}`,
    );
    return false;
  }
}
