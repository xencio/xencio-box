import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { setGlobalConfig as setAxiosLoggerGlobalConfig } from 'axios-logger';
import * as fs from 'fs';
import * as joi from 'joi';
import * as path from 'path';

import { AuthModule } from '@auth/auth.module';

import { DataInterceptor } from './interceptor/data.interceptor';
import { LogInterceptor } from './interceptor/log.interceptor';
import { MorganMiddleware } from './middleware/morgan.middleware';
import { BankConnectionModule } from './routes/bank-connection/bank-connection.module';

setAxiosLoggerGlobalConfig({
  dateFormat: 'yyyy-mm-dd HH:MM:ss.l',
  status: true,
  statusText: true
});

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: joi.object({
        NODE_ENV: joi.string().valid('development', 'production', 'test', 'provision').default('production'),
        PORT: joi.number().default(3000)
      }),
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const ormPath = path.resolve(process.cwd(), 'ormconfig.json');
        if (!fs.existsSync(ormPath)) {
          throw new Error('初始化模块失败，请检查模块代码');
        }
        const typeOptions: { [key: string]: any } = JSON.parse(fs.readFileSync(ormPath, 'utf-8'));
        const srcPath = path.relative(process.cwd(), __dirname);
        const dbEntityFile = '*.entity{.ts,.js}';
        return { ...typeOptions, entities: [path.join(srcPath, 'model', '**', dbEntityFile)], autoLoadEntities: true };
      }
    }),
    AuthModule,
    BankConnectionModule
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LogInterceptor },
    { provide: APP_INTERCEPTOR, useClass: DataInterceptor }
  ]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MorganMiddleware).forRoutes('*');
  }
}
