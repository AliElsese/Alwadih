import { IsMongoId, IsOptional } from 'class-validator';

export class GetStepsQueryDto {
    @IsOptional()
    @IsMongoId({ message: 'Phase ID must be a valid MongoDB ObjectId.' })
    phaseId?: string;
}
