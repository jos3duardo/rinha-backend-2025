import { Job } from 'bullmq';
import { PaymentJobData } from '../../queue/queue.service';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ProcessPaymentService } from '../services/process-payment.service';
import { PAYMENT_QUEUE } from '../../queue/constants/queue.constants';

@Processor(PAYMENT_QUEUE, { concurrency: 2 })
@Injectable()
export class PaymentProcessor extends WorkerHost {
  private readonly logger = new Logger(PaymentProcessor.name);

  constructor(private processPaymentService: ProcessPaymentService) {
    super();
  }

  async process(job: Job<PaymentJobData>) {
    const payment = job.data;
    await this.processPaymentService.execute(payment);
  }
}
