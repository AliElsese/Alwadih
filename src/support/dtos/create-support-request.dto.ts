import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { SupportCategory } from "../enums/support.enum.js";
import { SUPPORT_MESSAGE_MAX_LENGTH, SUPPORT_MESSAGE_MIN_LENGTH } from "../schemas/support-request.schema.js";

export class CreateSupportRequestDto {
    @IsEnum(SupportCategory, {
        message: 'Category must be one of: suggestion, technical_issue, note.',
    })
    @IsNotEmpty({ message: 'Category is required.' })
    category: SupportCategory;

    @IsString({ message: 'Message must be a string.' })
    @IsNotEmpty({ message: 'Message cannot be empty.' })
    @MinLength(SUPPORT_MESSAGE_MIN_LENGTH, {
        message: `Message must be at least ${SUPPORT_MESSAGE_MIN_LENGTH} characters long.`,
    })
    @MaxLength(SUPPORT_MESSAGE_MAX_LENGTH, {
        message: `Message cannot exceed ${SUPPORT_MESSAGE_MAX_LENGTH} characters.`,
    })
    message: string;

    @IsOptional()
    @IsString({ message: 'Idempotency key must be a string.' })
    idempotencyKey?: string;
}
