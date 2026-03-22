import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsObject, IsArray } from 'class-validator';

export class CreatePageDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    slug: string;

    @IsOptional()
    @IsArray()
    blocks?: any[];

    @IsOptional()
    @IsObject()
    seo?: any;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsBoolean()
    isHomepage?: boolean;

    @IsOptional()
    sortOrder?: number;
}

export class UpdatePageDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    slug?: string;

    @IsOptional()
    @IsArray()
    blocks?: any[];

    @IsOptional()
    @IsObject()
    seo?: any;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsBoolean()
    isHomepage?: boolean;

    @IsOptional()
    sortOrder?: number;
}
