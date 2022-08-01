import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

// 无需认证的装饰器
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
// 环境变量设置密钥的信息
export const ENV_SECRET = 'AUTH_SECRET';
// token变量名
export const TOKEN_HEADER = 'x-xencio-box-token';

export interface SiteUser {
  clientId: string; // 编号
  canTransfer: boolean; // 是否允许转账
  traceId?: string;
}

export const User = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user = req.user;

  return data ? user?.[data] : user;
});
