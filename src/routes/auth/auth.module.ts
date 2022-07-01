import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtAuthGuard } from './auth.guard';
import { JwtStrategy } from './auth.strategy';
import { ENV_SECRET, INJECT_MODULE_OPTIONS, ModuleAsyncOptions, ModuleOptions, OptionsFactory } from './auth.type';
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
    })
  ],
  controllers: [AuthController],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }, JwtAuthGuard, JwtStrategy]
})
export class AuthModule {
  static register(options: ModuleOptions): DynamicModule {
    return { providers: [{ provide: INJECT_MODULE_OPTIONS, useValue: options }], module: AuthModule };
  }

  static registerAsync(options: ModuleAsyncOptions): DynamicModule {
    return { imports: options.imports ?? [], providers: this.createAsyncProviders(options), module: AuthModule };
  }

  private static createAsyncProviders(options: ModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [this.createAsyncOptionsProvider(options), { provide: options.useClass, useClass: options.useClass }];
  }

  private static createAsyncOptionsProvider(options: ModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return { provide: INJECT_MODULE_OPTIONS, useFactory: options.useFactory, inject: options.inject || [] };
    }
    return {
      provide: INJECT_MODULE_OPTIONS,
      useFactory: async (optionsFactory: OptionsFactory) => await optionsFactory.createOptions(),
      inject: [options.useExisting || options.useClass]
    };
  }
}
