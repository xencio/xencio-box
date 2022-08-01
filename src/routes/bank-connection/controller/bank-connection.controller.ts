import { BadRequestException, Body, Controller, Get, Post, Query, UseFilters, UseGuards } from '@nestjs/common';
import { BOX_MESSAGE } from '@shared/constant';
import { format } from 'date-fns';
import { XMLBuilder } from 'fast-xml-parser';
import { lastValueFrom, map } from 'rxjs';

import { BankServiceExceptionFilter } from '../bank-connection.exception';
import { TransferAuthGuard } from '../bank-connection.guard';
import { BOCService } from '../service/boc/boc.service';
import { BankStatementParams, TransferParams, TransferStatusParams } from './controller.request';

@Controller('account')
@UseFilters(BankServiceExceptionFilter)
export class AccountController {
  constructor(private readonly fetchSrv: BOCService) {}

  @Get('statement')
  async bankStatement(@Query() params: BankStatementParams) {
    return await lastValueFrom(
      this.fetchSrv.bankStatement(params).pipe(
        map(data => {
          const formattedList = data.list.map(item => ({
            ...item,
            trxDate: format(item.trxDate, 'yyyy-MM-dd HH:mm:ss.SSS')
          }));
          if (params.dataFormat === 'xml') {
            const xmlBuilder = new XMLBuilder({});
            return `
          <?xml version="1.0" encoding="utf-8"?>
          <xencio>${xmlBuilder.build({
            summary: {
              totalPages: data.pageable.totalPageCount,
              totalRecords: data.pageable.totalCount,
              currentPage: data.pageable.pageNow,
              nextPageFlag: data.pageable.hasNext ? 1 : 0
            },
            rows: { row: formattedList }
          })}</xencio>
          `;
          }
          return { pageable: data.pageable, list: formattedList };
        })
      )
    );
  }

  @Get('')
  async accountBalance(@Query('accountNo') queryNo: string) {
    return await lastValueFrom(this.fetchSrv.accountInformation(queryNo));
  }
}

@Controller('transfer')
@UseFilters(BankServiceExceptionFilter)
export class TransferController {
  constructor(private readonly fetchSrv: BOCService) {}

  @Post('')
  @UseGuards(TransferAuthGuard)
  async transfer(@Body() params: TransferParams) {
    return await lastValueFrom(
      this.fetchSrv
        .transfer(params)
        .pipe(map(data => ({ code: data.code, message: data.message || BOX_MESSAGE.get(data.code) })))
    );
  }

  @Get('status')
  async status(@Query() params: TransferStatusParams) {
    if (!params.uniqueId && !params.acceptNo && !params.packageNo) {
      throw new BadRequestException('缺少转账记录唯一标识参数');
    }

    return await lastValueFrom(
      this.fetchSrv
        .transferStatus(params)
        .pipe(map(data => ({ code: data.code, message: data.message || BOX_MESSAGE.get(data.code) })))
    );
  }
}
