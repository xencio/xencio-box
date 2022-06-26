import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { format, isSameDay } from 'date-fns';
import { XMLParser } from 'fast-xml-parser';
import { lastValueFrom, map } from 'rxjs';

import { BankStatementParams } from '../routes.type';
import config from './boc.config';

@Injectable()
export class BOCService {
  static CODE = 'BOC';

  private readonly OPRPWD = Buffer.from(config.oprpwd, 'base64');

  constructor(private readonly http: HttpService) {}

  async bankStatement(params: BankStatementParams) {
    return await lastValueFrom(
      this.sendRequest(
        'b2e0035',
        `
        <trn-b2e0035-rq>
          <b2e0035-rq>
            <ibknum></ibknum>
            <actacn>${params.accountCode}</actacn>
            <type>${this.getQueryType(params.startDate, params.endDate)}</type>
            <datescope>
              <from>${format(params.startDate, 'yyyyMMdd')}</from>
              <to>${format(params.endDate, 'yyyyMMdd')}</to>
            </datescope>
            <amountscope>
              <from></from>
              <to></to>
            </amountscope>
            <begnum>${params.pageNumber}</begnum>
            <recnum>50</recnum>
            <direction>0</direction>
          </b2e0035-rq>
        </trn-b2e0035-rq>
        `,
        await this.fetchToken()
      ).pipe(
        map(xmlData => {
          const xmlParse = new XMLParser({
            ignoreAttributes: false,
            parseAttributeValue: true,
            trimValues: true,
            isArray: tagName => ['b2e0035-rs'].includes(tagName)
          });
          const parseJson = xmlParse.parse(xmlData);
          const respData = parseJson.bocb2e.trans['trn-b2e0035-rs'];
          return (respData && respData['b2e0035-rs']) ?? [];
        })
      )
    );
  }

  private getQueryType(startDate: Date, endDate: Date) {
    return isSameDay(startDate, endDate) && isSameDay(startDate, new Date()) ? '2001' : '2002';
  }

  private fetchToken() {
    const currentDate = new Date();
    return lastValueFrom(
      this.sendRequest(
        'b2e0001',
        `<trn-b2e0001-rq>
         <b2e0001-rq>
           <custdt>${format(currentDate, 'yyyyMMddHHmmssl')}</custdt>
           <oprpwd>${this.OPRPWD}</oprpwd>
         </b2e0001-rq>
       </trn-b2e0001-rq>`,
        undefined,
        currentDate
      ).pipe(
        map(xmlData => {
          const tokenBegin = xmlData.indexOf('<token>');
          const tokenEnd = xmlData.indexOf('</token>');
          if (tokenBegin >= 0 && tokenEnd > tokenBegin) {
            return xmlData.substring(tokenBegin + 7, tokenEnd);
          }
          throw new UnauthorizedException('boc token is blank');
        })
      )
    );
  }

  private sendRequest(trxCode: string, xmlStr: string, token?: string, currentDate = new Date()) {
    return this.http
      .post<string>(
        config.url,
        `
        <?xml version="1.0" encoding="UTF-8"?>
        <bocb2e version="120" locale="zh_CN">
          <head>
            <termid>${config.termid}</termid>
            <trnid>${format(currentDate, 'yyyyMMddHHmmssl')}</trnid>
            <custid>${config.custid}</custid>
            <cusopr>${config.cusopr}</cusopr>
            <trncod>${trxCode}</trncod>
            <token>${token || ''}</token>
          </head>
          <trans>${xmlStr}</trans>
        </bocb2e>
        `
      )
      .pipe(map(resp => resp.data));
  }
}
