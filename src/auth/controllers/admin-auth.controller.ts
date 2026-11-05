import { Body, Controller, Post } from "@nestjs/common";
import { AdminAuthService } from "../services/admin-auth.service.js";
import { LoginDto } from "../dtos/login.dto.js";
import { VerifyOtpDto } from "../dtos/verify-otp.dto.js";
import { ResendOtpDto } from "../dtos/resend-otp.dto.js";
import { ForgotPasswordDto } from "../dtos/forgot-password.dto.js";
import { VerifyResetOtpDto } from "../dtos/verify-reset-otp.dto.js";
import { ResetPasswordDto } from "../dtos/reset-password.dto.js";
import { AppLanguage, Language } from "../../common/i18n/language.decorator.js";
import { Public } from "../decorators/public.decorator.js";

@Public()
@Controller('auth/admin')
export class AdminAuthController {
    constructor(private readonly adminAuthService: AdminAuthService) { }

    // POST Login
    @Post('login')
    async login(
        @Body() loginData: LoginDto,
        @Language() lang: AppLanguage,
    ) {
        return this.adminAuthService.login(loginData, lang);
    }

    // POST Verify Account OTP
    @Post('verify-otp')
    async verifyOtp(
        @Body() verifyOtpData: VerifyOtpDto,
        @Language() lang: AppLanguage,
    ) {
        return this.adminAuthService.verifyOtp(verifyOtpData, lang);
    }

    // POST Resend Account OTP
    @Post('resend-otp')
    async resendOtp(
        @Body() resendOtpData: ResendOtpDto,
        @Language() lang: AppLanguage,
    ) {
        return this.adminAuthService.resendOtp(resendOtpData, lang);
    }

    // POST Forgot Password (Step 1: Check email and send OTP)
    @Post('forgot-password')
    async forgotPassword(
        @Body() forgotPasswordData: ForgotPasswordDto,
        @Language() lang: AppLanguage,
    ) {
        return this.adminAuthService.forgotPassword(forgotPasswordData, lang);
    }

    // POST Resend Reset Password OTP
    @Post('resend-reset-otp')
    async resendResetOtp(
        @Body() resendResetOtpData: ResendOtpDto,
        @Language() lang: AppLanguage,
    ) {
        return this.adminAuthService.resendResetOtp(resendResetOtpData, lang);
    }

    // POST Verify Reset OTP (Step 2: Verify OTP)
    @Post('verify-reset-otp')
    async verifyResetOtp(
        @Body() verifyResetOtpData: VerifyResetOtpDto,
        @Language() lang: AppLanguage,
    ) {
        return this.adminAuthService.verifyResetOtp(verifyResetOtpData, lang);
    }

    // POST Reset Password (Step 3: Change password)
    @Post('reset-password')
    async resetPassword(
        @Body() resetPasswordData: ResetPasswordDto,
        @Language() lang: AppLanguage,
    ) {
        return this.adminAuthService.resetPassword(resetPasswordData, lang);
    }
}
