import { Injectable, Logger } from '@nestjs/common';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../entities/payment.entity';
import { Repository } from 'typeorm';
import { QueueService } from '../../queue/queue.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment) private readonly repository: Repository<Payment>,
    private queueService: QueueService,
  ) {}

  async store(createPaymentDto: CreatePaymentDto) {
    await this.queueService.addPaymentJob({
      ...createPaymentDto,
    });

    return {
      success: true,
      message: 'Payment created successfully and added to processing queue',
    };
  }
}
