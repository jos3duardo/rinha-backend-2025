import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreatePaymentDto } from '../payments/dto/create-payment.dto';
import { PAYMENT_QUEUE } from './constants/queue.constants';

export interface PaymentJobData {
  paymentId: string;
  paymentData: CreatePaymentDto;
  retryCount?: number;
}

@Injectable()
export class QueueService {
  constructor(@InjectQueue(PAYMENT_QUEUE) private paymentQueue: Queue) {}

  async addPaymentJob(data: PaymentJobData): Promise<void> {
    await this.paymentQueue.add(PAYMENT_QUEUE, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 10,
      removeOnFail: 5,
    });
  }

  async addRetryPaymentJob(
    data: PaymentJobData,
    delay: number = 5000,
  ): Promise<void> {
    await this.paymentQueue.add('process-payment', data, {
      delay,
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
      removeOnComplete: 10,
      removeOnFail: 5,
    });
  }
}
