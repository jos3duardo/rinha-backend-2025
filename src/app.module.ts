import { Module } from '@nestjs/common';
import { PaymentsModule } from './modules/payments/payments.module';
import { DatabaseModule } from './modules/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from './modules/queue/queue.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    PaymentsModule,
    QueueModule,
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
