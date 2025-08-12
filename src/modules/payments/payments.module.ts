import { Module } from '@nestjs/common';
import { PaymentsService } from './services/payments.service';
import { PaymentsController } from './payments.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentDefaultProcessor } from './processor/payment-default.processor';
import { PaymentProcessor } from './processor/payment.processor';
import { ProcessPaymentService } from './services/process-payment.service';
import { QueueModule } from '../queue/queue.module';
import { DatabaseModule } from '../database/database.module';
import { PaymentFallbackProcessor } from './processor/payment-fallback.processor';
import { PaymentsSummaryService } from './services/payments-summary.service';
import { MakePaymentToProcessorService } from './services/make-payment-to-processor.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    HttpModule,
    QueueModule,
    DatabaseModule,
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentDefaultProcessor,
    PaymentProcessor,
    ProcessPaymentService,
    PaymentFallbackProcessor,
    PaymentsSummaryService,
    MakePaymentToProcessorService,
  ],
})
export class PaymentsModule {}
