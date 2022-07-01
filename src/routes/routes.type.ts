import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { transformTime } from 'src/app.type';

export const BANK_INSTANCE = 'bank_from_external';

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
