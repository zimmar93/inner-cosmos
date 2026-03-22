import { IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AdjustStockDto {
    @ApiProperty({ example: 50, description: 'Quantity to add to stock (can be negative to reduce)' })
    @IsNumber()
    @Type(() => Number)
    quantity: number;
}

export class SetStockDto {
    @ApiProperty({ example: 100 })
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    quantityAvailable: number;
}
