import { IsNotEmpty } from 'class-validator';

export class UpsertContentDto {
    @IsNotEmpty()
    content: any;
}
