import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    newPassword: string;

    @IsString()
    @IsOptional()
    resetToken?: string;
}

