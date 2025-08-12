import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreatePaymentDto } from '../payments/dto/create-payment.dto';
import { PAYMENT_QUEUE } from './constants/queue.constants';

export interface PaymentJobData {
  paymentData: CreatePaymentDto;
  createdAt: Date;
}

@Injectable()
export class QueueService {
  constructor(@InjectQueue(PAYMENT_QUEUE) private paymentQueue: Queue) {}

  async addPaymentJob(data: PaymentJobData): Promise<void> {
    await this.paymentQueue.add(PAYMENT_QUEUE, data, {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 3,
      removeOnFail: 2,
    });
  }
}
