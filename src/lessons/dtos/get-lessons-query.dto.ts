import { IsMongoId, IsOptional } from 'class-validator';

export class GetLessonsQueryDto {
    @IsOptional()
    @IsMongoId({ message: 'Unit ID must be a valid MongoDB ObjectId.' })
    unitId?: string;
}