import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: '192.168.1.112',
        port: 6379,
        username: 'default',
        password: '7TfhqvHPe98AQq123',
      },
    }),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class QueueModule {}
