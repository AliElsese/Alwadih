import { IsInt, IsMongoId, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateDayDto {
    @IsString({ message: 'Arabic day name must be a valid string.' })
    @IsNotEmpty({ message: 'Arabic day name is required.' })
    nameAr: string;

    @IsString({ message: 'English day name must be a valid string.' })
    @IsNotEmpty({ message: 'English day name is required.' })
    nameEn: string;

    @IsString({ message: 'Arabic header text must be a valid string.' })
    @IsNotEmpty({ message: 'Arabic header text is required.' })
    headerTextAr: string;

    @IsString({ message: 'English header text must be a valid string.' })
    @IsNotEmpty({ message: 'English header text is required.' })
    headerTextEn: string;

    @IsString({ message: 'Purpose must be a valid string.' })
    @IsNotEmpty({ message: 'Purpose is required.' })
    purpose: string;

    @IsInt({ message: 'Expected time in minutes must be an integer.' })
    @Min(1, { message: 'Expected time in minutes must be at least 1.' })
    expectedTime: number;

    @IsMongoId({ message: 'Lesson ID must be a valid MongoDB ObjectId.' })
    @IsNotEmpty({ message: 'Lesson ID is required.' })
    lessonId: string;
}
