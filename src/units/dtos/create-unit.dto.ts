import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateUnitDto {
    @IsString({ message: 'Arabic hint must be a valid string.' })
    @IsNotEmpty({ message: 'Arabic hint is required.' })
    hintAr: string;

    @IsString({ message: 'English hint must be a valid string.' })
    @IsNotEmpty({ message: 'English hint is required.' })
    hintEn: string;

    @IsString({ message: 'Arabic label must be a valid string.' })
    @IsNotEmpty({ message: 'Arabic label is required.' })
    labelAr: string;

    @IsString({ message: 'English label must be a valid string.' })
    @IsNotEmpty({ message: 'English label is required.' })
    labelEn: string;

    @IsMongoId({ message: 'Part ID must be a valid MongoDB ObjectId.' })
    @IsNotEmpty({ message: 'Part ID is required.' })
    partId: string;
}