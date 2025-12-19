import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateWalletDto {
  @IsEmail()
  ownerEmail!: string;
}

export class RegisterUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}


