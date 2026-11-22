import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Phase } from '../../phases/schemas/phase.schema.js';
import { StepLayoutType } from '../enums/step.enum.js';

@Schema({ timestamps: true })
export class Step extends Document {
    @Prop({ required: true, trim: true })
    descriptionAr: string;

    @Prop({ required: true, trim: true })
    descriptionEn: string;

    @Prop({ required: true, trim: true })
    type: string;

    @Prop({
        type: String,
        enum: Object.values(StepLayoutType),
        required: true,
    })
    layoutType: StepLayoutType;

    // محتاج تكون ب validate على ال layouttypes
    // confirm before create layout with data
    @Prop({ type: SchemaTypes.Mixed, required: true })
    data: Record<string, unknown>;

    // Many-to-One reference to Phase (a single Phase can have many Steps)
    @Prop({
        type: Types.ObjectId,
        ref: Phase.name,
        required: true,
        index: true,
    })
    phaseId: Types.ObjectId;
}

export const StepSchema = SchemaFactory.createForClass(Step);

// Optimize querying steps belonging to a specific phase in chronological order
StepSchema.index({ phaseId: 1, createdAt: 1 });
