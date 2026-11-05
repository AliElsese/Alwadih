import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AppLanguage } from '../../common/i18n/language.decorator.js';
import { ContentStatus } from '../enums/content.enum.js';

@Schema({ _id: false })
export class PolicyLink {
    @Prop({ required: true, trim: true })
    label: string;

    @Prop({ required: true, trim: true })
    url: string;
}

export const PolicyLinkSchema = SchemaFactory.createForClass(PolicyLink);

@Schema({ _id: false })
export class PolicySection {
    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ required: true, trim: true })
    content: string;

    @Prop({ type: [PolicyLinkSchema], default: [] })
    links: PolicyLink[];
}

export const PolicySectionSchema = SchemaFactory.createForClass(PolicySection);

@Schema({ timestamps: true })
export class PrivacyPolicy extends Document {
    // Stable identifier
    @Prop({ required: true, default: 'privacy-policy', index: true, trim: true })
    policyId: string;

    // Supported locale (ar | en)
    @Prop({
        type: String,
        enum: Object.values(AppLanguage),
        required: true,
        index: true,
    })
    locale: AppLanguage;

    // Policy semantic version (e.g., '1.0.0', '2026.1')
    @Prop({ required: true, trim: true })
    version: string;

    // Date on which this version becomes effective
    @Prop({ required: true, type: Date })
    effectiveDate: Date;

    // Localized policy title
    @Prop({ required: true, trim: true })
    title: string;

    // Optional introductory summary
    @Prop({ required: false, trim: true })
    summary?: string;

    // Structured sections
    @Prop({ type: [PolicySectionSchema], default: [] })
    sections: PolicySection[];

    // Publication status (draft | published | archived)
    @Prop({
        type: String,
        enum: Object.values(ContentStatus),
        default: ContentStatus.PUBLISHED,
        index: true,
    })
    status: ContentStatus;
}

export const PrivacyPolicySchema = SchemaFactory.createForClass(PrivacyPolicy);

// Compound index for querying published policy per locale with version and effectiveDate
PrivacyPolicySchema.index({ locale: 1, status: 1, effectiveDate: -1 });
PrivacyPolicySchema.index({ policyId: 1, locale: 1, version: 1 }, { unique: true });

