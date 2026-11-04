import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SupportRequest } from '../schemas/support-request.schema.js';
import { SupportStatus } from '../enums/support.enum.js';
import { Model, Types } from 'mongoose';
import { CreateSupportRequestDto } from '../dtos/create-support-request.dto.js';
import { AppLanguage } from '../../common/i18n/language.decorator.js';
import { getMessages } from '../../common/i18n/messages.js';

@Injectable()
export class SupportService {
    constructor(
        @InjectModel(SupportRequest.name) private SupportRequestModel: Model<SupportRequest>,
    ) { }

    async createSupportRequest(
        createSupportRequestDto: CreateSupportRequestDto,
        userId: string | Types.ObjectId,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);

        // 1. Verify user identity is present
        if (!userId) {
            throw new UnauthorizedException(msg.supportAuthRequired);
        }

        // 2. Validate MongoDB ObjectId format
        let userObjectId: Types.ObjectId;
        try {
            userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
        } catch {
            throw new BadRequestException(msg.supportInvalidUserId);
        }

        const { category, message, idempotencyKey } = createSupportRequestDto;
        const normalizedKey = idempotencyKey?.trim() || undefined;

        // 3. Check for existing request if idempotency key is supplied
        if (normalizedKey) {
            const existingRequest = await this.SupportRequestModel.findOne({
                userId: userObjectId,
                idempotencyKey: normalizedKey,
            });

            if (existingRequest) {
                return this.formatResponse(existingRequest, msg.supportDuplicateRetrieved);
            }
        }

        // 4. Create and persist support request
        try {
            const newSupportRequest = await this.SupportRequestModel.create({
                userId: userObjectId,
                category,
                message: message.trim(),
                idempotencyKey: normalizedKey,
                status: SupportStatus.OPEN,
            });

            return this.formatResponse(newSupportRequest, msg.supportSubmittedSuccess);
        } catch (error: any) {
            // Handle concurrent duplicate submission (MongoDB E11000 duplicate key error)
            if (error?.code === 11000 && normalizedKey) {
                const existingRequest = await this.SupportRequestModel.findOne({
                    userId: userObjectId,
                    idempotencyKey: normalizedKey,
                });

                if (existingRequest) {
                    return this.formatResponse(existingRequest, msg.supportDuplicateRetrieved);
                }

                throw new ConflictException(msg.supportDuplicateDetected);
            }

            // Handle Mongoose schema validation errors
            if (error?.name === 'ValidationError') {
                throw new BadRequestException(msg.supportInvalidPayload);
            }

            // Safe fallback without exposing internal DB details
            throw new InternalServerErrorException(msg.supportSaveFailed);
        }
    }

    private formatResponse(request: SupportRequest, message: string) {
        return {
            message,
            reference: request._id.toString(),
            data: {
                id: request._id.toString(),
                userId: request.userId.toString(),
                category: request.category,
                message: request.message,
                status: request.status,
                createdAt: (request as any).createdAt,
            },
        };
    }
}