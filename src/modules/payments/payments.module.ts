import { Module } from '@nestjs/common';
import { PaymentsService } from './services/payments.service';
import { PaymentsController } from './payments.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { HealthModule } from '../health/health.module';
import { PaymentDefaultProcessor } from './processor/payment-default.processor';
import { RetryPaymentService } from './services/retry-payment.service';
import { PaymentProcessor } from './processor/payment.processor';
import { ProcessPaymentService } from './services/process-payment.service';
import { QueueModule } from '../queue/queue.module';
import { DatabaseModule } from '../database/database.module';
import { PaymentFallbackProcessor } from './processor/payment-fallback.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    HttpModule,
    HealthModule,
    QueueModule,
    DatabaseModule,
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentDefaultProcessor,
    RetryPaymentService,
    PaymentProcessor,
    ProcessPaymentService,
    PaymentFallbackProcessor,
  ],
})
export class PaymentsModule {}
