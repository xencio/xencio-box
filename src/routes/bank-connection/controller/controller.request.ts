import { transformTime } from '@shared/util';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsByteLength,
  IsDate,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';
import yn from 'yn';

export const DEFAULT_PAGE_SIZE = 20;

// 查询参数
export class BankStatementParams {
  @IsNotEmpty()
  @IsString()
  bank: string; // 银行

  @IsNotEmpty()
  @IsString()
  accountNo: string; // 账号

  @IsNotEmpty()
  @Transform(params => params && transformTime(params.value, params.type))
  @IsDate()
  startDate: Date; // 开始日期

  @IsNotEmpty()
  @Transform(params => params && transformTime(params.value, params.type))
  @IsDate()
  endDate: Date; // 结束日期

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageNow: number = 1; // 页码

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize: number = DEFAULT_PAGE_SIZE; // 每页记录数

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsIn(['json', 'xml'])
  dataFormat: 'json' | 'xml';
}

export enum TRANSFER_CHANNEL {
  HVBE = '2', // 大小额度支付
  SUPER_BANK = '3', // 超级银行
  FINANCE = 'SPICF' // 财务公司用款指令
}

// 转账参数
export class TransferParams {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  uniqueId: string; // 交易唯一流水号

  @IsOptional()
  @IsNotEmpty()
  @Transform(params => params && transformTime(params.value, params.type))
  @IsDate()
  trxDate: Date; // 交易日期

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  amount: number; // 交易金额

  @IsNotEmpty()
  @IsString()
  fromAccountNo: string; // 付款账号

  @IsNotEmpty()
  @IsString()
  fromAccountName: string; // 付款人

  @IsNotEmpty()
  @IsString()
  fromBank: string; // 付款银行

  @IsNotEmpty()
  @IsString()
  toAccountNo: string; // 收款账号

  @IsNotEmpty()
  @IsString()
  toAccountName: string; // 收款人

  @IsNotEmpty()
  @IsString()
  toBank: string; // 收款银行

  @IsOptional()
  @IsString()
  toBankNo: string; // 收款银行联行号

  @IsNotEmpty()
  @IsString()
  @IsByteLength(0, 60)
  remark: string; // 附言

  @IsOptional()
  @IsString()
  usage: string; // 用途

  @IsOptional()
  @Transform(params => !params || yn(params.value, { default: true }))
  @IsBoolean()
  IsReview: boolean = true; // 是否需要网银复核

  @IsOptional()
  @Transform(params => params && yn(params.value))
  @IsBoolean()
  IsInterBank: boolean; // 是否跨行转账

  @IsOptional()
  @Transform(params => params && yn(params.value))
  @IsBoolean()
  IsRemote: boolean; // 是否异地转账

  @IsOptional()
  @Transform(params => !params || yn(params.value, { default: true }))
  @IsBoolean()
  IsCorporate: boolean = true; // 是否对公转账

  @IsOptional()
  @IsEnum(TRANSFER_CHANNEL)
  channel: TRANSFER_CHANNEL; // 渠道
}

// 转账状态参数
export class TransferStatusParams {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  uniqueId: string; // 交易唯一流水号

  @IsNotEmpty()
  @Transform(params => params && transformTime(params.value, params.type))
  @IsDate()
  trxDate: Date; // 交易日期

  @IsNotEmpty()
  @IsString()
  bank: string; // 银行

  @IsNotEmpty()
  @IsString()
  accountNo: string; // 付款账号

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  acceptNo: string; // 受理编号

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  packageNo: string; // 银行云平台生成的指令编号
}
