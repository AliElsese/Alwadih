import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
    @IsEmail({}, { message: 'Please provide a valid email address.' })
    email: string;

    @IsString({ message: 'New password is required.' })
    @IsNotEmpty({ message: 'New password cannot be empty.' })
    @MinLength(6, { message: 'Password must be at least 6 characters long.' })
    newPassword: string;

    @IsString({ message: 'Reset token must be a string.' })
    @IsOptional()
    resetToken?: string;
}
