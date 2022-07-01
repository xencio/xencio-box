import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { transformTime } from 'src/app.type';

export class LoginParams {
  @IsNotEmpty()
  @IsString()
  clientId: string;

  @IsNotEmpty()
  @IsString()
  signature: string;

  @IsNotEmpty()
  @Transform(params => params && transformTime(params.value, params.type))
  @IsDate()
  timestamp: Date;
}
