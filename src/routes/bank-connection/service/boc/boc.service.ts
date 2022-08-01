import { HttpService } from '@nestjs/axios';
import { UnauthorizedException } from '@nestjs/common';
import { format, isSameDay } from 'date-fns';
import { XMLParser } from 'fast-xml-parser';
import { map, mergeMap } from 'rxjs';

import { BankConnectionOption } from '../../bank-connection.model';
import { BankStatementParams } from '../../controller/controller.request';
import { ConnectionEntity } from '../base.service';
import { BOCConfiguration } from './boc.type';

export class BOCService extends ConnectionEntity {
  static BANK = 'BOC';

  protected options: BOCConfiguration;

  private readonly OPRPWD: Buffer;

  constructor(
    protected readonly http: HttpService,
    protected readonly traceId: string,
    protected readonly opt: BankConnectionOption
  ) {
    super(http, traceId, opt);
    this.OPRPWD = Buffer.from(this.options.oprpwd, 'base64');
  }

  bankStatement(params: BankStatementParams) {
    return this.fetchToken().pipe(
      mergeMap(token =>
        this.sendRequest(
          'b2e0035',
          `
        <trn-b2e0035-rq>
          <b2e0035-rq>
            <ibknum></ibknum>
            <actacn>${params.accountNo}</actacn>
            <type>${this.getQueryType(params.startDate, params.endDate)}</type>
            <datescope>
              <from>${format(params.startDate, 'yyyyMMdd')}</from>
              <to>${format(params.endDate, 'yyyyMMdd')}</to>
            </datescope>
            <amountscope>
              <from></from>
              <to></to>
            </amountscope>
            <begnum>${params.pageNow}</begnum>
            <recnum>50</recnum>
            <direction>0</direction>
          </b2e0035-rq>
        </trn-b2e0035-rq>
        `,
          token
        )
      ),
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
    );
  }

  private getQueryType(startDate: Date, endDate: Date) {
    return isSameDay(startDate, endDate) && isSameDay(startDate, new Date()) ? '2001' : '2002';
  }

  private fetchToken() {
    return this.sendRequest(
      'b2e0001',
      `<trn-b2e0001-rq>
         <b2e0001-rq>
           <custdt>${format(new Date(), 'yyyyMMddHHmmssSSS')}</custdt>
           <oprpwd>${this.OPRPWD}</oprpwd>
         </b2e0001-rq>
       </trn-b2e0001-rq>`
    ).pipe(
      map(xmlData => {
        const tokenBegin = xmlData.indexOf('<token>');
        const tokenEnd = xmlData.indexOf('</token>');
        if (tokenBegin >= 0 && tokenEnd > tokenBegin) {
          return xmlData.substring(tokenBegin + 7, tokenEnd);
        }
        throw new UnauthorizedException('boc token is blank');
      })
    );
  }

  private sendRequest(trxCode: string, xmlStr: string, token?: string) {
    return this.http
      .post<string>(
        this.options.url,
        `
        <?xml version="1.0" encoding="UTF-8"?>
        <bocb2e version="120" locale="zh_CN">
          <head>
            <termid>${this.options.termid}</termid>
            <trnid>${format(new Date(), 'yyyyMMddHHmmssSSS')}</trnid>
            <custid>${this.options.custid}</custid>
            <cusopr>${this.options.cusopr}</cusopr>
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
