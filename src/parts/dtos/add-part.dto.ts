import { IsNotEmpty, IsString } from "class-validator";

export class AddPartDto {
    @IsString({ message: 'Part name must be a valid string.' })
    @IsNotEmpty({ message: 'Part name is required.' })
    partNameAr: string;

    @IsString({ message: 'Part name must be a valid string.' })
    @IsNotEmpty({ message: 'Part name is required.' })
    partNameEn: string;
}