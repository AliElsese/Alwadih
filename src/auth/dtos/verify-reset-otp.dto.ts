import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class VerifyResetOtpDto {
    @IsEmail({}, { message: 'Please provide a valid email address.' })
    email: string;

    @IsString({ message: 'Verification code must be a string.' })
    @IsNotEmpty({ message: 'Verification code is required.' })
    @Length(4, 4, { message: 'Verification code must be exactly 4 digits.' })
    otp: string;
}
