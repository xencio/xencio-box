import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { BOX_CODE, BOX_MESSAGE } from '@shared/constant';
import { map } from 'rxjs';

@Injectable()
export class DataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map(value => {
        if (value === BOX_CODE.SUCCESS || BOX_MESSAGE.has(value)) {
          return { code: value, message: BOX_MESSAGE.get(value) };
        }
        if (value?.code && (value.code === BOX_CODE.SUCCESS || BOX_MESSAGE.has(value.code))) {
          return value;
        }
        return { code: BOX_CODE.SUCCESS, data: value };
      })
    );
  }
}
