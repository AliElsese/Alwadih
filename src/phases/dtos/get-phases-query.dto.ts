import { IsMongoId, IsOptional } from 'class-validator';

export class GetPhasesQueryDto {
    @IsOptional()
    @IsMongoId({ message: 'Day ID must be a valid MongoDB ObjectId.' })
    dayId?: string;
}
