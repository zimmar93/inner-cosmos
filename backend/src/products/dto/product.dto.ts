import {
    IsString,
    IsNumber,
    IsBoolean,
    IsOptional,
    IsPositive,
    MinLength,
    IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @ApiProperty({ example: 'Premium Widget' })
    @IsString()
    @MinLength(2)
    name: string;

    @ApiPropertyOptional({ example: 'A high quality widget' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'SKU-001' })
    @IsString()
    sku: string;

    @ApiProperty({ example: 29.99 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @Type(() => Number)
    price: number;

    @ApiPropertyOptional({ example: 'https://storage.googleapis.com/...' })
    @IsUrl()
    @IsOptional()
    imageUrl?: string;

    @ApiPropertyOptional({ example: 100 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    initialStock?: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    categoryId?: string;

    @ApiPropertyOptional({ example: 15.00 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    purchasePrice?: number;

    @ApiPropertyOptional({ example: 20.00 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    wholesalePrice?: number;
}

export class UpdateProductDto {
    @ApiPropertyOptional()
    @IsString()
    @MinLength(2)
    @IsOptional()
    name?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    price?: number;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiPropertyOptional()
    @IsUrl()
    @IsOptional()
    imageUrl?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    categoryId?: string;

    @ApiPropertyOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    purchasePrice?: number;

    @ApiPropertyOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    wholesalePrice?: number;
}
