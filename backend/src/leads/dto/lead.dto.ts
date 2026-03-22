import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class CreateLeadDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    message?: string;

    @IsOptional()
    @IsString()
    source?: string;

    @IsOptional()
    @IsString()
    page?: string;
}
