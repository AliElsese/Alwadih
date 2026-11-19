import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Lesson } from '../../lessons/schemas/lesson.schema.js';

@Schema({ timestamps: true })
export class Day extends Document {
    @Prop({ required: true, trim: true })
    nameAr: string;

    @Prop({ required: true, trim: true })
    nameEn: string;

    @Prop({ required: true, trim: true })
    headerTextAr: string;

    @Prop({ required: true, trim: true })
    headerTextEn: string;

    @Prop({ required: true, trim: true })
    purpose: string;

    @Prop({ type: Number, required: true, min: 1 })
    expectedTime: number;

    // Many-to-One reference to Lesson (a single Lesson can have many Days)
    @Prop({
        type: Types.ObjectId,
        ref: Lesson.name,
        required: true,
        index: true,
    })
    lessonId: Types.ObjectId;
}

export const DaySchema = SchemaFactory.createForClass(Day);

// Optimize querying days belonging to a specific lesson in chronological order
DaySchema.index({ lessonId: 1, createdAt: 1 });
