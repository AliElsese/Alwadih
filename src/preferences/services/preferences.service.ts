import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Preference } from '../schemas/preferences.schema.js';
import { Model } from 'mongoose';
import { UpdatePreferencesDto } from '../dtos/update-preferences.dto.js';
import { AppLanguage } from '../../common/i18n/language.decorator.js';
import { getMessages } from '../../common/i18n/messages.js';

@Injectable()
export class PreferencesService {
    constructor(
        @InjectModel(Preference.name) private PreferenceModel: Model<Preference>,
    ) { }

    async getPreferences(
        userId: string,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);

        // Find existing preferences or create defaults on the fly
        let preferences = await this.PreferenceModel.findOne({ userId });
        if (!preferences) {
            preferences = await this.PreferenceModel.create({ userId });
        }

        return {
            message: msg.preferencesRetrievedSuccess,
            preferences: this.formatPreferences(preferences),
        };
    }

    async updatePreferences(
        userId: string,
        updatePreferencesDto: UpdatePreferencesDto,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);

        const updated = await this.PreferenceModel.findOneAndUpdate(
            { userId },
            { $set: updatePreferencesDto },
            { new: true, upsert: true, setDefaultsOnInsert: true },
        );

        return {
            message: msg.preferencesUpdatedSuccess,
            preferences: this.formatPreferences(updated!),
        };
    }

    /**
     * Formats sanitized preferences object.
     */
    private formatPreferences(preference: Preference) {
        return {
            id: preference._id.toString(),
            userId: preference.userId.toString(),
            fontSize: preference.fontSize,
            appearance: preference.appearance,
            language: preference.language,
            sound: preference.sound,
            haptics: preference.haptics,
            createdAt: (preference as any).createdAt,
            updatedAt: (preference as any).updatedAt,
        };
    }
}
