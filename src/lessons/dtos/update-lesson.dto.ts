import { IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class UpdateLessonDto {
    @IsOptional()
    @IsString({ message: 'Arabic lesson name must be a valid string.' })
    @IsNotEmpty({ message: 'Arabic lesson name cannot be empty.' })
    nameAr?: string;

    @IsOptional()
    @IsString({ message: 'English lesson name must be a valid string.' })
    @IsNotEmpty({ message: 'English lesson name cannot be empty.' })
    nameEn?: string;

    @IsOptional()
    @IsInt({ message: 'Days must be an integer.' })
    @Min(1, { message: 'Days must be at least 1.' })
    days?: number;

    @IsOptional()
    @IsMongoId({ message: 'Unit ID must be a valid MongoDB ObjectId.' })
    unitId?: string;
}