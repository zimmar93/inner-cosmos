import { IsEmail, IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UpdateUserDto {
    @ApiPropertyOptional()
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional()
    @IsString()
    @MinLength(8)
    @IsOptional()
    password?: string;

    @ApiPropertyOptional({ enum: Role })
    @IsEnum(Role)
    @IsOptional()
    role?: Role;
}

export class UpdateCustomerDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    address?: string;
}
