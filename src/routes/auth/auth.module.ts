import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthGuard } from './auth.guard';
import { JwtStrategy } from './auth.strategy';
import { ENV_SECRET } from './auth.type';
import { AuthController } from './controller/auth.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configSrv: ConfigService) => {
        const secret = configSrv.get<string>(ENV_SECRET);
        return secret ? { secret } : {};
      },
      inject: [ConfigService]
    }),
    TypeOrmModule.forFeature()
  ],
  controllers: [AuthController],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }, JwtAuthGuard, JwtStrategy]
})
export class AuthModule {}
