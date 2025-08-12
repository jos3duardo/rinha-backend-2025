import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../entities/payment.entity';
import { Repository } from 'typeorm';
import { ProcessorTypeEnum } from '../enumns/processor-type.enum';

@Injectable()
export class PaymentsSummaryService {
  private readonly logger = new Logger(PaymentsSummaryService.name);

  constructor(
    @InjectRepository(Payment) private readonly repository: Repository<Payment>,
  ) {}

  async execute(from: string, to: string) {
    const qb = this.repository
      .createQueryBuilder('payment')
      .select('payment.paymentProcessor', 'processorType')
      .addSelect('COUNT(*)', 'totalRequests')
      .addSelect('SUM(payment.amount)', 'totalAmount')
      .where('payment.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy('payment.paymentProcessor');

    const results = await qb.getRawMany();

    const summary = {
      default: { totalRequests: 0, totalAmount: 0 },
      fallback: { totalRequests: 0, totalAmount: 0 },
    };

    for (const row of results) {
      if (row.processorType === ProcessorTypeEnum.DEFAULT) {
        summary.default.totalRequests = Number(row.totalRequests);
        summary.default.totalAmount = Number(row.totalAmount);
      } else if (row.processorType === ProcessorTypeEnum.FALLBACK) {
        summary.fallback.totalRequests = Number(row.totalRequests);
        summary.fallback.totalAmount = Number(row.totalAmount);
      }
    }

    return summary;
  }
}
