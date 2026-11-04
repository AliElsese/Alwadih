import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../auth/schemas/user.schema.js';
import { SupportCategory, SupportStatus } from '../enums/support.enum.js';

export const SUPPORT_MESSAGE_MIN_LENGTH = 10;
export const SUPPORT_MESSAGE_MAX_LENGTH = 3000;

@Schema({ timestamps: true })
export class SupportRequest extends Document {
    // Reference to User
    @Prop({
        type: Types.ObjectId,
        ref: User.name,
        required: true,
        index: true,
    })
    userId: Types.ObjectId;

    // Category: suggestion | technical_issue | note
    @Prop({
        type: String,
        required: true,
        enum: Object.values(SupportCategory),
        index: true,
    })
    category: SupportCategory;

    // Message with min and max length limits (supports Arabic Unicode natively)
    @Prop({
        type: String,
        required: true,
        minlength: SUPPORT_MESSAGE_MIN_LENGTH,
        maxlength: SUPPORT_MESSAGE_MAX_LENGTH,
        trim: true,
    })
    message: string;

    // Optional idempotency key to prevent duplicate messages
    @Prop({
        type: String,
        required: false,
        trim: true,
    })
    idempotencyKey?: string;

    // Support ticket lifecycle status
    @Prop({
        type: String,
        enum: Object.values(SupportStatus),
        default: SupportStatus.OPEN,
        index: true,
    })
    status: SupportStatus;
}

export const SupportRequestSchema = SchemaFactory.createForClass(SupportRequest);

// Compound partial unique index for idempotency:
// Guarantees that a user cannot submit duplicate requests with the same idempotency key
SupportRequestSchema.index(
    { userId: 1, idempotencyKey: 1 },
    {
        unique: true,
        partialFilterExpression: {
            idempotencyKey: { $exists: true, $type: 'string' },
        },
    },
);

// Query optimization index for user requests history
SupportRequestSchema.index({ userId: 1, createdAt: -1 });
