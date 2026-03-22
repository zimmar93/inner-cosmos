import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsString,
    ValidateNested,
    ArrayMinSize,
    IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class OrderItemDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({ example: 2 })
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    quantity: number;
}

export class CreateOrderDto {
    @ApiProperty({ type: [OrderItemDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @ApiPropertyOptional({ enum: ['STRIPE', 'COD'], default: 'STRIPE' })
    @IsEnum(['STRIPE', 'COD'])
    @IsOptional()
    paymentMethod?: 'STRIPE' | 'COD';
}

export class UpdateOrderStatusDto {
    @ApiProperty({ enum: ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'] })
    @IsEnum(['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'])
    status: string;
}
