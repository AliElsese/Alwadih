import { IsInt, IsMongoId, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateLessonDto {
    @IsString({ message: 'Arabic lesson name must be a valid string.' })
    @IsNotEmpty({ message: 'Arabic lesson name is required.' })
    nameAr: string;

    @IsString({ message: 'English lesson name must be a valid string.' })
    @IsNotEmpty({ message: 'English lesson name is required.' })
    nameEn: string;

    @IsInt({ message: 'Days must be an integer.' })
    @Min(1, { message: 'Days must be at least 1.' })
    days: number;

    @IsMongoId({ message: 'Unit ID must be a valid MongoDB ObjectId.' })
    @IsNotEmpty({ message: 'Unit ID is required.' })
    unitId: string;
}