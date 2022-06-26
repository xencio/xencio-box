import { Controller, Get, Inject, Post, Query } from '@nestjs/common';

import { BOCService } from './boc/boc.service';
import { BANK_INSTANCE, BankStatementParams } from './routes.type';

@Controller()
export class RoutesController {
  constructor(@Inject(BANK_INSTANCE) private readonly fetchSrv: BOCService) {}

  @Get('bankStatement')
  bankStatement(@Query() params: BankStatementParams) {
    return this.fetchSrv.bankStatement(params);
  }
}
