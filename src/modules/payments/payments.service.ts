import { Injectable, Logger } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectQueue('payments') private readonly paymentsQueue: Queue,
    private readonly httpService: HttpService,
    @InjectRepository(Payment) private readonly repository: Repository<Payment>,
  ) {}

  async store(createPaymentDto: CreatePaymentDto) {
    const urlPaymentDefault = 'http://192.168.1.126:8002/payments';
    const { data } = await firstValueFrom(
      this.httpService.post(urlPaymentDefault, createPaymentDto).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error?.response);
          throw 'An error happened!';
        }),
      ),
    );
    await this.repository.save({
      ...createPaymentDto,
      paymentProcessor: 'default',
    });
    this.logger.log(data);
    return data;
  }
}
