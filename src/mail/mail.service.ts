import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private transporter: Transporter;

    constructor(private readonly configService: ConfigService) {
        const user = this.configService.get<string>('mail.user') || this.configService.get<string>('EMAIL_USER');
        const pass = this.configService.get<string>('mail.pass') || this.configService.get<string>('EMAIL_PASS');
        const host = this.configService.get<string>('mail.host') || this.configService.get<string>('EMAIL_HOST') || 'smtp.gmail.com';
        const port = Number(this.configService.get<number>('mail.port') || this.configService.get<number>('EMAIL_PORT') || 587);

        const isGmail = host.toLowerCase().includes('gmail');

        this.transporter = nodemailer.createTransport(
            isGmail
                ? {
                    service: 'gmail',
                    auth: user && pass ? { user, pass } : undefined,
                }
                : {
                    host,
                    port,
                    secure: port === 465,
                    auth: user && pass ? { user, pass } : undefined,
                }
        );
    }

    async sendOtpEmail(to: string, otp: string): Promise<void> {
        const user = this.configService.get<string>('mail.user') || this.configService.get<string>('EMAIL_USER');
        const from = this.configService.get<string>('mail.from') || this.configService.get<string>('EMAIL_FROM') || '"Alwadih" <info.alwadih@gmail.com>';

        // If credentials are not yet set in .env, log the OTP for easy local testing
        if (!user) {
            this.logger.warn(`EMAIL_USER is not set in .env. Here is the Registration OTP for ${to}: [ ${otp} ]`);
            return;
        }

        try {
            await this.transporter.sendMail({
                from,
                to,
                subject: 'Your Verification Code (OTP)',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <h2 style="color: #1a202c; text-align: center; margin-bottom: 8px;">Account Verification</h2>
                        <p style="color: #4a5568; font-size: 15px;">Hello,</p>
                        <p style="color: #4a5568; font-size: 15px;">Thank you for registering. Use the OTP code below to verify your account:</p>
                        <div style="text-align: center; margin: 28px 0;">
                            <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; background-color: #eff6ff; padding: 12px 24px; border-radius: 8px; border: 1px dashed #93c5fd;">
                                ${otp}
                            </span>
                        </div>
                        <p style="color: #718096; font-size: 13px; text-align: center;">This code will expire in <strong>10 minutes</strong>. If you did not register, please ignore this email.</p>
                    </div>
                `,
            });
            this.logger.log(`OTP successfully sent to ${to}`);
        } catch (error) {
            this.logger.error(`Failed to send OTP email to ${to}:`, error);
        }
    }

    async sendPasswordResetOtpEmail(to: string, otp: string): Promise<void> {
        const user = this.configService.get<string>('mail.user') || this.configService.get<string>('EMAIL_USER');
        const from = this.configService.get<string>('mail.from') || this.configService.get<string>('EMAIL_FROM') || '"Alwadih" <info.alwadih@gmail.com>';

        // If credentials are not yet set in .env, log the OTP for easy local testing
        if (!user) {
            this.logger.warn(`EMAIL_USER is not set in .env. Here is the Password Reset OTP for ${to}: [ ${otp} ]`);
            return;
        }

        try {
            await this.transporter.sendMail({
                from,
                to,
                subject: 'Password Reset Verification Code (OTP)',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #fee2e2; border-radius: 8px;">
                        <h2 style="color: #dc2626; text-align: center; margin-bottom: 8px;">Password Reset Request</h2>
                        <p style="color: #4a5568; font-size: 15px;">Hello,</p>
                        <p style="color: #4a5568; font-size: 15px;">We received a request to reset your password. Use the OTP code below to proceed:</p>
                        <div style="text-align: center; margin: 28px 0;">
                            <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #dc2626; background-color: #fef2f2; padding: 12px 24px; border-radius: 8px; border: 1px dashed #fca5a5;">
                                ${otp}
                            </span>
                        </div>
                        <p style="color: #718096; font-size: 13px; text-align: center;">This code will expire in <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email or secure your account.</p>
                    </div>
                `,
            });
            this.logger.log(`Password reset OTP successfully sent to ${to}`);
        } catch (error) {
            this.logger.error(`Failed to send password reset OTP to ${to}:`, error);
        }
    }
}
