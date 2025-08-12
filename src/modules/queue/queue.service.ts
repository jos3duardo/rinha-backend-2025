import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreatePaymentDto } from '../payments/dto/create-payment.dto';
import { PAYMENT_QUEUE } from './constants/queue.constants';

@Injectable()
export class QueueService {
  constructor(@InjectQueue(PAYMENT_QUEUE) private paymentQueue: Queue) {}

  async addPaymentJob(data: CreatePaymentDto): Promise<void> {
    await this.paymentQueue.add(PAYMENT_QUEUE, data, {
      jobId: data.correlationId,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
    });
  }
}
