import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { parseLanguage } from '../../common/i18n/language.decorator.js';

describe('AuthService - Authentication & Multilingual (ar/en) Flow', () => {
  let authService: AuthService;
  let mockUserModel: any;
  let mockJwtService: any;
  let mockMailService: any;
  let mockConfigService: any;

  beforeEach(() => {
    mockUserModel = {
      findOne: vi.fn(),
      create: vi.fn(),
    };

    mockJwtService = {
      sign: vi.fn().mockReturnValue('mocked.jwt.token'),
    };

    mockMailService = {
      sendOtpEmail: vi.fn(),
      sendPasswordResetOtpEmail: vi.fn(),
    };

    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'google.clientId') {
          return '531252713444-u93h35r0afn1rocs4k164svdsnra0bh7.apps.googleusercontent.com';
        }
        return null;
      }),
    };

    authService = new AuthService(
      mockUserModel,
      mockJwtService,
      mockMailService,
      mockConfigService,
    );
  });

  describe('parseLanguage helper', () => {
    it('should parse Arabic headers properly', () => {
      expect(parseLanguage('ar')).toBe('ar');
      expect(parseLanguage('ar-EG')).toBe('ar');
      expect(parseLanguage('ar-SA,ar;q=0.9,en;q=0.8')).toBe('ar');
    });

    it('should default to English for non-Arabic headers or undefined', () => {
      expect(parseLanguage('en')).toBe('en');
      expect(parseLanguage('en-US,en;q=0.9')).toBe('en');
      expect(parseLanguage(undefined)).toBe('en');
      expect(parseLanguage('')).toBe('en');
    });
  });

  describe('Signup (Register) Flow', () => {
    it('should throw BadRequestException if user already exists and is verified', async () => {
      mockUserModel.findOne.mockResolvedValue({
        email: 'verified@example.com',
        isVerified: true,
      });

      await expect(
        authService.signup(
          { name: 'John Doe', email: 'verified@example.com', password: 'Password123!' },
          'en',
        ),
      ).rejects.toThrow(
        new BadRequestException('An account with this email address already exists.'),
      );
    });

    it('should update unverified user and send new OTP if user exists but is not verified', async () => {
      const existingUnverifiedUser = {
        name: 'Old Name',
        email: 'unverified@example.com',
        password: 'oldhashedpassword',
        isVerified: false,
        otp: '1111',
        otpExpiresAt: new Date(Date.now() - 10000),
        save: vi.fn().mockResolvedValue(true),
      };

      mockUserModel.findOne.mockResolvedValue(existingUnverifiedUser);

      const result = await authService.signup(
        { name: 'New Name', email: 'unverified@example.com', password: 'NewPassword123!' },
        'en',
      );

      expect(existingUnverifiedUser.name).toBe('New Name');
      expect(existingUnverifiedUser.save).toHaveBeenCalled();
      expect(mockMailService.sendOtpEmail).toHaveBeenCalledWith(
        'unverified@example.com',
        expect.any(String),
        'en',
      );
      expect(mockUserModel.create).not.toHaveBeenCalled();
      expect(result.message).toBe(
        'Account registered successfully. A verification code has been sent to your email.',
      );
    });

    it('should create a new user and send OTP if user does not exist', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({
        name: 'Fresh User',
        email: 'fresh@example.com',
        isVerified: false,
      });

      const result = await authService.signup(
        { name: 'Fresh User', email: 'fresh@example.com', password: 'Password123!' },
        'ar',
      );

      expect(mockUserModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Fresh User',
          email: 'fresh@example.com',
          isVerified: false,
        }),
      );
      expect(mockMailService.sendOtpEmail).toHaveBeenCalledWith(
        'fresh@example.com',
        expect.any(String),
        'ar',
      );
      expect(result.message).toBe(
        'تم تسجيل الحساب بنجاح. تم إرسال رمز التحقق إلى بريدك الإلكتروني.',
      );
    });
  });

  describe('Google Auth (English by default)', () => {
    it('should throw BadRequestException in English if token is missing', async () => {
      await expect(authService.googleAuth({} as any, 'en')).rejects.toThrow(
        new BadRequestException('Google authentication token is required.'),
      );
    });

    it('should throw UnauthorizedException in English if token verification fails', async () => {
      await expect(
        authService.googleAuth({ idToken: 'invalid_dummy_token' }, 'en'),
      ).rejects.toThrow(
        new UnauthorizedException(
          'Google authentication failed: token is invalid or expired.',
        ),
      );
    });

    it('should register a new user with English response message', async () => {
      vi.spyOn(authService as any, 'verifyGoogleToken').mockResolvedValue({
        email: 'testuser@gmail.com',
        name: 'Google User',
        googleId: 'google_sub_12345',
        avatar: 'https://lh3.googleusercontent.com/avatar.jpg',
      });

      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({
        _id: 'user_mongo_id_1',
        name: 'Google User',
        email: 'testuser@gmail.com',
        googleId: 'google_sub_12345',
        avatar: 'https://lh3.googleusercontent.com/avatar.jpg',
        isVerified: true,
      });

      const result = await authService.googleAuth(
        { idToken: 'valid_google_id_token' },
        'en',
      );

      expect(result.message).toBe('Google authentication successful.');
      expect(result.token).toBe('mocked.jwt.token');
      expect(result.user.email).toBe('testuser@gmail.com');
    });
  });

  describe('Google Auth (Arabic when Accept-Language is ar)', () => {
    it('should throw BadRequestException in Arabic if token is missing', async () => {
      await expect(authService.googleAuth({} as any, 'ar')).rejects.toThrow(
        new BadRequestException('رمز مصادقة جوجل مطلوب.'),
      );
    });

    it('should throw UnauthorizedException in Arabic if token verification fails', async () => {
      await expect(
        authService.googleAuth({ idToken: 'invalid_dummy_token' }, 'ar'),
      ).rejects.toThrow(
        new UnauthorizedException(
          'فشلت مصادقة جوجل: الرمز غير صالح أو منتهي الصلاحية.',
        ),
      );
    });

    it('should return Arabic success message when registering via Google', async () => {
      vi.spyOn(authService as any, 'verifyGoogleToken').mockResolvedValue({
        email: 'arabicuser@gmail.com',
        name: 'مستخدم جوجل',
        googleId: 'google_sub_55555',
        avatar: 'https://lh3.googleusercontent.com/avatar.jpg',
      });

      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({
        _id: 'user_mongo_id_ar',
        name: 'مستخدم جوجل',
        email: 'arabicuser@gmail.com',
        googleId: 'google_sub_55555',
        avatar: 'https://lh3.googleusercontent.com/avatar.jpg',
        isVerified: true,
      });

      const result = await authService.googleAuth(
        { idToken: 'valid_google_id_token' },
        'ar',
      );

      expect(result.message).toBe('تمت المصادقة عبر جوجل بنجاح.');
      expect(result.token).toBe('mocked.jwt.token');
    });
  });

  describe('Login & Password Reset in Arabic', () => {
    it('should reject login in Arabic if user not found or wrong credentials', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        authService.login(
          { email: 'notfound@gmail.com', password: 'Password123!' },
          'ar',
        ),
      ).rejects.toThrow(
        new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة.'),
      );
    });

    it('should inform in Arabic if account was registered with Google', async () => {
      mockUserModel.findOne.mockResolvedValue({
        email: 'googleuser@gmail.com',
        password: null,
        isVerified: true,
      });

      await expect(
        authService.login(
          { email: 'googleuser@gmail.com', password: 'Password123!' },
          'ar',
        ),
      ).rejects.toThrow(
        new UnauthorizedException(
          'تم تسجيل هذا الحساب عبر جوجل. يرجى تسجيل الدخول عبر جوجل أو طلب إعادة تعيين كلمة المرور.',
        ),
      );
    });

    it('should successfully log in and return message, token, and user with name and email only', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      mockUserModel.findOne.mockResolvedValue({
        _id: 'user_123',
        name: 'Ahmed Ali',
        email: 'ahmed@example.com',
        password: hashedPassword,
        isVerified: true,
        otp: '1234',
        otpExpiresAt: new Date(),
        resetToken: 'secret_token_value',
        resetOtp: '5678',
      });

      const result = await authService.login(
        { email: 'ahmed@example.com', password: 'Password123!' },
        'en',
      );

      expect(result.message).toBe('Login successful.');
      expect(result.token).toBe('mocked.jwt.token');
      expect(result.user).toEqual({
        name: 'Ahmed Ali',
        email: 'ahmed@example.com',
      });
      // Sensitive fields must not be leaked
      expect((result.user as any).password).toBeUndefined();
      expect((result.user as any).otp).toBeUndefined();
      expect((result.user as any).resetToken).toBeUndefined();
      expect((result.user as any).resetOtp).toBeUndefined();
    });
  });
});
