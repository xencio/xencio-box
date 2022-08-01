import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { getClientIp } from 'request-ip';
import { lastValueFrom, Observable } from 'rxjs';
import { DataSource, Like, Repository } from 'typeorm';

import { SiteConfiguration } from '@model/client.entity';

import { ENV_SECRET, IS_PUBLIC_KEY, TOKEN_HEADER } from './auth.type';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly LOCALHOST_LIST: string[] = ['127.0.0.1', '::1', '0:0:0:0:0:0:0:1'];
  private readonly siteRepo: Repository<SiteConfiguration>;

  constructor(private readonly reflector: Reflector, private readonly configSrv: ConfigService, conn: DataSource) {
    super();
    this.siteRepo = conn.getRepository(SiteConfiguration);
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (isPublic) {
      return true;
    }

    const req: Request = context.switchToHttp().getRequest();
    // 1. 动态token检查
    if (this.configSrv.get<string>(ENV_SECRET)) {
      const authProcess = super.canActivate(context);
      try {
        if (
          typeof authProcess === 'boolean'
            ? authProcess
            : await (authProcess instanceof Observable ? lastValueFrom(authProcess) : authProcess)
        ) {
          req.user = { ...req.user, traceId: randomUUID() };
          return true;
        }
      } catch (err) {}
    }
    // 2. 静态token检查
    const token = req.header(TOKEN_HEADER); // 请求头部token
    let site: SiteConfiguration;
    if (token) {
      site = await this.siteRepo.findOneBy({ staticToken: token });
    }
    // 3.白名单IP检查。localhost访问时采用sites中第一个
    if (!site) {
      let currentIp = getClientIp(req); // 访问IP
      if (currentIp.startsWith('::ffff:')) {
        currentIp = currentIp.slice(7); // 排除IPv6情况下的补充地址
      }
      site = await this.siteRepo.findOneBy(
        this.LOCALHOST_LIST.includes(currentIp) ? {} : { whitelist: Like(`%"${currentIp}"%`) }
      );
    }

    if (site) {
      // 仅支持查询操作
      req.user = { clientId: site.clientId, canTransfer: false, traceId: randomUUID() };
      return true;
    }

    throw new UnauthorizedException();
  }
}
