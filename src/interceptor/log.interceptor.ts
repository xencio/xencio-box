import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor, Optional } from '@nestjs/common';
import { differenceInMilliseconds } from 'date-fns';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { DataSource, Repository } from 'typeorm';

import { AccessLog } from '../model/log.entity';

@Injectable()
export class DatabaseLogInterceptor implements NestInterceptor {
  private readonly logRepo: Repository<AccessLog>;

  constructor(@Optional() private readonly conn: DataSource) {
    if (this.conn) {
      this.logRepo = this.conn.getRepository(AccessLog);
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = new Date();
    return next.handle().pipe(
      tap(() => {
        this.saveLog(context, startTime);
      }),
      catchError((error: HttpException) => {
        this.saveLog(context, startTime, error);
        throw error;
      })
    );
  }

  private async saveLog(context: ExecutionContext, startTime: Date, error?: Error) {
    const req = context.switchToHttp().getRequest<Request>();
    const mixed = { ...req.params, ...req.query };
    const res = context.switchToHttp().getResponse<Response>();

    if (!this.logRepo) {
      return;
    }

    const logInst = this.logRepo.create({
      source: req.clientIp,
      parameter: mixed.name as string,
      url: decodeURI(req.url).replace(mixed.name as string, ''),
      status: res.statusCode,
      responseTime: startTime && differenceInMilliseconds(new Date(), startTime)
    });
    if (error) {
      if (error instanceof HttpException) {
        logInst.errorContent = error.getResponse() as { [key: string]: any };
        logInst.errorCode = error.getResponse()['error_code'];
      } else {
        logInst.errorContent = error;
        logInst.errorCode = '0';
      }
    }

    await this.logRepo.save(logInst);
  }
}
