import { IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class UpdateDayDto {
    @IsOptional()
    @IsString({ message: 'Arabic day name must be a valid string.' })
    @IsNotEmpty({ message: 'Arabic day name cannot be empty.' })
    nameAr?: string;

    @IsOptional()
    @IsString({ message: 'English day name must be a valid string.' })
    @IsNotEmpty({ message: 'English day name cannot be empty.' })
    nameEn?: string;

    @IsOptional()
    @IsString({ message: 'Arabic header text must be a valid string.' })
    @IsNotEmpty({ message: 'Arabic header text cannot be empty.' })
    headerTextAr?: string;

    @IsOptional()
    @IsString({ message: 'English header text must be a valid string.' })
    @IsNotEmpty({ message: 'English header text cannot be empty.' })
    headerTextEn?: string;

    @IsOptional()
    @IsString({ message: 'Purpose must be a valid string.' })
    @IsNotEmpty({ message: 'Purpose cannot be empty.' })
    purpose?: string;

    @IsOptional()
    @IsInt({ message: 'Expected time in minutes must be an integer.' })
    @Min(1, { message: 'Expected time in minutes must be at least 1.' })
    expectedTime?: number;

    @IsOptional()
    @IsMongoId({ message: 'Lesson ID must be a valid MongoDB ObjectId.' })
    lessonId?: string;
}
