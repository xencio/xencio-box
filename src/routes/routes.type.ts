import { Transform, TransformationType } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { format, parse } from 'date-fns';

export const BANK_INSTANCE = 'bank_from_external';

const TIME_FORMATTER = 'yyyy-MM-dd HH:mm:ss';

function transformTime(value, transType: TransformationType) {
  try {
    if (transType === TransformationType.PLAIN_TO_CLASS) {
      return value instanceof Date
        ? value
        : typeof value === 'number'
        ? parse(value.toString(), value < Math.pow(10, 8) ? 'yyyyMMdd' : 'T', new Date())
        : value;
    } else if (transType === TransformationType.CLASS_TO_PLAIN) {
      return format(value, TIME_FORMATTER);
    }
    return value;
  } catch (error) {
    return value;
  }
}

export class BankStatementParams {
  @IsNotEmpty()
  @IsString()
  accountCode: string;

  @IsNotEmpty()
  @Transform(params => params && transformTime(params.value, params.type))
  @IsDate()
  startDate: Date;

  @IsNotEmpty()
  @Transform(params => params && transformTime(params.value, params.type))
  @IsDate()
  endDate: Date;

  @IsOptional()
  @IsNumber()
  pageNumber: number = 1;

  @IsOptional()
  @IsNumber()
  pageSize: number;
}
