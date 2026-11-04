import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../auth/schemas/user.schema.js';
import { Appearance, AppPreferenceLanguage, FontSize } from '../enums/preferences.enum.js';

@Schema({ timestamps: true })
export class Preference extends Document {
    // Reference to User (One-to-one: unique per user)
    @Prop({
        type: Types.ObjectId,
        ref: User.name,
        required: true,
        unique: true,
        index: true,
    })
    userId: Types.ObjectId;

    // Font size: [small, medium, large, extra large]
    @Prop({
        type: String,
        enum: [...Object.values(FontSize), 'extra_large'],
        default: FontSize.MEDIUM,
    })
    fontSize: FontSize;

    // Appearance mode: [system, dark, light]
    @Prop({
        type: String,
        enum: Object.values(Appearance),
        default: Appearance.SYSTEM,
    })
    appearance: Appearance;

    // Language: [ar, en]
    @Prop({
        type: String,
        enum: Object.values(AppPreferenceLanguage),
        default: AppPreferenceLanguage.AR,
    })
    language: AppPreferenceLanguage;

    // Sound effects toggle
    @Prop({
        type: Boolean,
        default: true,
    })
    sound: boolean;

    // Haptic feedback toggle
    @Prop({
        type: Boolean,
        default: true,
    })
    haptics: boolean;
}

export const PreferenceSchema = SchemaFactory.createForClass(Preference);