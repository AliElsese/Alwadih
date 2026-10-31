import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service.js';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('AuthService - Authentication & Google Flow', () => {
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

  it('should throw BadRequestException if token is missing', async () => {
    await expect(authService.googleAuth({} as any)).rejects.toThrow(
      new BadRequestException('Google authentication token is required.'),
    );
  });

  it('should throw UnauthorizedException if token verification fails', async () => {
    await expect(
      authService.googleAuth({ idToken: 'invalid_dummy_token' }),
    ).rejects.toThrow(
      new UnauthorizedException(
        'Google authentication failed: token is invalid or expired.',
      ),
    );
  });

  it('should register a new user if not found in database', async () => {
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

    const result = await authService.googleAuth({
      idToken: 'valid_google_id_token',
    });

    expect(mockUserModel.create).toHaveBeenCalledWith({
      name: 'Google User',
      email: 'testuser@gmail.com',
      googleId: 'google_sub_12345',
      avatar: 'https://lh3.googleusercontent.com/avatar.jpg',
      isVerified: true,
    });
    expect(result.token).toBe('mocked.jwt.token');
    expect(result.message).toBe('Google authentication successful.');
    expect(result.user.email).toBe('testuser@gmail.com');
    expect(result.user.isVerified).toBe(true);
  });

  it('should log in an existing user and link Google ID if missing', async () => {
    vi.spyOn(authService as any, 'verifyGoogleToken').mockResolvedValue({
      email: 'existing@gmail.com',
      name: 'Existing User',
      googleId: 'google_sub_99999',
      avatar: 'https://lh3.googleusercontent.com/new_avatar.jpg',
    });

    const existingUser = {
      _id: 'user_mongo_id_2',
      name: 'Existing User',
      email: 'existing@gmail.com',
      googleId: undefined,
      avatar: undefined,
      isVerified: false,
      save: vi.fn().mockResolvedValue(true),
    };

    mockUserModel.findOne.mockResolvedValue(existingUser);

    const result = await authService.googleAuth({
      token: 'valid_google_access_token',
    });

    expect(existingUser.googleId).toBe('google_sub_99999');
    expect(existingUser.isVerified).toBe(true);
    expect(existingUser.save).toHaveBeenCalled();
    expect(result.token).toBe('mocked.jwt.token');
    expect(result.message).toBe('Google authentication successful.');
    expect(result.user.email).toBe('existing@gmail.com');
  });

  it('should reject login if user registered via Google with no password', async () => {
    mockUserModel.findOne.mockResolvedValue({
      email: 'googleuser@gmail.com',
      password: null,
      isVerified: true,
    });

    await expect(
      authService.login({
        email: 'googleuser@gmail.com',
        password: 'Password123!',
      }),
    ).rejects.toThrow(
      new UnauthorizedException(
        'This account was registered using Google. Please sign in with Google or reset your password.',
      ),
    );
  });
});

