import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUnitDto {
    @IsOptional()
    @IsString({ message: 'Arabic hint must be a valid string.' })
    @IsNotEmpty({ message: 'Arabic hint cannot be empty.' })
    hintAr?: string;

    @IsOptional()
    @IsString({ message: 'English hint must be a valid string.' })
    @IsNotEmpty({ message: 'English hint cannot be empty.' })
    hintEn?: string;

    @IsOptional()
    @IsString({ message: 'Arabic label must be a valid string.' })
    @IsNotEmpty({ message: 'Arabic label cannot be empty.' })
    labelAr?: string;

    @IsOptional()
    @IsString({ message: 'English label must be a valid string.' })
    @IsNotEmpty({ message: 'English label cannot be empty.' })
    labelEn?: string;

    @IsOptional()
    @IsMongoId({ message: 'Part ID must be a valid MongoDB ObjectId.' })
    partId?: string;
}