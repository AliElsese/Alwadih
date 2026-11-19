import { IsDefined, IsEnum, IsMongoId, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { StepLayoutType } from '../enums/step.enum.js';

export class CreateStepDto {
    @IsString({ message: 'Arabic description must be a valid string.' })
    @IsNotEmpty({ message: 'Arabic description is required.' })
    descriptionAr: string;

    @IsString({ message: 'English description must be a valid string.' })
    @IsNotEmpty({ message: 'English description is required.' })
    descriptionEn: string;

    @IsString({ message: 'Step type must be a valid string.' })
    @IsNotEmpty({ message: 'Step type is required.' })
    type: string;

    @IsEnum(StepLayoutType, {
        message: `Layout type must be one of: ${Object.values(StepLayoutType).join(', ')}.`,
    })
    @IsNotEmpty({ message: 'Layout type is required.' })
    layoutType: StepLayoutType;

    @IsDefined({ message: 'Data is required.' })
    @IsObject({ message: 'Data must be a valid object.' })
    data: Record<string, unknown>;

    @IsMongoId({ message: 'Phase ID must be a valid MongoDB ObjectId.' })
    @IsNotEmpty({ message: 'Phase ID is required.' })
    phaseId: string;
}
