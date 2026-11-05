import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AppLanguage } from '../../common/i18n/language.decorator.js';
import { ContentStatus } from '../enums/content.enum.js';

@Schema({ _id: false })
export class FaqLink {
    @Prop({ required: true, trim: true })
    label: string;

    @Prop({ required: true, trim: true })
    url: string;
}

export const FaqLinkSchema = SchemaFactory.createForClass(FaqLink);

@Schema({ timestamps: true })
export class Faq extends Document {
    // Stable identifier across updates and environments (e.g., 'faq-quran-readings-01')
    @Prop({ required: true, index: true, trim: true })
    faqId: string;

    // Supported locale (ar | en)
    @Prop({
        type: String,
        enum: Object.values(AppLanguage),
        required: true,
        index: true,
    })
    locale: AppLanguage;

    // Localized question
    @Prop({ required: true, trim: true })
    question: string;

    // Localized safe structured answer
    @Prop({ required: true, trim: true })
    answer: string;

    // Safe structured reference links
    @Prop({ type: [FaqLinkSchema], default: [] })
    links: FaqLink[];

    // Sorting order for display (ascending: 0, 1, 2, ...)
    @Prop({ type: Number, default: 0, index: true })
    displayOrder: number;

    // Publication status (draft | published | archived)
    @Prop({
        type: String,
        enum: Object.values(ContentStatus),
        default: ContentStatus.PUBLISHED,
        index: true,
    })
    status: ContentStatus;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);

// Compound index to ensure fast querying of published FAQs per locale sorted by displayOrder
FaqSchema.index({ locale: 1, status: 1, displayOrder: 1 });
FaqSchema.index({ faqId: 1, locale: 1 }, { unique: true });

