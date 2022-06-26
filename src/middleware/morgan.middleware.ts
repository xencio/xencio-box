import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as morgan from 'morgan';

@Injectable()
export class MorganMiddleware implements NestMiddleware {
  static configure(format: string | morgan.FormatFn, opts?: morgan.Options<Request, Response>) {
    this.format = format;
    this.options = opts;
  }

  static token(name: string, callback: morgan.TokenCallbackFn) {
    return morgan.token(name, callback);
  }

  private static options: morgan.Options<Request, Response>;
  private static format: string | morgan.FormatFn = (tokens, req: Request, res: Response) =>
    [
      req.clientIp || req.headers['x-real-ip'] || req.socket.remoteAddress,
      '-',
      `[${tokens.date(req, res, 'clf')}]`,
      `"${tokens.method(req, res)}`,
      decodeURI(tokens.url(req, res)),
      `HTTP/${tokens['http-version'](req, res)}`,
      `Length/${tokens.res(req, res, 'content-length')}"`,
      `"${tokens['user-agent'](req, res)}"`,
      '-',
      tokens.status(req, res),
      `${tokens['response-time'](req, res)}ms`
    ].join(' ');

  use(req: Request, res: Response, next: NextFunction) {
    if (MorganMiddleware.format) {
      morgan(MorganMiddleware.format as any, MorganMiddleware.options)(req, res, next);
    } else {
      throw new Error('MorganMiddleware must be configured with a logger format.');
    }
  }
}
