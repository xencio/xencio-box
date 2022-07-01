import { ModuleMetadata, SetMetadata, Type } from '@nestjs/common';

// 无需认证的装饰器
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
// 注入模块的配置信息
export const INJECT_MODULE_OPTIONS = 'AUTH_MODULE_OPTIONS';
// 环境变量设置密钥的信息
export const ENV_SECRET = 'AUTH_SECRET';

export interface SiteUser {
  clientId: string; // 编号
}

export interface SiteConfig {
  clientId: string; // 编号
  name: string; // 名称
  publicKey: string; // 公钥
  whitelist?: string[]; // 白名单
}

export interface ModuleOptions {
  sites?: SiteConfig[];
}

export interface ModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<OptionsFactory>;
  useClass?: Type<OptionsFactory>;
  useFactory?: (...args: any[]) => Promise<ModuleOptions> | ModuleOptions;
  inject?: any[];
}

export interface OptionsFactory {
  createOptions(): Promise<ModuleOptions> | ModuleOptions;
}
