import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class SignupDto {
    @IsString({ message: 'Name must be a valid string.' })
    @IsNotEmpty({ message: 'Name is required.' })
    name: string;

    @IsEmail({}, { message: 'Please provide a valid email address.' })
    email: string;

    @IsString({ message: 'Password is required.' })
    @MinLength(6, { message: 'Password must be at least 6 characters long.' })
    password: string;
}