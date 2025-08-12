import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../entities/payment.entity';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from '../dto/create-payment.dto';

@Injectable()
export class MakePaymentToProcessorService {
  private readonly logger = new Logger(MakePaymentToProcessorService.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Payment) private readonly repository: Repository<Payment>,
  ) {}

  async execute(payment: CreatePaymentDto, url: string): Promise<boolean> {
    const paymentData = {
      amount: payment.amount,
      correlationId: payment.correlationId,
    };

    const response = await firstValueFrom(
      this.httpService.post(`${url}/payments`, paymentData, {
        timeout: 2000,
      }),
    );
    if (response.status !== 200) {
      throw new Error(response.data.message || 'Payment processor error');
    }
    return response.status === 200;
  }
}
