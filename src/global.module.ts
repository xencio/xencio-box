import { HttpModule, HttpService } from '@nestjs/axios';
import { Global, Module, OnModuleInit, Optional } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import {
  errorLogger,
  requestLogger,
  responseLogger,
  setGlobalConfig as setAxiosLoggerGlobalConfig
} from 'axios-logger';
import { differenceInMilliseconds, parse } from 'date-fns';
import { DataSource, Repository } from 'typeorm';

import { VendorLog } from './model/log.entity';

setAxiosLoggerGlobalConfig({
  dateFormat: 'yyyy-mm-dd HH:MM:ss.l',
  status: true,
  statusText: true
});

const REQUEST_START_TIME = 'req-time';

@Global()
@Module({
  imports: [HttpModule.register({ timeout: 90000 })],
  providers: [],
  exports: [HttpModule]
})
export class GlobalModule implements OnModuleInit {
  private readonly logRepo: Repository<VendorLog>;

  constructor(private readonly http: HttpService, @Optional() private readonly conn: DataSource) {
    if (this.conn) {
      this.logRepo = this.conn.getRepository(VendorLog);
    }
  }

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
