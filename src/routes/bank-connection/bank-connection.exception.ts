import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

import { BOX_CODE, BOX_MESSAGE } from '@shared/constant';

export class BankServiceException extends Error {
  BANK: string;

  protected readonly CODE_MESSAGE_MAP = new Map<string, string>();

  constructor(public bankCode: string, message?: string, public boxCode: BOX_CODE = BOX_CODE.BANK_FAILURE) {
    super(message || '');
  }

  get normalizeMessage() {
    return (
      this.message ||
      (this.CODE_MESSAGE_MAP.has(this.bankCode) && this.CODE_MESSAGE_MAP.get(this.bankCode)) ||
      (BOX_MESSAGE.has(this.boxCode) && BOX_MESSAGE.get(this.boxCode)) ||
      '银行服务异常，请检查盒子状态！'
    );
  }
}

@Catch(BankServiceException)
export class BankServiceExceptionFilter implements ExceptionFilter {
  catch(exception: BankServiceException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(200).json({
      code: exception.boxCode || BOX_CODE.BANK_FAILURE,
      bank: exception.BANK,
      bankCode: exception.bankCode || undefined,
      message: exception.normalizeMessage
    });
  }
}
