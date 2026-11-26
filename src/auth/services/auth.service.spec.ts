import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service.js';
import { UserRole } from '../enums/auth.enum.js';
import { Types } from 'mongoose';
import { AppLanguage } from '../../common/i18n/language.decorator.js';

describe('AuthService - Logout & Token Expiration', () => {
    let service: AuthService;
    let mockUserModel: any;
    let mockJwtService: any;
    let mockMailService: any;
    let mockConfigService: any;

    const mockUserId = new Types.ObjectId();

    beforeEach(() => {
        mockUserModel = {
            findOne: vi.fn(),
            findById: vi.fn(),
            findByIdAndUpdate: vi.fn(),
            create: vi.fn(),
        };

        mockJwtService = {
            sign: vi.fn().mockImplementation((payload: any, options: any) => {
                return `signed-token-${options.expiresIn}-${payload.tokenVersion ?? 'noversion'}`;
            }),
            verify: vi.fn(),
        };

        mockMailService = {
            sendOtpEmail: vi.fn(),
            sendPasswordResetOtpEmail: vi.fn(),
        };

        mockConfigService = {
            get: vi.fn(),
        };

        service = new AuthService(
            mockUserModel,
            mockJwtService,
            mockMailService,
            mockConfigService,
        );
    });

    it('should generate long-lived token (180d) with tokenVersion for regular users', async () => {
        const tokenResult = await service.generateUserToken(mockUserId, UserRole.USER, 2);

        expect(mockJwtService.sign).toHaveBeenCalledWith(
            { userId: mockUserId, role: UserRole.USER, tokenVersion: 2 },
            { expiresIn: '180d' },
        );
        expect(tokenResult.accessToken).toBe('signed-token-180d-2');
    });

    it('should generate short-lived token (30m) without tokenVersion for admin users', async () => {
        const tokenResult = await service.generateUserToken(mockUserId, UserRole.ADMIN);

        expect(mockJwtService.sign).toHaveBeenCalledWith(
            { userId: mockUserId, role: UserRole.ADMIN },
            { expiresIn: '30m' },
        );
        expect(tokenResult.accessToken).toBe('signed-token-30m-noversion');
    });

    it('should increment tokenVersion in database on logout', async () => {
        mockUserModel.findByIdAndUpdate.mockReturnValue({
            exec: vi.fn().mockResolvedValue({ _id: mockUserId, tokenVersion: 3 }),
        });

        const res = await service.logout(mockUserId.toString(), AppLanguage.AR);

        expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
            mockUserId.toString(),
            { $inc: { tokenVersion: 1 } },
        );
        expect(res.message).toBe('تم تسجيل الخروج بنجاح.');
    });
});
