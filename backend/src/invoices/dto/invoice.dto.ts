import {
    IsString, IsNumber, IsOptional, IsEnum, IsDateString,
    IsArray, ValidateNested, Min, MinLength, IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
    @ApiProperty({ example: 'Web design services' })
    @IsString()
    @MinLength(1)
    description: string;

    @ApiProperty({ example: 2 })
    @IsInt()
    @Min(1)
    @Type(() => Number)
    quantity: number;

    @ApiProperty({ example: 150.00 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Type(() => Number)
    unitPrice: number;

    @ApiPropertyOptional({ example: 15 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    taxRate?: number;
}

export class CreateInvoiceDto {
    // Sender
    @ApiProperty({ example: 'Inner Cosmos' })
    @IsString()
    senderName: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    senderAddress?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    senderPhone?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    senderEmail?: string;

    // Client
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    clientName: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    clientCompany?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    clientAddress?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    clientEmail?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    clientPhone?: string;

    // Dates
    @ApiPropertyOptional()
    @IsDateString()
    @IsOptional()
    issueDate?: string;

    @ApiProperty()
    @IsDateString()
    dueDate: string;

    // Financial
    @ApiPropertyOptional({ enum: ['FIXED', 'PERCENT'] })
    @IsEnum({ FIXED: 'FIXED', PERCENT: 'PERCENT' })
    @IsOptional()
    discountType?: 'FIXED' | 'PERCENT';

    @ApiPropertyOptional({ example: 10 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    discountValue?: number;

    @ApiPropertyOptional({ example: 15 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    taxRate?: number;

    @ApiPropertyOptional({ example: 5.99 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    shippingCost?: number;

    // Payment
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    paymentTerms?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    paymentMethods?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    bankDetails?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    lateFeePolicy?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    notes?: string;

    // Items
    @ApiProperty({ type: [InvoiceItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InvoiceItemDto)
    items: InvoiceItemDto[];
}

export class UpdateInvoiceDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    senderName?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    senderAddress?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    senderPhone?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    senderEmail?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    clientName?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    clientCompany?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    clientAddress?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    clientEmail?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    clientPhone?: string;

    @ApiPropertyOptional()
    @IsDateString()
    @IsOptional()
    issueDate?: string;

    @ApiPropertyOptional()
    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @ApiPropertyOptional({ enum: ['FIXED', 'PERCENT'] })
    @IsEnum({ FIXED: 'FIXED', PERCENT: 'PERCENT' })
    @IsOptional()
    discountType?: 'FIXED' | 'PERCENT';

    @ApiPropertyOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    discountValue?: number;

    @ApiPropertyOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    taxRate?: number;

    @ApiPropertyOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    shippingCost?: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    paymentTerms?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    paymentMethods?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    bankDetails?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    lateFeePolicy?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiPropertyOptional({ type: [InvoiceItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @IsOptional()
    @Type(() => InvoiceItemDto)
    items?: InvoiceItemDto[];

    @ApiPropertyOptional({ enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'] })
    @IsEnum({ DRAFT: 'DRAFT', SENT: 'SENT', PAID: 'PAID', OVERDUE: 'OVERDUE', CANCELLED: 'CANCELLED' })
    @IsOptional()
    status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
}
