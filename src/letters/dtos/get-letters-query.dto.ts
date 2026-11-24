import { IsEnum, IsOptional } from 'class-validator';
import { LetterType } from '../enums/letter.enum.js';

export class GetLettersQueryDto {
    @IsOptional()
    @IsEnum(LetterType, {
        message: `type must be one of: ${Object.values(LetterType).join(', ')}.`,
    })
    type?: LetterType;
}
