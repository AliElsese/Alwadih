import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LetterType } from '../enums/letter.enum.js';

export type LetterDocument = Letter & Document & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class Letter {
    @Prop({ required: true, unique: true, trim: true })
    letter: string;

    @Prop({ required: true, trim: true })
    nameAr: string;

    @Prop({ required: true, trim: true })
    nameEn: string;

    @Prop({ type: String, enum: LetterType, required: false, default: null })
    type?: LetterType | null;

    @Prop({ type: String, required: false, default: null, trim: true })
    audioUrl?: string | null;

    @Prop({ required: true, default: 0 })
    order: number;
}

export const LetterSchema = SchemaFactory.createForClass(Letter);
