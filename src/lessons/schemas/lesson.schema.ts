import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Unit } from '../../units/schemas/unit.schema.js';

@Schema({ timestamps: true })
export class Lesson extends Document {
    @Prop({ required: true, trim: true })
    nameAr: string;

    @Prop({ required: true, trim: true })
    nameEn: string;

    @Prop({ type: Number, required: true, min: 1 })
    days: number;

    // Many-to-One reference to Unit (a single Unit can have many Lessons)
    @Prop({
        type: Types.ObjectId,
        ref: Unit.name,
        required: true,
        index: true,
    })
    unitId: Types.ObjectId;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

// Optimize querying lessons belonging to a specific unit in chronological order
LessonSchema.index({ unitId: 1, createdAt: 1 });