import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

import { SiteUser } from '@auth/auth.type';

@Injectable()
export class TransferAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const { user }: { user: SiteUser } = context.switchToHttp().getRequest();
    return user.canTransfer;
  }
}
