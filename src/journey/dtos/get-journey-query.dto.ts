import { IsBooleanString, IsOptional } from 'class-validator';

export class GetJourneyQueryDto {
    @IsOptional()
    @IsBooleanString()
    onlyAvailable?: string;
}
