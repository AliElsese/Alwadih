import { IsMongoId, IsOptional } from 'class-validator';

export class GetDaysQueryDto {
    @IsOptional()
    @IsMongoId({ message: 'Lesson ID must be a valid MongoDB ObjectId.' })
    lessonId?: string;
}
