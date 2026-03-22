import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'SecurePass123!' })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiPropertyOptional({ enum: Role, default: Role.CUSTOMER })
    @IsEnum(Role)
    @IsOptional()
    role?: Role;

    @ApiPropertyOptional({ example: '+1 555 000 0000' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({ example: '123 Main St, City, Country' })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiPropertyOptional({ example: 'John Doe' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ example: 'Acme Corp' })
    @IsString()
    @IsOptional()
    company?: string;
}

export class LoginDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'SecurePass123!' })
    @IsString()
    password: string;
}
