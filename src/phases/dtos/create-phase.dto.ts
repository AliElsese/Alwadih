import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { PhaseType } from '../enums/phase.enum.js';

export class CreatePhaseDto {
    @IsEnum(PhaseType, {
        message: `Phase type must be one of: ${Object.values(PhaseType).join(', ')}.`,
    })
    @IsNotEmpty({ message: 'Phase type is required.' })
    type: PhaseType;

    @IsString({ message: 'Arabic description must be a valid string.' })
    @IsNotEmpty({ message: 'Arabic description is required.' })
    descriptionAr: string;

    @IsString({ message: 'English description must be a valid string.' })
    @IsNotEmpty({ message: 'English description is required.' })
    descriptionEn: string;

    @IsMongoId({ message: 'Day ID must be a valid MongoDB ObjectId.' })
    @IsNotEmpty({ message: 'Day ID is required.' })
    dayId: string;
}
