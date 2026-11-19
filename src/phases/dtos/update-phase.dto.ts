import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PhaseType } from '../enums/phase.enum.js';

export class UpdatePhaseDto {
    @IsOptional()
    @IsEnum(PhaseType, {
        message: `Phase type must be one of: ${Object.values(PhaseType).join(', ')}.`,
    })
    type?: PhaseType;

    @IsOptional()
    @IsString({ message: 'Arabic description must be a valid string.' })
    @IsNotEmpty({ message: 'Arabic description cannot be empty.' })
    descriptionAr?: string;

    @IsOptional()
    @IsString({ message: 'English description must be a valid string.' })
    @IsNotEmpty({ message: 'English description cannot be empty.' })
    descriptionEn?: string;

    @IsOptional()
    @IsMongoId({ message: 'Day ID must be a valid MongoDB ObjectId.' })
    dayId?: string;
}
