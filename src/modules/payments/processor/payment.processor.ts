import { Job } from 'bullmq';
import { PaymentJobData } from '../../queue/queue.service';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ProcessPaymentService } from '../services/process-payment.service';
import { PAYMENT_QUEUE } from '../../queue/constants/queue.constants';

@Processor(PAYMENT_QUEUE)
@Injectable()
export class PaymentProcessor extends WorkerHost {
  private readonly logger = new Logger(PaymentProcessor.name);

  constructor(private processPaymentService: ProcessPaymentService) {
    super();
  }

  async process(job: Job<PaymentJobData>) {
    const { paymentId, retryCount = 0 } = job.data;

    this.logger.log(
      `Processing payment ${paymentId}, attempt ${retryCount + 1}`,
    );

    try {
      await this.processPaymentService.execute(paymentId);
      this.logger.log(`Pagamento ${paymentId} processado com sucesso`);

      return { success: true, paymentId };
    } catch (error) {
      this.logger.error(
        `Failed to process payment ${paymentId}:`,
        error.message,
      );
      throw error;
    }
  }
}
