import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

import { transformTime } from '@shared/util';

export class TransferLoginParams {
  @IsNotEmpty()
  @IsString()
  signature: string;

  @IsNotEmpty()
  @Transform(params => params && transformTime(params.value, params.type))
  @IsDate()
  timestamp: Date;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(16)
  salt: string;
}

export class LoginParams extends TransferLoginParams {
  @IsNotEmpty()
  @IsString()
  clientId: string;
}
