import { BadRequestException, Body, Controller, Get, Inject, Post, Req, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'crypto';
import { addMinutes, differenceInMilliseconds, format } from 'date-fns';
import { Request } from 'express';
import { find } from 'lodash';

import { INJECT_MODULE_OPTIONS, ModuleOptions, Public, SiteConfig } from '../auth.type';
import { LoginParams } from './controller.request';

@Controller('auth')
export class AuthController {
  private readonly OVERDUE_MINUTE = 120;

  constructor(
    @Inject(INJECT_MODULE_OPTIONS) private readonly options: ModuleOptions,
    private readonly jwtSrv: JwtService
  ) {}

  @Public()
  @Post('login')
  login(@Body() params: LoginParams) {
    const siteInfo = this.getSiteInfo(params.clientId);
    return this.generateAccessToken(params, siteInfo);
  }

  private getSiteInfo(clientId: string) {
    const siteInfo = find(this.options.sites ?? [], site => site.clientId === clientId);
    if (!siteInfo) {
      throw new BadRequestException('No existing application from clientId.');
    }
    return siteInfo;
  }

  private generateAccessToken(params: LoginParams, site: SiteConfig) {
    // 验证时间判断
    const bottomDate = addMinutes(new Date(), -this.OVERDUE_MINUTE);
    if (bottomDate >= params.timestamp) {
      throw new BadRequestException('Timestamp is overdue.');
    }

    if (
      !site.publicKey ||
      !verify(
        null,
        Buffer.from(`${site.clientId}${format(params.timestamp, 'T')}`),
        site.publicKey,
        Buffer.from(params.signature, 'hex')
      )
    ) {
      throw new UnauthorizedException();
    }

    return {
      accessToken: this.jwtSrv.sign(
        { clientId: site.clientId },
        { expiresIn: differenceInMilliseconds(params.timestamp, bottomDate) }
      )
    };
  }

  @Get('user')
  userInfo(@Req() req: Request) {
    return req.user;
  }
}
