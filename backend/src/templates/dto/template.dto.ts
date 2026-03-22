import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateTemplateDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsArray()
    blocks: any[];

    @IsOptional()
    @IsString()
    thumbnail?: string;
}
