import { IsMongoId, IsOptional } from 'class-validator';

export class GetUnitsQueryDto {
    @IsOptional()
    @IsMongoId({ message: 'Part ID must be a valid MongoDB ObjectId.' })
    partId?: string;
}