import { Module } from '@nestjs/common';
import { HealthService } from './services/health.service';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [HttpModule, ScheduleModule.forRoot()],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
