import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ENV_SECRET, TOKEN_HEADER } from './auth.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configSrv: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader(TOKEN_HEADER),
      ignoreExpiration: false,
      secretOrKey: configSrv.get<string>(ENV_SECRET)
    });
  }

  async validate(payload: Record<string, string | boolean>) {
    return { clientId: payload.clientId, canTransfer: !!payload.canTransfer };
  }
}
