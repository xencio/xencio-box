import { HttpModule, HttpService } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { AxiosInstance } from 'axios';
import { errorLogger, requestLogger, responseLogger } from 'axios-logger';
import { differenceInMilliseconds, parse } from 'date-fns';
import { Repository } from 'typeorm';

import { TransferAuthGuard } from './bank-connection.guard';
import { BankConnectionLog, BankConnectionOption } from './bank-connection.model';
import { AccountController, TransferController } from './controller/bank-connection.controller';

const REQUEST_START_TIME = 'x-xencio-req-time';

@Module({
  imports: [
    HttpModule.register({ timeout: 90000 }),
    TypeOrmModule.forFeature([BankConnectionOption, BankConnectionLog])
  ],
  controllers: [AccountController, TransferController],
  providers: [TransferAuthGuard]
})
export class BankConnectionModule {
  constructor(
    private readonly http: HttpService,
    @InjectRepository(BankConnectionLog) private readonly logRepo: Repository<BankConnectionLog>
  ) {}

  onModuleInit() {
    this.AxiosLoggerInstance(this.http.axiosRef);
  }

  private AxiosLoggerInstance(instance: AxiosInstance) {
    instance.interceptors.request.use(config => {
      config.headers[REQUEST_START_TIME] = new Date().getTime();
      return requestLogger(config, { url: true, data: false });
    }, errorLogger);
    instance.interceptors.response.use(response => {
      if (!response.statusText) {
        response.statusText = 'OK';
      }
      if (this.logRepo) {
        this.logRepo.save({
          parameter: JSON.stringify(response.config.params ?? response.config.data),
          url: response.config.url,
          status: response.status,
          responseTime: differenceInMilliseconds(
            new Date(),
            parse(response.config.headers[REQUEST_START_TIME].toString(), 'T', new Date())
          ),
          content: JSON.stringify(response.data)
        });
      }
      return responseLogger(response, { data: false });
    }, errorLogger);

    return instance;
  }
}
