import { HttpService } from '@nestjs/axios';
import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';

import { BOX_CODE } from '@shared/constant';

import { BankConnectionOption } from '../bank-connection.model';
import { BankStatementParams, TransferParams, TransferStatusParams } from '../controller/controller.request';
import { AccountInfo, AccountStatement, PageableResponse } from './service.type';

export interface ConnectionService {
  bankStatement(params: BankStatementParams): Observable<{ pageable: PageableResponse; list: AccountStatement[] }>;

  accountInformation(accountNo: string): Observable<AccountInfo>;

  transfer(
    params: TransferParams
  ): Observable<{ code: BOX_CODE; message?: string; data: { acceptNo: string; uniqueId: string } }>;

  transferStatus(params: TransferStatusParams): Observable<{ code: BOX_CODE; message?: string }>;
}

export class ConnectionEntity implements ConnectionService {
  static readonly BANK: string;

  protected readonly options: Record<string, any>;

  constructor(
    protected readonly http: HttpService,
    protected readonly traceId: string,
    protected readonly opt: BankConnectionOption
  ) {
    this.options = opt.options;
    this.traceId = this.traceId || randomUUID();
  }

  bankStatement(params: BankStatementParams): Observable<{ pageable: PageableResponse; list: AccountStatement[] }> {
    throw new Error('Method not implemented.');
  }

  accountInformation(accountNo: string): Observable<AccountInfo> {
    throw new Error('Method not implemented.');
  }

  transfer(
    params: TransferParams
  ): Observable<{ code: BOX_CODE; message?: string; data: { acceptNo: string; uniqueId: string } }> {
    throw new Error('Method not implemented.');
  }

  transferStatus(params: TransferStatusParams): Observable<{ code: BOX_CODE; message?: string }> {
    throw new Error('Method not implemented.');
  }
}
