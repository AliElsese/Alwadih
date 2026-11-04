import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "../services/auth.service.js";
import { SignupDto } from "../dtos/signup.dto.js";
import { LoginDto } from "../dtos/login.dto.js";
import { VerifyOtpDto } from "../dtos/verify-otp.dto.js";
import { ResendOtpDto } from "../dtos/resend-otp.dto.js";
import { ForgotPasswordDto } from "../dtos/forgot-password.dto.js";
import { VerifyResetOtpDto } from "../dtos/verify-reset-otp.dto.js";
import { ResetPasswordDto } from "../dtos/reset-password.dto.js";
import { GoogleAuthDto } from "../dtos/google-auth.dto.js";
import { AppLanguage, Language } from "../../common/i18n/language.decorator.js";
import { Public } from "../decorators/public.decorator.js";

@Public()
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // POST Signup
    @Post('signup')
    async signup(
        @Body() signupData: SignupDto,
        @Language() lang: AppLanguage,
    ) {
        return this.authService.signup(signupData, lang);
    }

    // POST Verify Account OTP
    @Post('verify-otp')
    async verifyOtp(
        @Body() verifyOtpData: VerifyOtpDto,
        @Language() lang: AppLanguage,
    ) {
        return this.authService.verifyOtp(verifyOtpData, lang);
    }

    // POST Resend Account OTP
    @Post('resend-otp')
    async resendOtp(
        @Body() resendOtpData: ResendOtpDto,
        @Language() lang: AppLanguage,
    ) {
        return this.authService.resendOtp(resendOtpData, lang);
    }

    // POST Google Register or Login
    @Post('google')
    async googleAuth(
        @Body() googleAuthData: GoogleAuthDto,
        @Language() lang: AppLanguage,
    ) {
        return this.authService.googleAuth(googleAuthData, lang);
    }

    // POST Forgot Password (Step 1: Check email and send OTP)
    @Post('forgot-password')
    async forgotPassword(
        @Body() forgotPasswordData: ForgotPasswordDto,
        @Language() lang: AppLanguage,
    ) {
        return this.authService.forgotPassword(forgotPasswordData, lang);
    }

    // POST Resend Reset Password OTP
    @Post('resend-reset-otp')
    async resendResetOtp(
        @Body() resendResetOtpData: ResendOtpDto,
        @Language() lang: AppLanguage,
    ) {
        return this.authService.resendResetOtp(resendResetOtpData, lang);
    }

    // POST Verify Reset OTP (Step 2: Verify OTP)
    @Post('verify-reset-otp')
    async verifyResetOtp(
        @Body() verifyResetOtpData: VerifyResetOtpDto,
        @Language() lang: AppLanguage,
    ) {
        return this.authService.verifyResetOtp(verifyResetOtpData, lang);
    }

    // POST Reset Password (Step 3: Change password)
    @Post('reset-password')
    async resetPassword(
        @Body() resetPasswordData: ResetPasswordDto,
        @Language() lang: AppLanguage,
    ) {
        return this.authService.resetPassword(resetPasswordData, lang);
    }

    // POST Login
    @Post('login')
    async login(
        @Body() loginData: LoginDto,
        @Language() lang: AppLanguage,
    ) {
        return this.authService.login(loginData, lang);
    }
}
