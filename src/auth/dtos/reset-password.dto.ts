import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class ResetPasswordDto {
    @IsEmail({}, { message: 'Please provide a valid email address.' })
    email: string;

    @IsString({ message: 'New password is required.' })
    @IsNotEmpty({ message: 'New password cannot be empty.' })
    @MinLength(10, { message: 'Password must be at least 10 characters long.' })
    @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_])/, {
        message: 'Password must contain at least one letter, one number, and one special character.',
    })
    newPassword: string;

    @IsString({ message: 'Reset token must be a string.' })
    @IsOptional()
    resetToken?: string;
}
