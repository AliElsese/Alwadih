import { IsDefined, IsEnum, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { StepLayoutType } from '../enums/step.enum.js';

export class UpdateStepDto {
    @IsOptional()
    @IsString({ message: 'Arabic description must be a valid string.' })
    @IsNotEmpty({ message: 'Arabic description cannot be empty.' })
    descriptionAr?: string;

    @IsOptional()
    @IsString({ message: 'English description must be a valid string.' })
    @IsNotEmpty({ message: 'English description cannot be empty.' })
    descriptionEn?: string;

    @IsOptional()
    @IsString({ message: 'Step type must be a valid string.' })
    @IsNotEmpty({ message: 'Step type cannot be empty.' })
    type?: string;

    @IsOptional()
    @IsEnum(StepLayoutType, {
        message: `Layout type must be one of: ${Object.values(StepLayoutType).join(', ')}.`,
    })
    layoutType?: StepLayoutType;

    @IsOptional()
    @IsDefined({ message: 'Data is required.' })
    @IsObject({ message: 'Data must be a valid object.' })
    data?: Record<string, unknown>;

    @IsOptional()
    @IsMongoId({ message: 'Phase ID must be a valid MongoDB ObjectId.' })
    phaseId?: string;
}
