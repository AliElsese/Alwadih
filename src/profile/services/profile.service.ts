import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../auth/schemas/user.schema.js';
import { Model } from 'mongoose';
import { UpdateProfileDto } from '../dtos/update-profile.dto.js';
import { AppLanguage } from '../../common/i18n/language.decorator.js';
import { getMessages } from '../../common/i18n/messages.js';

@Injectable()
export class ProfileService {
    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
    ) { }

    async getProfile(
        userId: string,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);

        const user = await this.UserModel.findById(userId);
        if (!user) {
            throw new NotFoundException(msg.accountNotFound);
        }

        return {
            message: msg.profileRetrievedSuccess,
            profile: this.formatProfile(user),
        };
    }

    async updateProfile(
        userId: string,
        updateProfileDto: UpdateProfileDto,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);

        const updateData: Partial<{ name: string; email: string }> = {};

        if (updateProfileDto.name !== undefined) {
            updateData.name = updateProfileDto.name.trim();
        }

        if (updateProfileDto.email !== undefined) {
            const normalizedEmail = updateProfileDto.email.toLowerCase().trim();

            const existingEmailUser = await this.UserModel.findOne({
                email: normalizedEmail,
                _id: { $ne: userId },
            });

            if (existingEmailUser) {
                throw new BadRequestException(msg.accountAlreadyExists);
            }

            updateData.email = normalizedEmail;
        }

        const updatedUser = await this.UserModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true },
        );

        if (!updatedUser) {
            throw new NotFoundException(msg.accountNotFound);
        }

        return {
            message: msg.profileUpdatedSuccess,
            profile: this.formatProfile(updatedUser),
        };
    }

    private formatProfile(user: User) {
        return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            createdAt: (user as any).createdAt,
            updatedAt: (user as any).updatedAt,
        };
    }
}
