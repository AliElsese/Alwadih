import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class SignupDto {
    @IsString({ message: 'Name must be a valid string.' })
    @IsNotEmpty({ message: 'Name is required.' })
    name: string;

    @IsEmail({}, { message: 'Please provide a valid email address.' })
    email: string;

    @IsString({ message: 'Password is required.' })
    @IsNotEmpty({ message: 'Password is required.' })
    @MinLength(10, { message: 'Password must be at least 10 characters long.' })
    @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_])/, {
        message: 'Password must contain at least one letter, one number, and one special character.',
    })
    password: string;
}
