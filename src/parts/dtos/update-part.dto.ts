import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdatePartDto {
    @IsOptional()
    @IsString({ message: 'Arabic part name must be a valid string.' })
    @IsNotEmpty({ message: 'Arabic part name cannot be empty.' })
    partNameAr?: string;

    @IsOptional()
    @IsString({ message: 'English part name must be a valid string.' })
    @IsNotEmpty({ message: 'English part name cannot be empty.' })
    partNameEn?: string;
}

