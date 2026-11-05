import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema.js';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { LoginDto } from '../dtos/login.dto.js';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../../mail/mail.service.js';
import { VerifyOtpDto } from '../dtos/verify-otp.dto.js';
import { ResendOtpDto } from '../dtos/resend-otp.dto.js';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto.js';
import { VerifyResetOtpDto } from '../dtos/verify-reset-otp.dto.js';
import { ResetPasswordDto } from '../dtos/reset-password.dto.js';
import { AppLanguage } from '../../common/i18n/language.decorator.js';
import { getMessages } from '../../common/i18n/messages.js';
import { UserRole } from '../enums/auth.enum.js';

@Injectable()
export class AdminAuthService {
    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
        private jwtService: JwtService,
        private mailService: MailService,
    ) { }

    // --- ADMIN LOGIN (STEP 1: CREDENTIALS & 2FA OTP) ---

    async login(loginData: LoginDto, lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN) {
        const msg = getMessages(lang);
        const { email, password } = loginData;

        const user = await this.UserModel.findOne({ email });
        if (!user) {
            throw new UnauthorizedException(msg.invalidCredentials);
        }

        // Only administrators can log in through the admin portal
        if (user.role !== UserRole.ADMIN) {
            throw new UnauthorizedException(msg.adminAccessDenied);
        }

        if (!user.password) {
            throw new UnauthorizedException(msg.invalidCredentials);
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new UnauthorizedException(msg.invalidCredentials);
        }

        if (!user.isVerified) {
            throw new UnauthorizedException(msg.accountNotVerified);
        }

        // Generate 4-digit OTP & 10 minutes expiry
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.otp = otp;
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        // Send OTP via email to admin
        await this.mailService.sendAdminLoginOtpEmail(email, otp, lang);

        return {
            message: msg.adminLoginOtpSent,
            requiresOtp: true,
            email: user.email,
        };
    }

    // --- ADMIN 2FA LOGIN VERIFICATION (STEP 2: VERIFY OTP & ISSUE TOKEN) ---

    async verifyOtp(verifyOtpData: VerifyOtpDto, lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN) {
        const msg = getMessages(lang);
        const { email, otp } = verifyOtpData;

        const user = await this.UserModel.findOne({ email });
        if (!user || user.role !== UserRole.ADMIN) {
            throw new NotFoundException(msg.accountNotFound);
        }

        if (!user.otp || user.otp !== otp) {
            throw new BadRequestException(msg.invalidOtp);
        }

        if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
            throw new BadRequestException(msg.otpExpired);
        }

        // Clear 2FA OTP after successful login
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();

        const token = await this.generateUserToken(user._id, user.role);

        return {
            message: msg.loginSuccess,
            token: token.accessToken,
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                isVerified: user.isVerified,
            },
        };
    }

    // --- RESEND ADMIN LOGIN 2FA OTP ---

    async resendOtp(resendOtpData: ResendOtpDto, lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN) {
        const msg = getMessages(lang);
        const { email } = resendOtpData;

        const user = await this.UserModel.findOne({ email });
        if (!user || user.role !== UserRole.ADMIN) {
            throw new NotFoundException(msg.accountNotFound);
        }

        // Generate fresh 4-digit OTP & 10 minutes expiry
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.otp = otp;
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await this.mailService.sendAdminLoginOtpEmail(email, otp, lang);

        return {
            message: msg.otpResentSuccess,
        };
    }

    // --- ADMIN PASSWORD RESET FLOW ---

    async forgotPassword(forgotPasswordData: ForgotPasswordDto, lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN) {
        const msg = getMessages(lang);
        const { email } = forgotPasswordData;

        const user = await this.UserModel.findOne({ email });
        if (!user || user.role !== UserRole.ADMIN) {
            throw new NotFoundException(msg.emailNotFound);
        }

        const resetOtp = Math.floor(1000 + Math.random() * 9000).toString();
        user.resetOtp = resetOtp;
        user.resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        user.resetToken = undefined;
        user.resetTokenExpiresAt = undefined;
        await user.save();

        await this.mailService.sendPasswordResetOtpEmail(email, resetOtp, lang);

        return {
            message: msg.forgotPasswordOtpSent,
        };
    }

    async resendResetOtp(resendResetOtpData: ResendOtpDto, lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN) {
        const msg = getMessages(lang);
        const { email } = resendResetOtpData;

        const user = await this.UserModel.findOne({ email });
        if (!user || user.role !== UserRole.ADMIN) {
            throw new NotFoundException(msg.emailNotFound);
        }

        const resetOtp = Math.floor(1000 + Math.random() * 9000).toString();
        user.resetOtp = resetOtp;
        user.resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await this.mailService.sendPasswordResetOtpEmail(email, resetOtp, lang);

        return {
            message: msg.resetOtpResent,
        };
    }

    async verifyResetOtp(verifyResetOtpData: VerifyResetOtpDto, lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN) {
        const msg = getMessages(lang);
        const { email, otp } = verifyResetOtpData;

        const user = await this.UserModel.findOne({ email });
        if (!user || user.role !== UserRole.ADMIN) {
            throw new NotFoundException(msg.emailNotFound);
        }

        if (!user.resetOtp || user.resetOtp !== otp) {
            throw new BadRequestException(msg.invalidOtp);
        }

        if (user.resetOtpExpiresAt && user.resetOtpExpiresAt < new Date()) {
            throw new BadRequestException(msg.otpExpired);
        }

        const resetToken = randomBytes(32).toString('hex');
        const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

        user.resetToken = resetToken;
        user.resetTokenExpiresAt = resetTokenExpiresAt;
        user.resetOtp = undefined;
        user.resetOtpExpiresAt = undefined;
        await user.save();

        return {
            message: msg.resetOtpVerified,
            resetToken,
        };
    }

    async resetPassword(resetPasswordData: ResetPasswordDto, lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN) {
        const msg = getMessages(lang);
        const { email, newPassword, resetToken } = resetPasswordData;

        const user = await this.UserModel.findOne({ email });
        if (!user || user.role !== UserRole.ADMIN) {
            throw new NotFoundException(msg.emailNotFound);
        }

        if (!user.resetToken || !user.resetTokenExpiresAt) {
            throw new BadRequestException(msg.resetSessionExpired);
        }

        if (user.resetTokenExpiresAt < new Date()) {
            throw new BadRequestException(msg.resetSessionExpired);
        }

        if (resetToken && user.resetToken !== resetToken) {
            throw new BadRequestException(msg.invalidResetToken);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiresAt = undefined;
        user.resetOtp = undefined;
        user.resetOtpExpiresAt = undefined;
        await user.save();

        return {
            message: msg.passwordResetSuccess,
        };
    }

    async generateUserToken(userId: any, role: UserRole = UserRole.ADMIN) {
        const accessToken = role === UserRole.USER
            ? this.jwtService.sign({ userId, role }, { expiresIn: '1d' })
            : this.jwtService.sign({ userId, role }, { expiresIn: '30m' });

        return {
            accessToken,
        };
    }
}
