import { IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Electronics' })
    @IsString()
    @MinLength(2)
    name: string;

    @ApiPropertyOptional({ example: 'All kinds of electronic devices' })
    @IsString()
    @IsOptional()
    description?: string;
}
