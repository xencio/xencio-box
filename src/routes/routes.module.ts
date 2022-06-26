import { Module } from '@nestjs/common';

import { BOCService } from './boc/boc.service';
import { RoutesController } from './routes.controller';
import { BANK_INSTANCE } from './routes.type';

@Module({
  imports: [],
  controllers: [RoutesController],
  providers: [{ provide: BANK_INSTANCE, useClass: BOCService }]
})
export class RoutesModule {}
