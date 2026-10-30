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

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // POST Signup
    @Post('signup')
    async signup(@Body() signupData: SignupDto) {
        return this.authService.signup(signupData);
    }

    // POST Verify Account OTP
    @Post('verify-otp')
    async verifyOtp(@Body() verifyOtpData: VerifyOtpDto) {
        return this.authService.verifyOtp(verifyOtpData);
    }

    // POST Resend Account OTP
    @Post('resend-otp')
    async resendOtp(@Body() resendOtpData: ResendOtpDto) {
        return this.authService.resendOtp(resendOtpData);
    }

    // POST Google Register or Login
    @Post('google')
    async googleAuth(@Body() googleAuthData: GoogleAuthDto) {
        return this.authService.googleAuth(googleAuthData);
    }

    // POST Forgot Password (Step 1: Check email and send OTP)
    @Post('forgot-password')
    async forgotPassword(@Body() forgotPasswordData: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordData);
    }

    // POST Resend Reset Password OTP
    @Post('resend-reset-otp')
    async resendResetOtp(@Body() resendResetOtpData: ResendOtpDto) {
        return this.authService.resendResetOtp(resendResetOtpData);
    }

    // POST Verify Reset OTP (Step 2: Verify OTP)
    @Post('verify-reset-otp')
    async verifyResetOtp(@Body() verifyResetOtpData: VerifyResetOtpDto) {
        return this.authService.verifyResetOtp(verifyResetOtpData);
    }

    // POST Reset Password (Step 3: Change password)
    @Post('reset-password')
    async resetPassword(@Body() resetPasswordData: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordData);
    }

    // POST Login
    @Post('login')
    async login(@Body() loginData: LoginDto) {
        return this.authService.login(loginData);
    }
}
