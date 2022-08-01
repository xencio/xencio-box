import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'crypto';
import { addMinutes, differenceInSeconds, format } from 'date-fns';
import { DataSource, Repository } from 'typeorm';

import { SiteConfiguration } from '@model/client.entity';
import { BOX_CODE } from '@shared/constant';

import { Public, SiteUser, User } from '../auth.type';
import { LoginParams, TransferLoginParams } from './controller.request';

const enum OVERDUE_MINUTE { // 默认令牌过期时限
  QUERY = 30,
  TRANSFER = 5
}

@Controller('auth')
export class AuthController {
  private readonly siteRepo: Repository<SiteConfiguration>;

  constructor(private readonly jwtSrv: JwtService, conn: DataSource) {
    this.siteRepo = conn.getRepository(SiteConfiguration);
  }

  @Public()
  @Post('login')
  async login(@Body() params: LoginParams) {
    const siteInfo = await this.getSiteInfo(params.clientId);
    return this.generateAccessToken(params, siteInfo);
  }

  @Post('transfer')
  async transferLogin(@Body() params: TransferLoginParams, @User() user: SiteUser) {
    const siteInfo = await this.getSiteInfo(user.clientId);
    return this.generateAccessToken(params, siteInfo, { transfer: true });
  }

  private async getSiteInfo(clientId: string) {
    const siteInfo = await this.siteRepo.findOneBy({ clientId });
    if (!siteInfo) {
      throw new BadRequestException('No existing application from clientId.');
    }
    return siteInfo;
  }

  private generateAccessToken(params: TransferLoginParams, site: SiteConfiguration, opts?: { transfer?: boolean }) {
    // 验证时间判断
    const overdueMinute = opts?.transfer
      ? site.transferOverdue || OVERDUE_MINUTE.TRANSFER
      : site.publicOverdue || OVERDUE_MINUTE.QUERY;
    const bottomDate = addMinutes(new Date(), -overdueMinute);
    if (bottomDate >= params.timestamp) {
      throw new BadRequestException('Timestamp is overdue.');
    }

    const publicKey = opts?.transfer ? site.transferPublicKey : site.publicKey;
    if (
      !publicKey ||
      !verify(
        null,
        Buffer.from(`${site.clientId}${params.salt || ''}${format(params.timestamp, 'T')}`),
        publicKey,
        Buffer.from(params.signature, 'base64url')
      )
    ) {
      return BOX_CODE.PUBLIC_KEY_ERROR;
    }

    return {
      accessToken: this.jwtSrv.sign(
        { clientId: site.clientId, canTransfer: !!opts?.transfer },
        { expiresIn: differenceInSeconds(params.timestamp, bottomDate) }
      )
    };
  }

  @Get('user')
  userInfo(@User() user: SiteUser) {
    return user;
  }
}
