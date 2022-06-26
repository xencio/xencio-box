import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as joi from 'joi';
import * as path from 'path';

import config from './app.config';
import { InitModuleException } from './app.exception';
import { GlobalModule } from './global.module';
import { DatabaseLogInterceptor } from './interceptor/log.interceptor';
import { MorganMiddleware } from './middleware/morgan.middleware';
import { RoutesModule } from './routes/routes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: joi.object({
        NODE_ENV: joi.string().valid('development', 'production', 'test', 'provision').default('production'),
        PORT: joi.number().default(3000)
      }),
      load: [config],
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const ormPath = path.resolve(process.cwd(), 'ormconfig.json');
        if (!fs.existsSync(ormPath)) {
          throw new InitModuleException();
        }
        const typeOptions: { [key: string]: any } = JSON.parse(fs.readFileSync(ormPath, 'utf-8'));
        const srcPath = path.relative(process.cwd(), __dirname);
        const dbEntityFile = '*.entity{.ts,.js}';
        return { ...typeOptions, entities: [path.join(srcPath, 'model', '**', dbEntityFile)], autoLoadEntities: true };
      }
    }),
    GlobalModule,
    RoutesModule
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: DatabaseLogInterceptor }]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MorganMiddleware).forRoutes('*');
  }
}
