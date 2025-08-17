import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ProcessPaymentService } from '../services/process-payment.service';
import { PAYMENT_QUEUE } from '../../queue/constants/queue.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../entities/payment.entity';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from '../dto/create-payment.dto';

@Processor(PAYMENT_QUEUE, { concurrency: 10 })
@Injectable()
export class PaymentProcessor extends WorkerHost {
  private readonly logger = new Logger(PaymentProcessor.name);

  constructor(
    private processPaymentService: ProcessPaymentService,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {
    super();
  }

  async process(job: Job<CreatePaymentDto>) {
    await this.processPaymentService.execute(job.data);
  }
}
