import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { ServiceStatusEnum } from '../enumns/service-status.enum';
import { ProcessorTypeEnum } from '../../payments/enumns/processor-type.enum';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private defaultServiceStatus: ServiceStatusEnum = ServiceStatusEnum.UP;
  private fallbackServiceStatus: ServiceStatusEnum = ServiceStatusEnum.UP;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @Cron('*/5 * * * * *')
  async performHealthChecks() {
    const defaultUrl: string =
      this.configService.get<string>('paymentProcessors.defaultUrl') ?? '';
    const fallbackUrl: string =
      this.configService.get<string>('paymentProcessors.fallbackUrl') ?? '';

    await Promise.all([
      this.checkServiceHealth(
        ProcessorTypeEnum.DEFAULT,
        `${defaultUrl}/payments/service-health`,
      ),
      this.checkServiceHealth(
        ProcessorTypeEnum.FALLBACK,
        `${fallbackUrl}/payments/service-health`,
      ),
    ]);
  }

  shouldUseDefaultProcessor(): boolean {
    return this.defaultServiceStatus === ServiceStatusEnum.UP;
  }

  shouldUseFallbackProcessor(): boolean {
    return this.fallbackServiceStatus === ServiceStatusEnum.UP;
  }

  getPreferredProcessor(): 'default' | 'fallback' | null {
    if (this.shouldUseDefaultProcessor()) {
      return 'default';
    } else if (this.shouldUseFallbackProcessor()) {
      return 'fallback';
    }
    return null;
  }

  private async checkServiceHealth(
    serviceName: string,
    url: string,
  ): Promise<void> {
    let status: ServiceStatusEnum;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          timeout: 500,
        }),
      );

      status =
        response.status === 200 ? ServiceStatusEnum.UP : ServiceStatusEnum.DOWN;
    } catch (error) {
      status = ServiceStatusEnum.DOWN;
    }

    if (serviceName === 'default') {
      this.defaultServiceStatus = status;
    } else {
      this.fallbackServiceStatus = status;
    }
  }
}
