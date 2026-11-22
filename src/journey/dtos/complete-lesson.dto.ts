import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CompleteLessonDto {
    @IsNotEmpty()
    @IsMongoId()
    lessonId: string;
}
