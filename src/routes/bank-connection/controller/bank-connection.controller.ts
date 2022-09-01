import { HttpService } from '@nestjs/axios';
import { BadRequestException, Body, Controller, Get, Post, Query, UseFilters, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { XMLBuilder } from 'fast-xml-parser';
import { lastValueFrom, map } from 'rxjs';
import { Repository } from 'typeorm';

import { SiteUser, User } from '@auth/auth.type';
import { BOX_CODE, BOX_MESSAGE } from '@shared/constant';

import { BankServiceException, BankServiceExceptionFilter } from '../bank-connection.exception';
import { TransferAuthGuard } from '../bank-connection.guard';
import { BankConnectionOption } from '../bank-connection.model';
import { BOCService } from '../service/boc/boc.service';
import { BankStatementParams, TransferParams, TransferStatusParams } from './controller.request';

@Controller('account')
@UseFilters(BankServiceExceptionFilter)
export class AccountController {
  constructor(
    private readonly http: HttpService,
    @InjectRepository(BankConnectionOption) private readonly optionRepo: Repository<BankConnectionOption>
  ) {}

  @Get('statement')
  async bankStatement(@User() user: SiteUser, @Query() params: BankStatementParams) {
    const fetchSrv = new BOCService(this.http, user.traceId, await this.reloadOption(user.clientId));
    return await lastValueFrom(
      fetchSrv.bankStatement(params).pipe(
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
  async accountBalance(@User() user: SiteUser, @Query('accountNo') queryNo: string) {
    const fetchSrv = new BOCService(this.http, user.traceId, await this.reloadOption(user.clientId));
    return await lastValueFrom(fetchSrv.accountInformation(queryNo));
  }

  private async reloadOption(clientId: string) {
    const option = await this.optionRepo.findOneBy({ client: { clientId } });
    if (!option) {
      const error = new BankServiceException(null, null, BOX_CODE.BANK_CONFIGURATION_EMPTY);
      error.BANK = 'BOC';
      throw error;
    }
    return option;
  }
}

@Controller('transfer')
@UseFilters(BankServiceExceptionFilter)
export class TransferController {
  constructor(
    private readonly http: HttpService,
    @InjectRepository(BankConnectionOption) private readonly optionRepo: Repository<BankConnectionOption>
  ) {}

  @Post('')
  @UseGuards(TransferAuthGuard)
  async transfer(@User() user: SiteUser, @Body() params: TransferParams) {
    const fetchSrv = new BOCService(this.http, user.traceId, await this.reloadOption(user.clientId));
    return await lastValueFrom(
      fetchSrv
        .transfer(params)
        .pipe(map(data => ({ code: data.code, message: data.message || BOX_MESSAGE.get(data.code) })))
    );
  }

  @Get('status')
  async status(@User() user: SiteUser, @Query() params: TransferStatusParams) {
    if (!params.uniqueId && !params.acceptNo && !params.packageNo) {
      throw new BadRequestException('缺少转账记录唯一标识参数');
    }

    const fetchSrv = new BOCService(this.http, user.traceId, await this.reloadOption(user.clientId));
    return await lastValueFrom(
      fetchSrv
        .transferStatus(params)
        .pipe(map(data => ({ code: data.code, message: data.message || BOX_MESSAGE.get(data.code) })))
    );
  }

  private async reloadOption(clientId: string) {
    const option = await this.optionRepo.findOneBy({ client: { clientId } });
    if (!option) {
      const error = new BankServiceException(null, null, BOX_CODE.BANK_CONFIGURATION_EMPTY);
      error.BANK = 'BOC';
      throw error;
    }
    return option;
  }
}
