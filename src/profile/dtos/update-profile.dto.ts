import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString({ message: 'Name must be a valid string.' })
    @IsNotEmpty({ message: 'Name cannot be empty.' })
    name?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Please provide a valid email address.' })
    email?: string;
}