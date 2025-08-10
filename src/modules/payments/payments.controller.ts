import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PaymentsService } from './services/payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsSummaryService } from './services/payments-summary.service';

@Controller()
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentsSummaryService: PaymentsSummaryService,
  ) {}

  @Post('payments')
  async payment(@Body() createPaymentDto: CreatePaymentDto): Promise<any> {
    return this.paymentsService.store(createPaymentDto);
  }

  @Get('payments-summary')
  async getPaymentsSummary(
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<any> {
    return this.paymentsSummaryService.execute(from, to);
  }
}
