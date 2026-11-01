import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from '../dtos/signup.dto.js';
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
import { GoogleAuthDto } from '../dtos/google-auth.dto.js';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { AppLanguage } from '../../common/i18n/language.decorator.js';
import { getMessages } from '../../common/i18n/messages.js';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
        private jwtService: JwtService,
        private mailService: MailService,
        private configService: ConfigService,
    ) { }

    // --- REGISTRATION & ACCOUNT VERIFICATION ---

    async signup(signupData: SignupDto, lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN) {
        const msg = getMessages(lang);
        const { name, email, password } = signupData;

        const emailInUse = await this.UserModel.findOne({ email });
        if (emailInUse) {
            throw new BadRequestException(msg.accountAlreadyExists);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate 4-digit OTP code & 10 minutes expiry
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await this.UserModel.create({
            name,
            email,
            password: hashedPassword,
            otp,
            otpExpiresAt,
            isVerified: false,
        });

        // Send OTP via email
        await this.mailService.sendOtpEmail(email, otp, lang);

        return {
            message: msg.accountRegisteredSuccess
        };
    }

    async verifyOtp(verifyOtpData: VerifyOtpDto, lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN) {
        const msg = getMessages(lang);
        const { email, otp } = verifyOtpData;

        const user = await this.UserModel.findOne({ email });
        if (!user) {
            throw new NotFoundException(msg.accountNotFound);
        }

        if (user.isVerified) {
            return {
                message: msg.accountAlreadyVerified
            };
        }

        if (!user.otp || user.otp !== otp) {
            throw new BadRequestException(msg.invalidOtp);
        }

        if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
            throw new BadRequestException(msg.otpExpired);
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();

        return {
            message: msg.accountVerifiedSuccess
        };
    }

    async resendOtp(resendOtpData: ResendOtpDto, lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN) {
        const msg = getMessages(lang);
        const { email } = resendOtpData;

        const user = await this.UserModel.findOne({ email });
        if (!user) {
            throw new NotFoundException(msg.accountNotFound);
        }

        if (user.isVerified) {
            return {
                message: msg.accountAlreadyVerified
            };
        }

        // Generate 4-digit OTP code & 10 minutes expiry
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.otp = otp;
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await this.mailService.sendOtpEmail(email, otp, lang);

        return {
            message: msg.otpResentSuccess
        };
    }

    // --- GOOGLE AUTHENTICATION (REGISTER / LOGIN) ---

    private async verifyGoogleToken(token: string, lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN): Promise<{
        email: string;
        name: string;
        googleId: string;
        avatar?: string;
    }> {
        const msg = getMessages(lang);
        const clientId = this.configService.get<string>('google.clientId') || process.env.GOOGLE_CLIENT_ID;
        const client = new OAuth2Client(clientId || undefined);

        // 1. Verify as Google ID token using google-auth-library
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: clientId ? clientId : undefined,
            });
            const payload = ticket.getPayload();
            if (payload && payload.email) {
                return {
                    email: payload.email,
                    name: payload.name || payload.email.split('@')[0],
                    googleId: payload.sub,
                    avatar: payload.picture,
                };
            }
        } catch {
            // Not an ID token or audience mismatch; try userinfo / tokeninfo below
        }

        // 2. Verify as OAuth2 Access Token via Google userinfo endpoint
        try {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = (await res.json()) as { sub: string; email: string; name?: string; picture?: string };
                if (data && data.email) {
                    return {
                        email: data.email,
                        name: data.name || data.email.split('@')[0],
                        googleId: data.sub,
                        avatar: data.picture,
                    };
                }
            }
        } catch {
            // Access token verification failed
        }

        // 3. Fallback: Google tokeninfo endpoint
        try {
            const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
            if (res.ok) {
                const data = (await res.json()) as { sub: string; email: string; name?: string; picture?: string };
                if (data && data.email) {
                    return {
                        email: data.email,
                        name: data.name || data.email.split('@')[0],
                        googleId: data.sub,
                        avatar: data.picture,
                    };
                }
            }
        } catch {
            // tokeninfo endpoint failed
        }

        throw new UnauthorizedException(msg.googleAuthFailed);
    }

    async googleAuth(googleAuthData: GoogleAuthDto, lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN) {
        const msg = getMessages(lang);
        const token = googleAuthData.token || googleAuthData.idToken || googleAuthData.credential;
        if (!token) {
            throw new BadRequestException(msg.googleTokenRequired);
        }

        const { email, name, googleId, avatar } = await this.verifyGoogleToken(token, lang);

        let user = await this.UserModel.findOne({ email });

        if (!user) {
            // Register new user via Google
            user = await this.UserModel.create({
                name,
                email,
                googleId,
                avatar,
                isVerified: true, // Google accounts are pre-verified
            });
        } else {
            // Login existing user & link Google account details if missing
            let modified = false;
            if (!user.googleId) {
                user.googleId = googleId;
                modified = true;
            }
            if (avatar && !user.avatar) {
                user.avatar = avatar;
                modified = true;
            }
            if (!user.isVerified) {
                user.isVerified = true;
                modified = true;
            }
            if (modified) {
                await user.save();
            }
        }

        const jwt = await this.generateUserToken(user._id);

        return {
            message: msg.googleAuthSuccess,
            token: jwt.accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                isVerified: user.isVerified,
            }
        };
    }

    // --- FORGOT PASSWORD FLOW ---

    // Step 1: Send OTP for password reset
    async forgotPassword(forgotPasswordData: ForgotPasswordDto, lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN) {
        const msg = getMessages(lang);
        const { email } = forgotPasswordData;

        const user = await this.UserModel.findOne({ email });
        if (!user) {
            throw new NotFoundException(msg.emailNotFound);
        }

        // Generate 4-digit OTP code & 10 minutes expiry
        const resetOtp = Math.floor(1000 + Math.random() * 9000).toString();
        user.resetOtp = resetOtp;
        user.resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Clear any previous reset session
        user.resetToken = undefined;
        user.resetTokenExpiresAt = undefined;
        await user.save();

        // Send Password Reset OTP Email
        await this.mailService.sendPasswordResetOtpEmail(email, resetOtp, lang);

        return {
            message: msg.forgotPasswordOtpSent
        };
    }

    // Resend Reset Password OTP
    async resendResetOtp(resendResetOtpData: ResendOtpDto, lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN) {
        const msg = getMessages(lang);
        const { email } = resendResetOtpData;

        const user = await this.UserModel.findOne({ email });
        if (!user) {
            throw new NotFoundException(msg.emailNotFound);
        }

        // Generate a new 4-digit OTP code & 10 minutes expiry
        const resetOtp = Math.floor(1000 + Math.random() * 9000).toString();
        user.resetOtp = resetOtp;
        user.resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Clear any previous reset session
        user.resetToken = undefined;
        user.resetTokenExpiresAt = undefined;
        await user.save();

        // Send Password Reset OTP Email
        await this.mailService.sendPasswordResetOtpEmail(email, resetOtp, lang);

        return {
            message: msg.resetOtpResent
        };
    }

    // Step 2: Verify reset OTP and generate a temporary reset token
    async verifyResetOtp(verifyResetOtpData: VerifyResetOtpDto, lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN) {
        const msg = getMessages(lang);
        const { email, otp } = verifyResetOtpData;

        const user = await this.UserModel.findOne({ email });
        if (!user) {
            throw new NotFoundException(msg.emailNotFound);
        }

        if (!user.resetOtp || user.resetOtp !== otp) {
            throw new BadRequestException(msg.invalidOtp);
        }

        if (user.resetOtpExpiresAt && user.resetOtpExpiresAt < new Date()) {
            throw new BadRequestException(msg.otpExpired);
        }

        // Generate a 15-minute reset session token
        const resetToken = randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Clear OTP once verified
        user.resetOtp = undefined;
        user.resetOtpExpiresAt = undefined;
        await user.save();

        return {
            message: msg.resetOtpVerified,
            resetToken
        };
    }

    // Step 3: Change password
    async resetPassword(resetPasswordData: ResetPasswordDto, lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN) {
        const msg = getMessages(lang);
        const { email, newPassword, resetToken } = resetPasswordData;

        const user = await this.UserModel.findOne({ email });
        if (!user) {
            throw new NotFoundException(msg.emailNotFound);
        }

        // Validate that user went through step 2 (OTP verification)
        if (!user.resetToken || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
            throw new BadRequestException(msg.resetSessionExpired);
        }

        // If client sends the resetToken, ensure it matches
        if (resetToken && user.resetToken !== resetToken) {
            throw new BadRequestException(msg.invalidResetToken);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // Clear reset tokens
        user.resetToken = undefined;
        user.resetTokenExpiresAt = undefined;
        user.resetOtp = undefined;
        user.resetOtpExpiresAt = undefined;
        await user.save();

        return {
            message: msg.passwordResetSuccess
        };
    }

    // --- AUTHENTICATION ---

    async login(loginData: LoginDto, lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN) {
        const msg = getMessages(lang);
        const { email, password } = loginData;

        const user = await this.UserModel.findOne({ email });
        if (!user) {
            throw new UnauthorizedException(msg.invalidCredentials);
        }

        if (!user.password) {
            throw new UnauthorizedException(msg.googleAccountNotice);
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new UnauthorizedException(msg.invalidCredentials);
        }

        if (!user.isVerified) {
            throw new UnauthorizedException(msg.accountNotVerified);
        }

        const token = await this.generateUserToken(user._id);

        return {
            message: msg.loginSuccess,
            token: token.accessToken
        };
    }

    async generateUserToken(userId: any) {
        const accessToken = this.jwtService.sign({ userId }, { expiresIn: '1d' });

        return {
            accessToken
        };
    }
}
