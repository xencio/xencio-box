import { ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import * as ipaddr from 'ipaddr.js';
import { find } from 'lodash';
import { isIP, isIPv4, isIPv6 } from 'net';
import { getClientIp } from 'request-ip';
import { lastValueFrom, Observable } from 'rxjs';

import { ENV_SECRET, INJECT_MODULE_OPTIONS, IS_PUBLIC_KEY, ModuleOptions } from './auth.type';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly configSrv: ConfigService,
    @Inject(INJECT_MODULE_OPTIONS) private readonly options: ModuleOptions
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (isPublic) {
      return true;
    }

    // 对token进行检查
    if (this.configSrv.get<string>(ENV_SECRET)) {
      const authProcess = super.canActivate(context);
      try {
        if (
          typeof authProcess === 'boolean'
            ? authProcess
            : await (authProcess instanceof Observable ? lastValueFrom(authProcess) : authProcess)
        ) {
          return true;
        }
      } catch (err) {}
    }

    // 当IP属于白名单的情况下，仅支持查询操作
    const req: Request = context.switchToHttp().getRequest();
    let currentIp = getClientIp(req);
    // 排除IPv6情况下的补充地址
    if (currentIp.startsWith('::ffff:')) {
      currentIp = currentIp.slice(7);
    }
    const currentAddr = ipaddr.parse(currentIp);
    const site = find(this.options.sites ?? [], site => {
      for (const ip of site.whitelist || []) {
        let w = ip;
        // 转为submask格式
        if (isIP(ip)) {
          if (isIPv4(ip)) {
            w += '/32';
          } else if (isIPv6(ip)) {
            w += '/128';
          }
        }
        // 进行分析比较
        const [range, bits] = ipaddr.parseCIDR(w);
        if (currentAddr.kind() === range.kind() && currentAddr.match(range, bits)) {
          return true;
        }
      }
      return false;
    });
    if (site) {
      req.user = { clientId: site.clientId };
      return true;
    }

    throw new UnauthorizedException();
  }
}
